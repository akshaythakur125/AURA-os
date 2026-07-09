export interface WishlistItem {
  id: string;
  productId: string;
  offerId?: string;
  storeKey?: string;
  auditId?: string;
  anonymousId?: string;
  productTitle: string;
  category: string;
  styleDirection?: string;
  linkedAuraLeak?: string;
  savedPrice: number;
  currentPrice?: number;
  targetPrice?: number;
  priceFreshness?: string;
  affiliateUsed?: boolean;
  source: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedWardrobeBundle {
  id: string;
  auditId?: string;
  anonymousId?: string;
  title: string;
  styleDirection: string;
  budgetRange: string;
  productIds: string[];
  offerIds: string[];
  savedTotalPrice: number;
  currentTotalPrice?: number;
  expectedAuraShift: string;
  whatToAvoid: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealAlert {
  id: string;
  wishlistItemId?: string;
  anonymousId?: string;
  productId: string;
  offerId?: string;
  storeKey: string;
  alertType: "price_drop" | "target_price_hit" | "strong_discount" | "stale_price_warning" | "back_in_stock" | "better_store_found";
  oldPrice?: number;
  newPrice?: number;
  targetPrice?: number;
  message: string;
  severity: "low" | "medium" | "high";
  isRead: boolean;
  createdAt: string;
}

export interface WishlistStats {
  totalItems: number;
  totalBundles: number;
  activeAlerts: number;
  unreadAlerts: number;
  biggestPriceDrop: number;
  biggestPriceDropTitle: string;
  mostSavedCategory: string;
  mostSavedStore: string;
  highestIntentProduct: string;
  totalClicksFromSaved: number;
}
