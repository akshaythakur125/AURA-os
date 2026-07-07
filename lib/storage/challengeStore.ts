import { getItem, setItem } from "@/lib/storage/localStore";
import type { ChallengeEntry } from "@/types/challenge";

const ENTRIES_KEY = "auracheck:v1:challenge_entries";
const STREAK_KEY = "auracheck:v1:challenge_streak";
// migrate old key
try {
  const old = localStorage.getItem("auracheck.challengeStreak");
  if (old && !localStorage.getItem(STREAK_KEY)) localStorage.setItem(STREAK_KEY, old);
} catch { /* ponytail: SSR guard */ }

export interface ChallengeStreak {
  currentStreak: number;
  lastCheckinDate: string;
}

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

export function getChallengeStreak(): ChallengeStreak {
  return getItem<ChallengeStreak>(STREAK_KEY, { currentStreak: 0, lastCheckinDate: "" });
}

export function markChallengeComplete(): { newStreak: number; incremented: boolean } {
  const streak = getChallengeStreak();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (streak.lastCheckinDate === today) {
    return { newStreak: streak.currentStreak, incremented: false };
  }

  let newStreak: number;
  if (streak.lastCheckinDate === yesterday) {
    newStreak = streak.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  setItem(STREAK_KEY, { currentStreak: newStreak, lastCheckinDate: today });
  return { newStreak, incremented: true };
}

export function resetChallengeStreak(): void {
  setItem(STREAK_KEY, { currentStreak: 0, lastCheckinDate: "" });
}
