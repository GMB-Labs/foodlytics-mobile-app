export type Gender = 'male' | 'female' | 'other' | 'M' | 'F' | 'O';
export type GoalType = 'definition' | 'maintenance' | 'bulking' | 'DEFINITION' | 'MAINTENANCE' | 'BULKING';
export type ActivityLevel = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo' | 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export function calculateTargetsFromProfile(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  goalType?: GoalType | null;
  activityLevel?: ActivityLevel | null;
}) {
  const { weightKg, heightCm, age, gender, goalType, activityLevel } = params;

  if (!weightKg || !heightCm || !age) {
    throw new Error('Weight, height and age must be greater than zero.');
  }

  // Gender term mapping
  let genderTerm = -78; // other/default
  const g = String(gender).toLowerCase();
  if (g === 'male' || g === 'm') genderTerm = 5;
  else if (g === 'female' || g === 'f') genderTerm = -161;

  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + genderTerm;

  // activity multiplier mapping
  const al = String(activityLevel || '').toLowerCase();
  let activity_multiplier = 1.2;
  if (al === 'ligero' || al === 'light') activity_multiplier = 1.375;
  else if (al === 'moderado' || al === 'active' || al === 'activo' || al === 'moderate') activity_multiplier = 1.55;
  else if (al === 'muy_activo' || al === 'very_active') activity_multiplier = 1.725;

  const tdee = bmr * activity_multiplier;

  // goal multiplier
  const gt = String(goalType || '').toLowerCase();
  let goal_multiplier = 1.0;
  if (gt === 'bulking') goal_multiplier = 1.1;
  else if (gt === 'definition') goal_multiplier = 0.9;

  const calories = Math.round(tdee * goal_multiplier);
  const protein = Math.round(weightKg * 1.6);
  const fat = Math.round(weightKg * 0.9);
  const remaining_kcal = Math.max(0, calories - (protein * 4 + fat * 9));
  const carbs = Math.round(remaining_kcal / 4);

  return {
    kcalTarget: calories,
    proteinG: protein,
    carbsG: carbs,
    fatsG: fat,
  };
}

export default calculateTargetsFromProfile;
