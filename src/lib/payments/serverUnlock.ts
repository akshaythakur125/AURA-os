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
  const normalized = normalizeCode(code);
  const privateCode = process.env.ADMIN_ACCESS_CODE || "";
  if (privateCode && timingSafeEqual(normalized, normalizeCode(privateCode))) return true;

  const publicCodes = [
    { value: process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "", defaultValue: "ADMINDEMO" },
    { value: process.env.NEXT_PUBLIC_DEMO_UNLOCK_CODE || "", defaultValue: "AURADEMO" },
  ];

  return publicCodes.some(({ value, defaultValue }) => {
    if (!value) return false;
    const normalizedValue = normalizeCode(value);
    if (process.env.NODE_ENV === "production" && normalizedValue === defaultValue) return false;
    return timingSafeEqual(normalized, normalizedValue);
  });
}
