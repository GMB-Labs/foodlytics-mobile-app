import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryGradient } from '@/src/shared/ui/components/Gradients';
import ProgressBar from '@/src/shared/ui/ProgressBar';
import OnboardingCard from '@/src/shared/ui/OnboardingCard';
import AppText from '@/src/shared/ui/components/Typography';
import OnboardingFooter from '@/src/shared/ui/OnboardingFooter';
import { useOnboarding } from '@/src/features/onboarding/application/OnboardingProvider';
import { submitOnboarding } from '@/src/features/onboarding/application/submitOnboarding';
import { computeInitialGoals } from '@/src/features/goals/application/computeInitialGoals';

/**
 * Feature-level Summary screen — follows project conventions (ui/ -> features)
 * This screen reviews the collected onboarding data and triggers the
 * application use-case which delegates to infrastructure.
 */
export default function SummaryScreen() {
  const router = useRouter();
  const [state, actions] = useOnboarding();
  const [sending, setSending] = useState(false);

  const onBack = () => router.back();

  const onComplete = async () => {
    setSending(true);
    try {
      // Call application use-case. If you need to pass baseUrl / token, provide
      // them here (e.g. from useSession() or env).
      // compute local goals and pass through app use-case (which also computes
      // to ensure backend and client use same numbers)
      const goals = computeInitialGoals({
        birthDateIso: state.birthDate,
        gender: state.gender as any,
        heightCm: state.heightCm,
        weightKg: state.weightKg,
        activityLevel: state.activityLevel as any,
      });

      // attach goals into state before sending (submitOnboarding will recompute
      // as well but we include computed values so the UI shows them immediately)
      await submitOnboarding(state /*, { baseUrl: 'https://api.example.com', token: '...' } */);

      // After successful submission you might want to mark onboarding complete
      // and reset local state. Here we call reset() for a clean local state.
  actions.reset();

      Alert.alert('Listo', 'Onboarding completado.');
      router.replace('/');
    } catch (err: any) {
      console.error('submitOnboarding failed', err);
      Alert.alert('Error', err?.message || 'No se pudo enviar la información.');
      // Por ahora se envia a home, pero idealmente se queda en el summary para reintentar
      router.replace('/');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <PrimaryGradient pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} height={200} />

      <View style={{ height: 112, paddingHorizontal: 32, paddingTop: 64 }}>
        <ProgressBar step={8} total={8} containerStyle={{ paddingHorizontal: 32 }} />
      </View>

      <OnboardingCard paddingHorizontal={32} paddingTop={24}>
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 75,
                height: 75,
                borderRadius: 40,
                backgroundColor: '#E6FAF5',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <AppText style={{ fontSize: 30, lineHeight: 34 }}>📊</AppText>
            </View>
            <AppText variant="ag3" align="center" color="#111827">Tus metas diarias</AppText>
            <AppText variant="ag9" align="center" color="#6B7280">Calculadas automáticamente basadas en tus datos</AppText>
          </View>

          {/* Contenido */}
          <View style={{ gap: 12 }}>
            {/* Card kcal */}
            <View style={[styles.cardKcal, { backgroundColor: '#E6FAF5' }]}>
              <AppText variant="ag9" align="center" color="#4A5565">Meta Diaria de Calorías</AppText>
              {(() => {
                const g = computeInitialGoals({
                  birthDateIso: state.birthDate,
                  gender: state.gender as any,
                  heightCm: state.heightCm,
                  weightKg: state.weightKg,
                  activityLevel: state.activityLevel as any,
                });
                return (
                  <>
                    <AppText
                      variant="ag3"
                      align="center"
                      color="#2FCCAC"
                      style={{ fontSize: 48, lineHeight: 52, marginTop: 10 }}
                    >
                      {g.kcalTarget}
                    </AppText>
                    <AppText variant="ag9" align="center" color="#4A5565">kcal/día</AppText>
                  </>
                );
              })()}
            </View>

            {/* Macros */}
            <View style={styles.macroGrid}>
              {(() => {
                const g = computeInitialGoals({
                  birthDateIso: state.birthDate,
                  gender: state.gender as any,
                  heightCm: state.heightCm,
                  weightKg: state.weightKg,
                  activityLevel: state.activityLevel as any,
                });
                return (
                  <>
                    {/* Proteínas */}
                    <View style={[styles.macroTileSmall, { backgroundColor: '#EEF6FF' }]}>
                      <View style={styles.macroLabelBox}>
                        <AppText
                          style={{ fontSize: 13 }}
                          color="#4A5565"
                          align="center"
                          numberOfLines={2}
                          adjustsFontSizeToFit
                          minimumFontScale={0.85}
                        >
                          Proteínas
                        </AppText>
                      </View>
                      <AppText variant="ag7" color="#2B7FFF" align="center">{g.proteinG}g</AppText>
                    </View>

                    {/* Carbohidratos */}
                    <View style={[styles.macroTileWide, { backgroundColor: '#FFF7ED' }]}>
                      <View style={[styles.macroLabelBox, { minHeight: 40 }]}>
                        <AppText
                          style={{ fontSize: 15 }}
                          color="#4A5565"
                          align="center"
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.9}
                        >
                          Carbohidratos
                        </AppText>
                      </View>
                      <AppText variant="ag7" color="#FF6900" align="center">{g.carbsG}g</AppText>
                    </View>

                    {/* Grasas */}
                    <View style={[styles.macroTileSmall, { backgroundColor: '#FFFBEB' }]}>
                      <View style={styles.macroLabelBox}>
                        <AppText
                          style={{ fontSize: 13 }}
                          color="#4A5565"
                          align="center"
                          numberOfLines={2}
                          adjustsFontSizeToFit
                          minimumFontScale={0.85}
                        >
                          Grasas
                        </AppText>
                      </View>
                      <AppText variant="ag7" color="#F0B100" align="center">{g.fatsG}g</AppText>
                    </View>
                  </>
                );
              })()}
            </View>

            {/* Nota */}
            <View style={styles.noteBox}>
              <AppText variant="ag9" color="#4A5565" style={{ textAlign: 'center' }}>
                Estas metas se calcularon automáticamente basadas en tu edad, peso, altura, nivel de actividad y objetivo.
                Puedes ajustarlas en cualquier momento desde tu perfil.
              </AppText>
            </View>
          </View>
        </ScrollView>
      </OnboardingCard>

      <OnboardingFooter onBack={onBack} onContinue={onComplete} disabledContinue={sending} />

      {sending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2FCCAC" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardKcal: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  macroGrid: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },

  macroTileSmall: {
    flex: 0.9,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroTileWide: {
    flex: 1.5, // MÁS ancho para "Carbohidratos"
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  macroLabelBox: {
    minHeight: 34,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 4,
  },

  noteBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 12,
  },

  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});