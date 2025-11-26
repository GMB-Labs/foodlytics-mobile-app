import { putJSON } from '../../../shared/utils/api';
import { API_BASE_URL } from '../../../shared/constants/api';

/**
 * Adapter for profile-related backend calls.
 * Uses PUT to update profile with user_id (authId)
 */
export async function submitProfileToServer(
  profileDto: any,
  opts?: { baseUrl?: string; token?: string; userId?: string }
) {
  if (!opts?.userId) {
    throw new Error('userId (authId) is required to update profile');
  }

  const baseUrl = opts?.baseUrl || API_BASE_URL;
  const url = `${baseUrl}/api/v1/profiles/${opts.userId}`;
  
  console.log('[profileApi] Enviando PUT profile al backend:', {
    url,
    payload: profileDto,
    hasToken: !!opts?.token,
  });

  // No pasar baseUrl porque la URL ya está completa
  return putJSON(url, profileDto, { token: opts?.token });
}
