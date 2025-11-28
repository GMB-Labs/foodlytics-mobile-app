// shared/utils/notifications-storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationsPreferences } from '../types/notifications';
import { ASYNC_STORAGE_KEYS } from '@/src/shared/constants/storage';

const STORAGE_KEY = ASYNC_STORAGE_KEYS.NOTIFICATION_PREFS;

export async function saveNotifPrefs(prefs: NotificationsPreferences) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export async function loadNotifPrefs(): Promise<NotificationsPreferences | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) as NotificationsPreferences : null;
}
