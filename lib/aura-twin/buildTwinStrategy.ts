import type { AuraTwinVariant, TwinGoal } from "@/types/auraTwin";
import { getBestVariant, getFreeWinner, getPaidWinner } from "@/lib/aura-twin/rankTwinVariants";

interface BuildStrategyInput {
  variants: AuraTwinVariant[];
  originalScore: number;
  goal?: TwinGoal;
}

export function buildTwinStrategy({ variants, originalScore, goal }: BuildStrategyInput): {
  bestVariantId: string;
  freeUpgradeWinner: string;
  paidUpgradeWinner: string;
  statusRoiSummary: string;
  avoidForNow: string;
  finalStrategy: string;
} {
  const best = getBestVariant(variants, goal);
  const free = getFreeWinner(variants);
  const paid = getPaidWinner(variants);

  const freeWinnerId = free?.id || "none";
  const paidWinnerId = paid?.id || "none";

  const statusRoiSummary = buildRoiSummary(free, paid, originalScore);
  const avoidForNow = buildAvoidAdvice(variants, goal);
  const finalStrategy = buildFinalStrategy(best, free, paid, goal);

  return {
    bestVariantId: best.id,
    freeUpgradeWinner: freeWinnerId,
    paidUpgradeWinner: paidWinnerId,
    statusRoiSummary,
    avoidForNow,
    finalStrategy,
  };
}

function buildRoiSummary(
  free: AuraTwinVariant | null,
  paid: AuraTwinVariant | null,
  originalScore: number
): string {
  const parts: string[] = [];

  if (free && free.scoreDelta > 0) {
    parts.push(
      `Best free upgrade: ${free.title} (+${free.scoreDelta} points). ` +
      `Estimated cost: ₹0 — simple adjustments to lighting, framing, or background.`
    );
  }

  if (paid && paid.scoreDelta > 0) {
    parts.push(
      `Best paid upgrade: ${paid.title} (+${paid.scoreDelta} points). ` +
      `Estimated cost: ${paid.estimatedCost}.`
    );
  }

  if (!free && !paid) {
    parts.push(
      `Your image is already well-optimized at ${originalScore} points. ` +
      `No significant improvement predicted from basic adjustments. Focus on consistency across your profile.`
    );
  }

  if (free && paid && paid.scoreDelta <= free.scoreDelta) {
    parts.push(
      `Note: Free improvements match or beat paid ones. Fix lighting and background first before spending.`
    );
  }

  return parts.join(" ") || "No clear upgrade path detected.";
}

function buildAvoidAdvice(variants: AuraTwinVariant[], goal?: TwinGoal): string {
  const original = variants.find((v) => v.type === "original");
  const ogMetrics = original?.metrics;
  const avoidList: string[] = [];

  if (ogMetrics) {
    const lightingWeak = ogMetrics.lightingScore < 55;
    const bgBusy = ogMetrics.backgroundComplexityEstimate > 65;
    const compositionWeak = ogMetrics.compositionScore < 55;

    if (lightingWeak) {
      avoidList.push("Do not buy expensive accessories before fixing lighting. Natural light is free.");
    }
    if (bgBusy) {
      avoidList.push("Do not buy another phone before fixing background and framing.");
    }
    if (compositionWeak) {
      avoidList.push("Do not overedit. Your biggest gain is clean framing, not filters.");
    }
  }

  if (goal === "professional") {
    avoidList.push("Avoid loud styling if your goal is professional. Keep it clean and neutral.");
  }
  if (goal === "dating_profile") {
    avoidList.push("Avoid heavy filters or over-staged shots. Natural warmth works better for dating.");
  }
  if (goal === "instagram" || goal === "creator") {
    avoidList.push("Avoid paying for professional retouching before fixing lighting and composition basics.");
  }

  if (avoidList.length === 0) {
    avoidList.push("Your image is already decent. Avoid over-editing — small tweaks win.");
  }

  const overedited = variants.filter((v) => v.type !== "original" && v.scoreDelta < -3);
  if (overedited.length > 0) {
    const names = overedited.map((v) => `"${v.title}"`).join(", ");
    avoidList.push(`These styles lowered the predicted score: ${names}. Avoid this look.`);
  }

  return avoidList.slice(0, 4).join(" ");
}

function buildFinalStrategy(
  best: AuraTwinVariant,
  free: AuraTwinVariant | null,
  paid: AuraTwinVariant | null,
  goal?: TwinGoal
): string {
  const goalLabel = goal ? goal.replace("_", " ") : "general improvement";

  let strategy = `For ${goalLabel}, the best visual direction is "${best.title}" which predicts a +${best.scoreDelta} point improvement. Start with: `;

  const steps: string[] = [];
  if (best.freeFix) steps.push(best.freeFix);
  if (free && free.id !== best.id && free.scoreDelta > 0) {
    steps.push(`Also try "${free.title}" as a free alternative.`);
  }
  if (paid && paid.scoreDelta > 0) {
    steps.push(`If you have budget, "${paid.title}" (${paid.estimatedCost}) adds another +${paid.scoreDelta}.`);
  }

  strategy += steps.join(" ") || "minor refinements.";

  return strategy;
}
