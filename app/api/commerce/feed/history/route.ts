import { NextRequest, NextResponse } from "next/server";
import { getImportHistory, getImportStats } from "@/lib/commerce/feeds/feedImportHistory";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      return NextResponse.json({ success: true, stats: getImportStats() });
    }

    const history = getImportHistory();
    return NextResponse.json({ success: true, history });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get import history";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
