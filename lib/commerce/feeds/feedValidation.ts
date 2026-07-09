import type { FeedProductRow } from "@/types/feedImport";

export interface RowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFeedRow(row: FeedProductRow): RowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!row.title || row.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (typeof row.price !== "number" || row.price <= 0) {
    errors.push(`Price must be a positive number, got: ${row.price}`);
  }

  if (!row.storeKey || row.storeKey.trim().length === 0) {
    errors.push("Store key is required");
  }

  if (!row.productUrl || row.productUrl.trim().length === 0) {
    if (!row.affiliateUrl || row.affiliateUrl.trim().length === 0) {
      errors.push("Product URL or affiliate URL is required");
    }
  }

  // Price validations
  if (row.mrp !== undefined && row.mrp !== null) {
    if (row.mrp < 0) {
      errors.push(`MRP cannot be negative: ${row.mrp}`);
    } else if (row.mrp < row.price) {
      warnings.push(`MRP (${row.mrp}) is less than selling price (${row.price})`);
    }
  }

  // Discount validation
  if (row.mrp && row.mrp > row.price) {
    const discount = Math.round(((row.mrp - row.price) / row.mrp) * 100);
    if (discount > 80) {
      warnings.push(`Suspicious discount: ${discount}% off MRP`);
    }
  }

  // URL validation
  if (row.productUrl && row.productUrl !== "#") {
    try { new URL(row.productUrl); } catch {
      warnings.push(`Invalid product URL format: ${row.productUrl}`);
    }
  }

  if (row.affiliateUrl && row.affiliateUrl !== "#") {
    try { new URL(row.affiliateUrl); } catch {
      warnings.push(`Invalid affiliate URL format: ${row.affiliateUrl}`);
    }
  }

  // Category normalization hint
  if (row.category && row.category.length > 30) {
    warnings.push(`Category name is very long: "${row.category}"`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateFeedRows(rows: FeedProductRow[]): {
  valid: FeedProductRow[];
  warnings: { row: number; product: FeedProductRow; warnings: string[] }[];
  invalid: { row: number; product: FeedProductRow; errors: string[] }[];
} {
  const valid: FeedProductRow[] = [];
  const warnings: { row: number; product: FeedProductRow; warnings: string[] }[] = [];
  const invalid: { row: number; product: FeedProductRow; errors: string[] }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const result = validateFeedRow(row);

    if (result.valid) {
      if (result.warnings.length > 0) {
        warnings.push({ row: i + 1, product: row, warnings: result.warnings });
      }
      valid.push(row);
    } else {
      invalid.push({ row: i + 1, product: row, errors: result.errors });
    }
  }

  return { valid, warnings, invalid };
}
