import { NextRequest, NextResponse } from "next/server";
import { manualCsvConnector } from "@/lib/commerce/connectors/manualCsvConnector";
import { manualJsonConnector } from "@/lib/commerce/connectors/manualJsonConnector";
import { genericAffiliateFeedConnector } from "@/lib/commerce/connectors/genericAffiliateFeedConnector";
import { normalizeRawProduct } from "@/lib/commerce/search/normalizeProduct";
import { getSearchIndex, saveSearchIndex, addImportRun } from "@/lib/storage/commerceSearchStore";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const format = (formData.get("format") as string) || "json";
    const connectorKey = (formData.get("connectorKey") as string) || "manual_json";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const content = await file.text();

    let result;
    if (format === "csv") {
      result = manualCsvConnector.importFromCsv(content);
    } else if (connectorKey === "generic_affiliate") {
      result = genericAffiliateFeedConnector.importFromFeed(content, format as "json" | "csv");
    } else {
      result = manualJsonConnector.importFromJson(content);
    }

    // Normalize imported products to search items and add to index
    const importedProducts = result.importedCount > 0 ? result : null;
    if (importedProducts) {
      const currentIndex = getSearchIndex();

      // Re-normalize using the connector
      const newItems: ReturnType<typeof normalizeRawProduct>[] = [];

      if (format === "csv") {
        const rows = manualCsvConnector.parseCsv(content);
        for (const row of rows) {
          const normalized = manualCsvConnector.normalize(row as unknown as Record<string, unknown>);
          if (normalized) {
            const item = normalizeRawProduct({
              sourceProductId: normalized.sourceProductId,
              normalizedTitle: normalized.normalizedTitle,
              originalTitle: normalized.originalTitle,
              category: normalized.category,
              storeKey: normalized.storeKey,
              storeName: normalized.storeName,
              brand: normalized.brand,
              price: normalized.price,
              mrp: normalized.mrp,
              productUrl: normalized.productUrl,
              affiliateUrl: normalized.affiliateUrl,
              imageUrl: normalized.imageUrl,
              colorTags: normalized.colorTags,
              styleTags: normalized.styleTags,
              auraLeakTags: normalized.auraLeakTags,
              goalTags: normalized.goalTags,
              fitTags: normalized.fitTags,
              materialTags: normalized.materialTags,
              genderPresentationTags: normalized.genderPresentationTags,
              availabilityStatus: normalized.availabilityStatus,
              isSponsored: normalized.isSponsored,
              isAffiliate: normalized.isAffiliate,
              sourceType: "csv",
              sourceName: "CSV Import",
            });
            if (item) newItems.push(item);
          }
        }
      } else {
        const parsed = JSON.parse(content);
        const array = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of array) {
          const normalized = manualJsonConnector.normalize(item);
          if (normalized) {
            const searchItem = normalizeRawProduct({
              sourceProductId: normalized.sourceProductId,
              normalizedTitle: normalized.normalizedTitle,
              originalTitle: normalized.originalTitle,
              category: normalized.category,
              storeKey: normalized.storeKey,
              storeName: normalized.storeName,
              brand: normalized.brand,
              price: normalized.price,
              mrp: normalized.mrp,
              productUrl: normalized.productUrl,
              affiliateUrl: normalized.affiliateUrl,
              imageUrl: normalized.imageUrl,
              colorTags: normalized.colorTags,
              styleTags: normalized.styleTags,
              auraLeakTags: normalized.auraLeakTags,
              goalTags: normalized.goalTags,
              fitTags: normalized.fitTags,
              materialTags: normalized.materialTags,
              genderPresentationTags: normalized.genderPresentationTags,
              availabilityStatus: normalized.availabilityStatus,
              isSponsored: normalized.isSponsored,
              isAffiliate: normalized.isAffiliate,
              sourceType: "json",
              sourceName: "JSON Import",
            });
            if (searchItem) newItems.push(searchItem);
          }
        }
      }

      const validItems = newItems.filter((i): i is NonNullable<typeof i> => i !== null);
      const updatedIndex = [...currentIndex, ...validItems];
      saveSearchIndex(updatedIndex);

      // Record the import run
      addImportRun({
        ...result,
        importedCount: validItems.length,
      });

      return NextResponse.json({
        success: true,
        importedCount: validItems.length,
        invalidCount: result.invalidCount,
        totalIndexed: updatedIndex.length,
        warnings: result.warnings,
        status: result.status,
      });
    }

    return NextResponse.json({
      success: result.status !== "failed",
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
