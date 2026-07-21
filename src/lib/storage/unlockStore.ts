import type { UnlockRecord, UnlockRecordInput, ProductType } from "@/types/payment";
import { createLocalId } from "@/types/audit";
import { getItem, setItem } from "./localStore";
import { STORAGE_KEYS } from "./storageKeys";

function getAll(): UnlockRecord[] {
  return getItem<UnlockRecord[]>(STORAGE_KEYS.UNLOCKS, []);
}

function persist(records: UnlockRecord[]): void {
  setItem(STORAGE_KEYS.UNLOCKS, records);
}

export function getUnlockRecords(): UnlockRecord[] {
  return getAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getUnlockByAuditId(auditId: string): UnlockRecord | undefined {
  return getAll().find((r) => r.auditId === auditId);
}

/** True if this browser has ever unlocked any paid product (any audit). */
export function hasAnyUnlock(): boolean {
  return getAll().length > 0;
}

export function createUnlockRecord(input: UnlockRecordInput): UnlockRecord {
  const now = new Date().toISOString();
  const record: UnlockRecord = {
    id: createLocalId(),
    auditId: input.auditId,
    productType: input.productType,
    amount: getProductAmount(input.productType),
    status: "unlocked",
    transactionReference: input.transactionReference || undefined,
    unlockCode: input.unlockCode || undefined,
    createdAt: now,
    updatedAt: now,
  };
  const records = getAll();
  records.push(record);
  persist(records);
  return record;
}

export function updateUnlockRecord(
  id: string,
  updates: Partial<UnlockRecord>
): UnlockRecord | undefined {
  const records = getAll();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  records[idx] = { ...records[idx], ...updates, updatedAt: new Date().toISOString() };
  persist(records);
  return records[idx];
}

export function markAuditUnlocked(
  auditId: string,
  productType: ProductType
): UnlockRecord | undefined {
  const existing = getUnlockByAuditId(auditId);
  if (existing) {
    return updateUnlockRecord(existing.id, { status: "unlocked" });
  }
  return createUnlockRecord({ auditId, productType });
}

export function clearUnlocks(): void {
  setItem(STORAGE_KEYS.UNLOCKS, []);
}

import { getServerProductPrice } from "@/lib/payments/serverUnlock";

function getProductAmount(productType: ProductType): number {
  return getServerProductPrice(productType);
}
