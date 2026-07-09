import type { AuraTwinVariant, TwinGoal, AuraTwinVariantType } from "@/types/auraTwin";
import { TWIN_GOAL_PREFERENCES } from "@/types/auraTwin";
import { computeAuraScore } from "@/lib/aura-engine/scoring";

export function scoreTwinVariant(variant: AuraTwinVariant): number {
  return computeAuraScore(variant.metrics);
}

export function getScoringBreakdown(variant: AuraTwinVariant): Record<string, number> {
  const m = variant.metrics;
  return {
    brightness: m.brightness,
    contrast: m.contrast,
    saturation: m.saturation,
    sharpness: m.sharpness,
    edgeDensity: m.edgeDensity,
    lightingScore: m.lightingScore,
    clarityScore: m.clarityScore,
    compositionScore: m.compositionScore,
    backgroundComplexity: m.backgroundComplexityEstimate,
    overallQuality: m.overallImageQualityScore,
    finalScore: variant.score,
  };
}

export function getGoalBoost(variantType: string, goal: TwinGoal | undefined): number {
  if (!goal) return 0;
  const prefs = TWIN_GOAL_PREFERENCES[goal] || [];
  const idx = prefs.indexOf(variantType as AuraTwinVariantType);
  if (idx === -1) return 0;
  return (prefs.length - idx) * 1.5;
}
