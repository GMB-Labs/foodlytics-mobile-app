import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
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

const getIntensityColor = (level: Intensity) => {
  switch (level) {
    case 'Alta':
      return '#FC434C';
    case 'Moderada':
      return '#FF6900';
    case 'Baja':
    default:
      return '#00C950';
  }
};

export default function ActivityDetails() {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const todayISO = useTodayISO();
  const toast = useToast();

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

    setTimeout(() => {
      const factor = INTENSITY_FACTORS[intensity] ?? 1;
      const caloriesBurned = Math.round(calPerMin * duration * factor);

      const finalType = isCustom ? customName.trim() : activityTypeParam;

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
    <View style={styles.container}>
      <ModalHeader title="Registrar Actividad" />

      <View style={styles.content}>
        <LinearGradient
          colors={['rgba(47,204,172,0.10)', 'rgba(36,168,140,0.05)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientCard}
        >
          {/* Activity type card */}
          <View style={styles.activityCard}>
            <Text style={styles.activityTitle}>
              {isCustom ? 'Actividad personalizada' : activityTypeParam}
            </Text>
            <Text style={styles.activitySubtitle}>
              Completa los detalles de tu actividad
            </Text>

            {isCustom && (
              <View style={styles.customInputContainer}>
                <Text style={styles.customInputLabel}>Nombre de la actividad</Text>
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
          <Text style={styles.sectionLabel}>Duración (minutos)</Text>
          <View style={styles.durationSelector}>
            <Pressable style={styles.durationButton} onPress={decrementDuration}>
              <Text style={styles.durationButtonText}>−</Text>
            </Pressable>
            <View style={styles.durationDisplay}>
              <Text style={styles.durationNumber}>{duration}</Text>
              <Text style={styles.durationLabel}>minutos</Text>
            </View>
            <Pressable style={styles.durationButton} onPress={incrementDuration}>
              <Text style={styles.durationButtonText}>+</Text>
            </Pressable>
          </View>

          {/* Intensity selector */}
          <Text style={styles.sectionLabel}>Intensidad</Text>
          <View style={styles.intensitySelector}>
            {INTENSITY_LEVELS.map(level => {
              const selected = intensity === level;
              const color = getIntensityColor(level);
              return (
                <Pressable
                  key={level}
                  style={[
                    styles.intensityButton,
                    selected && {
                      backgroundColor: color,
                      borderColor: color,
                    },
                  ]}
                  onPress={() => setIntensity(level)}
                >
                  <Text
                    style={[
                      styles.intensityButtonText,
                      selected && styles.intensityButtonTextSelected,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={isSaveDisabled}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Registrando...' : 'Registrar actividad'}
          </Text>
        </Pressable>
        <Pressable onPress={onChangeType} style={styles.changeTypeButton}>
          <Text style={styles.changeTypeText}>Cambiar tipo de actividad</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: '#151522',
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
    color: '#4B5563',
    marginBottom: 6,
  },
  customInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
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
    backgroundColor: '#2FCCAC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
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
    color: '#1A1A1A',
  },
  durationLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  intensityButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  intensityButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',

  },
  saveButton: {
    backgroundColor: '#2FCCAC',
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
    color: '#2FCCAC',
  },
});
