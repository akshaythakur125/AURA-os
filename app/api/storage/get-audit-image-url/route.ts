import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSignedUrl } from "@/lib/server/storageRepo";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { imagePath } = body;

    if (!imagePath) {
      return NextResponse.json(
        { error: "imagePath is required" },
        { status: 400 }
      );
    }

    const signedUrl = await getSignedUrl(imagePath);

    return NextResponse.json({ signedUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get image URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
