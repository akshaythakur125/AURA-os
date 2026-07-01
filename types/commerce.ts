export type StoreKey =
  | "myntra"
  | "ajio"
  | "amazon_fashion"
  | "flipkart_fashion"
  | "tata_cliq"
  | "nykaa_fashion"
  | "meesho"
  | "snitch"
  | "souled_store"
  | "bewakoof"
  | "hm_india"
  | "narzo_manual"
  | "other";

export interface StoreInfo {
  key: StoreKey;
  displayName: string;
  homepageUrl: string;
  categoryBaseUrl?: string;
  affiliateSupported: boolean;
  notes: string;
  isActive: boolean;
  trustWeight: number;
}

export type AuraLeakTag =
  | "weak_lighting"
  | "busy_background"
  | "weak_clarity"
  | "weak_framing"
  | "outfit_inconsistency"
  | "low_premium_signal"
  | "over_flex"
  | "too_plain"
  | "color_mismatch"
  | "weak_profile_order"
  | "professional_mismatch"
  | "dating_warmth_missing"
  | "creator_energy_missing";

export type AuraStyleDirection =
  | "clean_basic"
  | "premium_minimal"
  | "urban_aspirational"
  | "soft_luxury"
  | "creator_bold"
  | "college_casual"
  | "corporate_sharp"
  | "dating_warm"
  | "understated_confident"
  | "street_smart"
  | "ethnic_clean"
  | "gym_casual";

export type WardrobeCategory =
  | "tshirt"
  | "shirt"
  | "overshirt"
  | "jeans"
  | "trousers"
  | "chinos"
  | "sneakers"
  | "formal_shoes"
  | "watch"
  | "belt"
  | "sunglasses"
  | "jacket"
  | "hoodie"
  | "kurta"
  | "perfume"
  | "grooming"
  | "background_item"
  | "photo_accessory";

export type AvailabilityStatus = "available" | "unknown" | "out_of_stock";

export interface ProductOffer {
  id: string;
  storeKey: StoreKey;
  storeName: string;
  productName: string;
  price: number;
  mrp?: number;
  discountPercent?: number;
  url: string;
  affiliateUrl?: string;
  availabilityStatus: AvailabilityStatus;
  sizeNotes?: string;
  colorNotes?: string;
  lastCheckedText: string;
  isAffiliate: boolean;
  isSponsored: boolean;
  updatedAt: string;
}

export interface CommerceProduct {
  id: string;
  title: string;
  category: WardrobeCategory;
  styleDirections: AuraStyleDirection[];
  auraLeakTags: AuraLeakTag[];
  goalTags: string[];
  colorTags: string[];
  fitTags: string[];
  genderPresentationTags?: string[];
  description: string;
  whyItImprovesAura: string;
  stylingTip: string;
  avoidIf?: string;
  priorityScore: number;
  isSponsored: boolean;
  isActive: boolean;
  offers: ProductOffer[];
  createdAt: string;
  updatedAt: string;
}

export interface AuraCommerceRecommendation {
  product: CommerceProduct;
  bestPriceOffer: ProductOffer;
  bestValueOffer: ProductOffer;
  highestDiscountOffer?: ProductOffer;
  cheapestOffer: ProductOffer;
  offersSortedByPrice: ProductOffer[];
  matchScore: number;
  auraImpactScore: number;
  priceValueScore: number;
  dealScore: number;
  reason: string;
  linkedAuraLeak?: AuraLeakTag;
  stylingTip: string;
  buyPriority: "buy_first" | "buy_later" | "avoid_for_now";
  avoidReason?: string;
}

export interface AuraOutfitBundle {
  id: string;
  title: string;
  auditId?: string;
  styleDirection: AuraStyleDirection;
  budgetRange: string;
  primaryAuraLeak?: AuraLeakTag;
  items: AuraCommerceRecommendation[];
  totalCheapestPrice: number;
  totalBestValuePrice: number;
  storeMix: StoreKey[];
  expectedAuraShift: string;
  whyThisBundleWorks: string;
  whatToAvoid: string;
  finalAdvice: string;
  createdAt: string;
}

export interface AuraCommercePlan {
  diagnosis: StyleDiagnosisResult;
  topRecommendations: AuraCommerceRecommendation[];
  outfitBundles: AuraOutfitBundle[];
  bestSingleUpgrade: AuraCommerceRecommendation | null;
  cheapestUsefulUpgrade: AuraCommerceRecommendation | null;
  highestAuraImpactUpgrade: AuraCommerceRecommendation | null;
  whatNotToBuy: AuraCommerceRecommendation[];
  finalAdvice: string;
}

export interface StyleDiagnosisResult {
  primaryAuraLeak: AuraLeakTag;
  styleDirection: AuraStyleDirection;
  colorPalette: string[];
  recommendedCategories: WardrobeCategory[];
  avoidCategories: WardrobeCategory[];
  outfitPrinciple: string;
  explanation: string;
}

export interface CommerceClickEvent {
  productId: string;
  offerId: string;
  storeKey: StoreKey;
  auditId?: string;
  source: string;
  productPrice: number;
  affiliateUsed: boolean;
  clickedAt: string;
}

export interface CommerceAnalytics {
  totalRecommendationViews: number;
  totalProductClicks: number;
  topClickedStores: { store: string; count: number }[];
  topClickedCategories: { category: string; count: number }[];
  topClickedProducts: { productId: string; title: string; count: number }[];
  affiliateClicks: number;
  sponsoredClicks: number;
  mostCommonStyleDirection: string | null;
  mostCommonOutfitGap: string | null;
  bestPerformingBudgetRange: string | null;
}
