import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Image, ScrollView } from 'react-native';
import OnboardingFooter from '@/src/shared/ui/OnboardingFooter';
import { PrimaryGradient } from '@/src/shared/ui/components/Gradients';
import ProgressBar from '@/src/shared/ui/ProgressBar';
import OnboardingCard from '@/src/shared/ui/OnboardingCard';
import AppText from '@/src/shared/ui/components/Typography';

import { useOnboarding } from '@/src/features/onboarding/application/OnboardingProvider';
import type { OnboardingActions } from '@/src/features/onboarding/application/store';

const options = [
  { key: 'sedentary', title: 'Sedentario', subtitle: 'Poco o ningún ejercicio', emoji: '🪑' },
  { key: 'light', title: 'Ligero', subtitle: 'Ejercicio 1–3 días/semana', emoji: '🚶' },
  { key: 'moderate', title: 'Moderado', subtitle: 'Ejercicio 3–5 días/semana', emoji: '🏃' },
  { key: 'active', title: 'Activo', subtitle: 'Ejercicio 6–7 días/semana', emoji: '💪' },
  { key: 'veryActive', title: 'Muy Activo', subtitle: 'Ejercicio intenso diario', emoji: '🔥' },
];

export default function StepActivityLevel() {
  const router = useRouter();
  const [state, actions] = useOnboarding();
  const initial = state.activityLevel ?? undefined;
  const [selected, setSelected] = useState<string | undefined>(initial as string | undefined);

  const onSelect = (k: string) => setSelected(k);

  const onContinue = () => {
    if (!selected) return;
    (actions as OnboardingActions).setActivityLevel(selected as any);
    router.push('/onboarding/step-notifications');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <PrimaryGradient style={{ position: 'absolute', top: 0, left: 0, right: 0 }} height={200} />

      <View className="flex-1">
        <View className="h-28 px-8 pt-16">
          <ProgressBar step={6} total={8} containerStyle={{ paddingHorizontal: 32 }} />
        </View>

        <OnboardingCard paddingHorizontal={32} paddingTop={24}>
          <View style={{ flex: 1 }}>
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
              <AppText style={{ fontSize: 30, lineHeight: 34 }}>🏃</AppText>
            </View>
              <AppText variant="ag3" align="center" color="#111827">¿Cuál es tu nivel de actividad?</AppText>
              <AppText variant="ag9" align="center" style={{ color: '#4A5565', marginTop: 6 }}>Esto nos ayuda a calcular tus necesidades calóricas</AppText>
            </View>

            <ScrollView style={{ marginTop: 8, width: '100%', maxWidth: 366 }} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
              {options.map((o) => {
                const isSelected = selected === o.key;
                return (
                  <Pressable
                    key={o.key}
                    onPress={() => onSelect(o.key)}
                    style={[styles.option, isSelected ? styles.optionSelected : styles.optionDefault]}
                  >
                    <View style={[styles.iconWrap, isSelected ? styles.iconWrapSelected : styles.iconWrapDefault]}>
                      <AppText variant="ag5">{o.emoji}</AppText>
                    </View>

                    <View style={{ flex: 1 }}>
                      <AppText variant="ag7" style={{ color: '#111827' }}>{o.title}</AppText>
                      <AppText variant="ag9" style={{ color: '#6A7282', marginTop: 4 }}>{o.subtitle}</AppText>
                    </View>

                    {isSelected && (
                      <View style={styles.chevronWrap}>
                        <AppText variant="ag7" style={{ color: '#FFFFFF' }}>›</AppText>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </OnboardingCard>
      </View>

      <OnboardingFooter onBack={() => router.back()} onContinue={onContinue} disabledContinue={!selected} />
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    height: 84,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 12,
  },
  optionDefault: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: '#2FCCAC',
    backgroundColor: 'rgba(47,204,172,0.1)',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapDefault: {
    backgroundColor: '#F3F4F6',
  },
  iconWrapSelected: {
    backgroundColor: '#2FCCAC',
  },
  chevronWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2FCCAC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
