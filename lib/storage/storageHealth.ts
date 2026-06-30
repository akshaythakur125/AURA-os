export interface StorageHealthResult {
  localStorageAvailable: boolean;
  estimatedUsage: number;
  estimatedUsageFormatted: string;
  estimatedPercentage: number;
  warning: string | null;
  corruptStores: string[];
}

const ALL_STORES = [
  "auracheck:v1:audits",
  "auracheck:v1:orders",
  "auracheck:v1:unlocks",
  "auracheck:v1:leads",
  "auracheck:v1:referral_profile",
  "auracheck:v1:referral_claims",
  "auracheck:v1:challenge_entries",
  "auracheck:v1:progress_comparisons",
  "auracheck:v1:analytics",
  "auracheck:v1:affiliate_clicks",
  "auracheck:v1:user_preferences",
  "auracheck:v1:onboarding",
  "auracheck:v1:founder_checklist",
];

export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function detectCorruptStore(key: string): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    JSON.parse(raw);
    return false;
  } catch {
    return true;
  }
}

export function checkStorageAvailability(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function repairKnownStores(): { repaired: number; failed: number } {
  let repaired = 0;
  let failed = 0;

  for (const key of ALL_STORES) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      JSON.parse(raw);
    } catch {
      try {
        localStorage.removeItem(key);
        repaired++;
      } catch {
        failed++;
      }
    }
  }

  return { repaired, failed };
}

export function estimateLocalStorageUsage(): { used: number; total: number; percentage: number; usedFormatted: string; totalFormatted: string } {
  if (typeof window === "undefined") return { used: 0, total: 5 * 1024 * 1024, percentage: 0, usedFormatted: "0 B", totalFormatted: "5 MB" };
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key);
      if (val) used += key.length * 2 + val.length * 2;
    }
  }
  const total = 5 * 1024 * 1024;
  const fmt = (b: number) => b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return { used, total, percentage: (used / total) * 100, usedFormatted: fmt(used), totalFormatted: fmt(total) };
}

export function getStorageHealth(): StorageHealthResult {
  const available = checkStorageAvailability();
  const usage = estimateLocalStorageUsage();
  const corruptStores: string[] = [];

  if (available) {
    for (const key of ALL_STORES) {
      if (detectCorruptStore(key)) corruptStores.push(key);
    }
  }

  let warning: string | null = null;
  if (!available) {
    warning = "localStorage is not available. Data will not persist between sessions.";
  } else if (usage.percentage > 80) {
    warning = `Storage usage is high (${usage.usedFormatted} / ${usage.totalFormatted}). Consider exporting and clearing old data.`;
  } else if (corruptStores.length > 0) {
    warning = `${corruptStores.length} store(s) appear corrupt. Try repairing them.`;
  }

  return {
    localStorageAvailable: available,
    estimatedUsage: usage.used,
    estimatedUsageFormatted: usage.usedFormatted,
    estimatedPercentage: usage.percentage,
    warning,
    corruptStores,
  };
}
