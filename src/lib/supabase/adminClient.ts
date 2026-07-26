import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service-role key. It bypasses RLS, so
// it must NEVER be imported into client code that ships to the browser. In the
// browser `SUPABASE_SERVICE_ROLE_KEY` is undefined (Next.js only inlines
// NEXT_PUBLIC_* vars), so this returns null there — a second safety net on top
// of "don't import it client-side". Used for the sales ledger (orders +
// product_unlocks), which has RLS enabled with no anon policies.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _admin: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (_admin) return _admin;
  _admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
