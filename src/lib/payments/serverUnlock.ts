import type { ProductType } from "@/types/payment";

const PRODUCT_PRICES: Record<ProductType, number> = {
  aura_report: 25,
  dating_audit: 299,
  glowup_plan: 499,
};

const PRODUCT_NAMES: Record<ProductType, string> = {
  aura_report: "Aura Report",
  dating_audit: "Dating / Profile Audit",
  glowup_plan: "30-Day Glow-Up Plan",
};

export function getServerProductPrice(productType: ProductType): number {
  return PRODUCT_PRICES[productType] || 99;
}

export function getServerProductName(productType: ProductType): string {
  return PRODUCT_NAMES[productType] || "Aura Report";
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

/**
 * Check if the code matches the admin-only override secret.
 * This is the ONLY "backdoor" — a static secret only the founder knows,
 * not derivable from public data. Used for founder's own manual override/testing.
 */
export function isAdminUnlockCode(code: string): boolean {
  const demoCode = process.env.ADMIN_UNLOCK_CODE || "";
  if (!demoCode) return false;
  return timingSafeEqual(normalizeCode(code), normalizeCode(demoCode));
}
