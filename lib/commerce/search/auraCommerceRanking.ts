import type { CommerceSearchItem } from "@/types/commerceSearch";
import type { AuraLeakTag, AuraStyleDirection } from "@/types/commerce";
export interface AuraSearchResult {
  item: CommerceSearchItem;
  auraMatchScore: number;
  priceValueScore: number;
  freshnessScore: number;
  finalRankScore: number;
  reason: string;
  linkedAuraLeak?: AuraLeakTag;
  stylingTip: string;
  priceWarning?: string;
  dealLabel?: string;
  comparisonGroup?: string;
}

export interface AuraRankingInput {
  items: CommerceSearchItem[];
  auraLeakTags?: AuraLeakTag[];
  styleDirections?: AuraStyleDirection[];
  goalTags?: string[];
  budgetMin?: number;
  budgetMax?: number;
}

/**
 * Score and rank items using the Aura Commerce Ranking formula:
 * - Aura leak match: 30%
 * - Style/goal match: 25%
 * - Category priority: 15%
 * - Budget fit: 15%
 * - Price value: 10%
 * - Freshness/availability: 5%
 * - Sponsored boost: max 3%, only if relevance score passes threshold
 */
export function rankByAuraScore(input: AuraRankingInput): AuraSearchResult[] {
  const { items, auraLeakTags, styleDirections, goalTags, budgetMin, budgetMax } = input;

  const scored = items.map((item) => {
    // 1. Aura leak match (30%)
    const matchedLeaks = (auraLeakTags || []).filter((l) => item.auraLeakTags.includes(l));
    const auraMatchScore = auraLeakTags && auraLeakTags.length > 0
      ? matchedLeaks.length / auraLeakTags.length
      : 0.5;

    // 2. Style/goal match (25%)
    const matchedStyles = (styleDirections || []).filter((s) => item.styleTags.includes(s));
    const matchedGoals = (goalTags || []).filter((g) => item.goalTags.includes(g));
    const totalTargets = (styleDirections?.length || 0) + (goalTags?.length || 0);
    const totalMatched = matchedStyles.length + matchedGoals.length;
    const styleGoalScore = totalTargets > 0 ? totalMatched / totalTargets : 0.5;

    // 3. Category priority (15%)
    // Higher score if the item's category matches common aura-fix categories
    const categoryScore = computeCategoryScore(item, matchedLeaks);

    // 4. Budget fit (15%)
    const budgetScore = computeBudgetScore(item.price, budgetMin, budgetMax);

    // 5. Price value (10%)
    const priceValueScore = computePriceValueScore(item);

    // 6. Freshness/availability (5%)
    const freshnessScore = computeFreshnessScore(item);

    // Relevance threshold check
    const relevanceScore =
      auraMatchScore * 0.30 +
      styleGoalScore * 0.25 +
      categoryScore * 0.15 +
      budgetScore * 0.15 +
      priceValueScore * 0.10 +
      freshnessScore * 0.05;

    // 7. Sponsored boost: max 3%, only if relevance >= 0.3
    const sponsoredBoost = item.isSponsored && relevanceScore >= 0.3
      ? Math.min(0.03, relevanceScore * 0.03)
      : 0;

    const finalRankScore = Math.min(1, relevanceScore + sponsoredBoost);

    // Build outputs
    const reason = buildReason(item, auraMatchScore, matchedLeaks, matchedStyles);
    const dealLabel = getDealLabel(item);
    const priceWarning = getPriceWarning(item);
    const stylingTip = buildStylingTip(item);

    return {
      item,
      auraMatchScore,
      priceValueScore,
      freshnessScore,
      finalRankScore,
      reason,
      linkedAuraLeak: matchedLeaks.length > 0 ? matchedLeaks[0] : undefined,
      stylingTip,
      priceWarning,
      dealLabel,
      comparisonGroup: item.comparableGroupKey,
    };
  });

  // Sort by final rank score descending
  scored.sort((a, b) => b.finalRankScore - a.finalRankScore);

  return scored;
}

function computeCategoryScore(item: CommerceSearchItem, matchedLeaks: AuraLeakTag[]): number {
  // Categories that commonly fix specific aura leaks
  const categoryRelevance: Record<string, string[]> = {
    weak_lighting: ["background_item", "photo_accessory"],
    busy_background: ["background_item", "photo_accessory"],
    weak_clarity: ["photo_accessory"],
    weak_framing: ["photo_accessory"],
    outfit_inconsistency: ["overshirt", "shirt", "sneakers", "belt", "watch"],
    low_premium_signal: ["watch", "belt", "shoes", "wallet", "sunglasses"],
    over_flex: ["tshirt", "shirt", "overshirt"],
    too_plain: ["watch", "belt", "chain", "jacket", "accessories"],
    color_mismatch: ["shirt", "tshirt", "overshirt", "kurta"],
    professional_mismatch: ["shirt", "trousers", "chinos", "belt", "formal_shoes"],
    dating_warmth_missing: ["shirt", "tshirt", "overshirt", "sneakers"],
    creator_energy_missing: ["jacket", "overshirt", "sunglasses"],
  };

  for (const leak of matchedLeaks) {
    const relevantCats = categoryRelevance[leak];
    if (relevantCats?.includes(item.category)) {
      return 1;
    }
  }

  return 0.6;
}

