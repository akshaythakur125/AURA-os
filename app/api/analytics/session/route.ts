import { NextResponse } from "next/server";
import { getFunnelEventStats } from "@/lib/storage/funnelStore";
import { getRevenueSummary } from "@/lib/analytics/revenueAttribution";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = getFunnelEventStats();
    const revenue = getRevenueSummary();

    return NextResponse.json({
      success: true,
      sessions: stats.uniqueSessions,
      visitors: stats.uniqueVisitors,
      totalEvents: stats.total,
      totalRevenue: revenue.totalRevenue,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
