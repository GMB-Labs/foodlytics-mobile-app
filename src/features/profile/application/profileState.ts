// Import consolidated types from shared
import { Profile, EMPTY_PROFILE } from '@/src/shared/types/profile';

// Re-export for backwards compatibility
export type { Profile } from '@/src/shared/types/profile';
export { EMPTY_PROFILE } from '@/src/shared/types/profile';

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
