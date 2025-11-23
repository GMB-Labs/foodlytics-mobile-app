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
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';
import { useRouter, useLocalSearchParams } from 'expo-router';
import RowIcon from '@/assets/icons/rowIcon.svg';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';

const ACTIVITY_LEVELS = ['Sedentario', 'Ligero', 'Moderado', 'Activo', 'Muy activo'] as const;

const ACTIVITY_FACTORS: Record<(typeof ACTIVITY_LEVELS)[number], number> = {
  Sedentario: 1.2,
  Ligero: 1.375,
  Moderado: 1.55,
  Activo: 1.725,
  'Muy activo': 1.9,
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


export default function EditGoal() {
  const toast = useToast();
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const todayISO = useTodayISO();
  const [saving, setSaving] = useState(false);

  const { colors } = useTheme();
  const theme = colors as any;

  // Simulador: peso actual (luego lo puedes traer del perfil)
  const currentWeightKg = 70;

  // Form state matching Figma design
  const [targetWeight, setTargetWeight] = useState('65');
  const [activity, setActivity] = useState<(typeof ACTIVITY_LEVELS)[number]>('Moderado');
  const [showActivityPicker, setShowActivityPicker] = useState(false);

  // Daily goals (simuladas, ahora en state)
  const [calories, setCalories] = useState('1789');
  const [proteins, setProteins] = useState('134g');
  const [carbs, setCarbs] = useState('179g');
  const [fats, setFats] = useState('60g');

  const recalcGoals = () => {
    const target = parseFloat(targetWeight.replace(',', '.'));
    if (Number.isNaN(target) || target <= 0) return;

    const factor = ACTIVITY_FACTORS[activity] ?? ACTIVITY_FACTORS.Moderado;

    // Calorías base según peso actual y actividad
    const baseCalories = currentWeightKg * 30 * factor;

    // Ajuste por diferencia de peso objetivo
    const diffKg = target - currentWeightKg;
    const adjustment = Math.max(Math.min(diffKg * 10, 300), -300); // entre -300 y +300 kcal

    const totalCalories = Math.round(baseCalories + adjustment);

    // Macros simples:
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

  const onSave = async () => {
    setSaving(true);
    // TODO: integrate backend save
    setTimeout(() => {
      setSaving(false);
      // Open the completion screen inside the edit-goals modal stack
      router.push({ pathname: '/modals/edit-goals/complete', params: { dateISO: todayISO } } as any);
    }, 600);
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
              <AppText variant="ag7" style={styles.cardTitle}>Objetivos nutricionales</AppText>
              <AppText variant="ag7" style={styles.cardSubtitle}>Ajusta tus metas diarias</AppText>
            </View>

            {/* Weight input */}
            <View style={styles.inputContainer}>
              <AppText variant="ag10" style={styles.inputLabel}>Peso Objetivo (kg)</AppText>
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
              <AppText variant="ag10" style={styles.inputLabel}>Nivel de Actividad</AppText>
              <Pressable
                style={styles.selectorButton}
                onPress={() => {
                  Keyboard.dismiss();           // cierra teclado al abrir picker
                  setShowActivityPicker(true);
                }}
              >
                <AppText variant="ag10" style={styles.selectorText}>{activity}</AppText>
                <RowIcon width={16} height={16} />
              </Pressable>
            </View>

            {/* Daily goals section */}
            <AppText variant="ag10" style={styles.sectionTitle}>Metas Diarias</AppText>
            <View style={[styles.goalsContainer, { backgroundColor: theme.celeste ?? '#C9F3EB' }] }>
              <View style={styles.goalsGrid}>
                <View style={styles.goalBox}>
                  <AppText variant="ag10" style={styles.goalLabel}>Calorías</AppText>
                  <AppText variant="ag6" style={[styles.goalValue, { color: theme.brandB ?? '#2FCCAC' }]}>{calories}</AppText>
                </View>
                <View style={styles.goalBox}>
                  <AppText variant="ag10" style={styles.goalLabel}>Proteínas</AppText>
                  <AppText variant="ag6" style={[styles.goalValue, { color: theme.brandA ?? '#2B7FFF' }]}>{proteins}</AppText>
                </View>
                <View style={styles.goalBox}>
                  <AppText variant="ag10" style={styles.goalLabel}>Carbohidratos</AppText>
                  <AppText variant="ag6" style={[styles.goalValue, { color: theme.danger ?? '#FF6900' }]}>{carbs}</AppText>
                </View>
                <View style={styles.goalBox}>
                  <AppText variant="ag10" style={styles.goalLabel}>Grasas</AppText>
                  <AppText variant="ag6" style={[styles.goalValue, { color: theme.warning ?? '#F0B100' }]}>{fats}</AppText>
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
              {saving ? 'Guardando...' : 'Guardar metas'}
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
              <AppText variant="ag9" style={styles.pickerTitle}>Nivel de Actividad</AppText>
              <Pressable onPress={() => setShowActivityPicker(false)}>
                <AppText variant="ag9" style={styles.pickerClose}>✕</AppText>
              </Pressable>
            </View>
            {ACTIVITY_LEVELS.map(level => (
              <Pressable
                key={level}
                style={[styles.pickerItem, activity === level && styles.pickerItemSelected]}
                onPress={() => {
                  setActivity(level);
                  setShowActivityPicker(false);
                }}
              >
                <AppText
                  variant="ag10"
                  style={[
                    styles.pickerItemText,
                    activity === level && styles.pickerItemTextSelected,
                    { color: activity === level ? ( '#FFFFFF') : (theme.text ?? '#1A1A1A') },
                  ]}
                >
                  {level}
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
      paddingTop: 20,
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


