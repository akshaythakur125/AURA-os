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
      "Full score breakdown across 7 dimensions",
      "All status leaks with exact fixes",
      "Celebrity style match + shop the look",
      "Personalized improvement roadmap",
      "Budget upgrade plan",
      "Nearby salons, gyms, and studios",
      "Color palette recommendations",
      "Before vs after preview",
      "Shareable score card",
      "Personalized product picks",
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
