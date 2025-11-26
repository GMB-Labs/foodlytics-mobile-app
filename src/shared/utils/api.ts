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

/**
 * Helper for PUT requests
 */
export async function putJSON(url: string, body: any, opts: { baseUrl?: string; token?: string } = {}) {
  // Si baseUrl está vacío o no se proporciona, usar la URL directamente
  // Si baseUrl se proporciona, construir la URL completa
  const fullUrl = opts.baseUrl && opts.baseUrl.trim() !== '' 
    ? `${opts.baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}` 
    : url;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }

  console.log('[putJSON] Realizando PUT request:', {
    url: fullUrl,
    hasToken: !!opts.token,
    bodyKeys: Object.keys(body),
  });

  const res = await fetch(fullUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  console.log('[putJSON] Respuesta del servidor:', {
    status: res.status,
    ok: res.ok,
    hasData: !!data,
    dataPreview: data && typeof data === 'object' ? Object.keys(data).slice(0, 5) : typeof data,
  });

  if (!res.ok) {
    const msg = (data && data.message) || res.statusText || 'Request failed';
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = data;
    console.error('[putJSON] Error en la respuesta:', {
      status: res.status,
      message: msg,
      body: data,
    });
    throw err;
  }

  return data;
}

/**
 * Helper for GET requests
 */
export async function getJSON(url: string, opts: { baseUrl?: string; token?: string } = {}) {
  const fullUrl = opts.baseUrl ? `${opts.baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}` : url;

  const headers: Record<string, string> = {};

  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }

  const res = await fetch(fullUrl, {
    method: 'GET',
    headers,
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