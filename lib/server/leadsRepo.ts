import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { LeadInsert, LeadUpdate } from "@/lib/supabase/types";

export async function createLead(input: LeadInsert) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(`Failed to create lead: ${error.message}`);
  return data as LeadInsert & { id: string; created_at: string };
}

export async function listLeads(limit = 50) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to list leads: ${error.message}`);
  return (data as (LeadInsert & { id: string; created_at: string })[]) || [];
}

export async function updateLead(id: string, updates: LeadUpdate) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update lead: ${error.message}`);
  return data as LeadInsert & { id: string; created_at: string };
}

export async function deleteLead(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete lead: ${error.message}`);
}
