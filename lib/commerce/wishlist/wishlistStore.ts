import type { WishlistItem, WishlistStats } from "@/types/wishlist";
import { getItem, setItem } from "@/lib/storage/localStore";
import { getCommerceClicks } from "@/lib/storage/commerceClickStore";
import { getSavedBundles } from "./savedWardrobeStore";

const WISHLIST_KEY = "auracheck:v1:wishlist_items";

// ─── Wishlist Items ───

export function getWishlistItems(): WishlistItem[] {
  return getItem<WishlistItem[]>(WISHLIST_KEY, []);
}

export function saveWishlistItems(items: WishlistItem[]): void {
  setItem(WISHLIST_KEY, items);
}

export function addWishlistItem(item: WishlistItem): void {
  const items = getWishlistItems();
  const existing = items.findIndex(
    (i) => i.productId === item.productId && i.storeKey === item.storeKey
  );
  if (existing >= 0) {
    items[existing] = { ...items[existing], ...item, updatedAt: new Date().toISOString() };
  } else {
    items.push(item);
  }
  saveWishlistItems(items);
}

export function removeWishlistItem(id: string): void {
  saveWishlistItems(getWishlistItems().filter((i) => i.id !== id));
}

export function updateWishlistItem(id: string, updates: Partial<WishlistItem>): boolean {
  const items = getWishlistItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return false;
  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  saveWishlistItems(items);
  return true;
}

export function getWishlistItem(id: string): WishlistItem | undefined {
  return getWishlistItems().find((i) => i.id === id);
}

export function isProductSaved(productId: string, storeKey?: string): boolean {
  return getWishlistItems().some(
    (i) => i.productId === productId && (!storeKey || i.storeKey === storeKey)
  );
}

export function updateCurrentPrices(items: WishlistItem[], catalog: Array<{ id: string; price: number; priceFreshness: string; storeKey: string }>): WishlistItem[] {
  return items.map((item) => {
    const match = catalog.find(
      (c) => c.id === item.productId || (c.id.includes(item.productId))
    );
    if (match) {
      return { ...item, currentPrice: match.price, priceFreshness: match.priceFreshness };
    }
    return item;
  });
}

// ─── Stats ───

export function getWishlistStats(): WishlistStats {
  const items = getWishlistItems();
  const clicks = getCommerceClicks().filter((c) => items.some((i) => i.productId === c.productId));

  const categoryCounts: Record<string, number> = {};
  const storeCounts: Record<string, number> = {};
  const productClicks: Record<string, number> = {};

  for (const item of items) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    if (item.storeKey) storeCounts[item.storeKey] = (storeCounts[item.storeKey] || 0) + 1;
  }

  for (const c of clicks) {
    productClicks[c.productId] = (productClicks[c.productId] || 0) + 1;
  }

  const priceDrops = items
    .filter((i) => i.currentPrice !== undefined && i.savedPrice > (i.currentPrice || 0))
    .sort((a, b) => ((a.savedPrice - (a.currentPrice || a.savedPrice)) - (b.savedPrice - (b.currentPrice || b.savedPrice))));

  return {
    totalItems: items.length,
    totalBundles: getSavedBundles().length,
    activeAlerts: 0,
    unreadAlerts: 0,
    biggestPriceDrop: priceDrops.length > 0 ? priceDrops[0].savedPrice - (priceDrops[0].currentPrice || priceDrops[0].savedPrice) : 0,
    biggestPriceDropTitle: priceDrops.length > 0 ? priceDrops[0].productTitle : "",
    mostSavedCategory: Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "",
    mostSavedStore: Object.entries(storeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "",
    highestIntentProduct: Object.entries(productClicks).sort((a, b) => b[1] - a[1])[0]?.[0] || "",
    totalClicksFromSaved: clicks.length,
  };
}

// ─── Saved Bundles ───
// Use savedWardrobeStore for bundle operations

