"use client";

import type { LookCategory } from "@/lib/shop/catalogTypes";

interface Props {
  category: LookCategory;
  title: string;
  className?: string;
}

const CATEGORY_PATTERNS: Record<LookCategory, { shape: string; accent: string }> = {
  tshirt: { shape: "tshirt", accent: "hsl(280, 70%, 50%)" },
  shirt: { shape: "shirt", accent: "hsl(220, 60%, 50%)" },
  jeans: { shape: "jeans", accent: "hsl(210, 50%, 45%)" },
  trousers: { shape: "trousers", accent: "hsl(200, 40%, 40%)" },
  shorts: { shape: "shorts", accent: "hsl(35, 70%, 50%)" },
  jacket: { shape: "jacket", accent: "hsl(0, 50%, 40%)" },
  hoodie: { shape: "hoodie", accent: "hsl(270, 50%, 45%)" },
  sweatshirt: { shape: "sweatshirt", accent: "hsl(340, 50%, 45%)" },
  sneakers: { shape: "sneakers", accent: "hsl(160, 50%, 45%)" },
  shoes: { shape: "shoes", accent: "hsl(25, 60%, 40%)" },
  sandals: { shape: "sandals", accent: "hsl(45, 70%, 50%)" },
  watch: { shape: "watch", accent: "hsl(45, 80%, 55%)" },
  sunglasses: { shape: "sunglasses", accent: "hsl(200, 60%, 40%)" },
  backpack: { shape: "backpack", accent: "hsl(150, 40%, 40%)" },
  fragrance: { shape: "fragrance", accent: "hsl(290, 60%, 55%)" },
  grooming: { shape: "grooming", accent: "hsl(170, 50%, 45%)" },
  earrings: { shape: "earrings", accent: "hsl(45, 80%, 60%)" },
  heels: { shape: "heels", accent: "hsl(340, 60%, 50%)" },
  flats: { shape: "flats", accent: "hsl(200, 50%, 50%)" },
  dress: { shape: "dress", accent: "hsl(320, 55%, 50%)" },
  kurta: { shape: "kurta", accent: "hsl(35, 70%, 50%)" },
  saree: { shape: "saree", accent: "hsl(340, 60%, 50%)" },
  accessory: { shape: "accessory", accent: "hsl(45, 70%, 50%)" },
};

