export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

export interface OnboardingState {
  birthDate?: string; // YYYY-MM-DD
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  goalWeightKg?: number;
  activityLevel?: ActivityLevel;
}

export interface OnboardingActions {
  setBirthDate: (iso: string) => void;
  setGender: (g: Gender) => void;
  setHeightCm: (cm: number) => void;
  setWeightKg: (kg: number) => void;
  setGoalWeightKg: (kg: number) => void;
  setActivityLevel: (lvl: ActivityLevel) => void;
  reset: () => void;
}

export type OnboardingContextType = [OnboardingState, OnboardingActions];
