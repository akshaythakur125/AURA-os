import { NextRequest, NextResponse } from "next/server";
import { getDealAlerts, markAlertRead, markAllAlertsRead, getDealAlertStats } from "@/lib/commerce/deals/dealAlertEngine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      return NextResponse.json({ success: true, stats: getDealAlertStats() });
    }

    const unread = searchParams.get("unread") === "true";
    const alerts = unread ? getDealAlerts().filter((a) => !a.isRead) : getDealAlerts();

    return NextResponse.json({ success: true, alerts, total: alerts.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id } = body;

    if (action === "mark_read" && id) {
      markAlertRead(id);
      return NextResponse.json({ success: true });
    }
    if (action === "mark_all_read") {
      markAllAlertsRead();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
