export interface ConnectorStatus {
  key: string;
  displayName: string;
  provider: string;
  sourceType: string;
  isConfigured: boolean;
  supportsTest: boolean;
  supportsRefresh: boolean;
  supportsPriceRefresh: boolean;
  supportsProductImport: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
  lastMessage: string | null;
  requiredEnvVars: string[];
  missingEnvVars: string[];
  publicNotes: string;
  safetyNotes: string;
}

export interface ConnectorRunResult {
  connectorKey: string;
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

export interface ConnectorTestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface ConnectorConfig {
  key: string;
  displayName: string;
  provider: string;
  sourceType: "csv" | "json" | "affiliate_feed" | "official_api" | "manual";
  envVars: string[];
  supportsTest: boolean;
  supportsRefresh: boolean;
  supportsPriceRefresh: boolean;
  supportsProductImport: boolean;
  isOfficial: boolean;
  publicNotes: string;
  safetyNotes: string;
}
