const ANON_ID_KEY = "auracheck:v1:anonymous_id";

export function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(ANON_ID_KEY);
    if (id) return id;
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }
    localStorage.setItem(ANON_ID_KEY, id);
    return id;
  } catch {
    return "";
  }
}
