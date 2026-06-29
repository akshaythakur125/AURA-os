"use client";

import { getItem } from "@/lib/storage/localStore";
import { STORAGE_KEYS } from "@/lib/storage/storageKeys";

export interface StorageSummary {
  audits: { count: number; size: number };
  orders: { count: number; size: number };
  unlocks: { count: number; size: number };
  leads: { count: number; size: number };
  analytics: { count: number; size: number };
  affiliateClicks: { count: number; size: number };
  referralProfile: { exists: boolean; size: number };
  referralClaims: { count: number; size: number };
  challengeEntries: { count: number; size: number };
  progressComparisons: { count: number; size: number };
  onboarding: { exists: boolean; size: number };
  user: { exists: boolean; size: number };
  settings: { exists: boolean; size: number };
  totalSize: number;
  lastUpdated: Record<string, string>;
}

function estimateArrayLength(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    return 0;
  } catch {
    return 0;
  }
}

function estimateSize(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    return raw.length * 2;
  } catch {
    return 0;
  }
}

function exists(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function getLastUpdated(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const dates = parsed.map((item: any) => item.createdAt || item.updatedAt || "").filter(Boolean).sort().reverse();
      return dates[0] || "";
    }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return (parsed as any).createdAt || (parsed as any).updatedAt || "";
    }
    return "";
  } catch {
    return "";
  }
}

export function getStorageSummary(): StorageSummary {
  return {
    audits: { count: estimateArrayLength(STORAGE_KEYS.AUDITS), size: estimateSize(STORAGE_KEYS.AUDITS) },
    orders: { count: estimateArrayLength(STORAGE_KEYS.ORDERS), size: estimateSize(STORAGE_KEYS.ORDERS) },
    unlocks: { count: estimateArrayLength(STORAGE_KEYS.UNLOCKS), size: estimateSize(STORAGE_KEYS.UNLOCKS) },
    leads: { count: estimateArrayLength(STORAGE_KEYS.LEADS), size: estimateSize(STORAGE_KEYS.LEADS) },
    analytics: { count: estimateArrayLength(STORAGE_KEYS.ANALYTICS), size: estimateSize(STORAGE_KEYS.ANALYTICS) },
    affiliateClicks: { count: estimateArrayLength(STORAGE_KEYS.AFFILIATE_CLICKS), size: estimateSize(STORAGE_KEYS.AFFILIATE_CLICKS) },
    referralProfile: { exists: exists(STORAGE_KEYS.REFERRAL_PROFILE), size: estimateSize(STORAGE_KEYS.REFERRAL_PROFILE) },
    referralClaims: { count: estimateArrayLength(STORAGE_KEYS.REFERRAL_CLAIMS), size: estimateSize(STORAGE_KEYS.REFERRAL_CLAIMS) },
    challengeEntries: { count: estimateArrayLength(STORAGE_KEYS.CHALLENGE_ENTRIES), size: estimateSize(STORAGE_KEYS.CHALLENGE_ENTRIES) },
    progressComparisons: { count: estimateArrayLength(STORAGE_KEYS.PROGRESS_COMPARISONS), size: estimateSize(STORAGE_KEYS.PROGRESS_COMPARISONS) },
    onboarding: { exists: exists(STORAGE_KEYS.ONBOARDING), size: estimateSize(STORAGE_KEYS.ONBOARDING) },
    user: { exists: exists(STORAGE_KEYS.USER), size: estimateSize(STORAGE_KEYS.USER) },
    settings: { exists: exists(STORAGE_KEYS.SETTINGS), size: estimateSize(STORAGE_KEYS.SETTINGS) },
    totalSize: 0,
    lastUpdated: {
      audits: getLastUpdated(STORAGE_KEYS.AUDITS),
      orders: getLastUpdated(STORAGE_KEYS.ORDERS),
      unlocks: getLastUpdated(STORAGE_KEYS.UNLOCKS),
      leads: getLastUpdated(STORAGE_KEYS.LEADS),
      analytics: getLastUpdated(STORAGE_KEYS.ANALYTICS),
      challengeEntries: getLastUpdated(STORAGE_KEYS.CHALLENGE_ENTRIES),
      progressComparisons: getLastUpdated(STORAGE_KEYS.PROGRESS_COMPARISONS),
    },
  };
}
