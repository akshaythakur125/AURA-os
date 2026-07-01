export function getSupabaseUrl(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getServiceRoleKey(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function isSupabaseConfigured(): boolean {
  return !!(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getAppUrl(): string {
  if (typeof process === "undefined") return "http://localhost:3000";
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
