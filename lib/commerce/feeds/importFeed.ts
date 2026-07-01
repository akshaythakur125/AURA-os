import type { FeedSourceType, ImportResult, ImportPreviewResult } from "@/types/feedImport";
import type { CommerceSearchItem } from "@/types/commerceSearch";
import { detectFeedFormat, parseCsvToRows } from "./detectFeedFormat";
import { mapAllRows } from "./mapFeedRowToProduct";
import { createImportRun, completeImportRun, addImportRun } from "./feedImportHistory";
import { normalizeRawProduct } from "@/lib/commerce/search/normalizeProduct";
import { getSearchIndex, saveSearchIndex, saveSearchIndexMeta } from "@/lib/storage/commerceSearchStore";
import { normalizeStoreKey } from "@/config/storeTrustScores";
import { computeFreshnessFromSourceType, formatLastCheckedText } from "@/config/priceFreshnessRules";

export function previewImport(
  content: string,
  sourceType: FeedSourceType,
  fileName?: string
): ImportPreviewResult {
  const detection = detectFeedFormat(content, fileName);

  if (detection.format === "unknown") {
    return {
      totalRows: 0,
      validRows: [],
      warningRows: [],
      invalidRows: [],
      mappings: [],
    };
  }

  let rawRows: Record<string, string>[];

  if (detection.format === "json") {
    const parsed = JSON.parse(content);
    const array = Array.isArray(parsed) ? parsed : [parsed];
    const headers = Object.keys(array[0] || {});
    rawRows = array.slice(0, 100).map((r: Record<string, unknown>) => {
      const row: Record<string, string> = {};
      for (const key of headers) {
        row[key] = String(r[key] ?? "");
      }
      return row;
    });
  } else {
    const { rows } = parseCsvToRows(content);
    rawRows = rows.slice(0, 100);
  }

  const { valid, warnings, invalid } = mapAllRows(rawRows, detection.detectedMapping);

  const warningRows = warnings.map((w) => ({
    row: w.row,
    rowData: w.rowData,
    warnings: w.warnings,
  }));

  const invalidRows = invalid.map((iv) => ({
    row: iv.row,
    rowData: iv.rowData,
    errors: iv.errors,
  }));

  return {
    totalRows: rawRows.length,
    validRows: valid,
    warningRows,
    invalidRows,
    mappings: detection.detectedMapping,
  };
}

