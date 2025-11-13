import { useEffect, useRef, useState } from 'react';
import { Pedometer } from 'expo-sensors';
import { postJSON } from '@/src/shared/utils/api';
import { useTodayISO } from '@/src/shared/hooks/useTodayISO';

/**
 * useSteps
 * - reads today's total steps using expo-sensors Pedometer APIs
 * - subscribes to live updates and re-queries daily total on changes
 * - buffers deltas and uploads them periodically to the backend via postJSON
 *
 * Notes:
 * - This runs while the app is in foreground. Background syncing requires
 *   background tasks / native services (expo-task-manager, background-fetch,
 *   or platform-specific services) and extra permissions.
 */
export default function useSteps(opts?: { uploadIntervalMs?: number; baseUrl?: string; token?: string }) {
  const todayISO = useTodayISO();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [steps, setSteps] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const lastUploadedRef = useRef<number>(0);
  const pendingRef = useRef<number>(0);
  const subRef = useRef<any>(null);

  const uploadIntervalMs = opts?.uploadIntervalMs ?? 60_000; // send every minute by default

  async function queryToday() {
    try {
      const start = new Date(todayISO + 'T00:00:00');
      const end = new Date();
      let res: any = null;
      // Some expo versions accept an object { startDate, endDate }, others accept positional args (start, end).
      try {
        // try object-style first
        // @ts-ignore runtime guard
        if (typeof (Pedometer as any).getStepCountAsync === 'function') {
          try {
            res = await (Pedometer as any).getStepCountAsync({ startDate: start, endDate: end });
          } catch (e) {
            // fallback to positional
            res = await (Pedometer as any).getStepCountAsync(start, end);
          }
        }
      } catch (e) {
        console.warn('useSteps: getStepCountAsync invocation failed', e);
      }

      const total = typeof res?.steps === 'number' ? res.steps : (typeof res === 'number' ? res : 0);
      setSteps(total);
      return total;
    } catch (e) {
      console.warn('useSteps: getStepCountAsync failed', e);
      return 0;
    }
  }

  useEffect(() => {
    let mounted = true;
    Pedometer.isAvailableAsync()
      .then((a: boolean) => { if (!mounted) return; setAvailable(!!a); })
      .catch(() => { if (!mounted) return; setAvailable(false); });

    // initial read
    queryToday().then((t) => { lastUploadedRef.current = t; });

    // subscribe to live updates; on event re-query daily total for correctness
    try {
      // watchStepCount usually provides a callback with an object { steps }
      subRef.current = (Pedometer as any).watchStepCount((res: any) => {
        // re-query to get accurate daily total
        queryToday().then((t) => {
          const delta = Math.max(0, t - lastUploadedRef.current);
          if (delta > 0) pendingRef.current += delta;
        });
      });
    } catch (e) {
      // some platforms may not support watchStepCount
    }

    return () => {
      mounted = false;
      try { subRef.current && subRef.current.remove && subRef.current.remove(); } catch (e) {}
    };
  }, [todayISO]);

  // periodic uploader
  useEffect(() => {
    const id = setInterval(async () => {
      const pending = pendingRef.current;
      if (!pending) return;
      setUploading(true);
      try {
        // Post delta to backend. Adjust endpoint and payload to your API.
        await postJSON('/steps', { dateISO: todayISO, steps: pending }, { baseUrl: opts?.baseUrl, token: opts?.token });
        // mark uploaded
        lastUploadedRef.current += pending;
        pendingRef.current = 0;
      } catch (e) {
        // keep pending to retry later
        console.warn('useSteps: upload failed', e);
      } finally {
        setUploading(false);
      }
    }, uploadIntervalMs);

    return () => clearInterval(id);
  }, [uploadIntervalMs, opts?.baseUrl, opts?.token, todayISO]);

  return { available, steps, uploading, pending: pendingRef.current };
}
