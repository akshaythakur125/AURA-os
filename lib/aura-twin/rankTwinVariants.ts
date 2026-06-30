import type { AuraTwinVariant, TwinGoal } from "@/types/auraTwin";
import { getGoalBoost } from "@/lib/aura-twin/scoreTwinVariant";

interface RankInput {
  variants: AuraTwinVariant[];
  goal?: TwinGoal;
}

export function rankTwinVariants({ variants, goal }: RankInput): string[] {
  const scored = variants.map((v) => {
    const goalBoost = goal ? getGoalBoost(v.type, goal) : 0;
    const effectiveDelta = v.scoreDelta + goalBoost;
    return { id: v.id, scoreDelta: v.scoreDelta, effectiveDelta, type: v.type };
  });

  scored.sort((a, b) => {
    if (b.effectiveDelta !== a.effectiveDelta) return b.effectiveDelta - a.effectiveDelta;
    return b.scoreDelta - a.scoreDelta;
  });

  return scored.map((s) => s.id);
}

export function getBestVariant(variants: AuraTwinVariant[], goal?: TwinGoal): AuraTwinVariant {
  const ranked = rankTwinVariants({ variants, goal });
  const bestId = ranked[0] || "original";
  const nonOriginal = ranked.find((id) => id !== "original");
  const pick = nonOriginal || bestId;
  return variants.find((v) => v.id === pick) || variants[0];
}

export function getFreeWinner(variants: AuraTwinVariant[]): AuraTwinVariant | null {
  const free = variants
    .filter((v) => v.type !== "original" && v.estimatedCost === "₹0" && v.scoreDelta > 0)
    .sort((a, b) => b.scoreDelta - a.scoreDelta);
  return free[0] || null;
}

export function getPaidWinner(variants: AuraTwinVariant[]): AuraTwinVariant | null {
  const paid = variants
    .filter((v) => v.type !== "original" && v.estimatedCost !== "₹0" && v.scoreDelta > 0)
    .sort((a, b) => b.scoreDelta - a.scoreDelta);
  return paid[0] || null;
}
