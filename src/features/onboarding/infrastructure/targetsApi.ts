import { postJSON } from '../../../shared/utils/api';

/**
 * Adapter for sending computed targets (kcal/macros/IMC) to the backend.
 */
export async function submitTargetsToServer(targetsDto: any, opts?: { baseUrl?: string; token?: string }) {
  const url = opts?.baseUrl ? `${opts.baseUrl.replace(/\/$/, '')}/targets` : 'https://api.example.com/targets';
  return postJSON(url, targetsDto, { token: opts?.token });
}
