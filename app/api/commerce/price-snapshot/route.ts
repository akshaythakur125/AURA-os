import { NextRequest, NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/storage/commerceSearchStore";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const storeKey = searchParams.get("storeKey");

    let index = getSearchIndex();

    // Apply filters
    if (category) {
      index = index.filter((item) => item.category === category);
    }
    if (storeKey) {
      index = index.filter((item) => item.storeKey === storeKey);
    }

    // Compute freshness stats
    const freshnessCounts = { fresh: 0, recent: 0, stale: 0, manual: 0, unknown: 0 };
    for (const item of index) {
      const status = item.priceFreshness;
      if (status in freshnessCounts) {
        (freshnessCounts as Record<string, number>)[status]++;
      }
    }

    // Get stale items
    const staleItems = index
      .filter((item) => item.priceFreshness === "stale" || item.priceFreshness === "unknown")
      .slice(0, 20)
      .map((item) => ({
        id: item.id,
        title: item.originalTitle,
        storeName: item.storeName,
        price: item.price,
        freshness: item.priceFreshness,
        lastCheckedText: item.lastCheckedText,
      }));

    // Get cheapest items per category
    const cheapestByCategory = new Map<string, typeof index[0]>();
    for (const item of index) {
      const existing = cheapestByCategory.get(item.category);
      if (!existing || item.price < existing.price) {
        cheapestByCategory.set(item.category, item);
      }
    }

    const snapshot = {
      totalIndexed: index.length,
      freshnessSummary: freshnessCounts,
      staleCount: staleItems.length,
      staleItems,
      cheapestByCategory: Array.from(cheapestByCategory.entries()).map(
        ([cat, item]) => ({
          category: cat,
          title: item.originalTitle,
          price: item.price,
          storeName: item.storeName,
        })
      ),
      priceRange: index.length > 0
        ? {
            min: Math.min(...index.map((i) => i.price)),
            max: Math.max(...index.map((i) => i.price)),
          }
        : null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, snapshot });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get price snapshot";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
