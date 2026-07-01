import type { RefreshConnectorResult } from "@/types/scheduledRefresh";
import { getAllConnectors, getConfiguredConnectors } from "@/lib/commerce/connectors/connectorRegistry";
import { acquireLock, releaseLock } from "./refreshLocks";
import { CONNECTOR_REFRESH_POLICY } from "@/config/connectorRefreshPolicy";

export interface QueueResult {
  connectorKey: string;
  displayName: string;
  result: RefreshConnectorResult;
}

export async function runConnectorQueue(connectorKeys?: string[]): Promise<{
  results: QueueResult[];
  errors: string[];
}> {
  const errors: string[] = [];
  const results: QueueResult[] = [];
  let connectors = connectorKeys
    ? getAllConnectors().filter((c) => connectorKeys.includes(c.config.key))
    : getConfiguredConnectors();

  // Limit connectors per run
  connectors = connectors.slice(0, CONNECTOR_REFRESH_POLICY.maxConnectorsPerRun);

  for (const connector of connectors) {
    const cfg = connector.config;
    const status = connector.getStatus();

    // Skip unconfigured connectors
    if (!status.isConfigured) {
      results.push({
        connectorKey: cfg.key,
        displayName: cfg.displayName,
        result: {
          connectorKey: cfg.key, displayName: cfg.displayName, status: "skipped",
          importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
          warnings: ["Connector not configured — missing env vars"],
          errors: [], startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
        },
      });
      continue;
    }

    // Skip connectors that don't support refresh
    if (!cfg.supportsRefresh) {
      results.push({
        connectorKey: cfg.key,
        displayName: cfg.displayName,
        result: {
          connectorKey: cfg.key, displayName: cfg.displayName, status: "skipped",
          importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
          warnings: [`${cfg.displayName} does not support automated refresh`],
          errors: [], startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
        },
      });
      continue;
    }

    // Acquire lock
    if (!acquireLock(cfg.key)) {
      results.push({
        connectorKey: cfg.key,
        displayName: cfg.displayName,
        result: {
          connectorKey: cfg.key, displayName: cfg.displayName, status: "skipped",
          importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
          warnings: ["Refresh already in progress or locked"],
          errors: [], startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
        },
      });
      continue;
    }

    try {
      const runResult = await connector.refresh();
      results.push({
        connectorKey: cfg.key,
        displayName: cfg.displayName,
        result: { ...runResult, displayName: cfg.displayName },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push(`[${cfg.key}] ${msg}`);
      results.push({
        connectorKey: cfg.key,
        displayName: cfg.displayName,
        result: {
          connectorKey: cfg.key, displayName: cfg.displayName, status: "failed",
          importedCount: 0, updatedCount: 0, skippedCount: 0, invalidCount: 0, priceChangesCount: 0,
          warnings: [], errors: [msg],
          startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
        },
      });
    } finally {
      releaseLock(cfg.key);
    }
  }

  return { results, errors };
}
