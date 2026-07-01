import type { RefreshRun, RefreshConnectorResult, RefreshTrigger } from "@/types/scheduledRefresh";
import { initializeRegistry, getConnectorStatuses } from "@/lib/commerce/connectors/connectorRegistry";
import { runConnectorQueue } from "./refreshQueue";
import { createRefreshRun, completeRefreshRun, addRefreshRun } from "./refreshReport";
import { clearExpiredLocks } from "./refreshLocks";

export async function runScheduledRefresh(trigger: RefreshTrigger, connectorKey?: string): Promise<RefreshRun> {
  initializeRegistry();
  clearExpiredLocks();

  const run = createRefreshRun({ trigger, connectorKey: connectorKey || null });

  try {
    const keys = connectorKey ? [connectorKey] : undefined;
    const { results, errors } = await runConnectorQueue(keys);

    const connectorResults: RefreshConnectorResult[] = results.map((r) => r.result);
    const completed = completeRefreshRun(run, connectorResults, errors);

    // Rebuild index if any imports happened
    if (completed.totalImported > 0 || completed.totalUpdated > 0) {
      try {
        const { saveSearchIndexMeta, getSearchIndex } = await import("@/lib/storage/commerceSearchStore");
        saveSearchIndexMeta({
          indexedCount: getSearchIndex().length,
          catalogSource: "scheduled_refresh",
          builtAt: new Date().toISOString(),
        });
      } catch {
        // metadata save is optional
      }
    }

    addRefreshRun(completed);
    return completed;
  } catch (err) {
    const failed = completeRefreshRun(run, [], [err instanceof Error ? err.message : "Unknown error"]);
    addRefreshRun(failed);
    return failed;
  }
}

export function getRefreshReadyStatus(): {
  all: number;
  configured: number;
  refreshable: number;
  notConfigured: number;
  connectors: Array<{ key: string; displayName: string; isConfigured: boolean; supportsRefresh: boolean }>;
} {
  initializeRegistry();
  const statuses = getConnectorStatuses();

  return {
    all: statuses.length,
    configured: statuses.filter((s) => s.isConfigured).length,
    refreshable: statuses.filter((s) => s.isConfigured && s.supportsRefresh).length,
    notConfigured: statuses.filter((s) => !s.isConfigured).length,
    connectors: statuses.map((s) => ({
      key: s.key,
      displayName: s.displayName,
      isConfigured: s.isConfigured,
      supportsRefresh: s.supportsRefresh,
    })),
  };
}
