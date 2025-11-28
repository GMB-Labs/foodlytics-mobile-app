/* eslint-disable react-native/no-raw-text */
import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import useTodayISO from '@/src/shared/hooks/useTodayISO';
import useSession from '@/src/shared/hooks/useSession';
import { putJSON } from '@/src/shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';
import useToast from '@/src/shared/hooks/useToast';
import CalendarIcon from '@/assets/icons/activity/calendarIcon.svg'
import ModalHeader from '@/src/shared/ui/components/ModalHeader';
import AppText from '@/src/shared/ui/components/Typography';
import { useTheme } from '@/src/shared/styles/useTheme';

function hexToRgba(hex: string, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned.length === 3 ? cleaned.split('').map(c=>c+c).join('') : cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

  const { colors } = useTheme();
  const theme = colors as any;
  const styles = createStyles(theme);

  // Previous weight and goal from session if available
  const previousWeight = typeof sessionState?.user?.weightKg === 'number' ? sessionState.user.weightKg : 70.0;
  const goalWeight = (sessionState?.user as any)?.goalWeight ?? (sessionState?.user as any)?.desired_weight_kg ?? 65;
  const change = previousWeight - valueKg;
  const remaining = valueKg - (typeof goalWeight === 'number' ? goalWeight : 0);

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
      const userId = sessionState?.sub;
      const token = sessionState?.accessToken;

      if (userId && token) {
        try {
          await putJSON(`/api/v1/calorie-targets/${userId}/weight-history`, { day: todayISO, weight_kg: valueKg }, { baseUrl: API_BASE_URL, token });
          console.log('[AddWeight] PUT weight-history ok', { userId, day: todayISO, weightKg: valueKg });
        } catch (err: any) {
          console.warn('[AddWeight] PUT weight-history failed', err?.message || err);
        }
      } else {
        console.log('[AddWeight] no userId/accessToken available — skipping remote PUT');
      }

      if (typeof sessionActions?.setUserProfile === 'function') {
        await sessionActions.setUserProfile({ weightKg: valueKg });
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
          colors={[theme.gradient?.primaryFrom ?? 'rgba(47,204,172,0.10)', theme.gradient?.primaryTo ?? 'rgba(36,168,140,0.05)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientCard}
        >
          {/* Date card */}
          <View style={styles.dateCardInside}>
            <AppText variant="ag10" style={styles.dateLabel}>Fecha</AppText>
            <View style={styles.dateRow}>
              <CalendarIcon width={16} height={16} color={theme.text ?? '#1A1A1A'} />
              <AppText variant="ag10" style={styles.dateText}>{formatDate(todayISO)}</AppText>
            </View>
          </View>

          {/* Weight selector */}
          <View style={styles.weightSection}>
            <AppText variant="ag10" style={styles.weightLabel}>Tu peso</AppText>
            
            <View style={styles.weightControls}>
              <Pressable 
                style={[styles.roundButton, { backgroundColor: theme.addBtnBg ?? '#FFFFFF' }]}
                onPress={() => adjustWeight(-0.5)}
              >
                <AppText variant="ag9" style={[styles.roundButtonText, { color: theme.white ?? '#151522' }]}>-</AppText>
              </Pressable>

              <View style={styles.weightDisplay}>
                <AppText variant="ag1" style={[styles.weightValue, { color: theme.text ?? '#151522' }]}>{valueKg.toFixed(1)}</AppText>
                <AppText variant="ag10" style={[styles.weightUnit, { color: theme.subtext ?? '#999999' }]}>kg</AppText>
              </View>

              <Pressable 
                style={[styles.roundButton, { backgroundColor: theme.addBtnBg ?? '#FFFFFF' }]}
                onPress={() => adjustWeight(0.5)}
              >
                <AppText variant="ag9" style={[styles.roundButtonText, { color: theme.white ?? '#151522' }]}>+</AppText>
              </Pressable>
            </View>

            {/* Fine adjustment buttons */}
            <View style={styles.fineAdjustRow}>
              <Pressable 
                style={[styles.fineButton, { backgroundColor: theme.btnbggreen ?? '#FFFFFF' }]}
                onPress={() => adjustWeight(-0.1)}
              >
                <AppText variant="ag10" style={[styles.fineButtonText, { color: theme.text ?? '#151522' }]}>-0.1</AppText>
              </Pressable>
              <Pressable 
                style={[styles.fineButton, { backgroundColor: theme.btnbggreen ?? '#FFFFFF' }]}
                onPress={() => adjustWeight(0.1)}
              >
                <AppText variant="ag10" style={[styles.fineButtonText, { color: theme.text ?? '#151522' }]}>+0.1</AppText>
              </Pressable>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <AppText variant="ag10" style={styles.statLabel}>Peso anterior</AppText>
                <AppText variant="ag10" style={styles.statValue}>{previousWeight.toFixed(1)} kg</AppText>
              </View>
              <View style={styles.statItem}>
                <AppText variant="ag10" style={styles.statLabel}>Cambio</AppText>
                <AppText variant="ag10" style={[styles.statValue, { color: change > 0 ? (theme.success ?? '#00C950') : (theme.danger ?? '#FF6B6B') }]}>
                  {change > 0 ? '-' : '+'}{Math.abs(change).toFixed(1)} kg
                </AppText>
              </View>
              <View style={styles.statItem}>
                <AppText variant="ag10" style={styles.statLabel}>Meta</AppText>
                <AppText variant="ag10" style={styles.statValue}>{goalWeight} kg</AppText>
              </View>
            </View>
          </View>

          {/* Remaining to goal card */}
          <View style={[styles.goalCardInside, { backgroundColor: theme.mealsCard ?? '#FFFFFF' }]}>
            <AppText variant="ag10" style={styles.goalLabel}>Restante para tu meta</AppText>
            <AppText variant="ag4" style={[styles.goalValue, { color: theme.brandA ?? '#2FCCAC' }]}>{remaining.toFixed(1)} kg</AppText>
          </View>
        </LinearGradient>

      {/* Save button */}
      <View style={[styles.footer, { borderTopColor: theme.border2 ?? '#E5E7EB', backgroundColor: theme.bg ?? '#FFFFFF' }]}>
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled, { backgroundColor: saving ? (theme.disabled ?? '#94A3B8') : (theme.addBtnBg ?? '#2FCCAC') }]}
          onPress={onSave}
          disabled={saving}
        >
          <AppText variant="ag9" style={styles.saveButtonText}>
            {saving ? 'Guardando...' : 'Guardar Peso'}
          </AppText>
        </Pressable>
      </View>

      </View>

    </View>
  );
}

