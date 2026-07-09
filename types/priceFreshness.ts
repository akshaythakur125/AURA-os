export type PriceFreshnessStatus = "fresh" | "recent" | "stale" | "manual" | "unknown";

export interface PriceFreshness {
  status: PriceFreshnessStatus;
  label: string;
  lastCheckedAt: string | null;
  lastCheckedText: string;
  color: string;
  icon: string;
}

export const FRESHNESS_LABELS: Record<PriceFreshnessStatus, string> = {
  fresh: "Recently checked",
  recent: "Verify before buying",
  stale: "Price may be outdated",
  manual: "Manual MVP price",
  unknown: "Verify on store",
};

export const FRESHNESS_COLORS: Record<PriceFreshnessStatus, string> = {
  fresh: "text-emerald-400",
  recent: "text-amber-400",
  stale: "text-red-400",
  manual: "text-blue-400",
  unknown: "text-gray-400",
};

export const FRESHNESS_ICONS: Record<PriceFreshnessStatus, string> = {
  fresh: "✓",
  recent: "!",
  stale: "✗",
  manual: "✎",
  unknown: "?",
};

export function computeFreshness(lastCheckedAt: string | null | undefined): PriceFreshness {
  if (!lastCheckedAt) {
    return {
      status: "unknown",
      label: FRESHNESS_LABELS.unknown,
      lastCheckedAt: null,
      lastCheckedText: "Verify on store",
      color: FRESHNESS_COLORS.unknown,
      icon: FRESHNESS_ICONS.unknown,
    };
  }

  const checked = new Date(lastCheckedAt).getTime();
  const now = Date.now();
  const hoursDiff = (now - checked) / (1000 * 60 * 60);

  if (hoursDiff <= 24) {
    return {
      status: "fresh",
      label: FRESHNESS_LABELS.fresh,
      lastCheckedAt,
      lastCheckedText: formatLastChecked(lastCheckedAt),
      color: FRESHNESS_COLORS.fresh,
      icon: FRESHNESS_ICONS.fresh,
    };
  }

  if (hoursDiff <= 168) {
    return {
      status: "recent",
      label: FRESHNESS_LABELS.recent,
      lastCheckedAt,
      lastCheckedText: formatLastChecked(lastCheckedAt),
      color: FRESHNESS_COLORS.recent,
      icon: FRESHNESS_ICONS.recent,
    };
  }

  return {
    status: "stale",
    label: FRESHNESS_LABELS.stale,
    lastCheckedAt,
    lastCheckedText: formatLastChecked(lastCheckedAt),
    color: FRESHNESS_COLORS.stale,
    icon: FRESHNESS_ICONS.stale,
  };
}

export function computeFreshnessFromSource(sourceType: string): PriceFreshness {
  if (sourceType === "manual" || sourceType === "csv" || sourceType === "json") {
    return {
      status: "manual",
      label: FRESHNESS_LABELS.manual,
      lastCheckedAt: null,
      lastCheckedText: "Manual MVP price",
      color: FRESHNESS_COLORS.manual,
      icon: FRESHNESS_ICONS.manual,
    };
  }
  return {
    status: "unknown",
    label: FRESHNESS_LABELS.unknown,
    lastCheckedAt: null,
    lastCheckedText: "Verify on store",
    color: FRESHNESS_COLORS.unknown,
    icon: FRESHNESS_ICONS.unknown,
  };
}

function formatLastChecked(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
