import type { CommerceProduct, ProductOffer } from "@/types/commerce";
import type { CommerceSettings } from "@/types/commerceAdmin";
import { getItem, setItem } from "@/lib/storage/localStore";

const SETTINGS_KEY = "auracheck:v1:commerce_settings";

export function getCommerceSettings(): CommerceSettings {
  return getItem<CommerceSettings>(SETTINGS_KEY, {
    commissionRate: 5,
    defaultCommissionRate: 5,
    lastUpdated: new Date().toISOString(),
  });
}

export function saveCommerceSettings(settings: CommerceSettings): void {
  setItem(SETTINGS_KEY, settings);
}

export function getAffiliateLinks(products: CommerceProduct[]): {
  productId: string;
  title: string;
  category: string;
  storeKey: string;
  storeName: string;
  affiliateUrl: string;
  isActive: boolean;
}[] {
  const links: {
    productId: string;
    title: string;
    category: string;
    storeKey: string;
    storeName: string;
    affiliateUrl: string;
    isActive: boolean;
  }[] = [];

  for (const p of products) {
    for (const o of p.offers || []) {
      const url = o.affiliateUrl || (o.isAffiliate ? o.url : undefined);
      if (url) {
        links.push({
          productId: p.id,
          title: p.title,
          category: p.category,
          storeKey: o.storeKey,
          storeName: o.storeName,
          affiliateUrl: url,
          isActive: p.isActive,
        });
      }
    }
  }

  return links;
}

export function getAffiliateLinksByStore(products: CommerceProduct[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const link of getAffiliateLinks(products)) {
    counts[link.storeKey] = (counts[link.storeKey] || 0) + 1;
  }
  return counts;
}

export function estimateAffiliateRevenue(
  totalClickValue: number,
  commissionRate?: number
): number {
  const rate = commissionRate ?? getCommerceSettings().commissionRate;
  return Math.round(totalClickValue * (rate / 100));
}

export function estimateOrderIntentValue(products: CommerceProduct[], clicks: { price: number }[]): number {
  return clicks.reduce((sum, c) => sum + (c.price || 0), 0);
}