function createStyles(themeColors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.bg ?? '#FFFFFF',
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
      color: themeColors.onPrimary ?? '#FFFFFF',
    },
    closeIcon: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeIconText: {
      fontSize: 28,
      color: themeColors.onPrimary ?? '#FFFFFF',
      fontWeight: '300',
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    dateCard: {
      backgroundColor: themeColors.card ?? '#FFFFFF',
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
    },
    dateCardInside: {
      backgroundColor: themeColors.mealsCard ?? '#FFFFFF',
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
      color: themeColors.text ?? '#999999',
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
      color: themeColors.text ?? '#1A1A1A',
    },
    weightSection: {
      marginTop: 32,
      alignItems: 'center',
    },
    weightLabel: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      lineHeight: 24,
      color: themeColors.text ?? '#151522',
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
      backgroundColor: themeColors.addBtnBg ?? '#FFFFFF',
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
      color: themeColors.text ?? '#151522',
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
      color: themeColors.text ?? '#151522',
    },
    weightUnit: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      lineHeight: 24,
      color: themeColors.subtext ?? '#999999',
      marginBottom: 8,
    },
    fineAdjustRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 56,
    },
    fineButton: {
      backgroundColor: themeColors.card ?? '#FFFFFF',
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
      color: themeColors.text ?? '#151522',
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
      color: themeColors.subtext ?? '#4A5565',
      textAlign: 'center',
    },
    statValue: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      lineHeight: 24,
      color: themeColors.text ?? '#1A1A1A',
      textAlign: 'center',
    },
    goalCard: {
      backgroundColor: themeColors.card ?? '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginTop: 48,
      marginBottom: 24,
      alignItems: 'center',
    },
    goalCardInside: {
      backgroundColor: themeColors.card ?? '#FFFFFF',
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
      color: themeColors.subtext ?? '#4A5565',
      textAlign: 'center',
      marginBottom: 4,
    },
    goalValue: {
      fontFamily: 'Poppins-Regular',
      fontSize: 30,
      lineHeight: 36,
      color: themeColors.brandB ?? '#2FCCAC',
      textAlign: 'center',
    },
    footer: {
      paddingHorizontal: 8,
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
  });
}
