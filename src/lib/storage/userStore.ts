import type { LocalUser } from "@/types/user";
import { createLocalId } from "@/types/audit";
import { getItem, setItem, removeItem } from "./localStore";
import { STORAGE_KEYS } from "./storageKeys";

export function getLocalUser(): LocalUser {
  const existing = getItem<LocalUser | null>(STORAGE_KEYS.USER, null);
  if (existing) return existing;
  const now = new Date().toISOString();
  const fresh: LocalUser = {
    id: createLocalId(),
    createdAt: now,
    updatedAt: now,
  };
  setItem(STORAGE_KEYS.USER, fresh);
  return fresh;
}

export function saveLocalUser(user: LocalUser): void {
  user.updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.USER, user);
}

export function updateLocalUser(updates: Partial<LocalUser>): LocalUser {
  const user = getLocalUser();
  const updated: LocalUser = {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.USER, updated);
  return updated;
}

export function clearLocalUser(): void {
  removeItem(STORAGE_KEYS.USER);
}
