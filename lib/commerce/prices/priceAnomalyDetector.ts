import type { CommerceSearchItem } from "@/types/commerceSearch";
import type { DataQualityWarning, DataQualityWarningType } from "@/types/dataQuality";
import { getStoreTrustScore } from "@/config/storeTrustScores";
import { getPriceChange } from "./priceSnapshotStore";

export interface AnomalyResult {
  item: CommerceSearchItem;
  warnings: DataQualityWarning[];
}

export function detectPriceAnomalies(items: CommerceSearchItem[]): AnomalyResult[] {
  const results: AnomalyResult[] = [];

  for (const item of items) {
    const warnings = checkItemAnomalies(item, items);
    if (warnings.length > 0) {
      results.push({ item, warnings });
    }
  }

  return results;
}

function checkItemAnomalies(
  item: CommerceSearchItem,
  allItems: CommerceSearchItem[]
): DataQualityWarning[] {
  const warnings: DataQualityWarning[] = [];

  // Price <= 0
  if (item.price <= 0) {
    warnings.push(createWarning(item, "price_zero", "error", `Price is ${item.price} (zero or negative)`));
  }

  // MRP < Price
  if (item.mrp !== undefined && item.mrp !== null && item.mrp > 0 && item.price > item.mrp) {
    warnings.push(createWarning(item, "mrp_less_than_price", "warning",
      `Price (₹${item.price}) exceeds MRP (₹${item.mrp})`));
  }

  // Discount > 80%
  if (item.discountPercent && item.discountPercent > 80) {
    warnings.push(createWarning(item, "discount_too_high", "warning",
      `Suspicious discount: ${item.discountPercent}% off`));
  }

  // Check for suspicious discount patterns (50% off across many products from same source)
  if (item.discountPercent === 50) {
    const sameSourceItems = allItems.filter(
      (i) => i.sourceName === item.sourceName && i.discountPercent === 50
    );
    if (sameSourceItems.length >= 5) {
      warnings.push(createWarning(item, "suspicious_discount_pattern", "info",
        `50% off across ${sameSourceItems.length} products from ${item.sourceName} — verify`));
    }
  }

  // Sudden price change
  try {
    const productId = item.sourceProductId;
    const change = getPriceChange(productId, item.id);
    if (change) {
      if (change.direction === "down" && change.priceDiffPercent > 70) {
        warnings.push(createWarning(item, "sudden_price_drop", "warning",
          `Price dropped ${change.priceDiffPercent}% from ₹${change.previousPrice} to ₹${change.currentPrice}`));
      }
      if (change.direction === "up" && change.priceDiffPercent > 200) {
        warnings.push(createWarning(item, "sudden_price_rise", "warning",
          `Price rose ${change.priceDiffPercent}% from ₹${change.previousPrice} to ₹${change.currentPrice}`));
      }
    }
  } catch {
    // Snapshot store may not be available
  }

  // Missing URL
  if (!item.productUrl || item.productUrl === "#") {
    warnings.push(createWarning(item, "missing_url", "error", "Missing product URL"));
  }

  // Broken URL
  if (item.productUrl && item.productUrl !== "#") {
    try { new URL(item.productUrl); } catch {
      warnings.push(createWarning(item, "broken_url", "warning", `Invalid URL: ${item.productUrl}`));
    }
  }

  // Unknown store
  const storeTrust = getStoreTrustScore(item.storeKey);
  if (storeTrust.storeKey === "other" || storeTrust.storeKey === "narzo_manual") {
    if (storeTrust.storeKey === "other") {
      warnings.push(createWarning(item, "unknown_store", "info", `Unknown store key: ${item.storeKey}`));
    }
  }

  // Stale price
  if (item.priceFreshness === "stale") {
    warnings.push(createWarning(item, "stale_price", "warning",
      `Stale price — last checked: ${item.lastCheckedText}`));
  }

  // Missing affiliate link
  if (!item.affiliateUrl || item.affiliateUrl === "#") {
    if (item.productUrl && item.productUrl !== "#") {
      warnings.push(createWarning(item, "missing_affiliate_link", "info", "Missing affiliate URL"));
    }
  }

  // Low confidence
  if (item.confidenceScore < 40) {
    warnings.push(createWarning(item, "low_confidence", "warning",
      `Low confidence score: ${item.confidenceScore}/100`));
  }

  return warnings;
}

export function getAnomalySummary(items: CommerceSearchItem[]): {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
} {
  const anomalies = detectPriceAnomalies(items);
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  for (const { warnings } of anomalies) {
    for (const w of warnings) {
      byType[w.warningType] = (byType[w.warningType] || 0) + 1;
      bySeverity[w.severity] = (bySeverity[w.severity] || 0) + 1;
    }
  }

  return {
    total: anomalies.length,
    byType,
    bySeverity,
  };
}

function createWarning(
  item: CommerceSearchItem,
  warningType: DataQualityWarningType,
  severity: "error" | "warning" | "info",
  message: string
): DataQualityWarning {
  return {
    productId: item.sourceProductId,
    offerId: item.id,
    warningType,
    severity,
    message,
    createdAt: new Date().toISOString(),
  };
}
