import { getSupabaseAdminClient } from "@/lib/supabase/adminClient";

// ponytail: server-side sales ledger for reconciliation.
//
// Writes go through the service-role client (bypasses RLS) — `orders` and
// `product_unlocks` have RLS enabled with no anon policies, so the browser can
// neither read nor write them. Every function degrades to a safe no-op when the
// admin client is unavailable (browser, or unconfigured env), and NEVER throws:
// the payment/unlock UX must succeed even if the ledger write fails.
//
// The exported Order/Entitlement types are kept stable for existing consumers
// (ReceiptView, /orders). Only the SQL columns are mapped to the live schema:
//   orders(product_type, original_amount, discount_amount, final_amount,
//          razorpay_order_id, razorpay_payment_id, webhook_verified, unlocked_at)
//   product_unlocks(order_id, audit_id, product_type, unlock_method, unlocked_at)
// Amounts are stored in paise (matching Razorpay + config/pricing + formatPrice).

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

/**
 * Record a pending order right after the Razorpay order is created. Amounts are
 * in paise. Safe no-op (returns null) if the ledger is unavailable.
 */
export async function recordPendingOrder(input: {
  auditId: string;
  productType: string;
  productName: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountCode?: string | null;
  razorpayOrderId: string;
}): Promise<Order | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  try {
    const base = {
      product_type: input.productType,
      product_name: input.productName,
      original_amount: input.originalAmount,
      discount_code: input.discountCode || null,
      discount_amount: input.discountAmount,
      final_amount: input.finalAmount,
      currency: "INR",
      status: "created",
      razorpay_order_id: input.razorpayOrderId,
      webhook_verified: false,
    };
    const linkedAuditId = isUuid(input.auditId) ? input.auditId : null;

    // orders.audit_id has an FK to audits — the audit is only there if its
    // best-effort browser sync succeeded. Try linked first; if the FK fails,
    // record the sale unlinked (audit_id = null) so the ledger never drops it.
    let { data, error } = await supabase
      .from("orders")
      .insert({ ...base, audit_id: linkedAuditId })
      .select()
      .single();
    if (error && linkedAuditId) {
      ({ data, error } = await supabase
        .from("orders")
        .insert({ ...base, audit_id: null })
        .select()
        .single());
    }
    if (error || !data) return null;
    return mapOrder(data);
  } catch {
    return null;
  }
}

/**
 * Finalize an order after a verified payment: mark it paid and record the
 * entitlement in product_unlocks. Idempotent — safe to call from both the
 * verify route and the webhook. Never throws.
 */
export async function finalizeOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<{ order: Order | null; entitlement: Entitlement | null }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { order: null, entitlement: null };
  try {
    const { data: existing } = await supabase
      .from("orders")
      .select("*")
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();

    // Already finalized → return existing entitlement (idempotent).
    if (existing && (existing.status === "paid" || existing.unlocked_at)) {
      const ent = await getEntitlement(existing.audit_id, existing.product_type);
      return { order: mapOrder(existing), entitlement: ent };
    }

    const now = new Date().toISOString();
    const { data: order } = await supabase
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id: razorpayPaymentId,
        webhook_verified: true,
        unlocked_at: now,
        updated_at: now,
      })
      .eq("razorpay_order_id", razorpayOrderId)
      .select()
      .maybeSingle();

    // No matching pending row (ledger insert was skipped/failed at create time).
    // The sale is still safe in the Razorpay dashboard; we just can't attach an
    // entitlement without the order context, so record nothing here.
    if (!order) return { order: null, entitlement: null };

    const ent = await upsertUnlock(order.id, order.audit_id, order.product_type);
    return { order: mapOrder(order), entitlement: ent };
  } catch {
    return { order: null, entitlement: null };
  }
}

/** Idempotent product_unlocks insert (no unique index assumed → guard first). */
async function upsertUnlock(orderId: string, auditId: string | null, productType: string): Promise<Entitlement | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  try {
    const existing = await getEntitlement(auditId, productType);
    if (existing) return existing;
    const { data } = await supabase
      .from("product_unlocks")
      .insert({
        order_id: orderId,
        audit_id: auditId,
        product_type: productType,
        unlock_method: "razorpay",
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();
    return data ? mapUnlock(data) : null;
  } catch {
    return null;
  }
}

/** Check whether an audit already has an unlock for a product. */
export async function getEntitlement(auditId: string | null, productType: string): Promise<Entitlement | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || !auditId) return null;
  try {
    const { data } = await supabase
      .from("product_unlocks")
      .select("*")
      .eq("audit_id", auditId)
      .eq("product_type", productType)
      .limit(1)
      .maybeSingle();
    return data ? mapUnlock(data) : null;
  } catch {
    return null;
  }
}

/** Recent orders for reconciliation (server-side / admin only). */
export async function getOrders(limit = 20): Promise<Order[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data || []).map(mapOrder);
  } catch {
    return [];
  }
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function mapOrder(row: Record<string, unknown>): Order {
  const amount = (row.final_amount as number) ?? 0;
  return {
    id: row.id as string,
    auditId: (row.audit_id as string) ?? "",
    productId: row.product_type as string,
    currency: (row.currency as string) ?? "INR",
    unitAmount: amount,
    totalAmount: amount,
    status: row.status as OrderStatus,
    provider: "razorpay",
    providerOrderId: (row.razorpay_order_id as string) ?? null,
    providerPaymentId: (row.razorpay_payment_id as string) ?? null,
    paymentMethod: null,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? (row.created_at as string),
    paidAt: (row.unlocked_at as string) ?? null,
  };
}

function mapUnlock(row: Record<string, unknown>): Entitlement {
  return {
    id: row.id as string,
    orderId: (row.order_id as string) ?? "",
    auditId: (row.audit_id as string) ?? "",
    productId: row.product_type as string,
    status: "active",
    startsAt: (row.unlocked_at as string) ?? new Date().toISOString(),
    expiresAt: null,
  };
}
