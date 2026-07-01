import type { NormalizedProductInput, ConnectorImportResult } from "@/types/storeConnector";
import { BaseStoreConnector } from "./baseConnector";

export interface CsvRow {
  [key: string]: string;
}

export class ManualCsvConnector extends BaseStoreConnector {
  key = "manual_csv";
  displayName = "Manual CSV Import";
  sourceType = "csv";

  /**
   * Parse a CSV string into rows.
   * Expected columns: sourceProductId, originalTitle, category, storeKey, storeName,
   * price, mrp, productUrl, affiliateUrl, imageUrl, brand, colorTags, styleTags,
   * auraLeakTags, goalTags, fitTags, materialTags, availabilityStatus, isSponsored, isAffiliate
   */
  parseCsv(csvContent: string): CsvRow[] {
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = this.parseCsvLine(lines[0]);
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.length !== headers.length) continue;

      const row: CsvRow = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j].trim()] = values[j]?.trim() || "";
      }
      rows.push(row);
    }

    return rows;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  }

  normalize(input: Record<string, unknown>): NormalizedProductInput | null {
    try {
      const row = input as unknown as CsvRow;

      return {
        sourceProductId: row.sourceProductId || `csv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        normalizedTitle: (row.originalTitle || "").toLowerCase().trim(),
        originalTitle: row.originalTitle || "",
        category: row.category || "tshirt",
        subCategory: row.subCategory,
        storeKey: (row.storeKey || "other") as NormalizedProductInput["storeKey"],
        storeName: row.storeName || row.storeKey || "Unknown Store",
        brand: row.brand,
        colorTags: this.parseTagField(row.colorTags),
        styleTags: this.parseTagField(row.styleTags),
        auraLeakTags: this.parseTagField(row.auraLeakTags),
        goalTags: this.parseTagField(row.goalTags),
        fitTags: this.parseTagField(row.fitTags),
        materialTags: this.parseTagField(row.materialTags),
        genderPresentationTags: this.parseTagField(row.genderPresentationTags),
        price: parseInt(row.price, 10) || 0,
        mrp: row.mrp ? parseInt(row.mrp, 10) : undefined,
        currency: "INR",
        productUrl: row.productUrl || "#",
        affiliateUrl: row.affiliateUrl || undefined,
        imageUrl: row.imageUrl || undefined,
        availabilityStatus: (row.availabilityStatus as NormalizedProductInput["availabilityStatus"]) || "unknown",
        isSponsored: row.isSponsored === "true" || row.isSponsored === "yes",
        isAffiliate: row.isAffiliate === "true" || row.isAffiliate === "yes",
      };
    } catch {
      return null;
    }
  }

  importFromCsv(csvContent: string): ConnectorImportResult {
    const rows = this.parseCsv(csvContent);
    return this.importProducts(rows as unknown as Record<string, unknown>[]);
  }

  private parseTagField(value: string | undefined): string[] {
    if (!value) return [];
    return value
      .split(";")
      .map((t) => t.trim())
      .filter(Boolean);
  }
}

// Singleton
export const manualCsvConnector = new ManualCsvConnector();
