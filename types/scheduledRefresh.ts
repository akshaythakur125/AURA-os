export interface ScheduledRefreshConfig {
  connectorKey: string;
  isEnabled: boolean;
  refreshIntervalHours: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
}

export interface RefreshRun {
  id: string;
  trigger: "manual" | "scheduled" | "api" | "webhook";
  connectorKey: string | null; // null = run all
  status: "running" | "completed" | "completed_with_warnings" | "failed";
  startedAt: string;
  completedAt: string | null;
  results: RefreshConnectorResult[];
  totalImported: number;
  totalUpdated: number;
  totalSkipped: number;
  totalInvalid: number;
  totalPriceChanges: number;
  warnings: string[];
  errors: string[];
}

export interface RefreshConnectorResult {
  connectorKey: string;
  displayName: string;
  status: "success" | "partial" | "failed" | "skipped";
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  invalidCount: number;
  priceChangesCount: number;
  warnings: string[];
  errors: string[];
  startedAt: string;
  completedAt: string;
}

export interface RefreshLock {
  connectorKey: string;
  lockedAt: string;
  expiresAt: string;
  metadata?: Record<string, unknown>;
}

export type RefreshTrigger = "manual" | "scheduled" | "api" | "webhook";
