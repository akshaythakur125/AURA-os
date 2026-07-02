import { NextRequest, NextResponse } from "next/server";
import { runScheduledRefresh } from "@/lib/commerce/refresh/runScheduledCommerceRefresh";
import { isAuthenticated } from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
  const refreshSecret = request.headers.get("x-refresh-secret");
  const validSecret = process.env.COMMERCE_REFRESH_SECRET;

  const authorized = isAuthenticated(request) || (!!validSecret && refreshSecret === validSecret);
  if (!authorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const connectorKey = body.connectorKey as string | undefined;
    const run = await runScheduledRefresh("api", connectorKey);

    return NextResponse.json({
      success: run.status !== "failed",
      run: {
        id: run.id,
        trigger: run.trigger,
        status: run.status,
        totalImported: run.totalImported,
        totalUpdated: run.totalUpdated,
        totalSkipped: run.totalSkipped,
        totalInvalid: run.totalInvalid,
        totalPriceChanges: run.totalPriceChanges,
        warningsCount: run.warnings.length,
        errorsCount: run.errors.length,
        resultCount: run.results.length,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Refresh failed" }, { status: 500 });
  }
}
