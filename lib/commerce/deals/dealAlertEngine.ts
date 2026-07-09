import type { DealAlert, WishlistItem } from "@/types/wishlist";
import type { CommerceSearchItem } from "@/types/commerceSearch";
import { findCatalogMatch } from "./priceDropDetector";
import { buildComparableGroups } from "@/lib/commerce/search/similarProductGrouping";
import { getItem, setItem } from "@/lib/storage/localStore";

const ALERTS_KEY = "auracheck:v1:deal_alerts";

export function getDealAlerts(): DealAlert[] {
  return getItem<DealAlert[]>(ALERTS_KEY, []);
}

export function saveDealAlerts(alerts: DealAlert[]): void {
  setItem(ALERTS_KEY, alerts.slice(-200));
}

export function addDealAlert(alert: DealAlert): void {
  const alerts = getDealAlerts();
  alerts.push(alert);
  saveDealAlerts(alerts);
}

export function markAlertRead(id: string): void {
  const alerts = getDealAlerts();
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx >= 0) {
    alerts[idx].isRead = true;
    saveDealAlerts(alerts);
  }
}

export function markAllAlertsRead(): void {
  saveDealAlerts(getDealAlerts().map((a) => ({ ...a, isRead: true })));
}

export function getUnreadAlerts(): DealAlert[] {
  return getDealAlerts().filter((a) => !a.isRead);
}

export function runDealAlertCheck(
  wishlistItems: WishlistItem[],
  catalogItems: CommerceSearchItem[]
): DealAlert[] {
  const newAlerts: DealAlert[] = [];

  for (const item of wishlistItems) {
    const match = findCatalogMatch(item, catalogItems);
    if (!match) continue;

    const alerts = checkItem(item, match, catalogItems);
    newAlerts.push(...alerts);
  }

  // Save new alerts
  if (newAlerts.length > 0) {
    const existing = getDealAlerts();
    saveDealAlerts([...existing, ...newAlerts]);
  }

  return newAlerts;
}

function checkItem(
  item: WishlistItem,
  match: CommerceSearchItem,
  allCatalog: CommerceSearchItem[]
): DealAlert[] {
  const alerts: DealAlert[] = [];
  const now = new Date().toISOString();

  // Price drop detection
  if (item.savedPrice > match.price) {
    const dropAmount = item.savedPrice - match.price;
    const dropPercent = Math.round((dropAmount / item.savedPrice) * 100);

    if (dropAmount >= 100 && dropPercent >= 10) {
      alerts.push({
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        wishlistItemId: item.id,
        productId: item.productId,
        offerId: item.offerId,
        storeKey: match.storeKey,
        alertType: "price_drop",
        oldPrice: item.savedPrice,
        newPrice: match.price,
        message: `${item.productTitle} dropped by ₹${dropAmount} (${dropPercent}%)`,
        severity: dropPercent >= 25 ? "high" : dropPercent >= 15 ? "medium" : "low",
        isRead: false,
        createdAt: now,
      });
    }
  }

  // Target price hit
  if (item.targetPrice !== undefined && item.targetPrice > 0 && match.price <= item.targetPrice) {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      wishlistItemId: item.id,
      productId: item.productId,
      offerId: item.offerId,
      storeKey: match.storeKey,
      alertType: "target_price_hit",
      oldPrice: item.savedPrice,
      newPrice: match.price,
      targetPrice: item.targetPrice,
      message: `${item.productTitle} is now ₹${match.price} — at or below your target of ₹${item.targetPrice}`,
      severity: "high",
      isRead: false,
      createdAt: now,
    });
  }

  // Strong discount (40%+ with valid MRP)
  if (match.discountPercent && match.discountPercent >= 40 && match.mrp && match.mrp > match.price) {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      wishlistItemId: item.id,
      productId: item.productId,
      offerId: item.offerId,
      storeKey: match.storeKey,
      alertType: "strong_discount",
      oldPrice: match.mrp,
      newPrice: match.price,
      message: `${item.productTitle} at ${match.discountPercent}% off — ₹${match.price} vs MRP ₹${match.mrp}`,
      severity: match.discountPercent >= 50 ? "high" : "medium",
      isRead: false,
      createdAt: now,
    });
  }

  // Stale price warning
  if (match.priceFreshness === "stale" || match.priceFreshness === "unknown") {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      wishlistItemId: item.id,
      productId: item.productId,
      offerId: item.offerId,
      storeKey: match.storeKey,
      alertType: "stale_price_warning",
      message: `${item.productTitle} price is ${match.priceFreshness === "stale" ? "outdated" : "unverified"}. Verify on store.`,
      severity: "low",
      isRead: false,
      createdAt: now,
    });
  }

  // Better store found (same comparable group, lower price)
  const groups = buildComparableGroups(allCatalog);
  const itemGroup = groups.find((g) => g.items.some((i) => i.id === match.id));
  if (itemGroup && itemGroup.cheapest && itemGroup.cheapest.id !== match.id && itemGroup.cheapest.price < match.price) {
    alerts.push({
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      wishlistItemId: item.id,
      productId: item.productId,
      storeKey: itemGroup.cheapest.storeKey,
      alertType: "better_store_found",
      oldPrice: match.price,
      newPrice: itemGroup.cheapest.price,
      message: `${item.productTitle} also available at ${itemGroup.cheapest.storeName} for ₹${itemGroup.cheapest.price} (₹${match.price - itemGroup.cheapest.price} less)`,
      severity: "medium",
      isRead: false,
      createdAt: now,
    });
  }

  return alerts;
}

export function getDealAlertStats(): {
  total: number;
  unread: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
} {
  const alerts = getDealAlerts();
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  for (const a of alerts) {
    byType[a.alertType] = (byType[a.alertType] || 0) + 1;
    bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
  }

  return {
    total: alerts.length,
    unread: alerts.filter((a) => !a.isRead).length,
    byType,
    bySeverity,
  };
}
