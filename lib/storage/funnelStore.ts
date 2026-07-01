import type { FunnelEvent } from "@/types/funnel";
import { getItem, setItem } from "./localStore";

const FUNNEL_KEY = "auracheck:v1:funnel_events";
const MAX_EVENTS = 1000;

export function getFunnelEvents(): FunnelEvent[] {
  return getItem<FunnelEvent[]>(FUNNEL_KEY, []);
}

export function addFunnelEvent(event: FunnelEvent): void {
  const events = getFunnelEvents();
  events.push(event);
  setItem(FUNNEL_KEY, events.slice(-MAX_EVENTS));
}

export function clearFunnelEvents(): void {
  setItem(FUNNEL_KEY, []);
}

export function getFunnelEventsByType(eventName: string): FunnelEvent[] {
  return getFunnelEvents().filter((e) => e.eventName === eventName);
}

export function getFunnelEventStats(): {
  total: number;
  byEvent: Record<string, number>;
  uniqueVisitors: number;
  uniqueSessions: number;
} {
  const events = getFunnelEvents();
  const byEvent: Record<string, number> = {};
  const visitors = new Set<string>();
  const sessions = new Set<string>();

  for (const e of events) {
    byEvent[e.eventName] = (byEvent[e.eventName] || 0) + 1;
    visitors.add(e.anonymousId);
    sessions.add(e.sessionId);
  }

  return {
    total: events.length,
    byEvent,
    uniqueVisitors: visitors.size,
    uniqueSessions: sessions.size,
  };
}
