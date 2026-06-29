import type { AffiliateClick, AffiliateStats } from "@/types/product";
import { createLocalId } from "@/types/audit";
import { getItem, setItem } from "./localStore";
import { STORAGE_KEYS } from "./storageKeys";

function getAll(): AffiliateClick[] {
  return getItem<AffiliateClick[]>(STORAGE_KEYS.AFFILIATE_CLICKS, []);
}

function persist(clicks: AffiliateClick[]): void {
  setItem(STORAGE_KEYS.AFFILIATE_CLICKS, clicks);
}

export function getAffiliateClicks(): AffiliateClick[] {
  return getAll().sort(
    (a, b) => new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime()
  );
}

export function recordAffiliateClick(input: {
  productId: string;
  auditId?: string;
  source: string;
}): AffiliateClick {
  const click: AffiliateClick = {
    id: createLocalId(),
    productId: input.productId,
    auditId: input.auditId,
    source: input.source,
    clickedAt: new Date().toISOString(),
  };
  const clicks = getAll();
  clicks.push(click);
  persist(clicks);
  return click;
}

export function getAffiliateStats(): AffiliateStats {
  const clicks = getAll();
  const byProduct: Record<string, number> = {};
  const bySource: Record<string, number> = {};

  for (const c of clicks) {
    byProduct[c.productId] = (byProduct[c.productId] || 0) + 1;
    bySource[c.source] = (bySource[c.source] || 0) + 1;
  }

  return {
    totalClicks: clicks.length,
    clicksByProduct: byProduct,
    clicksBySource: bySource,
    latestClickDate: clicks.length > 0 ? clicks[clicks.length - 1].clickedAt : null,
  };
}
