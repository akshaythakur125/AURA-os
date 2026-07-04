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
  | "report_printed"
  | "product_page_viewed"
  | "examples_viewed"
  | "offer_applied"
  | "lead_created"
  | "pricing_cta_clicked"
  | "unlock_started"
  | "referral_created"
  | "referral_link_copied"
  | "referral_shared"
  | "referral_claimed"
  | "challenge_viewed"
  | "challenge_entered"
  | "progress_comparison_created"
  | "pwa_install_page_viewed"
  | "onboarding_step_completed"
  | "aura_twin_page_viewed"
  | "aura_twin_uploaded"
  | "aura_twin_generated"
  | "aura_twin_saved"
  | "aura_twin_audit_created"
  | "aura_twin_strategy_copied"
  | "quick_fix_paywall_viewed"
  | "quick_fix_cta_clicked"
  | "quick_fix_unlock_started"
  | "quick_fix_payment_request_saved"
  | "quick_fix_unlocked"
  | "quick_fix_upsell_full_report_clicked"
  | "quick_fix_upsell_glowup_clicked"
  | "before_after_page_viewed"
  | "proof_card_viewed"
  | "proof_cta_clicked"
  | "proof_quick_fix_clicked"
  | "proof_pricing_clicked"
  | "share_card_link_copied"
  | "share_card_native_shared"
  | "battle_completed"
  | "battle_share_card_viewed"
  | "challenge_logged"
  | "landing_page_viewed"
  | "landing_cta_clicked"
  | "share_card_viewed"
  | "share_card_shared"
  | "share_platform_clicked"
  | "share_tip_unlocked";

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
    productPageViewed: events.filter((e) => e.event === "product_page_viewed").length,
    examplesViewed: events.filter((e) => e.event === "examples_viewed").length,
    offerApplied: events.filter((e) => e.event === "offer_applied").length,
    leadCreated: events.filter((e) => e.event === "lead_created").length,
    pricingCtaClicked: events.filter((e) => e.event === "pricing_cta_clicked").length,
    unlockStarted: events.filter((e) => e.event === "unlock_started").length,
    referralCreated: events.filter((e) => e.event === "referral_created").length,
    referralLinkCopied: events.filter((e) => e.event === "referral_link_copied").length,
    referralShared: events.filter((e) => e.event === "referral_shared").length,
    referralClaimed: events.filter((e) => e.event === "referral_claimed").length,
    challengeViewed: events.filter((e) => e.event === "challenge_viewed").length,
    challengeEntered: events.filter((e) => e.event === "challenge_entered").length,
    progressComparisonCreated: events.filter((e) => e.event === "progress_comparison_created").length,
    pwaInstallPageViewed: events.filter((e) => e.event === "pwa_install_page_viewed").length,
    onboardingStepCompleted: events.filter((e) => e.event === "onboarding_step_completed").length,
    auraTwinPageViewed: events.filter((e) => e.event === "aura_twin_page_viewed").length,
    auraTwinUploaded: events.filter((e) => e.event === "aura_twin_uploaded").length,
    auraTwinGenerated: events.filter((e) => e.event === "aura_twin_generated").length,
    auraTwinSaved: events.filter((e) => e.event === "aura_twin_saved").length,
    auraTwinAuditCreated: events.filter((e) => e.event === "aura_twin_audit_created").length,
    auraTwinStrategyCopied: events.filter((e) => e.event === "aura_twin_strategy_copied").length,
    quickFixPaywallViewed: events.filter((e) => e.event === "quick_fix_paywall_viewed").length,
    quickFixCtaClicked: events.filter((e) => e.event === "quick_fix_cta_clicked").length,
    quickFixUnlockStarted: events.filter((e) => e.event === "quick_fix_unlock_started").length,
    quickFixPaymentRequestSaved: events.filter((e) => e.event === "quick_fix_payment_request_saved").length,
    quickFixUnlocked: events.filter((e) => e.event === "quick_fix_unlocked").length,
    quickFixUpsellFullReportClicked: events.filter((e) => e.event === "quick_fix_upsell_full_report_clicked").length,
    quickFixUpsellGlowupClicked: events.filter((e) => e.event === "quick_fix_upsell_glowup_clicked").length,
    beforeAfterPageViewed: events.filter((e) => e.event === "before_after_page_viewed").length,
    proofCardViewed: events.filter((e) => e.event === "proof_card_viewed").length,
    proofCtaClicked: events.filter((e) => e.event === "proof_cta_clicked").length,
    proofQuickFixClicked: events.filter((e) => e.event === "proof_quick_fix_clicked").length,
    proofPricingClicked: events.filter((e) => e.event === "proof_pricing_clicked").length,
  };
}

export function clearAnalytics(): void {
  setItem(ANALYTICS_KEY, []);
}
