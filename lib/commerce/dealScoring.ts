import type { ProductOffer } from "@/types/commerce";
import { getStoreTrustWeight } from "./storeDirectory";

export function calculateDiscountPercent(price: number, mrp?: number): number | undefined {
  if (!mrp || mrp <= 0 || mrp <= price) return undefined;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function getDealLabel(offer: ProductOffer): string {
  const discount = offer.discountPercent;
  if (discount && discount >= 50) return "Strong discount";
  if (discount && discount >= 30) return "Good discount";
  if (discount && discount >= 15) return "Decent discount";
  if (offer.price < 500) return "Budget-friendly";
  return "Best listed price";
}

export function compareOfferPrices(offers: ProductOffer[]): {
  cheapest: ProductOffer | null;
  bestValue: ProductOffer | null;
  highestDiscount: ProductOffer | null;
  sortedByPrice: ProductOffer[];
} {
  if (offers.length === 0) {
    return { cheapest: null, bestValue: null, highestDiscount: null, sortedByPrice: [] };
  }

  const sorted = [...offers].sort((a, b) => a.price - b.price);

  const cheapest = sorted[0];

  // Best value: considers price, store trust, discount, availability
  const scored = offers.map((o) => {
    const trustWeight = getStoreTrustWeight(o.storeKey);
    const discountScore = o.discountPercent ? o.discountPercent / 100 : 0;
    const availabilityScore = o.availabilityStatus === "available" ? 1 : 0.3;
    // Normalize price score (lower is better)
    const maxPrice = Math.max(...offers.map((x) => x.price));
    const minPrice = Math.min(...offers.map((x) => x.price));
    const priceRange = maxPrice - minPrice || 1;
    const priceScore = 1 - (o.price - minPrice) / priceRange;

    const valueScore = priceScore * 0.4 + trustWeight * 0.3 + discountScore * 0.2 + availabilityScore * 0.1;
    return { offer: o, valueScore };
  });

  const bestScored = scored.sort((a, b) => b.valueScore - a.valueScore);
  const bestValue = bestScored[0]?.offer || cheapest;

  // Highest discount
  const withDiscount = offers.filter((o) => o.discountPercent !== undefined);
  const sortedDiscount = withDiscount.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
  const highestDiscount = sortedDiscount[0] || null;

  return { cheapest, bestValue, highestDiscount, sortedByPrice: sorted };
}

export function findCheaperAlternatives(
  offers: ProductOffer[],
  maxPrice: number
): ProductOffer[] {
  return offers
    .filter((o) => o.price <= maxPrice)
    .sort((a, b) => a.price - b.price);
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}
