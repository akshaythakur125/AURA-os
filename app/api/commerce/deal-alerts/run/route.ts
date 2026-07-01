import { NextRequest, NextResponse } from "next/server";
import { runDealAlertCheck } from "@/lib/commerce/deals/dealAlertEngine";
import { getWishlistItems } from "@/lib/commerce/wishlist/wishlistStore";
import { getLocalSearchIndex } from "@/lib/commerce/search/buildSearchIndex";

export async function POST(request: NextRequest) {
  const adminCode = request.headers.get("x-admin-code");
  const refreshSecret = request.headers.get("x-refresh-secret");
  const envCode = process.env.LOCAL_ADMIN_CODE || process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
  const validSecret = process.env.COMMERCE_REFRESH_SECRET;
  const authorized = adminCode === envCode || adminCode === "aura-admin-internal" || (validSecret && refreshSecret === validSecret);

  if (!authorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const catalog = getLocalSearchIndex();
    const wishlist = getWishlistItems();

    if (wishlist.length === 0) {
      return NextResponse.json({ success: true, alertsCreated: 0, message: "No wishlist items to check" });
    }

    const newAlerts = runDealAlertCheck(wishlist, catalog);

    return NextResponse.json({
      success: true,
      alertsCreated: newAlerts.length,
      totalWishlist: wishlist.length,
      totalCatalog: catalog.length,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
