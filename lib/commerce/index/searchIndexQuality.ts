import type { CommerceSearchItem } from "@/types/commerceSearch";
import type { DataQualitySummary, DataQualityWarning } from "@/types/dataQuality";
import { getSearchIndex } from "@/lib/storage/commerceSearchStore";
import { detectPriceAnomalies } from "@/lib/commerce/prices/priceAnomalyDetector";
import { getCommerceClicks } from "@/lib/storage/commerceClickStore";

export function buildQualitySummary(): DataQualitySummary {
  const index = getSearchIndex();
  const anomalies = detectPriceAnomalies(index);

  const stalePrices = index.filter((i) => i.priceFreshness === "stale").length;
  const manualPrices = index.filter((i) => i.priceFreshness === "manual").length;
  const unknownPrices = index.filter((i) => i.priceFreshness === "unknown").length;

  const suspiciousDiscounts = anomalies.filter((a) =>
    a.warnings.some((w) => w.warningType === "discount_too_high" || w.warningType === "suspicious_discount_pattern")
  ).length;

  const invalidUrls = anomalies.filter((a) =>
    a.warnings.some((w) => w.warningType === "missing_url" || w.warningType === "broken_url")
  ).length;

  const missingAffiliateLinks = index.filter(
    (i) => !i.affiliateUrl || i.affiliateUrl === "#"
  ).length;

  const missingImages = index.filter(
    (i) => !i.imageUrl || i.imageUrl === "#"
  ).length;

  // Detect duplicates (same normalizedTitle + category)
  const seen = new Map<string, number>();
  let duplicates = 0;
  for (const item of index) {
    const key = `${item.normalizedTitle}:${item.category}:${item.storeKey}`;
    seen.set(key, (seen.get(key) || 0) + 1);
    if (seen.get(key) === 2) duplicates++;
  }

  const lowConfidenceProducts = index.filter((i) => i.confidenceScore < 40).length;

  // Click data
  const clicks = getCommerceClicks();
  const clickProductIds = new Set(clicks.map((c) => c.productId));
  const staleWithHighClicks = index.filter(
    (i) => i.priceFreshness === "stale" && clickProductIds.has(i.id)
  ).length;

  // Flatten warnings
  const allWarnings: DataQualityWarning[] = [];
  for (const { warnings } of anomalies) {
    allWarnings.push(...warnings);
  }

  return {
    totalIndexed: index.length,
    activeProducts: index.filter((i) => i.isActive).length,
    inactiveProducts: index.filter((i) => !i.isActive).length,
    stalePrices,
    manualPrices,
    unknownPrices,
    suspiciousDiscounts,
    invalidUrls,
    missingAffiliateLinks,
    missingImages,
    duplicateProducts: duplicates,
    lowConfidenceProducts,
    noClickProducts: index.filter((i) => !clickProductIds.has(i.id)).length,
    highClickStalePrices: staleWithHighClicks,
    warnings: allWarnings,
  };
}

export function getStalePriceDetails(): CommerceSearchItem[] {
  return getSearchIndex().filter(
    (i) => i.priceFreshness === "stale" || i.priceFreshness === "unknown"
  );
}

export function getLowConfidenceDetails(): CommerceSearchItem[] {
  return getSearchIndex().filter((i) => i.confidenceScore < 40);
}

export function getProductsWithNoClicks(): CommerceSearchItem[] {
  const clicks = getCommerceClicks();
  const clickIds = new Set(clicks.map((c) => c.productId));
  return getSearchIndex().filter((i) => !clickIds.has(i.id));
}

export function getHighClickStaleProducts(): CommerceSearchItem[] {
  const clicks = getCommerceClicks();
  const clickCounts = new Map<string, number>();
  for (const c of clicks) {
    clickCounts.set(c.productId, (clickCounts.get(c.productId) || 0) + 1);
  }
  return getSearchIndex().filter(
    (i) => (clickCounts.get(i.id) || 0) > 5 && i.priceFreshness === "stale"
  );
}

export function getDuplicateProducts(): {
  key: string;
  items: CommerceSearchItem[];
}[] {
  const groups = new Map<string, CommerceSearchItem[]>();
  for (const item of getSearchIndex()) {
    const key = `${item.normalizedTitle}:${item.category}:${item.storeKey}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries())
    .filter(([, items]) => items.length > 1)
    .map(([key, items]) => ({ key, items }));
}