function computeBudgetScore(
  price: number,
  budgetMin?: number,
  budgetMax?: number
): number {
  if (budgetMin !== undefined && price < budgetMin) return 0.3;
  if (budgetMax !== undefined && price > budgetMax) return 0.1;
  if (budgetMin === undefined && budgetMax === undefined) return 0.8;

  // Within budget
  if (budgetMax !== undefined) {
    const ratio = price / budgetMax;
    if (ratio <= 0.3) return 1; // Well under budget
    if (ratio <= 0.6) return 0.8; // Good value
    if (ratio <= 0.9) return 0.6;
    return 0.4;
  }

  return 0.7;
}

function computePriceValueScore(item: CommerceSearchItem): number {
  if (!item.mrp || item.mrp <= 0) return 0.5;
  if (item.mrp <= item.price) return 0.3;
  const discountRatio = (item.mrp - item.price) / item.mrp;
  // Scale: 0% off = 0.3, 50% off = 0.8, 70%+ = 1.0
  return Math.min(1, 0.3 + discountRatio * 1.0);
}

function computeFreshnessScore(item: CommerceSearchItem): number {
  const scores: Record<string, number> = {
    fresh: 1.0,
    recent: 0.7,
    manual: 0.5,
    unknown: 0.3,
    stale: 0.2,
  };
  const base = scores[item.priceFreshness] ?? 0.3;

  if (item.availabilityStatus === "available") return base;
  if (item.availabilityStatus === "out_of_stock") return 0;
  return base * 0.5;
}

function buildReason(
  item: CommerceSearchItem,
  auraScore: number,
  matchedLeaks: AuraLeakTag[],
  matchedStyles: string[]
): string {
  const parts: string[] = [];

  if (matchedLeaks.length > 0) {
    const leakNames = matchedLeaks
      .map((l) => l.replace(/_/g, " "))
      .slice(0, 2);
    parts.push(`Fixes: ${leakNames.join(", ")}`);
  }

  if (matchedStyles.length > 0) {
    const styleNames = matchedStyles
      .map((s) => s.replace(/_/g, " "))
      .slice(0, 1);
    parts.push(`Style: ${styleNames[0]}`);
  }

  if (item.discountPercent && item.discountPercent >= 20) {
    parts.push(`${item.discountPercent}% off`);
  }

  if (item.priceFreshness === "fresh") {
    parts.push("Recently checked price");
  } else if (item.priceFreshness === "stale") {
    parts.push("Verify price");
  }

  if (item.availabilityStatus === "available") {
    parts.push("In stock");
  }

  if (parts.length === 0) {
    parts.push("Matches your criteria");
  }

  return parts.join(" · ");
}

function getDealLabel(item: CommerceSearchItem): string | undefined {
  if (item.discountPercent && item.discountPercent >= 50) return "Strong discount";
  if (item.discountPercent && item.discountPercent >= 30) return "Good discount";
  if (item.discountPercent && item.discountPercent >= 15) return "Decent discount";
  if (item.price < 500) return "Budget-friendly";
  return undefined;
}

function getPriceWarning(item: CommerceSearchItem): string | undefined {
  if (item.priceFreshness === "stale") return "Price may be outdated — verify on store before buying";
  if (item.priceFreshness === "unknown") return "Verify price on store before buying";
  if (item.priceFreshness === "manual") return "Manual MVP price — not a live price";
  if (item.mrp && item.price > item.mrp) return "Price exceeds listed MRP";
  return undefined;
}

function buildStylingTip(item: CommerceSearchItem): string {
  const category = item.category.replace(/_/g, " ");
  const colors = item.colorTags.slice(0, 2).join(", ");

  if (colors) {
    return `${colors} ${category} — versatile piece for multiple outfits`;
  }

  return `${category} — pairs well with neutrals and denim`;
}

/**
 * Filter out irrelevant sponsored products.
 * If a sponsored product's relevance score is below threshold, it's excluded.
 */
export function filterSponsoredProducts(
  results: AuraSearchResult[],
  threshold: number = 0.25
): AuraSearchResult[] {
  return results.filter((r) => {
    if (r.item.isSponsored) {
      return r.finalRankScore >= threshold;
    }
    return true;
  });
}
