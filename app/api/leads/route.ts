import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ leads: [], source: "local" });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch leads: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ leads: data || [], source: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.source) {
      return NextResponse.json(
        { error: "source is required" },
        { status: 400 }
      );
    }

    // Try Supabase first, fall back to local
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("leads")
        .insert({
          name: body.name || null,
          contact: body.contact || null,
          interest_product: body.interestProduct || body.interest_product || null,
          note: body.note || null,
          source: body.source,
        } as never)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ lead: data, savedTo: "supabase" }, { status: 201 });
      }
    }

    // Fallback: return local-mode instruction
    return NextResponse.json({
      savedTo: "local",
      message: "Use localStorage leadStore to save locally.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
