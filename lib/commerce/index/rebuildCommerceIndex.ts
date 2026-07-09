import type { PriceSnapshot } from "@/types/priceSnapshot";
import { getSearchIndex, saveSearchIndex, saveSearchIndexMeta } from "@/lib/storage/commerceSearchStore";
import { recomputeConfidenceForItem } from "@/lib/commerce/prices/priceConfidence";
import { buildSearchTokensForItem } from "@/lib/commerce/search/tokenizeProduct";
import { buildComparableGroupKey } from "@/lib/commerce/search/similarProductGrouping";
import { addPriceSnapshot } from "@/lib/commerce/prices/priceSnapshotStore";
import { computeFreshnessFromTimestamp } from "@/config/priceFreshnessRules";

export interface RebuildResult {
  totalProcessed: number;
  tokenized: number;
  grouped: number;
  freshnessUpdated: number;
  confidenceUpdated: number;
  snapshotsCreated: number;
  warnings: string[];
}

export async function rebuildFullIndex(): Promise<RebuildResult> {
  const warnings: string[] = [];
  const items = getSearchIndex();

  if (items.length === 0) {
    return {
      totalProcessed: 0, tokenized: 0, grouped: 0,
      freshnessUpdated: 0, confidenceUpdated: 0, snapshotsCreated: 0,
      warnings: ["No items in search index to rebuild"],
    };
  }

  let tokenized = 0;
  let grouped = 0;
  let freshnessUpdated = 0;
  let confidenceUpdated = 0;
  let snapshotsCreated = 0;

  const updatedItems = items.map((item) => {
    const updated = { ...item };

    // Recalculate search tokens
    const existingTokens = updated.searchTokens;
    updated.searchTokens = buildSearchTokensForItem(updated);
    if (JSON.stringify(existingTokens) !== JSON.stringify(updated.searchTokens)) {
      tokenized++;
    }

    // Recalculate comparable group key
    const existingKey = updated.comparableGroupKey;
    updated.comparableGroupKey = buildComparableGroupKey(updated);
    if (existingKey !== updated.comparableGroupKey) {
      grouped++;
    }

    // Recalculate freshness
    const existingFreshness = updated.priceFreshness;
    if (updated.lastCheckedAt) {
      updated.priceFreshness = computeFreshnessFromTimestamp(updated.lastCheckedAt);
    }
    if (existingFreshness !== updated.priceFreshness) {
      freshnessUpdated++;
    }

    // Recalculate discount from price/MRP
    if (updated.mrp && updated.mrp > updated.price) {
      updated.discountPercent = Math.round(((updated.mrp - updated.price) / updated.mrp) * 100);
    } else if (updated.mrp && updated.mrp <= updated.price) {
      updated.discountPercent = undefined;
    }

    // Recalculate confidence score
    const existingConfidence = updated.confidenceScore;
    updated.confidenceScore = recomputeConfidenceForItem(updated);
    if (existingConfidence !== updated.confidenceScore) {
      confidenceUpdated++;
    }

    // Update timestamp
    updated.updatedAt = new Date().toISOString();

    // Create price snapshot
    try {
      const snapshot: PriceSnapshot = {
        id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        productId: updated.sourceProductId,
        offerId: updated.id,
        storeKey: updated.storeKey,
        price: updated.price,
        mrp: updated.mrp,
        discountPercent: updated.discountPercent,
        sourceType: updated.sourceType,
        sourceName: updated.sourceName,
        checkedAt: new Date().toISOString(),
        freshness: updated.priceFreshness,
        confidenceScore: updated.confidenceScore,
      };
      addPriceSnapshot(snapshot);
      snapshotsCreated++;
    } catch {
      // snapshot creation is optional
    }

    return updated;
  });

  // Save updated index
  saveSearchIndex(updatedItems);
  saveSearchIndexMeta({
    indexedCount: updatedItems.length,
    catalogSource: "rebuild",
    builtAt: new Date().toISOString(),
  });

  return {
    totalProcessed: updatedItems.length,
    tokenized,
    grouped,
    freshnessUpdated,
    confidenceUpdated,
    snapshotsCreated,
    warnings,
  };
}

export async function rebuildAndSync(
  adminCode?: string
): Promise<{ success: boolean; result?: RebuildResult; error?: string }> {
  // Client-side calls are already gated by the calling admin page's own
  // authenticated session; only the server-side (API route) path needs to
  // check a real admin code here, since that's the actual network boundary.
  if (typeof window === "undefined") {
    const envCode = process.env.ADMIN_ACCESS_CODE || process.env.LOCAL_ADMIN_CODE || "ADMINDEMO";
    if (adminCode !== envCode) {
      return { success: false, error: "Unauthorized" };
    }
  }

  try {
    const result = await rebuildFullIndex();
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Rebuild failed" };
  }
}
