import type { CommerceSearchItem, CommerceSearchSort, AuraSearchRankingScore } from "@/types/commerceSearch";
import type { AuraLeakTag, AuraStyleDirection } from "@/types/commerce";
import { matchQueryTokens } from "./tokenizeProduct";

export function rankCommerceResults(
  items: CommerceSearchItem[],
  queryTokens: string[],
  matchedAuraLeaks: AuraLeakTag[],
  matchedStyles: AuraStyleDirection[],
  matchedGoals: string[],
  budgetMin?: number,
  budgetMax?: number,
  sort: CommerceSearchSort = "aura_best"
): AuraSearchRankingScore[] {
  const scores = items.map((item) =>
    computeRankScore(item, queryTokens, matchedAuraLeaks, matchedStyles, matchedGoals, budgetMin, budgetMax)
  );

  return sortScores(scores, sort);
}

export function computeRankScore(
  item: CommerceSearchItem,
  queryTokens: string[],
  matchedAuraLeaks: AuraLeakTag[],
  matchedStyles: AuraStyleDirection[],
  matchedGoals: string[],
  budgetMin?: number,
  budgetMax?: number
): AuraSearchRankingScore {
  // 1. Text match score (from query tokens)
  const { score: textMatchScore } = matchQueryTokens(queryTokens, item.searchTokens);

  // 2. Aura leak match (30% of final)
  const matchedLeaks = matchedAuraLeaks.filter((l) => item.auraLeakTags.includes(l));
  const auraMatchScore = matchedAuraLeaks.length > 0
    ? matchedLeaks.length / matchedAuraLeaks.length
    : textMatchScore * 0.5;

  // 3. Style/goal match (25%)
  const matchedStyleTags = matchedStyles.filter((s) => item.styleTags.includes(s));
  const matchedGoalTags = matchedGoals.filter((g) => item.goalTags.includes(g));
  const totalStyleGoal = matchedStyles.length + matchedGoals.length;
  const matchedStyleGoal = matchedStyleTags.length + matchedGoalTags.length;
  const styleGoalScore = totalStyleGoal > 0 ? matchedStyleGoal / totalStyleGoal : 0.5;

  // 4. Category priority (15%)
  const categoryScore = queryTokens.length > 0
    ? textMatchScore
    : (matchedLeaks.length > 0 ? 0.7 : 0.5);

  // 5. Budget fit (15%)
  let budgetScore = 1;
  if (budgetMin !== undefined && item.price < budgetMin) {
    budgetScore = 0.3;
  }
  if (budgetMax !== undefined && item.price > budgetMax) {
    budgetScore = 0.1;
  }
  if (budgetMin === undefined && budgetMax === undefined) {
    budgetScore = 0.8;
  }

  // 6. Price value (10%)
  const priceValueScore = computePriceValueScore(item);

  // 7. Freshness/availability (5%)
  const freshnessScore = computeFreshnessScore(item);

  // 8. Sponsored boost (max 3%, only if relevance passes threshold)
  const relevanceScore =
    auraMatchScore * 0.3 +
    styleGoalScore * 0.25 +
    categoryScore * 0.15 +
    budgetScore * 0.15 +
    priceValueScore * 0.1 +
    freshnessScore * 0.05;

  const sponsoredBoost = item.isSponsored && relevanceScore >= 0.3
    ? Math.min(0.03, relevanceScore * 0.03)
    : 0;

  const finalRankScore = Math.min(1, relevanceScore + sponsoredBoost);

  // Build reason
  const reason = buildReason(item, auraMatchScore, styleGoalScore, budgetScore, priceValueScore, matchedLeaks);

  // Deal label
  const dealLabel = getDealLabel(item);

  // Price warning
  const priceWarning = getPriceWarning(item);

  // Styling tip
  const stylingTip = item.styleTags.length > 0
    ? `Pairs well with ${item.styleTags.slice(0, 2).join(", ").replace(/_/g, " ")} style`
    : "Versatile piece for multiple outfits";

  return {
    auraMatchScore,
    styleGoalScore,
    categoryScore,
    budgetScore,
    priceValueScore,
    freshnessScore,
    sponsoredBoost,
    finalRankScore,
    reason,
    linkedAuraLeak: matchedLeaks[0],
    stylingTip,
    priceWarning,
    dealLabel,
  };
}

