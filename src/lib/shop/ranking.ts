import type { Look } from "./catalogTypes";
import {
  getLookDisplayDescription,
  getLookDisplayTitle,
  getLookTotalPrice,
} from "./lookCompositions";

const WEIGHTS = {
  auditRelevance: 0.35,
  goalRelevance: 0.25,
  priceValue: 0.20,
  budgetFit: 0.10,
  dataFreshness: 0.10,
};

export function rankLooks(
  looks: Look[],
  opts: {
    leakTags?: string[];
    goalTags?: string[];
    maxBudget?: number;
  }
): Look[] {
  const { leakTags = [], goalTags = [], maxBudget } = opts;

  return [...looks]
    .map((look) => {
      const leakOverlap = look.statusLeakTags.filter((tag) => leakTags.includes(tag)).length;
      const auditScore = leakTags.length > 0 ? leakOverlap / leakTags.length : 0.5;

      const goalOverlap = look.goalTags.filter((tag) => goalTags.includes(tag)).length;
      const goalScore = goalTags.length > 0 ? goalOverlap / goalTags.length : 0.5;

      const totalPrice = getLookTotalPrice(look);
      const priceScore = totalPrice > 0 ? 1 - Math.min(totalPrice / 5000, 1) : 1;
      const budgetScore = maxBudget ? (totalPrice <= maxBudget ? 1 : 0) : 1;
      const freshnessScore = 1;

      const totalScore =
        auditScore * WEIGHTS.auditRelevance +
        goalScore * WEIGHTS.goalRelevance +
        priceScore * WEIGHTS.priceValue +
        budgetScore * WEIGHTS.budgetFit +
        freshnessScore * WEIGHTS.dataFreshness;

      return { look, score: totalScore };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.look);
}

export function searchLooks(looks: Look[], query: string): Look[] {
  const q = query.toLowerCase().trim();
  if (!q) return looks;

  return looks.filter(
    (look) =>
      getLookDisplayTitle(look).toLowerCase().includes(q) ||
      getLookDisplayDescription(look).toLowerCase().includes(q) ||
      look.title.toLowerCase().includes(q) ||
      look.description.toLowerCase().includes(q) ||
      look.category.toLowerCase().includes(q) ||
      look.keywords.some((keyword) => keyword.toLowerCase().includes(q)) ||
      look.styleArchetypes.some((style) => style.toLowerCase().includes(q)) ||
      look.goalTags.some((goal) => goal.toLowerCase().includes(q))
  );
}
