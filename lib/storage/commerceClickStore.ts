import type { CommerceClickEvent, CommerceAnalytics, StoreKey, WardrobeCategory } from "@/types/commerce";
import { getItem, setItem } from "./localStore";

const CLICKS_KEY = "auracheck:v1:commerce_clicks";
const VIEWS_KEY = "auracheck:v1:commerce_views";

function getAllClicks(): CommerceClickEvent[] {
  return getItem<CommerceClickEvent[]>(CLICKS_KEY, []);
}

function saveAllClicks(clicks: CommerceClickEvent[]): void {
  setItem(CLICKS_KEY, clicks);
}

export function addClick(event: CommerceClickEvent): void {
  const clicks = getAllClicks();
  clicks.push(event);
  saveAllClicks(clicks);
}

export function getCommerceClicks(): CommerceClickEvent[] {
  return getAllClicks();
}

export function clearClicks(): void {
  setItem(CLICKS_KEY, []);
}

export function trackCommerceView(): void {
  const views = getItem<number>(VIEWS_KEY, 0);
  setItem(VIEWS_KEY, views + 1);
}

export function getCommerceViews(): number {
  return getItem<number>(VIEWS_KEY, 0);
}

export function getCommerceAnalytics(): CommerceAnalytics {
  const clicks = getAllClicks();
  const totalProductClicks = clicks.length;

  // Store counts
  const storeCounts: Record<string, number> = {};
  for (const c of clicks) {
    storeCounts[c.storeKey] = (storeCounts[c.storeKey] || 0) + 1;
  }
  const topClickedStores = Object.entries(storeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([store, count]) => ({ store, count }));

  // Category counts (derived from product IDs)
  const categoryCounts: Record<string, number> = {};
  for (const c of clicks) {
    const cat = c.productId.split("_")[0] || "unknown";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  const topClickedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  // Product counts
  const productCounts: Record<string, { count: number; title: string }> = {};
  for (const c of clicks) {
    if (!productCounts[c.productId]) {
      productCounts[c.productId] = { count: 0, title: c.productId };
    }
    productCounts[c.productId].count++;
  }
  const topClickedProducts = Object.entries(productCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([productId, data]) => ({ productId, title: data.title, count: data.count }));

  const affiliateClicks = clicks.filter((c) => c.affiliateUsed).length;
  const sponsoredClicks = clicks.filter((c) =>
    c.productId.includes("sponsored")
  ).length;

  return {
    totalRecommendationViews: getCommerceViews(),
    totalProductClicks,
    topClickedStores,
    topClickedCategories,
    topClickedProducts,
    affiliateClicks,
    sponsoredClicks,
    mostCommonStyleDirection: null,
    mostCommonOutfitGap: null,
    bestPerformingBudgetRange: null,
  };
}
