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
    // today's meals
    [todayIso]: {
      breakfast: [
        { id: 'b1', name: 'Tostada integral con aguacate', protein: 6, carbs: 22, fats: 12, kcal: 210, time: '07:30' },
      ],
      lunch: [
        { id: 'l1', name: 'Pechuga de pollo', protein: 30, carbs: 0, fats: 3, kcal: 165, time: '13:00' },
      ],
      dinner: [],
      snack: [],
    },

    // yesterday's meals (different content so date switch is visible)
    [yesterdayIso]: {
      breakfast: [ { id: 'yb1', name: 'Avena con frutas', protein: 8, carbs: 45, fats: 6, kcal: 280, time: '08:15' } ],
      lunch: [],
      dinner: [ { id: 'yd1', name: 'Salmón y quinoa', protein: 28, carbs: 30, fats: 14, kcal: 360, time: '20:00' } ],
      snack: [],
    },

    // a couple of additional example dates
    '2025-11-06': {
      breakfast: [],
      lunch: [ { id: 'l20', name: 'Ensalada grande', protein: 5, carbs: 10, fats: 8, kcal: 140, time: '12:30' } ],
      dinner: [],
      snack: [],
    },
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
