import { NextResponse } from "next/server";
import { shouldUseSupabase } from "@/lib/storage/storageMode";
import { WARDROBE_CATALOG } from "@/config/auraWardrobeCatalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (shouldUseSupabase()) {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
        const supabase = getSupabaseAdmin();
        const { data } = await supabase.from("commerce_products").select("*");
        if (data && data.length > 0) {
          return NextResponse.json({ products: data, count: data.length, source: "supabase" });
        }
      } catch {
        console.warn("Supabase catalog load failed, using static fallback");
      }
    }

    return NextResponse.json({ products: WARDROBE_CATALOG, count: WARDROBE_CATALOG.length, source: "static" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load catalog" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product } = body;

    if (!product || !product.title) {
      return NextResponse.json({ error: "Product title is required" }, { status: 400 });
    }

    if (shouldUseSupabase()) {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
        const supabase = getSupabaseAdmin();
        await supabase.from("commerce_products").upsert({
          id: product.id,
          title: product.title,
          category: product.category,
          style_directions: product.styleDirections,
          aura_leak_tags: product.auraLeakTags,
          goal_tags: product.goalTags,
          color_tags: product.colorTags,
          fit_tags: product.fitTags,
          description: product.description,
          why_it_improves_aura: product.whyItImprovesAura,
          styling_tip: product.stylingTip,
          avoid_if: product.avoidIf,
          priority_score: product.priorityScore,
          is_sponsored: product.isSponsored,
          is_active: product.isActive,
          metadata: {},
        } as never, { onConflict: "id" });

        for (const offer of product.offers || []) {
          await supabase.from("commerce_offers").upsert({
            id: offer.id,
            product_id: product.id,
            store_key: offer.storeKey,
            store_name: offer.storeName,
            product_name: offer.productName,
            price: offer.price,
            mrp: offer.mrp,
            discount_percent: offer.discountPercent,
            url: offer.url,
            affiliate_url: offer.affiliateUrl,
            availability_status: offer.availabilityStatus,
            size_notes: offer.sizeNotes,
            color_notes: offer.colorNotes,
            last_checked_text: offer.lastCheckedText,
            is_affiliate: offer.isAffiliate,
            is_sponsored: offer.isSponsored,
          } as never, { onConflict: "id" });
        }
      } catch (e) {
        return NextResponse.json({ error: "Supabase save failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, product, note: "Product saved to localStorage via client" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}
