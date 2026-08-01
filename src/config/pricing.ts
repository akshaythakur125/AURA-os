/**
 * Payment products — single source of truth for prices.
 * Change a price here → it updates the entire website.
 */

export type PaymentProductId = "aura_report" | "dating_audit" | "glowup_plan" | "aura_photoshoot";

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
    price: 2100,
    currency: "INR",
    deliverables: [
      "Instagram Grid Check — your whole profile (grid + bio) scored the way visitors see it",
      "Ready-to-Post Pack — we auto-fix your photo & crop it for Instagram, Hinge or LinkedIn",
      "Style Passport — your colours, frames, scent & grooming in one card you keep",
      "‘Which one should I post?’ — on-device AI ranks your candidate photos",
      "Occasion Kits — what to wear & how to prep for a date, interview or shaadi",
      "Every photo issue with its exact fix, ranked by measured impact",
      "Face-shape studio + colour palette & capsule wardrobe, matched to your undertone",
      "Celebrity style match + shop the look in your budget",
      "Downloadable report + a shareable before → after glow-up card",
    ],
    isActive: true,
  },
  dating_audit: {
    id: "dating_audit",
    name: "Dating / Profile Audit",
    price: 20000,
    currency: "INR",
    deliverables: [
      "Bio & prompt scoring with line-by-line rewrites",
      "Red-flag detection — clichés, negativity, low effort",
      "3 ready-to-paste bios written for your tone",
      "Photo strategy — your lead photo + the 5-slot order that converts",
      "Platform playbook — tailored Hinge, Bumble & Tinder tactics",
      "Opening hooks engineered to make matches message first",
    ],
    isActive: true,
  },
  aura_photoshoot: {
    id: "aura_photoshoot",
    name: "AI Glow-Up Photoshoot",
    price: 29900,
    currency: "INR",
    deliverables: [
      "A studio-grade AI photoshoot generated from a few of your own selfies",
      "Portraits rendered in your matched celebrity's aesthetic — lighting, wardrobe & mood",
      "Ready-cropped sets for Instagram, LinkedIn & dating profiles",
      "Multiple looks per style so you can pick your hero shot",
      "High-resolution downloads you own and keep",
      "Your photo is sent to our AI provider (Google Gemini) only to generate your portraits — we don't sell your photos",
    ],
    isActive: true,
  },
  glowup_plan: {
    id: "glowup_plan",
    name: "30-Day Glow-Up Plan",
    price: 40000,
    currency: "INR",
    deliverables: [
      "30 daily missions across photo, grooming, outfit & mindset",
      "Personalized to your weakest signal — not a generic checklist",
      "A measurable milestone for each of the 4 weeks",
      "Budget roadmap from free fixes to full upgrades",
      "Built-in week-by-week before/after checkpoints",
      "Yours forever — repeat the cycle any time",
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
