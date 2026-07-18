import type { Audit, AuditInput, AuditStats } from "@/types/audit";
import { createLocalId } from "@/types/audit";
import { getItem, setItem } from "./localStore";
import { STORAGE_KEYS } from "./storageKeys";
import { syncAuditToSupabase } from "@/lib/supabase/syncAudits";

function getAll(): Audit[] {
  return getItem<Audit[]>(STORAGE_KEYS.AUDITS, []);
}

/**
 * Persists audits, surviving a full localStorage. Images (base64 data URLs) are
 * by far the largest thing we store, so if the write fails on quota we evict
 * old audits' images oldest-first and retry — keeping the most recent image
 * (the one the user just uploaded) as long as possible. Returns whether the
 * write ultimately succeeded.
 */
function persist(audits: Audit[]): boolean {
  if (setItem(STORAGE_KEYS.AUDITS, audits)) return true;

  const order = audits
    .map((a, i) => ({ i, t: new Date(a.createdAt).getTime(), hasImg: !!a.imageDataUrl }))
    .filter((x) => x.hasImg)
    .sort((a, b) => a.t - b.t); // oldest image first

  for (const { i } of order) {
    audits[i] = { ...audits[i], imageDataUrl: undefined };
    if (setItem(STORAGE_KEYS.AUDITS, audits)) return true;
  }
  return false;
}

export function getAudits(): Audit[] {
  return getAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAuditById(id: string): Audit | undefined {
  return getAll().find((a) => a.id === id);
}

export function createAudit(input: AuditInput): Audit {
  const now = new Date().toISOString();
  const audit: Audit = {
    id: createLocalId(),
    auditType: input.auditType,
    goal: input.goal,
    budgetRange: input.budgetRange,
    reportStatus: "draft",
    unlockStatus: "free",
    createdAt: now,
    updatedAt: now,
  };
  const audits = getAll();
  audits.push(audit);
  persist(audits);
  syncAuditToSupabase(audit).catch(() => {});
  return audit;
}

export function updateAudit(
  id: string,
  updates: Partial<Audit>
): Audit | undefined {
  const audits = getAll();
  const idx = audits.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  audits[idx] = { ...audits[idx], ...updates, updatedAt: new Date().toISOString() };
  persist(audits);
  syncAuditToSupabase(audits[idx]).catch(() => {});
  return audits[idx];
}

export function deleteAudit(id: string): boolean {
  const audits = getAll();
  const filtered = audits.filter((a) => a.id !== id);
  if (filtered.length === audits.length) return false;
  persist(filtered);
  return true;
}

export function clearAudits(): void {
  setItem(STORAGE_KEYS.AUDITS, []);
}

export function getLatestAudit(): Audit | undefined {
  const audits = getAll();
  if (audits.length === 0) return undefined;
  return audits.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

export function getAuditStats(): AuditStats {
  const audits = getAll();
  const scores = audits
    .map((a) => a.freeScore)
    .filter((s): s is number => s !== undefined && s !== null);

  return {
    totalAudits: audits.length,
    unlockedReports: audits.filter((a) => a.unlockStatus === "unlocked").length,
    averageFreeScore:
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : null,
    latestScore: scores.length > 0 ? scores[scores.length - 1] : null,
    bestScore: scores.length > 0 ? Math.max(...scores) : null,
    lastAuditDate:
      audits.length > 0
        ? audits.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0].createdAt
        : null,
  };
}
