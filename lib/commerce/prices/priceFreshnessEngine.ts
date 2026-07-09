import type { CommerceSearchItem } from "@/types/commerceSearch";
import { computeFreshnessFromTimestamp, computeFreshnessFromSourceType, formatLastCheckedText } from "@/config/priceFreshnessRules";

export type FreshnessStatus = "fresh" | "recent" | "stale" | "manual" | "unknown";

export interface FreshnessResult {
  status: FreshnessStatus;
  label: string;
  lastCheckedAt: string | null;
  lastCheckedText: string;
  color: string;
}

const FRESHNESS_LABELS: Record<FreshnessStatus, string> = {
  fresh: "Recently checked",
  recent: "Verify before buying",
  stale: "Price may be outdated",
  manual: "Manual MVP price",
  unknown: "Verify on store",
};

const FRESHNESS_COLORS: Record<FreshnessStatus, string> = {
  fresh: "text-emerald-400",
  recent: "text-amber-400",
  stale: "text-red-400",
  manual: "text-blue-400",
  unknown: "text-gray-400",
};

export function evaluateFreshness(item: CommerceSearchItem): FreshnessResult {
  // Manual source types are always "manual"
  const srcType = item.sourceType as string;
  if (srcType === "manual" || srcType === "manual_csv" || srcType === "manual_json" || srcType === "admin_entry") {
    return {
      status: "manual",
      label: FRESHNESS_LABELS.manual,
      lastCheckedAt: item.lastCheckedAt || null,
      lastCheckedText: "Manual MVP price",
      color: FRESHNESS_COLORS.manual,
    };
  }

  // Check timestamp first
  if (item.lastCheckedAt) {
    const status = computeFreshnessFromTimestamp(item.lastCheckedAt);
    return {
      status,
      label: FRESHNESS_LABELS[status],
      lastCheckedAt: item.lastCheckedAt,
      lastCheckedText: formatLastCheckedText(item.lastCheckedAt),
      color: FRESHNESS_COLORS[status],
    };
  }

  // Fall back to source type
  const status = computeFreshnessFromSourceType(item.sourceType);
  return {
    status,
    label: FRESHNESS_LABELS[status],
    lastCheckedAt: null,
    lastCheckedText: formatLastCheckedText(null),
    color: FRESHNESS_COLORS[status],
  };
}

export function refreshItemFreshness(item: CommerceSearchItem): CommerceSearchItem {
  const freshness = evaluateFreshness(item);
  return {
    ...item,
    priceFreshness: freshness.status,
    lastCheckedText: freshness.lastCheckedText,
  };
}

export function refreshIndexFreshness(items: CommerceSearchItem[]): CommerceSearchItem[] {
  return items.map(refreshItemFreshness);
}

export function getFreshnessStats(items: CommerceSearchItem[]): {
  fresh: number;
  recent: number;
  stale: number;
  manual: number;
  unknown: number;
  total: number;
} {
  const counts = { fresh: 0, recent: 0, stale: 0, manual: 0, unknown: 0 };

  for (const item of items) {
    const status = item.priceFreshness as FreshnessStatus;
    if (status in counts) {
      (counts as Record<string, number>)[status]++;
    }
  }

  return { ...counts, total: items.length };
}

export function getItemsNeedingRefresh(items: CommerceSearchItem[]): CommerceSearchItem[] {
  return items.filter((item) => {
    const srcType = item.sourceType as string;
    if (srcType === "manual" || srcType === "admin_entry") return false;
    if (item.priceFreshness === "stale" || item.priceFreshness === "unknown") return true;
    if (item.priceFreshness === "recent") return true;
    return false;
  });
}
