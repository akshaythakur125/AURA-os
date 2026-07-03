import { NextRequest, NextResponse } from "next/server";
import { runScheduledRefresh } from "@/lib/commerce/refresh/runScheduledCommerceRefresh";
import { isAuthenticated } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET — Vercel Cron entry point for the connector/feed refresh (see
 * vercel.json). Runs all configured connectors (generic CSV/JSON feed when
 * COMMERCE_GENERIC_CSV_FEED_URL / COMMERCE_GENERIC_JSON_FEED_URL are set).
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`; the manual
 * `x-refresh-secret` header is also accepted for hand-triggered runs.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const refreshSecret = request.headers.get("x-refresh-secret");
  const validRefreshSecret = process.env.COMMERCE_REFRESH_SECRET;

  const cronAuthorized = !!cronSecret && authHeader === `Bearer ${cronSecret}`;
  const manualAuthorized = !!validRefreshSecret && refreshSecret === validRefreshSecret;

  if (cronSecret && !cronAuthorized && !manualAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const run = await runScheduledRefresh("scheduled");
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
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Refresh failed" },
      { status: 500 },
    );
  }
}

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
