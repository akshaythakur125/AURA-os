import type { StoreKey, AuraLeakTag, AuraStyleDirection, WardrobeCategory } from "./commerce";
import type { PriceFreshnessStatus } from "./priceFreshness";
import type { ConnectorSourceType } from "./storeConnector";

// ─── CommerceSearchItem (normalized index record) ───

export interface CommerceSearchItem {
  id: string;
  sourceProductId: string;
  normalizedTitle: string;
  originalTitle: string;
  category: WardrobeCategory;
  subCategory?: string;
  storeKey: StoreKey;
  storeName: string;
  brand?: string;
  colorTags: string[];
  styleTags: string[];
  auraLeakTags: AuraLeakTag[];
  goalTags: string[];
  fitTags: string[];
  materialTags?: string[];
  genderPresentationTags?: string[];
  price: number;
  mrp?: number;
  discountPercent?: number;
  currency: "INR";
  productUrl: string;
  affiliateUrl?: string;
  imageUrl?: string;
  availabilityStatus: "available" | "unknown" | "out_of_stock";
  sourceType: ConnectorSourceType;
  sourceName: string;
  priceFreshness: PriceFreshnessStatus;
  lastCheckedAt?: string;
  lastCheckedText: string;
  confidenceScore: number;
  searchTokens: string[];
  comparableGroupKey: string;
  isSponsored: boolean;
  isAffiliate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Search Types ───

export interface CommerceSearchInput {
  query?: string;
  auditId?: string;
  anonymousId?: string;
  category?: WardrobeCategory;
  storeKeys?: StoreKey[];
  budgetMin?: number;
  budgetMax?: number;
  styleDirection?: AuraStyleDirection;
  auraLeakTags?: AuraLeakTag[];
  goal?: string;
  limit?: number;
  sort?: CommerceSearchSort;
}

export type CommerceSearchSort =
  | "aura_best"
  | "cheapest"
  | "best_value"
  | "highest_discount"
  | "fresh_price"
  | "store_trust";

export interface CommerceSearchResult {
  item: CommerceSearchItem;
  auraMatchScore: number;
  priceValueScore: number;
  freshnessScore: number;
  finalRankScore: number;
  reason: string;
  linkedAuraLeak?: AuraLeakTag;
  stylingTip: string;
  priceWarning?: string;
  dealLabel?: string;
  comparisonGroup: ComparableGroup;
}

export interface CommerceSearchResponse {
  results: CommerceSearchResult[];
  comparisonGroups: ComparableGroup[];
  filtersUsed: CommerceSearchInput;
  freshnessSummary: FreshnessSummary;
  catalogSource: string;
  totalResults: number;
}

export interface ComparableGroup {
  key: string;
  label: string;
  items: CommerceSearchItem[];
  cheapest: CommerceSearchItem | null;
  bestValue: CommerceSearchItem | null;
  highestDiscount: CommerceSearchItem | null;
  trustedStore: CommerceSearchItem | null;
  affiliateOption: CommerceSearchItem | null;
}

export interface FreshnessSummary {
  fresh: number;
  recent: number;
  stale: number;
  manual: number;
  unknown: number;
  total: number;
  warnings: string[];
}

// ─── Aura Search Ranking ───

export interface AuraSearchRankingInput {
  item: CommerceSearchItem;
  queryTokens: string[];
  matchedAuraLeaks: AuraLeakTag[];
  matchedStyles: AuraStyleDirection[];
  matchedGoals: string[];
  budgetMin?: number;
  budgetMax?: number;
  category?: WardrobeCategory;
}

export interface AuraSearchRankingScore {
  auraMatchScore: number;
  styleGoalScore: number;
  categoryScore: number;
  budgetScore: number;
  priceValueScore: number;
  freshnessScore: number;
  sponsoredBoost: number;
  finalRankScore: number;
  reason: string;
  linkedAuraLeak?: AuraLeakTag;
  stylingTip: string;
  priceWarning?: string;
  dealLabel?: string;
}

export interface ComparableItemGroup {
  key: string;
  items: CommerceSearchItem[];
}

// ─── Index Rebuild ───

export interface IndexRebuildResult {
  indexedCount: number;
  invalidCount: number;
  totalProcessed: number;
  warnings: string[];
  catalogSource: string;
  timestamp: string;
}

export interface IndexRebuildInput {
  adminCode?: string;
  sources?: ("supabase" | "local_admin" | "static_catalog")[];
}

// ─── Click Tracking (extended) ───

export interface SearchClickEvent {
  productId: string;
  sourceProductId: string;
  storeKey: StoreKey;
  price: number;
  rankPosition: number;
  searchQuery?: string;
  auditId?: string;
  affiliateUsed: boolean;
  freshnessLabel: string;
  clickedAt: string;
}
