import { NextRequest, NextResponse } from "next/server";
import { runSmokeTests } from "@/lib/launch/smokeTestRunner";
import { isAuthenticated } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const results = await runSmokeTests();
    return NextResponse.json({ success: true, suite: results });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Smoke test failed" }, { status: 500 });
  }
}
