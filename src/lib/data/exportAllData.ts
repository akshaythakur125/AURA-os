"use client";

import { getItem } from "@/lib/storage/localStore";
import { STORAGE_KEYS } from "@/lib/storage/storageKeys";

export interface ExportedData {
  version: string;
  exportedAt: string;
  appName: string;
  data: Record<string, unknown>;
}

export function exportAllData(): ExportedData {
  if (typeof window === "undefined") {
    return { version: "1.0", exportedAt: new Date().toISOString(), appName: "AuraCheck", data: {} };
  }

  const data: Record<string, unknown> = {};
  const keys = Object.values(STORAGE_KEYS);

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          data[key] = JSON.parse(raw);
        } catch {
          data[key] = raw;
        }
      }
    } catch {
      data[key] = null;
    }
  }

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    appName: "AuraCheck",
    data,
  };
}

export function downloadExport(data: ExportedData): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auracheck-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
