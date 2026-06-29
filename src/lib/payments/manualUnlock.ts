import type { ProductType } from "@/types/payment";

/**
 * Manual unlock utility — MVP only.
 *
 * This is NOT secure. Unlock codes are validated client-side with a
 * predictable pattern or an env-var-based demo code. A real payment
 * provider + backend is required for production.
 *
 * See README "Manual monetization MVP" section for details.
 */

const PRODUCT_PRICES: Record<ProductType, number> = {
  aura_report: 99,
  dating_audit: 299,
  glowup_plan: 499,
};

const PRODUCT_NAMES: Record<ProductType, string> = {
  aura_report: "Full Aura Report",
  dating_audit: "Dating / Profile Audit",
  glowup_plan: "30-Day Glow-Up Plan",
};

export function getProductPrice(productType: ProductType): number {
  return PRODUCT_PRICES[productType] || 99;
}

export function getProductName(productType: ProductType): string {
  return PRODUCT_NAMES[productType] || "Aura Report";
}

export function getProductPriceLabel(productType: ProductType): string {
  return `₹${getProductPrice(productType)}`;
}

/**
 * Validate an unlock code for a given audit + product.
 *
 * Accepted codes (MVP only):
 * 1. The value of NEXT_PUBLIC_DEMO_UNLOCK_CODE (default: "AURADEMO")
 * 2. A deterministic audit-specific code: "AURA-" + last 6 alphanumeric chars of auditId, uppercased
 */
export function validateUnlockCode(params: {
  code: string;
  auditId: string;
  productType: ProductType;
}): boolean {
  const { code, auditId } = params;
  if (!code || typeof code !== "string") return false;

  const trimmed = code.trim();

  const demoCode =
    typeof process !== "undefined" &&
    process.env &&
    (process.env as Record<string, string | undefined>)
      .NEXT_PUBLIC_DEMO_UNLOCK_CODE
      ? ((process.env as Record<string, string | undefined>)
          .NEXT_PUBLIC_DEMO_UNLOCK_CODE as string)
      : "AURADEMO";

  if (trimmed.toUpperCase() === demoCode.toUpperCase()) return true;

  const auditSuffix = auditId
    .replace(/-/g, "")
    .slice(-6)
    .toUpperCase();
  const computedCode = `AURA-${auditSuffix}`;

  if (trimmed.toUpperCase() === computedCode) return true;

  return false;
}
