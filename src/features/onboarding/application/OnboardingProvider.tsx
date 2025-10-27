import React, { createContext, useContext, useMemo, useState } from 'react';
import { ActivityLevel, Gender, OnboardingActions, OnboardingContextType, OnboardingState } from './store';

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>({});

  const actions: OnboardingActions = useMemo(() => ({
    setBirthDate: (iso: string) => setState((s) => ({ ...s, birthDate: iso })),
    setGender: (g: Gender) => setState((s) => ({ ...s, gender: g })),
    setHeightCm: (cm: number) => setState((s) => ({ ...s, heightCm: isFinite(cm) ? cm : undefined })),
    setWeightKg: (kg: number) => setState((s) => ({ ...s, weightKg: isFinite(kg) ? kg : undefined })),
    setGoalWeightKg: (kg: number) => setState((s) => ({ ...s, goalWeightKg: isFinite(kg) ? kg : undefined })),
    setActivityLevel: (lvl: ActivityLevel) => setState((s) => ({ ...s, activityLevel: lvl })),
    reset: () => setState({}),
  }), []);

  const value = useMemo<OnboardingContextType>(() => [state, actions], [state, actions]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
