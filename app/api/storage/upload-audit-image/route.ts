import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { uploadAuditImage } from "@/lib/server/storageRepo";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured. Use local image storage." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { imageDataUrl, anonymousId, fileName } = body;

    if (!imageDataUrl || !anonymousId) {
      return NextResponse.json(
        { error: "imageDataUrl and anonymousId are required" },
        { status: 400 }
      );
    }

    const result = await uploadAuditImage(anonymousId, imageDataUrl, fileName);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
