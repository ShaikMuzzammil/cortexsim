// Simple in-memory pub/sub for Server-Sent Events. Works for one Node process,
// which is what `next dev` gives us. Each SSE handler subscribes via subscribe()
// and feeds messages straight into its ReadableStream controller.

type Listener = (event: BroadcastEvent) => void;

export interface BroadcastEvent {
  type: string;
  [key: string]: unknown;
}

const listeners = new Set<Listener>();
let eventCount = 0;
let startedAt = Date.now();

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function publish(event: BroadcastEvent): void {
  eventCount += 1;
  for (const fn of listeners) {
    try {
      fn(event);
    } catch {}
  }
}

export function stats(): { listeners: number; events: number; uptimeMs: number } {
  return { listeners: listeners.size, events: eventCount, uptimeMs: Date.now() - startedAt };
}
