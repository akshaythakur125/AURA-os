import { getSupabaseClient } from "@/lib/supabase/client";
import { getAnonymousId } from "@/lib/storage/anonymousId";
import { isAdminUnlockCode } from "@/lib/payments/serverUnlock";
import type { ProductType } from "@/types/payment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, auditId, productType } = body as {
      code?: string;
      auditId?: string;
      productType?: string;
    };

    if (!code || !auditId || !productType) {
      return Response.json(
        { error: "Missing required fields: code, auditId, productType" },
        { status: 400 }
      );
    }

    const validTypes: ProductType[] = ["aura_report", "dating_audit", "glowup_plan"];
    if (!validTypes.includes(productType as ProductType)) {
      return Response.json({ error: "Invalid product type." }, { status: 400 });
    }

    // Admin override: static secret only the founder knows
    if (isAdminUnlockCode(code)) {
      return Response.json({ valid: true, message: "Admin unlock code accepted." });
    }

    // Real validation: call Supabase RPC which checks the stored code
    const supabase = getSupabaseClient();
    if (!supabase) {
      return Response.json(
        { valid: false, message: "Verification service unavailable." },
        { status: 503 }
      );
    }

    const anonId = getAnonymousId();

    const { data, error } = await supabase.rpc("redeem_unlock_code", {
      input_code: code.trim(),
      input_audit_id: auditId,
      input_product_type: productType,
      redeemer_anonymous_id: anonId || null,
    });

    if (error) {
      return Response.json(
        { valid: false, message: "Verification failed. Please try again." },
        { status: 500 }
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (result?.success) {
      return Response.json({ valid: true, message: result.message || "Code accepted." });
    }

    return Response.json(
      { valid: false, message: result?.message || "Invalid unlock code." },
      { status: 401 }
    );
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
}
