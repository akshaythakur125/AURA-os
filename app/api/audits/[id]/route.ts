import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ audit: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const allowedFields = [
      "image_url", "imagePath", "image_meta", "imageMeta",
      "deep_input", "deepInput",
      "personalization",
      "profile_text_input", "profileTextInput",
      "free_score", "freeScore",
      "full_score", "fullScore",
      "report_status", "reportStatus",
      "unlock_status", "unlockStatus",
      "unlocked_products", "unlockedProducts",
      "free_result", "freeResult",
      "quick_fix_report", "quickFixReport",
      "full_report", "fullReport",
      "dating_profile_report", "datingProfileReport",
      "glowup_plan", "glowupPlan",
      "twin_result", "twinResult",
      "goal",
      "budget_range", "budgetRange",
    ];

    const dbUpdate: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        const dbField = field
          .replace(/([A-Z])/g, "_$1")
          .toLowerCase()
          .replace(/^_/, "");
        dbUpdate[dbField] = (body as Record<string, unknown>)[field];
      }
    }

    if (Object.keys(dbUpdate).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("audits")
      .update(dbUpdate as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update audit: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ audit: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deleteImage = searchParams.get("deleteImage") === "true";

    const supabase = getSupabaseAdmin();

    if (deleteImage) {
      const { data: audit } = await supabase
        .from("audits")
        .select("image_url")
        .eq("id", id)
        .single();

      if (audit && (audit as Record<string, unknown>).image_url) {
        const url = (audit as Record<string, unknown>).image_url as string;
        await supabase.storage.from("audit-images").remove([url]);
      }
    }

    const { error } = await supabase.from("audits").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete audit: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
