import { NextResponse } from "next/server";
import { isSupabaseConfigured, getStorageMode } from "@/lib/storage/storageMode";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseConfigured = isSupabaseConfigured();
  const storageMode = getStorageMode();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return NextResponse.json(
    {
      status: "ok",
      app: "AuraCheck",
      storageMode,
      supabaseConfigured,
      timestamp: new Date().toISOString(),
      appUrl,
    },
    { status: 200 }
  );
}
