import type { AuraTwinVariant, TwinGoal } from "@/types/auraTwin";
import { getBestVariant, getFreeWinner, getPaidWinner } from "@/lib/aura-twin/rankTwinVariants";

interface BuildStrategyInput {
  variants: AuraTwinVariant[];
  originalScore: number;
  goal?: TwinGoal;
}

export interface TwinStrategyOutput {
  bestVariantId: string;
  freeUpgradeWinner: string;
  paidUpgradeWinner: string;
  statusRoiSummary: string;
  avoidForNow: string;
  finalStrategy: string;
  actionTiers: { tier: number; label: string; actions: string[] }[];
}

export function buildTwinStrategy({ variants, originalScore, goal }: BuildStrategyInput): TwinStrategyOutput {
  const best = getBestVariant(variants, goal);
  const free = getFreeWinner(variants);
  const paid = getPaidWinner(variants);

  const original = variants.find((v) => v.type === "original");

  const freeWinnerId = free?.id || "none";
  const paidWinnerId = paid?.id || "none";

  const statusRoiSummary = buildRoiSummary(best, free, paid, originalScore);
  const avoidForNow = buildAvoidAdvice(variants, goal, original);
  const finalStrategy = buildFinalStrategy(best, free, paid, goal);
  const actionTiers = buildActionTiers(variants, best);

  return {
    bestVariantId: best.id,
    freeUpgradeWinner: freeWinnerId,
    paidUpgradeWinner: paidWinnerId,
    statusRoiSummary,
    avoidForNow,
    finalStrategy,
    actionTiers,
  };
}

function buildRoiSummary(
  best: AuraTwinVariant,
  free: AuraTwinVariant | null,
  paid: AuraTwinVariant | null,
  originalScore: number
): string {
  const parts: string[] = [];

  if (best.scoreDelta <= 0) {
    return `Your image is already well-optimized at ${originalScore} points. No significant improvement predicted from basic adjustments. Keep your look consistent across your profile.`;
  }

  parts.push(
    `Your best bet: "${best.title}" (+${best.scoreDelta} points) — ${best.estimatedCost}.`
  );

  if (free && free.scoreDelta > 0) {
    parts.push(
      `Top free fix: "${free.title}" (+${free.scoreDelta} pts) — ₹0 cost.`
    );
  }

  if (paid && paid.scoreDelta > 0 && paid.id !== free?.id) {
    parts.push(
      `Top paid upgrade: "${paid.title}" (+${paid.scoreDelta} pts) — ${paid.estimatedCost}.`
    );
  }

  if (free && paid && paid.scoreDelta <= free.scoreDelta) {
    parts.push(
      "Note: Free improvements match or beat paid ones. Fix lighting and background first."
    );
  }

  return parts.join(" ");
}

function buildAvoidAdvice(
  variants: AuraTwinVariant[],
  goal?: TwinGoal,
  original?: AuraTwinVariant
): string {
  const ogMetrics = original?.metrics;
  const avoidList: string[] = [];

  if (ogMetrics) {
    const lightingWeak = ogMetrics.lightingScore < 55;
    const bgBusy = ogMetrics.backgroundComplexityEstimate > 65;
    const compositionWeak = ogMetrics.compositionScore < 55;
    const clarityWeak = ogMetrics.clarityScore < 55;

    if (lightingWeak) {
      avoidList.push("Do not buy expensive accessories before fixing lighting. Natural light is free and has the biggest impact.");
    }
    if (bgBusy) {
      avoidList.push("Do not buy another phone or camera before fixing your background and framing.");
    }
    if (compositionWeak && clarityWeak) {
      avoidList.push("Do not invest in filters or apps. Your biggest gain is cleaner framing and stable shooting.");
    } else if (compositionWeak) {
      avoidList.push("Do not overedit. Clean framing beats heavy filters every time.");
    }
  }

  if (goal === "professional") {
    avoidList.push("Avoid loud styling or flashy backgrounds for professional photos. Keep it neutral.");
  }
  if (goal === "dating_profile") {
    avoidList.push("Avoid heavy filters or staged-looking shots. Natural warmth and a real smile win on dating profiles.");
  }
  if (goal === "instagram" || goal === "creator") {
    avoidList.push("Avoid paying for professional retouching before you have good base lighting and composition.");
  }
  if (goal === "college_social") {
    avoidList.push("Avoid over-spending on branded items in photos. Clean, confident presentation matters more.");
  }

  // Mention variants that actively hurt score
  const overedited = variants.filter((v) => v.type !== "original" && v.scoreDelta < -3);
  if (overedited.length > 0) {
    const names = overedited.map((v) => `"${v.title}"`).join(", ");
    avoidList.push(`These styles lowered the predicted score: ${names}. Avoid this look for now.`);
  }

  if (avoidList.length === 0) {
    avoidList.push("Your image is already solid. Avoid over-editing — small tweaks win.");
  }

  // Deduplicate and cap
  const unique = [...new Set(avoidList)];
  return unique.slice(0, 4).join(" ");
}

