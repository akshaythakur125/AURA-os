"use client";

import { getItem, setItem } from "@/lib/storage/localStore";
import type { UnlockRecord } from "@/types/payment";
import type { ProductType } from "@/types";

const UNLOCKS_KEY = "auracheck:v1:unlocks";
const OLD_UNLOCKS_KEY = "auracheck:unlocks";
function migrateUnlocksIfNeeded() {
  if (typeof window !== "undefined") {
    try {
      const old = localStorage.getItem(OLD_UNLOCKS_KEY);
      if (old) {
        const existing = localStorage.getItem(UNLOCKS_KEY);
        if (!existing) {
          localStorage.setItem(UNLOCKS_KEY, old);
        }
        localStorage.removeItem(OLD_UNLOCKS_KEY);
      }
    } catch {
      // skip
    }
  }
}

export function getUnlocks(): UnlockRecord[] {
  migrateUnlocksIfNeeded();
  return getItem<UnlockRecord[]>(UNLOCKS_KEY, []);
}

export function isAuditUnlocked(auditId: string): boolean {
  return getUnlocks().some((u) => u.auditId === auditId && u.status === "unlocked");
}

export function isProductUnlocked(auditId: string, product: ProductType): boolean {
  return getUnlocks().some((u) => u.auditId === auditId && u.product === product && u.status === "unlocked");
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
