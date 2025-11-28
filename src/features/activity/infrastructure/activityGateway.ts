import { API_BASE_URL } from '@/src/shared/constants/api';
import { getJSON } from '@/src/shared/utils/api';

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
    return;
  }
  const prefix = `${userId}::`;
  [...dailyCache.keys()].forEach((key) => { if (key.startsWith(prefix)) dailyCache.delete(key); });
  [...dailyInFlight.keys()].forEach((key) => { if (key.startsWith(prefix)) dailyInFlight.delete(key); });
  [...rangeCache.keys()].forEach((key) => { if (key.startsWith(prefix)) rangeCache.delete(key); });
  [...rangeInFlight.keys()].forEach((key) => { if (key.startsWith(prefix)) rangeInFlight.delete(key); });
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
  const existingPromise = rangeInFlight.get(key);
  if (!opts.force && existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    const baseUrl = buildBaseUrl(opts.baseUrl);
    const qs = `?start_date=${encodeURIComponent(opts.startDate)}&end_date=${encodeURIComponent(opts.endDate)}`;
    const url = `/api/v1/physical-activity/${encodeURIComponent(opts.userId)}/range${qs}`;
    const data = await getJSON(url, { baseUrl, token: opts.token });
    const normalized = Array.isArray(data)
      ? (data.map((item) => normalizeDayPayload(item)).filter(Boolean) as PhysicalActivityDay[])
      : [];
    rangeCache.set(key, { value: normalized, fetchedAt: Date.now() });
    normalized.forEach((entry) => primeDailyActivityCache(entry));
    return normalized;
  })().finally(() => {
    rangeInFlight.delete(key);
  });

  rangeInFlight.set(key, promise);
  return promise;
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
