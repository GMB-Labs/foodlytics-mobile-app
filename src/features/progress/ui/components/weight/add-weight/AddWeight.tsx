import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import useTodayISO from '@/src/shared/hooks/useTodayISO';
import useSession from '@/src/shared/hooks/useSession';
import { postJSON } from '@/src/shared/utils/api';
import useToast from '@/src/shared/hooks/useToast';
import CalendarIcon from '@/assets/icons/activity/calendarIcon.svg'
import ModalHeader from '@/src/shared/ui/components/ModalHeader';

// Simple X icon component
function CloseIcon() {
  return (
    <View style={styles.closeIcon}>
      <Text style={styles.closeIconText}>×</Text>
    </View>
  );
}


export default function AddWeight() {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const todayISO = useTodayISO();
  const [sessionState, sessionActions] = useSession();
  const toast = useToast();

  // start with current profile weight if available
  const initial = sessionState?.user?.weightKg ?? 70;
  const [valueKg, setValueKg] = useState<number>(initial);
  const [saving, setSaving] = useState(false);

  // Previous weight (for demo - could be fetched from storage)
  const previousWeight = 70.0;
  const goalWeight = 65;
  const change = previousWeight - valueKg;
  const remaining = valueKg - goalWeight;

  const formatDate = (iso: string) => {
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year.slice(2)}`;
  };

  const adjustWeight = (delta: number) => {
    const newValue = Math.round((valueKg + delta) * 10) / 10;
    if (newValue >= 20 && newValue <= 300) {
      setValueKg(newValue);
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      // Send to backend. Adjust endpoint as needed for your API.
      await postJSON('/weights', { dateISO: todayISO, weightKg: valueKg });

      if (typeof sessionActions?.setUserProfile === 'function') {
        sessionActions.setUserProfile({ weightKg: valueKg });
      }

      toast.show({ type: 'success', text: 'Peso enviado correctamente' });
      // On success navigate to simple completion screen (no params required)
      router.replace('/modals/add-weight/complete');
    } catch (err: any) {
      //console.error('save weight error', err);
      //const msg = err?.body?.message || err?.message || 'No se pudo guardar el peso';
     // toast.show({ type: 'error', text: msg });
     router.replace('/modals/add-weight/complete');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ModalHeader title="Registrar peso" />

      <View style={styles.content}>
        <LinearGradient
          colors={['rgba(47,204,172,0.10)', 'rgba(36,168,140,0.05)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientCard}
        >
          {/* Date card */}
          <View style={styles.dateCardInside}>
            <Text style={styles.dateLabel}>Fecha</Text>
            <View style={styles.dateRow}>
              <CalendarIcon />
              <Text style={styles.dateText}>{formatDate(todayISO)}</Text>
            </View>
          </View>

          {/* Weight selector */}
          <View style={styles.weightSection}>
            <Text style={styles.weightLabel}>Tu peso</Text>
            
            <View style={styles.weightControls}>
              <Pressable 
                style={styles.roundButton}
                onPress={() => adjustWeight(-0.5)}
              >
                <Text style={styles.roundButtonText}>-</Text>
              </Pressable>

              <View style={styles.weightDisplay}>
                <Text style={styles.weightValue}>{valueKg.toFixed(1)}</Text>
                <Text style={styles.weightUnit}>kg</Text>
              </View>

              <Pressable 
                style={styles.roundButton}
                onPress={() => adjustWeight(0.5)}
              >
                <Text style={styles.roundButtonText}>+</Text>
              </Pressable>
            </View>

            {/* Fine adjustment buttons */}
            <View style={styles.fineAdjustRow}>
              <Pressable 
                style={styles.fineButton}
                onPress={() => adjustWeight(-0.1)}
              >
                <Text style={styles.fineButtonText}>-0.1</Text>
              </Pressable>
              <Pressable 
                style={styles.fineButton}
                onPress={() => adjustWeight(0.1)}
              >
                <Text style={styles.fineButtonText}>+0.1</Text>
              </Pressable>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Peso anterior</Text>
                <Text style={styles.statValue}>{previousWeight.toFixed(1)} kg</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Cambio</Text>
                <Text style={[styles.statValue, { color: change > 0 ? '#00C950' : '#FF6B6B' }]}>
                  {change > 0 ? '-' : '+'}{Math.abs(change).toFixed(1)} kg
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Meta</Text>
                <Text style={styles.statValue}>{goalWeight} kg</Text>
              </View>
            </View>
          </View>

          {/* Remaining to goal card */}
          <View style={styles.goalCardInside}>
            <Text style={styles.goalLabel}>Restante para tu meta</Text>
            <Text style={styles.goalValue}>{remaining.toFixed(1)} kg</Text>
          </View>
        </LinearGradient>

      {/* Save button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Guardando...' : 'Guardar Peso'}
          </Text>
        </Pressable>
      </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 120,
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
  },
  headerTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 24,
    color: '#FFFFFF',
  },
  closeIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 24,
    marginTop: 20,
    shadowColor: '#323247',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientCard: {
    marginTop: 20,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    // allow inner content to be visible and centered
  },
  dateCardInside: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#323247',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dateLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#999999',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarIconText: {
    fontSize: 16,
  },
  dateText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  weightSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  weightLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#151522',
    textAlign: 'center',
    marginBottom: 24,
  },
  weightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  roundButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roundButtonText: {
    fontFamily: 'Poppins-Light',
    fontSize: 34,
    lineHeight: 45,
    color: '#151522',
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  weightValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 48,
    fontWeight: '600',
    lineHeight: 48,
    color: '#151522',
  },
  weightUnit: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#999999',
    marginBottom: 8,
  },
  fineAdjustRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 56,
  },
  fineButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 40,
    justifyContent: 'center',
  },
  fineButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#151522',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 342,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#4A5565',
    textAlign: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 48,
    marginBottom: 24,
    alignItems: 'center',
  },
  goalCardInside: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  goalLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#4A5565',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 30,
    lineHeight: 36,
    color: '#2FCCAC',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
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
});
