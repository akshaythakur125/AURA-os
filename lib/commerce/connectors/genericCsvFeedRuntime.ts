import type { ConnectorConfig, ConnectorStatus, ConnectorRunResult, ConnectorTestResult } from "@/types/connectorRuntime";
import type { ConnectorRuntime } from "./connectorRegistry";
import { buildConnectorStatus, createSkippedResult } from "./connectorRegistry";
import { detectFeedFormat, parseCsvToRows } from "@/lib/commerce/feeds/detectFeedFormat";
import { mapAllRows } from "@/lib/commerce/feeds/mapFeedRowToProduct";
import { normalizeRawProduct } from "@/lib/commerce/search/normalizeProduct";
import { getSearchIndex, saveSearchIndex, saveSearchIndexMeta } from "@/lib/storage/commerceSearchStore";
import { computeFreshnessFromSourceType, formatLastCheckedText } from "@/config/priceFreshnessRules";
import { addPriceSnapshot } from "@/lib/commerce/prices/priceSnapshotStore";

const CONFIG: ConnectorConfig = {
  key: "generic_csv_feed",
  displayName: "Generic CSV Feed",
  provider: "generic",
  sourceType: "csv",
  envVars: ["COMMERCE_GENERIC_CSV_FEED_URL"],
  supportsTest: true,
  supportsRefresh: true,
  supportsPriceRefresh: true,
  supportsProductImport: true,
  isOfficial: false,
  publicNotes: "Fetches products from a configured CSV feed URL. Field mapping is auto-detected.",
  safetyNotes: "Feed URL must be configured server-side. Only https:// URLs are accepted.",
};

export class GenericCsvFeedRuntime implements ConnectorRuntime {
  config = CONFIG;

  getStatus(): ConnectorStatus {
    return buildConnectorStatus(CONFIG);
  }

