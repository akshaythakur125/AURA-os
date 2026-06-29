"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getOnboardingState, updateOnboardingState, getOnboardingProgress } from "@/lib/storage/onboardingStore";
import { getAudits } from "@/lib/storage/auditStore";
import type { OnboardingState } from "@/lib/storage/onboardingStore";

const STEPS: { key: keyof OnboardingState; label: string; href: string }[] = [
  { key: "hasCreatedFirstAudit", label: "Create your first Aura Check", href: "/audit/new" },
  { key: "hasGeneratedFreeScore", label: "Generate your free score", href: "/audit/new" },
  { key: "hasVisitedUnlock", label: "Visit the unlock page", href: "/unlock" },
  { key: "hasSharedCard", label: "Share your Aura card", href: "/dashboard" },
];

export function OnboardingChecklist() {
  const [progress, setProgress] = useState({ completed: 0, total: 5, percentage: 0 });
  const [state, setState] = useState<OnboardingState | null>(null);

  useEffect(() => {
    const audits = getAudits();
    const hasAudit = audits.length > 0;
    const hasScore = audits.some((a) => a.freeScore !== undefined || a.fullScore !== undefined);
    const updates: Partial<OnboardingState> = {};
    if (hasAudit) updates.hasCreatedFirstAudit = true;
    if (hasScore) updates.hasGeneratedFreeScore = true;
    if (Object.keys(updates).length > 0) {
      updateOnboardingState(updates);
    }
    setState(getOnboardingState());
    setProgress(getOnboardingProgress());
  }, []);

  if (!state) return null;
  if (progress.percentage >= 100) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Onboarding Complete ✓</h3>
            <p className="mt-1 text-xs text-gray-500">You have completed all onboarding steps.</p>
          </div>
          <Badge variant="success">Done</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Getting Started</h3>
        <span className="text-xs text-gray-500">{progress.completed}/{progress.total}</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="space-y-2">
        {STEPS.map((step) => {
          const done = state[step.key];
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-600"
                }`}
              >
                {done ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[10px]">○</span>
                )}
              </div>
              {done ? (
                <span className="text-xs text-gray-500 line-through">{step.label}</span>
              ) : (
                <Link href={step.href} className="text-xs text-purple-300 hover:text-purple-200">
                  {step.label}
                </Link>
              )}
            </div>
          );
        })}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              state.hasSeenIntro ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-600"
            }`}
          >
            {state.hasSeenIntro ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-[10px]">○</span>
            )}
          </div>
          <span className={`text-xs ${state.hasSeenIntro ? "text-gray-500 line-through" : "text-gray-400"}`}>
            Seen the intro
          </span>
        </div>
      </div>
    </Card>
  );
}
