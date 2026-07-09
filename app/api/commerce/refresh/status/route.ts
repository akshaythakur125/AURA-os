import { NextResponse } from "next/server";
import { getRefreshReadyStatus } from "@/lib/commerce/refresh/runScheduledCommerceRefresh";
import { getRefreshStats } from "@/lib/commerce/refresh/refreshReport";

export async function GET() {
  try {
    const readyStatus = getRefreshReadyStatus();
    const stats = getRefreshStats();

    return NextResponse.json({
      success: true,
      readyStatus,
      stats,
      canRunRefresh: readyStatus.refreshable > 0,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
