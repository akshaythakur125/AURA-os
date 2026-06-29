import type { Challenge } from "@/types/challenge";

export const CHALLENGES: Challenge[] = [
  {
    id: "ch-status-leak",
    title: "Find Your Biggest Status Leak",
    slug: "biggest-status-leak",
    description: "Upload a photo and find out which single element is weakening your first impression the most.",
    type: "status_leak",
    entryRequirement: "A completed audit with a free score",
    rewardText: "Know your #1 priority fix",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ch-budget-upgrade",
    title: "Look Premium Under ₹5,000",
    slug: "premium-under-5000",
    description: "See how far your budget can go. AuraCheck shows the highest-impact upgrades under ₹5,000.",
    type: "budget_upgrade",
    entryRequirement: "A completed audit with budget selected",
    rewardText: "Get a ₹5,000 upgrade roadmap",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ch-clean-background",
    title: "Clean Background Challenge",
    slug: "clean-background",
    description: "Find and eliminate the background element that leaks the most signal in your photo.",
    type: "clean_profile",
    entryRequirement: "A completed audit",
    rewardText: "Know your background score",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ch-no-iphone",
    title: "No iPhone Premium Look",
    slug: "no-iphone-premium",
    description: "Can you look premium without showing a flagship phone? Upload a photo that proves your presence, not your device.",
    type: "no_iphone_premium",
    entryRequirement: "A completed audit",
    rewardText: "See if your signal comes from you, not your phone",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ch-dating-cleanup",
    title: "Dating Profile Cleanup",
    slug: "dating-profile-cleanup",
    description: "Fix the most common dating profile mistakes — weak bio, bad photo order, and red flags.",
    type: "dating_profile_fix",
    entryRequirement: "A completed dating or Instagram audit with profile text",
    rewardText: "Get a bio rewrite and red flag report",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ch-college-aura",
    title: "College Aura Check",
    slug: "college-aura",
    description: "College budgets, college settings. See how your presentation works in a campus context.",
    type: "college_aura",
    entryRequirement: "A completed audit with college goal",
    rewardText: "Know your campus signal strength",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ch-glowup-start",
    title: "30-Day Glow-Up Start",
    slug: "glowup-start",
    description: "Take the first step of your glow-up journey. Complete one audit and get your starting score.",
    type: "glowup_before_after",
    entryRequirement: "A completed audit",
    rewardText: "Baseline score for your glow-up journey",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ch-before-after",
    title: "Before/After Aura Upgrade",
    slug: "before-after-upgrade",
    description: "Complete two audits and track your aura score improvement over time.",
    type: "glowup_before_after",
    entryRequirement: "Two completed audits with free scores",
    rewardText: "See your score delta and improved signals",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export function getChallengeBySlug(slug: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.slug === slug && c.isActive);
}

export function getActiveChallenges(): Challenge[] {
  return CHALLENGES.filter((c) => c.isActive);
}
