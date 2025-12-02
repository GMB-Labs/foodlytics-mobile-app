/* eslint-disable react-native/no-raw-text */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import ModalHeader from '@/src/shared/ui/components/ModalHeader';
import { LinearGradient } from 'expo-linear-gradient';
import useToast from '@/src/shared/hooks/useToast';
import useSession from '@/src/shared/hooks/useSession';
import { updateProfile, fetchCalorieTargetsCached, fetchProfileCached } from '@/src/shared/api/profileGateway';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';
import calculateTargetsFromProfile from '@/src/features/goals/application/calorieTargetService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import RowIcon from '@/assets/icons/rowIcon.svg';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';

const ACTIVITY_MAP: Array<{ key: string; label: string }> = [
  { key: 'sedentary', label: 'Sedentario' },
  { key: 'light', label: 'Ligero' },
  { key: 'moderate', label: 'Moderado' },
  { key: 'active', label: 'Activo' },
  { key: 'veryActive', label: 'Muy activo' },
];

const GOAL_TYPE_MAP: Array<{ key: string; label: string }> = [
  { key: 'definition', label: 'Definición' },
  { key: 'maintenance', label: 'Mantenimiento' },
  { key: 'bulking', label: 'Volumen' },
];

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

function mapApiActivityToKey(apiVal?: string | null) {
  if (!apiVal) return undefined;
  const v = String(apiVal).toLowerCase();
  if (v.includes('sedent')) return 'sedentary';
  if (v.includes('light') || v.includes('ligero')) return 'light';
  if (v.includes('moder') || v.includes('moderado')) return 'moderate';
  if (v.includes('active') && v.includes('very')) return 'veryActive';
  if (v.includes('active')) return 'active';
  return undefined;
}

function mapApiGoalToKey(apiVal?: string | null) {
  if (!apiVal) return undefined;
  const v = String(apiVal).toLowerCase();
  if (v.includes('definition') || v.includes('defin')) return 'definition';
  if (v.includes('maintenance') || v.includes('maint')) return 'maintenance';
  if (v.includes('bulking') || v.includes('bul') || v.includes('buling')) return 'bulking';
  return undefined;
}

function mapActivityKeyToApi(key?: string | null) {
  if (!key) return undefined;
  const k = String(key).toLowerCase();
  const mapping: Record<string, string> = {
    sedentary: 'sedentario',
    light: 'ligero',
    moderate: 'moderado',
    active: 'activo',
    veryactive: 'muy_activo',
    'very_active': 'muy_activo',
  };
  return mapping[k] || key;
}

