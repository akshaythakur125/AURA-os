import type { ProductType } from "@/types/payment";
import type { OfferApplication } from "@/types/offer";
import { findOfferByCode } from "@/config/offers";
import { getProductPrice } from "@/lib/payments/manualUnlock";

export function normalizeOfferCode(code: string): string {
  return code.trim().toUpperCase();
}

export function applyOfferCode(
  productType: ProductType,
  amount?: number,
  code?: string
): OfferApplication {
  const originalAmount = amount ?? getProductPrice(productType);

  if (!code || !code.trim()) {
    return {
      productType,
      originalAmount,
      code: "",
      discountAmount: 0,
      finalAmount: originalAmount,
      message: "No offer code applied.",
      isValid: true,
    };
  }

  const normalized = normalizeOfferCode(code);
  const offer = findOfferByCode(normalized);

  if (!offer) {
    return {
      productType,
      originalAmount,
      code: normalized,
      discountAmount: 0,
      finalAmount: originalAmount,
      message: "Invalid or expired offer code.",
      isValid: false,
    };
  }

  if (!offer.applicableProducts.includes(productType)) {
    return {
      productType,
      originalAmount,
      code: normalized,
      discountAmount: 0,
      finalAmount: originalAmount,
      message: `This code is not applicable for ${getProductPrice(productType) === 99 ? "Aura Report" : "this product"}.`,
      isValid: false,
    };
  }

  if (offer.minAmount && originalAmount < offer.minAmount) {
    return {
      productType,
      originalAmount,
      code: normalized,
      discountAmount: 0,
      finalAmount: originalAmount,
      message: `Minimum amount of ₹${offer.minAmount} required for this code.`,
      isValid: false,
    };
  }

  if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
    return {
      productType,
      originalAmount,
      code: normalized,
      discountAmount: 0,
      finalAmount: originalAmount,
      message: "This offer code has expired.",
      isValid: false,
    };
  }

  let discountAmount = 0;

  if (offer.discountType === "percent") {
    discountAmount = Math.round(originalAmount * (offer.discountValue / 100));
  } else {
    discountAmount = offer.discountValue;
  }

  if (offer.code === "AURA99") {
    discountAmount = 0;
  }

  const finalAmount = Math.max(0, originalAmount - discountAmount);

  let message = "";
  if (finalAmount === 0) {
    message =
      offer.code === "FOUNDER"
        ? "Founder code applied — ₹0 for testing purposes."
        : `${offer.description} — Final amount: ₹0.`;
  } else if (discountAmount > 0) {
    message = `${offer.description} — You save ₹${discountAmount}.`;
  } else {
    message = offer.description;
  }

  return {
    productType,
    originalAmount,
    code: normalized,
    discountAmount,
    finalAmount,
    message,
    isValid: true,
  };
}
