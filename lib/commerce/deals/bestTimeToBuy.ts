import type { WishlistItem } from "@/types/wishlist";



export type BuyTiming = "buy_now" | "wait" | "verify_first" | "not_enough_data";

export interface TimingResult {
  timing: BuyTiming;
  label: string;
  reason: string;
}

const LABELS: Record<BuyTiming, string> = {
  buy_now: "Looks worth checking now",
  wait: "Wait or compare alternatives",
  verify_first: "Verify price on store",
  not_enough_data: "Not enough price history",
};

export function evaluateBestTimeToBuy(
  wishlistItem: WishlistItem,
  catalogItem?: { price: number; priceFreshness: string; discountPercent?: number; mrp?: number } | null
): TimingResult {
  // If no catalog match, use wishlist data
  if (!catalogItem) {
    if (wishlistItem.priceFreshness === "stale" || wishlistItem.priceFreshness === "unknown") {
      return { timing: "verify_first", label: LABELS.verify_first, reason: "Price freshness is unknown or stale. Verify on store before buying." };
    }
    return { timing: "not_enough_data", label: LABELS.not_enough_data, reason: "No current catalog data available for this product." };
  }

  const freshness = catalogItem.priceFreshness;

  // Stale/manual/unknown → verify first
  if (freshness === "stale" || freshness === "unknown" || freshness === "manual") {
    return { timing: "verify_first", label: LABELS.verify_first, reason: `Price is ${freshness === "stale" ? "outdated" : freshness === "manual" ? "manually entered" : "unverified"}. Check the store for current price.` };
  }

  // Fresh/recent price + good discount → buy now
  if (freshness === "fresh" || freshness === "recent") {
    const discount = catalogItem.discountPercent || 0;
    const dropped = wishlistItem.savedPrice - catalogItem.price;

    if (discount >= 40 && catalogItem.mrp && catalogItem.mrp > catalogItem.price) {
      return { timing: "buy_now", label: LABELS.buy_now, reason: `${discount}% off MRP with recent price. Looks worth checking now.` };
    }

    if (dropped > 0 && catalogItem.price <= (wishlistItem.targetPrice || 0)) {
      return { timing: "buy_now", label: LABELS.buy_now, reason: `Price dropped to ₹${catalogItem.price} — at or below your target price.` };
    }

    if (dropped > 100) {
      return { timing: "buy_now", label: LABELS.buy_now, reason: `Price dropped by ₹${dropped} since you saved it. Worth checking now.` };
    }

    // Price went up → wait
    if (dropped < -100) {
      return { timing: "wait", label: LABELS.wait, reason: `Price increased by ₹${Math.abs(dropped)} since saved. Consider alternatives.` };
    }
  }

  // Default: not enough data
  return { timing: "not_enough_data", label: LABELS.not_enough_data, reason: "Monitor price changes from AuraCheck's catalog to find the best time." };
}
