import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isRazorpayWebhookConfigured,
  verifyRazorpayWebhookSignature,
  parseRazorpayWebhookEvent,
} from "@/lib/razorpay/webhook";
import { unlockPaidProduct } from "@/lib/payments/unlockPaidProduct";
import { rupeesToPaise } from "@/lib/payments/amounts";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Supabase must be configured (webhooks need a database)
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    // 2. Webhook secret must be configured
    if (!isRazorpayWebhookConfigured()) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // 3. Read raw body
    const rawBody = await request.text();

    // 4. Read signature header
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Razorpay signature" }, { status: 400 });
    }

    // 5. Verify signature
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      // Track invalid signature event
      try {
        const supabase = getSupabaseAdmin();
        await supabase.from("analytics_events").insert({
          event_name: "razorpay_webhook_invalid_signature",
          metadata: { signature_provided: true },
        } as never);
      } catch {
        // analytics failure must not crash
      }

      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // 6. Parse event
    const event = parseRazorpayWebhookEvent(rawBody);
    const supabase = getSupabaseAdmin();

    // Track webhook received (fire-and-forget)
    try {
      await supabase.from("analytics_events").insert({
        event_name: "razorpay_webhook_received",
        metadata: { event_type: event.event },
      } as never);
    } catch {
      // no-op
    }

    // 7. Handle specific events
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event, supabase);
        break;
      case "payment.failed":
        await handlePaymentFailed(event, supabase);
        break;
      case "order.paid":
        await handleOrderPaid(event, supabase);
        break;
      default:
        // Unsupported events are silently ignored — always return 200
        break;
    }

    // 8. Always return 200 to Razorpay
    return NextResponse.json({ received: true, event: event.event }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── payment.captured ───
async function handlePaymentCaptured(
  event: ReturnType<typeof parseRazorpayWebhookEvent>,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  const payment = event.payload?.payment?.entity;
  if (!payment) return;

  const razorpayPaymentId = payment.id;
  const razorpayOrderId = payment.order_id;
  const capturedAmountPaise = payment.amount;
  const currency = payment.currency || "INR";

  // Find Supabase order by razorpay_order_id
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();

  if (orderError || !order) {
    // Unmatched webhook — log and return
    try {
      await supabase.from("analytics_events").insert({
        event_name: "razorpay_webhook_unmatched",
        metadata: {
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
        },
      } as never);
    } catch {
      // no-op
    }
    return;
  }

  const orderRow = order as Record<string, unknown>;

  // Check if already unlocked or paid_verified
  if (orderRow.status === "unlocked" || orderRow.status === "paid_verified") {
    // Already processed — idempotent
    return;
  }

  // Validate currency
  if (currency !== "INR") {
    return;
  }

  // Validate amount (Razorpay sends paise; our amounts are in rupees)
  const expectedPaise = rupeesToPaise((orderRow.final_amount as number) || 0);
  if (capturedAmountPaise !== expectedPaise) {
    try {
      await supabase.from("analytics_events").insert({
        event_name: "razorpay_amount_mismatch",
        order_id: orderRow.id,
        metadata: {
          expected_paise: expectedPaise,
          captured_paise: capturedAmountPaise,
          razorpay_payment_id: razorpayPaymentId,
        },
      } as never);
    } catch {
      // no-op
    }

    // Update order status to reflect mismatch
    await supabase
      .from("orders")
      .update({
        status: "amount_mismatch",
        razorpay_payment_id: razorpayPaymentId,
      } as never)
      .eq("id", orderRow.id as string);

    return;
  }

  // Check if order is cancelled or refunded
  if (orderRow.status === "cancelled" || orderRow.status === "refunded") {
    return;
  }

  // Update order to paid_verified
  await supabase
    .from("orders")
      .update({
        status: "paid_verified",
        razorpay_payment_id: razorpayPaymentId,
        webhook_verified: true,
      } as never)
      .eq("id", orderRow.id as string);

  // Track payment captured event
  try {
    await supabase.from("analytics_events").insert({
      event_name: "razorpay_payment_captured",
      order_id: orderRow.id,
      audit_id: orderRow.audit_id,
      product_type: orderRow.product_type,
      metadata: {
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
      },
    } as never);
  } catch {
    // no-op
  }

  // Call unlockPaidProduct
  try {
    await unlockPaidProduct({
      auditId: orderRow.audit_id as string,
      orderId: orderRow.id as string,
      productType: orderRow.product_type as string,
      unlockMethod: "razorpay_webhook",
      paymentId: razorpayPaymentId,
      razorpayOrderId: razorpayOrderId,
    });
  } catch {
    // If unlock fails, order is already paid_verified — another attempt can recover it
  }
}

// ─── payment.failed ───
async function handlePaymentFailed(
  event: ReturnType<typeof parseRazorpayWebhookEvent>,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  const payment = event.payload?.payment?.entity;
  if (!payment) return;

  const razorpayOrderId = payment.order_id;
  if (!razorpayOrderId) return;

  // Find Supabase order
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();

  if (!order) return;

  const orderRow = order as Record<string, unknown>;

  // Update order status
  await supabase
    .from("orders")
    .update({
      status: "payment_failed",
    } as never)
    .eq("id", orderRow.id as string);

  // Track event
  try {
    await supabase.from("analytics_events").insert({
      event_name: "razorpay_payment_failed",
      order_id: orderRow.id,
      audit_id: orderRow.audit_id,
      product_type: orderRow.product_type,
      metadata: {
        razorpay_payment_id: payment.id,
        razorpay_order_id: razorpayOrderId,
        error_code: payment.error_code || null,
        error_description: payment.error_description || null,
      },
    } as never);
  } catch {
    // no-op
  }
}

// ─── order.paid ───
async function handleOrderPaid(
  event: ReturnType<typeof parseRazorpayWebhookEvent>,
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  const orderEntity = event.payload?.order?.entity;
  if (!orderEntity) return;

  const razorpayOrderId = orderEntity.id;

  // Find Supabase order
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();

  if (!order) {
    try {
      await supabase.from("analytics_events").insert({
        event_name: "razorpay_webhook_unmatched",
        metadata: {
          razorpay_order_id: razorpayOrderId,
          event: "order.paid",
        },
      } as never);
    } catch {
      // no-op
    }
    return;
  }

  const orderRow = order as Record<string, unknown>;

  // Already unlocked or paid_verified — idempotent
  if (orderRow.status === "unlocked" || orderRow.status === "paid_verified") {
    return;
  }

  // Track event
  try {
    await supabase.from("analytics_events").insert({
      event_name: "razorpay_order_paid",
      order_id: orderRow.id,
      audit_id: orderRow.audit_id,
      product_type: orderRow.product_type,
      metadata: {
        razorpay_order_id: razorpayOrderId,
        amount: orderEntity.amount,
        currency: orderEntity.currency,
      },
    } as never);
  } catch {
    // no-op
  }

  // Use as backup confirmation — if we have payment details available through `order.paid`,
  // the captured webhook should have already fired. If not, mark for recovery.
  if (orderRow.status !== "paid_verified" && orderRow.status !== "unlocked") {
    await supabase
      .from("orders")
      .update({
        status: "paid_pending_recovery",
        recovery_state: "pending",
      } as never)
      .eq("id", orderRow.id as string);
  }
}