function CategorySVG({ shape }: { shape: string }) {
  switch (shape) {
    case "tshirt":
      return (
        <svg viewBox="0 0 120 120" className="h-16 w-16">
          <path d="M30 35 L45 25 L55 30 L65 30 L75 25 L90 35 L80 45 L75 40 L75 90 L45 90 L45 40 L40 45 Z" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <path d="M45 30 L55 35 L65 35 L75 30" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
        </svg>
      );
    case "shirt":
      return (
        <svg viewBox="0 0 120 120" className="h-16 w-16">
          <path d="M35 30 L50 22 L55 28 L65 28 L70 22 L85 30 L78 40 L75 36 L75 90 L45 90 L45 36 L42 40 Z" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <line x1="60" y1="28" x2="60" y2="90" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
          <circle cx="56" cy="40" r="1.5" fill="white" fillOpacity="0.3" />
          <circle cx="56" cy="50" r="1.5" fill="white" fillOpacity="0.3" />
          <circle cx="56" cy="60" r="1.5" fill="white" fillOpacity="0.3" />
        </svg>
      );
    case "jeans":
      return (
        <svg viewBox="0 0 120 120" className="h-16 w-16">
          <path d="M40 25 L80 25 L82 30 L78 90 L65 90 L60 50 L55 90 L42 90 L38 30 Z" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <path d="M45 30 L55 30" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          <path d="M65 30 L75 30" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          <rect x="52" y="28" width="16" height="4" rx="1" fill="white" fillOpacity="0.15" />
        </svg>
      );
    case "sneakers":
      return (
        <svg viewBox="0 0 120 120" className="h-16 w-16">
          <path d="M20 75 L30 55 L50 50 L70 50 L90 55 L95 65 L95 75 L20 75 Z" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <path d="M30 55 L50 50 L70 50 L85 53" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          <path d="M95 75 L100 75 L100 80 L95 80" fill="white" fillOpacity="0.15" />
          <circle cx="40" cy="62" r="2" fill="white" fillOpacity="0.2" />
          <circle cx="50" cy="60" r="2" fill="white" fillOpacity="0.2" />
          <circle cx="60" cy="60" r="2" fill="white" fillOpacity="0.2" />
        </svg>
      );
    case "watch":
      return (
        <svg viewBox="0 0 120 120" className="h-16 w-16">
          <rect x="45" y="20" width="30" height="15" rx="3" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
          <rect x="45" y="85" width="30" height="15" rx="3" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
          <circle cx="60" cy="60" r="25" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="20" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
          <line x1="60" y1="60" x2="60" y2="45" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="60" y1="60" x2="72" y2="60" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
          <circle cx="60" cy="60" r="2" fill="white" fillOpacity="0.4" />
        </svg>
      );
    case "sunglasses":
      return (
        <svg viewBox="0 0 120 120" className="h-16 w-16">
          <path d="M25 55 L45 52 L50 58 L55 58 L60 52 L65 58 L70 58 L75 52 L95 55" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <ellipse cx="40" cy="62" rx="16" ry="12" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <ellipse cx="80" cy="62" rx="16" ry="12" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <path d="M56 60 L64 60" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
        </svg>
      );
    case "jacket":
      return (
        <svg viewBox="0 0 120 120" className="h-16 w-16">
          <path d="M30 30 L45 22 L55 28 L65 28 L75 22 L90 30 L82 42 L78 38 L78 90 L42 90 L42 38 L38 42 Z" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <line x1="60" y1="28" x2="60" y2="90" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          <path d="M30 30 L25 50 L30 55" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          <path d="M90 30 L95 50 L90 55" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          <rect x="55" y="45" width="10" height="3" rx="1" fill="white" fillOpacity="0.2" />
        </svg>
      );
    case "hoodie":
      return (
        <svg viewBox="0 0 120 120" className="h-16 w-16">
          <path d="M30 35 L42 25 L55 30 L65 30 L78 25 L90 35 L80 45 L75 40 L75 90 L45 90 L45 40 L40 45 Z" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <path d="M42 25 L50 18 L60 15 L70 18 L78 25" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
          <path d="M50 50 L50 70 L70 70 L70 50" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
        </svg>
      );
    case "dress":
      return (
        <svg viewBox="0 0 120 120" className="h-16 w-16">
          <path d="M45 25 L55 22 L60 25 L65 22 L75 25 L70 40 L80 90 L40 90 L50 40 Z" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
          <path d="M50 40 L70 40" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
          <path d="M48 55 L72 55" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
          <path d="M46 70 L74 70" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 120" className="h-16 w-16">
          <rect x="35" y="30" width="50" height="60" rx="8" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" />
          <circle cx="60" cy="55" r="12" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
        </svg>
      );
  }
}

export function ShopCategoryImage({ category, title, className = "" }: Props) {
  const pattern = CATEGORY_PATTERNS[category] || CATEGORY_PATTERNS.accessory;

  return (
    <div className={`relative h-40 overflow-hidden rounded-xl ${className}`}>
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, hsl(280, 70%, 14%) 0%, hsl(315, 65%, 10%) 100%)`,
        }}
      />
      {/* Glow orbs */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${pattern.accent} 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 70% 80%, ${pattern.accent} 0%, transparent 50%)`,
        }}
      />
      {/* Category illustration */}
      <div className="absolute inset-0 flex items-center justify-center">
        <CategorySVG shape={pattern.shape} />
      </div>
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
    </div>
  );
}
