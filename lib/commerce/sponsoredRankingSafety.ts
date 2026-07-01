import type { CommerceProduct, AuraStyleDirection, AuraLeakTag } from "@/types/commerce";

const MAX_SPONSORED_BOOST = 0.03;

export function isSponsoredRelevant(
  product: CommerceProduct,
  userStyleDirections?: AuraStyleDirection[],
  userLeakTags?: AuraLeakTag[],
  userGoalTags?: string[]
): boolean {
  if (!product.isSponsored) return true;

  const styleMatch = userStyleDirections?.some((d) => product.styleDirections.includes(d)) ?? false;
  const leakMatch = userLeakTags?.some((t) => product.auraLeakTags.includes(t)) ?? false;
  const goalMatch = userGoalTags?.some((g) => product.goalTags.includes(g)) ?? false;

  return styleMatch || leakMatch || goalMatch;
}

export function getSponsoredBoost(product: CommerceProduct): number {
  if (!product.isSponsored) return 0;
  return MAX_SPONSORED_BOOST;
}

export function applySponsoredRanking(
  products: CommerceProduct[],
  userStyleDirections?: AuraStyleDirection[],
  userLeakTags?: AuraLeakTag[],
  userGoalTags?: string[]
): { product: CommerceProduct; sponsoredBoost: number; isRelevant: boolean }[] {
  return products.map((p) => ({
    product: p,
    sponsoredBoost: getSponsoredBoost(p),
    isRelevant: isSponsoredRelevant(p, userStyleDirections, userLeakTags, userGoalTags),
  }));
}

export function getRankedRecommendations(
  products: CommerceProduct[],
  baseScores: Map<string, number>,
  userStyleDirections?: AuraStyleDirection[],
  userLeakTags?: AuraLeakTag[],
  userGoalTags?: string[]
): { product: CommerceProduct; finalScore: number; isSponsored: boolean }[] {
  const rankings = applySponsoredRanking(products, userStyleDirections, userLeakTags, userGoalTags);

  return rankings
    .map((r) => {
      const baseScore = baseScores.get(r.product.id) || 0;
      const boost = r.isRelevant ? r.sponsoredBoost : 0;
      const finalScore = baseScore + boost;
      return { product: r.product, finalScore, isSponsored: r.product.isSponsored };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}

export const SPONSORED_DISCLAIMER = "Sponsored items do not automatically rank first.";
export const AFFILIATE_DISCLAIMER = "AuraCheck may earn affiliate commission on purchases made through these links.";
