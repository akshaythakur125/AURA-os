import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, offerId, storeKey, auditId, source, productPrice, affiliateUsed, isSponsored, clickedAt } = body;

    if (!productId || !storeKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ stored: "local" });
    }

    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
      const supabase = getSupabaseAdmin();

      await supabase.from("commerce_clicks").insert({
        product_id: productId,
        offer_id: offerId,
        store_key: storeKey,
        audit_id: auditId || null,
        source: source || "unknown",
        price: typeof productPrice === "number" ? productPrice : 0,
        affiliate_used: !!affiliateUsed,
        is_sponsored: !!isSponsored,
        metadata: { clicked_at: clickedAt || new Date().toISOString() },
      } as never);
    } catch {
      // Table may not exist — fail safe
    }

    return NextResponse.json({ stored: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
