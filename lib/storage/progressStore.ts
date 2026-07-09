import { getItem, setItem } from "@/lib/storage/localStore";
import type { ProgressComparison, ProgressStats } from "@/types/progress";

const KEY = "auracheck:v1:progress_comparisons";

export function getProgressComparisons(): ProgressComparison[] {
  return getItem<ProgressComparison[]>(KEY, []);
}

export function createProgressComparison(comparison: Omit<ProgressComparison, "id" | "createdAt">): ProgressComparison {
  const entry: ProgressComparison = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...comparison,
    createdAt: new Date().toISOString(),
  };
  const list = getProgressComparisons();
  list.unshift(entry);
  setItem(KEY, list);
  return entry;
}

export function deleteProgressComparison(id: string): void {
  const list = getProgressComparisons().filter((c) => c.id !== id);
  setItem(KEY, list);
}

export function getProgressStats(): ProgressStats {
  const list = getProgressComparisons();
  if (list.length === 0) return { totalComparisons: 0, averageImprovement: 0, bestImprovement: 0 };
  const deltas = list.map((c) => c.scoreDelta);
  return {
    totalComparisons: list.length,
    averageImprovement: Math.round(deltas.reduce((a, b) => a + b, 0) / list.length),
    bestImprovement: Math.max(...deltas),
  };
}

export function clearProgressComparisons(): void {
  setItem(KEY, []);
}
