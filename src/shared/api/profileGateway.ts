import { encode as base64Encode } from 'base-64';
import { API_BASE_URL } from '@/src/shared/constants/api';
import { getJSON, postJSON } from '@/src/shared/utils/api';
import type { ProfileDto } from '@/src/shared/types/profile';

// Re-export ProfileDto for backwards compatibility
export type { ProfileDto } from '@/src/shared/types/profile';

type ProfileFetchOpts = {
  userId: string;
  token?: string;
  baseUrl?: string;
  force?: boolean;
};

type RedeemCodeOpts = {
  patientId: string;
  code: string;
  token?: string;
  baseUrl?: string;
};

type PictureOpts = {
  userId: string;
  token?: string;
  baseUrl?: string;
  force?: boolean;
};

type UploadPictureOpts = PictureOpts & {
  uri: string;
  mimeType?: string;
  fileName?: string;
};

type CacheEntry<T> = { value: T; fetchedAt: number };

const PROFILE_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const PICTURE_CACHE_TTL_MS = 5 * 60 * 1000; // pictures change less frequently

const profileCache = new Map<string, CacheEntry<ProfileDto | null>>();
const profileInFlight = new Map<string, Promise<ProfileDto | null>>();
const pictureCache = new Map<string, CacheEntry<string | null>>();
const pictureInFlight = new Map<string, Promise<string | null>>();
const calorieCache = new Map<string, CacheEntry<any>>();
const calorieInFlight = new Map<string, Promise<any>>();
const dailySummaryCache = new Map<string, CacheEntry<any>>();
const dailySummaryInFlight = new Map<string, Promise<any>>();

function buildUrl(path: string, baseUrl?: string) {
  const base = (baseUrl || API_BASE_URL).replace(/\/$/, '');
  if (path.startsWith('http')) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getCachedProfileDto(userId: string) {
  return profileCache.get(userId)?.value ?? null;
}

export function primeProfileCache(userId: string, dto: ProfileDto | null) {
  profileCache.set(userId, { value: dto, fetchedAt: Date.now() });
}

export function invalidateProfileCache(userId: string) {
  profileCache.delete(userId);
}

export async function fetchProfileCached(opts: ProfileFetchOpts): Promise<ProfileDto | null> {
  const { userId, force } = opts;
  const cacheEntry = profileCache.get(userId);
  const now = Date.now();

  if (!force && cacheEntry && now - cacheEntry.fetchedAt < PROFILE_CACHE_TTL_MS) {
    return cacheEntry.value;
  }

  const existingPromise = profileInFlight.get(userId);
  if (!force && existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    const url = buildUrl(`/api/v1/profiles/${userId}`, opts.baseUrl);
    const data = await getJSON(url, { baseUrl: '', token: opts.token });
    profileCache.set(userId, { value: data, fetchedAt: Date.now() });
    return data;
  })().finally(() => {
    profileInFlight.delete(userId);
  });

  profileInFlight.set(userId, promise);
  return promise;
}

export async function redeemNutritionistInvite(opts: RedeemCodeOpts) {
  const url = buildUrl('/api/v1/profiles/redeem-invite', opts.baseUrl);
  const payload = {
    patient_id: opts.patientId,
    code: opts.code,
  };
  const response = await postJSON(url, payload, { baseUrl: '', token: opts.token });
  primeProfileCache(opts.patientId, response);
  invalidateProfilePictureCache(opts.patientId);
  return response as ProfileDto;
}

export function invalidateProfilePictureCache(userId: string) {
  pictureCache.delete(userId);
}

export async function fetchProfilePictureCached(opts: PictureOpts): Promise<string | null> {
  const { userId, force } = opts;
  const cacheEntry = pictureCache.get(userId);
  const now = Date.now();

  if (!force && cacheEntry && now - cacheEntry.fetchedAt < PICTURE_CACHE_TTL_MS) {
    return cacheEntry.value;
  }

  const existingPromise = pictureInFlight.get(userId);
  if (!force && existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    const url = buildUrl(`/api/v1/profiles/${userId}/picture`, opts.baseUrl);
    const res = await fetch(url, {
      method: 'GET',
      headers: opts.token ? { Authorization: `Bearer ${opts.token}` } : undefined,
    });

    if (!res.ok) {
      pictureCache.set(userId, { value: null, fetchedAt: Date.now() });
      throw createHttpError(res, 'No se pudo obtener la foto de perfil');
    }

    const contentType = res.headers.get('content-type') || '';
    let uri: string | null = null;

    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (typeof data === 'string') {
        uri = data;
      } else if (data?.url) {
        uri = String(data.url);
      } else if (data?.profile_picture_url) {
        uri = String(data.profile_picture_url);
      }
    } else {
      const buffer = await res.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      if (base64) {
        const mime = contentType || 'image/jpeg';
        uri = `data:${mime};base64,${base64}`;
      }
    }

    pictureCache.set(userId, { value: uri, fetchedAt: Date.now() });
    return uri;
  })().finally(() => {
    pictureInFlight.delete(userId);
  });

  pictureInFlight.set(userId, promise);
  return promise;
}

