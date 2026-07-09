import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generatePaidProductForAudit } from "@/lib/payments/generatePaidProduct";
import { isValidProductType } from "@/lib/payments/productCatalog";
import type { ProductType } from "@/lib/payments/productCatalog";

export type UnlockMethod =
  | "razorpay_verify"
  | "razorpay_webhook"
  | "manual_code"
  | "founder_code"
  | "recovery";

export interface UnlockInput {
  auditId: string;
  orderId?: string;
  productType: string;
  unlockMethod: UnlockMethod;
  paymentId?: string;
  razorpayOrderId?: string;
  metadata?: Record<string, unknown>;
}

export interface UnlockResult {
  success: boolean;
  alreadyUnlocked: boolean;
  productType: string;
  auditId: string;
  orderId?: string;
}

export async function unlockPaidProduct(input: UnlockInput): Promise<UnlockResult> {
  const { auditId, orderId, productType, unlockMethod, paymentId, razorpayOrderId, metadata } = input;

  if (!auditId) {
    throw new Error("auditId is required");
  }

  if (!productType || !isValidProductType(productType)) {
    throw new Error(`Invalid product type: ${productType}`);
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  // 1. Load audit
  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .select("*")
    .eq("id", auditId)
    .single();

  if (auditError || !audit) {
    throw new Error("Audit not found");
  }

  const auditRow = audit as Record<string, unknown>;

  // 2. Idempotency: check if already unlocked
  const unlockedProducts: string[] = (auditRow.unlocked_products as string[]) || [];
  if (unlockedProducts.includes(productType)) {
    return {
      success: true,
      alreadyUnlocked: true,
      productType,
      auditId,
      orderId,
    };
  }

  // 3. Update order if provided
  if (orderId) {
    const orderUpdate: Record<string, unknown> = {
      status: "unlocked",
      unlocked_at: now,
    };

    if (paymentId) {
      orderUpdate.razorpay_payment_id = paymentId;
    }

    await supabase
      .from("orders")
      .update(orderUpdate as never)
      .eq("id", orderId);
  }

  // 4. Generate paid report
  const report = generatePaidProductForAudit(audit as never, productType as ProductType);

  // 5. Update audit
  const newUnlockedProducts = [...unlockedProducts, productType];

  const auditUpdate: Record<string, unknown> = {
    unlocked_products: newUnlockedProducts,
    unlock_status: "unlocked",
    report_status: productType === "quick_fix" ? "quick_fix_ready" : "complete",
    updated_at: now,
  };

  switch (productType) {
    case "quick_fix":
      auditUpdate.quick_fix_report = report;
      break;
    case "aura_report":
      auditUpdate.full_report = report;
      break;
    case "dating_audit":
      auditUpdate.dating_profile_report = report;
      break;
    case "glowup_plan":
      auditUpdate.glowup_plan = report;
      break;
  }

  const { error: auditUpdateError } = await supabase
    .from("audits")
    .update(auditUpdate as never)
    .eq("id", auditId);

  if (auditUpdateError) {
    throw new Error(`Failed to update audit: ${auditUpdateError.message}`);
  }

  // 6. Create product_unlocks row
  const unlockInsert: Record<string, unknown> = {
    audit_id: auditId,
    order_id: orderId || null,
    product_type: productType,
    unlock_method: unlockMethod,
    unlocked_at: now,
  };

  await supabase
    .from("product_unlocks")
    .insert(unlockInsert as never);

  // 7. Track analytics events (fire-and-forget)
  const events: Record<string, unknown>[] = [
    {
      event_name: "product_unlocked",
      audit_id: auditId,
      order_id: orderId || null,
      product_type: productType,
      metadata: { method: unlockMethod, razorpay_order_id: razorpayOrderId || null, ...(metadata || {}) },
    },
  ];

  if (unlockMethod === "razorpay_webhook") {
    events.push({
      event_name: "product_unlocked_by_webhook",
      audit_id: auditId,
      order_id: orderId || null,
      product_type: productType,
      metadata: { razorpay_order_id: razorpayOrderId || null },
    });
  }

  try {
    await supabase.from("analytics_events").insert(events as never);
  } catch {
    // Analytics failure must not block unlock
  }

  return {
    success: true,
    alreadyUnlocked: false,
    productType,
    auditId,
    orderId,
  };
}
