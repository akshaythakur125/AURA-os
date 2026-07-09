import type { DominantColor, OutfitRegionEstimate, ColorFamily } from "./colorAnalysis";

export interface VisualWardrobeDiagnosis {
  id: string;
  auditId?: string;
  sourceImageId?: string;
  dominantColors: DominantColor[];
  outfitRegionEstimate: OutfitRegionEstimate | null;
  backgroundRegionEstimate: OutfitRegionEstimate | null;
  paletteType: string;
  colorHarmonyScore: number;
  outfitBackgroundContrastScore: number;
  premiumPaletteScore: number;
  visualNoiseScore: number;
  wardrobeGaps: WardrobeGap[];
  recommendedStyleDirection: string;
  recommendedColorPalette: string[];
  recommendedCategories: string[];
  avoidCategories: string[];
  commerceSearchIntents: CommerceSearchIntent[];
  finalAdvice: string;
  safetyNote: string;
  createdAt: string;
  updatedAt: string;
}

export type WardrobeGapType =
  | "color_mismatch"
  | "too_plain"
  | "too_busy"
  | "low_contrast"
  | "harsh_contrast"
  | "dull_palette"
  | "over_saturated"
  | "background_outfit_clash"
  | "weak_premium_signal"
  | "weak_professional_signal"
  | "weak_dating_warmth"
  | "weak_creator_energy"
  | "outfit_not_visible_enough";

export interface WardrobeGap {
  type: WardrobeGapType;
  severity: "low" | "medium" | "high";
  explanation: string;
  fix: string;
  recommendedCategory: string;
  recommendedColorFamily: ColorFamily;
  auraImpactScore: number;
}

export interface CommerceSearchIntent {
  query: string;
  categories: string[];
  colorTags: string[];
  styleDirection: string;
  auraLeakTags: string[];
  budgetHint: "budget" | "mid" | "premium";
  priority: number;
  reason: string;
}

export type PaletteType =
  | "premium_minimal"
  | "dating_warm"
  | "corporate_sharp"
  | "college_casual"
  | "creator_bold"
  | "ethnic_clean"
  | "street_smart"
  | "soft_luxury"
  | "mixed_neutral"
  | "vibrant_colorful"
  | "dark_moody"
  | "unknown";
