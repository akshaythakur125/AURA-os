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

export function getBattleById(id: string): BattleRecord | undefined {
  return getBattles().find((b) => b.id === id);
}

export function getBattleByInviteCode(code: string): BattleRecord | undefined {
  return getBattles().find((b) => b.inviteCode === code);
}

export function getBattleStats(): { total: number; wins: number; losses: number; ties: number; avgScore: number } {
  const battles = getBattles();
  let wins = 0; let losses = 0; let ties = 0; let totalScore = 0;
  for (const b of battles) {
    if (b.winner === "left") wins++;
    else if (b.winner === "right" && b.status === "completed") losses++;
    else if (b.winner === "tie") ties++;
    totalScore += b.leftScore;
  }
  return {
    total: battles.length,
    wins,
    losses: battles.filter((b) => b.status === "completed" && b.winner === "right").length,
    ties,
    avgScore: battles.length > 0 ? Math.round(totalScore / battles.length) : 0,
  };
}

export function clearBattles(): void {
  setItem(BATTLES_KEY, []);
}
