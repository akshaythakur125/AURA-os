import type { CommerceClickEvent, StoreKey } from "@/types/commerce";
import { addClick } from "@/lib/storage/commerceClickStore";
import { shouldUseSupabase } from "@/lib/storage/storageMode";

export function trackCommerceClick(event: Omit<CommerceClickEvent, "clickedAt">): void {
  const full: CommerceClickEvent = {
    ...event,
    clickedAt: new Date().toISOString(),
  };

  // Always save locally
  addClick(full);

  // If Supabase is configured, send to API (fire-and-forget)
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
  auditId?: string
): void {
  trackCommerceClick({
    productId,
    offerId,
    storeKey,
    auditId,
    source,
    productPrice: price,
    affiliateUsed: isAffiliate,
  });
}
