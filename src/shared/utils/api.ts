/**
 * Lightweight helper for posting JSON to your backend.
 *
 * Usage:
 *   import { postJSON } from '@/src/shared/utils/api';
 *   await postJSON('/onboarding', payload);
 *
 * Note: adapt headers (Authorization) to match your auth setup.
 */
export async function postJSON(url: string, body: any, opts: { baseUrl?: string; token?: string } = {}) {
  const fullUrl = opts.baseUrl ? `${opts.baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}` : url;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // If you use authentication, pass token in opts and uncomment the next line
  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }

  const res = await fetch(fullUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  if (!res.ok) {
    const msg = (data && data.message) || res.statusText || 'Request failed';
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}
