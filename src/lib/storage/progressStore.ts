import type { ProgressComparison, ProgressStats } from "@/types/progress";
import { createLocalId } from "@/types/audit";
import { getItem, setItem } from "./localStore";

const COMPARISONS_KEY = "auracheck:v1:progress_comparisons";

function getAll(): ProgressComparison[] {
  return getItem<ProgressComparison[]>(COMPARISONS_KEY, []);
}

function persist(comparisons: ProgressComparison[]): void {
  setItem(COMPARISONS_KEY, comparisons);
}

export function getProgressComparisons(): ProgressComparison[] {
  return getAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getProgressComparisonById(id: string): ProgressComparison | undefined {
  return getAll().find((c) => c.id === id);
}

export function createProgressComparison(input: Omit<ProgressComparison, "id" | "createdAt">): ProgressComparison {
  const comparison: ProgressComparison = {
    ...input,
    id: createLocalId(),
    createdAt: new Date().toISOString(),
  };
  const all = getAll();
  all.push(comparison);
  persist(all);
  return comparison;
}

export function deleteProgressComparison(id: string): boolean {
  const all = getAll();
  const filtered = all.filter((c) => c.id !== id);
  if (filtered.length === all.length) return false;
  persist(filtered);
  return true;
}

export function getProgressStats(): ProgressStats {
  const all = getAll();
  const deltas = all.map((c) => c.scoreDelta);

  return {
    totalComparisons: all.length,
    averageImprovement: deltas.length > 0
      ? Math.round(deltas.reduce((sum, d) => sum + d, 0) / deltas.length)
      : null,
    bestImprovement: deltas.length > 0 ? Math.max(...deltas) : null,
    lastComparisonDate: all.length > 0
      ? all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : null,
  };
}
