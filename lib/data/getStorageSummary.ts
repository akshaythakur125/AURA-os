export interface StorageSummaryEntry {
  key: string;
  label: string;
  count: number;
  estimatedBytes: number;
  lastUpdated?: string;
}

export interface StorageSummary {
  entries: StorageSummaryEntry[];
  totalEstimatedBytes: number;
  localStorageAvailable: boolean;
}

const STORE_CONFIGS: { key: string; label: string }[] = [
  { key: "auracheck:v1:audits", label: "Audits" },
  { key: "auracheck:v1:orders", label: "Orders / Payment Requests" },
  { key: "auracheck:v1:unlocks", label: "Unlock Records" },
  { key: "auracheck:v1:leads", label: "Leads" },
  { key: "auracheck:v1:referral_profile", label: "Referral Profile" },
  { key: "auracheck:v1:referral_claims", label: "Referral Claims" },
  { key: "auracheck:v1:challenge_entries", label: "Challenge Entries" },
  { key: "auracheck:v1:progress_comparisons", label: "Progress Comparisons" },
  { key: "auracheck:v1:analytics", label: "Analytics Events" },
  { key: "auracheck:v1:affiliate_clicks", label: "Affiliate Clicks" },
  { key: "auracheck:v1:user_preferences", label: "User Preferences" },
  { key: "auracheck:v1:onboarding", label: "Onboarding State" },
  { key: "auracheck:v1:founder_checklist", label: "Founder Checklist" },
];

export function getStorageSummary(): StorageSummary {
  const available = typeof window !== "undefined" && typeof localStorage !== "undefined";
  let totalBytes = 0;
  const entries: StorageSummaryEntry[] = [];

  if (!available) {
    return { entries, totalEstimatedBytes: 0, localStorageAvailable: false };
  }

  for (const config of STORE_CONFIGS) {
    try {
      const raw = localStorage.getItem(config.key);
      if (!raw) {
        entries.push({ ...config, count: 0, estimatedBytes: 0 });
        continue;
      }
      const data = JSON.parse(raw);
      const bytes = new Blob([raw]).size;
      totalBytes += bytes;
      const count = Array.isArray(data) ? data.length : (data && typeof data === "object" ? Object.keys(data).length : 1);
      let lastUpdated: string | undefined;
      if (Array.isArray(data) && data.length > 0) {
        const withDates = data.filter((item: Record<string, unknown>) => item.createdAt || item.claimedAt || item.timestamp);
        if (withDates.length > 0) {
          const sorted = withDates.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const da = new Date((a.createdAt || a.claimedAt || a.timestamp) as string).getTime();
            const db = new Date((b.createdAt || b.claimedAt || b.timestamp) as string).getTime();
            return db - da;
          });
          lastUpdated = (sorted[0].createdAt || sorted[0].claimedAt || sorted[0].timestamp) as string;
        }
      }
      entries.push({ ...config, count, estimatedBytes: bytes, lastUpdated });
    } catch {
      entries.push({ ...config, count: 0, estimatedBytes: 0 });
    }
  }

  return { entries, totalEstimatedBytes: totalBytes, localStorageAvailable: true };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function estimateLocalStorageUsage(): { used: number; total: number; percentage: number } {
  if (typeof window === "undefined") return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key);
      if (val) used += key.length + val.length;
    }
  }
  const total = 5 * 1024 * 1024;
  return { used, total, percentage: (used / total) * 100 };
}
