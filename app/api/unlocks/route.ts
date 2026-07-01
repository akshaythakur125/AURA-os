import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ unlocks: [], source: "local" });
    }

    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get("auditId");

    const supabase = getSupabaseAdmin();
    let query = supabase.from("product_unlocks").select("*");

    if (auditId) {
      query = query.eq("audit_id", auditId);
    }

    const { data, error } = await query
      .order("unlocked_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch unlocks: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ unlocks: data || [], source: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (!body.auditId && !body.audit_id) {
      return NextResponse.json(
        { error: "auditId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("product_unlocks")
      .insert({
        audit_id: body.auditId || body.audit_id,
        order_id: body.orderId || body.order_id || null,
        product_type: body.productType || body.product_type,
        unlock_method: body.unlockMethod || body.unlock_method || null,
        unlock_code: body.unlockCode || null,
      } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to record unlock: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ unlock: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
