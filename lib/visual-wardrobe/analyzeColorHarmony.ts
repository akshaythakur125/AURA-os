import type { ColorHarmonyResult } from "@/types/colorAnalysis";
import type { DominantColor } from "@/types/colorAnalysis";

export function analyzeColorHarmony(
  fullColors: DominantColor[],
  centerColors: DominantColor[],
  edgeColors: DominantColor[],
  avgBrightness: number,
  avgSaturation: number,
  estimatedClutter: number
): ColorHarmonyResult {
  const families = fullColors.map((c) => c.family);
  const centerFamilies = centerColors.map((c) => c.family);
  const edgeFamilies = edgeColors.map((c) => c.family);

  const neutralFamilies = ["black", "white", "grey", "beige", "navy", "neutral"];
  const warmFamilies = ["red", "orange", "yellow", "pink", "brown", "maroon"];
  const coolFamilies = ["blue", "green", "purple"];

  // Outfit/background contrast
  const centerIsNeutral = centerFamilies.some((f) => neutralFamilies.includes(f));
  const edgeIsNeutral = edgeFamilies.some((f) => neutralFamilies.includes(f));
  const centerIsWarm = centerFamilies.some((f) => warmFamilies.includes(f));
  const edgeIsCool = edgeFamilies.some((f) => coolFamilies.includes(f));

  // Palette consistency: how many families?
  const uniqueFamilies = new Set(families.filter((f) => f !== "unknown")).size;
  const paletteConsistency = Math.max(0, Math.min(100, 100 - (uniqueFamilies - 1) * 15));

  // Saturation balance
  const saturationBalance = avgSaturation < 20 ? 80 : avgSaturation < 40 ? 60 : avgSaturation < 60 ? 40 : 20;

  // Neutral balance
  const neutralCount = families.filter((f) => neutralFamilies.includes(f)).length;
  const neutralBalance = Math.min(100, Math.round((neutralCount / Math.max(1, families.length)) * 100));

  // Outfit/background contrast score
  const outfitBackgroundContrast = centerIsNeutral && edgeIsNeutral ? 70
    : centerIsWarm && edgeIsCool ? 60
    : !centerIsNeutral && !edgeIsNeutral ? 40
    : 50;

  // Premium minimal potential
  const premiumMinimalPotential = Math.min(100,
    Math.round((neutralBalance * 0.6 + (100 - avgSaturation) * 0.2 + paletteConsistency * 0.2))
  );

  // Creator bold potential
  const hasBoldColor = families.some((f) => ["red", "yellow", "orange", "pink"].includes(f));
  const creatorBoldPotential = Math.min(100,
    Math.round((hasBoldColor ? 60 : 20) + (100 - paletteConsistency) * 0.3 + avgSaturation * 0.3)
  );

  // Professional clean potential
  const professionalCleanPotential = Math.min(100,
    Math.round(neutralBalance * 0.5 + (100 - estimatedClutter) * 0.3 + paletteConsistency * 0.2)
  );

  // Dating warm potential
  const hasWarm = families.some((f) => warmFamilies.includes(f));
  const datingWarmPotential = Math.min(100,
    Math.round((hasWarm ? 50 : 20) + (100 - estimatedClutter) * 0.2 + (avgBrightness > 100 ? 20 : 0))
  );

  // Overall harmony
  const overallHarmonyScore = Math.min(100,
    Math.round(
      paletteConsistency * 0.25 +
      (100 - estimatedClutter) * 0.2 +
      neutralBalance * 0.2 +
      (avgSaturation < 50 ? 70 : avgSaturation < 70 ? 50 : 30) * 0.15 +
      outfitBackgroundContrast * 0.2
    )
  );

  return {
    outfitBackgroundContrast,
    paletteConsistency,
    saturationBalance,
    neutralBalance,
    premiumMinimalPotential,
    creatorBoldPotential,
    professionalCleanPotential,
    datingWarmPotential,
    overallHarmonyScore,
  };
}
