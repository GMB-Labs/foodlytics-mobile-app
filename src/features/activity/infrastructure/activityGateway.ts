import { API_BASE_URL } from '@/src/shared/constants/api';
import { getJSON } from '@/src/shared/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RemoteActivity = {
  id: string;
  activity_type: string;
  duration_minutes: number;
  intensity: string;
  calories_burned: number;
};

export type PhysicalActivityDay = {
  id: string;
  user_id: string;
  day: string; // YYYY-MM-DD
  activities: RemoteActivity[];
  activity_burned: number;
  net_calories: number;
  status?: string | null;
};

export type FetchDailyPhysicalActivityOpts = {
  userId: string;
  date: string; // YYYY-MM-DD
  token?: string;
  baseUrl?: string;
  force?: boolean;
};

export type FetchRangePhysicalActivityOpts = {
  userId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  token?: string;
  baseUrl?: string;
  force?: boolean;
};

type CacheEntry<T> = { value: T; fetchedAt: number };

const TTL_MS = 60 * 1000; // 1 minute cache for now

const dailyCache = new Map<string, CacheEntry<PhysicalActivityDay | null>>();
const dailyInFlight = new Map<string, Promise<PhysicalActivityDay | null>>();
const rangeCache = new Map<string, CacheEntry<PhysicalActivityDay[]>>();
const rangeInFlight = new Map<string, Promise<PhysicalActivityDay[]>>();
const PERSIST_PREFIX = '@foodlytics:activity-range:';

function buildBaseUrl(baseUrl?: string) {
  const base = (baseUrl && baseUrl.trim().length > 0 ? baseUrl : API_BASE_URL) || '';
  return base.replace(/\/$/, '');
}

function makeDayKey(userId: string, date: string) {
  return `${userId}::${date}`;
}

function makeRangeKey(userId: string, start: string, end: string) {
  return `${userId}::${start}::${end}`;
}

export function primeDailyActivityCache(entry: PhysicalActivityDay | null) {
  if (!entry) return;
  const key = makeDayKey(entry.user_id, entry.day);
  dailyCache.set(key, { value: entry, fetchedAt: Date.now() });
  // also patch range caches that contain this day
  rangeCache.forEach((cacheEntry, cacheKey) => {
    const [user, start, end] = cacheKey.split('::');
    if (user !== entry.user_id) return;
    if (entry.day < start || entry.day > end) return;
    const list = cacheEntry.value ?? [];
    const idx = list.findIndex((it) => it.day === entry.day);
    const updated = idx >= 0 ? [...list.slice(0, idx), entry, ...list.slice(idx + 1)] : [...list, entry];
    rangeCache.set(cacheKey, { value: updated, fetchedAt: cacheEntry.fetchedAt });
  });
}

export function clearPhysicalActivityCache(userId?: string) {
  if (!userId) {
    dailyCache.clear();
    dailyInFlight.clear();
    rangeCache.clear();
    rangeInFlight.clear();
    // clear persisted ranges
    try {
      AsyncStorage.getAllKeys()
        .then((keys) => keys.filter((k) => k.startsWith(PERSIST_PREFIX)))
        .then((ks) => { if (ks.length) AsyncStorage.multiRemove(ks); })
        .catch(() => {});
    } catch (e) {
      // ignore
    }
    return;
  }
  const prefix = `${userId}::`;
  [...dailyCache.keys()].forEach((key) => { if (key.startsWith(prefix)) dailyCache.delete(key); });
  [...dailyInFlight.keys()].forEach((key) => { if (key.startsWith(prefix)) dailyInFlight.delete(key); });
  [...rangeCache.keys()].forEach((key) => { if (key.startsWith(prefix)) rangeCache.delete(key); });
  [...rangeInFlight.keys()].forEach((key) => { if (key.startsWith(prefix)) rangeInFlight.delete(key); });
  // remove persisted entries for this user
  try {
    AsyncStorage.getAllKeys()
      .then((keys) => keys.filter((k) => k.startsWith(PERSIST_PREFIX + userId)))
      .then((ks) => { if (ks.length) AsyncStorage.multiRemove(ks); })
      .catch(() => {});
  } catch (e) {
    // ignore
  }
}

export async function fetchDailyPhysicalActivity(opts: FetchDailyPhysicalActivityOpts): Promise<PhysicalActivityDay | null> {
  const key = makeDayKey(opts.userId, opts.date);
  const now = Date.now();
  const cached = dailyCache.get(key);
  if (!opts.force && cached && now - cached.fetchedAt < TTL_MS) {
    return cached.value;
  }
  const existingPromise = dailyInFlight.get(key);
  if (!opts.force && existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    const baseUrl = buildBaseUrl(opts.baseUrl);
    const url = `/api/v1/physical-activity/${encodeURIComponent(opts.userId)}?date=${encodeURIComponent(opts.date)}`;
    try {
      const data = await getJSON(url, { baseUrl, token: opts.token });
      const normalized = normalizeDayPayload(data);
      dailyCache.set(key, { value: normalized, fetchedAt: Date.now() });
      if (normalized) primeDailyActivityCache(normalized);
      return normalized;
    } catch (err) {
      // on 404 treat as empty day, otherwise surface error
      if ((err as any)?.status === 404) {
        dailyCache.set(key, { value: null, fetchedAt: Date.now() });
        return null;
      }
      throw err;
    }
  })()
    .finally(() => {
      dailyInFlight.delete(key);
    });

  dailyInFlight.set(key, promise);
  return promise;
}

