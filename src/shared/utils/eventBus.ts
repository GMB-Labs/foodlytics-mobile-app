type Handler = (payload?: any) => void;

const listeners: Record<string, Set<Handler>> = {};

export function on(event: string, handler: Handler) {
  if (!listeners[event]) listeners[event] = new Set();
  listeners[event].add(handler);
  return () => off(event, handler);
}

export function off(event: string, handler: Handler) {
  if (!listeners[event]) return;
  listeners[event].delete(handler);
  if (listeners[event].size === 0) delete listeners[event];
}

export function emit(event: string, payload?: any) {
  const set = listeners[event];
  if (!set) return;
  for (const h of Array.from(set)) {
    try { h(payload); } catch (e) { /* swallow */ }
  }
}

export default { on, off, emit };
