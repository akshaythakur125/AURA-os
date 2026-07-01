import type { CommerceSearchItem, CommerceSearchInput, CommerceSearchResponse, CommerceSearchResult, FreshnessSummary, ComparableGroup } from "@/types/commerceSearch";
import type { AuraLeakTag, AuraStyleDirection } from "@/types/commerce";
import { expandQuery, buildSearchTokens } from "@/config/searchSynonyms";
import { getLocalSearchIndex, buildSearchIndex } from "./buildSearchIndex";
import { matchQueryTokens } from "./tokenizeProduct";
import { computeRankScore } from "./rankCommerceResults";
import { buildComparableGroups } from "./similarProductGrouping";

export async function searchCommerceIndex(
  input: CommerceSearchInput
): Promise<CommerceSearchResponse> {
  // 1. Load index
  let index = getLocalSearchIndex();
  let catalogSource = "local_cache";

  if (index.length === 0) {
    const built = await buildSearchIndex();
    index = built.items;
    catalogSource = built.source;
  }

  // 2. Expand query with synonyms
  const queryTokens = input.query ? buildSearchTokens(input.query) : [];
  const expandedQueries = input.query ? expandQuery(input.query) : [];

  // 3. Parse style direction from query if not explicit
  const styleDirection = input.styleDirection || inferStyleFromQuery(expandedQueries);

  // 4. Parse aura leaks from query if not explicit
  const auraLeakTags = input.auraLeakTags || inferAuraLeaksFromQuery(expandedQueries);

  // 5. Parse goals from query
  const goalTags = input.goal ? [input.goal] : inferGoalsFromQuery(expandedQueries);

  // 6. Filter items
  let filtered = [...index];

  if (input.category) {
    filtered = filtered.filter((item) => item.category === input.category);
  }

  if (input.storeKeys && input.storeKeys.length > 0) {
    filtered = filtered.filter((item) => input.storeKeys!.includes(item.storeKey));
  }

  if (input.budgetMin !== undefined) {
    filtered = filtered.filter((item) => item.price >= input.budgetMin!);
  }

  if (input.budgetMax !== undefined) {
    filtered = filtered.filter((item) => item.price <= input.budgetMax!);
  }

  if (queryTokens.length > 0) {
    filtered = filtered.filter((item) => {
      const { score } = matchQueryTokens(queryTokens, item.searchTokens);
      return score > 0;
    });
  }

  if (styleDirection) {
    filtered = filtered.filter((item) =>
      item.styleTags.includes(styleDirection)
    );
  }

  if (auraLeakTags.length > 0) {
    filtered = filtered.filter((item) =>
      item.auraLeakTags.some((t) => auraLeakTags.includes(t))
    );
  }

  // 7. Score and rank
  const sort = input.sort || "aura_best";
  const scored = filtered.map((item) => {
    const score = computeRankScore(
      item,
      queryTokens,
      auraLeakTags,
      styleDirection ? [styleDirection] : [],
      goalTags,
      input.budgetMin,
      input.budgetMax
    );

    return { item, score };
  });

  // Sort
  scored.sort((a, b) => {
    switch (sort) {
      case "cheapest":
        return a.item.price - b.item.price;
      case "highest_discount":
        return (b.item.discountPercent || 0) - (a.item.discountPercent || 0);
      case "fresh_price":
        return freshnessOrder(a.item.priceFreshness) - freshnessOrder(b.item.priceFreshness);
      case "store_trust":
        return getStoreTrustRank(b.item.storeKey) - getStoreTrustRank(a.item.storeKey);
      case "best_value":
        return (b.score.priceValueScore + b.score.auraMatchScore) - (a.score.priceValueScore + a.score.auraMatchScore);
      case "aura_best":
      default:
        return b.score.finalRankScore - a.score.finalRankScore;
    }
  });

  // 8. Limit
  const limit = input.limit || 50;
  const topResults = scored.slice(0, limit);

  // 9. Build results
  const results: CommerceSearchResult[] = topResults.map(({ item, score }) => {
    // Find comparable group for UI
    const group: ComparableGroup = {
      key: item.comparableGroupKey,
      label: item.comparableGroupKey.replace(/_/g, " "),
      items: [item],
      cheapest: item,
      bestValue: item,
      highestDiscount: null,
      trustedStore: null,
      affiliateOption: null,
    };

    return {
      item,
      auraMatchScore: score.auraMatchScore,
      priceValueScore: score.priceValueScore,
      freshnessScore: score.freshnessScore,
      finalRankScore: score.finalRankScore,
      reason: score.reason,
      linkedAuraLeak: score.linkedAuraLeak,
      stylingTip: score.stylingTip,
      priceWarning: score.priceWarning,
      dealLabel: score.dealLabel,
      comparisonGroup: group,
    };
  });

  // 10. Build comparable groups from full filtered set
  const comparisonGroups = buildComparableGroups(filtered);

  // 11. Freshness summary
  const freshnessSummary = buildFreshnessSummary(filtered);

  // 12. Filters used
  const filtersUsed: CommerceSearchInput = {
    ...input,
    styleDirection: styleDirection || undefined,
    auraLeakTags: auraLeakTags.length > 0 ? auraLeakTags : undefined,
    goal: goalTags.length > 0 ? goalTags[0] : undefined,
  };

  return {
    results,
    comparisonGroups,
    filtersUsed,
    freshnessSummary,
    catalogSource,
    totalResults: filtered.length,
  };
}

