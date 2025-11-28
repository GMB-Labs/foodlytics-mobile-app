/**
 * Unified storage keys for AsyncStorage and SecureStore
 * 
 * Convention:
 * - SecureStore keys use underscores (no special chars): foodlytics_*
 * - AsyncStorage keys use dots for namespacing: foodlytics.*
 */

// SecureStore keys (tokens - sensitive data)
// Must contain ONLY: letters, numbers, ".", "-" and "_"
export const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'foodlytics_access_token',
  ID_TOKEN: 'foodlytics_id_token',
  REFRESH_TOKEN: 'foodlytics_refresh_token',
} as const;

// AsyncStorage keys (non-sensitive data)
export const ASYNC_STORAGE_KEYS = {
  // Session data
  SESSION: 'foodlytics_session',
  
  // User preferences
  THEME: '@foodlytics:theme',
  LANGUAGE: '@foodlytics:language',
  NOTIFICATION_PREFS: '@foodlytics:notif_prefs',
  
  // Local data
  ACTIVITIES: '@foodlytics:activities',
  WEIGHTS: '@foodlytics:weights',
} as const;

// Type helpers
export type SecureStoreKey = typeof SECURE_STORE_KEYS[keyof typeof SECURE_STORE_KEYS];
export type AsyncStorageKey = typeof ASYNC_STORAGE_KEYS[keyof typeof ASYNC_STORAGE_KEYS];

