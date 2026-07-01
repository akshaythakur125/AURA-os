import { initializeRegistry, getConnector } from "@/lib/commerce/connectors/connectorRegistry";
import { acquireLock, releaseLock } from "./refreshLocks";
import type { ConnectorRunResult } from "@/types/connectorRuntime";

export async function runSingleConnectorRefresh(connectorKey: string): Promise<ConnectorRunResult> {
  initializeRegistry();

  const connector = getConnector(connectorKey);
  if (!connector) {
    return {
      connectorKey, status: "failed",
      importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
      warnings: [], errors: [`Unknown connector: ${connectorKey}`],
      startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
    };
  }

  const status = connector.getStatus();
  if (!status.isConfigured) {
    return {
      connectorKey, status: "skipped",
      importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
      warnings: ["Connector not configured"],
      errors: status.missingEnvVars.map((v) => `Missing env var: ${v}`),
      startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
    };
  }

  if (!acquireLock(connectorKey)) {
    return {
      connectorKey, status: "skipped",
      importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
      warnings: ["Refresh already in progress"],
      errors: [],
      startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
    };
  }

  try {
    const result = await connector.refresh();
    return result;
  } catch (err) {
    return {
      connectorKey, status: "failed",
      importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
      warnings: [], errors: [err instanceof Error ? err.message : "Unknown error"],
      startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
    };
  } finally {
    releaseLock(connectorKey);
  }
}
