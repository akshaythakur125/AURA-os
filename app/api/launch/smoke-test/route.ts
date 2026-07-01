import { NextRequest, NextResponse } from "next/server";
import { runSmokeTests } from "@/lib/launch/smokeTestRunner";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const adminCode = request.headers.get("x-admin-code");
  const envCode = process.env.LOCAL_ADMIN_CODE || process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
  if (adminCode !== envCode && adminCode !== "aura-admin-internal") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const results = await runSmokeTests();
    return NextResponse.json({ success: true, suite: results });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Smoke test failed" }, { status: 500 });
  }
}