  async test(): Promise<ConnectorTestResult> {
    const feedUrl = process.env.COMMERCE_GENERIC_CSV_FEED_URL;
    if (!feedUrl) {
      return { success: false, message: "COMMERCE_GENERIC_CSV_FEED_URL not configured" };
    }

    try {
      const response = await fetch(feedUrl, {
        signal: AbortSignal.timeout(10000),
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return { success: false, message: `Feed returned HTTP ${response.status}: ${response.statusText}` };
      }

      const text = await response.text();
      const detection = detectFeedFormat(text);

      return {
        success: detection.format !== "unknown",
        message: `Detected ${detection.format} with ${detection.rowCount} rows, ${detection.columnCount} columns`,
        details: {
          format: detection.format,
          rowCount: detection.rowCount,
          columnCount: detection.columnCount,
          confidence: detection.confidence,
          mappings: detection.detectedMapping.map((m) => `${m.sourceColumn} → ${m.targetField}`),
        },
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Failed to fetch feed",
      };
    }
  }

  async refresh(): Promise<ConnectorRunResult> {
    const feedUrl = process.env.COMMERCE_GENERIC_CSV_FEED_URL;
    if (!feedUrl) {
      return createSkippedResult("generic_csv_feed", "COMMERCE_GENERIC_CSV_FEED_URL not configured");
    }

    const startedAt = new Date().toISOString();
    try {
      const response = await fetch(feedUrl, {
        signal: AbortSignal.timeout(30000),
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return {
          connectorKey: "generic_csv_feed", status: "failed",
          importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
          warnings: [], errors: [`Feed returned HTTP ${response.status}`],
          startedAt, completedAt: new Date().toISOString(),
        };
      }

      const text = await response.text();
      const { rows } = parseCsvToRows(text);
      if (rows.length === 0) {
        return createSkippedResult("generic_csv_feed", "Feed is empty");
      }

      const detection = detectFeedFormat(text);
      const { valid, invalid } = mapAllRows(rows, detection.detectedMapping);

      if (valid.length === 0) {
        return {
          connectorKey: "generic_csv_feed", status: "failed",
          importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: invalid.length, priceChangesCount: 0,
          warnings: [], errors: ["No valid rows found"],
          startedAt, completedAt: new Date().toISOString(),
        };
      }

      return this.importValidRows(valid, invalid.length, startedAt);
    } catch (err) {
      return {
        connectorKey: "generic_csv_feed", status: "failed",
        importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
        warnings: [], errors: [err instanceof Error ? err.message : "Unknown error"],
        startedAt, completedAt: new Date().toISOString(),
      };
    }
  }

  private importValidRows(valid: Array<{ title: string; sourceProductId?: string; category?: string; storeKey: string; storeName?: string; brand?: string; price: number; mrp?: number; productUrl: string; affiliateUrl?: string; imageUrl?: string; availabilityStatus?: string; lastCheckedAt?: string }>, invalidCount: number, startedAt: string): ConnectorRunResult {
    const currentIndex = getSearchIndex();
    let importedCount = 0, updatedCount = 0, priceChangesCount = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    const freshness = computeFreshnessFromSourceType("affiliate_csv");
    const lastCheckedText = formatLastCheckedText(new Date().toISOString());

    for (const row of valid) {
      try {
        const searchItem = normalizeRawProduct({
          sourceProductId: row.sourceProductId || `csvfeed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          normalizedTitle: row.title.toLowerCase().trim(),
          originalTitle: row.title,
          category: row.category || "tshirt",
          storeKey: row.storeKey as "other",
          storeName: row.storeName || row.storeKey,
          brand: row.brand,
          price: row.price,
          mrp: row.mrp,
          productUrl: row.productUrl,
          affiliateUrl: row.affiliateUrl,
          imageUrl: row.imageUrl,
          availabilityStatus: row.availabilityStatus,
          sourceType: "affiliate_csv",
          sourceName: "CSV Feed",
          lastCheckedAt: new Date().toISOString(),
        });

        if (!searchItem) {
          errors.push(`Failed to normalize: ${row.title}`);
          continue;
        }

        const existingIdx = currentIndex.findIndex(
          (item) => item.sourceProductId === searchItem.sourceProductId ||
            (item.storeKey === searchItem.storeKey && item.normalizedTitle === searchItem.normalizedTitle)
        );

        if (existingIdx >= 0) {
          const prevPrice = currentIndex[existingIdx].price;
          currentIndex[existingIdx] = { ...currentIndex[existingIdx], price: searchItem.price, mrp: searchItem.mrp, discountPercent: searchItem.discountPercent, productUrl: searchItem.productUrl, affiliateUrl: searchItem.affiliateUrl, priceFreshness: freshness, lastCheckedText, updatedAt: new Date().toISOString() };
          updatedCount++;
          if (prevPrice !== searchItem.price) priceChangesCount++;
        } else {
          currentIndex.push({ ...searchItem, priceFreshness: freshness, lastCheckedText });
          importedCount++;
        }
      } catch (err) {
        errors.push(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
      }
    }

    saveSearchIndex(currentIndex);
    saveSearchIndexMeta({ indexedCount: currentIndex.length, catalogSource: "csv_feed", builtAt: new Date().toISOString() });

    // Save price snapshots
    for (const item of currentIndex.slice(-valid.length)) {
      try {
        addPriceSnapshot({
          id: `csv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          productId: item.sourceProductId,
          offerId: item.id,
          storeKey: item.storeKey,
          price: item.price,
          mrp: item.mrp,
          discountPercent: item.discountPercent,
          sourceType: "affiliate_csv",
          sourceName: "CSV Feed",
          checkedAt: new Date().toISOString(),
          freshness: freshness,
          confidenceScore: item.confidenceScore,
        });
      } catch { /* skip */ }
    }

    return {
      connectorKey: "generic_csv_feed",
      status: errors.length > 0 ? "partial" : "success",
      importedCount, updatedCount, skippedCount: invalidCount, invalidCount, priceChangesCount,
      warnings, errors,
      startedAt, completedAt: new Date().toISOString(),
    };
  }

  private getAuthHeaders(): Record<string, string> {
    const token = process.env.COMMERCE_GENERIC_FEED_TOKEN;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