function computePriceValueScore(item: CommerceSearchItem): number {
  if (!item.mrp || item.mrp <= 0) return 0.5;
  if (item.mrp <= item.price) return 0.3;
  const discountRatio = (item.mrp - item.price) / item.mrp;
  return Math.min(1, 0.3 + discountRatio * 0.7);
}

function computeFreshnessScore(item: CommerceSearchItem): number {
  switch (item.priceFreshness) {
    case "fresh": return 1;
    case "recent": return 0.7;
    case "manual": return 0.5;
    case "stale": return 0.2;
    case "unknown": return 0.3;
    default: return 0.3;
  }
}

function buildReason(
  item: CommerceSearchItem,
  auraScore: number,
  styleScore: number,
  budgetScore: number,
  priceScore: number,
  matchedLeaks: string[]
): string {
  const parts: string[] = [];

  if (matchedLeaks.length > 0) {
    parts.push(`Targets ${matchedLeaks[0].replace(/_/g, " ")}`);
  }

  if (auraScore >= 0.7) {
    parts.push("Strong aura match");
  } else if (auraScore >= 0.4) {
    parts.push("Relevant aura fix");
  }

  if (item.discountPercent && item.discountPercent >= 30) {
    parts.push(`${item.discountPercent}% off MRP`);
  }

  if (item.availabilityStatus === "available") {
    parts.push("In stock");
  }

  if (item.priceFreshness === "fresh") {
    parts.push("Price recently checked");
  }

  if (parts.length === 0) {
    parts.push("Matches your search criteria");
  }

  return parts.join(" · ");
}

function getDealLabel(item: CommerceSearchItem): string | undefined {
  if (item.discountPercent && item.discountPercent >= 50) return "Strong discount";
  if (item.discountPercent && item.discountPercent >= 30) return "Good discount";
  if (item.discountPercent && item.discountPercent >= 15) return "Decent discount";
  if (item.price < 500) return "Budget-friendly";
  if (item.mrp && item.mrp > item.price) {
    const savings = item.mrp - item.price;
    if (savings >= 1000) return `Save ₹${savings}`;
  }
  return undefined;
}

function getPriceWarning(item: CommerceSearchItem): string | undefined {
  if (item.priceFreshness === "stale") return "Price may be outdated — verify on store";
  if (item.priceFreshness === "unknown") return "Verify price on store before buying";
  if (item.priceFreshness === "manual") return "Manual MVP price — not live";
  if (item.mrp && item.price > item.mrp) return "Price exceeds listed MRP";
  return undefined;
}

function sortScores(
  scores: AuraSearchRankingScore[],
  sort: CommerceSearchSort
): AuraSearchRankingScore[] {
  const sorted = [...scores];

  switch (sort) {
    case "aura_best":
      sorted.sort((a, b) => b.finalRankScore - a.finalRankScore);
      break;
    case "cheapest":
      // We need price info but it's not in the score — handled at a higher level
      sorted.sort((a, b) => b.finalRankScore - a.finalRankScore);
      break;
    case "best_value":
      sorted.sort((a, b) => (b.priceValueScore + b.auraMatchScore + b.freshnessScore) - (a.priceValueScore + a.auraMatchScore + a.freshnessScore));
      break;
    case "highest_discount":
      // Discount info is in the item, not score — handled at higher level
      sorted.sort((a, b) => b.finalRankScore - a.finalRankScore);
      break;
    case "fresh_price":
      sorted.sort((a, b) => b.freshnessScore - a.freshnessScore);
      break;
    case "store_trust":
      sorted.sort((a, b) => b.finalRankScore - a.finalRankScore);
      break;
    default:
      sorted.sort((a, b) => b.finalRankScore - a.finalRankScore);
  }

  return sorted;
}
