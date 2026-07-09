import { NextResponse } from "next/server";
import { shouldUseSupabase } from "@/lib/storage/storageMode";
import { WARDROBE_CATALOG } from "@/config/auraWardrobeCatalog";
import { validateCatalog, getInactiveProducts, getProductsWithBrokenLinks, getProductsWithPriceIssues } from "@/lib/commerce/catalogValidation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = WARDROBE_CATALOG;
    const validation = validateCatalog(products);
    const affiliateLinks = products.flatMap((p) =>
      (p.offers || []).filter((o) => o.affiliateUrl || o.isAffiliate).map((o) => ({
        productId: p.id,
        title: p.title,
        storeKey: o.storeKey,
        affiliateUrl: o.affiliateUrl || o.url,
      }))
    );

    let clicksData: { storeKey: string; productId: string; productPrice: number; affiliateUsed: boolean; isSponsored?: boolean }[] = [];

    if (shouldUseSupabase()) {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
        const supabase = getSupabaseAdmin();
        const { data } = await supabase.from("commerce_clicks").select("*").limit(1000);
        if (data) clicksData = data as typeof clicksData;
      } catch {
        console.warn("Supabase clicks fetch failed");
      }
    }

    const activeProducts = products.filter((p) => p.isActive);
    const totalOffers = products.reduce((sum, p) => sum + (p.offers?.length || 0), 0);
    const inactive = getInactiveProducts(products);
    const brokenLinks = getProductsWithBrokenLinks(products);
    const priceIssues = getProductsWithPriceIssues(products);
    const sponsored = products.filter((p) => p.isSponsored);

    const storeClicks: Record<string, number> = {};
    const categoryClicks: Record<string, number> = {};
    const productClicks: Record<string, number> = {};
    let affiliateClickCount = 0;
    let sponsoredClickCount = 0;

    for (const c of clicksData) {
      storeClicks[c.storeKey] = (storeClicks[c.storeKey] || 0) + 1;
      const cat = c.productId.split("_")[0] || "unknown";
      categoryClicks[cat] = (categoryClicks[cat] || 0) + 1;
      productClicks[c.productId] = (productClicks[c.productId] || 0) + 1;
      if (c.affiliateUsed) affiliateClickCount++;
      if (c.isSponsored) sponsoredClickCount++;
    }

    const topStores = Object.entries(storeClicks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([store, count]) => ({ store, count }));

    const topCategories = Object.entries(categoryClicks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));

    const topProducts = Object.entries(productClicks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([productId, count]) => {
        const product = products.find((p) => p.id === productId);
        return { productId, title: product?.title || productId, count };
      });

    const productsWithNoClicks = activeProducts.filter((p) => !productClicks[p.id]);

    return NextResponse.json({
      summary: {
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        inactiveProducts: inactive.length,
        totalOffers,
        totalAffiliateLinks: affiliateLinks.length,
        totalClicks: clicksData.length,
        affiliateClicks: affiliateClickCount,
        sponsoredClicks: sponsoredClickCount,
        sponsoredProducts: sponsored.length,
        recommendationViews: 0,
      },
      topStores,
      topCategories,
      topProducts,
      productsWithNoClicks: productsWithNoClicks.map((p) => ({ id: p.id, title: p.title, category: p.category })),
      validation: {
        errors: validation.filter((v) => v.severity === "error"),
        warnings: validation.filter((v) => v.severity === "warning"),
        brokenLinks: brokenLinks.length,
        priceIssues: priceIssues.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
