"use client";

import { getItem, setItem } from "@/lib/storage/localStore";

const ANALYTICS_KEY = "auracheck:v1:analytics";

export type AnalyticsEvent =
  | "audit_created"
  | "free_score_generated"
  | "unlock_page_viewed"
  | "payment_request_saved"
  | "product_unlocked"
  | "share_card_downloaded"
  | "affiliate_clicked"
  | "report_printed";

export interface AnalyticsRecord {
  id: string;
  event: AnalyticsEvent;
  metadata?: Record<string, string>;
  timestamp: string;
}

export function trackEvent(event: AnalyticsEvent, metadata?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  const record: AnalyticsRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    event,
    metadata,
    timestamp: new Date().toISOString(),
  };
  const events = getEvents();
  events.unshift(record);
  // Keep max 500 events to avoid localStorage bloat
  if (events.length > 500) events.length = 500;
  setItem(ANALYTICS_KEY, events);
}

export function getEvents(): AnalyticsRecord[] {
  return getItem<AnalyticsRecord[]>(ANALYTICS_KEY, []);
}

export function getAnalyticsSummary(): Record<string, number> {
  const events = getEvents();
  return {
    totalEvents: events.length,
    auditCreated: events.filter((e) => e.event === "audit_created").length,
    freeScoreGenerated: events.filter((e) => e.event === "free_score_generated").length,
    unlockPageViewed: events.filter((e) => e.event === "unlock_page_viewed").length,
    paymentRequestSaved: events.filter((e) => e.event === "payment_request_saved").length,
    productUnlocked: events.filter((e) => e.event === "product_unlocked").length,
    shareCardDownloaded: events.filter((e) => e.event === "share_card_downloaded").length,
    affiliateClicked: events.filter((e) => e.event === "affiliate_clicked").length,
    reportPrinted: events.filter((e) => e.event === "report_printed").length,
  };
}

export function clearAnalytics(): void {
  setItem(ANALYTICS_KEY, []);
}
