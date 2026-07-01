import type { ConnectorConfig, ConnectorStatus, ConnectorRunResult, ConnectorTestResult } from "@/types/connectorRuntime";
import type { ConnectorRuntime } from "./connectorRegistry";
import { buildConnectorStatus, createSkippedResult } from "./connectorRegistry";

const C: ConnectorConfig = {
  key: "cuelinks", displayName: "Cuelinks", provider: "cuelinks", sourceType: "affiliate_feed",
  envVars: ["CUELINKS_API_KEY", "CUELINKS_FEED_URL"],
  supportsTest: true, supportsRefresh: true, supportsPriceRefresh: false, supportsProductImport: true,
  isOfficial: true,
  publicNotes: "Cuelinks affiliate network for Indian merchant feeds.",
  safetyNotes: "Not yet wired to live API calls. Requires valid Cuelinks account.",
};

export class CuelinksRuntime implements ConnectorRuntime {
  config = C;
  getStatus(): ConnectorStatus { return buildConnectorStatus(C); }
  async test(): Promise<ConnectorTestResult> {
    const m = C.envVars.filter((v) => !process.env[v]);
    return m.length > 0
      ? { success: false, message: `Missing: ${m.join(", ")}` }
      : { success: true, message: "Cuelinks credentials configured. Not yet wired to live API calls." };
  }
  async refresh(): Promise<ConnectorRunResult> {
    return createSkippedResult("cuelinks", "Cuelinks connector is prepared but not yet wired to live API calls.");
  }
}
