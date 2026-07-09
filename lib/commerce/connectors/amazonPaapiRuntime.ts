import type { ConnectorConfig, ConnectorStatus, ConnectorRunResult, ConnectorTestResult } from "@/types/connectorRuntime";
import type { ConnectorRuntime } from "./connectorRegistry";
import { buildConnectorStatus, createSkippedResult } from "./connectorRegistry";

const CONFIG: ConnectorConfig = {
  key: "amazon_paapi",
  displayName: "Amazon PA-API",
  provider: "amazon",
  sourceType: "official_api",
  envVars: ["AMAZON_PAAPI_ACCESS_KEY", "AMAZON_PAAPI_SECRET_KEY", "AMAZON_PAAPI_PARTNER_TAG"],
  supportsTest: true, supportsRefresh: true, supportsPriceRefresh: true, supportsProductImport: false,
  isOfficial: true,
  publicNotes: "Amazon Product Advertising API v5. Supports product search, price lookup, and affiliate link generation.",
  safetyNotes: "Not yet wired to live API calls. Requires valid Amazon Associates account and PA-API credentials.",
};

export class AmazonPaapiRuntime implements ConnectorRuntime {
  config = CONFIG;

  getStatus(): ConnectorStatus {
    return buildConnectorStatus(CONFIG);
  }

  async test(): Promise<ConnectorTestResult> {
    const missing = CONFIG.envVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
      return { success: false, message: `Missing env vars: ${missing.join(", ")}` };
    }
    return {
      success: true,
      message: "Amazon PA-API credentials are configured. The API integration is prepared but not yet wired to live API calls. See config/officialConnectorDocs.ts for setup instructions.",
      details: { accessKeyConfigured: !!process.env.AMAZON_PAAPI_ACCESS_KEY, partnerTagConfigured: !!process.env.AMAZON_PAAPI_PARTNER_TAG },
    };
  }

  async refresh(): Promise<ConnectorRunResult> {
    return createSkippedResult("amazon_paapi", "Amazon PA-API connector is prepared but not yet wired to live API calls. Use CSV or JSON feed import as a workaround.");
  }
}
