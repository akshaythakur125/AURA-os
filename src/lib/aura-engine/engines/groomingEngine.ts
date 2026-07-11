/**
 * Grooming Assessment Engine
 * Dedicated analysis of grooming quality from image metrics.
 * Separated from the generic composite score for accuracy.
 */

export interface GroomingResult {
  overallScore: number; // 0-100
  hairNeatness: number;
  skinClarity: number;
  facialHair: number;
  eyebrows: number;
  assessment: string;
  topFix: string;
  topFixPriority: "high" | "medium" | "low";
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Assess grooming from image signal metrics.
 * Uses hair region, skin region, clarity, and face detection signals.
 */
export function assessGrooming(metrics: {
  hairNeatness: number;
  hairEdgeDensity: number;
  skinEvenness: number;
  skinBrightnessVariance: number;
  clarityScore: number;
  faceDetected: boolean;
  faceBrightness: number;
  accessoryCount: number;
  hasGlasses: boolean;
}): GroomingResult {
  // Hair neatness (0-100, higher = neater)
  const hairNeatness = clamp(metrics.hairNeatness, 0, 100);

  // Skin clarity (derived from evenness and brightness variance)
  const skinClarity = clamp(
    (metrics.skinEvenness * 0.7) + ((100 - metrics.skinBrightnessVariance) * 0.3),
    0, 100
  );

  // Facial hair assessment (proxy: edge density in hair region)
  // High edge density = frizz/unkempt, low = well-groomed
  const facialHair = clamp(
    metrics.hairEdgeDensity < 30 ? 85 :
    metrics.hairEdgeDensity < 50 ? 70 :
    metrics.hairEdgeDensity < 70 ? 50 : 30,
    0, 100
  );

  // Eyebrow grooming (proxy: symmetry + face brightness consistency)
  const eyebrows = clamp(
    Math.round((metrics.clarityScore + metrics.skinEvenness) / 2),
    0, 100
  );

  // Overall grooming score (weighted)
  const overallScore = Math.round(
    hairNeatness * 0.30 +
    skinClarity * 0.25 +
    facialHair * 0.20 +
    eyebrows * 0.15 +
    (metrics.faceDetected ? 10 : 0) // bonus for face detection
  );

  // Assessment text
  let assessment: string;
  if (overallScore >= 75) {
    assessment = "Well-groomed. This is a genuine strength — maintain it.";
  } else if (overallScore >= 55) {
    assessment = "Decent grooming. A few small improvements will make a noticeable difference.";
  } else if (overallScore >= 35) {
    assessment = "Grooming needs attention. Basic fixes (haircut, skin care) can improve your score significantly.";
  } else {
    assessment = "Grooming is the #1 area to improve. Start with basics: haircut, moisturize, shape brows.";
  }

  // Find the top fix
  const fixes: { area: string; fix: string; priority: "high" | "medium" | "low"; score: number }[] = [];

  if (hairNeatness < 60) {
    fixes.push({
      area: "hair",
      fix: "Get a fresh haircut or trim. Tame flyaways with a smoothing product before photos.",
      priority: hairNeatness < 40 ? "high" : "medium",
      score: hairNeatness,
    });
  }

  if (skinClarity < 60) {
    fixes.push({
      area: "skin",
      fix: "Start a simple skincare routine: cleanse, moisturize, SPF daily. Even lighting in photos helps hide uneven tone.",
      priority: skinClarity < 40 ? "high" : "medium",
      score: skinClarity,
    });
  }

  if (facialHair < 50) {
    fixes.push({
      area: "facial hair",
      fix: "Shape and trim facial hair. If clean-shaven, maintain regularly. If bearded, keep edges defined.",
      priority: "medium",
      score: facialHair,
    });
  }

  fixes.sort((a, b) => a.score - b.score);
  const topFix = fixes.length > 0 ? fixes[0].fix : "Maintain your current grooming routine.";
  const topFixPriority = fixes.length > 0 ? fixes[0].priority : "low";

  return {
    overallScore,
    hairNeatness,
    skinClarity,
    facialHair,
    eyebrows,
    assessment,
    topFix,
    topFixPriority,
  };
}
