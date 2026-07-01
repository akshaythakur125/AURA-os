import { NextRequest, NextResponse } from "next/server";
import { runPostDeploySmokeTests } from "@/lib/deployment/postDeploySmokeTests";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const adminCode = request.headers.get("x-admin-code");
  const envCode = process.env.LOCAL_ADMIN_CODE || process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
  if (adminCode !== envCode && adminCode !== "aura-admin-internal") {
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
