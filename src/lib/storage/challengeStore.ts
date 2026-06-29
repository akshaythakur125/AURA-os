import type { ChallengeEntry } from "@/types/challenge";
import { createLocalId } from "@/types/audit";
import { getItem, setItem } from "./localStore";

const ENTRIES_KEY = "auracheck:v1:challenge_entries";

function getAll(): ChallengeEntry[] {
  return getItem<ChallengeEntry[]>(ENTRIES_KEY, []);
}

function persist(entries: ChallengeEntry[]): void {
  setItem(ENTRIES_KEY, entries);
}

export function getChallengeEntries(): ChallengeEntry[] {
  return getAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getEntriesByChallengeId(challengeId: string): ChallengeEntry[] {
  return getAll()
    .filter((e) => e.challengeId === challengeId)
    .sort((a, b) => (b.auraScore ?? 0) - (a.auraScore ?? 0));
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
    id: createLocalId(),
    challengeId: input.challengeId,
    auditId: input.auditId || undefined,
    auraScore: input.auraScore || undefined,
    archetype: input.archetype || undefined,
    biggestStatusLeak: input.biggestStatusLeak || undefined,
    shareCardData: input.shareCardData || undefined,
    createdAt: new Date().toISOString(),
  };
  const entries = getAll();
  entries.push(entry);
  persist(entries);
  return entry;
}

export function deleteChallengeEntry(id: string): boolean {
  const entries = getAll();
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === entries.length) return false;
  persist(filtered);
  return true;
}

export function getChallengeStats(): {
  totalEntries: number;
  entriesByChallenge: Record<string, number>;
  topChallenge: string | null;
} {
  const entries = getAll();
  const entriesByChallenge: Record<string, number> = {};
  let topChallenge: string | null = null;
  let topCount = 0;

  for (const e of entries) {
    entriesByChallenge[e.challengeId] = (entriesByChallenge[e.challengeId] || 0) + 1;
    if (entriesByChallenge[e.challengeId] > topCount) {
      topCount = entriesByChallenge[e.challengeId];
      topChallenge = e.challengeId;
    }
  }

  return { totalEntries: entries.length, entriesByChallenge, topChallenge };
}

export function clearChallengeEntries(): void {
  setItem(ENTRIES_KEY, []);
}
