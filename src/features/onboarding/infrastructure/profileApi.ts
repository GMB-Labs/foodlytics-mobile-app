import { postJSON } from '../../../shared/utils/api';

/**
 * Adapter for profile-related backend calls.
 */
export async function submitProfileToServer(profileDto: any, opts?: { baseUrl?: string; token?: string }) {
  const url = opts?.baseUrl ? `${opts.baseUrl.replace(/\/$/, '')}/profile` : 'https://api.example.com/profile';
  return postJSON(url, profileDto, { token: opts?.token });
}
