/* Simple in-memory cache for vision detection results.
   Stores a DetectionResponse-like object under a short id so we avoid
   passing large JSON via query params. This is intentionally minimal
   for prototype use. */

import type { DetectionResponse } from "../domain/detection";

type CacheEntry = { value: DetectionResponse; createdAt: number };

const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 15; // 15 minutes

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function saveDetection(result: DetectionResponse) {
  const id = generateId();
  CACHE.set(id, { value: result, createdAt: Date.now() });
  return id;
}

export function getDetection(id: string): DetectionResponse | null {
  try {
    const e = CACHE.get(id);
    if (!e) return null;
    if (Date.now() - e.createdAt > TTL_MS) {
      CACHE.delete(id);
      return null;
    }
    return e.value;
  } catch {
    return null;
  }
}

export function clearDetection(id: string) {
  CACHE.delete(id);
}

export function clearExpired() {
  const now = Date.now();
  for (const [k, v] of CACHE.entries()) {
    if (now - v.createdAt > TTL_MS) CACHE.delete(k);
  }
}

export function _debug_cacheSize() {
  return CACHE.size;
}
