import type { ProductOffer, StoreKey } from "@/types/commerce";
import { getStoreInfo } from "@/config/storeDirectory";

function buildSearchUrl(base: string, query: string): string {
  return `${base}${encodeURIComponent(query.trim())}`;
}

function getStoreSearchUrl(storeKey: StoreKey, query: string): string {
  switch (storeKey) {
    case "myntra":
      return buildSearchUrl("https://www.myntra.com/", query);
    case "ajio":
      return buildSearchUrl("https://www.ajio.com/search/?text=", query);
    case "amazon_fashion":
      return buildSearchUrl("https://www.amazon.in/s?k=", query);
    case "flipkart_fashion":
      return buildSearchUrl("https://www.flipkart.com/search?q=", query);
    case "tata_cliq":
      return buildSearchUrl("https://www.tatacliq.com/search/?searchCategory=all&text=", query);
    case "nykaa_fashion":
      return buildSearchUrl("https://www.nykaafashion.com/catalogsearch/result/?q=", query);
    case "meesho":
      return buildSearchUrl("https://www.meesho.com/search?q=", query);
    case "snitch":
      return buildSearchUrl("https://www.snitch.co.in/search?q=", query);
    case "souled_store":
      return buildSearchUrl("https://www.thesouledstore.com/search?type=product&q=", query);
    case "bewakoof":
      return buildSearchUrl("https://www.bewakoof.com/search/", query);
    case "hm_india":
      return buildSearchUrl("https://www2.hm.com/en_in/search-results.html?q=", query);
    case "narzo_manual":
    case "other":
    default:
      return buildSearchUrl("https://www.google.com/search?q=", `${query} buy online india`);
  }
}

export function getAffiliateUrl(offer: ProductOffer): string | undefined {
  if (offer.affiliateUrl) return offer.affiliateUrl;
  if (offer.isAffiliate) return offer.url;
  return undefined;
}

export function isAffiliateSupported(storeKey: StoreKey): boolean {
  return getStoreInfo(storeKey).affiliateSupported;
}

export function getClickUrl(offer: ProductOffer): string {
  if (offer.affiliateUrl) return offer.affiliateUrl;

  // ponytail: the static catalog still contains invented or category URLs, so use a real on-store search as the safe default.
  return getStoreSearchUrl(offer.storeKey, offer.productName || "fashion");
}

export function getButtonLabel(offer: ProductOffer): string {
  if (offer.isAffiliate) return "Buy via affiliate";
  return `Search on ${offer.storeName}`;
}
