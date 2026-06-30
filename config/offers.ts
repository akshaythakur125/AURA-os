import type { OfferCode } from "@/types/offer";

export const OFFERS: OfferCode[] = [
  {
    code: "AURA10",
    discountType: "percentage",
    discountValue: 10,
    label: "10% off any product",
    productTypes: ["aura_report", "dating_audit", "glowup_plan"],
    minAmount: 99,
    isActive: true,
  },
  {
    code: "DATE20",
    discountType: "percentage",
    discountValue: 20,
    label: "20% off Dating Audit",
    productTypes: ["dating_audit"],
    minAmount: 299,
    isActive: true,
  },
  {
    code: "GLOW25",
    discountType: "fixed",
    discountValue: 125,
    label: "₹125 off Glow-Up Plan",
    productTypes: ["glowup_plan"],
    minAmount: 499,
    isActive: true,
  },
  {
    code: "BUNDLE50",
    discountType: "fixed",
    discountValue: 50,
    label: "₹50 off any product",
    productTypes: ["aura_report", "dating_audit", "glowup_plan"],
    minAmount: 99,
    isActive: true,
  },
  {
    code: "FOUNDER",
    discountType: "free",
    discountValue: 0,
    label: "Founder access — testing",
    productTypes: ["aura_report", "dating_audit", "glowup_plan"],
    isActive: true,
  },
];

export function getOfferByCode(code: string): OfferCode | undefined {
  return OFFERS.find((o) => o.code.toUpperCase() === code.toUpperCase());
}
