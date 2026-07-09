"use client";

import type { FunnelEvent } from "@/types/funnel";
import { getAnonymousId } from "@/lib/identity/anonymousId";
import { getSessionId } from "./sessionTracking";
import { getFirstTouchSource, getLandingPage } from "./sourceTracking";
import { addFunnelEvent } from "@/lib/storage/funnelStore";

export type FunnelEventName =
  | "page_view"
  | "landing_page_view"
  | "seo_page_view"
  | "product_page_view"
  | "pricing_page_view"
  | "wardrobe_page_view"
  | "commerce_clickout"
  | "audit_started"
  | "audit_created"
  | "free_score_generated"
  | "quick_fix_paywall_viewed"
  | "quick_fix_checkout_started"
  | "payment_started"
  | "payment_verified"
  | "product_unlocked"
  | "upsell_clicked"
  | "affiliate_clickout"
  | "outfit_cart_created"
  | "saved_product"
  | "deal_alert_viewed"
  | "start_free_audit_clicked"
  | "wardrobe_cta_clicked"
  | "pricing_cta_clicked"
  | "wardrobe_search_performed"
  | "product_card_viewed"
  | "unlock_page_viewed"
  | "checkout_started"
  | "razorpay_checkout_started"
  | "manual_payment_saved"
  | "seo_cta_clicked"
  | "seo_product_clicked"
  | "paid_product_card_clicked"
  | "wardrobe_section_viewed";

export function trackFunnelEvent(
  eventName: FunnelEventName,
  options?: {
    auditId?: string;
    orderId?: string;
    productType?: string;
    sourcePage?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  if (typeof window === "undefined") return;

  try {
    const event: FunnelEvent = {
      id: `funnel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      eventName,
      anonymousId: getAnonymousId(),
      sessionId: getSessionId(),
      auditId: options?.auditId,
      orderId: options?.orderId,
      productType: options?.productType,
      sourcePage: options?.sourcePage || window.location.pathname,
      landingPage: getLandingPage(),
      referrer: document.referrer || undefined,
      utmSource: getFirstTouchSource(),
      metadata: options?.metadata,
      createdAt: new Date().toISOString(),
    };

    addFunnelEvent(event);

    // Also fire to server if Supabase configured
    try {
      fetch("/api/analytics/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch(() => {});
    } catch {
      // no-op
    }
  } catch {
    // never crash user flow
  }
}
