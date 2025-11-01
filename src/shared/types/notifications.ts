// shared/types/notifications.ts
export type MealKey = 'breakfast' | 'lunch' | 'dinner';

export type MealReminder = {
  enabled: boolean;
  time?: string; // "HH:MM"
};

export type NotificationsPreferences = {
  dailySummary: boolean;
  mealReminders: {
    breakfast: MealReminder;
    lunch: MealReminder;
    dinner: MealReminder;
  };
  activitySuggestions: boolean;
  // Alerts that are triggered by app logic (these toggles are read by the app when conditions occur)
  alerts?: {
    deficit?: boolean;
    excess?: boolean;
    water?: boolean; // periodic reminder every N hours
  };
  // Tips / motivational messages
  tips?: {
    nutrition?: boolean;
    exercise?: boolean;
    motivational?: boolean;
  };
  // Goals related toggles
  goals?: {
    stepsReached?: boolean;
    weeklySummary?: boolean;
  };
};
