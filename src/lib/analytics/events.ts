import { posthogCapture } from "@/components/providers/PostHogProvider";

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  posthogCapture(event, properties);
}

export const EVENTS = {
  // Landing
  PAGE_LANDING: "page_landing",

  // Quiz intake
  QUIZ_STARTED: "quiz_started",
  QUIZ_GOAL_SELECTED: "quiz_goal_selected",
  QUIZ_PHOTO_UPLOADED: "quiz_photo_uploaded",
  QUIZ_COMPLETED: "quiz_completed",

  // Analysis
  ANALYSIS_STARTED: "analysis_started",
  ANALYSIS_COMPLETED: "analysis_completed",

  // Results
  RESULTS_VIEWED: "results_viewed",
  RESULTS_SHARED: "results_shared",

  // Paywall
  PAYWALL_VIEWED: "paywall_viewed",
  PAYWALL_CTA_CLICKED: "paywall_cta_clicked",

  // Payment
  PAYMENT_STARTED: "payment_started",
  PAYMENT_COMPLETED: "payment_completed",
  PAYMENT_FAILED: "payment_failed",

  // Shop
  SHOP_LINK_CLICKED: "shop_link_clicked",

  // Referral
  REFERRAL_LINK_COPIED: "referral_link_copied",
  REFERRAL_SHARED: "referral_shared",
  REFERRAL_CODE_REDEEMED: "referral_code_redeemed",

  // Recovery
  RECOVERY_EMAIL_CAPTURED: "recovery_email_captured",

  // Dashboard
  DASHBOARD_VIEWED: "dashboard_viewed",

  // Navigation
  NAVIGATION_CLICKED: "navigation_clicked",
} as const;
