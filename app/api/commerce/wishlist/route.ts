import { NextRequest, NextResponse } from "next/server";
import { getWishlistItems, addWishlistItem, removeWishlistItem, updateWishlistItem, getWishlistStats, saveWishlistItems } from "@/lib/commerce/wishlist/wishlistStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      return NextResponse.json({ success: true, stats: getWishlistStats() });
    }

    const items = getWishlistItems();
    return NextResponse.json({ success: true, items, total: items.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, item, id, updates } = body;

    switch (action) {
      case "add":
        addWishlistItem(item);
        return NextResponse.json({ success: true });
      case "remove":
        if (id) removeWishlistItem(id);
        return NextResponse.json({ success: true });
      case "update":
        if (id && updates) updateWishlistItem(id, updates);
        return NextResponse.json({ success: true });
      case "replace_all":
        if (body.items) saveWishlistItems(body.items);
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
