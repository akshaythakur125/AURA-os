import type { FeedImportRun, FeedSourceType } from "@/types/feedImport";
import { getItem, setItem } from "@/lib/storage/localStore";

const IMPORT_HISTORY_KEY = "auracheck:v1:feed_import_history";

export function getImportHistory(): FeedImportRun[] {
  return getItem<FeedImportRun[]>(IMPORT_HISTORY_KEY, []);
}

export function addImportRun(run: FeedImportRun): void {
  const history = getImportHistory();
  history.push(run);
  setItem(IMPORT_HISTORY_KEY, history.slice(-100));
}

export function getLatestImportRun(): FeedImportRun | null {
  const history = getImportHistory();
  return history.length > 0 ? history[history.length - 1] : null;
}

export function getImportRunsBySource(sourceType: FeedSourceType): FeedImportRun[] {
  return getImportHistory().filter((r) => r.sourceType === sourceType);
}

export function createImportRun(params: {
  sourceType: FeedSourceType;
  sourceName: string;
  storeKey?: string;
  fileName?: string;
}): FeedImportRun {
  return {
    id: `feed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    sourceType: params.sourceType,
    sourceName: params.sourceName,
    storeKey: params.storeKey,
    fileName: params.fileName,
    status: "pending",
    importedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    invalidCount: 0,
    warnings: [],
    errors: [],
    createdAt: new Date().toISOString(),
  };
}

export function completeImportRun(
  run: FeedImportRun,
  result: {
    importedCount: number;
    updatedCount: number;
    skippedCount: number;
    invalidCount: number;
    warnings: string[];
    errors: string[];
  }
): FeedImportRun {
  const status = result.errors.length > 0
    ? "completed_with_warnings"
    : result.warnings.length > 0
      ? "completed_with_warnings"
      : "completed";

  return {
    ...run,
    status,
    importedCount: result.importedCount,
    updatedCount: result.updatedCount,
    skippedCount: result.skippedCount,
    invalidCount: result.invalidCount,
    warnings: result.warnings,
    errors: result.errors,
    completedAt: new Date().toISOString(),
  };
}

export function getImportStats(): {
  totalRuns: number;
  totalImported: number;
  totalUpdated: number;
  totalSkipped: number;
  totalInvalid: number;
  lastRunDate: string | null;
  runsByType: Record<string, number>;
} {
  const history = getImportHistory();
  const runsByType: Record<string, number> = {};

  for (const run of history) {
    runsByType[run.sourceType] = (runsByType[run.sourceType] || 0) + 1;
  }

  return {
    totalRuns: history.length,
    totalImported: history.reduce((s, r) => s + r.importedCount, 0),
    totalUpdated: history.reduce((s, r) => s + r.updatedCount, 0),
    totalSkipped: history.reduce((s, r) => s + r.skippedCount, 0),
    totalInvalid: history.reduce((s, r) => s + r.invalidCount, 0),
    lastRunDate: history.length > 0 ? history[history.length - 1].createdAt : null,
    runsByType,
  };
}
