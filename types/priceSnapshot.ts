export interface PriceSnapshot {
  id: string;
  productId: string;
  offerId: string;
  storeKey: string;
  price: number;
  mrp?: number;
  discountPercent?: number;
  sourceType: string;
  sourceName: string;
  checkedAt: string;
  freshness: "fresh" | "recent" | "stale" | "manual" | "unknown";
  confidenceScore: number;
}

export interface PriceChange {
  productId: string;
  offerId: string;
  storeKey: string;
  currentPrice: number;
  previousPrice: number | null;
  priceDiff: number;
  priceDiffPercent: number;
  direction: "up" | "down" | "stable" | "new";
  lastCheckedAt: string;
  previousCheckedAt: string | null;
  freshness: string;
}

export interface PriceSnapshotSummary {
  totalSnapshots: number;
  uniqueProducts: number;
  byFreshness: Record<string, number>;
  recentChanges: PriceChange[];
}
