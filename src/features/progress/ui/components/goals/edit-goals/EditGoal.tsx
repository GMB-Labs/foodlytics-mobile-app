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

const ACTIVITY_LEVELS = ['Sedentario', 'Ligero', 'Moderado', 'Activo', 'Muy activo'] as const;

const ACTIVITY_FACTORS: Record<(typeof ACTIVITY_LEVELS)[number], number> = {
  Sedentario: 1.2,
  Ligero: 1.375,
  Moderado: 1.55,
  Activo: 1.725,
  'Muy activo': 1.9,
};

export default function EditGoal() {
  const toast = useToast();
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const todayISO = useTodayISO();
  const [saving, setSaving] = useState(false);

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
            colors={['rgba(47,204,172,0.10)', 'rgba(36,168,140,0.05)']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientCard}
          >
            {/* Objectives card */}
            <View style={styles.objectivesCard}>
              <Text style={styles.cardTitle}>Objetivos nutricionales</Text>
              <Text style={styles.cardSubtitle}>Ajusta tus metas diarias</Text>
            </View>

            {/* Weight input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Peso Objetivo (kg)</Text>
              <TextInput
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#999999"
              />
            </View>

            {/* Activity level selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nivel de Actividad</Text>
              <Pressable
                style={styles.selectorButton}
                onPress={() => {
                  Keyboard.dismiss();           // cierra teclado al abrir picker
                  setShowActivityPicker(true);
                }}
              >
                <Text style={styles.selectorText}>{activity}</Text>
                <RowIcon width={16} height={16} />
              </Pressable>
            </View>

            {/* Daily goals section */}
            <Text style={styles.sectionTitle}>Metas Diarias</Text>
            <View style={styles.goalsContainer}>
              <View style={styles.goalsGrid}>
                <View style={styles.goalBox}>
                  <Text style={styles.goalLabel}>Calorías</Text>
                  <Text style={[styles.goalValue, { color: '#2FCCAC' }]}>{calories}</Text>
                </View>
                <View style={styles.goalBox}>
                  <Text style={styles.goalLabel}>Proteínas</Text>
                  <Text style={[styles.goalValue, { color: '#2B7FFF' }]}>{proteins}</Text>
                </View>
                <View style={styles.goalBox}>
                  <Text style={styles.goalLabel}>Carbohidratos</Text>
                  <Text style={[styles.goalValue, { color: '#FF6900' }]}>{carbs}</Text>
                </View>
                <View style={styles.goalBox}>
                  <Text style={styles.goalLabel}>Grasas</Text>
                  <Text style={[styles.goalValue, { color: '#F0B100' }]}>{fats}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        <View style={{ height: 20 }} />

        {/* Footer with save button */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={onSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Guardando...' : 'Guardar metas'}
            </Text>
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
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Nivel de Actividad</Text>
              <Pressable onPress={() => setShowActivityPicker(false)}>
                <Text style={styles.pickerClose}>✕</Text>
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
                <Text
                  style={[
                    styles.pickerItemText,
                    activity === level && styles.pickerItemTextSelected,
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  content: {
    paddingHorizontal: 10,
    paddingTop: 26,
    borderRadius: 16,
  },
  gradientCard: {
    padding: 18,
    borderRadius: 20,
    paddingBottom: 1 ,
  },

  // Objectives card
  objectivesCard: {
    backgroundColor: '#FFFFFF',
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
    color: '#151522',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#999999',
  },

  // Input fields
  inputContainer: { marginBottom: 16 },
  inputLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5565',
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },

  // Activity selector
  selectorButton: {
    backgroundColor: '#FFFFFF',
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
    color: '#1A1A1A',
  },

  // Daily goals section
  sectionTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5565',
    marginTop: 12,
    marginBottom: 16,
  },
  goalsContainer: {
    backgroundColor: '#C9F3EB',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    width: '48%',
  },
  goalLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#4A5565',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    
  },
  saveButton: {
    backgroundColor: '#2FCCAC',
    borderRadius: 20,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },

  // Activity picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#E5E7EB',
  },
  pickerTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#1A1A1A',
  },
  pickerClose: {
    fontSize: 24,
    color: '#6B7280',
  },
  pickerItem: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemSelected: {
    backgroundColor: '#ECFDF7',
  },
  pickerItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#1A1A1A',
  },
  pickerItemTextSelected: {
    color: '#2FCCAC',
    fontWeight: '600',
  },
});
