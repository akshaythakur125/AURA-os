import type { StoreKey } from "./commerce";

export type ConnectorSourceType = "manual" | "csv" | "json" | "official_api" | "affiliate_feed";

export interface StoreConnectorConfig {
  key: string;
  displayName: string;
  storeKey: StoreKey;
  sourceType: ConnectorSourceType;
  supportsLiveApi: boolean;
  supportsFeedImport: boolean;
  supportsAffiliateLinks: boolean;
  isActive: boolean;
  notes: string;
  requiredCredentials: string[];
  feedFormatHint: string;
  apiDocsUrl?: string;
}

export interface ConnectorImportResult {
  connectorKey: string;
  importedCount: number;
  invalidCount: number;
  invalidItems: ConnectorInvalidItem[];
  warnings: string[];
  status: "success" | "partial" | "failed";
  error?: string;
  timestamp: string;
}

export interface ConnectorInvalidItem {
  index: number;
  field: string;
  message: string;
  value?: unknown;
}

export interface ConnectorStatus {
  connectorKey: string;
  displayName: string;
  sourceType: ConnectorSourceType;
  isConfigured: boolean;
  isActive: boolean;
  lastImportAt: string | null;
  lastImportCount: number | null;
  indexedProductCount: number;
  error?: string;
}

export interface NormalizedProductInput {
  sourceProductId: string;
  normalizedTitle: string;
  originalTitle: string;
  category: string;
  subCategory?: string;
  storeKey: StoreKey;
  storeName: string;
  brand?: string;
  colorTags: string[];
  styleTags: string[];
  auraLeakTags: string[];
  goalTags: string[];
  fitTags: string[];
  materialTags?: string[];
  genderPresentationTags?: string[];
  price: number;
  mrp?: number;
  discountPercent?: number;
  currency: string;
  productUrl: string;
  affiliateUrl?: string;
  imageUrl?: string;
  availabilityStatus: "available" | "unknown" | "out_of_stock";
  isSponsored: boolean;
  isAffiliate: boolean;
}
