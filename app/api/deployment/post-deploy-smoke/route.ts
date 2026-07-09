import { NextRequest, NextResponse } from "next/server";
import { runPostDeploySmokeTests } from "@/lib/deployment/postDeploySmokeTests";
import { isAuthenticated } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const results = await runPostDeploySmokeTests();

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Smoke tests failed" }, { status: 500 });
  }
}
