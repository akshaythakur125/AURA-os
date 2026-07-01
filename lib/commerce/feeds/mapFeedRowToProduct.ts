import type { FeedProductRow, FeedMapping } from "@/types/feedImport";
import { normalizeStoreKey } from "@/config/storeTrustScores";

export function mapFeedRowToProduct(
  row: Record<string, string>,
  mappings: FeedMapping[]
): { product: FeedProductRow | null; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const getField = (targetField: string): string | undefined => {
    const mapping = mappings.find((m) => m.targetField === targetField);
    if (!mapping) return undefined;
    return row[mapping.sourceColumn]?.trim();
  };

  const title = getField("title") || "";
  if (!title) {
    errors.push("Missing title (required)");
  }

  const priceRaw = getField("price");
  const price = parsePrice(priceRaw);
  if (price === null || price <= 0) {
    errors.push(`Invalid or missing price: "${priceRaw}"`);
  }

  const storeKeyRaw = getField("storeKey") || getField("storeName") || "other";
  const storeKey = normalizeStoreKey(storeKeyRaw);

  const productUrl = getField("productUrl") || getField("affiliateUrl") || "";
  if (!productUrl) {
    errors.push("Missing productUrl or affiliateUrl (at least one required)");
  }

  const mrpRaw = getField("mrp");
  const mrp = parsePrice(mrpRaw);
  if (mrp !== null && price !== null && mrp < price) {
    warnings.push(`MRP (${mrpRaw}) is less than price (${priceRaw})`);
  }

  const availability = getField("availabilityStatus") || "unknown";
  const validAvailability = ["available", "unknown", "out_of_stock"].includes(availability.toLowerCase())
    ? availability.toLowerCase() as "available" | "unknown" | "out_of_stock"
    : "unknown";

  if (errors.length > 0) {
    return { product: null, errors, warnings };
  }

  const discount = mrp !== null && mrp > (price || 0)
    ? Math.round(((mrp - (price || 0)) / mrp) * 100)
    : undefined;

  if (discount !== undefined && discount > 80) {
    warnings.push(`Suspicious discount: ${discount}% off MRP`);
  }

  const product: FeedProductRow = {
    sourceProductId: getField("sourceProductId") || undefined,
    title: title,
    category: getField("category") || undefined,
    subCategory: getField("subCategory") || undefined,
    storeKey,
    storeName: getField("storeName") || undefined,
    brand: getField("brand") || undefined,
    price: price || 0,
    mrp: mrp || undefined,
    currency: "INR",
    productUrl: productUrl,
    affiliateUrl: getField("affiliateUrl") || undefined,
    imageUrl: getField("imageUrl") || undefined,
    availabilityStatus: validAvailability,
    color: getField("color") || undefined,
    fit: getField("fit") || undefined,
    material: getField("material") || undefined,
    styleTags: getField("styleTags") || undefined,
    auraLeakTags: getField("auraLeakTags") || undefined,
    goalTags: getField("goalTags") || undefined,
    lastCheckedAt: getField("lastCheckedAt") || new Date().toISOString(),
  };

  return { product, errors, warnings };
}

function parsePrice(value: string | undefined): number | null {
  if (!value || value.trim() === "") return null;
  const cleaned = value.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Math.round(num);
}

export function mapAllRows(
  rows: Record<string, string>[],
  mappings: FeedMapping[]
): {
  valid: FeedProductRow[];
  warnings: { row: number; rowData: Record<string, string>; warnings: string[] }[];
  invalid: { row: number; rowData: Record<string, string>; errors: string[] }[];
} {
  const valid: FeedProductRow[] = [];
  const warnings: { row: number; rowData: Record<string, string>; warnings: string[] }[] = [];
  const invalid: { row: number; rowData: Record<string, string>; errors: string[] }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const result = mapFeedRowToProduct(row, mappings);

    if (result.product) {
      if (result.warnings.length > 0) {
        valid.push(result.product);
        warnings.push({ row: i + 1, rowData: row, warnings: result.warnings });
      } else {
        valid.push(result.product);
      }
    } else {
      invalid.push({ row: i + 1, rowData: row, errors: result.errors });
    }
  }

  return { valid, warnings, invalid };
}
