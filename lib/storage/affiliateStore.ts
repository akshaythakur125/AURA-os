"use client";

import { getItem, setItem } from "@/lib/storage/localStore";
import type { AffiliateClick } from "@/types/product";

const CLICKS_KEY = "auracheck:v1:affiliate_clicks";

export function getAffiliateClicks(): AffiliateClick[] {
  return getItem<AffiliateClick[]>(CLICKS_KEY, []);
}

export function recordAffiliateClick(input: {
  productId: string;
  auditId?: string;
  source: string;
}): AffiliateClick {
  const click: AffiliateClick = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: input.productId,
    auditId: input.auditId,
    source: input.source,
    clickedAt: new Date().toISOString(),
  };
  const clicks = getAffiliateClicks();
  clicks.unshift(click);
  setItem(CLICKS_KEY, clicks);
  return click;
}

export function getAffiliateStats(): { totalClicks: number; uniqueProducts: number; topProduct: string | null } {
  const clicks = getAffiliateClicks();
  const productCounts = new Map<string, number>();
  for (const c of clicks) {
    productCounts.set(c.productId, (productCounts.get(c.productId) || 0) + 1);
  }
  let topProduct: string | null = null;
  let maxCount = 0;
  for (const [id, count] of productCounts) {
    if (count > maxCount) {
      maxCount = count;
      topProduct = id;
    }
  }
  return {
    totalClicks: clicks.length,
    uniqueProducts: productCounts.size,
    topProduct,
  };
}
