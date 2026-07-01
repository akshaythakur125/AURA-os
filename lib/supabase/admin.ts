import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  getSupabaseUrl,
  getServiceRoleKey,
} from "./env";

let adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error(
      "getSupabaseAdmin() is server-only. Do not import into client components."
    );
  }

  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const serviceRoleKey = getServiceRoleKey();
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. This is required for server-side admin operations."
    );
  }

  if (adminClient) return adminClient;

  const url = getSupabaseUrl()!;
  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
