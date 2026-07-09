"use client";

import { getItem, setItem } from "@/lib/storage/localStore";
import type { Audit } from "@/types";

const AUDITS_KEY = "auracheck:v1:audits";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Migrate from old key if needed
const OLD_KEY = "auracheck:audits";
function migrateIfNeeded() {
  if (typeof window !== "undefined") {
    try {
      const old = localStorage.getItem(OLD_KEY);
      if (old) {
        const existing = localStorage.getItem(AUDITS_KEY);
        if (!existing) {
          localStorage.setItem(AUDITS_KEY, old);
        }
        localStorage.removeItem(OLD_KEY);
      }
    } catch {
      // skip migration errors
    }
  }
}

export function getAudits(): Audit[] {
  migrateIfNeeded();
  return getItem<Audit[]>(AUDITS_KEY, []);
}

export function getAuditById(id: string): Audit | undefined {
  return getAudits().find((a) => a.id === id);
}

export function createAudit(input: Omit<Audit, "id" | "createdAt" | "updatedAt" | "reportStatus">): Audit {
  const now = new Date().toISOString();
  const audit: Audit = {
    ...input,
    id: generateId(),
    reportStatus: "draft",
    createdAt: now,
    updatedAt: now,
  };
  const audits = getAudits();
  audits.unshift(audit);
  setItem(AUDITS_KEY, audits);
  return audit;
}

export function deleteAudit(id: string): void {
  const audits = getAudits().filter((a) => a.id !== id);
  setItem(AUDITS_KEY, audits);
}

export function updateAudit(id: string, updates: Partial<Audit>): Audit | undefined {
  const audits = getAudits();
  const index = audits.findIndex((a) => a.id === id);
  if (index === -1) return undefined;
  audits[index] = { ...audits[index], ...updates, updatedAt: new Date().toISOString() };
  setItem(AUDITS_KEY, audits);
  return audits[index];
}
