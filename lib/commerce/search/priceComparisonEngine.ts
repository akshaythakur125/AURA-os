import type { CommerceSearchItem, ComparableGroup } from "@/types/commerceSearch";
import { getStoreInfo } from "@/config/storeDirectory";

export interface PriceComparisonResult {
  groupKey: string;
  groupLabel: string;
  cheapest: CommerceSearchItem | null;
  cheapestPrice: number;
  bestValue: CommerceSearchItem | null;
  bestValueScore: number;
  highestDiscount: CommerceSearchItem | null;
  highestDiscountPercent: number;
  trustedStoreOption: CommerceSearchItem | null;
  affiliateOption: CommerceSearchItem | null;
  stalePriceWarnings: CommerceSearchItem[];
  priceRange: { min: number; max: number };
  totalOptions: number;
}

/**
 * Compare prices within a comparable group and return the best options.
 */
export function comparePricesInGroup(group: ComparableGroup): PriceComparisonResult {
  const items = group.items;
  const prices = items.map((i) => i.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const staleItems = items.filter(
    (i) => i.priceFreshness === "stale" || i.priceFreshness === "unknown"
  );

  const cheapest = group.cheapest;
  const bestValue = group.bestValue;
  const highestDiscount = group.highestDiscount;

  // Compute best value score
  const bestValueScore = bestValue
    ? computeGroupValueScore(bestValue, items)
    : 0;

  return {
    groupKey: group.key,
    groupLabel: group.label,
    cheapest,
    cheapestPrice: cheapest?.price || 0,
    bestValue,
    bestValueScore,
    highestDiscount,
    highestDiscountPercent: highestDiscount?.discountPercent || 0,
    trustedStoreOption: group.trustedStore,
    affiliateOption: group.affiliateOption,
    stalePriceWarnings: staleItems,
    priceRange: { min: minPrice, max: maxPrice },
    totalOptions: items.length,
  };
}

/**
 * Compare prices across multiple comparable groups.
 */
export function comparePricesAcrossGroups(
  groups: ComparableGroup[]
): PriceComparisonResult[] {
  return groups.map(comparePricesInGroup);
}

/**
 * Find the overall best deal across all groups.
 */
export function findOverallBestDeal(
  results: PriceComparisonResult[]
): PriceComparisonResult | null {
  if (results.length === 0) return null;

  return results.reduce((best, curr) => {
    const bestScore = best.bestValueScore;
    const currScore = curr.bestValueScore;
    return currScore > bestScore ? curr : best;
  }, results[0]);
}

/**
 * Format a comparison summary for display.
 */
export function formatComparisonSummary(
  result: PriceComparisonResult
): string {
  const parts: string[] = [];

  if (result.cheapest) {
    parts.push(`Cheapest: ₹${result.cheapest.price} at ${result.cheapest.storeName}`);
  }

  if (result.bestValue && result.bestValue !== result.cheapest) {
    parts.push(`Best value: ₹${result.bestValue.price} at ${result.bestValue.storeName}`);
  }

  if (result.highestDiscount && result.highestDiscountPercent >= 15) {
    parts.push(`${result.highestDiscountPercent}% off at ${result.highestDiscount.storeName}`);
  }

  if (result.trustedStoreOption) {
    parts.push(`Trusted store: ${result.trustedStoreOption.storeName}`);
  }

  if (result.stalePriceWarnings.length > 0) {
    const staleNames = [...new Set(result.stalePriceWarnings.map((s) => s.storeName))];
    parts.push(`⚠ Verify prices at: ${staleNames.join(", ")}`);
  }

  if (result.affiliateOption) {
    parts.push("Affiliate link available");
  }

  return parts.join(" | ");
}

function computeGroupValueScore(
  item: CommerceSearchItem,
  group: CommerceSearchItem[]
): number {
  const storeInfo = getStoreInfo(item.storeKey);
  const trustWeight = storeInfo?.trustWeight || 0.3;

  const maxPrice = Math.max(...group.map((x) => x.price));
  const minPrice = Math.min(...group.map((x) => x.price));
  const priceRange = maxPrice - minPrice || 1;
  const priceScore = 1 - (item.price - minPrice) / priceRange;

  const availabilityScore = item.availabilityStatus === "available" ? 1 : 0.3;

  const freshnessScores: Record<string, number> = {
    fresh: 1, recent: 0.7, manual: 0.5, unknown: 0.3, stale: 0.1,
  };
  const freshnessScore = freshnessScores[item.priceFreshness] ?? 0.3;

  const discountScore = item.discountPercent ? item.discountPercent / 100 : 0;

  // Price score 35%, aura match 25%, store trust 15%, freshness 15%, availability 10%
  // Since aura match is per-user, we use a neutral 0.5 for cross-user comparison
  const auraMatchComponent = 0.5;

  return (
    priceScore * 0.35 +
    auraMatchComponent * 0.25 +
    trustWeight * 0.15 +
    freshnessScore * 0.15 +
    availabilityScore * 0.05 +
    discountScore * 0.05
  );
}
