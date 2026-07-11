import { getSupabaseClient } from "@/lib/supabase/client";

// ponytail: order + entitlement layer — Supabase when configured, Razorpay verification fallback

export type OrderStatus = "created" | "pending" | "paid" | "failed" | "cancelled" | "refunded";

export type Order = {
  id: string;
  auditId: string;
  productId: string;
  currency: string;
  unitAmount: number;
  totalAmount: number;
  status: OrderStatus;
  provider: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
};

export type Entitlement = {
  id: string;
  orderId: string;
  auditId: string;
  productId: string;
  status: "active" | "expired" | "revoked";
  startsAt: string;
  expiresAt: string | null;
};

/** Create an order after Razorpay order creation */
export async function createOrder(input: {
  auditId: string;
  productId: string;
  unitAmount: number;
  providerOrderId: string;
}): Promise<Order | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null; // No DB — fallback to Razorpay verification

  const { data, error } = await supabase
    .from("orders")
    .insert({
      audit_id: input.auditId,
      product_id: input.productId,
      currency: "INR",
      unit_amount: input.unitAmount,
      total_amount: input.unitAmount,
      status: "pending",
      provider: "razorpay",
      provider_order_id: input.providerOrderId,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapOrder(data);
}

/** Finalize order after verified payment */
export async function finalizeOrder(providerOrderId: string, providerPaymentId: string): Promise<{ order: Order | null; entitlement: Entitlement | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { order: null, entitlement: null };

  // Idempotent: if already paid, return existing
  const { data: existing } = await supabase
    .from("orders")
    .select("*")
    .eq("provider_order_id", providerOrderId)
    .single();

  if (existing?.status === "paid") {
    const ent = await getEntitlement(existing.audit_id, existing.product_id);
    return { order: mapOrder(existing), entitlement: ent };
  }

  // Update order
  const { data: order } = await supabase
    .from("orders")
    .update({
      status: "paid",
      provider_payment_id: providerPaymentId,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("provider_order_id", providerOrderId)
    .select()
    .single();

  if (!order) return { order: null, entitlement: null };

  // Create entitlement (idempotent — unique index prevents duplicates)
  const { data: ent } = await supabase
    .from("entitlements")
    .insert({
      order_id: order.id,
      audit_id: order.audit_id,
      product_id: order.product_id,
      status: "active",
    })
    .select()
    .single();

  return { order: mapOrder(order), entitlement: ent ? mapEntitlement(ent) : null };
}

/** Check if an audit has an active entitlement */
export async function getEntitlement(auditId: string, productId: string): Promise<Entitlement | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("entitlements")
    .select("*")
    .eq("audit_id", auditId)
    .eq("product_id", productId)
    .eq("status", "active")
    .limit(1)
    .single();

  return data ? mapEntitlement(data) : null;
}

/** Get all orders for order history */
export async function getOrders(limit = 20): Promise<Order[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).map(mapOrder);
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    auditId: row.audit_id as string,
    productId: row.product_id as string,
    currency: row.currency as string,
    unitAmount: row.unit_amount as number,
    totalAmount: row.total_amount as number,
    status: row.status as OrderStatus,
    provider: row.provider as string,
    providerOrderId: row.provider_order_id as string | null,
    providerPaymentId: row.provider_payment_id as string | null,
    paymentMethod: row.payment_method as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    paidAt: row.paid_at as string | null,
  };
}

function mapEntitlement(row: Record<string, unknown>): Entitlement {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    auditId: row.audit_id as string,
    productId: row.product_id as string,
    status: row.status as "active" | "expired" | "revoked",
    startsAt: row.starts_at as string,
    expiresAt: row.expires_at as string | null,
  };
}
