import { postJSON } from '../../../shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';

/**
 * Adapter for sending computed targets (kcal/macros/IMC) to the backend.
 */
export async function submitTargetsToServer(targetsDto: any, opts?: { baseUrl?: string; token?: string }) {
  const base = opts?.baseUrl || API_BASE_URL;
  const path = 'api/v1/targets';

  // Log before sending targets
  // eslint-disable-next-line no-console
  console.log('[targetsApi] submitTargetsToServer ->', `${base.replace(/\/$/, '')}/${path}`, { body: targetsDto });

  return postJSON(path, targetsDto, { token: opts?.token, baseUrl: base });
}
