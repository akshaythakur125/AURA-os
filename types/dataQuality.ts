export interface DataQualityWarning {
  productId: string;
  offerId?: string;
  warningType: DataQualityWarningType;
  severity: "error" | "warning" | "info";
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
}

export type DataQualityWarningType =
  | "price_zero"
  | "mrp_less_than_price"
  | "discount_too_high"
  | "suspicious_discount_pattern"
  | "sudden_price_drop"
  | "sudden_price_rise"
  | "missing_url"
  | "broken_url"
  | "unknown_store"
  | "stale_price"
  | "missing_affiliate_link"
  | "missing_image"
  | "low_confidence"
  | "duplicate_product"
  | "no_clicks"
  | "high_clicks_stale_price";

export interface DataQualitySummary {
  totalIndexed: number;
  activeProducts: number;
  inactiveProducts: number;
  stalePrices: number;
  manualPrices: number;
  unknownPrices: number;
  suspiciousDiscounts: number;
  invalidUrls: number;
  missingAffiliateLinks: number;
  missingImages: number;
  duplicateProducts: number;
  lowConfidenceProducts: number;
  noClickProducts: number;
  highClickStalePrices: number;
  warnings: DataQualityWarning[];
}

export interface QualityExportRow {
  productId: string;
  title: string;
  store: string;
  price: number;
  freshness: string;
  confidence: number;
  warnings: string[];
  url: string;
  affiliateUrl: string;
  clicks: number;
}
