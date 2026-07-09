export interface CommerceSettings {
  commissionRate: number;
  defaultCommissionRate: number;
  lastUpdated: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
  warnings: string[];
  products: import("../types/commerce").CommerceProduct[];
}

export interface ExportPayload {
  catalog: import("../types/commerce").CommerceProduct[];
  affiliateLinks: { productId: string; title: string; storeKey: string; storeName: string; affiliateUrl: string; isActive: boolean }[];
  clicks: import("../types/commerce").CommerceClickEvent[];
  sponsored: import("../types/commerce").CommerceProduct[];
}

export interface ValidationWarning {
  productId: string;
  title: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface StorePerformance {
  storeKey: string;
  storeName: string;
  totalClicks: number;
  affiliateClicks: number;
  sponsoredClicks: number;
  estimatedOrderIntentValue: number;
  estimatedAffiliateRevenue: number;
  productsCount: number;
  brokenLinksCount: number;
}

export interface ProductAnalytics {
  productId: string;
  title: string;
  category: string;
  totalClicks: number;
  affiliateClicks: number;
  sponsored: boolean;
  isActive: boolean;
  offersCount: number;
  brokenLinks: number;
  lastClickedAt: string | null;
  estimatedRevenue: number;
}
