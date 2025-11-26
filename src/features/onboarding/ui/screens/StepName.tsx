import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { PrimaryGradient } from '@/src/shared/ui/components/Gradients';
import ProgressBar from '@/src/shared/ui/ProgressBar';
import OnboardingCard from '@/src/features/onboarding/ui/OnboardingCard';
import AppText from '@/src/shared/ui/components/Typography';
import { useOnboarding } from '@/src/features/onboarding/application/OnboardingProvider';
import OnboardingFooter from '@/src/features/onboarding/ui/OnboardingFooter';

export default function StepName() {
  const router = useRouter();
  const [state, actions] = useOnboarding();
  const [firstName, setFirstName] = useState(state.firstName || '');
  const [lastName, setLastName] = useState(state.lastName || '');

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  const onContinue = () => {
    if (!isValid) return;
    actions.setFirstName(firstName.trim());
    actions.setLastName(lastName.trim());
    router.push('/onboarding/step-dob');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <PrimaryGradient style={{ position: 'absolute', top: 0, left: 0, right: 0 }} height={200} />

      <View style={{ flex: 1 }}>
        <View style={{ height: 112, paddingHorizontal: 32, paddingTop: 64 }}>
          <ProgressBar step={1} total={9} containerStyle={{ paddingHorizontal: 32 }} />
        </View>

        <OnboardingCard paddingHorizontal={32} paddingTop={24}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
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
              <Text style={{ fontSize: 30, lineHeight: 34 }}>👋</Text>
            </View>
            <AppText variant="ag3" align="center" color="#111827">
              ¿Cuál es tu nombre?
            </AppText>
            <AppText variant="ag9" align="center" color="#6B7280">
              Queremos conocerte mejor
            </AppText>
          </View>

          <View style={{ gap: 16 }}>
            <View>
              <AppText variant="ag9" color="#4A5565" style={{ marginBottom: 8 }}>
                Nombre
              </AppText>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Ingresa tu nombre"
                placeholderTextColor="#9CA3AF"
                style={{
                  backgroundColor: '#F9FAFB',
                  borderWidth: 1,
                  borderColor: firstName.trim().length > 0 ? '#2FCCAC' : '#E5E7EB',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: '#111827',
                }}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View>
              <AppText variant="ag9" color="#4A5565" style={{ marginBottom: 8 }}>
                Apellido
              </AppText>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Ingresa tu apellido"
                placeholderTextColor="#9CA3AF"
                style={{
                  backgroundColor: '#F9FAFB',
                  borderWidth: 1,
                  borderColor: lastName.trim().length > 0 ? '#2FCCAC' : '#E5E7EB',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: '#111827',
                }}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>
        </OnboardingCard>
      </View>

      {/* No pasar onBack en la primera pantalla para evitar el error de navegación */}
      <OnboardingFooter onContinue={onContinue} disabledContinue={!isValid} />
    </View>
  );
}

