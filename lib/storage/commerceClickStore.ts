import type { CommerceClickEvent, CommerceAnalytics } from "@/types/commerce";
import { getItem, setItem } from "./localStore";

const CLICKS_KEY = "auracheck:v1:commerce_clicks";
const VIEWS_KEY = "auracheck:v1:commerce_views";

export interface ExtendedClickEvent extends Omit<CommerceClickEvent, "clickedAt"> {
  storeName?: string;
  category?: string;
  isSponsored?: boolean;
  clickedAt?: string;
}

function getAllClicks(): ExtendedClickEvent[] {
  return getItem<ExtendedClickEvent[]>(CLICKS_KEY, []);
}

function saveAllClicks(clicks: ExtendedClickEvent[]): void {
  setItem(CLICKS_KEY, clicks);
}

export function addClick(event: ExtendedClickEvent): void {
  const clicks = getAllClicks();
  clicks.push(event);
  saveAllClicks(clicks);
}

export function getCommerceClicks(): ExtendedClickEvent[] {
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
  const storeCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const productCounts: Record<string, { count: number; title: string }> = {};

  for (const c of clicks) {
    const sk = c.storeKey || "unknown";
    storeCounts[sk] = (storeCounts[sk] || 0) + 1;

    const cat = c.category || c.productId.split("_")[0] || "unknown";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    if (!productCounts[c.productId]) {
      productCounts[c.productId] = { count: 0, title: c.productId };
    }
    productCounts[c.productId].count++;
  }

  const topClickedStores = Object.entries(storeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([store, count]) => ({ store, count }));

  const topClickedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  const topClickedProducts = Object.entries(productCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([productId, data]) => ({ productId, title: data.title, count: data.count }));

  const affiliateClicks = clicks.filter((c) => c.affiliateUsed).length;
  const sponsoredClicks = clicks.filter((c) => c.isSponsored).length;

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

export function getStorePerformance(): Record<string, { totalClicks: number; affiliateClicks: number; sponsoredClicks: number; totalPrice: number }> {
  const clicks = getAllClicks();
  const perf: Record<string, { totalClicks: number; affiliateClicks: number; sponsoredClicks: number; totalPrice: number }> = {};

  for (const c of clicks) {
    const sk = c.storeKey || "unknown";
    if (!perf[sk]) perf[sk] = { totalClicks: 0, affiliateClicks: 0, sponsoredClicks: 0, totalPrice: 0 };
    perf[sk].totalClicks++;
    if (c.affiliateUsed) perf[sk].affiliateClicks++;
    if (c.isSponsored) perf[sk].sponsoredClicks++;
    perf[sk].totalPrice += c.productPrice || 0;
  }

  return perf;
}

export function getProductClickDetails(): Record<string, { total: number; affiliate: number; lastClicked: string | null }> {
  const clicks = getAllClicks();
  const details: Record<string, { total: number; affiliate: number; lastClicked: string | null }> = {};

  for (const c of clicks) {
    if (!details[c.productId]) details[c.productId] = { total: 0, affiliate: 0, lastClicked: null };
    details[c.productId].total++;
    if (c.affiliateUsed) details[c.productId].affiliate++;
    if (c.clickedAt && (!details[c.productId].lastClicked || c.clickedAt > details[c.productId].lastClicked!)) {
      details[c.productId].lastClicked = c.clickedAt;
    }
  }

  return details;
}
