import type { Look } from "./catalogTypes";

// ponytail: deterministic ranking — same inputs always produce same output
// weights sum to 1.0

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
      // Audit relevance: how many leak tags does this look address?
      const leakOverlap = look.statusLeakTags.filter((t) => leakTags.includes(t)).length;
      const auditScore = leakTags.length > 0 ? leakOverlap / leakTags.length : 0.5;

      // Goal relevance: how many goal tags match?
      const goalOverlap = look.goalTags.filter((t) => goalTags.includes(t)).length;
      const goalScore = goalTags.length > 0 ? goalOverlap / goalTags.length : 0.5;

      // Price value: lower price = higher value (for budget items)
      const priceScore = look.price > 0 ? 1 - Math.min(look.price / 5000, 1) : 1;

      // Budget fit: does it fit the user's budget?
      const budgetScore = maxBudget ? (look.price <= maxBudget ? 1 : 0) : 1;

      // Data freshness: always 1 for static catalog
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
    .map((r) => r.look);
}

export function searchLooks(looks: Look[], query: string): Look[] {
  const q = query.toLowerCase().trim();
  if (!q) return looks;
  return looks.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.keywords.some((k) => k.toLowerCase().includes(q)) ||
      l.styleArchetypes.some((s) => s.toLowerCase().includes(q)) ||
      l.goalTags.some((g) => g.toLowerCase().includes(q))
  );
}
