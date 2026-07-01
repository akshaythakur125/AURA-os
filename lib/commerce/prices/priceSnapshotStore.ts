import type { PriceSnapshot, PriceChange, PriceSnapshotSummary } from "@/types/priceSnapshot";
import { getItem, setItem } from "@/lib/storage/localStore";

const SNAPSHOTS_KEY = "auracheck:v1:price_snapshots";
const MAX_SNAPSHOTS = 5000;

export function getPriceSnapshots(): PriceSnapshot[] {
  return getItem<PriceSnapshot[]>(SNAPSHOTS_KEY, []);
}

export function addPriceSnapshot(snapshot: PriceSnapshot): void {
  const snapshots = getPriceSnapshots();
  snapshots.push(snapshot);
  setItem(SNAPSHOTS_KEY, snapshots.slice(-MAX_SNAPSHOTS));
}

export function addPriceSnapshots(newSnapshots: PriceSnapshot[]): void {
  const existing = getPriceSnapshots();
  const all = [...existing, ...newSnapshots];
  setItem(SNAPSHOTS_KEY, all.slice(-MAX_SNAPSHOTS));
}

export function clearSnapshots(): void {
  setItem(SNAPSHOTS_KEY, []);
}

export function getLatestSnapshot(productId: string, offerId: string): PriceSnapshot | null {
  const snapshots = getPriceSnapshots()
    .filter((s) => s.productId === productId && s.offerId === offerId)
    .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());

  return snapshots[0] || null;
}

export function getPreviousSnapshot(productId: string, offerId: string): PriceSnapshot | null {
  const snapshots = getPriceSnapshots()
    .filter((s) => s.productId === productId && s.offerId === offerId)
    .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());

  return snapshots.length >= 2 ? snapshots[1] : null;
}

export function getPriceChange(productId: string, offerId: string): PriceChange | null {
  const latest = getLatestSnapshot(productId, offerId);
  if (!latest) return null;

  const previous = getPreviousSnapshot(productId, offerId);
  if (!previous) {
    return {
      productId,
      offerId,
      storeKey: latest.storeKey,
      currentPrice: latest.price,
      previousPrice: null,
      priceDiff: 0,
      priceDiffPercent: 0,
      direction: "new",
      lastCheckedAt: latest.checkedAt,
      previousCheckedAt: null,
      freshness: latest.freshness,
    };
  }

  const priceDiff = latest.price - previous.price;
  const priceDiffPercent = previous.price > 0 ? Math.round((priceDiff / previous.price) * 100) : 0;
  const direction = priceDiff > 0 ? "up" : priceDiff < 0 ? "down" : "stable";

  return {
    productId,
    offerId,
    storeKey: latest.storeKey,
    currentPrice: latest.price,
    previousPrice: previous.price,
    priceDiff: Math.abs(priceDiff),
    priceDiffPercent: Math.abs(priceDiffPercent),
    direction,
    lastCheckedAt: latest.checkedAt,
    previousCheckedAt: previous.checkedAt,
    freshness: latest.freshness,
  };
}

export function getRecentPriceChanges(limit: number = 50): PriceChange[] {
  const snapshots = getPriceSnapshots();
  const uniquePairs = new Set<string>();
  const changes: PriceChange[] = [];

  // Sort newest first
  const sorted = [...snapshots].sort(
    (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
  );

  for (const snapshot of sorted) {
    const key = `${snapshot.productId}:${snapshot.offerId}`;
    if (uniquePairs.has(key)) continue;
    uniquePairs.add(key);

    const change = getPriceChange(snapshot.productId, snapshot.offerId);
    if (change) {
      changes.push(change);
    }

    if (changes.length >= limit) break;
  }

  return changes;
}

export function getSnapshotSummary(): PriceSnapshotSummary {
  const snapshots = getPriceSnapshots();
  const uniqueProducts = new Set(snapshots.map((s) => s.productId));
  const byFreshness: Record<string, number> = {};

  for (const s of snapshots) {
    byFreshness[s.freshness] = (byFreshness[s.freshness] || 0) + 1;
  }

  return {
    totalSnapshots: snapshots.length,
    uniqueProducts: uniqueProducts.size,
    byFreshness,
    recentChanges: getRecentPriceChanges(20),
  };
}