export async function fetchPhysicalActivityRange(opts: FetchRangePhysicalActivityOpts): Promise<PhysicalActivityDay[]> {
  const key = makeRangeKey(opts.userId, opts.startDate, opts.endDate);
  const now = Date.now();
  const cached = rangeCache.get(key);
  if (!opts.force && cached && now - cached.fetchedAt < TTL_MS) {
    return cached.value;
  }
  // Try persisted cache if in-memory cache is empty and not forcing
  if (!opts.force && !cached) {
    try {
      const raw = await AsyncStorage.getItem(`${PERSIST_PREFIX}${key}`);
      if (raw) {
        const obj = JSON.parse(raw) as CacheEntry<PhysicalActivityDay[]>;
        if (obj && now - obj.fetchedAt < TTL_MS) {
          rangeCache.set(key, obj);
          return obj.value;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  const existingPromise = rangeInFlight.get(key);
  if (!opts.force && existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    const baseUrl = buildBaseUrl(opts.baseUrl);
    const qs = `?start_date=${encodeURIComponent(opts.startDate)}&end_date=${encodeURIComponent(opts.endDate)}`;
    const url = `/api/v1/physical-activity/${encodeURIComponent(opts.userId)}/range${qs}`;
    const data = await getJSON(url, { baseUrl, token: opts.token });

    // New API shape: { user_id, start_date, end_date, days: [{ day, activity_count }] }
    // Old API shape: array of day objects similar to PhysicalActivityDay
    let normalized: PhysicalActivityDay[] = [];
    if (data && Array.isArray(data)) {
      normalized = data.map((item) => normalizeDayPayload(item)).filter(Boolean) as PhysicalActivityDay[];
    } else if (data && Array.isArray((data as any).days)) {
      const userId = String((data as any).user_id ?? opts.userId ?? '');
      normalized = (data as any).days.map((d: any) => {
        const dayISO = String(d.day ?? '');
        const count = Number(d.activity_count ?? 0) || 0;
        // create placeholder activities to preserve counts for consumers of this function
        const activities = Array.from({ length: count }).map((_, i) => ({
          id: `${dayISO}-${i}`,
          activity_type: 'Actividad',
          duration_minutes: 0,
          intensity: 'Moderada',
          calories_burned: 0,
        }));
        return {
          id: `${userId ?? 'u'}-${dayISO}`,
          user_id: userId,
          day: dayISO,
          activities,
          activity_burned: 0,
          net_calories: 0,
        } as PhysicalActivityDay;
      });
    } else {
      normalized = [];
    }
    rangeCache.set(key, { value: normalized, fetchedAt: Date.now() });
    try {
      await AsyncStorage.setItem(`${PERSIST_PREFIX}${key}`, JSON.stringify({ value: normalized, fetchedAt: Date.now() }));
    } catch (e) {
      // ignore persistence failures
    }
    normalized.forEach((entry) => primeDailyActivityCache(entry));
    return normalized;
  })().finally(() => {
    rangeInFlight.delete(key);
  });

  rangeInFlight.set(key, promise);
  return promise;
}

export type DeletePhysicalActivityOpts = { token?: string; baseUrl?: string; userId?: string };

export async function deletePhysicalActivityById(activityId: string, opts: DeletePhysicalActivityOpts = {}): Promise<void> {
  const baseUrl = buildBaseUrl(opts.baseUrl);
  const url = `/api/v1/physical-activity/by-id/${encodeURIComponent(activityId)}`;
  const fullUrl = baseUrl ? `${baseUrl}/${url.replace(/^\//, '')}` : url;
  const headers: Record<string, string> = {};
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;

  const res = await fetch(fullUrl, { method: 'DELETE', headers });
  if (!res.ok) {
    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { /* ignore */ }
    const msg = (data && data.message) || res.statusText || 'Request failed';
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  // invalidate relevant caches to ensure next reads come from server
  try {
    if (opts.userId) clearPhysicalActivityCache(opts.userId);
    else clearPhysicalActivityCache();
  } catch (e) {
    // ignore
  }
}

function normalizeDayPayload(input: any): PhysicalActivityDay | null {
  if (!input) return null;
  try {
    const activities = Array.isArray(input.activities)
      ? input.activities.map((act: any) => ({
          id: String(act.id ?? ''),
          activity_type: String(act.activity_type ?? act.name ?? 'Actividad'),
          duration_minutes: Number(act.duration_minutes ?? act.minutes ?? 0) || 0,
          intensity: String(act.intensity ?? 'Moderada'),
          calories_burned: Number(act.calories_burned ?? act.calories ?? 0) || 0,
        }))
      : [];

    return {
      id: String(input.id ?? `${input.user_id ?? 'temp'}-${input.day ?? ''}`),
      user_id: String(input.user_id ?? ''),
      day: String(input.day ?? input.date ?? ''),
      activities,
      activity_burned: Number(input.activity_burned ?? input.total_calories ?? 0) || 0,
      net_calories: Number(input.net_calories ?? 0) || 0,
      status: input.status ?? null,
    };
  } catch (err) {
    return null;
  }
}
