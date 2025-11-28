// Single GET meals API stub. Returns all meals grouped by date and meal type.
// The client is expected to filter by date/meal type locally.

export type DetectedItem = {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  kcal: number;
  time?: string;
  qtyLabel?: string;
};

export type AllMealsResponse = Record<string, Record<string, DetectedItem[]>>;

// Replace this with a single backend endpoint (GET /meals or similar) that
// returns meals grouped by date. For now we return a small static map so the
// app can fetch once and then filter client-side.
export async function getAllMeals(): Promise<AllMealsResponse> {
  // In a real integration you'd fetch from your backend here:
  // const res = await fetch(`${BASE_URL}/meals/all`);
  // return await res.json();

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const yesterdayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const payload: AllMealsResponse = {

  };

  // simulate a small delay to mimic network
  await new Promise((r) => setTimeout(r, 120));
  return payload;
}

// Backwards-compatible helpers (optional) --------------------------------------------------
export async function getMealsByDate(dateISO: string) {
  const all = await getAllMeals();
  return all[dateISO] ?? { breakfast: [], lunch: [], dinner: [], snack: [] };
}

export async function getMealDetails(mealId: string, dateISO: string) {
  const all = await getAllMeals();
  const items = (all[dateISO] && all[dateISO][mealId]) ? all[dateISO][mealId] : [];
  const totals = items.reduce((acc, it) => ({ protein: acc.protein + it.protein, carbs: acc.carbs + it.carbs, fats: acc.fats + it.fats, kcal: acc.kcal + it.kcal }), { protein: 0, carbs: 0, fats: 0, kcal: 0 });
  return { mealId, dateISO, items, totals };
}

// New: fetch meals from backend API for a specific day and user
import { getJSON } from '@/src/shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';

export type RawMealItem = {
  id: string;
  name: string;
  patient_id: string;
  meal_t: string; // e.g. 'Desayuno', 'Almuerzo', 'Cena'
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  uploaded_at?: string;
};

export async function getMealsForDayFromServer(dayISO: string, userId?: string, token?: string): Promise<RawMealItem[]> {
  try {
    const qs = `?day=${encodeURIComponent(dayISO)}${userId ? `&user_id=${encodeURIComponent(userId)}` : ''}`;
    const url = `${API_BASE_URL}/api/v1/meals${qs}`;
    const data = await getJSON(url, { token });
    // Expecting an array or fallback to empty
    if (Array.isArray(data)) return data as RawMealItem[];
    return [];
  } catch (err) {
    // On error, return empty so caller can fallback to stubbed data
    console.error('[mealsApi] getMealsForDayFromServer error', err);
    return [];
  }
}

// Lightweight pub/sub so UI can react to meal additions without reloading entire screens.
type MealsChangedPayload = { patientId?: string; day?: string };
const mealsChangedSubscribers = new Set<(p: MealsChangedPayload) => void>();

export function subscribeMealsChanged(cb: (p: MealsChangedPayload) => void) {
  mealsChangedSubscribers.add(cb);
  return () => { mealsChangedSubscribers.delete(cb); };
}

export function notifyMealsChanged(payload: MealsChangedPayload = {}) {
  try {
    mealsChangedSubscribers.forEach((cb) => {
      try { cb(payload); } catch (e) { /* ignore subscriber errors */ }
    });
  } catch (e) {
    // ignore
  }
}
