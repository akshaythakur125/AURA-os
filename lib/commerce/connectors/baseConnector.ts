import type { NormalizedProductInput, ConnectorImportResult } from "@/types/storeConnector";

export interface StoreConnectorInterface {
  key: string;
  displayName: string;
  sourceType: string;

  /** Normalize raw data into the internal product format */
  normalize(input: Record<string, unknown>): NormalizedProductInput | null;

  /** Validate a normalized input */
  validate(input: NormalizedProductInput): string[];

  /** Import products from a raw data source */
  importProducts(inputs: Record<string, unknown>[]): ConnectorImportResult;
}

export abstract class BaseStoreConnector implements StoreConnectorInterface {
  abstract key: string;
  abstract displayName: string;
  abstract sourceType: string;

  abstract normalize(input: Record<string, unknown>): NormalizedProductInput | null;

  validate(input: NormalizedProductInput): string[] {
    const errors: string[] = [];

    if (!input.sourceProductId) errors.push("Missing sourceProductId");
    if (!input.originalTitle) errors.push("Missing originalTitle");
    if (!input.category) errors.push("Missing category");
    if (!input.storeKey) errors.push("Missing storeKey");
    if (!input.storeName) errors.push("Missing storeName");
    if (typeof input.price !== "number" || input.price <= 0) {
      errors.push(`Invalid price: ${input.price}`);
    }
    if (!input.productUrl) errors.push("Missing productUrl");

    return errors;
  }

  importProducts(inputs: Record<string, unknown>[]): ConnectorImportResult {
    const imported: NormalizedProductInput[] = [];
    const invalidItems: ConnectorImportResult["invalidItems"] = [];
    const warnings: string[] = [];

    for (let i = 0; i < inputs.length; i++) {
      try {
        const normalized = this.normalize(inputs[i]);
        if (!normalized) {
          invalidItems.push({ index: i, field: "normalize", message: "Failed to normalize input" });
          continue;
        }

        const errors = this.validate(normalized);
        if (errors.length > 0) {
          invalidItems.push({
            index: i,
            field: "validate",
            message: errors.join("; "),
            value: inputs[i],
          });
          continue;
        }

        imported.push(normalized);
      } catch (err) {
        invalidItems.push({
          index: i,
          field: "process",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return {
      connectorKey: this.key,
      importedCount: imported.length,
      invalidCount: invalidItems.length,
      invalidItems,
      warnings,
      status: invalidItems.length === 0 ? "success" : imported.length > 0 ? "partial" : "failed",
      timestamp: new Date().toISOString(),
    };
  }
}
