import { PAYMENT_PRODUCTS, type PaymentProductId } from "@/config/pricing";
import type { ProductType } from "@/types/payment";

// ponytail: bridge old ProductType to new ProductId
function toProductId(t: ProductType): PaymentProductId {
  return (t in PAYMENT_PRODUCTS ? t : "aura_report") as PaymentProductId;
}

export function getServerProductPrice(productType: ProductType): number {
  const p = PAYMENT_PRODUCTS[toProductId(productType)];
  return p ? Math.round(p.price / 100) : 0;
}

export function getServerProductName(productType: ProductType): string {
  const p = PAYMENT_PRODUCTS[toProductId(productType)];
  return p?.name || productType;
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = new TextEncoder().encode(a);
  const bBuf = new TextEncoder().encode(b);
  if (aBuf.length !== bBuf.length) return false;
  let mismatch = 0;
  for (let i = 0; i < aBuf.length; i++) {
    mismatch |= aBuf[i] ^ bBuf[i];
  }
  return mismatch === 0;
}

export function isAdminUnlockCode(code: string): boolean {
  const demoCode = process.env.ADMIN_UNLOCK_CODE || "";
  if (!demoCode) return false;
  return timingSafeEqual(normalizeCode(code), normalizeCode(demoCode));
}
