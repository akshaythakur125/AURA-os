import type { NormalizedProductInput, ConnectorImportResult } from "@/types/storeConnector";
import { BaseStoreConnector } from "./baseConnector";

/**
 * Myntra Connector Stub
 *
 * Myntra does not have a public API for product data.
 * Future integration options:
 *   - Myntra affiliate program (if available)
 *   - Manual CSV/feed import
 *
 * Current status: Not available. Use CSV or manual import.
 */
export class MyntraConnectorStub extends BaseStoreConnector {
  key = "myntra";
  displayName = "Myntra";
  sourceType = "official_api";

  isConfigured = false;

  normalize(_input: Record<string, unknown>): NormalizedProductInput | null {
    return null;
  }

  importProducts(_inputs: Record<string, unknown>[]): ConnectorImportResult {
    return {
      connectorKey: this.key,
      importedCount: 0,
      invalidCount: 0,
      invalidItems: [],
      warnings: [
        "Myntra does not have a public product API.",
        "Use CSV import to add Myntra products manually.",
        "CSV format: title, price, mrp, url, category, image_url",
      ],
      status: "failed",
      error: "No public Myntra API available",
      timestamp: new Date().toISOString(),
    };
  }
}

export const myntraConnectorStub = new MyntraConnectorStub();
