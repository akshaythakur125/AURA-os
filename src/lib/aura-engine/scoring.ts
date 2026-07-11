import type { ImageSignalMetrics, AuditType, AuditGoal } from "@/types/audit";

export interface ScoreInput {
  auditType: AuditType;
  goal: AuditGoal;
  budgetRange: number;
  metrics: ImageSignalMetrics;
}

const GOAL_BONUSES: Record<AuditGoal, { lighting: number; clarity: number; composition: number }> = {
  dating: { lighting: 5, clarity: 5, composition: 10 },
  instagram: { lighting: 10, clarity: 8, composition: 5 },
  college: { lighting: 0, clarity: 0, composition: 0 },
  office: { lighting: 3, clarity: 5, composition: 3 },
  glowup: { lighting: 5, clarity: 5, composition: 5 },
};

const TYPE_BONUSES: Record<AuditType, { lighting: number; clarity: number; composition: number }> = {
  photo: { lighting: 5, clarity: 5, composition: 5 },
  instagram: { lighting: 8, clarity: 5, composition: 3 },
  dating: { lighting: 3, clarity: 3, composition: 8 },
  outfit: { lighting: 5, clarity: 8, composition: 3 },
  room: { lighting: 8, clarity: 3, composition: 3 },
};

export function calculateAuraScore(input: ScoreInput): number {
  const { metrics, auditType, goal } = input;

  const gb = GOAL_BONUSES[goal] || GOAL_BONUSES.glowup;
  const tb = TYPE_BONUSES[auditType] || TYPE_BONUSES.photo;

  const lightingScore = Math.min(100, metrics.lightingScore + gb.lighting + tb.lighting);
  const clarityScore = Math.min(100, metrics.clarityScore + gb.clarity + tb.clarity);
  const compositionScore = Math.min(100, metrics.compositionScore + gb.composition + tb.composition);

  const contrastBalance = 100 - Math.abs(metrics.contrast - 50);
  const saturationBalance = 100 - Math.abs(metrics.saturation - 45);

  const bgScore = Math.max(0, 100 - metrics.backgroundComplexityEstimate * 0.3);

  let raw =
    lightingScore * 0.25 +
    clarityScore * 0.25 +
    compositionScore * 0.20 +
    contrastBalance * 0.08 +
    saturationBalance * 0.07 +
    bgScore * 0.15;

  raw = Math.round(raw);

  if (raw > 92) raw = 92;
  if (raw < 35) raw = 35;

  return raw;
}

export function determineCategory(score: number, metrics: ImageSignalMetrics): string {
  const busy = metrics.backgroundComplexityEstimate > 65;
  const dim = metrics.lightingScore < 45;
  const sharp = metrics.sharpness > 60;

  if (score >= 80 && sharp) return "Strong Visual Signal";
  if (score >= 70) return "Premium Potential";
  if (score >= 60 && busy) return "Overdone / Busy Signal";
  if (score >= 60) return "Urban Aspirational";
  if (score >= 50) return "Clean but Basic";
  if (dim) return "Low-Clarity Presentation";
  return "Clean but Basic";
}

export function generateVerdict(score: number, _category: string): string {
  void _category;
  if (score >= 80) return "Strong photo. Minor polish and you're at a professional level.";
  if (score >= 70) return "Good foundation — a few targeted fixes will make this genuinely stand out.";
  if (score >= 60) return "Decent, but you're leaving easy points on the table. The fixes are simple.";
  if (score >= 50) return "Average first impression. Two or three changes can push this well above the pack.";
  return "This needs work — but the biggest improvements are free. Lighting and clarity alone can transform it.";
}
