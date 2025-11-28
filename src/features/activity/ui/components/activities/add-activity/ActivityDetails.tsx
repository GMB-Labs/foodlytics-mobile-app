/* eslint-disable react-native/no-raw-text */
import React, { useState } from 'react';
import { View, Pressable, StyleSheet, TextInput , Dimensions} from 'react-native';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ModalHeader from '@/src/shared/ui/components/ModalHeader';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';
import useToast from '@/src/shared/hooks/useToast';
import { useSession } from '@/src/shared/hooks/useSession';
import { postJSON } from '@/src/shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';
import { ASYNC_STORAGE_KEYS } from '@/src/shared/constants/storage';

type Intensity = 'Baja' | 'Moderada' | 'Alta';
const INTENSITY_LEVELS: Intensity[] = ['Baja', 'Moderada', 'Alta'];

const INTENSITY_FACTORS: Record<Intensity, number> = {
  Baja: 0.9,
  Moderada: 1,
  Alta: 1.1,
};

function hexToRgba(hex: string, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned.length === 3 ? cleaned.split('').map(c=>c+c).join('') : cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ActivityDetails() {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const todayISO = useTodayISO();
  const toast = useToast();
  const { width } = Dimensions.get('window');
  const designW = 430;
  const scale = Math.min(1, width / designW);
  const s = (n: number) => Math.round(n * scale);
  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(s, theme);

  const activityTypeParam = (params?.type as string) || 'Correr';
  const isCustom = activityTypeParam === 'Otro' || params?.isCustom === 'true';

  // calorías por minuto con fallback seguro
  const parsedCal = Number(params?.calPerMin);
  const fallbackCalPerMin = 8; // estimado genérico
  const calPerMin =
    !Number.isNaN(parsedCal) && parsedCal > 0 ? parsedCal : fallbackCalPerMin;

  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [saving, setSaving] = useState(false);
  const [customName, setCustomName] = useState('');
  const [session] = useSession();

  const incrementDuration = () => setDuration(d => Math.min(d + 5, 120));
  const decrementDuration = () => setDuration(d => Math.max(d - 5, 5));

  const getIntensityColors = (level: Intensity) => {
    switch (level) {
      case 'Alta':
        return {
          bg: theme.activity?.intensity?.highBg ?? '#FFE5E5',
          text: theme.activity?.intensity?.highText ?? '#FC434C',
        };
      case 'Moderada':
        return {
          bg: theme.activity?.intensity?.mediumBg ?? '#FFEBD1',
          text: theme.activity?.intensity?.mediumText ?? '#FF6900',
        };
      case 'Baja':
      default:
        return {
          bg: theme.activity?.intensity?.lowBg ?? '#DFF7EC',
          text: theme.activity?.intensity?.lowText ?? '#00C950',
        };
    }
  };

  const onSave = async () => {
    if (!intensity) {
      toast.show({
        type: 'error',
        text: 'Selecciona la intensidad de tu actividad',
      });
      return;
    }

    if (isCustom && !customName.trim()) {
      toast.show({
        type: 'error',
        text: 'Escribe el nombre de tu actividad',
      });
      return;
    }

    setSaving(true);

    setTimeout(async () => {
      const factor = INTENSITY_FACTORS[intensity] ?? 1;
      const localCalories = Math.round(calPerMin * duration * factor);

      const finalType = isCustom ? customName.trim() : activityTypeParam;

      // persist activity locally so summary can read last distance session
      // declare server response variable here so it's visible after the try/catch
      let serverAiBurnResp: any = null;
      try {
        // Try to notify backend AI burn endpoint (best-effort). If it fails,
        // we still persist locally so the UX continues to work offline.
        try {
          const payload = {
            user_id: session?.sub,
            activity_type: finalType,
            duration_minutes: duration,
            intensity: intensity,
          };
          console.log('[ActivityDetails] ai-burn payload', payload);
          // Debugging: use fetch directly to capture raw response, headers and status
          try {
            const fullUrl = `${API_BASE_URL.replace(/\/$/, '')}/api/v1/physical-activity/ai-burn`;
            const headers: Record<string,string> = { 'Content-Type': 'application/json' };
            if (session?.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`;
            const bodyStr = JSON.stringify(payload);
            console.log('[ActivityDetails] ai-burn fetch start', { fullUrl, headers, body: payload });

            const res = await fetch(fullUrl, { method: 'POST', headers, body: bodyStr });
            const rawText = await res.text();
            console.log('[ActivityDetails] ai-burn raw response', { status: res.status, ok: res.ok, text: rawText });

            let parsed: any = null;
            try { parsed = rawText ? JSON.parse(rawText) : null; } catch (e) { parsed = rawText; }

            if (!res.ok) {
              const err: any = new Error(res.statusText || 'Request failed');
              err.status = res.status;
              err.body = parsed;
              throw err;
            }

            serverAiBurnResp = parsed;
            // backend accepted — show lightweight feedback
            toast.show({ type: 'success', text: 'Actividad registrada en servidor' });
            // log full server response for debugging (calories_burned etc.)
            console.log('[ActivityDetails] ai-burn response parsed', JSON.stringify(serverAiBurnResp, null, 2));
          } catch (fetchErr) {
            // If debug fetch failed, fallback to existing postJSON for consistency
            try {
              console.warn('[ActivityDetails] debug fetch failed, falling back to postJSON', fetchErr);
              serverAiBurnResp = await postJSON('/api/v1/physical-activity/ai-burn', payload, { baseUrl: API_BASE_URL, token: session?.accessToken ?? undefined });
              toast.show({ type: 'success', text: 'Actividad registrada en servidor' });
              console.log('[ActivityDetails] ai-burn response (postJSON)', JSON.stringify(serverAiBurnResp, null, 2));
            } catch (postErr2) {
              const errAny: any = postErr2;
              console.warn('[ActivityDetails] ai-burn failed, will persist locally', {
                message: errAny?.message ?? String(errAny),
                status: errAny?.status,
                body: errAny?.body,
              });
              toast.show({ type: 'info', text: 'Actividad guardada localmente (sin conexión)' });
            }
          }
        } catch (postErr) {
          // Log detailed error info to help debug why we fall back to local storage
          try {
            const errAny: any = postErr;
            console.warn('[ActivityDetails] ai-burn failed, will persist locally', {
              message: errAny?.message ?? String(errAny),
              status: errAny?.status,
              body: errAny?.body,
            });
          } catch (logErr) {
            console.warn('[ActivityDetails] ai-burn failed, (error logging failed)', postErr);
          }
          toast.show({ type: 'info', text: 'Actividad guardada localmente (sin conexión)' });
        }

        const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ACTIVITIES);
        const existing = raw ? JSON.parse(raw) : [];
        const now = new Date();

        // Prefer server-provided calories_burned when available
        const finalCalories = serverAiBurnResp && (serverAiBurnResp.calories_burned ?? serverAiBurnResp.calories) ? (serverAiBurnResp.calories_burned ?? serverAiBurnResp.calories) : localCalories;
        console.log('[ActivityDetails] using calories value', { fromServer: !!(serverAiBurnResp && serverAiBurnResp.calories_burned !== undefined), finalCalories, localCalories, serverResp: serverAiBurnResp });

        const entry: any = {
          id: `local-${Date.now()}`,
          type: finalType,
          dateISO: todayISO,
          duration: duration, // minutes
          calories: finalCalories,
          createdAt: now.toISOString(),
          startTime: now.toISOString(), // hora exacta de inicio
        };

        // If the server returned an id or other metadata, keep it to aid later sync
        if (serverAiBurnResp && serverAiBurnResp.id) {
          entry.serverId = serverAiBurnResp.id;
          entry.synced = true;
        } else if (serverAiBurnResp && serverAiBurnResp.activity_type) {
          // server responded but didn't provide id — mark synced true as best-effort
          entry.synced = true;
        }

        existing.push(entry);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      } catch (e) {
        // best-effort persistence, ignore errors
        console.warn('save activity to AsyncStorage failed', e);
      }

      setSaving(false);
      const serverCalories = serverAiBurnResp && (serverAiBurnResp.calories_burned ?? serverAiBurnResp.calories) ? String(serverAiBurnResp.calories_burned ?? serverAiBurnResp.calories) : undefined;
      const caloriesToShow = serverCalories ?? String(localCalories);

      router.push({
        pathname: '/modals/add-activity/complete',
        params: {
          dateISO: todayISO,
          // when server provided calories, send calories_burned; otherwise send local estimate
          ...(serverCalories ? { calories_burned: serverCalories } : { calories: String(localCalories) }),
          duration: String(duration),
          type: finalType,
        },
      } as any);
    }, 600);
  };

  const onChangeType = () => {
    router.back();
  };

  const isSaveDisabled =
    saving || !intensity || (isCustom && !customName.trim());

  return (
    <View style={[styles.container, { backgroundColor: theme.bg ?? '#FFFFFF' }]}>
      <ModalHeader title="Registrar Actividad" />

      <View style={styles.content}>
        <LinearGradient
          colors={[hexToRgba(theme.brandA ?? '#2FCCAC', 0.1), hexToRgba(theme.brandB ?? '#24A88C', 0.05)]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientCard}
        >
          {/* Activity type card */}
          <View style={[styles.activityCard, { backgroundColor: theme.mealsCard ?? '#FFFFFF' }]}>
            <AppText style={styles.activityTitle} color={theme.text ?? '#151522'}>
              {isCustom ? 'Actividad personalizada' : activityTypeParam}
            </AppText>
            <AppText style={styles.activitySubtitle} color={theme.subtext ?? '#999999'}>
              Completa los detalles de tu actividad
            </AppText>

            {isCustom && (
              <View style={styles.customInputContainer}>
                <AppText style={styles.customInputLabel} color={theme.text ?? '#4B5563'}>Nombre de la actividad</AppText>
                <TextInput
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="Ej. Natación, baile, yoga..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.customInput}
                />
              </View>
            )}
          </View>

          {/* Duration selector */}
          <AppText style={styles.sectionLabel} color={theme.text ?? '#1A1A1A'}>Duración (minutos)</AppText>
          <View style={styles.durationSelector}>
            <Pressable style={[styles.durationButton, { backgroundColor: theme.addBtnBg ?? '#2FCCAC' }]} onPress={decrementDuration}>
              <AppText style={styles.durationButtonText}>{'−'}</AppText>
            </Pressable>
            <View style={styles.durationDisplay}>
              <AppText style={styles.durationNumber} color={theme.text ?? '#1A1A1A'}>{duration}</AppText>
              <AppText style={styles.durationLabel} color={theme.subtext ?? '#6B7280'}>minutos</AppText>
            </View>
            <Pressable style={[styles.durationButton, { backgroundColor: theme.addBtnBg ?? '#2FCCAC' }]} onPress={incrementDuration}>
              <AppText style={styles.durationButtonText}>{'+'}</AppText>
            </Pressable>
          </View>

          {/* Intensity selector */}
          <AppText style={styles.sectionLabel} color={theme.text ?? '#1A1A1A'}>Intensidad</AppText>
          <View style={styles.intensitySelector}>
            {INTENSITY_LEVELS.map(level => {
              const selected = intensity === level;
              const colorsFor = getIntensityColors(level);
              return (
                <Pressable
                  key={level}
                  style={[
                    styles.intensityButton,
                    selected && {
                      backgroundColor: colorsFor.bg,
                      borderColor: colorsFor.bg,
                    },
                  ]}
                  onPress={() => setIntensity(level)}
                >
                  <AppText
                    style={[
                      styles.intensityButtonText,
                      selected && styles.intensityButtonTextSelected,
                    ]}
                    color={selected ? (colorsFor.text ?? '#FFFFFF') : (colorsFor.text ?? '#1A1A1A')}
                  >
                    {level}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled, { backgroundColor: theme.addBtnBg ?? '#2FCCAC' }]}
          onPress={onSave}
          disabled={isSaveDisabled}
        >
          <AppText style={styles.saveButtonText}>{saving ? 'Registrando...' : 'Registrar actividad'}</AppText>
        </Pressable>
        <Pressable onPress={onChangeType} style={styles.changeTypeButton}>
          <AppText style={styles.changeTypeText} color={theme.addBtnBg ?? '#2FCCAC'}>Cambiar tipo de actividad</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (s: (n:number)=>number, theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  gradientCard: {
    padding: 18,
    borderRadius: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#323247',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  activityTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  activitySubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#999999',
  },
  activityHint: {
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#6B7280',
  },
  customInputContainer: {
    marginTop: 16,
  },
  customInputLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  customInput: {
    backgroundColor: theme.mealRowBg ??'#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color:  theme.text ?? '#9CA3AF',
    borderWidth: 1,
    borderColor: theme.border ?? '#9CA3AF',
  },
  sectionLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  durationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    columnGap: 24,
  },
  durationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    marginTop: 7,
    color: '#FFFFFF',
  },
  durationDisplay: {
    alignItems: 'center',
    minWidth: 90,
  },
  durationNumber: {
    fontFamily: 'Poppins-Medium',
    fontSize: 32,
    lineHeight: 40,
  },
  durationLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
  },

  // Intensity buttons
  intensitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    marginBottom: 20,
    columnGap: 8,
  },
  intensityButton: {
    flex: 1,
    backgroundColor: theme.mealsCard ?? '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.2,
    borderColor: theme.border ?? '#E5E7EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  intensityButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  intensityButtonTextSelected: {
    fontWeight: '600',
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border2 ?? '#E5E7EB',

  },
  saveButton: {
    backgroundColor: theme.addBtnBg ?? '#2FCCAC',
    borderRadius: 20,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#7AD3C1',
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  changeTypeButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  changeTypeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});
