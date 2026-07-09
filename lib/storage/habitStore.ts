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

export function getTodayMission(): { day: number; title: string; reason: string; task: string } | null {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const missionDay = (dayOfYear % 30) + 1;

  return {
    day: missionDay,
    title: `Day ${missionDay} — ${getMissionTitle(missionDay)}`,
    reason: getMissionReason(missionDay),
    task: getMissionTask(missionDay),
  };
}

export function getMissionDetail(day: number): { title: string; reason: string; task: string; weekNumber: number; theme: string } | null {
  if (day < 1 || day > 30) return null;
  const weekNumber = Math.ceil(day / 7);
  const themes: Record<number, string> = {
    1: "Lighting & Photography",
    2: "Grooming & Fit",
    3: "Style & Posing",
    4: "Profile & Presentation",
    5: "System & Maintenance",
  };
  return {
    title: getMissionTitle(day),
    reason: getMissionReason(day),
    task: getMissionTask(day),
    weekNumber: Math.min(weekNumber, 5),
    theme: themes[Math.min(weekNumber, 5)] || "Bonus",
  };
}

export function getWeeklyStats(weekNumber: number): { completed: number; total: number; startDay: number; endDay: number } {
  const state = getHabitState();
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = Math.min(weekNumber * 7, 30);
  let completed = 0;
  for (let d = startDay; d <= endDay; d++) {
    if (Object.keys(state.completedMissions).some(k => k.includes(`:day:${d}`))) completed++;
  }
  return { completed, total: endDay - startDay + 1, startDay, endDay };
}

export function getFreezeCount(): number {
  const state = getHabitState();
  const freezeKey = "auracheck:v1:streak_freezes";
  try {
    return Number(localStorage.getItem(freezeKey) || "0");
  } catch { return 0; }
}

export function addFreeze(count: number = 1): number {
  const current = getFreezeCount();
  const total = current + count;
  try { localStorage.setItem("auracheck:v1:streak_freezes", String(total)); } catch { /* noop */ }
  return total;
}

export function useFreeze(): boolean {
  const current = getFreezeCount();
  if (current <= 0) return false;
  try { localStorage.setItem("auracheck:v1:streak_freezes", String(current - 1)); } catch { return false; }
  
  const state = getHabitState();
  const dateKey = new Date().toISOString().split("T")[0];
  state.streakHistory[dateKey] = true;
  state.currentStreak += 1;
  state.lastActiveDate = new Date().toISOString();
  if (state.currentStreak > state.longestStreak) state.longestStreak = state.currentStreak;
  saveHabitState(state);
  return true;
}

export function isProgramComplete(): boolean {
  const state = getHabitState();
  let completed = 0;
  for (let d = 1; d <= 30; d++) {
    const keys = Object.keys(state.completedMissions);
    if (keys.some(k => k.includes(`:day:${d}`))) completed++;
  }
  return completed >= 30;
}

function getMissionReason(day: number): string {
  const reasons: Record<number, string> = {
    1: "The first step to looking premium is finding good light. Harsh shadows from overhead lights create unflattering contrast.",
    2: "A dirty phone camera lens is the most common cause of hazy, low-clarity photos — and it's invisible until you check.",
    3: "A messy background screams disorganization, regardless of how good you look. Clean backgrounds put all attention on you.",
    4: "Clean nails, moisturized skin, and tidy hair are the smallest details that collectively suggest self-respect.",
    5: "Solid colors reduce visual noise. Logos, text, and busy patterns distract from your face and frame.",
    6: "Natural window light is more flattering than any ring light. It's free and creates the most natural, premium look.",
    7: "Reflection time. Look at your photos from this week. Which lighting gave you the best look?",
    8: "Fit is everything. A ₹500 well-fitted t-shirt looks 10x better than a ₹5000 ill-fitted branded piece.",
    9: "Shoes are the #1 accessory people notice in full-body and candid shots. Clean, simple shoes signal intentionality.",
    10: "Test which colors make your skin look best. Neutral tones (black, white, grey, navy) are failsafe. Earth tones work for most Indian skin tones.",
    11: "If a piece doesn't fit well, retire it from your photo wardrobe. One bad piece drags down your entire presentation.",
    12: "A watch, a clean belt, or simple sunglasses — one accessory adds intentionality without clutter.",
    13: "Wear your best-fitting outfit twice. Does anyone notice? Probably not. Style is consistency, not variety.",
    14: "Write down what you learned about your style this week. This reflection becomes your personal style bible.",
    15: "Practice 3 poses in front of a mirror: straight-on confident, slightly angled casual, and a natural laugh pose.",
    16: "Find 3 locations near you with good natural light and clean backgrounds. Scout them with test shots.",
    17: "Your bio, caption, or headline is your first impression in text form. Clarity beats cleverness every time.",
    18: "Set a timer. Take 30 photos in your best outfit with your best lighting. Pick the top 5 — not more.",
    19: "Edit ruthlessly. Your top 5 photos tell a story. Each should show a different side of you.",
    20: "Write the 3-sentence version of who you are. Specific beats generic. 'Chai and cricket' beats 'I like sports and food'.",
    21: "Mid-point check. Compare photos from Week 1 to Week 3. You should see measurable improvement.",
    22: "Define your style in 3 words. Example: 'Clean, Minimal, Modern' or 'Warm, Approachable, Earthy'. Everything you buy should match.",
    23: "Create a repeatable shot template. Same light setup, same angles, same background. Consistency is premium signal.",
    24: "Lock in your daily grooming routine. 5 minutes in the morning saves you from looking unprepared in any photo.",
    25: "Plan your 10-item capsule wardrobe. Mix-and-match items that all work together. Fewer, better pieces.",
    26: "Your background is part of your outfit. Neutral walls, clean desk, or a simple outdoor wall work everywhere.",
    27: "Run one final Aura Check. Compare your new score to your first. The difference is your proof of progress.",
    28: "Write a one-page maintenance guide for yourself. What light, what outfit, what angle, what background.",
    29: "Share your progress with one friend. Their reaction will tell you more about your growth than any score.",
    30: "Write down your biggest learnings. What was the single highest-ROI change? Make it a permanent habit.",
  };
  return reasons[day] || "Small consistent improvements compound. Today's mission builds on everything you've learned.";
}

