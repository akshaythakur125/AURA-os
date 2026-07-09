import { getStoreInfo, getActiveStores, getAllStores, formatStoreName } from "@/config/storeDirectory";
import type { StoreKey } from "@/types/commerce";

export { getStoreInfo, getActiveStores, getAllStores, formatStoreName };

export function getStoreTrustWeight(key: StoreKey): number {
  return getStoreInfo(key).trustWeight;
}

export function formatStoreUrl(key: StoreKey, path?: string): string {
  const info = getStoreInfo(key);
  if (!path) return info.homepageUrl;
  if (info.categoryBaseUrl) return `${info.categoryBaseUrl}${path}`;
  return `${info.homepageUrl}${path}`;
}
