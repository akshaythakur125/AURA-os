import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getRazorpaySecret } from "@/lib/razorpay/env";
import { verifyRazorpaySignature } from "@/lib/payments/verifyRazorpaySignature";
import { unlockPaidProduct } from "@/lib/payments/unlockPaidProduct";
import { isValidProductType } from "@/lib/payments/productCatalog";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      appOrderId,
      auditId,
      productType,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!appOrderId || !auditId || !productType || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidProductType(productType)) {
      return NextResponse.json({ error: "Invalid product type" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const secret = getRazorpaySecret();

    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret not configured" },
        { status: 500 }
      );
    }

    // Load order from Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", appOrderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderRow = order as Record<string, unknown>;

    // Validate order matches
    if (orderRow.audit_id !== auditId) {
      return NextResponse.json({ error: "Order audit mismatch" }, { status: 400 });
    }
    if (orderRow.product_type !== productType) {
      return NextResponse.json({ error: "Order product mismatch" }, { status: 400 });
    }
    if (orderRow.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: "Razorpay order ID mismatch" }, { status: 400 });
    }

    // Idempotency check: already unlocked
    if (orderRow.status === "unlocked" || orderRow.status === "paid_verified") {
      return NextResponse.json({
        success: true,
        alreadyUnlocked: true,
        productType,
      });
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      { razorpay_order_id, razorpay_payment_id, razorpay_signature },
      secret
    );

    if (!isValid) {
      await supabase
        .from("orders")
        .update({ status: "payment_verification_failed" } as never)
        .eq("id", appOrderId);

      return NextResponse.json(
        { error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    // Update order with payment details before unlocking
    await supabase
      .from("orders")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "paid_verified",
      } as never)
      .eq("id", appOrderId);

    // Use central unlock service
    const result = await unlockPaidProduct({
      auditId,
      orderId: appOrderId,
      productType,
      unlockMethod: "razorpay_verify",
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    // Track analytics event
    await supabase.from("analytics_events").insert({
      event_name: "razorpay_payment_verified",
      audit_id: auditId,
      order_id: appOrderId,
      product_type: productType,
      metadata: { razorpay_order_id },
    } as never);

    return NextResponse.json({
      success: true,
      alreadyUnlocked: result.alreadyUnlocked,
      productType,
      productName: productType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
