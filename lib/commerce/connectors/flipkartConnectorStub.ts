import type { NormalizedProductInput, ConnectorImportResult } from "@/types/storeConnector";
import { BaseStoreConnector } from "./baseConnector";

/**
 * Flipkart Fashion Connector Stub
 *
 * Future integration: Flipkart Affiliate API
 * Required credentials:
 *   - flipkart_affiliate_id: Flipkart Affiliate ID
 *   - flipkart_affiliate_token: Flipkart Affiliate API Token
 *
 * API Docs: https://affiliate.flipkart.com/api-docs
 * Feed format: Flipkart Affiliate API XML/JSON feed
 *
 * Current status: Not configured. Returns placeholder data.
 */
export class FlipkartConnectorStub extends BaseStoreConnector {
  key = "flipkart_fashion";
  displayName = "Flipkart Fashion";
  sourceType = "official_api";

  isConfigured = false;
  requiredCredentials = ["flipkart_affiliate_id", "flipkart_affiliate_token"];

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
        "Flipkart Fashion connector is not configured yet.",
        "Required: flipkart_affiliate_id, flipkart_affiliate_token",
        "See https://affiliate.flipkart.com/api-docs for API docs.",
        "You can import products via CSV as a workaround.",
      ],
      status: "failed",
      error: "Flipkart Affiliate API credentials not configured",
      timestamp: new Date().toISOString(),
    };
  }

  getStatus(): { configured: boolean; message: string } {
    const configured = !!(
      typeof process !== "undefined" &&
      process.env.FLIPKART_AFFILIATE_ID &&
      process.env.FLIPKART_AFFILIATE_TOKEN
    );

    return {
      configured,
      message: configured
        ? "Flipkart Affiliate credentials found. Integration not yet implemented."
        : "Flipkart Affiliate credentials not set. Use CSV import as workaround.",
    };
  }
}

export const flipkartConnectorStub = new FlipkartConnectorStub();
