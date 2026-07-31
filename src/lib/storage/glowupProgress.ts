/**
 * Per-audit Glow-Up progress — which daily missions the user has ticked off.
 * Stored locally (like the rest of the audit data) keyed by auditId → the list
 * of completed mission day-numbers. This is what turns the 30-day plan from a
 * read-only list into a living tool they come back to every day.
 */
import { STORAGE_KEYS } from "./storageKeys";

const KEY = STORAGE_KEYS.GLOWUP_PROGRESS;
type Progress = Record<string, number[]>;

function readAll(): Progress {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Progress;
  } catch {
    return {};
  }
}

function writeAll(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage full / unavailable — progress just won't persist */
  }
}

export function getCompletedDays(auditId: string): Set<number> {
  return new Set(readAll()[auditId] || []);
}

/** Toggle one mission's completion and return the updated set. */
export function toggleMissionDay(auditId: string, day: number): Set<number> {
  const all = readAll();
  const set = new Set(all[auditId] || []);
  if (set.has(day)) set.delete(day);
  else set.add(day);
  all[auditId] = [...set].sort((a, b) => a - b);
  writeAll(all);
  return set;
}
