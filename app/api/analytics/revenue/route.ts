import { NextResponse } from "next/server";
import { getRevenueSummary, getRevenueRecords } from "@/lib/analytics/revenueAttribution";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = getRevenueSummary();
    const records = getRevenueRecords();
    return NextResponse.json({ success: true, summary, records: records.slice(-50) });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
