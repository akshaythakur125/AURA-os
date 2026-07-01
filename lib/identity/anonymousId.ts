"use client";

import { getItem, setItem } from "@/lib/storage/localStore";

const ANONYMOUS_ID_KEY = "auracheck:v1:anonymous_id";

export function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = getItem<string>(ANONYMOUS_ID_KEY, "");
  if (!id) {
    id = `anon_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    setItem(ANONYMOUS_ID_KEY, id);
  }
  return id;
}

export function resetAnonymousId(): void {
  if (typeof window === "undefined") return;
  setItem(ANONYMOUS_ID_KEY, "");
}
