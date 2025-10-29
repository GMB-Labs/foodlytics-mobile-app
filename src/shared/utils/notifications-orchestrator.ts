// shared/utils/notifications-orchestrator.ts
import { NotificationsPreferences } from '../types/notifications';
import { cancelAllScheduled, scheduleDailyAt } from './notifications';

export async function scheduleFromPrefs(prefs: NotificationsPreferences) {
  // Limpia para evitar duplicados
  await cancelAllScheduled();

  // Resumen diario
  if (prefs.dailySummary) {
    await scheduleDailyAt('20:00', 'Resumen diario', 'Revisa tus calorías y actividad de hoy');
  }

  // Sugerencias de actividad
  if (prefs.activitySuggestions) {
    await scheduleDailyAt('11:00', 'Sugerencia de actividad', 'Camina y estira unos minutos');
    await scheduleDailyAt('16:00', 'Sugerencia de actividad', 'Muévete un poco, te hará bien');
  }

  // Comidas
  const mr = prefs.mealReminders;
  if (mr.breakfast.enabled && mr.breakfast.time) {
    await scheduleDailyAt(mr.breakfast.time, 'Desayuno', 'Planifica tu desayuno saludable');
  }
  if (mr.lunch.enabled && mr.lunch.time) {
    await scheduleDailyAt(mr.lunch.time, 'Almuerzo', 'Es hora de tu almuerzo');
  }
  if (mr.dinner.enabled && mr.dinner.time) {
    await scheduleDailyAt(mr.dinner.time, 'Cena', 'No olvides tu cena');
  }
}
