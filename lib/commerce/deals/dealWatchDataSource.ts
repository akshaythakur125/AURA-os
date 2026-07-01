import type { WishlistItem, SavedWardrobeBundle, DealAlert } from "@/types/wishlist";
import type { CommerceSearchItem } from "@/types/commerceSearch";
import { getWishlistItems, updateCurrentPrices } from "@/lib/commerce/wishlist/wishlistStore";
import { getSavedBundles } from "@/lib/commerce/wishlist/savedWardrobeStore";
import { getDealAlerts, getUnreadAlerts } from "./dealAlertEngine";

export interface DealWatchData {
  wishlist: WishlistItem[];
  bundles: SavedWardrobeBundle[];
  alerts: DealAlert[];
  unreadAlerts: DealAlert[];
  catalogItems: CommerceSearchItem[];
}

export function loadDealWatchData(catalogItems: CommerceSearchItem[]): DealWatchData {
  const wishlist = updateCurrentPrices(getWishlistItems(), catalogItems);
  const bundles = getSavedBundles();
  const alerts = getDealAlerts();
  const unreadAlerts = getUnreadAlerts();

  return {
    wishlist,
    bundles,
    alerts,
    unreadAlerts,
    catalogItems,
  };
}

export function getItemsWithPriceChanges(wishlist: WishlistItem[]): WishlistItem[] {
  return wishlist.filter(
    (item) =>
      item.currentPrice !== undefined &&
      item.currentPrice !== item.savedPrice
  );
}

export function getItemsWithDrops(wishlist: WishlistItem[]): WishlistItem[] {
  return wishlist.filter(
    (item) =>
      item.currentPrice !== undefined &&
      item.currentPrice < item.savedPrice
  ).sort((a, b) => ((a.savedPrice - (a.currentPrice || a.savedPrice)) - (b.savedPrice - (b.currentPrice || b.savedPrice))));
}

export function getStaleWishlistItems(wishlist: WishlistItem[]): WishlistItem[] {
  return wishlist.filter(
    (item) => item.priceFreshness === "stale" || item.priceFreshness === "unknown"
  );
}
