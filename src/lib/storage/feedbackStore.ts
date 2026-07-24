import { getItem, setItem } from "./localStore";
import { STORAGE_KEYS } from "./storageKeys";

export interface FeedbackRecord {
  auditId: string;
  productType: string;
  rating: number; // 1–5
  comment?: string;
  featureConsent: boolean; // may we feature it (anonymously)?
  createdAt: string;
}

function getAll(): FeedbackRecord[] {
  return getItem<FeedbackRecord[]>(STORAGE_KEYS.FEEDBACK, []);
}

/** True once this browser has left feedback for the given audit. */
export function hasGivenFeedback(auditId: string): boolean {
  return getAll().some((f) => f.auditId === auditId);
}

export function saveFeedback(record: FeedbackRecord): void {
  const all = getAll().filter((f) => f.auditId !== record.auditId);
  all.push(record);
  setItem(STORAGE_KEYS.FEEDBACK, all);
}
