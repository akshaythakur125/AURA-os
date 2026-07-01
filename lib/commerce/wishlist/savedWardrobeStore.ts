import type { SavedWardrobeBundle } from "@/types/wishlist";
import { getItem, setItem } from "@/lib/storage/localStore";

const BUNDLES_KEY = "auracheck:v1:saved_bundles";

export function getSavedBundles(): SavedWardrobeBundle[] {
  return getItem<SavedWardrobeBundle[]>(BUNDLES_KEY, []);
}

export function saveBundle(bundle: SavedWardrobeBundle): void {
  const bundles = getSavedBundles();
  const existing = bundles.findIndex((b) => b.id === bundle.id);
  if (existing >= 0) {
    bundles[existing] = { ...bundles[existing], ...bundle, updatedAt: new Date().toISOString() };
  } else {
    bundles.push(bundle);
  }
  setItem(BUNDLES_KEY, bundles);
}

export function removeBundle(id: string): void {
  setItem(BUNDLES_KEY, getSavedBundles().filter((b) => b.id !== id));
}

export function getBundle(id: string): SavedWardrobeBundle | undefined {
  return getSavedBundles().find((b) => b.id === id);
}

export function getBundlesByAudit(auditId: string): SavedWardrobeBundle[] {
  return getSavedBundles().filter((b) => b.auditId === auditId);
}
