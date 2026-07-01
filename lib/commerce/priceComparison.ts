import type { CommerceProduct, ProductOffer, AuraCommerceRecommendation, StoreKey } from "@/types/commerce";
import { compareOfferPrices, formatPrice, calculateDiscountPercent } from "./dealScoring";
import { getStoreTrustWeight } from "./storeDirectory";

export interface ComparisonResult {
  product: CommerceProduct;
  bestPriceOffer: ProductOffer;
  bestValueOffer: ProductOffer;
  highestDiscountOffer?: ProductOffer;
  cheapestOffer: ProductOffer;
  offersSortedByPrice: ProductOffer[];
  priceRange: { min: number; max: number };
  savingsPossible: number;
}

export function buildComparisonForProduct(product: CommerceProduct): ComparisonResult | null {
  if (!product.offers || product.offers.length === 0) return null;

  const { cheapest, bestValue, highestDiscount, sortedByPrice } = compareOfferPrices(product.offers);

  if (!cheapest || !bestValue) return null;

  const prices = product.offers.map((o) => o.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    product,
    bestPriceOffer: cheapest,
    bestValueOffer: bestValue,
    highestDiscountOffer: highestDiscount || undefined,
    cheapestOffer: cheapest,
    offersSortedByPrice: sortedByPrice,
    priceRange: { min, max },
    savingsPossible: max - min,
  };
}

export function buildRecommendation(
  product: CommerceProduct,
  matchScore: number,
  auraImpactScore: number,
  reason: string,
  linkedAuraLeak?: string,
  buyPriority?: "buy_first" | "buy_later" | "avoid_for_now"
): AuraCommerceRecommendation | null {
  const comparison = buildComparisonForProduct(product);
  if (!comparison) return null;

  const dealScore = calculateDealScore(comparison);
  const priceValueScore = calculatePriceValueScore(comparison);

  return {
    product,
    bestPriceOffer: comparison.bestPriceOffer,
    bestValueOffer: comparison.bestValueOffer,
    highestDiscountOffer: comparison.highestDiscountOffer,
    cheapestOffer: comparison.cheapestOffer,
    offersSortedByPrice: comparison.offersSortedByPrice,
    matchScore,
    auraImpactScore,
    priceValueScore,
    dealScore,
    reason,
    linkedAuraLeak: linkedAuraLeak as any,
    stylingTip: product.stylingTip,
    buyPriority: buyPriority || "buy_later",
    avoidReason: buyPriority === "avoid_for_now" ? product.avoidIf : undefined,
  };
}

function calculateDealScore(comparison: ComparisonResult): number {
  const bestDiscount = comparison.highestDiscountOffer?.discountPercent || 0;
  const savingsRatio = comparison.priceRange.max > 0
    ? comparison.savingsPossible / comparison.priceRange.max
    : 0;
  return Math.round(Math.min(100, bestDiscount * 1.5 + savingsRatio * 50));
}

function calculatePriceValueScore(comparison: ComparisonResult): number {
  const trustWeight = getStoreTrustWeight(comparison.bestValueOffer.storeKey);
  const discount = comparison.bestValueOffer.discountPercent || 0;
  const priceRelative = 1 - (comparison.bestValueOffer.price - comparison.priceRange.min) /
    (comparison.priceRange.max - comparison.priceRange.min || 1);
  return Math.round(Math.min(100, priceRelative * 50 + trustWeight * 30 + discount * 0.2));
}

export function formatComparisonSummary(comparison: ComparisonResult): string {
  const lines: string[] = [];
  lines.push(`Best price: ${formatPrice(comparison.bestPriceOffer.price)} at ${comparison.bestPriceOffer.storeName}`);
  lines.push(`Best value: ${formatPrice(comparison.bestValueOffer.price)} at ${comparison.bestValueOffer.storeName}`);
  if (comparison.highestDiscountOffer) {
    lines.push(`Highest discount: ${comparison.highestDiscountOffer.discountPercent}% off at ${comparison.highestDiscountOffer.storeName}`);
  }
  return lines.join(" | ");
}
