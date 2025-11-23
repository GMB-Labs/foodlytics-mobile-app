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
      const caloriesBurned = Math.round(calPerMin * duration * factor);

      const finalType = isCustom ? customName.trim() : activityTypeParam;

      // persist activity locally so summary can read last distance session
      try {
        const STORAGE_KEY = '@foodlytics:activities';
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        const now = new Date();
        const entry = {
          id: `local-${Date.now()}`,
          type: finalType,
          dateISO: todayISO,
          duration: duration, // minutes
          calories: caloriesBurned,
          createdAt: now.toISOString(),
          startTime: now.toISOString(), // hora exacta de inicio
        };
        existing.push(entry);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      } catch (e) {
        // best-effort persistence, ignore errors
        console.warn('save activity to AsyncStorage failed', e);
      }

      setSaving(false);
      router.push({
        pathname: '/modals/add-activity/complete',
        params: {
          dateISO: todayISO,
          calories: String(caloriesBurned),
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
