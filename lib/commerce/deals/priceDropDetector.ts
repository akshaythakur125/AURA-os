import type { WishlistItem } from "@/types/wishlist";
import type { CommerceSearchItem } from "@/types/commerceSearch";

export interface PriceDrop {
  item: WishlistItem;
  currentPrice: number;
  previousPrice: number;
  dropAmount: number;
  dropPercent: number;
  isSignificant: boolean;
}

const DROP_THRESHOLD_AMOUNT = 100;
const DROP_THRESHOLD_PERCENT = 10;

export function detectPriceDrop(
  wishlistItem: WishlistItem,
  catalogItems: CommerceSearchItem[]
): PriceDrop | null {
  const match = findCatalogMatch(wishlistItem, catalogItems);
  if (!match) return null;

  const currentPrice = match.price;
  const previousPrice = wishlistItem.savedPrice;
  const dropAmount = previousPrice - currentPrice;
  const dropPercent = previousPrice > 0 ? Math.round((dropAmount / previousPrice) * 100) : 0;

  return {
    item: wishlistItem,
    currentPrice,
    previousPrice,
    dropAmount,
    dropPercent,
    isSignificant: dropAmount >= DROP_THRESHOLD_AMOUNT && dropPercent >= DROP_THRESHOLD_PERCENT,
  };
}

export function detectPriceDrops(
  wishlistItems: WishlistItem[],
  catalogItems: CommerceSearchItem[]
): PriceDrop[] {
  return wishlistItems
    .map((item) => detectPriceDrop(item, catalogItems))
    .filter((d): d is PriceDrop => d !== null && d.isSignificant)
    .sort((a, b) => b.dropPercent - a.dropPercent);
}

export function findCatalogMatch(
  wishlistItem: WishlistItem,
  catalogItems: CommerceSearchItem[]
): CommerceSearchItem | undefined {
  // Exact ID match first
  const exact = catalogItems.find(
    (c) => c.id === wishlistItem.productId || c.sourceProductId === wishlistItem.productId
  );
  if (exact) return exact;

  // Store + title match
  const storeMatch = catalogItems.find(
    (c) =>
      c.storeKey === wishlistItem.storeKey &&
      c.normalizedTitle.includes(wishlistItem.productTitle.toLowerCase().slice(0, 20))
  );
  if (storeMatch) return storeMatch;

  // Title match (any store)
  return catalogItems.find((c) =>
    c.normalizedTitle.includes(wishlistItem.productTitle.toLowerCase().slice(0, 20))
  );
}
