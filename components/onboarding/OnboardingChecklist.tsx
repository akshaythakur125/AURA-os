"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { getOnboardingState, updateOnboarding, getOnboardingProgress } from "@/lib/storage/onboardingStore";
import { getAudits } from "@/lib/storage/auditStore";
import { getChallengeEntries } from "@/lib/storage/challengeStore";
import { getProgressComparisons } from "@/lib/storage/progressStore";
import Link from "next/link";

const STEPS = [
  { key: "hasCreatedFirstAudit" as const, label: "Create first Aura Check", href: "/audit/new" },
  { key: "hasGeneratedFreeScore" as const, label: "Generate free score", href: "/audit/new" },
  { key: "hasVisitedUnlock" as const, label: "Unlock full report", href: "/unlock" },
  { key: "hasSharedCard" as const, label: "Share Aura card", href: "/dashboard" },
  { key: "hasEnteredChallenge" as const, label: "Enter a challenge", href: "/challenges" },
  { key: "hasComparedProgress" as const, label: "Compare before/after", href: "/progress" },
];

export function OnboardingChecklist() {
  const state = getOnboardingState();
  const progress = getOnboardingProgress();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    const audits = getAudits();
    const hasAudit = audits.length > 0;
    const hasScore = audits.some((a) => a.freeScore !== undefined);
    const entries = getChallengeEntries().length > 0;
    const comparisons = getProgressComparisons().length > 0;
    const unlocked = audits.some((a) => (a.unlockedProducts?.length ?? 0) > 0);
    const updates: Record<string, boolean> = {};
    if (hasAudit && !state.hasCreatedFirstAudit) updates.hasCreatedFirstAudit = true;
    if (hasScore && !state.hasGeneratedFreeScore) updates.hasGeneratedFreeScore = true;
    if (unlocked && !state.hasVisitedUnlock) updates.hasVisitedUnlock = true;
    if (entries && !state.hasEnteredChallenge) updates.hasEnteredChallenge = true;
    if (comparisons && !state.hasComparedProgress) updates.hasComparedProgress = true;
    if (Object.keys(updates).length > 0) {
      updateOnboarding(updates);
    }
    synced.current = true;
  }, [state]);

  if (progress.percentage === 100) return null;

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Your AuraCheck Journey</h3>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all" style={{ width: `${progress.percentage}%` }} />
        </div>
        <span className="text-xs text-gray-500">{progress.completed}/{progress.total}</span>
      </div>
      <div className="space-y-2">
        {STEPS.map((step) => {
          const done = state[step.key];
          return (
            <Link key={step.key} href={done ? "#" : step.href}>
              <div className="flex items-center gap-2 text-xs">
                <div className={`flex h-5 w-5 items-center justify-center rounded-full ${done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-gray-500"}`}>
                  {done ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <span className="text-[10px] font-bold">{STEPS.indexOf(step) + 1}</span>
                  )}
                </div>
                <span className={done ? "text-gray-500 line-through" : "text-gray-300"}>{step.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
