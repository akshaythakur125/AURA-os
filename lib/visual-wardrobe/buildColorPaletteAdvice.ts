import type { PaletteType } from "@/types/visualWardrobe";
import type { DominantColor, ColorHarmonyResult } from "@/types/colorAnalysis";

const PALETTES: Record<string, { name: string; colors: string[]; avoid: string[]; explanation: string }> = {
  premium_minimal: {
    name: "Premium Minimal",
    colors: ["black", "white", "grey", "navy", "beige"],
    avoid: ["bright red", "neon", "loud patterns", "mixed bright colors"],
    explanation: "A clean neutral palette that signals premium taste. Works for photos, office, and social.",
  },
  dating_warm: {
    name: "Dating Warm",
    colors: ["white", "beige", "olive", "light blue", "soft brown"],
    avoid: ["all black", "harsh red", "neon", "aggressive patterns"],
    explanation: "Warm, soft, and approachable. Ideal for dating profile photos and social settings.",
  },
  corporate_sharp: {
    name: "Corporate Sharp",
    colors: ["white", "navy", "charcoal", "black", "tan"],
    avoid: ["hoodies", "loud colors", "casual prints", "oversized fits"],
    explanation: "Structured, clean, and professional. For office, interviews, and formal contexts.",
  },
  college_casual: {
    name: "College Casual",
    colors: ["white", "black", "denim blue", "olive", "beige"],
    avoid: ["formal shoes", "excessive accessories", "overly bright colors"],
    explanation: "Effortless everyday style. Clean basics with relaxed confidence.",
  },
  creator_bold: {
    name: "Creator Bold (Controlled)",
    colors: ["black", "white", "one bold accent", "denim", "neutral base"],
    avoid: ["multiple bold colors", "clashing patterns", "unstructured layers"],
    explanation: "Controlled boldness with a clean base and one statement piece. For content creators.",
  },
  soft_luxury: {
    name: "Soft Luxury",
    colors: ["cream", "beige", "soft brown", "olive", "charcoal"],
    avoid: ["neon", "harsh contrasts", "cheap-looking synthetics"],
    explanation: "Refined, muted luxury. Rich neutrals without being flashy.",
  },
  street_smart: {
    name: "Street Smart",
    colors: ["black", "white", "denim", "olive", "grey"],
    avoid: ["formal pieces", "excessive bright colors"],
    explanation: "Clean urban edge. Fits, sneakers, and structured layers.",
  },
};

export function detectPaletteType(
  fullColors: DominantColor[],
  harmony: ColorHarmonyResult,
  avgSaturation: number
): PaletteType {
  const families = fullColors.map((c) => c.family);
  const hasBold = families.some((f) => ["red", "yellow", "orange", "pink"].includes(f));
  const hasWarm = families.some((f) => ["brown", "beige", "olive", "orange"].includes(f));
  const hasDark = families.some((f) => ["black", "navy", "charcoal"].includes(f));
  const neutralDominant = families.filter((f) => ["black", "white", "grey", "navy", "beige", "neutral"].includes(f)).length >= 3;

  if (hasWarm && !hasBold && harmony.datingWarmPotential > 50) return "dating_warm";
  if (hasBold && avgSaturation > 40) return "vibrant_colorful";
  if (hasDark && !hasBold && avgSaturation < 25) return "dark_moody";
  if (neutralDominant && harmony.premiumMinimalPotential > 60) return "premium_minimal";
  if (neutralDominant && harmony.professionalCleanPotential > 60) return "corporate_sharp";
  if (neutralDominant && avgSaturation < 30) return "mixed_neutral";
  if (hasBold && !hasWarm) return "creator_bold";
  if (hasWarm) return "dating_warm";

  return "mixed_neutral";
}

export function buildColorPaletteAdvice(
  paletteType: PaletteType,
  fullColors: DominantColor[],
  harmony: ColorHarmonyResult
): { recommendedPalette: string[]; avoidColors: string[]; explanation: string } {
  const palette = PALETTES[paletteType] || PALETTES.premium_minimal;

  return {
    recommendedPalette: palette.colors,
    avoidColors: palette.avoid,
    explanation: palette.explanation + ` Your current harmony score is ${harmony.overallHarmonyScore}/100.`,
  };
}
