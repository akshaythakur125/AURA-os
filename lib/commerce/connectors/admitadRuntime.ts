import type { ConnectorConfig, ConnectorStatus, ConnectorRunResult, ConnectorTestResult } from "@/types/connectorRuntime";
import type { ConnectorRuntime } from "./connectorRegistry";
import { buildConnectorStatus, createSkippedResult } from "./connectorRegistry";

const C: ConnectorConfig = {
  key: "admitad", displayName: "Admitad", provider: "admitad", sourceType: "affiliate_feed",
  envVars: ["ADMITAD_CLIENT_ID", "ADMITAD_CLIENT_SECRET", "ADMITAD_FEED_URL"],
  supportsTest: true, supportsRefresh: true, supportsPriceRefresh: false, supportsProductImport: true,
  isOfficial: true,
  publicNotes: "Admitad global affiliate network with Indian merchant support.",
  safetyNotes: "Not yet wired to live API calls. Requires valid Admitad account.",
};

export class AdmitadRuntime implements ConnectorRuntime {
  config = C;
  getStatus(): ConnectorStatus { return buildConnectorStatus(C); }
  async test(): Promise<ConnectorTestResult> {
    const m = C.envVars.filter((v) => !process.env[v]);
    return m.length > 0
      ? { success: false, message: `Missing: ${m.join(", ")}` }
      : { success: true, message: "Admitad credentials configured. Not yet wired to live API calls." };
  }
  async refresh(): Promise<ConnectorRunResult> {
    return createSkippedResult("admitad", "Admitad connector is prepared but not yet wired to live API calls.");
  }
}
