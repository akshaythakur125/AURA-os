import type {
  CommerceProduct,
  AuraCommerceRecommendation,
  AuraLeakTag,
  AuraStyleDirection,
  WardrobeCategory,
  StyleDiagnosisResult,
} from "@/types/commerce";
import { WARDROBE_CATALOG, getProductsByCategory, getProductsByLeakTag, getProductsByStyleDirection } from "@/config/auraWardrobeCatalog";
import { buildRecommendation } from "@/lib/commerce/priceComparison";

export interface MatchOptions {
  maxResults?: number;
  maxBudget?: number;
  includeSponsored?: boolean;
  includeAvoidForNow?: boolean;
}

export function matchProductsToAura(
  diagnosis: StyleDiagnosisResult,
  options: MatchOptions = {}
): AuraCommerceRecommendation[] {
  const {
    maxResults = 20,
    maxBudget,
    includeSponsored = true,
    includeAvoidForNow = false,
  } = options;

  // Score all products
  const scored = WARDROBE_CATALOG
    .filter((p) => p.isActive)
    .filter((p) => includeSponsored || !p.isSponsored)
    .map((product) => scoreProduct(product, diagnosis, maxBudget))
    .filter((s): s is { product: CommerceProduct; score: number; leakMatch: boolean; styleMatch: boolean; categoryMatch: boolean; reason: string; buyPriority: "buy_first" | "buy_later" | "avoid_for_now" } => s !== null)
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, maxResults);

  const recommendations: AuraCommerceRecommendation[] = [];
  for (const item of top) {
    if (!includeAvoidForNow && item.buyPriority === "avoid_for_now") continue;

    const rec = buildRecommendation(
      item.product,
      item.score,
      item.score,
      item.reason,
      diagnosis.primaryAuraLeak,
      item.buyPriority
    );
    if (rec) recommendations.push(rec);
  }

  return recommendations;
}

function scoreProduct(
  product: CommerceProduct,
  diagnosis: StyleDiagnosisResult,
  maxBudget?: number
): {
  product: CommerceProduct;
  score: number;
  leakMatch: boolean;
  styleMatch: boolean;
  categoryMatch: boolean;
  reason: string;
  buyPriority: "buy_first" | "buy_later" | "avoid_for_now";
} | null {
  // Skip products with no offers
  if (!product.offers || product.offers.length === 0) return null;

  // Budget filter
  if (maxBudget) {
    const minPrice = Math.min(...product.offers.map((o) => o.price));
    if (minPrice > maxBudget) return null;
  }

  let score = 0;
  let leakMatch = false;
  let styleMatch = false;
  let categoryMatch = false;
  const reasons: string[] = [];

  // 1. Leak match (30%)
  const leakScore = product.auraLeakTags.includes(diagnosis.primaryAuraLeak) ? 30 : 0;
  if (leakScore > 0) {
    leakMatch = true;
    reasons.push("Targets your specific aura gap");
  }
  score += leakScore;

  // 2. Style/goal match (25%)
  const styleScore = product.styleDirections.includes(diagnosis.styleDirection) ? 25 : 0;
  if (styleScore > 0) {
    styleMatch = true;
    reasons.push("Matches your style direction");
  }
  score += styleScore;

  // 3. Category priority (20%)
  const isRecommended = diagnosis.recommendedCategories.includes(product.category);
  const isAvoided = diagnosis.avoidCategories.includes(product.category);
  const categoryScore = isRecommended ? 20 : isAvoided ? -20 : 5;
  if (isRecommended) {
    categoryMatch = true;
    reasons.push("Recommended category for your gap");
  }
  score += categoryScore;

  // 4. Budget fit (15%)
  const minOffer = Math.min(...product.offers.map((o) => o.price));
  const budgetScore = minOffer <= 500 ? 15 : minOffer <= 2000 ? 12 : minOffer <= 5000 ? 8 : minOffer <= 10000 ? 4 : 2;
  score += budgetScore;

  // 5. Price value (10%)
  const priceRange = Math.max(...product.offers.map((o) => o.price)) - minOffer;
  const valueScore = priceRange > 0 ? 10 : 5;
  score += valueScore;

  // 6. Sponsored boost (max 3%, only if already relevant)
  if (product.isSponsored && leakScore > 0) {
    score += 3;
  }

  // Determine buy priority
  let buyPriority: "buy_first" | "buy_later" | "avoid_for_now" = "buy_later";
  if (isAvoided) {
    buyPriority = "avoid_for_now";
  } else if (leakMatch && styleMatch && score >= 50) {
    buyPriority = "buy_first";
  } else if (score >= 30) {
    buyPriority = "buy_later";
  }

  const reason = reasons.length > 0 ? reasons.join(". ") : "Relevant product for your aura profile";

  return {
    product,
    score: Math.min(100, score),
    leakMatch,
    styleMatch,
    categoryMatch,
    reason,
    buyPriority,
  };
}
