import { putJSON } from '../../../shared/utils/api';
import { API_BASE_URL } from '../../../shared/constants/api';

const PROFILE_CREATION_RETRIES = 5;
const PROFILE_CREATION_DELAY_MS = 700;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  for (let attempt = 0; attempt < PROFILE_CREATION_RETRIES; attempt += 1) {
    try {
      // No pasar baseUrl porque la URL ya está completa
      return await putJSON(url, profileDto, { token: opts?.token });
    } catch (err: any) {
      const isNotFound = err?.status === 404;
      const hasRetriesLeft = attempt < PROFILE_CREATION_RETRIES - 1;
      if (isNotFound && hasRetriesLeft) {
        const waitMs = PROFILE_CREATION_DELAY_MS * (attempt + 1);
        console.warn(
          `[profileApi] Perfil aún no disponible (404). Reintentando en ${waitMs}ms...`
        );
        await sleep(waitMs);
        continue;
      }
      throw err;
    }
  }

  throw new Error('No se pudo guardar el perfil después de varios intentos');
}
