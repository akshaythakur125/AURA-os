import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AuditInsert, AuditUpdate } from "@/lib/supabase/types";

export async function createAudit(input: AuditInsert) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("audits")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(`Failed to create audit: ${error.message}`);
  return data as AuditInsert & { id: string; created_at: string };
}

export async function getAuditById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as AuditInsert & { id: string; created_at: string; updated_at: string } | null;
}

export async function updateAudit(id: string, updates: AuditUpdate) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("audits")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update audit: ${error.message}`);
  return data as AuditInsert & { id: string; created_at: string; updated_at: string };
}

export async function listRecentAudits(limit = 50) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to list audits: ${error.message}`);
  return (data as (AuditInsert & { id: string; created_at: string; updated_at: string })[]) || [];
}

export async function deleteAudit(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("audits").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete audit: ${error.message}`);
}
