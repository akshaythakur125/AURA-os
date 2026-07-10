import type { ProductType } from "@/types/payment";

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
