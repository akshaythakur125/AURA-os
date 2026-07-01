import type { ConnectorConfig, ConnectorStatus, ConnectorRunResult, ConnectorTestResult } from "@/types/connectorRuntime";
import type { ConnectorRuntime } from "./connectorRegistry";
import { buildConnectorStatus, createSkippedResult } from "./connectorRegistry";

const CONFIG: ConnectorConfig = {
  key: "generic_affiliate_network",
  displayName: "Generic Affiliate Network",
  provider: "generic",
  sourceType: "affiliate_feed",
  envVars: ["COMMERCE_GENERIC_FEED_TOKEN"],
  supportsTest: true, supportsRefresh: true, supportsPriceRefresh: false, supportsProductImport: true,
  isOfficial: false,
  publicNotes: "Generic connector for affiliate networks that provide JSON/CSV product feeds with affiliate links. Feed URL must be provided.",
  safetyNotes: "Requires COMMERCE_GENERIC_FEED_TOKEN and a configured feed URL.",
};

export class GenericAffiliateNetworkRuntime implements ConnectorRuntime {
  config = CONFIG;

  getStatus(): ConnectorStatus {
    return buildConnectorStatus(CONFIG);
  }

  async test(): Promise<ConnectorTestResult> {
    if (!process.env.COMMERCE_GENERIC_FEED_TOKEN) {
      return { success: false, message: "COMMERCE_GENERIC_FEED_TOKEN not configured. Set the token and provide a feed URL to enable." };
    }
    return { success: true, message: "Token configured. Feed URL must be provided at runtime.", details: { tokenConfigured: true } };
  }

  async refresh(): Promise<ConnectorRunResult> {
    return createSkippedResult("generic_affiliate_network", "Feed URL must be provided. Use the Generic CSV or JSON feed connector for URL-based imports.");
  }
}
