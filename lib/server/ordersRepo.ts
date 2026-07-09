import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { OrderInsert, OrderUpdate } from "@/lib/supabase/types";

export async function createOrder(input: OrderInsert) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .insert(input as never)
    .select()
    .single();
  if (error) throw new Error(`Failed to create order: ${error.message}`);
  return data as OrderInsert & { id: string; created_at: string };
}

export async function getOrderById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as OrderInsert & { id: string; created_at: string; updated_at: string } | null;
}

export async function getOrdersByAuditId(auditId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("audit_id", auditId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to get orders: ${error.message}`);
  return (data as (OrderInsert & { id: string; created_at: string; updated_at: string })[]) || [];
}

export async function updateOrder(id: string, updates: OrderUpdate) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update order: ${error.message}`);
  return data as OrderInsert & { id: string; created_at: string; updated_at: string };
}

export async function listOrders(limit = 50) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to list orders: ${error.message}`);
  return (data as (OrderInsert & { id: string; created_at: string; updated_at: string })[]) || [];
}

export async function getOrderStats() {
  const supabase = getSupabaseAdmin();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("product_type, status, final_amount, discount_code");
  if (error) throw new Error(`Failed to get order stats: ${error.message}`);

  const items = (orders || []) as { product_type: string | null; status: string | null; final_amount: number | null; discount_code: string | null }[];
  const total = items.length;
  const completed = items.filter((o) => o.status === "completed").length;
  const pending = items.filter((o) => o.status === "pending").length;
  const totalRevenue = items
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.final_amount || 0), 0);
  const discountCount = items.filter((o) => o.discount_code).length;
  const byProduct = items.reduce<Record<string, number>>((acc, o) => {
    const pt = o.product_type || "unknown";
    acc[pt] = (acc[pt] || 0) + 1;
    return acc;
  }, {});

  return { total, completed, pending, totalRevenue, discountCount, byProduct };
}
