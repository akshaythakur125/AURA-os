import type { LaunchCheck } from "@/types/launch";
import { getSearchIndex } from "@/lib/storage/commerceSearchStore";
import { getWishlistItems } from "@/lib/commerce/wishlist/wishlistStore";

export function checkCommerceHealth(): { checks: LaunchCheck[] } {
  const checks: LaunchCheck[] = [];

  const index = getSearchIndex();
  const wishlist = getWishlistItems();

  const activeItems = index.filter((i) => i.isActive);
  const itemsWithAffiliate = index.filter((i) => i.affiliateUrl && i.affiliateUrl !== "#");
  const itemsWithUrl = index.filter((i) => i.productUrl && i.productUrl !== "#");
  const staleItems = index.filter((i) => i.priceFreshness === "stale" || i.priceFreshness === "unknown");

  const stores = new Set(index.map((i) => i.storeKey));
  const storeKeysStr = Array.from(stores).join(",");
  const hasMajorStores = storeKeysStr.includes("myntra") || storeKeysStr.includes("ajio") || storeKeysStr.includes("amazon_fashion") || storeKeysStr.includes("flipkart_fashion");

  checks.push({
    name: "Catalog size",
    status: activeItems.length >= 10 ? "pass" : activeItems.length > 0 ? "warning" : "fail",
    message: `${activeItems.length} active products in index`,
  });

  if (activeItems.length > 0) {
    checks.push({
      name: "Stores represented",
      status: stores.size >= 2 ? "pass" : "warning",
      message: `${stores.size} stores: ${Array.from(stores).join(", ") || "none"}`,
    });

    checks.push({
      name: "Major stores",
      status: hasMajorStores ? "pass" : "warning",
      message: hasMajorStores ? "Has offers from Myntra/AJIO/Amazon/Flipkart" : "No major Indian store offers found",
    });

    const urlRatio = Math.round((itemsWithUrl.length / activeItems.length) * 100);
    checks.push({
      name: "Product URLs",
      status: urlRatio >= 80 ? "pass" : urlRatio >= 50 ? "warning" : "fail",
      message: `${urlRatio}% of products have direct URLs`,
    });

    const affiliateRatio = Math.round((itemsWithAffiliate.length / activeItems.length) * 100);
    checks.push({
      name: "Affiliate links",
      status: affiliateRatio > 0 ? "pass" : "warning",
      message: `${affiliateRatio}% of products have affiliate links`,
    });

    const staleRatio = Math.round((staleItems.length / activeItems.length) * 100);
    checks.push({
      name: "Price freshness",
      status: staleRatio < 30 ? "pass" : staleRatio < 60 ? "warning" : "fail",
      message: `${staleRatio}% of prices are stale or unknown`,
    });
  }

  checks.push({
    name: "Wishlist/saved items",
    status: wishlist.length > 0 ? "pass" : "pass",
    message: `${wishlist.length} saved items — grows with user activity`,
  });

  checks.push({
    name: "Affiliate disclosure",
    status: "manual",
    message: "Verify affiliate disclosure is visible on wardrobe/search/shop pages",
  });

  return { checks };
}
