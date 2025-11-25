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
