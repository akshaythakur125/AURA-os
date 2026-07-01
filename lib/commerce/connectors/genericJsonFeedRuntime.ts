import type { ConnectorConfig, ConnectorStatus, ConnectorRunResult, ConnectorTestResult } from "@/types/connectorRuntime";
import type { ConnectorRuntime } from "./connectorRegistry";
import { buildConnectorStatus, createSkippedResult } from "./connectorRegistry";
import { detectFeedFormat } from "@/lib/commerce/feeds/detectFeedFormat";
import { mapFeedRowToProduct } from "@/lib/commerce/feeds/mapFeedRowToProduct";
import { detectFieldMapping } from "@/config/feedFieldMappings";
import { normalizeRawProduct } from "@/lib/commerce/search/normalizeProduct";
import { getSearchIndex, saveSearchIndex, saveSearchIndexMeta } from "@/lib/storage/commerceSearchStore";
import { computeFreshnessFromSourceType, formatLastCheckedText } from "@/config/priceFreshnessRules";


const CONFIG: ConnectorConfig = {
  key: "generic_json_feed",
  displayName: "Generic JSON Feed",
  provider: "generic",
  sourceType: "json",
  envVars: ["COMMERCE_GENERIC_JSON_FEED_URL"],
  supportsTest: true, supportsRefresh: true, supportsPriceRefresh: true, supportsProductImport: true,
  isOfficial: false,
  publicNotes: "Fetches products from a configured JSON feed URL. Field mapping is auto-detected.",
  safetyNotes: "Feed URL must be configured server-side. Only https:// URLs are accepted.",
};

export class GenericJsonFeedRuntime implements ConnectorRuntime {
  config = CONFIG;

  getStatus(): ConnectorStatus {
    return buildConnectorStatus(CONFIG);
  }

  async test(): Promise<ConnectorTestResult> {
    const feedUrl = process.env.COMMERCE_GENERIC_JSON_FEED_URL;
    if (!feedUrl) return { success: false, message: "COMMERCE_GENERIC_JSON_FEED_URL not configured" };
    try {
      const res = await fetch(feedUrl, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return { success: false, message: `HTTP ${res.status}` };
      const text = await res.text();
      const detection = detectFeedFormat(text);
      return {
        success: detection.format !== "unknown",
        message: `Detected ${detection.format} with ${detection.rowCount} rows`,
        details: { format: detection.format, rowCount: detection.rowCount, confidence: detection.confidence },
      };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Fetch failed" };
    }
  }

  async refresh(): Promise<ConnectorRunResult> {
    const feedUrl = process.env.COMMERCE_GENERIC_JSON_FEED_URL;
    if (!feedUrl) return createSkippedResult("generic_json_feed", "COMMERCE_GENERIC_JSON_FEED_URL not configured");
    const startedAt = new Date().toISOString();
    try {
      const res = await fetch(feedUrl, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) return { connectorKey: "generic_json_feed", status: "failed", importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0, warnings: [], errors: [`HTTP ${res.status}`], startedAt, completedAt: new Date().toISOString() };

      const text = await res.text();
      const parsed = JSON.parse(text);
      const array = Array.isArray(parsed) ? parsed : [parsed];
      if (array.length === 0) return createSkippedResult("generic_json_feed", "Feed is empty");

      const headers = Object.keys(array[0]);
      const mappings = detectFieldMapping(headers);
      const rows = array.slice(0, 500).map((r: Record<string, unknown>) => {
        const row: Record<string, string> = {};
        for (const key of headers) row[key] = String(r[key] ?? "");
        return row;
      });

      let importedCount = 0, updatedCount = 0, priceChangesCount = 0, invalidCount = 0;
      const errors: string[] = [], warnings: string[] = [];
      const currentIndex = getSearchIndex();
      const freshness = computeFreshnessFromSourceType("affiliate_json");
      const lastCheckedText = formatLastCheckedText(new Date().toISOString());

      for (const row of rows) {
        const mapped = mapFeedRowToProduct(row, mappings);
        if (!mapped.product) { invalidCount++; continue; }
        const p = mapped.product;
        warnings.push(...mapped.warnings);

        const item = normalizeRawProduct({
          sourceProductId: p.sourceProductId || `jsonfeed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          normalizedTitle: p.title.toLowerCase(), originalTitle: p.title,
          category: p.category || "tshirt", storeKey: p.storeKey as "other",
          storeName: p.storeName || p.storeKey, brand: p.brand,
          price: p.price, mrp: p.mrp, productUrl: p.productUrl, affiliateUrl: p.affiliateUrl,
          imageUrl: p.imageUrl, availabilityStatus: p.availabilityStatus,
          sourceType: "affiliate_json", sourceName: "JSON Feed",
          lastCheckedAt: new Date().toISOString(),
        });
        if (!item) { invalidCount++; continue; }

        const existingIdx = currentIndex.findIndex(
          (x) => x.sourceProductId === item.sourceProductId || (x.storeKey === item.storeKey && x.normalizedTitle === item.normalizedTitle)
        );

        if (existingIdx >= 0) {
          const prevPrice = currentIndex[existingIdx].price;
          currentIndex[existingIdx] = { ...currentIndex[existingIdx], price: item.price, mrp: item.mrp, productUrl: item.productUrl, affiliateUrl: item.affiliateUrl, priceFreshness: freshness, lastCheckedText, updatedAt: new Date().toISOString() };
          updatedCount++;
          if (prevPrice !== item.price) priceChangesCount++;
        } else {
          currentIndex.push({ ...item, priceFreshness: freshness, lastCheckedText });
          importedCount++;
        }
      }

      saveSearchIndex(currentIndex);
      saveSearchIndexMeta({ indexedCount: currentIndex.length, catalogSource: "json_feed", builtAt: new Date().toISOString() });

      return {
        connectorKey: "generic_json_feed",
        status: errors.length > 0 ? "partial" : importedCount > 0 || updatedCount > 0 ? "success" : "skipped",
        importedCount, updatedCount, skippedCount: 0, invalidCount, priceChangesCount,
        warnings, errors, startedAt, completedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        connectorKey: "generic_json_feed", status: "failed",
        importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
        warnings: [], errors: [err instanceof Error ? err.message : "Unknown"],
        startedAt, completedAt: new Date().toISOString(),
      };
    }
  }
}
