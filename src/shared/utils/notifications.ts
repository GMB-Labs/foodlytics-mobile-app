// shared/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';

export type LocalPermission = 'granted' | 'denied' | 'undetermined';

export async function configureNotificationHandlerOnce() {
  // seguro de llamar en _layout o App una sola vez, no pide permisos
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function getPermissionStatus(): Promise<LocalPermission> {
  const perm = await Notifications.getPermissionsAsync();
  if (perm.granted) return 'granted';
  return perm.canAskAgain ? 'undetermined' : 'denied';
}

export async function requestPermissionIfNeeded(): Promise<LocalPermission> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (current.canAskAgain) {
    const asked = await Notifications.requestPermissionsAsync();
    if (asked.granted) return 'granted';
    return asked.canAskAgain ? 'undetermined' : 'denied';
  }
  return 'denied';
}

// HH:MM -> hour, minute
export function parseTimeStr(t: string) {
  const [h, m] = t.split(':').map(Number);
  return { hour: h, minute: m };
}

export async function scheduleDailyAt(time: string, title: string, body?: string) {
  const { hour, minute } = parseTimeStr(time);
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { hour, minute, repeats: true } as Notifications.NotificationTriggerInput,
  });
}

export async function scheduleEveryNHours(hours: number, title: string, body?: string) {
  // scheduleNotificationAsync supports a trigger with seconds and repeats
  const seconds = Math.max(1, Math.floor(hours * 3600));
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds, repeats: true } as Notifications.NotificationTriggerInput,
  });
}

export async function scheduleIn(seconds: number, title: string, body?: string) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds, repeats: false } as Notifications.NotificationTriggerInput,
  });
}

export async function cancelAllScheduled() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function openSystemSettingsWithAlert() {
  Alert.alert(
    'Permisos',
    'Las notificaciones están desactivadas en el sistema. ¿Deseas abrir Ajustes?',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
    ]
  );
}
