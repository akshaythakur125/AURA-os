import type { NormalizedProductInput, ConnectorImportResult } from "@/types/storeConnector";
import { BaseStoreConnector } from "./baseConnector";

export interface JsonProductInput {
  sourceProductId?: string;
  originalTitle: string;
  category: string;
  subCategory?: string;
  storeKey: string;
  storeName: string;
  brand?: string;
  price: number;
  mrp?: number;
  productUrl: string;
  affiliateUrl?: string;
  imageUrl?: string;
  colorTags?: string | string[];
  styleTags?: string | string[];
  auraLeakTags?: string | string[];
  goalTags?: string | string[];
  fitTags?: string | string[];
  materialTags?: string | string[];
  genderPresentationTags?: string | string[];
  availabilityStatus?: string;
  isSponsored?: boolean;
  isAffiliate?: boolean;
  [key: string]: unknown;
}

export class ManualJsonConnector extends BaseStoreConnector {
  key = "manual_json";
  displayName = "Manual JSON Import";
  sourceType = "json";

  normalize(input: Record<string, unknown>): NormalizedProductInput | null {
    try {
      const p = input as unknown as JsonProductInput;

      return {
        sourceProductId: p.sourceProductId || `json_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        normalizedTitle: (p.originalTitle || "").toLowerCase().trim(),
        originalTitle: p.originalTitle || "",
        category: p.category || "tshirt",
        subCategory: p.subCategory,
        storeKey: (p.storeKey || "other") as NormalizedProductInput["storeKey"],
        storeName: p.storeName || p.storeKey || "Unknown Store",
        brand: p.brand,
        colorTags: this.normalizeTagField(p.colorTags),
        styleTags: this.normalizeTagField(p.styleTags),
        auraLeakTags: this.normalizeTagField(p.auraLeakTags),
        goalTags: this.normalizeTagField(p.goalTags),
        fitTags: this.normalizeTagField(p.fitTags),
        materialTags: this.normalizeTagField(p.materialTags),
        genderPresentationTags: this.normalizeTagField(p.genderPresentationTags),
        price: typeof p.price === "number" ? Math.round(p.price) : parseInt(String(p.price), 10) || 0,
        mrp: p.mrp ? (typeof p.mrp === "number" ? Math.round(p.mrp) : parseInt(String(p.mrp), 10)) : undefined,
        currency: "INR",
        productUrl: p.productUrl || "#",
        affiliateUrl: p.affiliateUrl,
        imageUrl: p.imageUrl,
        availabilityStatus: (p.availabilityStatus as NormalizedProductInput["availabilityStatus"]) || "unknown",
        isSponsored: p.isSponsored || false,
        isAffiliate: p.isAffiliate || false,
      };
    } catch {
      return null;
    }
  }

  importFromJson(jsonString: string): ConnectorImportResult {
    try {
      const parsed = JSON.parse(jsonString);
      const array = Array.isArray(parsed) ? parsed : [parsed];
      return this.importProducts(array as Record<string, unknown>[]);
    } catch (err) {
      return {
        connectorKey: this.key,
        importedCount: 0,
        invalidCount: 0,
        invalidItems: [],
        warnings: [],
        status: "failed",
        error: err instanceof Error ? err.message : "Invalid JSON",
        timestamp: new Date().toISOString(),
      };
    }
  }

  private normalizeTagField(value: string | string[] | undefined): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((t) => String(t).trim()).filter(Boolean);
    return value
      .split(";")
      .map((t) => t.trim())
      .filter(Boolean);
  }
}

// Singleton
export const manualJsonConnector = new ManualJsonConnector();
