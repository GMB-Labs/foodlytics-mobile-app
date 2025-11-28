/**
 * Auth0 configuration
 * Uses environment variables for security and flexibility between environments
 */
export const AUTH0_CONFIG = {
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN || 'dev-ydl81668b887kqqx.us.auth0.com',
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || 'kNXBPgHkHo7nYCOHUOgOFxnOt27C353y',
  audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE || 'https://foodlytics/api/v1/auth',
  scheme: 'foodlytics',
  callbackPath: 'callback',
  logoutCallbackPath: 'callback-logout',
} as const;

/**
 * Build Auth0 authorization endpoint URL
 */
export function getAuthorizationEndpoint() {
  return `https://${AUTH0_CONFIG.domain}/authorize`;
}

/**
 * Build Auth0 token endpoint URL
 */
export function getTokenEndpoint() {
  return `https://${AUTH0_CONFIG.domain}/oauth/token`;
}

/**
 * Build Auth0 logout URL with return redirect
 */
export function getLogoutUrl(returnTo: string) {
  return `https://${AUTH0_CONFIG.domain}/v2/logout?client_id=${AUTH0_CONFIG.clientId}&returnTo=${encodeURIComponent(returnTo)}`;
}

