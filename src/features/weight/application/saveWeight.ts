import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS } from '@/src/shared/constants/storage';

export type WeightEntry = {
  dateISO: string; // YYYY-MM-DD
  valueKg: number;
  createdAt: string; // ISO timestamp
};

const STORAGE_KEY = ASYNC_STORAGE_KEYS.WEIGHTS;

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function saveWeight(entry: { dateISO: string; valueKg: number }): Promise<WeightEntry> {
  const { dateISO, valueKg } = entry;
  if (!dateISO || dateISO !== todayISO()) {
    throw new Error('saveWeight: only today is allowed');
  }

  const createdAt = new Date().toISOString();
  const toSave: WeightEntry = { dateISO, valueKg, createdAt };

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: WeightEntry[] = raw ? JSON.parse(raw) : [];

    // Replace any existing entry for the same date
    const filtered = list.filter((w) => w.dateISO !== dateISO);
    filtered.push(toSave);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return toSave;
  } catch (err) {
    console.error('saveWeight error', err);
    throw err;
  }
}

export async function getWeightByDate(dateISO: string): Promise<WeightEntry | undefined> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: WeightEntry[] = raw ? JSON.parse(raw) : [];
    return list.find((w) => w.dateISO === dateISO);
  } catch (err) {
    console.error('getWeightByDate error', err);
    return undefined;
  }
}
