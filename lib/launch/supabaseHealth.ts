import type { LaunchCheck } from "@/types/launch";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";

const REQUIRED_TABLES = [
  "audits", "orders", "product_unlocks", "analytics_events",
  "commerce_products", "commerce_offers", "commerce_clicks",
  "commerce_search_index", "funnel_events", "visual_wardrobe_diagnoses",
];

export async function checkSupabaseHealth(): Promise<{ checks: LaunchCheck[]; configured: boolean; tableStatus: Record<string, boolean> }> {
  const checks: LaunchCheck[] = [];
  const tableStatus: Record<string, boolean> = {};

  const configured = isSupabaseConfigured();
  checks.push({
    name: "Supabase configured",
    status: configured ? "pass" : "fail",
    message: configured ? "Supabase URL and anon key are set" : "Supabase not configured — app runs in localStorage mode",
  });

  if (!configured) {
    return { checks, configured: false, tableStatus };
  }

  // Check service role
  const serviceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  checks.push({
    name: "Service role key",
    status: serviceRole ? "pass" : "warning",
    message: serviceRole ? "Service role key is set" : "Service role key not set — admin operations limited",
  });

  // Try to reach tables
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    for (const table of REQUIRED_TABLES) {
      try {
        const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
        tableStatus[table] = !error;
        if (error) {
          checks.push({ name: `Table: ${table}`, status: "warning", message: `Table "${table}" may not exist or is inaccessible` });
        }
      } catch {
        tableStatus[table] = false;
      }
    }

    // Check storage bucket
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.name === "audit-images");
      checks.push({
        name: "Storage bucket: audit-images",
        status: hasBucket ? "pass" : "warning",
        message: hasBucket ? "audit-images bucket exists" : "audit-images bucket not found — create in Supabase dashboard",
      });
    } catch {
      checks.push({ name: "Storage bucket check", status: "warning", message: "Could not check storage buckets" });
    }

    checks.push({
      name: "RLS policies",
      status: "manual",
      message: "Confirm RLS policies are reviewed before production. Default service_role access may not be secure.",
    });
  } catch {
    checks.push({ name: "Supabase connection", status: "fail", message: "Failed to connect to Supabase" });
  }

  return { checks, configured: true, tableStatus };
}
