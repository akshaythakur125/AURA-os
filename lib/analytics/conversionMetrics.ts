"use client";

import type { ProductFunnel, FunnelLeak, CommerceFunnel, SeoFunnel, FunnelEvent } from "@/types/funnel";
import type { ConversionMetrics } from "@/types/revenueAnalytics";
import { getRevenueRecords } from "./revenueAttribution";

export function computeConversionMetrics(events: FunnelEvent[]): ConversionMetrics {
  const visitors = new Set(events.map((e) => e.anonymousId)).size;
  const audits = events.filter((e) => e.eventName === "audit_created").length;
  const freeScores = events.filter((e) => e.eventName === "free_score_generated").length;
  const paywallViews = events.filter((e) => e.eventName === "quick_fix_paywall_viewed").length;
  const checkoutStarts = events.filter((e) => e.eventName === "checkout_started").length;
  const payments = events.filter((e) => e.eventName === "payment_verified").length;
  const unlocks = events.filter((e) => e.eventName === "product_unlocked").length;

  const safeDiv = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

  return {
    overall: { visitors, audits, freeScores, paywallViews, checkoutStarts, payments, unlocks },
    rates: {
      auditToFreeScore: safeDiv(freeScores, audits),
      freeScoreToPaywall: safeDiv(paywallViews, freeScores),
      paywallToCheckout: safeDiv(checkoutStarts, paywallViews),
      checkoutToPayment: safeDiv(payments, checkoutStarts),
      paymentToUnlock: safeDiv(unlocks, payments),
      visitorToUnlock: safeDiv(unlocks, visitors),
    },
  };
}

export function computeProductFunnels(events: FunnelEvent[]): ProductFunnel[] {
  const products = ["quick_fix", "aura_report", "dating_audit", "glowup_plan"];
  const revenue = getRevenueRecords();

  return products.map((pt) => {
    const paywallViews = events.filter((e) => e.eventName === "quick_fix_paywall_viewed" && (!e.productType || e.productType === pt)).length;
    const unlockStarts = events.filter((e) => e.eventName === "unlock_page_viewed" && e.productType === pt).length;
    const paymentStarts = events.filter((e) => e.eventName === "checkout_started" && e.productType === pt).length;
    const paymentSuccess = events.filter((e) => e.eventName === "payment_verified" && e.productType === pt).length;
    const unlocks = events.filter((e) => e.eventName === "product_unlocked" && e.productType === pt).length;
    const productRevenue = revenue.filter((r) => r.productType === pt).reduce((s, r) => s + r.amount, 0);

    return {
      productType: pt,
      paywallViews,
      unlockStarts,
      paymentStarts,
      paymentSuccess,
      unlocks,
      revenue: productRevenue,
      conversionRate: paywallViews > 0 ? Math.round((unlocks / paywallViews) * 100) : 0,
    };
  });
}

export function computeCommerceFunnel(events: FunnelEvent[]): CommerceFunnel {
  return {
    wardrobePageViews: events.filter((e) => e.eventName === "wardrobe_page_view").length,
    searchResultViews: events.filter((e) => e.eventName === "wardrobe_search_performed").length,
    productClicks: events.filter((e) => e.eventName === "product_card_viewed").length,
    affiliateClickouts: events.filter((e) => e.eventName === "affiliate_clickout" || e.eventName === "commerce_clickout").length,
    savedProducts: events.filter((e) => e.eventName === "saved_product").length,
    estimatedGMV: 0,
    estimatedAffiliateRevenue: 0,
  };
}

export function computeSeoFunnel(events: FunnelEvent[], landingPage?: string): SeoFunnel {
  const seoEvents = landingPage
    ? events.filter((e) => e.landingPage === landingPage)
    : events.filter((e) => e.landingPage && !e.landingPage.startsWith("/admin"));

  return {
    seoPageViews: seoEvents.filter((e) => e.eventName === "seo_page_view" || e.eventName === "page_view").length,
    ctaClicks: seoEvents.filter((e) => e.eventName === "seo_cta_clicked").length,
    auditStarts: seoEvents.filter((e) => e.eventName === "audit_started").length,
    wardrobeSearches: seoEvents.filter((e) => e.eventName === "wardrobe_search_performed").length,
    commerceClickouts: seoEvents.filter((e) => e.eventName === "commerce_clickout").length,
    revenue: 0,
  };
}

export function computeFunnelLeaks(metrics: ConversionMetrics): FunnelLeak[] {
  const leaks: FunnelLeak[] = [];

  if (metrics.overall.audits > 0 && metrics.rates.auditToFreeScore < 50) {
    leaks.push({
      stage: "Audit → Free Score",
      dropoffCount: metrics.overall.audits - metrics.overall.freeScores,
      dropoffPercent: 100 - metrics.rates.auditToFreeScore,
      suggestion: "Many audits but few free scores generated. Check if image analysis is completing.",
    });
  }

  if (metrics.overall.freeScores > 0 && metrics.rates.freeScoreToPaywall < 30) {
    leaks.push({
      stage: "Free Score → ₹49 Paywall",
      dropoffCount: metrics.overall.freeScores - metrics.overall.paywallViews,
      dropoffPercent: 100 - metrics.rates.freeScoreToPaywall,
      suggestion: "Improve ₹49 paywall copy and CTA placement on audit result page.",
    });
  }

  if (metrics.overall.paywallViews > 0 && metrics.rates.paywallToCheckout < 20) {
    leaks.push({
      stage: "₹49 Paywall → Checkout Start",
      dropoffCount: metrics.overall.paywallViews - metrics.overall.checkoutStarts,
      dropoffPercent: 100 - metrics.rates.paywallToCheckout,
      suggestion: "Many paywall views but few checkout starts. Review unlock page UX and pricing clarity.",
    });
  }

  if (metrics.overall.checkoutStarts > 0 && metrics.rates.checkoutToPayment < 60) {
    leaks.push({
      stage: "Checkout Start → Payment Verified",
      dropoffCount: metrics.overall.checkoutStarts - metrics.overall.payments,
      dropoffPercent: 100 - metrics.rates.checkoutToPayment,
      suggestion: "Checkout started but payment not verified. Check Razorpay/key configuration or recovery flow.",
    });
  }

  return leaks;
}
