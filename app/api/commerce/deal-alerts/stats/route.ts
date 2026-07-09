import { NextResponse } from "next/server";
import { getDealAlertStats } from "@/lib/commerce/deals/dealAlertEngine";
import { getWishlistStats } from "@/lib/commerce/wishlist/wishlistStore";

export async function GET() {
  try {
    const alertStats = getDealAlertStats();
    const wishlistStats = getWishlistStats();

    return NextResponse.json({
      success: true,
      alertStats,
      wishlistStats,
      combined: {
        totalSaved: wishlistStats.totalItems,
        totalBundles: wishlistStats.totalBundles,
        activeAlerts: alertStats.total,
        unreadAlerts: alertStats.unread,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
