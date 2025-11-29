import { useEffect, useMemo, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getJSON, postJSON, putJSON } from '@/src/shared/utils/api';
import { API_BASE_URL } from '@/src/shared/constants/api';
import useSteps from '@/src/shared/hooks/useSteps';
import useProfile from '@/src/features/profile/application/useProfile';
import useSession from '@/src/shared/hooks/useSession';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';

export type StepsSummary = {
  steps: number; // effectiveSteps
  goal: number;
  distanceKm: number;
  caloriesBurned: number; // prefers backend
  syncing: boolean;
  lastStepISO?: string | null;
};

const canonicalActivityMap: Record<string, number> = {
  sedentary: 3000,
  light: 4000,
  moderate: 5000,
  active: 6000,
  very_active: 7000,
};

function normalizeActivity(raw?: string | null) {
  if (!raw) return '';
  const s = String(raw).toLowerCase().trim();
  // normalize accents and spaces
  const normalized = s
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');

  // map common spanish/english variants to canonical keys
  if (['sedentario', 'sedentary'].includes(normalized)) return 'sedentary';
  if (['ligero', 'light'].includes(normalized)) return 'light';
  if (['moderado', 'moderate'].includes(normalized)) return 'moderate';
  if (['activo', 'active'].includes(normalized)) return 'active';
  if (['muy_activo', 'muy_activo', 'muyactivo', 'muy_activo', 'muy activo', 'very_active', 'very active', 'veryactive'].includes(normalized)) return 'very_active';
  // fallback: if already a canonical key, return it
  if (Object.keys(canonicalActivityMap).includes(normalized)) return normalized;
  return '';
}

export default function useStepsSummary(): StepsSummary {
  const { steps: sensorSteps, lastStepISO, available } = useSteps();
  const { profile } = useProfile();
  const [sessionState] = useSession();
  const token = sessionState?.accessToken;
  const userId = sessionState?.sub;
  const todayISO = useTodayISO();

  const goal = useMemo(() => {
    const raw = profile?.activity ?? '';
    const key = normalizeActivity(raw as any);
    if (!key) return 10000;
    return canonicalActivityMap[key] ?? 10000;
  }, [profile?.activity]);

  const stepLengthCm = useMemo(() => (profile?.heightCm ? profile.heightCm * 0.415 : 70), [profile?.heightCm]);

  const [serverSteps, setServerSteps] = useState<number | null>(null);
  const [backendBurn, setBackendBurn] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const lastSyncedRef = useRef<number>(0);
  const createdRef = useRef<boolean>(false);

  const storageKey = userId ? `@foodlytics:steps-sync:${userId}:${todayISO}` : null;

  // load persisted sync state
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!storageKey) return;
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!mounted) return;
        lastSyncedRef.current = Number(parsed.lastSyncedSteps) || 0;
        createdRef.current = !!parsed.hasCreatedEntryForToday;
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [storageKey]);

  // fetch server steps for today on mount
  useEffect(() => {
    let mounted = true;
    async function fetchServer() {
      if (!userId) return;
      try {
        const url = `/api/v1/physical-activity/${userId}/steps?date=${encodeURIComponent(todayISO)}`;
        const res: any = await getJSON(url, { baseUrl: API_BASE_URL, token: token ?? undefined });
        if (!mounted) return;
        // normalize server response
        let s = null as number | null;
        if (typeof res === 'number') s = res;
        else if (res && typeof res.steps === 'number') s = res.steps;
        else if (Array.isArray(res) && typeof res[0]?.steps === 'number') s = res[0].steps;
        if (s !== null) setServerSteps(s);
        // if server also contains burned calories
        const possibleBurn = res?.activity_burned || res?.calories_burned || res?.burned_calories || res?.activity_burned_kcal;
        if (typeof possibleBurn === 'number') setBackendBurn(possibleBurn);
      } catch (e) {
        // ignore
      }
    }
    fetchServer();
    return () => { mounted = false; };
  }, [userId, todayISO, token]);

  // effective steps = max(sensorSteps, serverSteps)
  const effectiveSteps = Math.max(sensorSteps || 0, serverSteps || 0);

  const distanceKm = useMemo(() => {
    const strideMeters = stepLengthCm / 100;
    return (effectiveSteps * strideMeters) / 1000;
  }, [effectiveSteps, stepLengthCm]);

  // Persist helper
  const persistSyncState = async (stepsNum: number, created: boolean) => {
    if (!storageKey) return;
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify({ lastSyncedSteps: stepsNum, hasCreatedEntryForToday: !!created }));
    } catch (e) {
      // ignore
    }
  };

  // helper to extract burned calories from backend response
  const extractBurned = (res: any) => {
    if (!res) return null;
    return res.activity_burned ?? res.calories_burned ?? res.burned_calories ?? res.activity_burned_kcal ?? null;
  };

  // debounce and sync logic: when effectiveSteps increases enough
  useEffect(() => {
    let mounted = true;
    let timer: any = null;
    const attemptSync = async () => {
      if (!userId) return;
      const lastSynced = lastSyncedRef.current || 0;
      const delta = effectiveSteps - lastSynced;
      if (delta < 500 && !(!createdRef.current && effectiveSteps > 0 && lastSynced === 0 && effectiveSteps >= 500)) {
        // nothing to do
        return;
      }

      setSyncing(true);
      try {
        const body = {
          user_id: userId,
          steps: effectiveSteps,
          day: todayISO,
          step_length_cm: Math.round(stepLengthCm),
        };

        let res: any = null;
        if (!createdRef.current) {
          // create
          res = await postJSON('/api/v1/physical-activity/steps-burn', body, { baseUrl: API_BASE_URL, token: token ?? undefined });
          createdRef.current = true;
        } else {
          // update
          res = await putJSON('/api/v1/physical-activity/steps-burn', body, { baseUrl: API_BASE_URL, token: token ?? undefined });
        }

        const burned = extractBurned(res);
        if (typeof burned === 'number') setBackendBurn(burned);
        lastSyncedRef.current = effectiveSteps;
        await persistSyncState(effectiveSteps, createdRef.current);
      } catch (e) {
        // ignore sync errors
      } finally {
        if (mounted) setSyncing(false);
      }
    };

    // debounce: wait 4 seconds after sensor change
    timer = setTimeout(() => {
      attemptSync();
    }, 4000);

    return () => { mounted = false; clearTimeout(timer); };
  }, [effectiveSteps, userId, token, todayISO, stepLengthCm]);

  const caloriesBurned = (backendBurn ?? Math.round((profile?.weightKg || 0) * distanceKm * 1.0)) || 0;

  return {
    steps: effectiveSteps,
    goal,
    distanceKm,
    caloriesBurned,
    syncing,
    lastStepISO,
  } as StepsSummary;
}
