"use client";

import { getItem, setItem } from "@/lib/storage/localStore";
import type { BattleRecord } from "@/types";

const BATTLES_KEY = "auracheck:v1:battles";

export function getBattles(): BattleRecord[] {
  return getItem<BattleRecord[]>(BATTLES_KEY, []);
}

export function saveBattle(record: Omit<BattleRecord, "id" | "timestamp">): BattleRecord {
  const battle: BattleRecord = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...record,
  };
  const battles = getBattles();
  battles.unshift(battle);
  setItem(BATTLES_KEY, battles);
  return battle;
}

export function getBattleCount(): number {
  return getBattles().length;
}

export function clearBattles(): void {
  setItem(BATTLES_KEY, []);
}
