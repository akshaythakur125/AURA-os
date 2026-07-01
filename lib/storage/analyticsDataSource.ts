"use client";

import { shouldUseSupabase } from "@/lib/storage/storageMode";
import { getAnonymousId } from "@/lib/identity/anonymousId";
import {
  trackEvent as localTrackEvent,
  getEvents as localGetEvents,
  getAnalyticsSummary,
  clearAnalytics,
} from "@/lib/storage/analyticsStore";

async function supabaseTrackEvent(input: {
  eventName: string;
  auditId?: string;
  orderId?: string;
  productType?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        anonymousId: getAnonymousId(),
      }),
    });
  } catch {
    // Fire-and-forget — never crash UI
  }
}

export const analyticsDataSource = {
  trackEvent: (eventName: string, metadata?: Record<string, string>) => {
    if (shouldUseSupabase()) {
      supabaseTrackEvent({ eventName, ...(metadata as Record<string, unknown>) });
    }
    localTrackEvent(eventName as never, metadata);
  },

  getEvents: () => localGetEvents(),
  getAnalyticsSummary: () => getAnalyticsSummary(),
  clearAnalytics: () => clearAnalytics(),
};
