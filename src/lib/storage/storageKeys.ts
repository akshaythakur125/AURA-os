export const STORAGE_KEYS = {
  AUDITS: "auracheck:v1:audits",
  USER: "auracheck:v1:user",
  SETTINGS: "auracheck:v1:settings",
  UNLOCKS: "auracheck:v1:unlocks",
  AFFILIATE_CLICKS: "auracheck:v1:affiliate_clicks",
  ORDERS: "auracheck:v1:orders",
  ANALYTICS: "auracheck:v1:analytics",
  LEADS: "auracheck:v1:leads",
  REFERRAL_PROFILE: "auracheck:v1:referral_profile",
  REFERRAL_CLAIMS: "auracheck:v1:referral_claims",
  CHALLENGE_ENTRIES: "auracheck:v1:challenge_entries",
  PROGRESS_COMPARISONS: "auracheck:v1:progress_comparisons",
  ONBOARDING: "auracheck:v1:onboarding",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const STORAGE_VERSION = 1;
