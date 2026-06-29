"use client";

import { removeItem } from "@/lib/storage/localStore";
import { STORAGE_KEYS } from "@/lib/storage/storageKeys";

export type ClearTarget =
  | "all"
  | "audits"
  | "orders"
  | "analytics"
  | "leads"
  | "unlocks"
  | "affiliate_clicks"
  | "referral"
  | "challenges"
  | "progress"
  | "onboarding"
  | "user"
  | "settings";

const CLEAR_MAP: Record<string, string[]> = {
  audits: [STORAGE_KEYS.AUDITS],
  orders: [STORAGE_KEYS.ORDERS],
  analytics: [STORAGE_KEYS.ANALYTICS],
  leads: [STORAGE_KEYS.LEADS],
  unlocks: [STORAGE_KEYS.UNLOCKS],
  affiliate_clicks: [STORAGE_KEYS.AFFILIATE_CLICKS],
  referral: [STORAGE_KEYS.REFERRAL_PROFILE, STORAGE_KEYS.REFERRAL_CLAIMS],
  challenges: [STORAGE_KEYS.CHALLENGE_ENTRIES],
  progress: [STORAGE_KEYS.PROGRESS_COMPARISONS],
  onboarding: [STORAGE_KEYS.ONBOARDING],
  user: [STORAGE_KEYS.USER],
  settings: [STORAGE_KEYS.SETTINGS],
};

export function clearLocalData(target: ClearTarget): string[] {
  if (typeof window === "undefined") return [];

  const removed: string[] = [];

  if (target === "all") {
    const allKeys = Object.values(STORAGE_KEYS);
    for (const key of allKeys) {
      removeItem(key);
      removed.push(key);
    }
    return removed;
  }

  const keysToClear = CLEAR_MAP[target];
  if (!keysToClear) return [];

  for (const key of keysToClear) {
    removeItem(key);
    removed.push(key);
  }

  return removed;
}