function buildFinalStrategy(
  best: AuraTwinVariant,
  free: AuraTwinVariant | null,
  paid: AuraTwinVariant | null,
  goal?: TwinGoal
): string {
  const goalLabel = goal ? goal.replaceAll("_", " ") : "general improvement";

  let strategy = `For ${goalLabel}, "${best.title}" gives the best predicted gain (+${best.scoreDelta} pts).`;

  if (best.scoreDelta <= 0) {
    strategy += ` Your baseline is already strong — maintain consistency across your profile.`;
    return strategy;
  }

  strategy += ` First step: ${best.freeFix}`;
  if (best.paidFix) {
    strategy += ` If budget allows: ${best.paidFix}`;
  }

  if (free && free.id !== best.id && free.scoreDelta > 0) {
    strategy += ` Free alternative: "${free.title}" (+${free.scoreDelta}).`;
  }
  if (paid && paid.id !== best.id && paid.scoreDelta > 0) {
    strategy += ` Paid alternative: "${paid.title}" (${paid.estimatedCost}, +${paid.scoreDelta}).`;
  }

  return strategy;
}

function buildActionTiers(
  variants: AuraTwinVariant[],
  best: AuraTwinVariant
): { tier: number; label: string; actions: string[] }[] {
  const tiers: { tier: number; label: string; actions: string[] }[] = [];

  // Tier 1 — immediate free wins
  const freePositive = variants.filter(
    (v) => v.type !== "original" && v.isFree && v.scoreDelta > 2
  );
  if (freePositive.length > 0) {
    tiers.push({
      tier: 1,
      label: "Fix now — free (₹0)",
      actions: freePositive.map((v) => v.freeFix),
    });
  }

  // Tier 2 — under 1k
  const cheapPaid = variants.filter(
    (v) => v.type !== "original" && !v.isFree && v.scoreDelta > 0 && v.estimatedCost.includes("₹1,000")
  );
  if (cheapPaid.length > 0) {
    tiers.push({
      tier: 2,
      label: "Under ₹1,000",
      actions: cheapPaid.map((v) => v.paidFix || v.estimatedCost),
    });
  }

  // Tier 3 — under 2k
  const midPaid = variants.filter(
    (v) => v.type !== "original" && !v.isFree && v.scoreDelta > 0 && v.estimatedCost.includes("₹2,000")
  );
  if (midPaid.length > 0) {
    tiers.push({
      tier: 3,
      label: "Under ₹2,000",
      actions: midPaid.map((v) => v.paidFix || v.estimatedCost),
    });
  }

  // Tier 4 — overall strategy
  if (best.scoreDelta > 0) {
    const ops: string[] = [best.freeFix];
    if (best.paidFix) ops.push(best.paidFix);
    tiers.push({
      tier: 4,
      label: `Best path to +${best.scoreDelta} pts`,
      actions: ops,
    });
  }

  if (tiers.length === 0) {
    tiers.push({
      tier: 1,
      label: "Already optimized",
      actions: ["Your image scores well. Maintain consistency and avoid drastic edits."],
    });
  }

  return tiers;
}
