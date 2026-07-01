import type { AuraLeakTag, AuraStyleDirection, WardrobeCategory, StyleDiagnosisResult } from "@/types/commerce";
import { getRuleForLeak } from "@/config/auraOutfitRules";

export interface DiagnosisInput {
  freeResult?: Record<string, unknown> | null;
  quickFixReport?: Record<string, unknown> | null;
  fullReport?: Record<string, unknown> | null;
  personalization?: Record<string, unknown> | null;
  imageMetrics?: Record<string, unknown> | null;
  goal?: string;
  budget?: string;
  freeScore?: number | null;
}

function mapGoalToLeak(goal?: string): AuraLeakTag {
  const g = (goal || "").toLowerCase();
  if (g.includes("dating") || g.includes("profile") || g.includes("tinder") || g.includes("bumble")) {
    return "dating_warmth_missing";
  }
  if (g.includes("instagram") || g.includes("content") || g.includes("creator") || g.includes("influencer")) {
    return "creator_energy_missing";
  }
  if (g.includes("job") || g.includes("office") || g.includes("corporate") || g.includes("professional") || g.includes("interview")) {
    return "professional_mismatch";
  }
  if (g.includes("college") || g.includes("social") || g.includes("friends")) {
    return "outfit_inconsistency";
  }
  return "low_premium_signal";
}

function inferLeakFromSignals(freeResult?: Record<string, unknown> | null): AuraLeakTag | null {
  if (!freeResult) return null;

  const signals = freeResult.signals as Record<string, unknown>[] | undefined;
  if (!signals || signals.length === 0) return null;

  const leakMap: Record<string, AuraLeakTag> = {
    lighting: "weak_lighting",
    brightness: "weak_lighting",
    background: "busy_background",
    "busy background": "busy_background",
    clutter: "busy_background",
    clarity: "weak_clarity",
    sharpness: "weak_clarity",
    blur: "weak_clarity",
    framing: "weak_framing",
    crop: "weak_framing",
    "outfit consistency": "outfit_inconsistency",
    "outfit mismatch": "outfit_inconsistency",
  };

  for (const signal of signals) {
    const label = ((signal.label as string) || "").toLowerCase();
    for (const [key, tag] of Object.entries(leakMap)) {
      if (label.includes(key)) return tag;
    }
    const sigType = ((signal as Record<string, unknown>).type as string) || "";
    if (sigType.toLowerCase().includes("outfit")) return "outfit_inconsistency";
    if (sigType.toLowerCase().includes("lighting")) return "weak_lighting";
    if (sigType.toLowerCase().includes("background")) return "busy_background";
  }

  return null;
}

function inferLeakFromBiggestLeak(freeResult?: Record<string, unknown> | null): AuraLeakTag | null {
  if (!freeResult) return null;
  const biggestLeak = (freeResult.biggestLeak as string) || "";
  const lc = biggestLeak.toLowerCase();
  if (lc.includes("light")) return "weak_lighting";
  if (lc.includes("background") || lc.includes("clutter")) return "busy_background";
  if (lc.includes("blur") || lc.includes("clarity") || lc.includes("sharp")) return "weak_clarity";
  if (lc.includes("frame") || lc.includes("crop")) return "weak_framing";
  if (lc.includes("outfit") || lc.includes("style")) return "outfit_inconsistency";
  if (lc.includes("premium") || lc.includes("quality")) return "low_premium_signal";
  if (lc.includes("flex") || lc.includes("flash")) return "over_flex";
  if (lc.includes("plain") || lc.includes("basic") || lc.includes("boring")) return "too_plain";
  if (lc.includes("color")) return "color_mismatch";
  if (lc.includes("profile") || lc.includes("order")) return "weak_profile_order";
  if (lc.includes("professional") || lc.includes("corporate") || lc.includes("office")) return "professional_mismatch";
  if (lc.includes("warm") || lc.includes("approach") || lc.includes("date")) return "dating_warmth_missing";
  if (lc.includes("creator") || lc.includes("energy") || lc.includes("bold")) return "creator_energy_missing";
  return null;
}

