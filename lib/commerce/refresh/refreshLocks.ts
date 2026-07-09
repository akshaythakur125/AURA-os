import type { RefreshLock } from "@/types/scheduledRefresh";
import { CONNECTOR_REFRESH_POLICY } from "@/config/connectorRefreshPolicy";
import { getItem, setItem } from "@/lib/storage/localStore";

const LOCKS_KEY = "auracheck:v1:refresh_locks";

export function getRefreshLocks(): RefreshLock[] {
  return getItem<RefreshLock[]>(LOCKS_KEY, []);
}

export function acquireLock(connectorKey: string): boolean {
  const locks = getRefreshLocks();
  const existing = locks.find((l) => l.connectorKey === connectorKey);

  if (existing) {
    const expiresAt = new Date(existing.expiresAt).getTime();
    if (Date.now() < expiresAt) {
      return false; // Lock still active
    }
    // Lock expired, remove it
    setItem(LOCKS_KEY, locks.filter((l) => l.connectorKey !== connectorKey));
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CONNECTOR_REFRESH_POLICY.lockExpiryMinutes * 60 * 1000);

  const lock: RefreshLock = {
    connectorKey,
    lockedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const updated = [...getRefreshLocks(), lock];
  setItem(LOCKS_KEY, updated.slice(-20));
  return true;
}

export function releaseLock(connectorKey: string): void {
  const locks = getRefreshLocks();
  setItem(LOCKS_KEY, locks.filter((l) => l.connectorKey !== connectorKey));
}

export function isLocked(connectorKey: string): boolean {
  const locks = getRefreshLocks();
  const lock = locks.find((l) => l.connectorKey === connectorKey);
  if (!lock) return false;
  return Date.now() < new Date(lock.expiresAt).getTime();
}

export function clearExpiredLocks(): void {
  const locks = getRefreshLocks();
  const valid = locks.filter((l) => Date.now() < new Date(l.expiresAt).getTime());
  setItem(LOCKS_KEY, valid);
}

export function clearAllLocks(): void {
  setItem(LOCKS_KEY, []);
}
