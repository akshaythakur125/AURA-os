import { NextRequest, NextResponse } from "next/server";
import { getRefreshHistory, getRefreshStats, getRefreshRunsByConnector } from "@/lib/commerce/refresh/refreshReport";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get("stats") === "true";
    const connectorKey = searchParams.get("connectorKey");

    if (stats) {
      return NextResponse.json({ success: true, stats: getRefreshStats() });
    }

    if (connectorKey) {
      return NextResponse.json({ success: true, runs: getRefreshRunsByConnector(connectorKey) });
    }

    const history = getRefreshHistory();
    const safe = history.slice(-20).map((h) => ({
      id: h.id, trigger: h.trigger, status: h.status,
      totalImported: h.totalImported, totalUpdated: h.totalUpdated,
      totalSkipped: h.totalSkipped, totalInvalid: h.totalInvalid,
      totalPriceChanges: h.totalPriceChanges,
      warningsCount: h.warnings.length, errorsCount: h.errors.length,
      startedAt: h.startedAt, completedAt: h.completedAt,
      resultCount: h.results.length,
    }));

    return NextResponse.json({ success: true, history: safe, total: history.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
