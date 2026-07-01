import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ audits: [], source: "local" });
    }

    const { searchParams } = new URL(request.url);
    const anonymousId = searchParams.get("anonymousId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!anonymousId) {
      return NextResponse.json(
        { error: "anonymousId query param is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch audits: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ audits: data || [], source: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured. Use local store." },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (!body.anonymousId) {
      return NextResponse.json(
        { error: "anonymousId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("audits")
      .insert({
        anonymous_id: body.anonymousId,
        audit_type: body.auditType || "photo",
        goal: body.goal || null,
        budget_range: body.budgetRange || null,
        image_url: body.imagePath || body.imageUrl || null,
        image_meta: body.imageMeta || null,
        deep_input: body.deepInput || null,
        personalization: body.personalization || null,
        profile_text_input: body.profileTextInput || null,
      } as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create audit: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ audit: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
