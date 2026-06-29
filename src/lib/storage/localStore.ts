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
    const keys = [
      "auracheck:v1:audits", "auracheck:v1:user", "auracheck:v1:settings",
      "auracheck:v1:unlocks", "auracheck:v1:orders", "auracheck:v1:analytics",
      "auracheck:v1:leads", "auracheck:v1:referral_profile", "auracheck:v1:referral_claims",
      "auracheck:v1:challenge_entries", "auracheck:v1:progress_comparisons", "auracheck:v1:onboarding",
    ];
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    console.warn("Failed to clear localStorage");
  }
}
