export const STORAGE_KEYS = {
  AUDITS: "auracheck:v1:audits",
  USER: "auracheck:v1:user",
  SETTINGS: "auracheck:v1:settings",
  UNLOCKS: "auracheck:v1:unlocks",
  AFFILIATE_CLICKS: "auracheck:v1:affiliate_clicks",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const STORAGE_VERSION = 1;
