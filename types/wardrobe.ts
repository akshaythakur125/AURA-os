import type {
  AuraStyleDirection,
  WardrobeCategory,
  CommerceProduct,
} from "./commerce";

export interface WardrobeMatchInput {
  goal?: string;
  budget?: string;
  styleDirection?: AuraStyleDirection;
  preferredCategory?: WardrobeCategory;
}

export interface WardrobeFilterOptions {
  stores?: string[];
  categories?: WardrobeCategory[];
  maxBudget?: number;
  minBudget?: number;
  styleDirections?: AuraStyleDirection[];
  goal?: string;
  discountOnly?: boolean;
  affiliateOnly?: boolean;
  sponsoredOnly?: boolean;
  query?: string;
}

export interface WardrobeSearchResult {
  products: CommerceProduct[];
  totalCount: number;
  appliedFilters: WardrobeFilterOptions;
  sortBy: string;
}
