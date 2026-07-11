/**
 * Style Detection Engine
 * Detects the user's current style from image metrics.
 * Uses clothing region analysis, color patterns, and overall visual signals.
 */

export type DetectedStyle = "casual" | "formal" | "streetwear" | "minimal" | "ethnic" | "athleisure" | "unknown";

export interface StyleDetectionResult {
  detectedStyle: DetectedStyle;
  confidence: number;
  reasoning: string;
  upgradePath: string;
}

/**
 * Detect style from image metrics.
 */
export function detectStyle(metrics: {
  clothingColorVariety: number;
  clothingStyleSignal: string; // "solid" | "varied" | "patterned"
  clothingContrastWithSkin: number;
  backgroundComplexity: number;
  accessoryCount: number;
  hasGlasses: boolean;
  dominantHue: string;
  overallBrightness: number;
  symmetryScore: number;
}): StyleDetectionResult {
  const { clothingColorVariety, clothingStyleSignal, accessoryCount, hasGlasses, backgroundComplexity, overallBrightness } = metrics;

  let detectedStyle: DetectedStyle = "unknown";
  let confidence = 0;
  let reasoning = "";
  let upgradePath = "";

  // Formal: solid colors, low variety, glasses, low background complexity
  if (clothingStyleSignal === "solid" && clothingColorVariety < 25 && hasGlasses && backgroundComplexity < 40) {
    detectedStyle = "formal";
    confidence = 75;
    reasoning = "Solid colors, minimal accessories, and clean background suggest a professional/formal style.";
    upgradePath = "Already formal. Add a blazer or structured jacket to level up.";
  }
  // Minimal: very low variety, solid, low accessory count
  else if (clothingColorVariety < 20 && clothingStyleSignal === "solid" && accessoryCount <= 1) {
    detectedStyle = "minimal";
    confidence = 70;
    reasoning = "Low color variety and minimal accessories suggest a clean, minimalist approach.";
    upgradePath = "Minimalism works. Add one statement piece (watch, necklace) for visual interest.";
  }
  // Streetwear: high variety, high accessory count, casual background
  else if (clothingColorVariety > 50 && accessoryCount >= 2) {
    detectedStyle = "streetwear";
    confidence = 65;
    reasoning = "Multiple colors and accessories suggest a streetwear or expressive style.";
    upgradePath = "Streetwear is strong for social media. Consider a signature color or pattern.";
  }
  // Ethnic: specific color tones, moderate variety
  else if (metrics.dominantHue === "warm" && clothingStyleSignal === "varied" && clothingColorVariety > 30) {
    detectedStyle = "ethnic";
    confidence = 55;
    reasoning = "Warm tones with varied colors suggest ethnic or traditional wear elements.";
    upgradePath = "Traditional wear photographs beautifully. Pair with modern accessories for fusion looks.";
  }
  // Athleisure: high brightness, low variety, comfort signals
  else if (overallBrightness > 60 && clothingColorVariety < 30 && clothingStyleSignal === "solid") {
    detectedStyle = "athleisure";
    confidence = 60;
    reasoning = "Bright, solid, low-variety outfit suggests comfort-first or athleisure style.";
    upgradePath = "Athleisure is versatile. Upgrade to premium basics for a polished-casual look.";
  }
  // Casual: everything else with some signals
  else if (clothingColorVariety >= 20 && clothingColorVariety <= 50) {
    detectedStyle = "casual";
    confidence = 50;
    reasoning = "Moderate color variety and mixed signals suggest an everyday casual style.";
    upgradePath = "Casual works for most contexts. Solid colors + good fit = instant upgrade.";
  }
  // Unknown
  else {
    detectedStyle = "unknown";
    confidence = 30;
    reasoning = "Not enough clear signals to determine style. The photo may be too simple or too busy.";
    upgradePath = "Start with a solid-color outfit and clean background — the universal upgrade.";
  }

  return { detectedStyle, confidence, reasoning, upgradePath };
}
