import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AnalyticsEventInsert } from "@/lib/supabase/types";

export async function trackEvent(input: AnalyticsEventInsert) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("analytics_events")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(`Failed to track event: ${error.message}`);
  return data as AnalyticsEventInsert & { id: string; created_at: string };
}

export async function listEvents(limit = 100) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to list events: ${error.message}`);
  return (data as (AnalyticsEventInsert & { id: string; created_at: string })[]) || [];
}

export async function getAnalyticsSummary() {
  const supabase = getSupabaseAdmin();
  const { data: events, error } = await supabase
    .from("analytics_events")
    .select("event_name, created_at");
  if (error) throw new Error(`Failed to get analytics summary: ${error.message}`);

  const items = (events || []) as { event_name: string; created_at: string }[];
  const total = items.length;
  const byEvent: Record<string, number> = {};
  for (const e of items) {
    byEvent[e.event_name] = (byEvent[e.event_name] || 0) + 1;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEvents = items.filter(
    (e) => new Date(e.created_at) >= today
  ).length;

  return { total, todayEvents, byEvent };
}
