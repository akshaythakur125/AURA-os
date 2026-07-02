import type { AuraLeakTag, AuraStyleDirection, WardrobeCategory } from "@/types/commerce";

export interface CelebrityTrendPreset {
  id: string;
  label: string;
  celebrity: string;
  imageSrc: string;
  avatarLabel: string;
  avatarGradient: string;
  region: "India" | "Global";
  trendDateLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  summary: string;
  styleDirection: AuraStyleDirection;
  auraLeakTags: AuraLeakTag[];
  recommendedCategories: WardrobeCategory[];
  searchQuery: string;
  budgetMax?: number;
}

// ponytail: this is a curated snapshot of current style coverage, not a live trend feed.
export const CELEBRITY_TREND_PRESETS: CelebrityTrendPreset[] = [
  {
    id: "ananya-sporty-luxe",
    label: "Sporty Luxe Reset",
    celebrity: "Ananya Panday-inspired",
    imageSrc: "/celebs/ananya-sporty-luxe.svg",
    avatarLabel: "AP",
    avatarGradient: "from-fuchsia-400 via-rose-300 to-orange-200",
    region: "India",
    trendDateLabel: "June 2026",
    sourceLabel: "Vogue India sportswear staples",
    sourceUrl: "https://www.vogue.in/content/11-luxury-sportswear-staples-for-your-everyday-wardrobe",
    summary:
      "Sport-coded dressing is trending hard: football jerseys, track jackets, polos, and fashion sneakers that still feel polished.",
    styleDirection: "urban_aspirational",
    auraLeakTags: ["too_plain", "low_premium_signal", "outfit_inconsistency"],
    recommendedCategories: ["jacket", "tshirt", "sneakers", "sunglasses", "watch"],
    searchQuery: "track jacket polo fashion sneakers sporty luxe",
    budgetMax: 8000,
  },
  {
    id: "priyanka-soft-power",
    label: "Soft Power Tailoring",
    celebrity: "Priyanka Chopra-style",
    imageSrc: "/celebs/priyanka-soft-power.svg",
    avatarLabel: "PC",
    avatarGradient: "from-amber-300 via-orange-300 to-rose-300",
    region: "India",
    trendDateLabel: "January 2026",
    sourceLabel: "Vogue India best dressed list",
    sourceUrl: "https://www.vogue.in/content/the-vogue-best-dressed-2025-list-belongs-to-those-who-dress-with-purpose",
    summary:
      "Classic tailoring with richer colours and subtle statement details is reading premium without looking try-hard.",
    styleDirection: "premium_minimal",
    auraLeakTags: ["low_premium_signal", "professional_mismatch", "color_mismatch"],
    recommendedCategories: ["shirt", "trousers", "formal_shoes", "watch", "belt"],
    searchQuery: "brown blazer tailored trousers premium minimal smart luxury",
    budgetMax: 12000,
  },
  {
    id: "kendall-hailey-track",
    label: "Off-Duty Track Energy",
    celebrity: "Kendall + Hailey off-duty",
    imageSrc: "/celebs/kendall-hailey-track.svg",
    avatarLabel: "KH",
    avatarGradient: "from-sky-300 via-cyan-300 to-blue-400",
    region: "Global",
    trendDateLabel: "April 2026",
    sourceLabel: "Vogue sporty celebrity outfits",
    sourceUrl: "https://www.vogue.com/article/sporty-celebrity-outfits",
    summary:
      "Track jackets, bold track pants, throwback sneakers, and sleek sunglasses are back as a clean celebrity streetwear formula.",
    styleDirection: "street_smart",
    auraLeakTags: ["creator_energy_missing", "too_plain", "outfit_inconsistency"],
    recommendedCategories: ["jacket", "hoodie", "sneakers", "sunglasses", "tshirt"],
    searchQuery: "track pants bomber jacket retro sneakers off duty celebrity",
    budgetMax: 9000,
  },
  {
    id: "oscars-wide-leg-tailoring",
    label: "Relaxed Red Carpet Tailoring",
    celebrity: "Michael B. Jordan / Oscars 2026",
    imageSrc: "/celebs/oscars-wide-leg-tailoring.svg",
    avatarLabel: "MB",
    avatarGradient: "from-slate-200 via-zinc-300 to-amber-200",
    region: "Global",
    trendDateLabel: "March 2026",
    sourceLabel: "GQ Oscars 2026 best-dressed",
    sourceUrl: "https://www.gq.com/story/oscars-2026-best-dressed-celebrities-red-carpet-menswear",
    summary:
      "Wide-leg tailoring and cleaner formal lines are the smarter 2026 move versus stiff, old-school slim formalwear.",
    styleDirection: "understated_confident",
    auraLeakTags: ["professional_mismatch", "low_premium_signal", "too_plain"],
    recommendedCategories: ["shirt", "trousers", "formal_shoes", "watch", "jacket"],
    searchQuery: "wide leg trousers relaxed tailoring formal shoes understated confident",
    budgetMax: 15000,
  },
];
