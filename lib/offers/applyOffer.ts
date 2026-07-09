import type { OfferCode, OfferApplyResult } from "@/types/offer";
import type { ProductType } from "@/types";
import { getOfferByCode } from "@/config/offers";

function isExpired(offer: OfferCode): boolean {
  if (!offer.expiresAt) return false;
  return new Date(offer.expiresAt) < new Date();
}

function getProductPrice(productType: ProductType): number {
  switch (productType) {
    case "quick_fix": return 49;
    case "aura_report": return 99;
    case "dating_audit": return 299;
    case "glowup_plan": return 499;
  }
}

function calculateDiscount(offer: OfferCode, amount: number): number {
  if (offer.discountType === "free") return amount;
  if (offer.discountType === "percentage") {
    return Math.round(amount * (offer.discountValue / 100));
  }
  if (offer.discountType === "fixed") {
    return Math.min(offer.discountValue, amount);
  }
  return 0;
}

export function applyOffer(code: string, productType: ProductType): OfferApplyResult {
  const originalAmount = getProductPrice(productType);

  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false, message: "No offer code entered.", originalAmount, discountAmount: 0, finalAmount: originalAmount };
  }

  const offer = getOfferByCode(normalizedCode);
  if (!offer) {
    return { valid: false, message: "Invalid offer code.", originalAmount, discountAmount: 0, finalAmount: originalAmount };
  }

  if (!offer.isActive) {
    return { valid: false, message: "This offer code is no longer active.", originalAmount, discountAmount: 0, finalAmount: originalAmount };
  }

  if (isExpired(offer)) {
    return { valid: false, message: "This offer has expired.", originalAmount, discountAmount: 0, finalAmount: originalAmount };
  }

  if (!offer.productTypes.includes(productType)) {
    return { valid: false, message: `This offer is not valid for the selected product.`, originalAmount, discountAmount: 0, finalAmount: originalAmount };
  }

  if (offer.minAmount && originalAmount < offer.minAmount) {
    return { valid: false, message: `Minimum amount of ₹${offer.minAmount} required for this offer.`, originalAmount, discountAmount: 0, finalAmount: originalAmount };
  }

  if (offer.maxUses !== undefined && offer.currentUses !== undefined && offer.currentUses >= offer.maxUses) {
    return { valid: false, message: "This offer has reached its usage limit.", originalAmount, discountAmount: 0, finalAmount: originalAmount };
  }

  const discountAmount = calculateDiscount(offer, originalAmount);
  const finalAmount = Math.max(0, originalAmount - discountAmount);
  const message = offer.discountType === "free" && finalAmount === 0
    ? "Founder code applied — testing checkout."
    : `Offer applied! You saved ₹${discountAmount}.`;

  return { valid: true, message, offer, originalAmount, discountAmount, finalAmount };
}
