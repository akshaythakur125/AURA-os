import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured. Payment status not available in local mode." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { appOrderId, razorpayOrderId, auditId } = body;

    if (!appOrderId && !razorpayOrderId) {
      return NextResponse.json(
        { error: "Provide appOrderId or razorpayOrderId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    let query = supabase.from("orders").select("*");

    if (appOrderId) {
      query = query.eq("id", appOrderId);
    } else if (razorpayOrderId) {
      query = query.eq("razorpay_order_id", razorpayOrderId);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json({
        orderFound: false,
        status: null,
        productType: null,
        auditId: null,
        unlocked: false,
        message: "Order not found",
      });
    }

    const orderRow = order as Record<string, unknown>;
    const status = orderRow.status as string;
    const unlocked = status === "unlocked" || status === "paid_verified";

    // If auditId or productType was requested, verify match
    if (auditId && orderRow.audit_id !== auditId) {
      return NextResponse.json({
        orderFound: true,
        status,
        productType: orderRow.product_type,
        auditId: orderRow.audit_id,
        unlocked: false,
        message: "Audit ID mismatch with this order",
      });
    }

    return NextResponse.json({
      orderFound: true,
      status,
      productType: orderRow.product_type,
      auditId: orderRow.audit_id,
      unlocked,
      razorpayOrderId: orderRow.razorpay_order_id,
      razorpayPaymentId: orderRow.razorpay_payment_id,
      message: unlocked
        ? "Payment verified and product unlocked"
        : status === "payment_failed"
        ? "Payment failed"
        : status === "amount_mismatch"
        ? "Payment amount mismatch detected"
        : status === "paid_pending_recovery"
        ? "Payment needs recovery verification"
        : "Payment pending",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
