/**
 * Payment products — single source of truth for prices.
 * Change a price here → it updates the entire website.
 */

export type PaymentProductId = "aura_report" | "dating_audit" | "glowup_plan";

export interface PaymentProduct {
  id: PaymentProductId;
  name: string;
  price: number; // paise
  currency: "INR";
  deliverables: string[];
  isActive: boolean;
}

export const PAYMENT_PRODUCTS: Record<PaymentProductId, PaymentProduct> = {
  aura_report: {
    id: "aura_report",
    name: "Full Aura Report",
    price: 2500,
    currency: "INR",
    deliverables: [
      "Every photo issue with its exact fix, ranked by measured impact",
      "A 7-day reshoot plan built from your photo's own numbers",
      "Expression & posture read — smile, eye contact, head tilt, shoulders",
      "Which Instagram filter fits + exactly how to edit it",
      "Your colour palette + capsule wardrobe, matched to your undertone",
      "Face-shape studio — haircut, glasses & beard that suit you",
      "Celebrity style match + shop the look in your budget",
      "Downloadable branded report + share-ready score card",
    ],
    isActive: true,
  },
  dating_audit: {
    id: "dating_audit",
    name: "Dating / Profile Audit",
    price: 29900,
    currency: "INR",
    deliverables: [
      "Profile screenshot analysis",
      "Bio & photo coherence check",
      "Platform-specific tips",
      "Competitive signal audit",
      "Photo order optimization",
    ],
    isActive: true,
  },
  glowup_plan: {
    id: "glowup_plan",
    name: "30-Day Glow-Up Plan",
    price: 49900,
    currency: "INR",
    deliverables: [
      "Full audit every week",
      "Personalized upgrade tasks",
      "Progress tracking dashboard",
      "Priority email support",
      "Final comparison report",
    ],
    isActive: true,
  },
};

export function formatPrice(paise: number): string {
  return `\u20b9${Math.round(paise / 100)}`;
}

export function getPaymentProduct(id: string): PaymentProduct | null {
  return PAYMENT_PRODUCTS[id as PaymentProductId] ?? null;
}

export const PAYMENT_PRODUCT_LIST: PaymentProduct[] = Object.values(PAYMENT_PRODUCTS);
