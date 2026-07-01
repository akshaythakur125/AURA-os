import type { CommerceClickEvent, StoreKey } from "@/types/commerce";
import type { ExtendedClickEvent } from "@/lib/storage/commerceClickStore";
import { addClick } from "@/lib/storage/commerceClickStore";
import { shouldUseSupabase } from "@/lib/storage/storageMode";
import { formatStoreName } from "@/config/storeDirectory";

export function trackCommerceClick(event: ExtendedClickEvent): void {
  const full: ExtendedClickEvent = {
    ...event,
    clickedAt: event.clickedAt || new Date().toISOString(),
    storeName: event.storeName || formatStoreName(event.storeKey),
  };

  addClick(full);

  if (shouldUseSupabase()) {
    try {
      fetch("/api/commerce/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(full),
      }).catch(() => {});
    } catch {
      // no-op
    }
  }
}

export function trackStoreClick(
  storeKey: StoreKey,
  productId: string,
  offerId: string,
  price: number,
  isAffiliate: boolean,
  source: string,
  auditId?: string,
  category?: string,
  isSponsored?: boolean,
  storeName?: string,
): void {
  trackCommerceClick({
    productId,
    offerId,
    storeKey,
    auditId,
    source,
    productPrice: price,
    affiliateUsed: isAffiliate,
    category,
    isSponsored,
    storeName,
  });
}
