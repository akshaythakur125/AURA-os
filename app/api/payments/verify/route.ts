import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getRazorpaySecret } from "@/lib/razorpay/env";
import { verifyRazorpaySignature } from "@/lib/payments/verifyRazorpaySignature";
import { generatePaidProductForAudit } from "@/lib/payments/generatePaidProduct";
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
      reportData,
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

    // Signature valid — proceed with unlock
    const now = new Date().toISOString();

    // Update order with payment details
    await supabase
      .from("orders")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "unlocked",
        unlocked_at: now,
      } as never)
      .eq("id", appOrderId);

    // Load audit
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (auditError || !audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const auditRow = audit as Record<string, unknown>;
    const unlockedProducts: string[] = (auditRow.unlocked_products as string[]) || [];

    // Avoid duplicate product in unlocked_products
    if (!unlockedProducts.includes(productType)) {
      unlockedProducts.push(productType);
    }

    // Generate or use pre-generated report
    let report: Record<string, unknown>;
    if (reportData) {
      report = reportData;
    } else {
      try {
        report = generatePaidProductForAudit(audit as never, productType);
      } catch {
        report = { type: productType, generatedAt: now, note: "Report generated after payment verification" };
      }
    }

    // Update audit with unlocked product and report
    const auditUpdate: Record<string, unknown> = {
      unlocked_products: unlockedProducts,
      unlock_status: "unlocked",
      report_status: productType === "quick_fix" ? "quick_fix_ready" : "complete",
      updated_at: now,
    };

    // Save report to correct field
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
      return NextResponse.json(
        { error: "Failed to update audit" },
        { status: 500 }
      );
    }

    // Create product_unlocks row
    await supabase.from("product_unlocks").insert({
      audit_id: auditId,
      order_id: appOrderId,
      product_type: productType,
      unlock_method: "razorpay",
      unlocked_at: now,
    } as never);

    // Track analytics event
    await supabase.from("analytics_events").insert([
      { event_name: "razorpay_payment_verified", audit_id: auditId, order_id: appOrderId, product_type: productType, metadata: { razorpay_order_id } },
      { event_name: "product_unlocked", audit_id: auditId, order_id: appOrderId, product_type: productType, metadata: { method: "razorpay" } },
    ] as never);

    return NextResponse.json({
      success: true,
      alreadyUnlocked: false,
      productType,
      productName: productType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
