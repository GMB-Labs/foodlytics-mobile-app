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
};