export async function importFeed(
  content: string,
  sourceType: FeedSourceType,
  sourceName: string,
  options?: {
    storeKey?: string;
    fileName?: string;
    rebuildIndex?: boolean;
  }
): Promise<ImportResult> {
  const run = createImportRun({
    sourceType,
    sourceName,
    storeKey: options?.storeKey,
    fileName: options?.fileName,
  });

  try {
    const detection = detectFeedFormat(content, options?.fileName);

    if (detection.format === "unknown") {
      const failed = completeImportRun(run, {
        importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0,
        warnings: [], errors: ["Unable to detect feed format"],
      });
      addImportRun(failed);
      return {
        importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0,
        totalProcessed: 0, warnings: [], errors: ["Unable to detect feed format"],
        indexRebuilt: false, runId: run.id,
      };
    }

    let rawRows: Record<string, string>[];

    if (detection.format === "json") {
      const parsed = JSON.parse(content);
      const array = Array.isArray(parsed) ? parsed : [parsed];
      const headers = Object.keys(array[0] || {});
      rawRows = array.map((r: Record<string, unknown>) => {
        const row: Record<string, string> = {};
        for (const key of headers) {
          row[key] = String(r[key] ?? "");
        }
        return row;
      });
    } else {
      const { rows } = parseCsvToRows(content);
      rawRows = rows;
    }

    // Map all rows
    const { valid, warnings, invalid } = mapAllRows(rawRows, detection.detectedMapping);

    if (valid.length === 0) {
      const failed = completeImportRun(run, {
        importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: invalid.length,
        warnings: [], errors: ["No valid rows found"],
      });
      addImportRun(failed);
      return {
        importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: invalid.length,
        totalProcessed: rawRows.length, warnings: [], errors: ["No valid rows found"],
        indexRebuilt: false, runId: run.id,
      };
    }

    // Import valid rows — upsert into index
    const currentIndex = getSearchIndex();
    const importedIds = new Set<string>();
    let updatedCount = 0;
    let importedCount = 0;
    const errors: string[] = [];
    const warningMessages: string[] = warnings.map((w) => `Row ${w.row}: ${w.warnings.join("; ")}`);

    const freshness = computeFreshnessFromSourceType(sourceType);
    const lastCheckedText = formatLastCheckedText(new Date().toISOString());
    const storeKey = options?.storeKey || "other";

    for (const row of valid) {
      try {
        const searchItem = normalizeRawProduct({
          sourceProductId: row.sourceProductId || `${sourceType}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          normalizedTitle: row.title.toLowerCase().trim(),
          originalTitle: row.title,
          category: row.category || "tshirt",
          subCategory: row.subCategory,
          storeKey: (row.storeKey || storeKey) as CommerceSearchItem["storeKey"],
          storeName: row.storeName || normalizeStoreKey(row.storeKey || storeKey),
          brand: row.brand,
          price: row.price,
          mrp: row.mrp,
          productUrl: row.productUrl,
          affiliateUrl: row.affiliateUrl,
          imageUrl: row.imageUrl,
          colorTags: row.color ? [row.color] : undefined,
          styleTags: row.styleTags ? row.styleTags.split(";").map((t) => t.trim()).filter(Boolean) : undefined,
          auraLeakTags: row.auraLeakTags ? row.auraLeakTags.split(";").map((t) => t.trim()).filter(Boolean) : undefined,
          goalTags: row.goalTags ? row.goalTags.split(";").map((t) => t.trim()).filter(Boolean) : undefined,
          availabilityStatus: row.availabilityStatus,
          isSponsored: false,
          isAffiliate: !!row.affiliateUrl,
          sourceType,
          sourceName,
          lastCheckedAt: row.lastCheckedAt,
        });

        if (!searchItem) {
          errors.push(`Failed to normalize: ${row.title}`);
          continue;
        }

        // Check for existing product (dedup)
        const existingIndex = currentIndex.findIndex(
          (item) =>
            item.sourceProductId === searchItem.sourceProductId ||
            (item.storeKey === searchItem.storeKey &&
             item.normalizedTitle === searchItem.normalizedTitle &&
             item.category === searchItem.category)
        );

        if (existingIndex >= 0) {
          currentIndex[existingIndex] = {
            ...currentIndex[existingIndex],
            price: searchItem.price,
            mrp: searchItem.mrp,
            discountPercent: searchItem.discountPercent,
            productUrl: searchItem.productUrl,
            affiliateUrl: searchItem.affiliateUrl,
            imageUrl: searchItem.imageUrl,
            availabilityStatus: searchItem.availabilityStatus,
            priceFreshness: freshness,
            lastCheckedAt: searchItem.lastCheckedAt,
            lastCheckedText,
            updatedAt: new Date().toISOString(),
          };
          updatedCount++;
        } else {
          currentIndex.push({
            ...searchItem,
            priceFreshness: freshness,
            lastCheckedText,
          });
          importedCount++;
        }

        importedIds.add(searchItem.id);
      } catch (err) {
        errors.push(`Error processing "${row.title}": ${err instanceof Error ? err.message : "Unknown"}`);
      }
    }

    // Save updated index
    saveSearchIndex(currentIndex);

    // Rebuild index if requested
    let indexRebuilt = false;
    if (options?.rebuildIndex !== false) {
      try {
        saveSearchIndexMeta({
          indexedCount: currentIndex.length,
          catalogSource: sourceType,
          builtAt: new Date().toISOString(),
        });
        indexRebuilt = true;
      } catch {
        // meta save is optional
      }
    }

    const completed = completeImportRun(run, {
      importedCount,
      updatedCount,
      skippedCount: invalid.length,
      invalidCount: invalid.length,
      warnings: warningMessages,
      errors,
    });
    addImportRun(completed);

    return {
      importedCount,
      updatedCount,
      skippedCount: invalid.length,
      invalidCount: invalid.length,
      totalProcessed: rawRows.length,
      warnings: warningMessages,
      errors,
      indexRebuilt,
      runId: run.id,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Import failed unexpectedly";
    const failed = completeImportRun(run, {
      importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0,
      warnings: [], errors: [errorMsg],
    });
    addImportRun(failed);

    return {
      importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0,
      totalProcessed: 0, warnings: [], errors: [errorMsg],
      indexRebuilt: false, runId: run.id,
    };
  }
}
