import type { CommerceSearchItem } from "@/types/commerceSearch";
import { getStoreTrustScore } from "@/config/storeTrustScores";

export function computeConfidenceScore(item: {
  sourceType: string;
  priceFreshness: string;
  storeKey: string;
  productUrl: string;
  price: number;
  mrp?: number | null;
  availabilityStatus: string;
}): number {
  let score = 50; // base

  // Source type weight (0-25)
  switch (item.sourceType) {
    case "official_api":
      score += 25;
      break;
    case "affiliate_csv":
    case "affiliate_json":
      score += 18;
      break;
    case "manual_csv":
    case "manual_json":
      score += 12;
      break;
    case "manual":
      score += 10;
      break;
    case "admin_entry":
      score += 15;
      break;
    default:
      score += 5;
  }

  // Freshness weight (0-20)
  switch (item.priceFreshness) {
    case "fresh":
      score += 20;
      break;
    case "recent":
      score += 12;
      break;
    case "manual":
      score += 8;
      break;
    case "unknown":
      score += 3;
      break;
    case "stale":
      score += 0;
      break;
    default:
      score += 3;
  }

  // Store trust weight (0-15)
  const trustScore = getStoreTrustScore(item.storeKey);
  score += Math.round(trustScore.trustWeight * 15);

  // Valid URL (0-10)
  if (item.productUrl && item.productUrl !== "#") {
    try {
      new URL(item.productUrl);
      score += 10;
    } catch {
      score += 3;
    }
  } else {
    score += 0;
  }

  // Valid price/MRP (0-15)
  if (item.price > 0) {
    score += 10;
    if (item.mrp && item.mrp > item.price) {
      score += 5;
    } else if (item.mrp && item.mrp === item.price) {
      score += 2;
    }
  }

  // Availability known (0-15)
  if (item.availabilityStatus === "available") {
    score += 15;
  } else if (item.availabilityStatus === "out_of_stock") {
    score += 5;
  } else {
    score += 8;
  }

  return Math.min(100, Math.max(0, score));
}

export function getConfidenceLabel(score: number): string {
  if (score >= 90) return "Very high confidence";
  if (score >= 75) return "High confidence";
  if (score >= 60) return "Good confidence";
  if (score >= 40) return "Moderate confidence";
  if (score >= 20) return "Low confidence";
  return "Very low confidence";
}

export function getConfidenceColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 25) return "text-orange-400";
  return "text-red-400";
}

export function recomputeConfidenceForItem(item: CommerceSearchItem): number {
  return computeConfidenceScore(item);
}
