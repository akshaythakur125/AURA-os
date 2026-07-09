import type { NormalizedProductInput, ConnectorImportResult } from "@/types/storeConnector";
import { BaseStoreConnector } from "./baseConnector";

/**
 * Amazon Fashion Connector Stub
 *
 * Future integration: Amazon Product Advertising API v5
 * Required credentials:
 *   - amazon_access_key: AWS Access Key
 *   - amazon_secret_key: AWS Secret Key
 *   - amazon_associate_tag: Amazon Affiliate Tag
 *
 * API Docs: https://webservices.amazon.com/paapi5/documentation/
 * Feed format: Amazon PA-API v5 response or CSV from affiliate dashboard
 *
 * Current status: Not configured. Returns placeholder data.
 */
export class AmazonConnectorStub extends BaseStoreConnector {
  key = "amazon_fashion";
  displayName = "Amazon Fashion";
  sourceType = "official_api";

  isConfigured = false;
  requiredCredentials = ["amazon_access_key", "amazon_secret_key", "amazon_associate_tag"];

  normalize(_input: Record<string, unknown>): NormalizedProductInput | null {
    // Stub: Amazon PA-API integration not yet configured
    return null;
  }

  importProducts(_inputs: Record<string, unknown>[]): ConnectorImportResult {
    return {
      connectorKey: this.key,
      importedCount: 0,
      invalidCount: 0,
      invalidItems: [],
      warnings: [
        "Amazon Fashion connector is not configured yet.",
        "Required: amazon_access_key, amazon_secret_key, amazon_associate_tag",
        "See https://webservices.amazon.com/paapi5/documentation/ for API docs.",
        "You can import products via CSV as a workaround.",
      ],
      status: "failed",
      error: "Amazon PA-API credentials not configured",
      timestamp: new Date().toISOString(),
    };
  }

  getStatus(): { configured: boolean; message: string } {
    const configured = !!(
      typeof process !== "undefined" &&
      process.env.AMAZON_ACCESS_KEY &&
      process.env.AMAZON_SECRET_KEY &&
      process.env.AMAZON_ASSOCIATE_TAG
    );

    return {
      configured,
      message: configured
        ? "Amazon PA-API credentials found. Integration not yet implemented."
        : "Amazon PA-API credentials not set. Use CSV import as workaround.",
    };
  }
}

export const amazonConnectorStub = new AmazonConnectorStub();
