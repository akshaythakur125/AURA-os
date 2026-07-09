import { getStoreInfo, buildStoreSearchUrl } from "@/config/storeDirectory";
import type { StoreKey } from "@/types/commerce";
import type { Product } from "@/types/product";

function isUsableHttpUrl(value?: string): value is string {
  if (!value || value === "#") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function buildSearchUrl(base: string, query: string): string {
  const encoded = encodeURIComponent(query.trim());
  return `${base}${encoded}`;
}

export function getProductExternalUrl(product: Product): string {
  if (isUsableHttpUrl(product.affiliateUrl)) return product.affiliateUrl;

  // ponytail: catalog products are placeholder items today, so fall back to a real store search instead of dead "#".
  return buildSearchUrl("https://www.amazon.in/s?k=", product.title);
}

export function getCommerceItemExternalUrl(input: {
  affiliateUrl?: string;
  productUrl?: string;
  originalTitle: string;
  storeKey: StoreKey;
}): string {
  if (isUsableHttpUrl(input.affiliateUrl)) return input.affiliateUrl;

  // Old catalog rows carried Google `site:` search links as their productUrl.
  // A store's own search page for the same product is strictly better (real
  // results, real images, add-to-cart one tap away), so prefer it over any
  // google.com round-trip.
  const isGoogleFallback = input.productUrl?.includes("google.com/search");
  if (isUsableHttpUrl(input.productUrl) && !isGoogleFallback) return input.productUrl;

  const storeSearch = buildStoreSearchUrl(input.storeKey, input.originalTitle);
  if (storeSearch) return storeSearch;

  if (isUsableHttpUrl(input.productUrl)) return input.productUrl;

  const store = getStoreInfo(input.storeKey);
  if (isUsableHttpUrl(store.homepageUrl)) {
    return store.homepageUrl;
  }

  return buildSearchUrl("https://www.google.com/search?q=", `${input.originalTitle} buy online india`);
}
