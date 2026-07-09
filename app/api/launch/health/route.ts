import { NextResponse } from "next/server";
import { isSupabaseConfigured, getStorageMode } from "@/lib/storage/storageMode";
import { auditEnv } from "@/lib/launch/envAudit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const env = auditEnv();
    const storageMode = getStorageMode();

    return NextResponse.json({
      success: true,
      storageMode,
      supabaseConfigured: isSupabaseConfigured(),
      envChecks: env.checks,
      publicEnvPresent: Object.fromEntries(
        Object.entries(env.publicEnv).map(([k, v]) => [k, v.present])
      ),
      serverEnvPresent: Object.fromEntries(
        Object.entries(env.serverEnv).map(([k, v]) => [k, v.present])
      ),
      warnings: env.checks.filter((c) => c.status === "warning" || c.status === "fail"),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
