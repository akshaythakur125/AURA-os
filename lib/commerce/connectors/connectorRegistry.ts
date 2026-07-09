import type { ConnectorConfig, ConnectorStatus, ConnectorRunResult, ConnectorTestResult } from "@/types/connectorRuntime";

export interface ConnectorRuntime {
  config: ConnectorConfig;
  getStatus: () => ConnectorStatus;
  test: () => Promise<ConnectorTestResult>;
  refresh: () => Promise<ConnectorRunResult>;
}

const registry = new Map<string, ConnectorRuntime>();

export function registerConnector(runtime: ConnectorRuntime): void {
  registry.set(runtime.config.key, runtime);
}

export function getConnector(key: string): ConnectorRuntime | undefined {
  return registry.get(key);
}

export function getAllConnectors(): ConnectorRuntime[] {
  return Array.from(registry.values());
}

export function getConfiguredConnectors(): ConnectorRuntime[] {
  return getAllConnectors().filter((c) => c.getStatus().isConfigured);
}

export function getConnectorStatuses(): ConnectorStatus[] {
  return getAllConnectors().map((c) => c.getStatus());
}

export function buildConnectorStatus(config: ConnectorConfig, overrides?: Partial<ConnectorStatus>): ConnectorStatus {
  const missingEnvVars = config.envVars.filter(
    (envVar) => !process.env[envVar]
  );
  const isConfigured = missingEnvVars.length === 0;

  return {
    key: config.key,
    displayName: config.displayName,
    provider: config.provider,
    sourceType: config.sourceType,
    isConfigured: isConfigured || overrides?.isConfigured === true,
    supportsTest: config.supportsTest,
    supportsRefresh: config.supportsRefresh,
    supportsPriceRefresh: config.supportsPriceRefresh,
    supportsProductImport: config.supportsProductImport,
    lastRunAt: overrides?.lastRunAt || null,
    lastStatus: overrides?.lastStatus || null,
    lastMessage: overrides?.lastMessage || null,
    requiredEnvVars: config.envVars,
    missingEnvVars: isConfigured ? [] : missingEnvVars,
    publicNotes: config.publicNotes,
    safetyNotes: config.safetyNotes,
  };
}

export function createSkippedResult(connectorKey: string, reason: string): ConnectorRunResult {
  return {
    connectorKey,
    status: "skipped",
    importedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    invalidCount: 0,
    priceChangesCount: 0,
    warnings: [reason],
    errors: [],
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

// Register all connectors from docs
import { GenericCsvFeedRuntime } from "./genericCsvFeedRuntime";
import { GenericJsonFeedRuntime } from "./genericJsonFeedRuntime";
import { GenericAffiliateNetworkRuntime } from "./genericAffiliateNetworkRuntime";
import { AmazonPaapiRuntime } from "./amazonPaapiRuntime";
import { FlipkartAffiliateRuntime } from "./flipkartAffiliateRuntime";
import { CuelinksRuntime } from "./cuelinksRuntime";
import { AdmitadRuntime } from "./admitadRuntime";
import { ManualUploadRuntime } from "./manualUploadRuntime";

export function initializeRegistry(): void {
  const runtimes = [
    new ManualUploadRuntime(),
    new GenericCsvFeedRuntime(),
    new GenericJsonFeedRuntime(),
    new GenericAffiliateNetworkRuntime(),
    new AmazonPaapiRuntime(),
    new FlipkartAffiliateRuntime(),
    new CuelinksRuntime(),
    new AdmitadRuntime(),
  ];

  for (const rt of runtimes) {
    registerConnector(rt);
  }
}
