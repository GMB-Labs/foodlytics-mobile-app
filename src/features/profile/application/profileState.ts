export type Profile = {
  name: string;
  email: string;
  avatar: string | null;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  goalWeight: number;
  activity: string;
  dailyCalories: number;
  // Calorie target breakdown from /api/v1/calorie-targets
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  calorieTargetsUpdatedAt?: string | null;
  goalType: string;
  nutritionistId: string | null;
  hasProfilePicture: boolean;
};

export const EMPTY_PROFILE: Profile = {
  name: '',
  email: '',
  avatar: null,
  age: 0,
  gender: '',
  heightCm: 0,
  weightKg: 0,
  bmi: 0,
  goalWeight: 0,
  activity: '',
  dailyCalories: 0,
  calories: 0,
  proteinGrams: 0,
  carbGrams: 0,
  fatGrams: 0,
  calorieTargetsUpdatedAt: null,
  goalType: '',
  nutritionistId: null,
  hasProfilePicture: false,
};

let currentProfile: Profile = EMPTY_PROFILE;
const listeners: Array<(p: Profile) => void> = [];

function notifyAll() {
  listeners.forEach((fn) => {
    try {
      fn(currentProfile);
    } catch (e) {
      // ignore
    }
  });
}

export function getCurrentProfile() {
  return currentProfile;
}

export function subscribeProfile(fn: (p: Profile) => void) {
  listeners.push(fn);
  // return unsubscribe
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function updateProfilePartial(partial: Partial<Profile>) {
  currentProfile = { ...currentProfile, ...partial } as Profile;
  notifyAll();
}

export function resetProfile() {
  currentProfile = EMPTY_PROFILE;
  try { notifyAll(); } catch (e) { /* ignore */ }
}
