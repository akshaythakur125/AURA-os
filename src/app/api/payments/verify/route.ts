import crypto from "crypto";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getAnonymousId } from "@/lib/storage/anonymousId";
import { isAdminUnlockCode } from "@/lib/payments/serverUnlock";
import type { ProductType } from "@/types/payment";

export const dynamic = "force-dynamic";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expectedSignature === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, auditId, productType, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
      code?: string;
      auditId?: string;
      productType?: string;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    if (!auditId || !productType) {
      return Response.json({ error: "Missing required fields: auditId, productType" }, { status: 400 });
    }

    const validTypes: ProductType[] = ["aura_report", "dating_audit", "glowup_plan"];
    if (!validTypes.includes(productType as ProductType)) {
      return Response.json({ error: "Invalid product type." }, { status: 400 });
    }

    // Admin override: static secret only the founder knows
    if (code && isAdminUnlockCode(code)) {
      return Response.json({ valid: true, message: "Admin unlock code accepted." });
    }

    // Razorpay payment verification
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValid) {
        return Response.json({ valid: false, message: "Payment verification failed." }, { status: 401 });
      }
      return Response.json({ valid: true, message: "Payment verified successfully." });
    }

    // Real validation: call Supabase RPC which checks the stored code
    const supabase = getSupabaseClient();
    if (!supabase) {
      return Response.json({ valid: false, message: "Verification service unavailable." }, { status: 503 });
    }

    if (!code) {
      return Response.json({ valid: false, message: "Missing unlock code or payment details." }, { status: 400 });
    }

    const anonId = getAnonymousId();
    const { data, error } = await supabase.rpc("redeem_unlock_code", {
      input_code: code.trim(),
      input_audit_id: auditId,
      input_product_type: productType,
      redeemer_anonymous_id: anonId || null,
    });

    if (error) {
      return Response.json({ valid: false, message: "Verification failed. Please try again." }, { status: 500 });
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (result?.valid) {
      return Response.json({ valid: true, message: result.message || "Code accepted." });
    }

    return Response.json({ valid: false, message: result?.message || "Invalid unlock code." }, { status: 401 });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
}