export async function fetchCalorieTargetsCached(opts: { patientId: string; token?: string; baseUrl?: string; force?: boolean }) {
  const { patientId, force } = opts;
  const cacheEntry = calorieCache.get(patientId);
  const now = Date.now();

  if (!force && cacheEntry && now - cacheEntry.fetchedAt < PROFILE_CACHE_TTL_MS) {
    return cacheEntry.value;
  }

  const existingPromise = calorieInFlight.get(patientId);
  if (!force && existingPromise) return existingPromise;

  const promise = (async () => {
    const url = buildUrl(`/api/v1/calorie-targets/${patientId}`, opts.baseUrl);
    let data: any = null;
    try {
      data = await getJSON(url, { baseUrl: '', token: opts.token });
    } catch (err: any) {
      try {
        console.error('[profileGateway] fetchCalorieTargetsCached error', {
          url,
          hasToken: !!opts.token,
          message: err?.message,
          status: err?.status,
          body: err?.body,
        });
      } catch (e) {
        // ignore
      }
      throw err;
    }
    calorieCache.set(patientId, { value: data, fetchedAt: Date.now() });
    return data;
  })().finally(() => {
    calorieInFlight.delete(patientId);
  });

  calorieInFlight.set(patientId, promise);
  return promise;
}

export async function fetchDailySummaryCached(opts: { patientId: string; day?: string; token?: string; baseUrl?: string; force?: boolean }) {
  const { patientId, day, force } = opts;
  const key = `${patientId}::${day ?? 'default'}`;
  const cacheEntry = dailySummaryCache.get(key);
  const now = Date.now();

  if (!force && cacheEntry && now - cacheEntry.fetchedAt < PROFILE_CACHE_TTL_MS) {
    return cacheEntry.value;
  }

  const existingPromise = dailySummaryInFlight.get(key);
  if (!force && existingPromise) return existingPromise;

  const promise = (async () => {
    const base = opts.baseUrl ?? undefined;
    const url = buildUrl(`/api/v1/calorie-targets/${patientId}/daily-summary${day ? `?day=${encodeURIComponent(day)}` : ''}`, base);
    const data = await getJSON(url, { baseUrl: '', token: opts.token });
    dailySummaryCache.set(key, { value: data, fetchedAt: Date.now() });
    return data;
  })().finally(() => {
    dailySummaryInFlight.delete(key);
  });

  dailySummaryInFlight.set(key, promise);
  return promise;
}

export async function uploadProfilePicture(opts: UploadPictureOpts) {
  const url = buildUrl(`/api/v1/profiles/${opts.userId}/picture`, opts.baseUrl);
  const form = new FormData();
  const fileName = opts.fileName || `profile-${Date.now()}.jpg`;
  const mimeType = opts.mimeType || 'image/jpeg';

  // The backend expects the uploaded file under the `file` field
  form.append('file', {
    uri: opts.uri,
    name: fileName,
    type: mimeType,
  } as any);

  const headers: Record<string, string> = {};
  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: form,
  });

  if (!res.ok) {
    throw createHttpError(res, 'No se pudo actualizar la foto de perfil');
  }

  invalidateProfilePictureCache(opts.userId);
  invalidateProfileCache(opts.userId);

  try {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return null;
  }
}

type UpdateProfileOpts = {
  userId: string;
  payload: Record<string, any>;
  token?: string;
  baseUrl?: string;
};

export async function updateProfile(opts: UpdateProfileOpts) {
  const url = buildUrl(`/api/v1/profiles/${opts.userId}`, opts.baseUrl);
  try {
    // eslint-disable-next-line no-console
    console.log('[profileGateway] PUT', url, 'payload:', opts.payload ? opts.payload : '(empty)');
  } catch (e) {}
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(opts.payload),
  });

  if (!res.ok) {
    // try to capture server body for debugging
    let bodyText: string | null = null;
    try {
      bodyText = await res.text();
    } catch (e) {
      bodyText = null;
    }
    try {
      // eslint-disable-next-line no-console
      console.error('[profileGateway] updateProfile failed', { status: res.status, statusText: res.statusText, body: bodyText });
    } catch (e) {}
    throw createHttpError(res, 'No se pudo actualizar el perfil');
  }

  const data = await res.json();
  try {
    // eslint-disable-next-line no-console
    console.log('[profileGateway] updateProfile success', { url, data });
  } catch (e) {}
  // prime cache with returned DTO
  primeProfileCache(opts.userId, data);
  invalidateProfilePictureCache(opts.userId);
  return data as ProfileDto;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return binary ? base64Encode(binary) : null;
}

function createHttpError(res: Response, fallbackMessage: string) {
  const err: any = new Error(fallbackMessage);
  err.status = res.status;
  err.statusText = res.statusText;
  return err;
}
