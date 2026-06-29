"use client";

import { isBrowser } from "./localStore";
import { STORAGE_KEYS } from "./storageKeys";

export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed !== null && typeof parsed === "object") return parsed as T;
    return fallback;
  } catch {
    return fallback;
  }
}

export function estimateLocalStorageUsage(): { totalBytes: number; keys: Record<string, number> } {
  if (!isBrowser()) return { totalBytes: 0, keys: {} };
  const keys: Record<string, number> = {};
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    const v = localStorage.getItem(k);
    const bytes = (k.length + (v?.length || 0)) * 2;
    keys[k] = bytes;
    totalBytes += bytes;
  }
  return { totalBytes, keys };
}

export function checkStorageAvailability(): { available: boolean; isPrivateMode: boolean | null; error: string | null } {
  if (!isBrowser()) return { available: false, isPrivateMode: null, error: "Not in browser" };
  try {
    const test = "__auracheck_test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return { available: true, isPrivateMode: false, error: null };
  } catch {
    try {
      const test = "__auracheck_test__";
      sessionStorage.setItem(test, "1");
      sessionStorage.removeItem(test);
      return { available: false, isPrivateMode: true, error: "localStorage unavailable (private mode may block it). Using sessionStorage as fallback." };
    } catch {
      return { available: false, isPrivateMode: null, error: "localStorage and sessionStorage are both unavailable." };
    }
  }
}

export function detectCorruptStore(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    JSON.parse(raw);
    return null;
  } catch {
    return `Corrupted data detected for key "${key}". You can repair or clear it.`;
  }
}

export function repairKnownStores(): string[] {
  if (!isBrowser()) return [];
  const repairs: string[] = [];
  const knownKeys = Object.values(STORAGE_KEYS);
  for (const key of knownKeys) {
    const error = detectCorruptStore(key);
    if (error) {
      try {
        localStorage.setItem(key, JSON.stringify([]));
        repairs.push(`Repaired key: ${key}`);
      } catch {
        repairs.push(`Failed to repair key: ${key}`);
      }
    }
  }
  return repairs;
}

export function isLowOnStorage(): boolean {
  if (!isBrowser()) return false;
  try {
    const test = "__auracheck_size_test__";
    const largeStr = "x".repeat(1024 * 100);
    localStorage.setItem(test, largeStr);
    localStorage.removeItem(test);
    return false;
  } catch {
    return true;
  }
}

export function formatStorageBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
