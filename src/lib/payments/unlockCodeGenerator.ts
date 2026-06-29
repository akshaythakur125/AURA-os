import type { ProductType } from "@/types/payment";

const PRODUCT_PREFIXES: Record<ProductType, string> = {
  aura_report: "AURA",
  dating_audit: "DATE",
  glowup_plan: "GLOW",
};

export function getProductPrefix(productType: ProductType): string {
  return PRODUCT_PREFIXES[productType] || "AURA";
}

export function normalizeUnlockCode(code: string): string {
  return code.trim().toUpperCase();
}

export function generateUnlockCode(
  auditId: string,
  productType: ProductType
): string {
  const prefix = getProductPrefix(productType);
  const suffix = auditId
    .replace(/-/g, "")
    .slice(-6)
    .toUpperCase();
  return `${prefix}-${suffix}`;
}
