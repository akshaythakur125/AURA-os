import { NextRequest, NextResponse } from "next/server";
import { getPriceSnapshots, getRecentPriceChanges, getSnapshotSummary } from "@/lib/commerce/prices/priceSnapshotStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const summary = searchParams.get("summary") === "true";

    if (summary) {
      return NextResponse.json({ success: true, summary: getSnapshotSummary() });
    }

    let snapshots = getPriceSnapshots();

    if (productId) {
      snapshots = snapshots.filter((s) => s.productId === productId);
    }

    return NextResponse.json({
      success: true,
      snapshots: snapshots.slice(-200),
      total: snapshots.length,
      recentChanges: getRecentPriceChanges(20),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get price snapshots";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
