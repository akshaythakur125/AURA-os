import type { NormalizedProductInput, ConnectorImportResult } from "@/types/storeConnector";
import { BaseStoreConnector } from "./baseConnector";

/**
 * AJIO Connector Stub
 *
 * AJIO (Reliance) does not have a public API for product data.
 * Future integration options:
 *   - AJIO affiliate program (if available)
 *   - Manual CSV/feed import
 *
 * Current status: Not available. Use CSV or manual import.
 */
export class AjioConnectorStub extends BaseStoreConnector {
  key = "ajio";
  displayName = "AJIO";
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
        "AJIO does not have a public product API.",
        "Use CSV import to add AJIO products manually.",
        "CSV format: title, price, mrp, url, category, image_url",
      ],
      status: "failed",
      error: "No public AJIO API available",
      timestamp: new Date().toISOString(),
    };
  }
}

export const ajioConnectorStub = new AjioConnectorStub();