function mapGoalToStyleDirection(goal?: string): AuraStyleDirection {
  const g = (goal || "").toLowerCase();
  if (g.includes("dating") || g.includes("profile") || g.includes("match")) return "dating_warm";
  if (g.includes("instagram") || g.includes("content") || g.includes("creator") || g.includes("influencer")) return "creator_bold";
  if (g.includes("job") || g.includes("office") || g.includes("corporate") || g.includes("professional") || g.includes("interview")) return "corporate_sharp";
  if (g.includes("college") || g.includes("university") || g.includes("campus")) return "college_casual";
  if (g.includes("gym") || g.includes("fitness") || g.includes("workout")) return "gym_casual";
  if (g.includes("ethnic") || g.includes("traditional") || g.includes("wedding") || g.includes("festival")) return "ethnic_clean";
  if (g.includes("street") || g.includes("urban") || g.includes("edgy")) return "street_smart";
  if (g.includes("luxury") || g.includes("premium") || g.includes("high end")) return "premium_minimal";
  return "clean_basic";
}

function getColorPaletteForStyle(style: AuraStyleDirection): string[] {
  const palettes: Record<AuraStyleDirection, string[]> = {
    clean_basic: ["white", "navy", "grey", "black"],
    premium_minimal: ["black", "white", "beige", "olive"],
    urban_aspirational: ["black", "white", "olive", "burgundy"],
    soft_luxury: ["cream", "beige", "navy", "white"],
    creator_bold: ["black", "white", "burgundy", "olive"],
    college_casual: ["navy", "grey", "white", "green"],
    corporate_sharp: ["white", "navy", "grey", "black"],
    dating_warm: ["cream", "navy", "white", "olive"],
    understated_confident: ["black", "grey", "white", "navy"],
    street_smart: ["black", "white", "olive", "grey"],
    ethnic_clean: ["white", "ivory", "navy", "beige"],
    gym_casual: ["black", "grey", "navy", "white"],
  };
  return palettes[style] || palettes.clean_basic;
}

function getCategoriesForLeak(leak: AuraLeakTag): WardrobeCategory[] {
  const rule = getRuleForLeak(leak);
  return rule?.recommendedCategories || ["tshirt", "jeans", "sneakers"];
}

function getAvoidCategoriesForLeak(leak: AuraLeakTag): WardrobeCategory[] {
  const rule = getRuleForLeak(leak);
  return rule?.avoidCategories || [];
}

export function diagnoseStyle(input: DiagnosisInput): StyleDiagnosisResult {
  // 1. Primary leak
  const leakFromSignals = inferLeakFromSignals(input.freeResult);
  const leakFromBiggest = inferLeakFromBiggestLeak(input.freeResult);
  const leakFromGoal = mapGoalToLeak(input.goal);
  const primaryLeak = leakFromSignals || leakFromBiggest || leakFromGoal || "low_premium_signal";

  // 2. Style direction
  const styleDirection = mapGoalToStyleDirection(input.goal);

  // 3. Rule-based info
  const rule = getRuleForLeak(primaryLeak);

  // 4. Color palette
  const colorPalette = rule?.colorPalette || getColorPaletteForStyle(styleDirection);

  // 5. Categories
  const recommendedCategories = rule?.recommendedCategories || getCategoriesForLeak(primaryLeak);
  const avoidCategories = rule?.avoidCategories || getAvoidCategoriesForLeak(primaryLeak);

  // 6. Explanation
  const explanation = rule?.explanation || "Your visual signal can be improved with intentional outfit choices.";

  return {
    primaryAuraLeak: primaryLeak,
    styleDirection,
    colorPalette,
    recommendedCategories,
    avoidCategories,
    outfitPrinciple: rule?.principle || "Choose intentional, clean, and context-appropriate outfits.",
    explanation,
  };
}
