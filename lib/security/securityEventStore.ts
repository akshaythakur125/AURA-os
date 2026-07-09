"use client";

import type { SecurityEvent, SecurityEventType } from "@/types/security";
import { getItem, setItem } from "@/lib/storage/localStore";

const EVENTS_KEY = "auracheck:v1:security_events";

export function addSecurityEvent(event: {
  eventType: SecurityEventType;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}): void {
  if (typeof window === "undefined") return;

  const events = getSecurityEvents();
  const newEvent: SecurityEvent = {
    id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    eventType: event.eventType,
    severity: event.severity,
    message: event.message,
    source: event.source || window.location.pathname,
    metadata: event.metadata,
    createdAt: new Date().toISOString(),
  };
  events.push(newEvent);
  setItem(EVENTS_KEY, events.slice(-200));
}

export function getSecurityEvents(): SecurityEvent[] {
  if (typeof window === "undefined") return [];
  return getItem<SecurityEvent[]>(EVENTS_KEY, []);
}

export function getSecurityEventStats(): {
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  recentCritical: SecurityEvent[];
} {
  const events = getSecurityEvents();
  const bySeverity: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const e of events) {
    bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
    byType[e.eventType] = (byType[e.eventType] || 0) + 1;
  }

  return {
    total: events.length,
    bySeverity,
    byType,
    recentCritical: events.filter((e) => e.severity === "critical" || e.severity === "high").slice(-10),
  };
}

export function clearSecurityEvents(): void {
  setItem(EVENTS_KEY, []);
}
