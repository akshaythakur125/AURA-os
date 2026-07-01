import type { AuraCommercePlan, AuraCommerceRecommendation, StyleDiagnosisResult } from "@/types/commerce";
import { diagnoseStyle, type DiagnosisInput } from "./auraStyleDiagnosis";
import { matchProductsToAura, type MatchOptions } from "./auraProductMatcher";
import { buildOutfitBundles } from "./auraOutfitBuilder";
import { trackCommerceView } from "@/lib/storage/commerceClickStore";

export function buildAuraCommercePlan(
  input: DiagnosisInput,
  options: MatchOptions = {}
): AuraCommercePlan {
  // 1. Diagnose
  const diagnosis = diagnoseStyle(input);

  // 2. Match products
  const recommendations = matchProductsToAura(diagnosis, options);

  // 3. Build bundles
  const bundles = buildOutfitBundles(diagnosis, recommendations);

  // 4. Find special picks
  const buyFirst = recommendations.filter((r) => r.buyPriority === "buy_first");
  const buyLater = recommendations.filter((r) => r.buyPriority === "buy_later");
  const avoidNow = recommendations.filter((r) => r.buyPriority === "avoid_for_now");

  const bestSingleUpgrade = buyFirst[0] || recommendations[0] || null;
  const cheapestUsefulUpgrade = [...buyFirst, ...buyLater]
    .sort((a, b) => a.cheapestOffer.price - b.cheapestOffer.price)[0] || null;
  const highestAuraImpactUpgrade = buyFirst
    .sort((a, b) => b.auraImpactScore - a.auraImpactScore)[0] || null;

  // 5. Track view
  trackCommerceView();

  return {
    diagnosis,
    topRecommendations: recommendations.slice(0, 10),
    outfitBundles: bundles,
    bestSingleUpgrade,
    cheapestUsefulUpgrade,
    highestAuraImpactUpgrade,
    whatNotToBuy: avoidNow,
    finalAdvice: getFinalAdvice(diagnosis, bestSingleUpgrade, cheapestUsefulUpgrade),
  };
}

function getFinalAdvice(
  diagnosis: StyleDiagnosisResult,
  bestSingle?: AuraCommerceRecommendation | null,
  cheapest?: AuraCommerceRecommendation | null
): string {
  const parts: string[] = [];

  parts.push(`Your primary visual gap is "${diagnosis.primaryAuraLeak.replace(/_/g, " ")}".`);
  parts.push(`We recommend the "${diagnosis.styleDirection.replace(/_/g, " ")}" direction for your context.`);

  if (bestSingle) {
    parts.push(`Highest-impact upgrade: ${bestSingle.product.title} (₹${bestSingle.cheapestOffer.price} at ${bestSingle.cheapestOffer.storeName}).`);
  }
  if (cheapest && cheapest !== bestSingle) {
    parts.push(`Cheapest useful upgrade: ${cheapest.product.title} at ₹${cheapest.cheapestOffer.price}.`);
  }

  parts.push("Compare prices across stores before buying. The best value is not always the cheapest.");
  parts.push("Prices are from AuraCheck's MVP catalog and may not be live. Verify on store before buying.");

  return parts.join(" ");
}
