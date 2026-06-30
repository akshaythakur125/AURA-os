"use client";

import { getItem, setItem } from "@/lib/storage/localStore";

const HABITS_KEY = "auracheck:v1:habits";

export interface HabitState {
  completedMissions: Record<string, string>; // "auditId:day" → completionDate
  completedChecklist: Record<string, string>; // "auditId:week:index" → completionDate
  lastActiveDate: string;
  currentStreak: number;
  longestStreak: number;
  streakHistory: Record<string, boolean>; // "YYYY-MM-DD" → completedAtLeastOne
}

function getDefaultState(): HabitState {
  return {
    completedMissions: {},
    completedChecklist: {},
    lastActiveDate: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    streakHistory: {},
  };
}

export function getHabitState(): HabitState {
  return getItem<HabitState>(HABITS_KEY, getDefaultState());
}

export function saveHabitState(state: HabitState): void {
  setItem(HABITS_KEY, state);
}

export function markMissionComplete(auditId: string, day: number): HabitState {
  const state = getHabitState();
  const key = `${auditId}:day:${day}`;
  if (state.completedMissions[key]) return state;

  state.completedMissions[key] = new Date().toISOString();
  state.lastActiveDate = new Date().toISOString();
  updateStreak(state, new Date().toISOString());
  saveHabitState(state);
  return state;
}

export function markChecklistComplete(auditId: string, weekNumber: number, itemIndex: number): HabitState {
  const state = getHabitState();
  const key = `${auditId}:checklist:${weekNumber}:${itemIndex}`;
  if (state.completedChecklist[key]) return state;

  state.completedChecklist[key] = new Date().toISOString();
  state.lastActiveDate = new Date().toISOString();
  updateStreak(state, new Date().toISOString());
  saveHabitState(state);
  return state;
}

export function isMissionComplete(auditId: string, day: number): boolean {
  const state = getHabitState();
  return !!state.completedMissions[`${auditId}:day:${day}`];
}

export function isChecklistComplete(auditId: string, weekNumber: number, itemIndex: number): boolean {
  const state = getHabitState();
  return !!state.completedChecklist[`${auditId}:checklist:${weekNumber}:${itemIndex}`];
}

export function getCompletedMissionCount(auditId: string, totalMissions: number): number {
  const state = getHabitState();
  let count = 0;
  for (let d = 1; d <= totalMissions; d++) {
    if (state.completedMissions[`${auditId}:day:${d}`]) count++;
  }
  return count;
}

export function getTodayMission(): { day: number; title: string } | null {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const missionDay = (dayOfYear % 30) + 1;

  return {
    day: missionDay,
    title: `Day ${missionDay} — ${getMissionTitle(missionDay)}`,
  };
}

export function getHabitStats(): {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalChecklistCompletions: number;
} {
  const state = getHabitState();
  return {
    totalCompletions: Object.keys(state.completedMissions).length,
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    lastActiveDate: state.lastActiveDate,
    totalChecklistCompletions: Object.keys(state.completedChecklist).length,
  };
}

function updateStreak(state: HabitState, isoDate: string): void {
  const d = new Date(isoDate);
  const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  if (!state.streakHistory[dateKey]) {
    state.streakHistory[dateKey] = true;

    const yesterday = new Date(d);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (state.streakHistory[yesterdayKey]) {
      state.currentStreak += 1;
    } else {
      state.currentStreak = 1;
    }

    if (state.currentStreak > state.longestStreak) {
      state.longestStreak = state.currentStreak;
    }
  }
}

function getMissionTitle(day: number): string {
  const titles: Record<number, string> = {
    1: "Find your light",
    2: "Clean your camera lens",
    3: "Declutter one background",
    4: "Grooming baseline",
    5: "Solid color test",
    6: "Natural light portrait",
    7: "First week review",
    8: "Fit check",
    9: "Shoe assessment",
    10: "Color palette test",
    11: "Remove ill-fitting item",
    12: "Accessory edit",
    13: "Outfit repeater test",
    14: "Style reflection",
    15: "Three poses practice",
    16: "Location scout",
    17: "Profile text review",
    18: "Photo session practice",
    19: "Select your top 5",
    20: "Caption/bio rewrite",
    21: "Third week check",
    22: "Define your style",
    23: "Build photo template",
    24: "Grooming routine set",
    25: "Outfit system plan",
    26: "Background system",
    27: "Final audit",
    28: "Maintenance plan",
    29: "Share with a friend",
    30: "Plan reflection",
  };
  return titles[day] || "Stay consistent";
}
