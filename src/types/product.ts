export interface ProductFeature {
  text: string;
  included: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: "INR";
  description: string;
  bestFor: string;
  features: ProductFeature[];
  highlighted?: boolean;
  href: string;
  cta: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "free",
    name: "Free Aura Score",
    price: 0,
    currency: "INR",
    description: "A free snapshot of your first impression — no payment needed.",
    bestFor: "Quick check",
    features: [
      { text: "Single photo scan", included: true },
      { text: "Basic aura score (0–100)", included: true },
      { text: "3 status leak insights", included: true },
      { text: "3 upgrade suggestions", included: true },
      { text: "No login required", included: true },
      { text: "Full score breakdown", included: false },
      { text: "Unlimited leak detection", included: false },
    ],
    href: "/audit/new",
    cta: "Start Free",
  },
  {
    id: "full",
    name: "Full Aura Report",
    price: 99,
    currency: "INR",
    description: "Deep analysis with a clear, actionable upgrade roadmap.",
    bestFor: "Serious upgrade",
    features: [
      { text: "Up to 3 photos", included: true },
      { text: "Full score breakdown by category", included: true },
      { text: "Unlimited leak detection", included: true },
      { text: "Priority upgrade plan", included: true },
      { text: "Downloadable report", included: true },
      { text: "Unlock code access", included: true },
    ],
    highlighted: true,
    href: "/unlock",
    cta: "Unlock Report",
  },
  {
    id: "dating",
    name: "Dating / Profile Audit",
    price: 299,
    currency: "INR",
    description: "Optimize how your dating profile presents you.",
    bestFor: "Profile optimizer",
    features: [
      { text: "Profile screenshot analysis", included: true },
      { text: "Bio & photo coherence check", included: true },
      { text: "Platform-specific tips", included: true },
      { text: "Competitive signal audit", included: true },
      { text: "Photo order optimization", included: true },
    ],
    href: "/unlock",
    cta: "Unlock Audit",
  },
  {
    id: "glowup",
    name: "30-Day Glow-Up Plan",
    price: 499,
    currency: "INR",
    description: "A month-long upgrade program with tracking and support.",
    bestFor: "Maximum impact",
    features: [
      { text: "Full audit every week", included: true },
      { text: "Personalized upgrade tasks", included: true },
      { text: "Progress tracking dashboard", included: true },
      { text: "Priority email support", included: true },
      { text: "Final comparison report", included: true },
    ],
    href: "/unlock",
    cta: "Get the Plan",
  },
];
