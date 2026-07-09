export const FRESHNESS_RULES = {
  fresh: { maxHours: 24, label: "Recently checked", color: "emerald", order: 0 },
  recent: { maxHours: 168, label: "Verify before buying", color: "amber", order: 1 },
  stale: { maxHours: Infinity, label: "Price may be outdated", color: "red", order: 2 },
  manual: { maxHours: -1, label: "Manual MVP price", color: "blue", order: 3 },
  unknown: { maxHours: -1, label: "Verify on store", color: "gray", order: 4 },
};

export function computeFreshnessFromTimestamp(lastCheckedAt: string | null | undefined): "fresh" | "recent" | "stale" | "manual" | "unknown" {
  if (!lastCheckedAt) return "unknown";

  const checked = new Date(lastCheckedAt).getTime();
  if (isNaN(checked)) return "unknown";

  const hoursAgo = (Date.now() - checked) / (1000 * 60 * 60);
  if (hoursAgo <= 24) return "fresh";
  if (hoursAgo <= 168) return "recent";
  return "stale";
}

export function computeFreshnessFromSourceType(sourceType: string): "fresh" | "recent" | "stale" | "manual" | "unknown" {
  if (sourceType === "manual" || sourceType === "manual_csv" || sourceType === "manual_json" || sourceType === "admin_entry" || sourceType === "csv" || sourceType === "json") {
    return "manual";
  }
  if (sourceType === "official_api") return "fresh";
  if (sourceType === "affiliate_csv" || sourceType === "affiliate_json") return "recent";
  return "unknown";
}

export function formatLastCheckedText(lastCheckedAt: string | null | undefined): string {
  if (!lastCheckedAt) return "Verify on store";

  const d = new Date(lastCheckedAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