function freshnessOrder(status: string): number {
  const order: Record<string, number> = {
    fresh: 0,
    recent: 1,
    manual: 2,
    unknown: 3,
    stale: 4,
  };
  return order[status] ?? 5;
}

function getStoreTrustRank(storeKey: string): number {
  const ranks: Record<string, number> = {
    myntra: 0.9,
    amazon_fashion: 0.9,
    ajio: 0.85,
    flipkart_fashion: 0.85,
    tata_cliq: 0.8,
    nykaa_fashion: 0.75,
    hm_india: 0.7,
    snitch: 0.6,
    souled_store: 0.6,
    bewakoof: 0.55,
    meesho: 0.5,
    other: 0.3,
    narzo_manual: 0.3,
  };
  return ranks[storeKey] ?? 0.3;
}

function inferStyleFromQuery(queries: string[]): AuraStyleDirection | undefined {
  const styleMap: Record<string, AuraStyleDirection> = {
    "premium minimal": "premium_minimal",
    "dating warm": "dating_warm",
    "college casual": "college_casual",
    "corporate sharp": "corporate_sharp",
    "creator bold": "creator_bold",
    "urban aspirational": "urban_aspirational",
    "clean basic": "clean_basic",
    "soft luxury": "soft_luxury",
    "street smart": "street_smart",
    "ethnic clean": "ethnic_clean",
    "gym casual": "gym_casual",
    "understated confident": "understated_confident",
  };

  const q = queries.join(" ").toLowerCase();
  for (const [key, value] of Object.entries(styleMap)) {
    if (q.includes(key)) return value;
  }
  return undefined;
}

function inferAuraLeaksFromQuery(queries: string[]): AuraLeakTag[] {
  const leakMap: Record<string, AuraLeakTag> = {
    "weak lighting": "weak_lighting",
    "busy background": "busy_background",
    "weak clarity": "weak_clarity",
    "weak framing": "weak_framing",
    "outfit inconsistency": "outfit_inconsistency",
    "low premium signal": "low_premium_signal",
    "too plain": "too_plain",
    "color mismatch": "color_mismatch",
    "professional mismatch": "professional_mismatch",
    "dating warmth": "dating_warmth_missing",
    "creator energy": "creator_energy_missing",
    "over flex": "over_flex",
  };

  const q = queries.join(" ").toLowerCase();
  const found: AuraLeakTag[] = [];
  for (const [key, value] of Object.entries(leakMap)) {
    if (q.includes(key)) found.push(value);
  }
  return found;
}

function inferGoalsFromQuery(queries: string[]): string[] {
  const goalMap: Record<string, string> = {
    dating: "dating",
    office: "office",
    college: "college",
    casual: "casual",
    creator: "creator",
    gym: "gym",
    interview: "office",
    party: "casual",
    wedding: "casual",
    festival: "casual",
  };

  const q = queries.join(" ").toLowerCase();
  const found: string[] = [];
  for (const [key, value] of Object.entries(goalMap)) {
    if (q.includes(key)) found.push(value);
  }
  return [...new Set(found)];
}

function buildFreshnessSummary(items: CommerceSearchItem[]): FreshnessSummary {
  const counts = { fresh: 0, recent: 0, stale: 0, manual: 0, unknown: 0 };
  const warnings: string[] = [];

  for (const item of items) {
    const status = item.priceFreshness;
    if (status in counts) {
      counts[status as keyof typeof counts]++;
    }
  }

  if (counts.stale > 0) {
    warnings.push(`${counts.stale} product${counts.stale > 1 ? "s have" : " has"} stale prices — verify before buying`);
  }
  if (counts.manual > 0) {
    warnings.push(`${counts.manual} product${counts.manual > 1 ? "s use" : " uses"} manual MVP prices — not live`);
  }
  if (counts.unknown > 0) {
    warnings.push(`${counts.unknown} product${counts.unknown > 1 ? "s" : ""} with unknown price freshness`);
  }

  return {
    ...counts,
    total: items.length,
    warnings,
  };
}
