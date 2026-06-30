import { getItem, setItem } from "@/lib/storage/localStore";
import type { ChallengeEntry } from "@/types/challenge";

const ENTRIES_KEY = "auracheck:v1:challenge_entries";

export function getChallengeEntries(): ChallengeEntry[] {
  return getItem<ChallengeEntry[]>(ENTRIES_KEY, []);
}

export function getEntriesByChallengeId(challengeId: string): ChallengeEntry[] {
  return getChallengeEntries().filter((e) => e.challengeId === challengeId);
}

export function createChallengeEntry(input: {
  challengeId: string;
  auditId?: string;
  auraScore?: number;
  archetype?: string;
  biggestStatusLeak?: string;
  shareCardData?: string;
}): ChallengeEntry {
  const entry: ChallengeEntry = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...input,
    createdAt: new Date().toISOString(),
  };
  const entries = getChallengeEntries();
  entries.unshift(entry);
  setItem(ENTRIES_KEY, entries);
  return entry;
}

export function deleteChallengeEntry(id: string): void {
  const entries = getChallengeEntries().filter((e) => e.id !== id);
  setItem(ENTRIES_KEY, entries);
}

export function getChallengeStats(): Record<string, number> {
  const entries = getChallengeEntries();
  const stats: Record<string, number> = { total: entries.length };
  for (const entry of entries) {
    stats[entry.challengeId] = (stats[entry.challengeId] || 0) + 1;
  }
  return stats;
}

export function clearChallengeEntries(): void {
  setItem(ENTRIES_KEY, []);
}
