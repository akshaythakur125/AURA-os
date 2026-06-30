"use client";

import { getItem, setItem } from "@/lib/storage/localStore";
import type { UnlockRecord } from "@/types/payment";

const UNLOCKS_KEY = "auracheck:unlocks";

export function getUnlocks(): UnlockRecord[] {
  return getItem<UnlockRecord[]>(UNLOCKS_KEY, []);
}

export function isAuditUnlocked(auditId: string): boolean {
  return getUnlocks().some((u) => u.auditId === auditId && u.status === "unlocked");
}

export function recordUnlock(auditId: string, product: string, unlockCode: string, transactionRef?: string): UnlockRecord {
  const record: UnlockRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    auditId,
    product,
    transactionRef,
    unlockCode,
    status: "unlocked",
    unlockedAt: new Date().toISOString(),
  };
  const unlocks = getUnlocks();
  unlocks.unshift(record);
  setItem(UNLOCKS_KEY, unlocks);
  return record;
}

export function getUnlockedAuditCount(): number {
  return new Set(getUnlocks().filter((u) => u.status === "unlocked").map((u) => u.auditId)).size;
}
