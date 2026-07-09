"use client";

import { getItem, setItem } from "@/lib/storage/localStore";

const INVITES_KEY = "auracheck:v1:battle_invites";

export interface BattleInvite {
  inviteCode: string;
  challengerName: string;
  challengerScore: number;
  challengerCategory: string;
  challengerSignal: string;
  challengerImage?: string;
  createdAt: string;
  status: "pending" | "accepted" | "completed";
  battleRecordId?: string;
}

function getInvites(): BattleInvite[] {
  return getItem<BattleInvite[]>(INVITES_KEY, []);
}

function saveInvites(invites: BattleInvite[]): void {
  setItem(INVITES_KEY, invites);
}

export function createBattleInvite(opts: {
  challengerName: string;
  challengerScore: number;
  challengerCategory: string;
  challengerSignal: string;
  challengerImage?: string;
}): BattleInvite {
  const code = `BTL${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const invite: BattleInvite = {
    inviteCode: code,
    challengerName: opts.challengerName,
    challengerScore: opts.challengerScore,
    challengerCategory: opts.challengerCategory,
    challengerSignal: opts.challengerSignal,
    challengerImage: opts.challengerImage,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const invites = getInvites();
  invites.unshift(invite);
  saveInvites(invites);
  return invite;
}

export function getBattleInvite(code: string): BattleInvite | undefined {
  return getInvites().find((i) => i.inviteCode === code);
}

export function acceptBattleInvite(code: string, battleRecordId: string): void {
  const invites = getInvites();
  const idx = invites.findIndex((i) => i.inviteCode === code);
  if (idx >= 0) {
    invites[idx].status = "accepted";
    invites[idx].battleRecordId = battleRecordId;
    saveInvites(invites);
  }
}

export function completeBattleInvite(code: string): void {
  const invites = getInvites();
  const idx = invites.findIndex((i) => i.inviteCode === code);
  if (idx >= 0) {
    invites[idx].status = "completed";
    saveInvites(invites);
  }
}

export function getInviteShareUrl(code: string): string {
  if (typeof window === "undefined") return `https://auracheck.vercel.app/battle/join?code=${code}`;
  return `${window.location.origin}/battle/join?code=${code}`;
}

export function getInviteShareText(code: string): string {
  return `I scored ${getBattleInvite(code)?.challengerScore ?? "?"}/100 on AuraCheck. Can you beat me? 👑 Check your aura: ${getInviteShareUrl(code)}`;
}
