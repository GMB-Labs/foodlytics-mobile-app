export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

export interface OnboardingState {
  birthDate?: string; // YYYY-MM-DD
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  goalWeightKg?: number;
  activityLevel?: ActivityLevel;
  // Notificaciones
  notificationsPermission?: 'granted' | 'denied' | 'undetermined';
  // Estructura de preferencias: se guarda si quiere resumen diario, recordatorios de comidas con horas, y sugerencias de actividad
  notificationsPreferences?: NotificationsPreferences;
}

export interface OnboardingActions {
  setBirthDate: (iso: string) => void;
  setGender: (g: Gender) => void;
  setHeightCm: (cm: number) => void;
  setWeightKg: (kg: number) => void;
  setGoalWeightKg: (kg: number) => void;
  setActivityLevel: (lvl: ActivityLevel) => void;
  // Notificaciones
  setNotificationsPermission: (p: 'granted' | 'denied' | 'undetermined') => void;
  setNotificationsPreferences: (prefs: NotificationsPreferences) => void;
  reset: () => void;
}

// Tipos para preferencias de notificaciones
export interface MealReminder {
  enabled: boolean;
  time?: string; // e.g. '08:00'
}

export interface NotificationsPreferences {
  dailySummary?: boolean;
  mealReminders?: {
    breakfast?: MealReminder;
    lunch?: MealReminder;
    dinner?: MealReminder;
  };
  activitySuggestions?: boolean;
}

export type OnboardingContextType = [OnboardingState, OnboardingActions];
