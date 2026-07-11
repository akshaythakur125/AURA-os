import { PAYMENT_PRODUCTS, type PaymentProductId, formatPrice } from "@/config/pricing";
import type { ProductType } from "@/types/payment";

function toProductId(t: ProductType): PaymentProductId {
  return (t in PAYMENT_PRODUCTS ? t : "aura_report") as PaymentProductId;
}

export function getProductPrice(productType: ProductType): number {
  const p = PAYMENT_PRODUCTS[toProductId(productType)];
  return p ? Math.round(p.price / 100) : 0;
}

export function getProductName(productType: ProductType): string {
  const p = PAYMENT_PRODUCTS[toProductId(productType)];
  return p?.name || productType;
}

export function getProductPriceLabel(productType: ProductType): string {
  const p = PAYMENT_PRODUCTS[toProductId(productType)];
  return p ? formatPrice(p.price) : "₹0";
}