function hexToRgba(hex: string, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned.length === 3 ? cleaned.split('').map(c=>c+c).join('') : cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


export default function EditGoal() {
  const toast = useToast();
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const todayISO = useTodayISO();
  const [saving, setSaving] = useState(false);

  const [sessionState, sessionActions] = useSession();

  const { colors } = useTheme();
  const theme = colors as any;

  // Simulador: peso actual (luego lo puedes traer del perfil)
  const currentWeightKg = 70;

  // Form state matching Figma design
  const [targetWeight, setTargetWeight] = useState('65');
  const [activity, setActivity] = useState<string | undefined>(
    () => mapApiActivityToKey((sessionState?.user as any)?.activity_level ?? (sessionState?.user as any)?.activity) ?? 'moderate',
  );
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [goalType, setGoalType] = useState<string | undefined>(
    () => mapApiGoalToKey((sessionState?.user as any)?.goal_type ?? (sessionState?.user as any)?.goalType) ?? 'maintenance',
  );
  const [showGoalTypePicker, setShowGoalTypePicker] = useState(false);

  // Daily goals (simuladas, ahora en state)
  const [calories, setCalories] = useState('1789');
  const [proteins, setProteins] = useState('134g');
  const [carbs, setCarbs] = useState('179g');
  const [fats, setFats] = useState('60g');

  const recalcGoals = () => {
    const target = parseFloat(targetWeight.replace(',', '.'));
    if (Number.isNaN(target) || target <= 0) return;
    // Try to use shared service when height/age/gender are available
    const user = sessionState?.user as any;
    const heightCm = user?.height_cm ?? user?.heightCm;
    const age = user?.age;
    const gender = user?.gender ?? user?.sex ?? user?.gender_identity;

    try {
      if (heightCm && age) {
        const activityForService = activity === 'veryActive' ? 'very_active' : (activity as any);
        const apiGoal = mapGoalKeyToApi(goalType ?? 'maintenance');
        const targets = calculateTargetsFromProfile({
          weightKg: target,
          heightCm: Number(heightCm),
          age: Number(age),
          gender: (gender as any) ?? 'other',
          goalType: apiGoal as any,
          activityLevel: activityForService as any,
        });

        setCalories(String(targets.kcalTarget));
        setProteins(`${targets.proteinG}g`);
        setFats(`${targets.fatsG}g`);
        setCarbs(`${targets.carbsG}g`);
        return;
      }
    } catch (e) {
      // fallback to simpler heuristic below
    }

    // Fallback simple heuristic if missing profile data
    const factor = ACTIVITY_FACTORS[activity ?? 'moderate'] ?? ACTIVITY_FACTORS['moderate'];
    const baseCalories = currentWeightKg * 30 * factor;
    const diffKg = target - currentWeightKg;
    const adjustment = Math.max(Math.min(diffKg * 10, 300), -300); // entre -300 y +300 kcal
    const totalCalories = Math.round(baseCalories + adjustment);
    const proteinG = Math.round(target * 1.8); // 1.8 g/kg
    const fatG = Math.round(target * 0.9);     // 0.9 g/kg
    const kcalFromProtein = proteinG * 4;
    const kcalFromFat = fatG * 9;
    let kcalLeftForCarbs = totalCalories - (kcalFromProtein + kcalFromFat);
    if (kcalLeftForCarbs < totalCalories * 0.3) {
      kcalLeftForCarbs = Math.round(totalCalories * 0.3);
    }
    const carbsG = Math.round(kcalLeftForCarbs / 4);

    setCalories(String(totalCalories));
    setProteins(`${proteinG}g`);
    setFats(`${fatG}g`);
    setCarbs(`${carbsG}g`);
  };

  // Recalcula cuando cambian peso objetivo o actividad
  useEffect(() => {
    recalcGoals();
  }, [targetWeight, activity]);

  // Prefill form from session profile if available
  useEffect(() => {
    const user = sessionState?.user as any;
    if (!user) return;
    if (user.goalWeight || user.desired_weight_kg) {
      setTargetWeight(String(user.goalWeight ?? user.desired_weight_kg ?? ''));
    }
    // map api values to our internal keys
    const actKey = mapApiActivityToKey(user?.activity_level ?? user?.activity);
    if (actKey) setActivity(actKey as any);
    const gKey = mapApiGoalToKey(user?.goal_type ?? user?.goalType);
    if (gKey) setGoalType(gKey as any);
  }, [sessionState?.user]);

  function mapGoalKeyToApi(key: string) {
    if (key === 'definition') return 'definition';
    if (key === 'maintenance') return 'maintenance';
    if (key === 'bulking') return 'bulking';
    // fallback: return key
    return key;
  }

  const onSave = async () => {
    setSaving(true);
    const userId = sessionState?.sub;
    const token = sessionState?.accessToken ?? undefined;
    const desired = parseFloat(String(targetWeight).replace(',', '.'));
    if (!userId) {
      toast.show({ text: 'Usuario no identificado' });
      setSaving(false);
      return;
    }


    const partial: Record<string, any> = {
      desired_weight_kg: Number.isFinite(desired) ? desired : undefined,
      activity_level: mapActivityKeyToApi(activity ?? 'moderate'),
      goal_type: mapGoalKeyToApi(goalType ?? 'maintenance'),
    };

    try {
      // Fetch existing profile to include required fields the API expects
      let existing = null;
      try {
        existing = await fetchProfileCached({ userId, token });
      } catch (e) {
        existing = null;
      }

      const fromSession = (sessionState?.user || {}) as any;

      const fullPayload: Record<string, any> = {
        // required fields: prefer existing profile, then session, then safe defaults
        first_name: existing?.first_name ?? fromSession?.first_name ?? fromSession?.name?.split(' ')?.[0] ?? '',
        last_name: existing?.last_name ?? fromSession?.last_name ?? (fromSession?.name ? fromSession.name.split(' ').slice(1).join(' ') : '') ?? '',
        age: existing?.age ?? fromSession?.age ?? 0,
        gender: existing?.gender ?? fromSession?.gender ?? 'other',
        user_profile_completed: existing?.user_profile_completed ?? true,
        // other optional but useful fields
        height_cm: existing?.height_cm ?? fromSession?.heightCm ?? undefined,
        weight_kg: existing?.weight_kg ?? fromSession?.weightKg ?? undefined,
        // merge partial updates
        ...existing,
        ...partial,
      };

      await updateProfile({ userId, payload: fullPayload, token });

      // refresh session profile so Profile -> Goals components update
      try { await sessionActions.refreshProfileAndUpdateCompletion(undefined, token ?? null, userId); } catch (e) {}

      // force refresh calorie-targets cache
      try { await fetchCalorieTargetsCached({ patientId: userId, token, force: true }); } catch (e) {}
      // notify other components that calorie targets were refreshed
      try { await sessionActions.setUserProfile({ calorieTargetsRefreshedAt: Date.now() }); } catch (e) {}

      setSaving(false);
      router.push({ pathname: '/modals/edit-goals/complete', params: { dateISO: todayISO } } as any);
    } catch (err: any) {
      setSaving(false);
      const msg = err?.message || 'Error al actualizar metas';
      toast.show({ text: msg });
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ModalHeader title="Nueva meta" />

      {/* Tocar fuera cierra el teclado */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[hexToRgba(theme.brandA ?? '#2FCCAC', 0.1), hexToRgba(theme.brandB ?? '#24A88C', 0.05)]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientCard}
          >
            {/* Objectives card */}
            <View style={styles.objectivesCard}>
              <AppText variant="ag7" style={styles.cardTitle}><Text>Objetivos nutricionales</Text></AppText>
              <AppText variant="ag7" style={styles.cardSubtitle}><Text>Ajusta tus metas diarias</Text></AppText>
            </View>

            {/* Weight input */}
            <View style={styles.inputContainer}>
              <AppText variant="ag10" style={styles.inputLabel}><Text>Peso Objetivo (kg)</Text></AppText>
              <TextInput
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                style={[styles.input, { color: theme.text ?? '#1A1A1A' }]}
                placeholderTextColor={ '#9CA3AF'}
              />
            </View>

            {/* Activity level selector */}
            <View style={styles.inputContainer}>
              <AppText variant="ag10" style={styles.inputLabel}><Text>Nivel de Actividad</Text></AppText>
              <Pressable
                style={styles.selectorButton}
                onPress={() => {
                  Keyboard.dismiss();           // cierra teclado al abrir picker
                  setShowActivityPicker(true);
                }}
              >
                <AppText variant="ag10" style={styles.selectorText}>{ACTIVITY_MAP.find(a => a.key === activity)?.label ?? activity}</AppText>
                <RowIcon width={16} height={16} />
              </Pressable>
            </View>

            {/* Goal type selector */}
            <View style={styles.inputContainer}>
              <AppText variant="ag10" style={styles.inputLabel}><Text>Tipo de Objetivo</Text></AppText>
              <Pressable
                style={styles.selectorButton}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowGoalTypePicker(true);
                }}
              >
                <AppText variant="ag10" style={styles.selectorText}>{GOAL_TYPE_MAP.find(g => g.key === goalType)?.label ?? goalType}</AppText>
                <RowIcon width={16} height={16} />
              </Pressable>
            </View>

            {/* Daily goals section */}
            <AppText variant="ag10" style={styles.sectionTitle}><Text>Vista Previa - Metas Diarias aproz</Text></AppText>
            <View style={[styles.goalsContainer, { backgroundColor: theme.celeste ?? '#C9F3EB' }] }>
              <View style={styles.goalsGrid}>
                <View style={styles.goalBox}>
                  <AppText variant="ag10" style={styles.goalLabel}><Text>Calorías</Text></AppText>
                  <AppText variant="ag6" style={[styles.goalValue, { color: theme.brandA ?? '#2FCCAC' }]}><Text>{calories}</Text></AppText>
                </View>
                <View style={styles.goalBox}>
                  <AppText variant="ag10" style={styles.goalLabel}><Text>Proteínas</Text></AppText>
                  <AppText variant="ag6" style={[styles.goalValue, { color:  '#2B7FFF' }]}><Text>{proteins}</Text></AppText>
                </View>
                <View style={styles.goalBox}>
                  <AppText variant="ag10" style={styles.goalLabel}><Text>Carbohidratos</Text></AppText>
                  <AppText variant="ag6" style={[styles.goalValue, { color: '#FF6900' }]}><Text>{carbs}</Text></AppText>
                </View>
                <View style={styles.goalBox}>
                  <AppText variant="ag10" style={styles.goalLabel}><Text>Grasas</Text></AppText>
                  <AppText variant="ag6" style={[styles.goalValue, { color:  '#F0B100' }]}><Text>{fats}</Text></AppText>
                </View>
              </View>
            </View>
          </LinearGradient>
        <View style={{ height: 20 }} />

        {/* Footer with save button */}
        <View style={[styles.footer, { borderTopColor: theme.border2 ?? '#E5E7EB', backgroundColor: theme.bg ?? '#FFFFFF' }]}>
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled, { backgroundColor: saving ? (theme.disabled ?? '#94A3B8') : (theme.addBtnBg ?? '#2FCCAC') }]}
            onPress={onSave}
            disabled={saving}
          >
            <AppText variant="ag9" style={styles.saveButtonText}>
              <Text>{saving ? 'Guardando...' : 'Guardar metas'}</Text>
            </AppText>
          </Pressable>
        </View>

        </ScrollView>
      </TouchableWithoutFeedback>



      {/* Activity level picker modal */}
      <Modal
        visible={showActivityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActivityPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowActivityPicker(false)}>
          <View style={[styles.pickerContainer, { backgroundColor: theme.mealsCard ?? '#FFFFFF' }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: theme.border2 ?? '#E5E7EB' }]}>
              <AppText variant="ag9" style={styles.pickerTitle}><Text>Nivel de Actividad</Text></AppText>
              <Pressable onPress={() => setShowActivityPicker(false)}>
                <AppText variant="ag9" style={styles.pickerClose}><Text>✕</Text></AppText>
              </Pressable>
            </View>
            {ACTIVITY_MAP.map(opt => (
              <Pressable
                key={opt.key}
                style={[styles.pickerItem, activity === opt.key && styles.pickerItemSelected]}
                onPress={() => {
                  setActivity(opt.key);
                  setShowActivityPicker(false);
                }}
              >
                <AppText
                  variant="ag10"
                  style={[
                    styles.pickerItemText,
                    activity === opt.key && styles.pickerItemTextSelected,
                    { color: activity === opt.key ? '#FFFFFF' : (theme.text ?? '#1A1A1A') },
                  ]}
                >
                  <Text>{opt.label}</Text>
                </AppText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
      {/* Goal type picker modal */}
      <Modal
        visible={showGoalTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalTypePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowGoalTypePicker(false)}>
          <View style={[styles.pickerContainer, { backgroundColor: theme.mealsCard ?? '#FFFFFF' }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: theme.border2 ?? '#E5E7EB' }]}>
              <AppText variant="ag9" style={styles.pickerTitle}><Text>Tipo de Objetivo</Text></AppText>
              <Pressable onPress={() => setShowGoalTypePicker(false)}>
                <AppText variant="ag9" style={styles.pickerClose}><Text>✕</Text></AppText>
              </Pressable>
            </View>
            {GOAL_TYPE_MAP.map(opt => (
              <Pressable
                key={opt.key}
                style={[styles.pickerItem, goalType === opt.key && styles.pickerItemSelected]}
                onPress={() => {
                  setGoalType(opt.key);
                  setShowGoalTypePicker(false);
                }}
              >
                <AppText
                  variant="ag10"
                  style={[
                    styles.pickerItemText,
                    goalType === opt.key && styles.pickerItemTextSelected,
                    { color: goalType === opt.key ? '#FFFFFF' : (theme.text ?? '#1A1A1A') },
                  ]}
                >
                  <Text>{opt.label}</Text>
                </AppText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(themeColors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.bg ?? '#FFFFFF' },

    content: {
      paddingHorizontal: 11,
      paddingTop: 26,
      borderRadius: 16,
    },
    gradientCard: {
      padding: 18,
      borderRadius: 20,
      paddingBottom: 1,
    },

    // Objectives card
    objectivesCard: {
      backgroundColor: themeColors.mealRowBg ?? '#FFFFFF',
      borderRadius: 10,
      padding: 24,
      marginBottom: 20,
      shadowColor: '#323247',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },

    cardTitle: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      lineHeight: 24,
      color: themeColors.text ?? '#151522',
      marginBottom: 4,
    },
    cardSubtitle: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      lineHeight: 24,
      color: themeColors.subtext ?? '#999999',
    },

    // Input fields
    inputContainer: { marginBottom: 16 },
    inputLabel: {
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      lineHeight: 20,
      color: themeColors.subtext ?? '#4A5565',
      marginBottom: 2,
    },
    input: {
      backgroundColor: themeColors.mealsCard ?? '#FFFFFF',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 14,
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      lineHeight: 20,
      color: themeColors.text ?? '#1A1A1A',
    },

    // Activity selector
    selectorButton: {
      backgroundColor: themeColors.mealsCard ?? '#FFFFFF',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectorText: {
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      lineHeight: 20,
      color: themeColors.text ?? '#1A1A1A',
    },

    // Daily goals section
    sectionTitle: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      lineHeight: 24,
      color: themeColors.subtext ?? '#4A5565',
      marginTop: 12,
      marginBottom: 16,
    },
    goalsContainer: {
      borderRadius: 27,
      padding: 16,
      marginBottom: 20,
    },
    goalsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    goalBox: {
      backgroundColor: themeColors.mealsCard ?? '#FFFFFF',
      borderRadius: 20,
      padding: 12,
      width: '48%',
    },
    goalLabel: {
      fontFamily: 'Poppins-Regular',
      fontSize: 12,
      lineHeight: 16,
      color: themeColors.subtext ?? '#4A5565',
      marginBottom: 4,
    },
    goalValue: {
      fontFamily: 'Poppins-Regular',
      fontSize: 18,
      lineHeight: 28,
    },

    // Footer
    footer: {
      paddingTop: 10,
      paddingHorizontal: 22,
      paddingVertical: 16,
      backgroundColor: themeColors.card ?? '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: themeColors.border ?? '#E5E7EB',
    },
    saveButton: {
      borderRadius: 20,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
      lineHeight: 20,
      color: themeColors.onBrand ?? '#FFFFFF',
    },

    // Activity picker modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    pickerContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 34,
    },
    pickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 20,
      borderBottomWidth: 1,
    },
    pickerTitle: {
      fontFamily: 'Poppins-Medium',
      fontSize: 18,
      color: themeColors.text ?? '#1A1A1A',
    },
    pickerClose: {
      fontSize: 24,
      color: themeColors.subtext ?? '#6B7280',
    },
    pickerItem: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border2 ?? '#F3F4F6',
    },
    pickerItemSelected: {
      backgroundColor: themeColors.addBtnBg ?? '#ECFDF7',
    },
    pickerItemText: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      color: themeColors.text ?? '#1A1A1A',
    },
    pickerItemTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
}


