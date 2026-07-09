import type { ConnectorConfig, ConnectorStatus, ConnectorRunResult, ConnectorTestResult } from "@/types/connectorRuntime";
import type { ConnectorRuntime } from "./connectorRegistry";
import { buildConnectorStatus, createSkippedResult } from "./connectorRegistry";

const CONFIG: ConnectorConfig = {
  key: "flipkart_affiliate",
  displayName: "Flipkart Affiliate",
  provider: "flipkart",
  sourceType: "official_api",
  envVars: ["FLIPKART_AFFILIATE_ID", "FLIPKART_AFFILIATE_TOKEN"],
  supportsTest: true, supportsRefresh: true, supportsPriceRefresh: true, supportsProductImport: true,
  isOfficial: true,
  publicNotes: "Flipkart Affiliate API for product feeds and affiliate links.",
  safetyNotes: "Not yet wired to live API calls. Requires valid Flipkart Affiliate account.",
};

export class FlipkartAffiliateRuntime implements ConnectorRuntime {
  config = CONFIG;
  getStatus(): ConnectorStatus { return buildConnectorStatus(CONFIG); }
  async test(): Promise<ConnectorTestResult> {
    const m = CONFIG.envVars.filter((v) => !process.env[v]);
    return m.length > 0
      ? { success: false, message: `Missing: ${m.join(", ")}` }
      : { success: true, message: "Flipkart Affiliate credentials configured. Not yet wired to live API calls." };
  }
  async refresh(): Promise<ConnectorRunResult> {
    return createSkippedResult("flipkart_affiliate", "Flipkart Affiliate connector is prepared but not yet wired to live API calls.");
  }
}
