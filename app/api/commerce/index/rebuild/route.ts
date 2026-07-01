import { NextRequest, NextResponse } from "next/server";
import { rebuildSearchIndex } from "@/lib/commerce/search/buildSearchIndex";
import { syncSearchIndexToSupabase } from "@/lib/storage/commerceSearchStore";

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const authHeader = request.headers.get("x-admin-code");
    const body = (await request.json().catch(() => ({}))) as { adminCode?: string };
    const adminCode = authHeader || body.adminCode;

    const result = await rebuildSearchIndex(adminCode);

    if (result.indexedCount === 0 && result.warnings.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Valid admin code required." },
        { status: 403 }
      );
    }

    // Try syncing to Supabase if configured
    let supabaseSynced = false;
    try {
      supabaseSynced = await syncSearchIndexToSupabase();
    } catch {
      // Supabase sync is optional
    }

    return NextResponse.json({
      success: true,
      ...result,
      supabaseSynced,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Rebuild failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
