import type { NormalizedProductInput, ConnectorImportResult } from "@/types/storeConnector";
import { BaseStoreConnector } from "./baseConnector";

/**
 * Generic Affiliate Feed Connector
 *
 * Processes affiliate product feeds in JSON or CSV format.
 * Supports any affiliate program that provides a product feed.
 *
 * Expected feed format (JSON):
 * ```json
 * [
 *   {
 *     "productId": "string",
 *     "title": "string",
 *     "price": number,
 *     "currency": "INR",
 *     "productUrl": "string",
 *     "affiliateUrl": "string",
 *     "imageUrl": "string (optional)",
 *     "category": "string (optional)"
 *   }
 * ]
 * ```
 *
 * CSV format: productId, title, price, currency, productUrl, affiliateUrl, imageUrl, category
 */
export class GenericAffiliateFeedConnector extends BaseStoreConnector {
  key = "generic_affiliate";
  displayName = "Generic Affiliate Feed";
  sourceType = "affiliate_feed";

  private feedUrl?: string;

  setFeedUrl(url: string): void {
    this.feedUrl = url;
  }

  normalize(input: Record<string, unknown>): NormalizedProductInput | null {
    try {
      const p = input as Record<string, unknown>;

      return {
        sourceProductId: String(p.productId || p.id || `aff_${Date.now()}`),
        normalizedTitle: String(p.title || p.name || "").toLowerCase().trim(),
        originalTitle: String(p.title || p.name || ""),
        category: String(p.category || "tshirt"),
        subCategory: p.subCategory ? String(p.subCategory) : undefined,
        storeKey: (String(p.storeKey || "other")) as NormalizedProductInput["storeKey"],
        storeName: String(p.storeName || p.storeKey || "Affiliate Store"),
        brand: p.brand ? String(p.brand) : undefined,
        colorTags: this.parseTags(p.colorTags),
        styleTags: this.parseTags(p.styleTags),
        auraLeakTags: this.parseTags(p.auraLeakTags),
        goalTags: this.parseTags(p.goalTags),
        fitTags: this.parseTags(p.fitTags),
        materialTags: this.parseTags(p.materialTags),
        genderPresentationTags: this.parseTags(p.genderPresentationTags),
        price: Math.round(Number(p.price) || 0),
        mrp: p.mrp ? Math.round(Number(p.mrp)) : undefined,
        currency: String(p.currency || "INR"),
        productUrl: String(p.productUrl || p.url || "#"),
        affiliateUrl: String(p.affiliateUrl || ""),
        imageUrl: p.imageUrl ? String(p.imageUrl) : undefined,
        availabilityStatus: (String(p.availabilityStatus || "unknown")) as NormalizedProductInput["availabilityStatus"],
        isSponsored: Boolean(p.isSponsored),
        isAffiliate: true,
      };
    } catch {
      return null;
    }
  }

  importFromFeed(feedData: string, format: "json" | "csv" = "json"): ConnectorImportResult {
    try {
      let records: Record<string, unknown>[];

      if (format === "csv") {
        records = this.parseCsvFeed(feedData);
      } else {
        const parsed = JSON.parse(feedData);
        records = Array.isArray(parsed) ? parsed : [parsed];
      }

      return this.importProducts(records);
    } catch (err) {
      return {
        connectorKey: this.key,
        importedCount: 0,
        invalidCount: 0,
        invalidItems: [],
        warnings: [],
        status: "failed",
        error: err instanceof Error ? err.message : "Failed to parse feed",
        timestamp: new Date().toISOString(),
      };
    }
  }

  private parseCsvFeed(csvContent: string): Record<string, unknown>[] {
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const records: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length !== headers.length) continue;

      const record: Record<string, unknown> = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = values[j];
      }
      records.push(record);
    }

    return records;
  }

  private parseTags(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    return String(value).split(";").map((t) => t.trim()).filter(Boolean);
  }
}

export const genericAffiliateFeedConnector = new GenericAffiliateFeedConnector();
