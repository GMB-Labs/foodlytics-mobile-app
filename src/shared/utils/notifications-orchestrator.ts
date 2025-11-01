// shared/utils/notifications-orchestrator.ts
import { NotificationsPreferences } from '../types/notifications';
import { cancelAllScheduled, scheduleDailyAt, scheduleEveryNHours } from './notifications';

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

  // Alertas - water reminder can be periodic, deficit/excess should be triggered by app logic
  if (prefs.alerts?.water) {
    // cada 2 horas
    await scheduleEveryNHours(2, 'Recordatorio de agua', 'Bebe agua para mantenerte hidratado');
  }

  // Tips / motivational messages - schedule daily placeholders
  if (prefs.tips?.nutrition) {
    await scheduleDailyAt('09:00', 'Consejo nutricional', 'Un pequeño tip para mejorar tus hábitos');
  }
  if (prefs.tips?.exercise) {
    await scheduleDailyAt('17:00', 'Consejo de ejercicio', 'Un breve recordatorio para moverte');
  }
  if (prefs.tips?.motivational) {
    await scheduleDailyAt('08:00', 'Mensaje motivacional', 'Ánimo — hoy puedes hacerlo');
  }

  // Goals: weekly summary currently scheduled daily as a placeholder (app can trigger on specific weekday if needed)
  if (prefs.goals?.weeklySummary) {
    await scheduleDailyAt('20:00', 'Resumen semanal', 'Revisa tu progreso semanal');
  }
}
