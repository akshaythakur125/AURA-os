/**
 * Skin Undertone Engine
 * Detects warm/cool/neutral undertone from skin-tone pixels.
 *
 * Method: analyze the ratio of R:G:B in skin pixels.
 * - Warm: red/yellow dominance (golden, peachy)
 * - Cool: blue/pink dominance (rosy, pinkish)
 * - Neutral: balanced ratios
 *
 * Tuned for Indian skin tones (diverse range from light wheatish to deep brown).
 */

export type Undertone = "warm" | "cool" | "neutral";
export type SkinDepth = "fair" | "light" | "medium" | "olive" | "dark" | "deep";

export interface UndertoneResult {
  undertone: Undertone;
  skinDepth: SkinDepth;
  confidence: number; // 0-100
  warmRatio: number;
  coolRatio: number;
  sampleSize: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Analyze skin pixels to detect undertone.
 * Accepts raw RGBA pixel data from the face zone.
 */
export function detectUndertone(
  rValues: number[],
  gValues: number[],
  bValues: number[]
): UndertoneResult {
  if (rValues.length < 10) {
    return { undertone: "neutral", skinDepth: "medium", confidence: 0, warmRatio: 0.5, coolRatio: 0.5, sampleSize: rValues.length };
  }

  // Compute mean RGB
  const meanR = rValues.reduce((s, v) => s + v, 0) / rValues.length;
  const meanG = gValues.reduce((s, v) => s + v, 0) / gValues.length;
  const meanB = bValues.reduce((s, v) => s + v, 0) / bValues.length;

  // Compute warm/cool ratios
  // Warm = red-yellow dominance (R high, G moderate, B low)
  // Cool = blue-pink dominance (R moderate, B high relative to G)
  const total = meanR + meanG + meanB;
  if (total === 0) return { undertone: "neutral", skinDepth: "medium", confidence: 0, warmRatio: 0.5, coolRatio: 0.5, sampleSize: rValues.length };

  const rPct = meanR / total;
  const gPct = meanG / total;
  const bPct = meanB / total;

  // Warm score: high R relative to B, moderate G
  const warmScore = (rPct - bPct) + (gPct > 0.3 ? 0.05 : 0);

  // Cool score: high B relative to R, or pink shift (R ≈ G but both high)
  const coolScore = (bPct - rPct * 0.5) + (Math.abs(rPct - gPct) < 0.05 && rPct > 0.4 ? 0.08 : 0);

  const warmRatio = clamp(0.5 + warmScore * 3, 0, 1);
  const coolRatio = clamp(0.5 + coolScore * 3, 0, 1);

  // Classify undertone
  let undertone: Undertone;
  if (warmRatio > coolRatio + 0.12) {
    undertone = "warm";
  } else if (coolRatio > warmRatio + 0.12) {
    undertone = "cool";
  } else {
    undertone = "neutral";
  }

  // Classify skin depth based on mean brightness
  const brightness = (meanR * 0.299 + meanG * 0.587 + meanB * 0.114) / 255;
  let skinDepth: SkinDepth;
  if (brightness > 0.75) skinDepth = "fair";
  else if (brightness > 0.6) skinDepth = "light";
  else if (brightness > 0.45) skinDepth = "medium";
  else if (brightness > 0.35) skinDepth = "olive";
  else if (brightness > 0.25) skinDepth = "dark";
  else skinDepth = "deep";

  // Confidence based on sample size and how decisive the ratio is
  const decisiveness = Math.abs(warmRatio - coolRatio);
  const sampleConf = Math.min(rValues.length / 500, 1);
  const confidence = Math.round(clamp(decisiveness * 100 + sampleConf * 30, 10, 95));

  return { undertone, skinDepth, confidence, warmRatio, coolRatio, sampleSize: rValues.length };
}
