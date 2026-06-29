import type { OfferCode } from "@/types/offer";

export const OFFERS: OfferCode[] = [
  {
    code: "EARLY50",
    description: "50% off all products — early user reward",
    discountType: "percent",
    discountValue: 50,
    applicableProducts: ["aura_report", "dating_audit", "glowup_plan"],
    isActive: true,
  },
  {
    code: "AURA99",
    description: "Full Aura Report at ₹99 (baseline price — no additional discount)",
    discountType: "flat",
    discountValue: 0,
    applicableProducts: ["aura_report"],
    isActive: true,
  },
  {
    code: "GLOW100",
    description: "₹100 off the 30-Day Glow-Up Plan",
    discountType: "flat",
    discountValue: 100,
    applicableProducts: ["glowup_plan"],
    isActive: true,
  },
  {
    code: "DATE50",
    description: "₹50 off the Dating / Profile Audit",
    discountType: "flat",
    discountValue: 50,
    applicableProducts: ["dating_audit"],
    isActive: true,
  },
  {
    code: "FOUNDER",
    description: "100% off for founder / testing only",
    discountType: "percent",
    discountValue: 100,
    applicableProducts: ["aura_report", "dating_audit", "glowup_plan"],
    isActive: true,
  },
];

export function getAllOffers(): OfferCode[] {
  return OFFERS;
}

export function getActiveOffers(): OfferCode[] {
  return OFFERS.filter((o) => {
    if (!o.isActive) return false;
    if (o.expiresAt && new Date(o.expiresAt) < new Date()) return false;
    return true;
  });
}

export function findOfferByCode(code: string): OfferCode | undefined {
  const normalized = code.trim().toUpperCase();
  return OFFERS.find((o) => o.code === normalized && o.isActive);
}
