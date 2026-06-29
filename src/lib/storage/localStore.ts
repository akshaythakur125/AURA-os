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

export function clearAll(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem("auracheck:v1:audits");
    localStorage.removeItem("auracheck:v1:user");
    localStorage.removeItem("auracheck:v1:settings");
    localStorage.removeItem("auracheck:v1:unlocks");
    localStorage.removeItem("auracheck:v1:orders");
    localStorage.removeItem("auracheck:v1:analytics");
  } catch {
    console.warn("Failed to clear localStorage");
  }
}
