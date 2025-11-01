// shared/utils/notifications-storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationsPreferences } from '../types/notifications';

const STORAGE_KEY = '@foodlytics:notif_prefs';

export async function saveNotifPrefs(prefs: NotificationsPreferences) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export async function loadNotifPrefs(): Promise<NotificationsPreferences | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) as NotificationsPreferences : null;
}
