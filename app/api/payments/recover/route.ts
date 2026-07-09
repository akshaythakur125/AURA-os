import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isRazorpayConfigured } from "@/lib/razorpay/env";
import { getRazorpayInstance } from "@/lib/razorpay/client";
import { unlockPaidProduct } from "@/lib/payments/unlockPaidProduct";
import { isValidProductType } from "@/lib/payments/productCatalog";
import { rupeesToPaise } from "@/lib/payments/amounts";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured. Payment recovery not available in local mode." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { appOrderId, razorpayOrderId, auditId, productType } = body;

    if (!appOrderId && !razorpayOrderId) {
      return NextResponse.json(
        { error: "Provide appOrderId or razorpayOrderId" },
        { status: 400 }
      );
    }

    if (!auditId || !productType) {
      return NextResponse.json(
        { error: "auditId and productType are required" },
        { status: 400 }
      );
    }

    if (!isValidProductType(productType)) {
      return NextResponse.json({ error: "Invalid product type" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Load internal order
    let query = supabase.from("orders").select("*");
    if (appOrderId) {
      query = query.eq("id", appOrderId);
    } else {
      query = query.eq("razorpay_order_id", razorpayOrderId);
    }

    const { data: order, error: orderError } = await query.single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderRow = order as Record<string, unknown>;

    // Verify the order belongs to the right audit and product
    if (orderRow.audit_id !== auditId) {
      return NextResponse.json({ error: "Order audit mismatch" }, { status: 400 });
    }
    if (orderRow.product_type !== productType) {
      return NextResponse.json({ error: "Order product mismatch" }, { status: 400 });
    }

    // Already unlocked
    if (orderRow.status === "unlocked" || orderRow.status === "paid_verified") {
      return NextResponse.json({
        success: true,
        alreadyUnlocked: true,
        productType,
        message: "Product already unlocked",
      });
    }

    // Track recovery attempt
    try {
      await supabase.from("analytics_events").insert({
        event_name: "payment_recovery_attempted",
        order_id: orderRow.id,
        audit_id: auditId,
        product_type: productType,
        metadata: {
          current_status: orderRow.status,
          razorpay_order_id: orderRow.razorpay_order_id,
        },
      } as never);
    } catch {
      // no-op
    }

    // If Razorpay is configured, fetch payment status server-side
    if (isRazorpayConfigured()) {
      try {
        const razorpayOrderIdToCheck = (orderRow.razorpay_order_id as string) || razorpayOrderId;
        if (!razorpayOrderIdToCheck) {
          return NextResponse.json({
            success: false,
            message: "No Razorpay order ID found. If money was deducted, contact support with your payment ID.",
          });
        }

        const razorpay = getRazorpayInstance();

        // Fetch payments for this Razorpay order
        const payments = await razorpay.orders.fetchPayments(razorpayOrderIdToCheck);

        const paymentItems = payments as unknown as { items: Record<string, unknown>[] };
        const items = paymentItems?.items || [];

        if (items.length === 0) {
          return NextResponse.json({
            success: false,
            message: "No payments found for this order in Razorpay. If money was deducted, contact support with your payment ID.",
          });
        }

        // Find a captured payment
        const capturedPayment = items.find(
          (p: Record<string, unknown>) => p.status === "captured"
        );

        if (!capturedPayment) {
          return NextResponse.json({
            success: false,
            message: "Payment found but not captured yet. If money was deducted, contact support with your payment ID.",
          });
        }

        // Validate amount
        const capturedAmountPaise = capturedPayment.amount as number;
        const expectedPaise = rupeesToPaise((orderRow.final_amount as number) || 0);

        if (capturedAmountPaise !== expectedPaise) {
          return NextResponse.json({
            success: false,
            message: "Payment amount mismatch. Contact support with your payment ID.",
          });
        }

        // Validate currency
        if ((capturedPayment.currency as string) !== "INR") {
          return NextResponse.json({
            success: false,
            message: "Currency mismatch. Contact support.",
          });
        }

        // Payment verified server-side — update order and unlock
        const razorpayPaymentId = capturedPayment.id as string;

        await supabase
          .from("orders")
          .update({
            razorpay_payment_id: razorpayPaymentId,
            status: "paid_verified",
            recovery_state: "recovered",
          } as never)
          .eq("id", orderRow.id as string);

        // Unlock product
        await unlockPaidProduct({
          auditId,
          orderId: orderRow.id as string,
          productType,
          unlockMethod: "razorpay_webhook",
          paymentId: razorpayPaymentId,
          razorpayOrderId: razorpayOrderIdToCheck,
          metadata: { recovered: true },
        });

        // Track recovery success
        try {
          await supabase.from("analytics_events").insert({
            event_name: "payment_recovery_success",
            order_id: orderRow.id,
            audit_id: auditId,
            product_type: productType,
            metadata: {
              razorpay_order_id: razorpayOrderIdToCheck,
              razorpay_payment_id: razorpayPaymentId,
            },
          } as never);
        } catch {
          // no-op
        }

        return NextResponse.json({
          success: true,
          alreadyUnlocked: false,
          productType,
          message: "Payment verified and product unlocked successfully",
        });
      } catch {
        // Razorpay API call failed — can't verify server-side
      }
    }

    // If we get here, we couldn't verify
    try {
      await supabase.from("analytics_events").insert({
        event_name: "payment_recovery_failed",
        order_id: orderRow.id,
        audit_id: auditId,
        product_type: productType,
        metadata: { current_status: orderRow.status },
      } as never);
    } catch {
      // no-op
    }

    return NextResponse.json({
      success: false,
      message:
        "Payment not verified yet. If money was deducted, contact support with your payment ID. " +
        "Include your product type, audit ID, Razorpay order ID, and payment ID if available.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