function getMissionTask(day: number): string {
  const tasks: Record<number, string> = {
    1: "Find a window or outdoor spot where light falls evenly on your face. Take a test selfie. Notice the difference.",
    2: "Grab a microfiber cloth. Wipe your phone's camera lens. Take a before-and-after photo at the same spot.",
    3: "Pick one surface or corner visible in your most-used photo spot. Clear it completely. Take an 'after' photo.",
    4: "Spend 5 minutes: trim nails, apply moisturizer, comb/style hair. Take a close-up selfie.",
    5: "Pick a solid black, white, or grey shirt. Wear it. Take a photo. Compare to a photo in a printed shirt.",
    6: "Stand near a window with natural light, facing it. Take a portrait. Compare to a photo in artificial light.",
    7: "Open your camera roll. Find your best photo this week. Write down: what lighting, outfit, and angle worked.",
    8: "Try on your 3 most-worn shirts. Check shoulder seams, sleeve length, and torso fit. Donate what doesn't fit.",
    9: "Clean your shoes. Take a full-body mirror selfie. Check if shoes match the outfit's vibe.",
    10: "Hold 3 different colored shirts near your face in front of a mirror. Pick the one that makes your skin look best.",
    11: "Remove the worst-fitting item from your wardrobe. Take it out of rotation for photos permanently.",
    12: "Add one accessory to your outfit today. Watch, belt, or subtle bracelet. Take a photo.",
    13: "Wear yesterday's outfit again. Style it slightly differently. Notice that no one cares — consistency wins.",
    14: "Open Notes. Write 3 things you learned about your style this week. Save it.",
    15: "Stand in front of a mirror. Practice 3 poses for 2 minutes each. Take photos of each.",
    16: "Step outside. Walk 10 minutes around your area. Photograph 3 potential photo spots with good light + clean backgrounds.",
    17: "Read your Instagram bio or dating profile text. Can a stranger understand who you are in 5 seconds? Rewrite if not.",
    18: "Set up your best light and outfit. Take at least 30 photos trying different angles and expressions.",
    19: "From yesterday's 30 photos, pick exactly 5. Delete or hide the rest. Share the best one to test.",
    20: "Write a 3-sentence bio that is specific. Include: what you do, what you enjoy, one unexpected detail.",
    21: "Compare your Week 1 photos to today's. Notice the lighting, framing, and outfit improvements.",
    22: "Write down your 3 style words. Review your last 5 purchases. Do they match? If not, adjust.",
    23: "Mark the exact spot, time of day, and camera angle that works best. Save it as 'My Shot Template'.",
    24: "Write down your 5-minute morning grooming routine. Do it every day. Make it automatic.",
    25: "List your 10 most-worn items. Check if any 3 can't be mixed. Remove or replace them.",
    26: "Find your cleanest, most neutral background spot. It can be a wall, a door, or an outdoor wall. Keep it ready.",
    27: "Take a new Aura Check photo. Compare the score to your first. Celebrate the difference.",
    28: "Create a one-page 'My Best Shot' guide. Light + outfit + angle + background. Save it.",
    29: "Text or DM a friend: 'Check my Aura Score and tell me what you think'. Share your audit page.",
    30: "Write a short note to yourself: the single most important thing you changed this month. Make it permanent.",
  };
  return tasks[day] || "Complete today's mission with intention. Small actions compound.";
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
