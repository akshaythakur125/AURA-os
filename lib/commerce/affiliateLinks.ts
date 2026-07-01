import type { ProductOffer, StoreKey } from "@/types/commerce";
import { getStoreInfo } from "@/config/storeDirectory";

export function getAffiliateUrl(offer: ProductOffer): string | undefined {
  if (offer.affiliateUrl) return offer.affiliateUrl;
  if (offer.isAffiliate) return offer.url;
  return undefined;
}

export function isAffiliateSupported(storeKey: StoreKey): boolean {
  return getStoreInfo(storeKey).affiliateSupported;
}

export function getClickUrl(offer: ProductOffer): string {
  return offer.affiliateUrl || offer.url || "#";
}

export function getButtonLabel(offer: ProductOffer): string {
  if (offer.url === "#" || !offer.url) return "Link coming soon";
  if (offer.isAffiliate) return "Buy via affiliate";
  return `View on ${offer.storeName}`;
}
