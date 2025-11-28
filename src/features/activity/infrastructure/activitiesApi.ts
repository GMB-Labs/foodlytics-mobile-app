import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS } from '@/src/shared/constants/storage';

export type Activity = {
  id: string;
  name: string;
  minutes: number;
  intensity: 'Baja' | 'Moderada' | 'Alta';
  calories: number;
  dateISO?: string;
  createdAt?: string;
  startTime?: string;
  duration?: number;
  type?: string;
};

const STORAGE_KEY = ASYNC_STORAGE_KEYS.ACTIVITIES;

// This module serves as the local data layer for activities. Replace the
// placeholder with real API calls when the backend is available. The
// implementation currently prefers a remote call (commented) and falls back
// to AsyncStorage for local persistence.

export async function getActivities(): Promise<Activity[]> {
  // Example placeholder for a future API call:
  // try {
  //   const res = await fetch(`${BASE_URL}/activities`);
  //   if (res.ok) return await res.json();
  // } catch (e) {
  //   // fallback to local
  // }

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Activity[];
  } catch (e) {
    return [];
  }
}

export async function saveActivities(list: Activity[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function addActivity(item: Activity): Promise<void> {
  const list = await getActivities();
  // prepend newest
  list.unshift(item);
  await saveActivities(list);
}

export async function deleteActivityById(id: string): Promise<void> {
  const list = await getActivities();
  const updated = list.filter((a) => a.id !== id);
  await saveActivities(updated);
}

export async function updateActivity(item: Activity): Promise<void> {
  const list = await getActivities();
  const updated = list.map((a) => (a.id === item.id ? item : a));
  await saveActivities(updated);
}

export default {
  getActivities,
  saveActivities,
  addActivity,
  deleteActivityById,
  updateActivity,
  STORAGE_KEY,
};
