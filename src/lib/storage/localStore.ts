export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`Failed to write localStorage key "${key}"`);
  }
}

export function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`Failed to remove localStorage key "${key}"`);
  }
}

const ALL_STORAGE_PREFIXES = [
  "auracheck:v1:",
];

function getAllAuraKeys(): string[] {
  if (!isBrowser()) return [];
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && ALL_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      keys.push(key);
    }
  }
  return keys;
}

export function clearAll(): void {
  if (!isBrowser()) return;
  try {
    const keys = getAllAuraKeys();
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    console.warn("Failed to clear localStorage");
  }
}

export function getStorageUsage(): { usedBytes: number; totalKeys: number; percentage: number } {
  if (!isBrowser()) return { usedBytes: 0, totalKeys: 0, percentage: 0 };
  let totalBytes = 0;
  let totalKeys = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("auracheck:")) {
      totalKeys++;
      const value = localStorage.getItem(key) || "";
      totalBytes += key.length + value.length;
    }
  }
  const maxSize = 5 * 1024 * 1024;
  return { usedBytes: totalBytes, totalKeys, percentage: Math.round((totalBytes / maxSize) * 100) };
}
