export interface DataSnapshot {
  version: 1;
  exportedAt: string;
  stores: Record<string, unknown>;
}

const STORE_KEYS = [
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

export function exportAllData(): DataSnapshot {
  const stores: Record<string, unknown> = {};
  if (typeof window === "undefined") return { version: 1, exportedAt: new Date().toISOString(), stores };

  for (const key of STORE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        stores[key] = JSON.parse(raw);
      }
    } catch {
      // skip corrupt stores
    }
  }

  return { version: 1, exportedAt: new Date().toISOString(), stores };
}

export function downloadSnapshot(): void {
  const data = exportAllData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auracheck-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function validateSnapshot(json: string): { valid: boolean; message: string; data?: DataSnapshot } {
  try {
    const data = JSON.parse(json) as DataSnapshot;
    if (!data || typeof data !== "object") return { valid: false, message: "Invalid JSON structure." };
    if (data.version !== 1) return { valid: false, message: "Unsupported backup version." };
    if (!data.exportedAt) return { valid: false, message: "Missing export date." };
    if (!data.stores || typeof data.stores !== "object") return { valid: false, message: "Missing stores data." };
    return { valid: true, message: `Found ${Object.keys(data.stores).length} store(s).`, data };
  } catch {
    return { valid: false, message: "Invalid JSON file." };
  }
}

export function importAllData(snapshot: DataSnapshot, mode: "merge" | "replace"): { success: boolean; message: string; imported: number } {
  if (typeof window === "undefined") return { success: false, message: "Cannot import on server.", imported: 0 };

  let imported = 0;
  for (const [key, value] of Object.entries(snapshot.stores)) {
    try {
      if (mode === "replace") {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        const existing = localStorage.getItem(key);
        if (existing) {
          const existingParsed = JSON.parse(existing);
          if (Array.isArray(existingParsed) && Array.isArray(value)) {
            const merged = [...(value as unknown[]), ...existingParsed];
            localStorage.setItem(key, JSON.stringify(merged));
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
      imported++;
    } catch {
      // skip failed store
    }
  }
  return { success: true, message: `Imported ${imported} store(s) in ${mode} mode.`, imported };
}
