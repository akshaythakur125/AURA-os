import type { ConnectorConfig, ConnectorStatus, ConnectorRunResult, ConnectorTestResult } from "@/types/connectorRuntime";
import type { ConnectorRuntime } from "./connectorRegistry";
import { buildConnectorStatus, createSkippedResult } from "./connectorRegistry";

const C: ConnectorConfig = {
  key: "manual_upload", displayName: "Manual Upload", provider: "auracheck", sourceType: "manual",
  envVars: [], supportsTest: false, supportsRefresh: false, supportsPriceRefresh: false, supportsProductImport: true,
  isOfficial: true,
  publicNotes: "Upload CSV/JSON files via the admin feed import page.",
  safetyNotes: "Admin-only access. No automated refresh.",
};

export class ManualUploadRuntime implements ConnectorRuntime {
  config = C;
  getStatus(): ConnectorStatus {
    return buildConnectorStatus(C, { isConfigured: true });
  }
  async test(): Promise<ConnectorTestResult> {
    return { success: true, message: "Manual upload is always available. Use the Feed Import page to upload files." };
  }
  async refresh(): Promise<ConnectorRunResult> {
    return createSkippedResult("manual_upload", "Manual upload connector does not support automated refresh. Upload files via the Feed Import page.");
  }
}
