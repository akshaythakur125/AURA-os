import type { WardrobeGap, WardrobeGapType } from "@/types/visualWardrobe";
import type { DominantColor, ColorHarmonyResult } from "@/types/colorAnalysis";

interface GapInput {
  fullColors: DominantColor[];
  centerColors: DominantColor[];
  edgeColors: DominantColor[];
  harmony: ColorHarmonyResult;
  avgBrightness: number;
  avgSaturation: number;
  estimatedClutter: number;
  confidence: number;
  goal?: string;
}

const NEUTRAL = ["black", "white", "grey", "beige", "navy", "neutral"];

export function detectWardrobeGaps(input: GapInput): WardrobeGap[] {
  const gaps: WardrobeGap[] = [];
  const { fullColors, centerColors, edgeColors, harmony, avgBrightness, avgSaturation, estimatedClutter, confidence, goal } = input;

  const centerFamilies = centerColors.map((c) => c.family);
  const edgeFamilies = edgeColors.map((c) => c.family);
  const fullFamilies = fullColors.map((c) => c.family);

  const centerDull = centerColors.every((c) => {
    const lum = 0.299 * c.rgb[0] + 0.587 * c.rgb[1] + 0.114 * c.rgb[2];
    return lum < 100 && avgSaturation < 20;
  });
  const centerVsEdgeSimilar = centerFamilies.some((f) => edgeFamilies.includes(f));

  if (confidence < 30) {
    gaps.push({
      type: "outfit_not_visible_enough",
      severity: "medium",
      explanation: "The outfit area is not clearly visible in the photo. Lighting, framing, or distance may hide clothing details.",
      fix: "Use a well-lit, front-facing photo where your outfit is clearly visible.",
      recommendedCategory: "tshirt",
      recommendedColorFamily: "neutral",
      auraImpactScore: 30,
    });
  }

  // Dull palette
  if (centerDull && avgBrightness < 120) {
    const gap = makeGap("dull_palette", avgBrightness < 80 ? "high" : "medium",
      "The outfit colors appear muted and low in contrast, which can make the overall presentation feel flat.",
      "Add a clean white, black, or navy layer for contrast. A solid bright accessory can also help.",
      "shirt", "white", 70);
    if (!hasDuplicate(gaps, gap)) gaps.push(gap);
  }

  // Too plain
  if (fullFamilies.filter((f) => NEUTRAL.includes(f)).length >= 4 && avgSaturation < 15 && harmony.premiumMinimalPotential < 60) {
    gaps.push(makeGap("too_plain", "medium",
      "The palette is very neutral but lacks any point of interest or contrast.",
      "Add one controlled accent color or a structured layer like an overshirt or jacket.",
      "overshirt", "navy", 60));
  }

  // Too busy
  if (estimatedClutter > 50 && avgSaturation > 50) {
    gaps.push(makeGap("too_busy", estimatedClutter > 70 ? "high" : "medium",
      "Multiple strong colors compete for attention, making the overall presentation feel chaotic.",
      "Stick to 2–3 solid colors. Replace loud patterns with clean basics.",
      "tshirt", "white", 75));
  }

  // Low contrast
  if (avgBrightness < 90 && avgSaturation < 20) {
    gaps.push(makeGap("low_contrast", "high",
      "Dark and low-contrast outfit makes it hard to read visual detail.",
      "Add a lighter top layer or choose a top with contrast against the background.",
      "shirt", "white", 80));
  }

  // Harsh contrast
  if (centerVsEdgeSimilar && centerColors.length > 0 && edgeColors.length > 0) {
    const centerLum = luminance(centerColors[0].rgb);
    const edgeLum = luminance(edgeColors[0].rgb);
    if (Math.abs(centerLum - edgeLum) > 150) {
      gaps.push(makeGap("harsh_contrast", "medium",
        "The outfit and background have extreme brightness contrast, which can be visually jarring.",
        "Soften the contrast with a mid-tone layer or adjust photo lighting.",
        "overshirt", "grey", 50));
    }
  }

  // Background-outfit clash
  if (centerVsEdgeSimilar && harmony.outfitBackgroundContrast < 40) {
    gaps.push(makeGap("background_outfit_clash", "medium",
      "The outfit colors blend too much with the background, reducing visual separation.",
      "Choose a topwear color that contrasts with your background, or use a cleaner backdrop.",
      "shirt", "white", 65));
  }

  // Weak premium signal
  if (harmony.premiumMinimalPotential < 50 && avgSaturation > 30) {
    gaps.push(makeGap("weak_premium_signal", "high",
      "The color mix feels casual or unstructured, which reduces the premium visual signal.",
      "Switch to a neutral palette: black, white, navy, grey, beige in solid clean pieces.",
      "watch", "black", 85));
  }

  // Goal-based gaps
  if (goal === "office" || goal === "professional") {
    if (harmony.professionalCleanPotential < 50) {
      gaps.push(makeGap("weak_professional_signal", "high",
        "The palette and style don't project the clean, structured look expected in professional settings.",
        "Choose Oxford shirts, chinos, and a neutral palette. Avoid loud colors or patterns.",
        "shirt", "white", 90));
    }
  }

  if (goal === "dating" || goal === "social") {
    if (harmony.datingWarmPotential < 50) {
      gaps.push(makeGap("weak_dating_warmth", "high",
        "The current palette feels too harsh or cold for a warm, approachable impression.",
        "Add warm neutrals: beige, soft brown, olive, light blue. Avoid all-black or harsh black/white.",
        "shirt", "beige", 85));
    }
  }

  if (goal === "creator" || goal === "instagram") {
    if (harmony.creatorBoldPotential < 40) {
      gaps.push(makeGap("weak_creator_energy", "medium",
        "The palette lacks the controlled boldness that creator/content profiles benefit from.",
        "Add one structured bold piece — a jacket, overshirt, or statement layer — with a neutral base.",
        "jacket", "black", 75));
    }
  }

  // Color mismatch (general)
  const warmCount = fullFamilies.filter((f) => ["red", "orange", "yellow", "pink"].includes(f)).length;
  const coolCount = fullFamilies.filter((f) => ["blue", "green", "purple"].includes(f)).length;
  if (warmCount >= 2 && coolCount >= 2 && fullColors.length >= 4) {
    gaps.push(makeGap("color_mismatch", "medium",
      "Warm and cool colors are mixed without a dominant direction, creating visual inconsistency.",
      "Choose a warm OR cool direction, not both. Mix within the same temperature family.",
      "shirt", "neutral", 55));
  }

  // Over-saturated
  if (avgSaturation > 60) {
    gaps.push(makeGap("over_saturated", "high",
      "Colors are very intense, which can feel overwhelming in photos.",
      "Tone down to muted or mid-saturation shades. Solid basics in controlled colors work best.",
      "tshirt", "white", 70));
  }

  return gaps.sort((a, b) => b.auraImpactScore - a.auraImpactScore);
}

function makeGap(type: WardrobeGapType, severity: "low" | "medium" | "high", explanation: string, fix: string, category: string, colorFamily: string, impact: number): WardrobeGap {
  return {
    type,
    severity,
    explanation,
    fix,
    recommendedCategory: category,
    recommendedColorFamily: colorFamily as "black" | "white" | "grey" | "navy" | "blue" | "brown" | "beige" | "green" | "red" | "maroon" | "yellow" | "orange" | "pink" | "purple" | "neutral" | "unknown",
    auraImpactScore: impact,
  };
}

function hasDuplicate(gaps: WardrobeGap[], newGap: WardrobeGap): boolean {
  return gaps.some((g) => g.type === newGap.type);
}

function luminance(rgb: [number, number, number]): number {
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}
