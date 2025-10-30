import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { PrimaryGradient } from '@/src/shared/ui/components/Gradients';
import ProgressBar from '@/src/shared/ui/ProgressBar';
import OnboardingCard from '@/src/features/onboarding/ui/OnboardingCard';
import AppText from '@/src/shared/ui/components/Typography';
import { useOnboarding } from '@/src/features/onboarding/application/OnboardingProvider';
import type { Gender } from '@/src/features/onboarding/application/store';
import OnboardingFooter from '@/src/features/onboarding/ui/OnboardingFooter';

  export default function StepGender() {
    const router = useRouter();
    const [state, actions] = useOnboarding();
    const [selected, setSelected] = useState<Gender | undefined>(state.gender);

    const options: { key: Gender; title: string; subtitle: string; emoji: string }[] = [
      { key: 'male', title: 'Masculino', subtitle: 'Hombre', emoji: '👨' },
      { key: 'female', title: 'Femenino', subtitle: 'Mujer', emoji: '👩' },
    ];

    const isValid = !!selected;

    const onContinue = () => {
      if (!selected) return;
      actions.setGender(selected);
      router.push('/onboarding/step-height');
    };

    return (
      <View className="flex-1 bg-[#FFFFFF]">
        <PrimaryGradient style={{ position: 'absolute', top: 0, left: 0, right: 0 }} height={200} />

        <View className="flex-1">
          <View className="h-28 px-8 pt-16">
            <ProgressBar step={2} total={8} containerStyle={{ paddingHorizontal: 32 }} />
          </View>

          <OnboardingCard paddingHorizontal={32} paddingTop={24}>
            <View className="items-center mb-6">
              <View className="w-24 h-24 rounded-full items-center justify-center mb-2" style={{ backgroundColor: '#E6FAF5' }}>
                <Text className="text-4xl">👤</Text>
              </View>
              <AppText variant="ag3" align="center" color="#111827">
                ¿Cuál es tu género?
              </AppText>
              <AppText variant="ag9" align="center" color="#6B7280">
                Esto nos ayuda a personalizar algunos cálculos y el contenido
              </AppText>
            </View>

            <View className="mt-6 gap-4 w-full">
                {options.map((opt, i) => {
                const active = selected === opt.key;
                const isLast = i === options.length - 1;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setSelected(opt.key)}
      className={`w-full rounded-[16px] px-4 py-5 flex-row items-center ${active ? 'bg-[rgba(47,204,172,0.1)] border border-[#2FCCAC]' : 'bg-white border border-gray-200'} ${!isLast ? 'mb-4' : ''}`}
                  >
                    <View className={`${active ? 'bg-[#2FCCAC]' : 'bg-gray-200'} rounded-full items-center justify-center`} style={{ width: 56, height: 56 }}>
                      <Text className={`${active ? 'text-white' : 'text-gray-700'} text-2xl`}>{opt.emoji}</Text>
                    </View>

                    <View className="ml-4 flex-1">
                      <AppText variant="ag5" color="#111827">{opt.title}</AppText>
                      <AppText variant="ag9" color="#6B7280">{opt.subtitle}</AppText>
                    </View>

                    {active && (
                      <View className="rounded-full items-center justify-center" style={{ width: 28, height: 28, backgroundColor: '#2FCCAC' }}>
                        <Text className="text-white text-lg">›</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

          </OnboardingCard>
        </View>

      <OnboardingFooter onBack={() => router.back()} onContinue={onContinue} disabledContinue={!selected} />
      </View>
    );
  }
