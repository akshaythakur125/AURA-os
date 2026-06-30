"use client";

import { getItem, setItem } from "@/lib/storage/localStore";
import type { AuraTwinResult } from "@/types/auraTwin";

const TWINS_KEY = "auracheck:v1:aura_twins";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getTwinResults(): AuraTwinResult[] {
  return getItem<AuraTwinResult[]>(TWINS_KEY, []);
}

export function getTwinResultById(id: string): AuraTwinResult | undefined {
  return getTwinResults().find((r) => r.id === id);
}

export function getLatestTwinResult(): AuraTwinResult | undefined {
  const results = getTwinResults();
  return results.length > 0 ? results[0] : undefined;
}

export function createTwinResult(input: Omit<AuraTwinResult, "id" | "createdAt" | "updatedAt">): AuraTwinResult {
  const now = new Date().toISOString();
  const result: AuraTwinResult = {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  const results = getTwinResults();
  results.unshift(result);
  setItem(TWINS_KEY, results);
  return result;
}

export function deleteTwinResult(id: string): void {
  const results = getTwinResults().filter((r) => r.id !== id);
  setItem(TWINS_KEY, results);
}

export function updateTwinResult(id: string, updates: Partial<AuraTwinResult>): AuraTwinResult | undefined {
  const results = getTwinResults();
  const index = results.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  results[index] = { ...results[index], ...updates, updatedAt: new Date().toISOString() };
  setItem(TWINS_KEY, results);
  return results[index];
}

export function getTwinStats(): {
  totalSimulations: number;
  averageImprovement: number;
  mostCommonWinner: string;
} {
  const results = getTwinResults();
  if (results.length === 0) {
    return { totalSimulations: 0, averageImprovement: 0, mostCommonWinner: "—" };
  }

  let totalDelta = 0;
  const winnerCounts: Record<string, number> = {};

  for (const r of results) {
    const best = r.variants.find((v) => v.id === r.bestVariantId);
    if (best) {
      totalDelta += best.scoreDelta;
      const winnerName = best.title;
      winnerCounts[winnerName] = (winnerCounts[winnerName] || 0) + 1;
    }
  }

  const avgImprovement = Math.round(totalDelta / results.length);
  let mostCommon = "—";
  let maxCount = 0;
  for (const [name, count] of Object.entries(winnerCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = name;
    }
  }

  return {
    totalSimulations: results.length,
    averageImprovement: avgImprovement,
    mostCommonWinner: mostCommon,
  };
}
