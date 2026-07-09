import type { ProductType } from "@/types/payment";

const PRODUCT_PRICES: Record<ProductType, number> = {
  aura_report: 99,
  dating_audit: 299,
  glowup_plan: 499,
};

const PRODUCT_NAMES: Record<ProductType, string> = {
  aura_report: "Aura Report",
  dating_audit: "Dating / Profile Audit",
  glowup_plan: "30-Day Glow-Up Plan",
};

const PRODUCT_PREFIXES: Record<ProductType, string> = {
  aura_report: "AURA",
  dating_audit: "DATE",
  glowup_plan: "GLOW",
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

export function validateUnlockCodeServer(params: {
  code: string;
  auditId: string;
  productType: ProductType;
}): { valid: boolean; reason: string } {
  const { code, auditId, productType } = params;
  if (!code || typeof code !== "string") {
    return { valid: false, reason: "No code provided." };
  }

  const trimmed = normalizeCode(code);

  const demoCode = process.env.ADMIN_UNLOCK_CODE || "";
  if (demoCode && timingSafeEqual(trimmed, normalizeCode(demoCode))) {
    return { valid: true, reason: "Admin unlock code accepted." };
  }

  const auditSuffix = auditId.replace(/-/g, "").slice(-6).toUpperCase();
  const prefix = PRODUCT_PREFIXES[productType] || "AURA";
  const computedCode = `${prefix}-${auditSuffix}`;

  if (timingSafeEqual(trimmed, computedCode)) {
    return { valid: true, reason: "Audit-specific unlock code accepted." };
  }

  return { valid: false, reason: "Invalid unlock code." };
}
