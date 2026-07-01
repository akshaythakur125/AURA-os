export function isSupabaseConfigured(): boolean {
  if (typeof process === "undefined") return false;
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export type StorageMode = "local" | "supabase";

export function getStorageMode(): StorageMode {
  return isSupabaseConfigured() ? "supabase" : "local";
}

export function shouldUseSupabase(): boolean {
  return isSupabaseConfigured();
}

export function getAppUrl(): string {
  if (typeof process === "undefined") return "http://localhost:3000";
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
