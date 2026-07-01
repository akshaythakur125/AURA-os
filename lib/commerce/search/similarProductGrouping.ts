import type { CommerceSearchItem, ComparableGroup } from "@/types/commerceSearch";
import { getStoreInfo } from "@/config/storeDirectory";

const COLOR_FAMILIES: Record<string, string[]> = {
  black: ["black", "charcoal", "ebony", "jet black", "dark"],
  white: ["white", "ivory", "cream", "off-white", "pure white"],
  blue: ["blue", "navy", "royal blue", "sky blue", "indigo", "denim"],
  gray: ["gray", "grey", "ash", "smoke", "silver"],
  brown: ["brown", "tan", "camel", "beige", "khaki", "taupe", "coffee"],
  green: ["green", "olive", "forest", "emerald", "sage", "army"],
  red: ["red", "burgundy", "maroon", "crimson", "wine", "brick"],
  multicolor: ["multicolor", "pattern", "print", "floral", "striped", "checked", "plaid"],
  neutral: ["neutral", "beige", "cream", "white", "black", "gray"],
};

function extractMainColorFamily(colorTags: string[]): string {
  if (!colorTags || colorTags.length === 0) return "neutral";

  for (const [family, variants] of Object.entries(COLOR_FAMILIES)) {
    for (const tag of colorTags) {
      const lower = tag.toLowerCase();
      if (variants.some((v) => lower.includes(v) || v.includes(lower))) {
        return family;
      }
    }
  }

  return colorTags[0]?.toLowerCase() || "neutral";
}

const STYLE_DIRECTION_GROUPS: Record<string, string> = {
  clean_basic: "clean_basic",
  premium_minimal: "premium_minimal",
  urban_aspirational: "urban_aspirational",
  soft_luxury: "soft_luxury",
  creator_bold: "creator_bold",
  college_casual: "college_casual",
  corporate_sharp: "corporate_sharp",
  dating_warm: "dating_warm",
  understated_confident: "understated_confident",
  street_smart: "street_smart",
  ethnic_clean: "ethnic_clean",
  gym_casual: "gym_casual",
};

function getPrimaryStyleDirection(styleTags: string[]): string {
  if (!styleTags || styleTags.length === 0) return "versatile";
  for (const tag of styleTags) {
    if (STYLE_DIRECTION_GROUPS[tag]) return tag;
  }
  return styleTags[0].replace(/_/g, "_");
}

const FIT_GROUPS: Record<string, string> = {
  regular: "regular",
  slim: "slim",
  loose: "loose",
  oversized: "loose",
  relaxed: "loose",
  skinny: "slim",
  tailored: "slim",
};

function getFitGroup(fitTags: string[]): string {
  if (!fitTags || fitTags.length === 0) return "regular";
  for (const tag of fitTags) {
    const lower = tag.toLowerCase();
    if (FIT_GROUPS[lower]) return FIT_GROUPS[lower];
  }
  return "regular";
}

/**
 * Build a comparable group key for an item.
 * Format: category:color:styleDirection:useCase:fit
 * Example: shirt:white:corporate_sharp:office:slim
 */
export function buildComparableGroupKey(item: {
  category: string;
  colorTags?: string[];
  styleTags?: string[];
  goalTags?: string[];
  fitTags?: string[];
  subCategory?: string;
  price?: number;
}): string {
  const category = item.category || "unknown";
  const color = extractMainColorFamily(item.colorTags || []);
  const style = getPrimaryStyleDirection(item.styleTags || []);
  const useCase = item.goalTags?.[0] || "everyday";
  const fit = getFitGroup(item.fitTags || []);

  return `${category}:${color}:${style}:${useCase}:${fit}`.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Build comparable groups from a set of search items.
 * Items with the same comparableGroupKey are grouped together.
 */
export function buildComparableGroups(items: CommerceSearchItem[]): ComparableGroup[] {
  const groups = new Map<string, CommerceSearchItem[]>();

  for (const item of items) {
    const key = item.comparableGroupKey;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  const result: ComparableGroup[] = [];

  for (const [key, groupItems] of groups.entries()) {
    if (groupItems.length < 1) continue;

    const sorted = [...groupItems].sort((a, b) => a.price - b.price);
    const cheapest = sorted[0];
    const highestDiscount = sorted.reduce((best, curr) =>
      (curr.discountPercent || 0) > (best?.discountPercent || 0) ? curr : best,
    sorted[0]);

    // Best value: score based on price + trust + discount + freshness
    const bestValue = sorted.reduce((best, curr) => {
      const bestScore = computeGroupValueScore(best, sorted);
      const currScore = computeGroupValueScore(curr, sorted);
      return currScore > bestScore ? curr : best;
    }, sorted[0]);

    // Trusted store option
    const trustedStore = sorted.reduce((best, curr) => {
      const bestTrust = getStoreInfo(curr.storeKey)?.trustWeight || 0.3;
      const currTrust = getStoreInfo(curr.storeKey)?.trustWeight || 0.3;
      return currTrust > bestTrust ? curr : best;
    }, sorted[0]);

    // Affiliate option
    const affiliateOption = sorted.find((s) => s.isAffiliate) || null;

    // Build label
    const parts = key.split(":");
    const label = parts.length >= 3
      ? `${parts[1]} ${parts[0]} — ${parts[2].replace(/_/g, " ")}`
      : key.replace(/_/g, " ");

    result.push({
      key,
      label,
      items: sorted,
      cheapest,
      bestValue,
      highestDiscount: highestDiscount.discountPercent ? highestDiscount : null,
      trustedStore,
      affiliateOption,
    });
  }

  // Sort by group size (larger groups first), then by cheapest price
  result.sort((a, b) => {
    if (b.items.length !== a.items.length) return b.items.length - a.items.length;
    return (a.cheapest?.price || 0) - (b.cheapest?.price || 0);
  });

  return result;
}

function computeGroupValueScore(item: CommerceSearchItem, group: CommerceSearchItem[]): number {
  const trustWeight = getStoreInfo(item.storeKey)?.trustWeight || 0.3;

  const maxPrice = Math.max(...group.map((x) => x.price));
  const minPrice = Math.min(...group.map((x) => x.price));
  const priceRange = maxPrice - minPrice || 1;
  const priceScore = 1 - (item.price - minPrice) / priceRange;

  const discountScore = item.discountPercent ? item.discountPercent / 100 : 0;
  const availabilityScore = item.availabilityStatus === "available" ? 1 : 0.3;

  const freshnessScore: Record<string, number> = {
    fresh: 1, recent: 0.7, manual: 0.5, unknown: 0.3, stale: 0.1,
  };

  return (
    priceScore * 0.35 +
    trustWeight * 0.25 +
    discountScore * 0.2 +
    (freshnessScore[item.priceFreshness] ?? 0.3) * 0.1 +
    availabilityScore * 0.1
  );
}
