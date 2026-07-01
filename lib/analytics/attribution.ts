"use client";

import type { AttributionData, SourceBreakdown } from "@/types/attribution";
import { getItem } from "@/lib/storage/localStore";
import { getAnonymousId } from "@/lib/identity/anonymousId";

const ATTR_KEY = "auracheck:v1:full_attribution";

export function getFullAttribution(): AttributionData {
  if (typeof window === "undefined") {
    return { firstTouch: null, lastTouch: null, sessionId: "", anonymousId: "", firstSeenAt: "", lastSeenAt: "" };
  }
  const stored = getItem<AttributionData | null>(ATTR_KEY, null);
  if (stored) return stored;

  const now = new Date().toISOString();
  const fresh: AttributionData = {
    firstTouch: null,
    lastTouch: null,
    sessionId: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    anonymousId: getAnonymousId(),
    firstSeenAt: now,
    lastSeenAt: now,
  };
  return fresh;
}

export function getSourceBreakdown(funnelEvents: Array<{ eventName: string; utmSource?: string; productType?: string; metadata?: Record<string, unknown> }>): SourceBreakdown[] {
  const bySource = new Map<string, { visitors: Set<string>; audits: Set<string>; freeScores: Set<string>; unlocks: Set<string>; revenue: number }>();

  for (const e of funnelEvents) {
    const source = e.utmSource || "direct";
    if (!bySource.has(source)) bySource.set(source, { visitors: new Set(), audits: new Set(), freeScores: new Set(), unlocks: new Set(), revenue: 0 });

    const data = bySource.get(source)!;
    data.visitors.add(e.eventName); // simplified: track unique event types

    if (e.eventName === "audit_created") data.audits.add(e.eventName);
    if (e.eventName === "free_score_generated") data.freeScores.add(e.eventName);
    if (e.eventName === "product_unlocked" && e.metadata?.amount) {
      data.unlocks.add(e.eventName);
      data.revenue += Number(e.metadata.amount);
    }
  }

  return Array.from(bySource.entries()).map(([source, data]) => ({
    source,
    visitors: data.visitors.size,
    audits: data.audits.size,
    freeScores: data.freeScores.size,
    unlocks: data.unlocks.size,
    revenue: data.revenue,
    conversionRate: data.visitors.size > 0 ? Math.round((data.unlocks.size / data.visitors.size) * 100) : 0,
  })).sort((a, b) => b.revenue - a.revenue);
}
