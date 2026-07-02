import { NextRequest, NextResponse } from "next/server";
import { runScheduledRefresh } from "@/lib/commerce/refresh/runScheduledCommerceRefresh";
import { isAuthenticated } from "@/lib/admin/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  const refreshSecret = request.headers.get("x-refresh-secret");
  const validSecret = process.env.COMMERCE_REFRESH_SECRET;

  const authorized = isAuthenticated(request) || (!!validSecret && refreshSecret === validSecret);
  if (!authorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const run = await runScheduledRefresh("api", key);
    return NextResponse.json({ success: run.status !== "failed", run });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Refresh failed" }, { status: 500 });
  }
}
