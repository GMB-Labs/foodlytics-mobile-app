import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchDailyPhysicalActivity, fetchPhysicalActivityRange, PhysicalActivityDay, RemoteActivity } from '@/src/features/activity/infrastructure/activityGateway';
import { useSession } from '@/src/shared/hooks/useSession';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';

export type ActivityListItem = {
  id: string;
  name: string;
  minutes: number;
  intensity: string;
  calories: number;
};

export type UsePhysicalActivityResult = {
  today: {
    activities: ActivityListItem[];
    totalMinutes: number;
    totalCalories: number;
    fetching: boolean;
    error?: string | null;
    refetch: (opts?: { force?: boolean }) => Promise<void>;
  };
  month: {
    records: Record<string, number>; // date ISO => activity intensity (count of sessions)
    fetching: boolean;
    error?: string | null;
    refetch: (opts?: { force?: boolean }) => Promise<void>;
  };
};

function mapRemoteActivity(act: RemoteActivity): ActivityListItem {
  const fallbackId = `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id: String(act.id || fallbackId),
    name: act.activity_type || 'Actividad',
    // Preserve backend values (allow decimals) — do not round here
    minutes: typeof act.duration_minutes === 'number' ? Number(act.duration_minutes) : 0,
    intensity: act.intensity || 'Moderada',
    calories: typeof act.calories_burned === 'number' ? Number(act.calories_burned) : 0,
  };
}

const EMPTY_TODAY = { activities: [] as ActivityListItem[], totalMinutes: 0, totalCalories: 0 };
const EMPTY_MONTH = { records: {} as Record<string, number> };

export function usePhysicalActivity(): UsePhysicalActivityResult {
  const todayISO = useTodayISO();
  const [session] = useSession();
  const [dailyState, setDailyState] = useState({ ...EMPTY_TODAY, fetching: false, error: null as string | null });
  const [monthState, setMonthState] = useState({ ...EMPTY_MONTH, fetching: false, error: null as string | null });

  const monthRange = useMemo(() => {
    const now = new Date(todayISO);
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const toISO = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    return { start: toISO(start), end: toISO(end) };
  }, [todayISO]);

  const loadDaily = useCallback(async (opts?: { force?: boolean }) => {
    if (!session?.sub) {
      setDailyState({ ...EMPTY_TODAY, fetching: false, error: null });
      return;
    }
    setDailyState((prev) => ({ ...prev, fetching: true, error: null }));
    try {
      const data = await fetchDailyPhysicalActivity({
        userId: session.sub,
        date: todayISO,
        token: session.accessToken ?? undefined,
        force: opts?.force,
      });
      const activities = data?.activities?.map(mapRemoteActivity) ?? [];
      const totalMinutes = activities.reduce((sum, it) => sum + it.minutes, 0);
      const totalCalories = typeof data?.activity_burned === 'number' && data.activity_burned > 0
        ? Number(data.activity_burned)
        : activities.reduce((sum, it) => sum + it.calories, 0);

      setDailyState({ activities, totalMinutes, totalCalories, fetching: false, error: null });

      setMonthState((prev) => {
        const count = activities.length;
        const updatedRecords = { ...prev.records };
        if (count > 0) {
          updatedRecords[todayISO] = count;
        } else {
          delete updatedRecords[todayISO];
        }
        return { ...prev, records: updatedRecords };
      });
    } catch (err: any) {
      const message = err?.message || 'No pudimos obtener tus actividades.';
      setDailyState({ ...EMPTY_TODAY, fetching: false, error: message });
    }
  }, [session?.sub, session?.accessToken, todayISO]);

  const loadRange = useCallback(async (opts?: { force?: boolean }) => {
    if (!session?.sub) {
      setMonthState({ ...EMPTY_MONTH, fetching: false, error: null });
      return;
    }
    setMonthState((prev) => ({ ...prev, fetching: true, error: null }));
    try {
      const list = await fetchPhysicalActivityRange({
        userId: session.sub,
        startDate: monthRange.start,
        endDate: monthRange.end,
        token: session.accessToken ?? undefined,
        force: opts?.force,
      });
      const records: Record<string, number> = {};
      list.forEach((day) => {
        if (!day?.day) return;
        const count = Array.isArray(day.activities) ? day.activities.length : 0;
        records[day.day] = count;
      });
      setMonthState({ records, fetching: false, error: null });
    } catch (err: any) {
      const message = err?.message || 'No pudimos obtener tu racha de ejercicio.';
      setMonthState({ ...EMPTY_MONTH, fetching: false, error: message });
    }
  }, [session?.sub, session?.accessToken, monthRange.start, monthRange.end]);

  useEffect(() => {
    if (!session?.isAuthenticated || !session?.sub) {
      setDailyState({ ...EMPTY_TODAY, fetching: false, error: null });
      setMonthState({ ...EMPTY_MONTH, fetching: false, error: null });
      return;
    }
    let cancelled = false;
    (async () => {
      await Promise.all([loadDaily(), loadRange()]);
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, [session?.isAuthenticated, session?.sub, loadDaily, loadRange]);

  return {
    today: {
      activities: dailyState.activities,
      totalMinutes: dailyState.totalMinutes,
      totalCalories: dailyState.totalCalories,
      fetching: dailyState.fetching,
      error: dailyState.error,
      refetch: (opts?: { force?: boolean }) => loadDaily(opts),
    },
    month: {
      records: monthState.records,
      fetching: monthState.fetching,
      error: monthState.error,
      refetch: (opts?: { force?: boolean }) => loadRange(opts),
    },
  };
}

export default usePhysicalActivity;
