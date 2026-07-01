export type FeedSourceType = "manual_csv" | "manual_json" | "affiliate_csv" | "affiliate_json" | "official_api" | "admin_entry";

export interface FeedImportRun {
  id: string;
  sourceType: FeedSourceType;
  sourceName: string;
  storeKey?: string;
  fileName?: string;
  status: "pending" | "completed" | "completed_with_warnings" | "failed";
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  invalidCount: number;
  warnings: string[];
  errors: string[];
  createdAt: string;
  completedAt?: string;
}

export interface FeedProductRow {
  sourceProductId?: string;
  title: string;
  category?: string;
  subCategory?: string;
  storeKey: string;
  storeName?: string;
  brand?: string;
  price: number;
  mrp?: number;
  currency?: string;
  productUrl: string;
  affiliateUrl?: string;
  imageUrl?: string;
  availabilityStatus?: string;
  color?: string;
  fit?: string;
  material?: string;
  styleTags?: string;
  auraLeakTags?: string;
  goalTags?: string;
  lastCheckedAt?: string;
}

export interface FeedMapping {
  sourceColumn: string;
  targetField: string;
  transform?: string;
  required: boolean;
}

export interface FeedDetectionResult {
  format: "csv" | "json" | "unknown";
  detectedMapping: FeedMapping[];
  sampleRows: Record<string, string>[];
  columnCount: number;
  rowCount: number;
  confidence: "high" | "medium" | "low";
  warnings: string[];
}

export interface ImportPreviewResult {
  totalRows: number;
  validRows: FeedProductRow[];
  warningRows: { row: number; rowData: Record<string, string>; warnings: string[] }[];
  invalidRows: { row: number; rowData: Record<string, string>; errors: string[] }[];
  mappings: FeedMapping[];
}

export interface ImportResult {
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  invalidCount: number;
  totalProcessed: number;
  warnings: string[];
  errors: string[];
  indexRebuilt: boolean;
  runId: string;
}
