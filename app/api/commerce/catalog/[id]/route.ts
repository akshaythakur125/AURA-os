import { NextResponse } from "next/server";
import { shouldUseSupabase } from "@/lib/storage/storageMode";
import { WARDROBE_CATALOG } from "@/config/auraWardrobeCatalog";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = WARDROBE_CATALOG.find((p) => p.id === id);

    if (shouldUseSupabase()) {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
        const supabase = getSupabaseAdmin();
        const { data } = await supabase.from("commerce_products").select("*").eq("id", id).single();
        if (data) {
          return NextResponse.json({ product: data, source: "supabase" });
        }
      } catch {
        console.warn("Supabase product fetch failed");
      }
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product, source: "static" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    if (shouldUseSupabase()) {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from("commerce_products").update({
          title: body.title,
          category: body.category,
          style_directions: body.styleDirections,
          aura_leak_tags: body.auraLeakTags,
          goal_tags: body.goalTags,
          color_tags: body.colorTags,
          fit_tags: body.fitTags,
          description: body.description,
          why_it_improves_aura: body.whyItImprovesAura,
          styling_tip: body.stylingTip,
          avoid_if: body.avoidIf,
          priority_score: body.priorityScore,
          is_sponsored: body.isSponsored,
          is_active: body.isActive,
          updated_at: new Date().toISOString(),
        } as never).eq("id", id as string);
        if (error) throw error;
      } catch (e) {
        return NextResponse.json({ error: "Supabase update failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, note: "Update handled via client for local storage" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    if (shouldUseSupabase()) {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
        const supabase = getSupabaseAdmin();
        await supabase.from("commerce_offers").delete().eq("product_id", id as string);
        await supabase.from("commerce_products").delete().eq("id", id as string);
      } catch (e) {
        return NextResponse.json({ error: "Supabase delete failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, note: "Delete handled via client for local storage" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
