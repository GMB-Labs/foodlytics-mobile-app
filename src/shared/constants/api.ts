/**
 * API base URL configuration
 */
export const API_BASE_URL = 
  (process.env.EXPO_PUBLIC_API_BASE as string) || 
  'https://foodlytics-api-production.up.railway.app';
