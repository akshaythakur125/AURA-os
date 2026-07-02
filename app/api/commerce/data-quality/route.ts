import { NextRequest, NextResponse } from "next/server";
import { buildQualitySummary, getStalePriceDetails, getLowConfidenceDetails, getDuplicateProducts, getHighClickStaleProducts } from "@/lib/commerce/index/searchIndexQuality";
import { getAnomalySummary } from "@/lib/commerce/prices/priceAnomalyDetector";
import { getSearchIndex } from "@/lib/storage/commerceSearchStore";
import { isAuthenticated } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const detail = searchParams.get("detail");

    const summary = buildQualitySummary();
    const index = getSearchIndex();
    const anomalySummary = getAnomalySummary(index);

    const details: Record<string, unknown> = {};

    if (detail === "stale") {
      details.staleItems = getStalePriceDetails().slice(0, 50);
    } else if (detail === "low_confidence") {
      details.lowConfidenceItems = getLowConfidenceDetails().slice(0, 50);
    } else if (detail === "duplicates") {
      details.duplicateGroups = getDuplicateProducts().slice(0, 50);
    } else if (detail === "high_click_stale") {
      details.highClickStaleItems = getHighClickStaleProducts().slice(0, 50);
    }

    return NextResponse.json({
      success: true,
      summary,
      anomalySummary,
      ...details,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Data quality check failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
