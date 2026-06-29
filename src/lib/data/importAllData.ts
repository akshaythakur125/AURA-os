"use client";

import { setItem } from "@/lib/storage/localStore";
import { STORAGE_KEYS } from "@/lib/storage/storageKeys";
import type { ExportedData } from "./exportAllData";

export interface ImportResult {
  success: boolean;
  importedKeys: string[];
  skippedKeys: string[];
  errors: string[];
}

export function validateImportData(json: string): { valid: boolean; data: ExportedData | null; error: string | null } {
  try {
    const parsed = JSON.parse(json);

    if (!parsed || typeof parsed !== "object") {
      return { valid: false, data: null, error: "Invalid format: expected a JSON object." };
    }

    if (parsed.appName !== "AuraCheck") {
      return { valid: false, data: null, error: "This backup does not appear to be from AuraCheck." };
    }

    if (!parsed.data || typeof parsed.data !== "object") {
      return { valid: false, data: null, error: "Missing or invalid 'data' field." };
    }

    if (!parsed.version) {
      return { valid: false, data: null, error: "Missing version field." };
    }

    return { valid: true, data: parsed as ExportedData, error: null };
  } catch {
    return { valid: false, data: null, error: "Invalid JSON file. Please check the file and try again." };
  }
}

export function importAllData(exported: ExportedData, mode: "merge" | "replace"): ImportResult {
  if (typeof window === "undefined") {
    return { success: false, importedKeys: [], skippedKeys: [], errors: ["Not in browser"] };
  }

  const importedKeys: string[] = [];
  const skippedKeys: string[] = [];
  const errors: string[] = [];
  const validKeys = new Set(Object.values(STORAGE_KEYS) as string[]);

  for (const [key, value] of Object.entries(exported.data)) {
    if (!validKeys.has(key as string)) {
      skippedKeys.push(key);
      continue;
    }

    try {
      if (mode === "replace") {
        setItem(key, value);
      } else {
        const existing = JSON.parse(localStorage.getItem(key) || "null");
        if (existing && Array.isArray(existing) && Array.isArray(value)) {
          const merged = [...existing, ...value];
          setItem(key, merged);
        } else if (existing && typeof existing === "object" && typeof value === "object" && !Array.isArray(existing) && !Array.isArray(value)) {
          setItem(key, { ...existing, ...value });
        } else {
          setItem(key, value);
        }
      }
      importedKeys.push(key);
    } catch {
      errors.push(`Failed to import key: ${key}`);
    }
  }

  return {
    success: errors.length === 0,
    importedKeys,
    skippedKeys,
    errors,
  };
}
