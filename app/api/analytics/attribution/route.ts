import { NextResponse } from "next/server";
import { getFunnelEvents } from "@/lib/storage/funnelStore";
import { getRevenueRecords } from "@/lib/analytics/revenueAttribution";
import { computeConversionMetrics, computeProductFunnels, computeCommerceFunnel, computeSeoFunnel, computeFunnelLeaks } from "@/lib/analytics/conversionMetrics";
import { getSourceBreakdown } from "@/lib/analytics/attribution";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = getFunnelEvents();
    const metrics = computeConversionMetrics(events);
    const productFunnels = computeProductFunnels(events);
    const commerceFunnel = computeCommerceFunnel(events);
    const seoFunnel = computeSeoFunnel(events);
    const leaks = computeFunnelLeaks(metrics);
    const sources = getSourceBreakdown(events);
    const revenue = getRevenueRecords();

    return NextResponse.json({
      success: true,
      metrics,
      productFunnels,
      commerceFunnel,
      seoFunnel,
      leaks,
      sources,
      revenueCount: revenue.length,
      eventCount: events.length,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
