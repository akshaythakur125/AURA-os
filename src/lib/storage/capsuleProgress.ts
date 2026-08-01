/**
 * Per-audit capsule-checklist progress — which wardrobe pieces the user has
 * ticked off as owned/bought. Stored locally, keyed by auditId → the list of
 * ticked item ids. This is what turns the capsule from a static list into a
 * shopping checklist they come back to as they build the wardrobe out.
 */
import { STORAGE_KEYS } from "./storageKeys";

const KEY = STORAGE_KEYS.CAPSULE_PROGRESS;
type Progress = Record<string, string[]>;

function readAll(): Progress {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Progress;
  } catch {
    return {};
  }
}

function writeAll(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage full / unavailable — progress just won't persist */
  }
}

export function getOwnedItems(auditId: string): Set<string> {
  return new Set(readAll()[auditId] || []);
}

/** Toggle one item's owned state and return the updated set. */
export function toggleItem(auditId: string, itemId: string): Set<string> {
  const all = readAll();
  const set = new Set(all[auditId] || []);
  if (set.has(itemId)) set.delete(itemId);
  else set.add(itemId);
  all[auditId] = [...set];
  writeAll(all);
  return set;
}
