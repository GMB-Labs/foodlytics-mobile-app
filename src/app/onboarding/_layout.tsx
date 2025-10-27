import React from "react";
import { Stack } from 'expo-router';
import { OnboardingProvider } from '@/src/features/onboarding/application/OnboardingProvider';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "transparent" },
          presentation: "card",
        }}
      />
    </OnboardingProvider>
  );
}