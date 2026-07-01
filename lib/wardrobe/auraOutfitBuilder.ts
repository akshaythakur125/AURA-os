import type {
  AuraOutfitBundle,
  AuraCommerceRecommendation,
  AuraStyleDirection,
  AuraLeakTag,
  StoreKey,
  WardrobeCategory,
} from "@/types/commerce";
import { matchProductsToAura } from "./auraProductMatcher";
import type { StyleDiagnosisResult } from "@/types/commerce";

interface BuildBundlesOptions {
  auditId?: string;
  maxBudget?: number;
}

export function buildOutfitBundles(
  diagnosis: StyleDiagnosisResult,
  allRecommendations: AuraCommerceRecommendation[],
  options: BuildBundlesOptions = {}
): AuraOutfitBundle[] {
  const bundles: AuraOutfitBundle[] = [];

  // 1. ₹0 Fix Bundle — no purchase needed
  bundles.push(buildZeroFixBundle(diagnosis));

  // 2. Under ₹500
  const under500 = allRecommendations.filter(
    (r) => r.cheapestOffer.price <= 500 && r.buyPriority !== "avoid_for_now"
  );
  if (under500.length > 0) {
    bundles.push(buildBundle("under_500", "Under ₹500 — Quick Fix Items", diagnosis, under500, "Under ₹500", options.auditId));
  }

  // 3. Under ₹2,000
  const under2000 = allRecommendations.filter(
    (r) => r.cheapestOffer.price <= 2000 && r.buyPriority !== "avoid_for_now"
  );
  if (under2000.length > 0) {
    bundles.push(buildBundle("under_2000", "Under ₹2,000 — Core Upgrade", diagnosis, under2000, "Under ₹2,000", options.auditId));
  }

  // 4. Under ₹5,000 — mini outfit
  const under5000 = allRecommendations.filter(
    (r) => r.cheapestOffer.price <= 5000 && r.buyPriority !== "avoid_for_now"
  );
  if (under5000.length > 0) {
    bundles.push(buildBundle("under_5000", "Under ₹5,000 — Mini Outfit", diagnosis, under5000, "Under ₹5,000", options.auditId));
  }

  // 5. Under ₹10,000 — full outfit
  const under10000 = allRecommendations.filter(
    (r) => r.cheapestOffer.price <= 10000 && r.buyPriority !== "avoid_for_now"
  );
  if (under10000.length > 0) {
    bundles.push(buildBundle("under_10000", "Under ₹10,000 — Full Outfit", diagnosis, under10000, "Under ₹10,000", options.auditId));
  }

  // 6. Premium (₹25,000+)
  const premium = allRecommendations.filter((r) => r.buyPriority === "buy_first");
  if (premium.length > 0) {
    bundles.push(buildBundle("premium", "Premium Wardrobe Direction", diagnosis, premium, "₹25,000+", options.auditId));
  }

  return bundles;
}

function buildZeroFixBundle(diagnosis: StyleDiagnosisResult): AuraOutfitBundle {
  return {
    id: "fix_0",
    title: "₹0 Fix — No Purchase Needed",
    styleDirection: diagnosis.styleDirection,
    budgetRange: "₹0",
    primaryAuraLeak: diagnosis.primaryAuraLeak,
    items: [],
    totalCheapestPrice: 0,
    totalBestValuePrice: 0,
    storeMix: [],
    expectedAuraShift: "Better lighting, cleaner background, intentional framing",
    whyThisBundleWorks: "The highest-impact improvements cost nothing: clean your camera lens, find better natural lighting, declutter your background, and wear a clean well-fitted outfit you already own.",
    whatToAvoid: "Do not buy new clothes before fixing lighting and background. New clothes in bad photos still look bad.",
    finalAdvice: "Take 10 test photos with good window light, a clean background, and your best existing outfit. Compare with your current photos.",
    createdAt: new Date().toISOString(),
  };
}

function buildBundle(
  id: string,
  title: string,
  diagnosis: StyleDiagnosisResult,
  recommendations: AuraCommerceRecommendation[],
  budgetRange: string,
  auditId?: string
): AuraOutfitBundle {
  // Pick top items for each category
  const categoryOrder: WardrobeCategory[] = [
    "tshirt", "shirt", "overshirt", "jeans", "chinos", "trousers",
    "sneakers", "watch", "belt", "jacket", "hoodie", "sunglasses",
    "kurta", "perfume", "grooming", "photo_accessory", "background_item",
  ];

  const selected: AuraCommerceRecommendation[] = [];
  const usedCategories = new Set<WardrobeCategory>();

  // Pick best item per category
  const sorted = [...recommendations].sort((a, b) => b.matchScore - a.matchScore);
  for (const rec of sorted) {
    if (!usedCategories.has(rec.product.category)) {
      selected.push(rec);
      usedCategories.add(rec.product.category);
    }
  }

  const totalCheapest = selected.reduce((sum, r) => sum + r.cheapestOffer.price, 0);
  const totalBestValue = selected.reduce((sum, r) => sum + r.bestValueOffer.price, 0);

  const storeMix = [...new Set(selected.map((r) => r.cheapestOffer.storeKey))];

  return {
    id: `bundle_${id}`,
    title,
    auditId,
    styleDirection: diagnosis.styleDirection,
    budgetRange,
    primaryAuraLeak: diagnosis.primaryAuraLeak,
    items: selected,
    totalCheapestPrice: totalCheapest,
    totalBestValuePrice: totalBestValue,
    storeMix,
    expectedAuraShift: "Cleaner visual signal, more intentional look",
    whyThisBundleWorks: `Selected to address your primary gap: ${diagnosis.primaryAuraLeak.replace(/_/g, " ")}. Each item fills a specific role in your outfit.`,
    whatToAvoid: "Do not buy all items at once. Start with the highest-scored item and build gradually.",
    finalAdvice: "Check prices across all stores before buying. The cheapest option is not always the best value.",
    createdAt: new Date().toISOString(),
  };
}
