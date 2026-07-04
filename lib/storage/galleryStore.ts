"use client";

import { getItem, setItem } from "@/lib/storage/localStore";
import type { GalleryEntry, GalleryReaction } from "@/types/gallery";

const GALLERY_KEY = "auracheck:v1:gallery";
const GALLERY_REACTIONS_KEY = "auracheck:v1:gallery_reactions";

function getEntries(): GalleryEntry[] {
  return getItem<GalleryEntry[]>(GALLERY_KEY, []);
}

function saveEntries(entries: GalleryEntry[]): void {
  setItem(GALLERY_KEY, entries);
}

export function submitToGallery(entry: Omit<GalleryEntry, "id" | "createdAt" | "reactions" | "viewCount">): GalleryEntry {
  const entries = getEntries();
  const existing = entries.findIndex(e => e.auditId === entry.auditId);
  
  const galleryEntry: GalleryEntry = {
    ...entry,
    id: existing >= 0 ? entries[existing].id : crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: existing >= 0 ? entries[existing].createdAt : new Date().toISOString(),
    reactions: existing >= 0 ? entries[existing].reactions : { fire: 0, hundred: 0, crown: 0, shock: 0 },
    viewCount: existing >= 0 ? entries[existing].viewCount : 0,
  };

  if (existing >= 0) {
    entries[existing] = galleryEntry;
  } else {
    entries.unshift(galleryEntry);
    if (entries.length > 500) entries.length = 500;
  }

  saveEntries(entries);
  return galleryEntry;
}

export function getGalleryEntries(sort: "recent" | "highest" | "most_viewed" | "most_improved" = "recent", limit = 50): GalleryEntry[] {
  const entries = getEntries();
  const sorted = [...entries].filter(e => e.score > 0);
  
  switch (sort) {
    case "highest":
      sorted.sort((a, b) => b.score - a.score);
      break;
    case "most_viewed":
      sorted.sort((a, b) => b.viewCount - a.viewCount);
      break;
    case "most_improved":
      sorted.sort((a, b) => (b.improvement || 0) - (a.improvement || 0));
      break;
    default:
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  return sorted.slice(0, limit);
}

export function getHallOfFame(): GalleryEntry[] {
  return getEntries()
    .filter(e => e.score >= 85)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export function getGalleryStats(): { totalEntries: number; highestScore: number; averageScore: number; totalViews: number } {
  const entries = getEntries();
  if (entries.length === 0) return { totalEntries: 0, highestScore: 0, averageScore: 0, totalViews: 0 };
  
  const scores = entries.filter(e => e.score > 0);
  return {
    totalEntries: entries.length,
    highestScore: scores.length > 0 ? Math.max(...scores.map(e => e.score)) : 0,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((s, e) => s + e.score, 0) / scores.length) : 0,
    totalViews: entries.reduce((s, e) => s + e.viewCount, 0),
  };
}

export function incrementViewCount(entryId: string): void {
  const entries = getEntries();
  const idx = entries.findIndex(e => e.id === entryId);
  if (idx >= 0) {
    entries[idx].viewCount = (entries[idx].viewCount || 0) + 1;
    saveEntries(entries);
  }
}

export function addReaction(entryId: string, reaction: GalleryReaction["reaction"]): boolean {
  const reactions = getItem<GalleryReaction[]>(GALLERY_REACTIONS_KEY, []);
  const fp = getSimpleFingerprint();
  
  const alreadyReacted = reactions.some(r => r.entryId === entryId && r.reaction === reaction && fp && r.timestamp > new Date(Date.now() - 86400000).toISOString());
  if (alreadyReacted) return false;

  reactions.push({ entryId, reaction, timestamp: new Date().toISOString() });
  if (reactions.length > 1000) reactions.splice(0, reactions.length - 1000);
  setItem(GALLERY_REACTIONS_KEY, reactions);

  const entries = getEntries();
  const idx = entries.findIndex(e => e.id === entryId);
  if (idx >= 0) {
    entries[idx].reactions = { ...entries[idx].reactions };
    entries[idx].reactions[reaction] = (entries[idx].reactions[reaction] || 0) + 1;
    saveEntries(entries);
  }

  return true;
}

function getSimpleFingerprint(): string {
  try {
    return `${navigator.language}-${screen.width}x${screen.height}-${new Date().getTimezoneOffset()}`;
  } catch { return ""; }
}

export function hasSubmittedAudit(auditId: string): boolean {
  return getEntries().some(e => e.auditId === auditId);
}
