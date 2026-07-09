import type { RefreshRun, RefreshConnectorResult, RefreshTrigger } from "@/types/scheduledRefresh";
import { getItem, setItem } from "@/lib/storage/localStore";

const HISTORY_KEY = "auracheck:v1:refresh_history";
const MAX_RECORDS = 100;

export function getRefreshHistory(): RefreshRun[] {
  return getItem<RefreshRun[]>(HISTORY_KEY, []);
}

export function addRefreshRun(run: RefreshRun): void {
  const history = getRefreshHistory();
  history.push(run);
  setItem(HISTORY_KEY, history.slice(-MAX_RECORDS));
}

export function getLatestRefreshRun(): RefreshRun | null {
  const history = getRefreshHistory();
  return history.length > 0 ? history[history.length - 1] : null;
}

export function getRefreshRunsByConnector(connectorKey: string): RefreshRun[] {
  return getRefreshHistory().filter((r) => r.connectorKey === connectorKey || r.connectorKey === null);
}

export function createRefreshRun(params: {
  trigger: RefreshTrigger;
  connectorKey: string | null;
}): RefreshRun {
  return {
    id: `refresh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    trigger: params.trigger,
    connectorKey: params.connectorKey,
    status: "running",
    startedAt: new Date().toISOString(),
    completedAt: null,
    results: [],
    totalImported: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalInvalid: 0,
    totalPriceChanges: 0,
    warnings: [],
    errors: [],
  };
}

export function completeRefreshRun(
  run: RefreshRun,
  results: RefreshConnectorResult[],
  errors: string[]
): RefreshRun {
  const totalImported = results.reduce((s, r) => s + r.importedCount, 0);
  const totalUpdated = results.reduce((s, r) => s + r.updatedCount, 0);
  const totalSkipped = results.reduce((s, r) => s + r.skippedCount, 0);
  const totalInvalid = results.reduce((s, r) => s + r.invalidCount, 0);
  const totalPriceChanges = results.reduce((s, r) => s + r.priceChangesCount, 0);
  const allWarnings = results.flatMap((r) => r.warnings);
  const allErrors = [...errors, ...results.flatMap((r) => r.errors)];

  const hasFailures = results.some((r) => r.status === "failed");
  const hasPartials = results.some((r) => r.status === "partial");

  return {
    ...run,
    status: hasFailures ? "completed_with_warnings" : hasPartials ? "completed_with_warnings" : "completed",
    completedAt: new Date().toISOString(),
    results,
    totalImported,
    totalUpdated,
    totalSkipped,
    totalInvalid,
    totalPriceChanges,
    warnings: allWarnings,
    errors: allErrors,
  };
}

export function getRefreshStats(): {
  totalRuns: number;
  lastRunAt: string | null;
  lastStatus: string | null;
  totalImported: number;
  totalUpdated: number;
  totalPriceChanges: number;
  successRate: number;
} {
  const history = getRefreshHistory();
  if (history.length === 0) {
    return { totalRuns: 0, lastRunAt: null, lastStatus: null, totalImported: 0, totalUpdated: 0, totalPriceChanges: 0, successRate: 0 };
  }

  const last = history[history.length - 1];
  const successful = history.filter((r) => r.status === "completed").length;

  return {
    totalRuns: history.length,
    lastRunAt: last.completedAt,
    lastStatus: last.status,
    totalImported: history.reduce((s, r) => s + r.totalImported, 0),
    totalUpdated: history.reduce((s, r) => s + r.totalUpdated, 0),
    totalPriceChanges: history.reduce((s, r) => s + r.totalPriceChanges, 0),
    successRate: history.length > 0 ? Math.round((successful / history.length) * 100) : 0,
  };
}
