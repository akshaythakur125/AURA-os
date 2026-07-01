import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getRazorpayInstance } from "@/lib/razorpay/client";
import { isRazorpayConfigured, getPublicRazorpayKeyId } from "@/lib/razorpay/env";
import {
  isValidProductType,
  getProductConfig,
} from "@/lib/payments/productCatalog";
import { rupeesToPaise } from "@/lib/payments/amounts";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured. Use manual UPI fallback." },
        { status: 503 }
      );
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Razorpay not configured. Use manual UPI fallback." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { auditId, productType, offerCode, customerName, customerContact } = body;

    if (!auditId || !productType) {
      return NextResponse.json(
        { error: "auditId and productType are required" },
        { status: 400 }
      );
    }

    if (!isValidProductType(productType)) {
      return NextResponse.json(
        { error: `Invalid product type: ${productType}` },
        { status: 400 }
      );
    }

    const product = getProductConfig(productType);

    // Calculate amount server-side
    let finalAmount = product.amount;
    let discountAmount = 0;
    let appliedOfferCode: string | null = null;

    if (offerCode && typeof offerCode === "string") {
      const code = offerCode.trim().toUpperCase();
      // Simple server-side offer validation
      if (code === "FOUNDER50" && (productType === "aura_report" || productType === "glowup_plan")) {
        discountAmount = Math.floor(finalAmount * 0.5);
        appliedOfferCode = code;
      } else if (code === "QUICKSTART" && productType === "quick_fix") {
        discountAmount = Math.floor(finalAmount * 0.3);
        appliedOfferCode = code;
      } else if (code === "GLOWEARLY" && productType === "glowup_plan") {
        discountAmount = Math.floor(finalAmount * 0.25);
        appliedOfferCode = code;
      } else if (code === "DATEOFFER" && productType === "dating_audit") {
        discountAmount = Math.floor(finalAmount * 0.2);
        appliedOfferCode = code;
      }
      finalAmount = Math.max(0, finalAmount - discountAmount);
    }

    if (finalAmount < 0) {
      return NextResponse.json(
        { error: "Invalid final amount" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const razorpay = getRazorpayInstance();

    // Create order row in Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        audit_id: auditId,
        product_type: productType,
        product_name: product.name,
        original_amount: product.amount,
        discount_code: appliedOfferCode,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        currency: "INR",
        status: "razorpay_order_created",
        customer_name: customerName || null,
        customer_contact: customerContact || null,
      } as never)
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: `Failed to create order: ${orderError?.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    const appOrderId = (order as Record<string, unknown>).id as string;

    // Handle free unlock (amount = 0 after offer)
    if (finalAmount === 0) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "paid_verified" } as never)
        .eq("id", appOrderId);

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update free order" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        freeUnlock: true,
        appOrderId,
        productType,
        productName: product.name,
        amount: 0,
        currency: "INR",
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: rupeesToPaise(finalAmount),
      currency: "INR",
      receipt: appOrderId,
      notes: {
        auditId,
        productType,
        appOrderId,
      },
    });

    // Save razorpay_order_id to Supabase order
    const { error: updateRpError } = await supabase
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id } as never)
      .eq("id", appOrderId);

    if (updateRpError) {
      return NextResponse.json(
        { error: "Failed to link Razorpay order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      freeUnlock: false,
      appOrderId,
      razorpayOrderId: razorpayOrder.id,
      amount: finalAmount,
      amountPaise: rupeesToPaise(finalAmount),
      currency: "INR",
      productName: product.name,
      description: product.description,
      razorpayKeyId: getPublicRazorpayKeyId(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
