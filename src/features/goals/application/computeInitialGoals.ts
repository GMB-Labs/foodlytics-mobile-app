/**
 * Simple initial goals calculator.
 * - Uses Mifflin-St Jeor for BMR
 * - Applies activity factor
 * - Distributes macros as proteins 30%, carbs 40%, fats 30% (by kcal)
 *
 * This is intentionally simple and should be replaced by your domain logic if
 * you have different business rules (e.g., calorie adjustment toward weight goal).
 */
export type ActivityLevel = 'sedentary'|'light'|'moderate'|'active'|'veryActive';

export function computeInitialGoals(params: {
  birthDateIso?: string; // YYYY-MM-DD
  gender?: 'male'|'female'|'other';
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevel;
}) {
  const { birthDateIso, gender = 'male', heightCm = 170, weightKg = 70, activityLevel = 'light' } = params;

  // compute age
  let age = 30;
  if (birthDateIso) {
    const b = new Date(birthDateIso);
    if (!isNaN(b.getTime())) {
      const now = new Date();
      age = now.getFullYear() - b.getFullYear();
      const m = now.getMonth() - b.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
      if (age < 0) age = 30;
    }
  }

  // BMR (Mifflin-St Jeor)
  // men: 10*w + 6.25*h - 5*age + 5
  // women: 10*w + 6.25*h - 5*age - 161
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'female' ? base - 161 : base + 5;

  const activityMap: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };

  const factor = activityMap[activityLevel] ?? 1.375;
  const kcalTarget = Math.round(bmr * factor);

  // Macro distribution: protein 30%, carbs 40%, fats 30% (by kcal)
  const proteinKcal = kcalTarget * 0.30;
  const carbsKcal = kcalTarget * 0.40;
  const fatsKcal = kcalTarget * 0.30;

  const proteinG = Math.round(proteinKcal / 4);
  const carbsG = Math.round(carbsKcal / 4);
  const fatsG = Math.round(fatsKcal / 9);

  return { kcalTarget, proteinG, carbsG, fatsG };
}
