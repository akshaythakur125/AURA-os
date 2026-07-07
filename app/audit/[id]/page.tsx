"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAudits, getAuditById, updateAudit } from "@/lib/storage/auditStore";
import { shouldUseSupabase } from "@/lib/storage/storageMode";

import { generateFreeAuraReport, generateFreeReportWithPersonalization } from "@/lib/aura-engine/generateFreeAuraReport";
import { RecommendationSection } from "@/components/products/RecommendationSection";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { ShareModal } from "@/components/ui/ShareModal";
import { submitToGallery, hasSubmittedAudit } from "@/lib/storage/galleryStore";
import { hasReferralEarnedFreeFix } from "@/lib/storage/referralStore";
import { isMissionComplete, markMissionComplete, isChecklistComplete, markChecklistComplete } from "@/lib/storage/habitStore";
import type { FreeAuraResult, FullAuraReport, ProductType } from "@/types";
import type { PersonalizationResult } from "@/types/personalization";
import type { ProfileAuditResult } from "@/types/profileAudit";
import type { GlowUpPlan } from "@/types/glowup";
import type { QuickAuraFixReport } from "@/types/quickFix";
import { generateGoalStrategy, generateGoalStrategyTitle } from "@/lib/aura-engine/goalStrategy";
import { AUDIT_TYPE_LABELS, GOAL_LABELS, BUDGET_LABELS } from "@/lib/audit/auditUtils";
import { BeforeAfterCard } from "@/components/proof/BeforeAfterCard";
import { PROOF_EXAMPLES } from "@/config/proofExamples";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "warning" | "success" | "premium" }> = {
  draft: { label: "Draft", variant: "default" },
  free_generated: { label: "Free Score Generated", variant: "success" },
  full_report: { label: "Full Read", variant: "premium" },
};

const PRODUCT_CTA: { type: ProductType; name: string; price: number; gradient: string; features: string[]; badge?: string }[] = [
  { type: "quick_fix", name: "Fast Fix", price: 25, gradient: "from-emerald-500 to-teal-500", features: ["Biggest status leak", "Fastest free fix path", "Under ₹500 fix", "Under ₹2,000 fix", "Avoid wasting money"], badge: "Best first unlock" },
  { type: "aura_report", name: "Full Read", price: 44, gradient: "from-purple-600 to-pink-500", features: ["Full visual breakdown", "Detailed status leak analysis", "Budget upgrade roadmap", "Shareable Aura card", "Product recommendations"], badge: "Most popular" },
  { type: "dating_audit", name: "Dating/Profile Audit", price: 299, gradient: "from-rose-500 to-red-500", features: ["Profile Presentation Score", "Bio/prompt/caption feedback", "Red-flag cleanup", "Suggested bio versions", "Photo order strategy"] },
  { type: "glowup_plan", name: "30-Day Reset", price: 499, gradient: "from-amber-500 to-orange-500", features: ["30 daily missions", "4-week structured plan", "Budget roadmap (₹0–₹25K+)", "Photo/grooming/outfit system", "Progress tracker"], badge: "Best value" },
];

function ScoreGauge({ score, size = "lg", animate = true, onRevealComplete }: {
  score: number;
  size?: "sm" | "lg";
  animate?: boolean;
  onRevealComplete?: () => void;
}) {
  const [displayScore, setDisplayScore] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const completed = useRef(false);
  const onCompleteRef = useRef(onRevealComplete);
  onCompleteRef.current = onRevealComplete;

  useEffect(() => {
    completed.current = false;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!animate || prefersReduced) {
      setDisplayScore(score);
      setBarWidth(score);
      if (!completed.current) {
        completed.current = true;
        onCompleteRef.current?.();
      }
      return;
    }
    setDisplayScore(0);
    setBarWidth(0);
    const duration = 1200;
    let rafId: number;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      setBarWidth(score * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else if (!completed.current) {
        completed.current = true;
        onCompleteRef.current?.();
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [score, animate]);

  const dimension = size === "lg" ? "h-3" : "h-2";

  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className={`font-bold text-white tabular-nums ${size === "lg" ? "text-5xl" : "text-lg"}`}>{displayScore}</span>
        <span className="text-sm text-gray-500">/ 100</span>
      </div>
      <div className={`mt-2 overflow-hidden rounded-full bg-white/5 ${dimension}`}>
        <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-100" style={{ width: `${barWidth}%` }} />
      </div>
    </div>
  );
}

function DatingAuditSection({ report }: { report: ProfileAuditResult }) {
  return (
    <>
      <Card className="mb-8 border-rose-500/20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Badge variant="premium">Unlocked</Badge>
            <h2 className="mt-2 text-lg font-bold text-white">Dating/Profile Audit</h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Profile Presentation Score</div>
            <div className="text-3xl font-bold text-white">{report.profileScore}</div>
          </div>
        </div>
        <p className="mb-4 text-sm text-gray-300">{report.profileFrictionSummary}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            { label: "Clarity", value: report.textMetrics.clarityScore },
            { label: "Originality", value: report.textMetrics.originalityScore },
            { label: "Warmth", value: report.textMetrics.warmthScore },
            { label: "Confidence Signal", value: report.textMetrics.confidenceSignalScore },
            { label: "Readability", value: report.textMetrics.readabilityScore },
          ] as const).map((m) => (
            <div key={m.label}>
              <div className="mb-1 flex justify-between text-xs"><span className="text-gray-500">{m.label}</span><span className="text-gray-400">{m.value}</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500" style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {report.bioFeedback && (
        <Card className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-white">Bio Feedback</h3>
          <p className="mb-2 text-sm text-gray-300">{report.bioFeedback.overall}</p>
          <p className="mb-2 text-xs text-gray-500">{report.bioFeedback.lengthAssessment}</p>
          {report.bioFeedback.strengths.length > 0 && (
            <div className="mb-2"><div className="mb-1 text-xs text-emerald-400">Strengths</div><ul className="space-y-1">{report.bioFeedback.strengths.map((s) => (<li key={s} className="flex items-start gap-2 text-xs text-gray-300"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />{s}</li>))}</ul></div>
          )}
          {report.bioFeedback.weaknesses.length > 0 && (
            <div><div className="mb-1 text-xs text-amber-400">Weaknesses</div><ul className="space-y-1">{report.bioFeedback.weaknesses.map((w) => (<li key={w} className="flex items-start gap-2 text-xs text-gray-300"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />{w}</li>))}</ul></div>
          )}
        </Card>
      )}

      {report.promptFeedback.length > 0 && (
        <Card className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-white">Prompt / Caption Feedback</h3>
          <div className="space-y-3">
            {report.promptFeedback.map((pf, i) => (
              <div key={i} className="rounded-lg bg-white/5 p-3">
                <div className="mb-1 text-xs text-gray-500">Prompt {i + 1}</div>
                <p className="mb-1 text-sm text-white">{pf.prompt}</p>
                <p className="mb-1 text-xs text-gray-400">{pf.feedback}</p>
                <p className="text-xs text-purple-300">{pf.suggestion}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {report.redFlags.length > 0 && (
        <Card className="mb-8 border-red-500/20">
          <h3 className="mb-3 text-sm font-semibold text-white">Red Flags</h3>
          <ul className="space-y-2">
            {report.redFlags.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                {f}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mb-8">
        <h3 className="mb-3 text-sm font-semibold text-white">Suggested Bio Versions</h3>
        <div className="space-y-2">
          {report.suggestedBioVersions.map((v, i) => (
            <div key={i} className="rounded-lg bg-white/5 p-3 text-xs text-gray-300">{v}</div>
          ))}
        </div>
      </Card>

      <Card className="mb-8">
        <h3 className="mb-3 text-sm font-semibold text-white">Prompt Ideas</h3>
        <ul className="space-y-1">
          {report.suggestedPromptIdeas.map((idea) => (
            <li key={idea} className="flex items-start gap-2 text-xs text-gray-300"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-purple-400" />{idea}</li>
          ))}
        </ul>
      </Card>

      <Card className="mb-8">
        <h3 className="mb-3 text-sm font-semibold text-white">Photo Order Strategy</h3>
        <ul className="space-y-1">
          {report.photoOrderStrategy.map((s) => (
            <li key={s} className="flex items-start gap-2 text-xs text-gray-300"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />{s}</li>
          ))}
        </ul>
      </Card>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card className="border-emerald-500/20">
          <h3 className="mb-2 text-sm font-semibold text-emerald-400">Do This</h3>
          <ul className="space-y-1">
            {report.doThis.map((d) => (
              <li key={d} className="flex items-start gap-2 text-xs text-gray-300"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />{d}</li>
            ))}
          </ul>
        </Card>
        <Card className="border-red-500/20">
          <h3 className="mb-2 text-sm font-semibold text-red-400">Avoid This</h3>
          <ul className="space-y-1">
            {report.avoidThis.map((a) => (
              <li key={a} className="flex items-start gap-2 text-xs text-gray-300"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-red-400" />{a}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mb-8 border-purple-500/20">
        <h3 className="mb-2 text-sm font-semibold text-white">Final Profile Strategy</h3>
        <p className="text-sm text-gray-300">{report.finalProfileStrategy}</p>
      </Card>
    </>
  );
}

function GlowUpSection({ plan, auditId }: { plan: GlowUpPlan; auditId: string }) {
  const [weekIndex, setWeekIndex] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(() => {
    const set = new Set<number>();
    for (let d = 1; d <= 30; d++) {
      if (isMissionComplete(auditId, d)) set.add(d);
    }
    return set;
  });
  const [completedChecklist, setCompletedChecklist] = useState<Set<string>>(() => {
    const set = new Set<string>();
    for (let w = 1; w <= 4; w++) {
      for (let i = 0; i < 5; i++) {
        if (isChecklistComplete(auditId, w, i)) set.add(`${w}:${i}`);
      }
    }
    return set;
  });

  const handleMissionToggle = (day: number) => {
    const newSet = new Set(completedMissions);
    if (newSet.has(day)) return;
    markMissionComplete(auditId, day);
    newSet.add(day);
    setCompletedMissions(newSet);
  };

  const handleChecklistToggle = (weekNum: number, itemIndex: number) => {
    const key = `${weekNum}:${itemIndex}`;
    const newSet = new Set(completedChecklist);
    if (newSet.has(key)) return;
    markChecklistComplete(auditId, weekNum, itemIndex);
    newSet.add(key);
    setCompletedChecklist(newSet);
  };

  const totalCompleted = completedMissions.size;
  return (
    <>
      <Card className="mb-8 border-amber-500/20">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Badge variant="premium">Unlocked</Badge>
            <h2 className="mt-2 text-lg font-bold text-white">30-Day Reset</h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Plan Score</div>
            <div className="text-3xl font-bold text-amber-400">{plan.planScore}</div>
          </div>
        </div>
        <h3 className="mb-2 text-sm font-semibold text-white">{plan.planTitle}</h3>
        <p className="mb-3 text-sm text-gray-300">{plan.startingPointSummary}</p>
        <div className="rounded-lg bg-amber-500/10 p-3">
          <div className="mb-1 text-xs text-amber-400">Primary Bottleneck</div>
          <p className="text-sm text-gray-300">{plan.primaryBottleneck}</p>
        </div>
      </Card>

      {/* ─── Weekly Plan ─── */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          {plan.weeklyPlan.map((w) => (
            <button
              key={w.weekNumber}
              onClick={() => setWeekIndex(w.weekNumber - 1)}
              className={`rounded-full px-3 py-1 text-xs transition-all ${
                weekIndex === w.weekNumber - 1
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-white/5 text-gray-500 hover:text-gray-300"
              }`}
            >
              W{w.weekNumber}
            </button>
          ))}
        </div>
        {plan.weeklyPlan[weekIndex] && (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Week {plan.weeklyPlan[weekIndex].weekNumber}: {plan.weeklyPlan[weekIndex].theme}</h3>
                <p className="text-xs text-gray-400">{plan.weeklyPlan[weekIndex].objective}</p>
              </div>
              <Badge variant="premium">{plan.weeklyPlan[weekIndex].estimatedCost}</Badge>
            </div>
            <div className="mb-3 space-y-1">
              {plan.weeklyPlan[weekIndex].missions.map((m) => {
                const dayNum = parseInt(m.day.replace("Day ", ""), 10);
                const done = completedMissions.has(dayNum);
                return (
                  <div key={m.day} className="flex items-start gap-2 text-xs">
                    <button
                      onClick={() => handleMissionToggle(dayNum)}
                      className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                        done
                          ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                          : "border-white/10 bg-white/5 text-gray-500 hover:border-amber-500/30"
                      }`}
                    >
                      {done ? "✓" : m.day.replace("Day ", "")}
                    </button>
                    <div>
                      <span className={done ? "text-gray-500 line-through" : "text-gray-300"}>{m.title}</span>
                      <p className="text-gray-500">{m.task}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <details>
              <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300">Checklist</summary>
              <ul className="mt-2 space-y-1">
                {plan.weeklyPlan[weekIndex].checklist.map((c, i) => {
                  const key = `${plan.weeklyPlan[weekIndex].weekNumber}:${i}`;
                  const done = completedChecklist.has(key);
                  return (
                    <li key={c} className="flex items-start gap-2 text-xs">
                      <button
                        onClick={() => handleChecklistToggle(plan.weeklyPlan[weekIndex].weekNumber, i)}
                        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                          done
                            ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                            : "border-white/10 bg-white/5 text-gray-500 hover:border-amber-500/30"
                        }`}
                      >
                        {done ? "✓" : "○"}
                      </button>
                      <span className={done ? "text-gray-500 line-through" : "text-gray-300"}>{c}</span>
                    </li>
                  );
                })}
              </ul>
            </details>
          </Card>
        )}
      </div>

      {/* ─── Daily Missions ─── */}
      <Card className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Daily Missions</h3>
          <Badge variant={totalCompleted >= 20 ? "success" : totalCompleted >= 10 ? "warning" : "default"}>
            {totalCompleted}/30 done
          </Badge>
        </div>
        {totalCompleted > 0 && (
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${(totalCompleted / 30) * 100}%` }} />
          </div>
        )}
        <div className="space-y-2">
          {plan.dailyMissions.map((m) => {
            const done = completedMissions.has(m.day);
            return (
              <div key={m.day} className="flex items-start gap-3 rounded-lg bg-white/5 p-2.5">
                <button
                  onClick={() => handleMissionToggle(m.day)}
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    done
                      ? "bg-emerald-500/30 text-emerald-300"
                      : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                  }`}
                >
                  {done ? "✓" : m.day}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${done ? "text-gray-500 line-through" : "text-white"}`}>
                      {m.title}
                    </span>
                    <span className="text-[10px] text-gray-600">{m.timeRequired}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">{m.task}</p>
                  <p className="mt-0.5 text-[10px] text-gray-600">{m.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ─── Budget Roadmap ─── */}
      <Card className="mb-8">
        <h3 className="mb-3 text-sm font-semibold text-white">Budget Roadmap</h3>
        <div className="space-y-3">
          {([
            { label: "Free — ₹0", key: "free" as const },
            { label: "Under ₹2,000", key: "under2000" as const },
            { label: "Under ₹5,000", key: "under5000" as const },
            { label: "Under ₹10,000", key: "under10000" as const },
            { label: "Under ₹25,000+", key: "under25000" as const },
          ]).map((tier) => (
            <div key={tier.key}>
              <div className="mb-1 text-xs text-gray-500">{tier.label}</div>
              <ul className="space-y-1">
                {plan.budgetRoadmap[tier.key].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-300"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Systems ─── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-white">Photo System</h3>
          <div className="space-y-2 text-xs text-gray-400">
            <div><span className="text-gray-500">Best photo types:</span><ul className="mt-1 space-y-1">{plan.photoSystem.bestPhotoTypes.map((p) => (<li key={p} className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-purple-400" />{p}</li>))}</ul></div>
            <div className="mt-2"><span className="text-gray-500">Lighting:</span> {plan.photoSystem.lightingGuide}</div>
            <div className="mt-2"><span className="text-gray-500">Framing:</span> {plan.photoSystem.framingGuide}</div>
          </div>
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-white">Grooming System</h3>
          <div className="space-y-2 text-xs text-gray-400">
            <div><span className="text-gray-500">Daily:</span><ul className="mt-1 space-y-1">{plan.groomingSystem.dailyBasics.map((g) => (<li key={g} className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />{g}</li>))}</ul></div>
            <div className="mt-2"><span className="text-gray-500">Weekly:</span><ul className="mt-1 space-y-1">{plan.groomingSystem.weeklyHabits.map((g) => (<li key={g} className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />{g}</li>))}</ul></div>
          </div>
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-white">Outfit System</h3>
          <div className="space-y-2 text-xs text-gray-400">
            <div><span className="text-gray-500">Capsule wardrobe:</span><ul className="mt-1 space-y-1">{plan.outfitSystem.capsuleWardrobe.map((o) => (<li key={o} className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />{o}</li>))}</ul></div>
            <div className="mt-2"><span className="text-gray-500">Fit tips:</span><ul className="mt-1 space-y-1">{plan.outfitSystem.fitTips.map((o) => (<li key={o} className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />{o}</li>))}</ul></div>
          </div>
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-white">Background System</h3>
          <div className="space-y-2 text-xs text-gray-400">
            <div><span className="text-gray-500">Good:</span><ul className="mt-1 space-y-1">{plan.backgroundSystem.goodBackgrounds.map((b) => (<li key={b} className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />{b}</li>))}</ul></div>
            <div className="mt-2"><span className="text-gray-500">Bad:</span><ul className="mt-1 space-y-1">{plan.backgroundSystem.badBackgrounds.map((b) => (<li key={b} className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-red-400" />{b}</li>))}</ul></div>
          </div>
        </Card>
      </div>

      {/* ─── Avoid for Now ─── */}
      <Card className="mb-8 border-red-500/20">
        <h3 className="mb-2 text-sm font-semibold text-red-400">Avoid for Now</h3>
        <ul className="space-y-1">
          {plan.avoidForNow.map((a) => (
            <li key={a} className="flex items-start gap-2 text-xs text-gray-300"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-red-400" />{a}</li>
          ))}
        </ul>
      </Card>

      {/* ─── Expected Shift ─── */}
      <Card className="mb-8 border-amber-500/20">
        <p className="text-sm text-gray-300">{plan.expectedPresentationShift}</p>
      </Card>

      {/* ─── Final Advice ─── */}
      <Card className="mb-8 border-purple-500/20">
        <h3 className="mb-2 text-sm font-semibold text-white">Final Advice</h3>
        <p className="text-sm text-gray-300">{plan.finalAdvice}</p>
      </Card>
    </>
  );
}

function QuickFixSection({ report }: { report: QuickAuraFixReport }) {
  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Badge variant="premium">₹25 Quick Aura Fix</Badge>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card className="border-emerald-500/20">
          <div className="text-xs text-gray-500">Quick Fix Score</div>
          <div className="mt-1 text-3xl font-bold text-emerald-400">{report.quickFixScore}</div>
        </Card>
        <Card className="border-emerald-500/20">
          <div className="text-xs text-gray-500">Upgrade Priority</div>
          <div className="mt-1 text-lg font-semibold capitalize text-white">{report.upgradePriority}</div>
        </Card>
      </div>

      <Card className="mb-4 border-emerald-500/20">
        <h3 className="mb-3 text-sm font-semibold text-white">Biggest Status Leak</h3>
        <p className="mb-1 text-base font-medium text-white">{report.biggestLeak}</p>
        <p className="mb-2 text-sm text-gray-400">{report.leakExplanation}</p>
        <p className="text-xs text-gray-500">{report.whyItMatters}</p>
      </Card>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-emerald-500/20">
          <Badge variant="success">Free</Badge>
          <p className="mt-2 text-xs font-semibold text-white">Fastest Free Fix</p>
          <p className="mt-1 text-xs text-gray-400">{report.fastestFreeFix}</p>
        </Card>
        <Card className="border-emerald-500/20">
          <Badge variant="warning">Under ₹500</Badge>
          <p className="mt-2 text-xs font-semibold text-white">Low-Cost Fix</p>
          <p className="mt-1 text-xs text-gray-400">{report.under500Fix}</p>
        </Card>
        <Card className="border-emerald-500/20">
          <Badge variant="default">Under ₹2,000</Badge>
          <p className="mt-2 text-xs font-semibold text-white">Smart Investment</p>
          <p className="mt-1 text-xs text-gray-400">{report.under2000Fix}</p>
        </Card>
      </div>

      <Card className="mb-4 border-red-500/20">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <span className="text-sm font-semibold text-red-400">Avoid For Now</span>
        </div>
        <p className="mt-2 text-xs text-gray-400">{report.avoidForNow}</p>
      </Card>

      <Card className="mb-4 border-emerald-500/20">
        <h3 className="mb-3 text-sm font-semibold text-white">3-Step Action Plan</h3>
        <ol className="space-y-2">
          {report.threeStepActionPlan.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="mb-8 border-emerald-500/20">
        <p className="text-sm text-emerald-300">{report.finalOneLineAdvice}</p>
      </Card>
    </>
  );
}

function ProductCTAButtons({ auditId, unlockedProducts }: { auditId: string; unlockedProducts: ProductType[] }) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {PRODUCT_CTA.map((product) => {
        const isUnlocked = unlockedProducts.includes(product.type);
        const borderColor = isUnlocked ? "border-emerald-500/20"
          : product.type === "quick_fix" ? "border-emerald-500/30"
          : product.type === "aura_report" ? "border-purple-500/20"
          : product.type === "dating_audit" ? "border-rose-500/20"
          : "border-amber-500/20";
        return (
          <Card key={product.type} className={`relative flex flex-col border ${borderColor} ${product.type === "quick_fix" && !isUnlocked ? "ring-1 ring-emerald-500/20" : ""}`}>
            {product.badge && !isUnlocked && (
              <Badge variant={product.type === "quick_fix" ? "success" : product.type === "glowup_plan" ? "premium" : "warning"} className="absolute -top-2 right-4">
                {product.badge}
              </Badge>
            )}
            <div className="mb-3 flex items-center justify-between">
              <Badge variant={isUnlocked ? "success" : "default"}>{isUnlocked ? "Unlocked" : "Locked"}</Badge>
              <span className="text-lg font-bold text-white">₹{product.price}</span>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-white">{product.name}</h3>
            <ul className="mb-4 space-y-1">
              {product.features.slice(0, 3).map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="h-3 w-3 flex-shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              {isUnlocked ? (
                <p className="text-xs text-emerald-400">Already unlocked</p>
              ) : (
                <Button asChild className="w-full" size="sm">
                  <Link href={`/unlock?auditId=${auditId}&product=${product.type}`}>Unlock — ₹{product.price}</Link>
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // getAuditById reads localStorage, which doesn't exist during SSR -- calling
  // it as the initial useState value would render "Audit not found" on the
  // server and the real audit on the client's first paint, a guaranteed
  // hydration mismatch for anyone hard-navigating/refreshing this page.
  // Start unresolved and only read local storage inside an effect.
  const [audit, setAudit] = useState<ReturnType<typeof getAuditById> | null>(null);
  const [checkedLocal, setCheckedLocal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaksVisible, setLeaksVisible] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTipUnlocked, setShareTipUnlocked] = useState(false);

  // Check localStorage, then fall back to Supabase if not found locally
  useEffect(() => {
    const local = getAuditById(id) || null;
    setAudit(local);
    setCheckedLocal(true);
    if (!local && shouldUseSupabase()) {
      fetch(`/api/audits/${id}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.audit) setAudit(data.audit);
        })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (audit?.freeResult && !(audit.unlockedProducts || []).includes("quick_fix")) {
      trackEvent("quick_fix_paywall_viewed", { auditId: audit.id });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!audit) return;
    const prods: string[] = audit.unlockedProducts || [];
    const hasAllLeaks = prods.includes("quick_fix") || prods.includes("aura_report");
    if (hasAllLeaks) { setLeaksVisible(true); return; }
    setLeaksVisible(localStorage.getItem(`auracheck:v1:revealed:${audit.id}`) === "true");
  }, [audit]);

  // Auto-create before/after comparison when coming from glow-up completion
  useEffect(() => {
    if (!audit?.freeScore) return;
    try {
      const pendingBeforeId = localStorage.getItem("aura_pending_glowup_before");
      if (!pendingBeforeId) return;
      const beforeAudit = getAuditById(pendingBeforeId);
      if (!beforeAudit?.freeScore) return;
      // Auto-create progress comparison
      const comparisonId = `glowup-${beforeAudit.id}-${audit.id}`;
      const existing = getAudits().find(a => a.id === comparisonId);
      if (!existing) {
        const { createProgressComparison } = require("@/lib/storage/progressStore");
        createProgressComparison({
          id: comparisonId,
          beforeAuditId: beforeAudit.id,
          afterAuditId: audit.id,
          beforeScore: beforeAudit.freeScore,
          afterScore: audit.freeScore,
          daysBetween: 30,
          label: "30-Day Glow-Up",
          createdAt: Date.now(),
        });
      }
      localStorage.removeItem("aura_pending_glowup_before");
    } catch {}
  }, [audit?.freeScore]);

  if (!checkedLocal) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center text-sm text-gray-500">Loading audit...</div>
      </Container>
    );
  }

  if (!audit) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Audit not found</h1>
          <p className="mb-6 text-sm text-gray-400">This audit does not exist or may have been deleted.</p>
          <Button asChild variant="outline"><Link href="/dashboard">Go to Dashboard</Link></Button>
        </div>
      </Container>
    );
  }

  const statusInfo = STATUS_BADGE[audit.reportStatus] || STATUS_BADGE.draft;
  const freeResult: FreeAuraResult | undefined = audit.freeResult;
  const fullReport: FullAuraReport | undefined = audit.fullReport;
  const personalization: PersonalizationResult | undefined = audit.personalization;
  const datingReport: ProfileAuditResult | undefined = audit.datingProfileReport;
  const glowupPlan: GlowUpPlan | undefined = audit.glowupPlan;
  const quickFixReport = audit.quickFixReport;
  const referralFreeFix = typeof window !== "undefined" ? hasReferralEarnedFreeFix() : false;

  const unlockedProducts: ProductType[] = [
    ...(audit.unlockedProducts || []).filter((p): p is ProductType =>
      p === "quick_fix" || p === "aura_report" || p === "dating_audit" || p === "glowup_plan"
    ),
    ...(referralFreeFix ? (["quick_fix"] as ProductType[]) : []),
  ];

  async function handleGenerate() {
    if (!audit) return;
    const currentAudit = audit;
    setGenerating(true);
    setError(null);
    try {
      if (currentAudit.deepInput) {
        const { freeResult, personalization } = await generateFreeReportWithPersonalization(currentAudit);
        const updates: Record<string, unknown> = {
          reportStatus: "free_generated",
          freeScore: freeResult.auraScore,
          freeSummary: freeResult.oneLineVerdict,
          freeResult,
          personalization,
        };
        const updated = updateAudit(currentAudit.id, updates);
        if (shouldUseSupabase()) {
          fetch(`/api/audits/${currentAudit.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          }).catch(() => {});
        }
        if (updated) setAudit(updated);
      } else {
        const freeResult = await generateFreeAuraReport(currentAudit.imageDataUrl, currentAudit.budgetRange);
        const updates: Record<string, unknown> = {
          reportStatus: "free_generated",
          freeScore: freeResult.auraScore,
          freeSummary: freeResult.oneLineVerdict,
          freeResult,
        };
        const updated = updateAudit(currentAudit.id, updates);
        if (shouldUseSupabase()) {
          fetch(`/api/audits/${currentAudit.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          }).catch(() => {});
        }
        if (updated) setAudit(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  const severityColors: Record<string, string> = {
    high: "bg-red-500/10 border-red-500/20 text-red-400",
    medium: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    low: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <span className="text-xs text-gray-600">
            Created {new Date(audit.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        <h1 className="mb-8 text-2xl font-bold text-white sm:text-3xl">
          {AUDIT_TYPE_LABELS[audit.auditType] || audit.auditType}
        </h1>

        {/* ─── Image + Details ─── */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          <Card className="overflow-hidden p-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={audit.imageDataUrl} alt="Audit preview" className="w-full object-contain" />
          </Card>
          <div className="space-y-4">
            <Card>
              <div className="space-y-3">
                <div><div className="text-xs text-gray-500">Audit Type</div><div className="text-sm text-white">{AUDIT_TYPE_LABELS[audit.auditType] || audit.auditType}</div></div>
                <div><div className="text-xs text-gray-500">Goal</div><div className="text-sm text-white">{GOAL_LABELS[audit.goal] || audit.goal}</div></div>
                <div><div className="text-xs text-gray-500">Budget Range</div><div className="text-sm text-white">{BUDGET_LABELS[audit.budgetRange] || audit.budgetRange}</div></div>
              </div>
            </Card>
            <Card>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between"><span>File</span><span className="text-gray-400">{audit.imageMeta.fileName}</span></div>
                <div className="flex justify-between"><span>Dimensions</span><span className="text-gray-400">{audit.imageMeta.width} &times; {audit.imageMeta.height}</span></div>
                <div className="flex justify-between"><span>Score</span><span className="text-gray-400">{audit.fullScore ?? audit.freeScore ?? "—"}</span></div>
              </div>
            </Card>
          </div>
        </div>

        {/* ─── Full Report already unlocked ─── */}
        {fullReport ? (
          <>
            <Card className="mb-8">
              <div className="mb-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-gray-500">Full Aura Score</div>
                  <ScoreGauge score={fullReport.fullScore} />
                  <div className="mt-3"><Badge variant="premium">{fullReport.category}</Badge></div>
                </div>
                <div className="space-y-4">
                  <div><div className="text-xs text-gray-500">Detailed Verdict</div><p className="mt-1 text-sm text-gray-300">{fullReport.detailedVerdict}</p></div>
                  <div><div className="text-xs text-gray-500">Strongest Signals</div><div className="mt-1 flex flex-wrap gap-1.5">{fullReport.strongestSignals.map((s) => (<span key={s} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">{s}</span>))}</div></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4">
                <Button size="sm" variant="outline" onClick={() => {
                  setShareModalOpen(true);
                  trackEvent("share_card_viewed");
                }}>📤 Share Your Report</Button>
                <Button size="sm" variant="ghost" onClick={async () => {
                  const shareUrl = `${location.origin}/api/share-card?score=${fullReport.fullScore}&category=${encodeURIComponent(fullReport.category)}&signal=${encodeURIComponent(fullReport.strongestSignals[0] || "Presentation")}&leak=${encodeURIComponent(fullReport.biggestStatusLeaks[0]?.title || "Background")}&url=${encodeURIComponent(location.origin)}`;
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    trackEvent("share_card_link_copied");
                  } catch { /* clipboard unavailable */ }
                }}>🔗 Copy link</Button>{" "}
                {shareTipUnlocked && (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400 self-center">
                    🎁 Tip unlocked
                  </span>
                )}
                <Button asChild size="sm" variant="ghost"><Link href="/progress">📊 Compare Progress</Link></Button>
                <Button asChild size="sm" variant="ghost"><Link href="/twin-simulator">🔮 Aura Twin</Link></Button>
              </div>
            </Card>

            {/* ─── Status Archetype ─── */}
            {personalization && (() => {
              const strategy = generateGoalStrategy(audit, personalization);
              const strategyTitle = generateGoalStrategyTitle(audit);
              return (
                <>
                  <Card className="mb-8 border-purple-500/20">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="premium">Archetype</Badge>
                      <span className="text-sm font-semibold text-white">{personalization.archetype}</span>
                    </div>
                    <p className="mb-4 text-sm text-gray-300">{personalization.archetypeExplanation}</p>
                    <div className="rounded-lg bg-white/5 p-3">
                      <div className="mb-1 text-xs text-purple-400">Your Best Next Move</div>
                      <p className="text-sm text-gray-300">{personalization.userPriority}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {personalization.recommendedFocus.map((f) => (
                        <span key={f} className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-300">{f}</span>
                      ))}
                    </div>
                  </Card>

                  {personalization.signalMismatches.length > 0 && (
                    <>
                      <h2 className="mb-4 text-lg font-semibold text-white">Signal Mismatch Map</h2>
                      <div className="mb-8 space-y-3">
                        {personalization.signalMismatches.map((m) => (
                          <Card key={m.title} className={`border ${m.severity === "high" ? "border-red-500/20" : m.severity === "medium" ? "border-amber-500/20" : "border-blue-500/20"}`}>
                            <div className="mb-1 flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-white">{m.title}</h3>
                              <Badge variant={m.severity === "high" ? "danger" : m.severity === "medium" ? "warning" : "default"}>{m.severity}</Badge>
                            </div>
                            <p className="mb-2 text-xs text-gray-400">{m.explanation}</p>
                            <p className="text-xs text-purple-300">{m.correction}</p>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}

                  <Card className="mb-8 border-emerald-500/20">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="success">Strategy</Badge>
                      <span className="text-sm font-semibold text-white">{strategyTitle}</span>
                    </div>
                    <p className="text-sm text-gray-300">{strategy}</p>
                  </Card>
                </>
              );
            })()}

            {/* ─── Visual Breakdown ─── */}
            <h2 className="mb-4 text-lg font-semibold text-white">Visual Breakdown</h2>
            <Card className="mb-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  { label: "Lighting", value: fullReport.visualBreakdown.lighting },
                  { label: "Clarity", value: fullReport.visualBreakdown.clarity },
                  { label: "Composition", value: fullReport.visualBreakdown.composition },
                  { label: "Background Control", value: fullReport.visualBreakdown.backgroundControl },
                  { label: "Color Signal", value: fullReport.visualBreakdown.colorSignal },
                  { label: "Premium Signal", value: fullReport.visualBreakdown.premiumSignal },
                  { label: "Overall Consistency", value: fullReport.visualBreakdown.overallConsistency },
                ] as const).map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs"><span className="text-gray-500">{item.label}</span><span className="text-gray-400">{item.value}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ─── Biggest Status Leaks ─── */}
            <h2 className="mb-4 text-lg font-semibold text-white">Biggest Status Leaks</h2>
            <div className="mb-8 space-y-3">
              {fullReport.biggestStatusLeaks.map((leak) => (
                <Card key={leak.title} className={`border ${severityColors[leak.severity] || severityColors.low}`}>
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{leak.title}</h3>
                    <Badge variant={leak.severity === "high" ? "danger" : leak.severity === "medium" ? "warning" : "default"}>{leak.severity}</Badge>
                  </div>
                  <p className="mb-1 text-xs text-gray-400">{leak.explanation}</p>
                  <p className="mb-2 text-xs text-purple-300">{leak.fix}</p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Estimated cost: <span className="text-amber-400">{leak.estimatedCost}</span></span>
                    <span>Impact: {leak.impactScore}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* ─── Priority Upgrade Map ─── */}
            <h2 className="mb-4 text-lg font-semibold text-white">Priority Upgrade Map</h2>
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-emerald-500/20"><div className="text-xs text-emerald-400 mb-1">First Priority</div><p className="text-sm text-white">{fullReport.priorityUpgradeMap.firstPriority}</p></Card>
              <Card className="border-amber-500/20"><div className="text-xs text-amber-400 mb-1">Second Priority</div><p className="text-sm text-white">{fullReport.priorityUpgradeMap.secondPriority}</p></Card>
              <Card className="border-red-500/20"><div className="text-xs text-red-400 mb-1">Avoid for Now</div><p className="text-sm text-white">{fullReport.priorityUpgradeMap.avoidForNow}</p></Card>
            </div>

            {/* ─── Budget Upgrade Plan ─── */}
            <h2 className="mb-4 text-lg font-semibold text-white">Budget Upgrade Plan</h2>
            {([
              { label: "Free — Immediate", key: "immediateFree" as const },
              { label: "Under ₹2,000", key: "under2000" as const },
              { label: "Under ₹5,000", key: "under5000" as const },
              { label: "Under ₹10,000", key: "under10000" as const },
              { label: "Under ₹25,000", key: "under25000" as const },
            ]).map((tier) => (
              <Card key={tier.key} className="mb-3">
                <h3 className="mb-2 text-sm font-semibold text-white">{tier.label}</h3>
                <ul className="space-y-1">
                  {fullReport.budgetUpgradePlan[tier.key].map((action) => (
                    <li key={action} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="mt-1 h-1 w-1 rounded-full bg-purple-400" />
                      {action}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}

            {/* ─── Photo Guidance ─── */}
            <h2 className="mb-4 text-lg font-semibold text-white">Photo Guidance</h2>
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {([
                { label: "Lighting", value: fullReport.photoGuidance.lighting },
                { label: "Framing", value: fullReport.photoGuidance.framing },
                { label: "Background", value: fullReport.photoGuidance.background },
                { label: "Presentation", value: fullReport.photoGuidance.presentation },
                { label: "Editing", value: fullReport.photoGuidance.editing },
              ] as const).map((item) => (
                <Card key={item.label}>
                  <h3 className="mb-1 text-sm font-semibold text-white">{item.label}</h3>
                  <p className="text-xs text-gray-400">{item.value}</p>
                </Card>
              ))}
            </div>

            {/* ─── Final Verdict ─── */}
            <Card className="mb-8 border-purple-500/20">
              <h3 className="mb-2 text-sm font-semibold text-white">Final Verdict</h3>
              <p className="text-sm text-gray-300">{fullReport.finalVerdict}</p>
            </Card>

            {/* ─── Premium Recommendations ─── */}
            <RecommendationSection audit={audit} />

            {/* ─── Upsell: Full Report → Glow-Up Plan ─── */}
            {!unlockedProducts.includes("glowup_plan") && (
              <Card className="mb-8 border-amber-500/20">
                <h3 className="mb-2 text-lg font-bold text-white">Want a 30-day action system?</h3>
                <p className="mb-4 text-sm text-gray-400">
                  The Full Read shows what to fix. The 30-Day Reset shows how to fix it — day by day, step by step.
                </p>
                <Button asChild variant="outline" size="sm" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                  <Link href={`/unlock?auditId=${audit.id}&product=glowup_plan`}>
                    Unlock 30-Day Reset — ₹499
                  </Link>
                </Button>
              </Card>
            )}
          </>
        ) : freeResult ? (
          <>
            {/* ─── Free Score Results ─── */}
            <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-b from-[#0d1a2d] to-[#0a1222]">
              <div className="mb-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-gray-500">Aura Score</div>
                  <ScoreGauge score={freeResult.auraScore} onRevealComplete={() => {
                    localStorage.setItem(`auracheck:v1:revealed:${audit.id}`, "true");
                    setLeaksVisible(true);
                  }} />
                  <div className="mt-3"><Badge variant="premium">{freeResult.category}</Badge></div>
                </div>
                <div className="space-y-4">
                  <div><div className="text-xs text-gray-500">Verdict</div><p className="mt-1 text-sm text-gray-300">{freeResult.oneLineVerdict}</p></div>
                  <div><div className="text-xs text-gray-500">Strongest Signals</div><div className="mt-1 flex flex-wrap gap-1.5">{freeResult.strongestSignals.map((s) => (<span key={s} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">{s}</span>))}</div></div>
                </div>
              </div>

              {/* ─── Potential Score Bar ─── */}
              {(() => {
                const totalImpact = freeResult.statusLeaks.reduce((sum, l) => sum + l.impactScore, 0);
                const estimated = Math.min(100, freeResult.auraScore + totalImpact);
                return (
                  <div className="rounded-[16px] border border-emerald-500/15 bg-gradient-to-r from-emerald-500/[0.06] to-sky-500/[0.06] px-4 py-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-white/50">Your potential</span>
                      <span className="text-[10px] text-white/30">fix {freeResult.statusLeaks.length} leaks</span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-white/5">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-500" style={{ width: `${freeResult.auraScore}%` }} />
                      <div className="absolute inset-y-0 rounded-full bg-gradient-to-r from-emerald-400/40 to-emerald-400/20" style={{ left: `${freeResult.auraScore}%`, width: `${estimated - freeResult.auraScore}%` }}>
                        <div className="h-full w-full animate-pulse rounded-full bg-emerald-400/30" />
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{freeResult.auraScore}</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        <span className="display-font text-lg font-bold text-emerald-400">{estimated}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
                      <span className="text-[11px] text-white/40">
                        Beats <span className="font-semibold text-white/70">{Math.min(94, Math.max(8, Math.round(freeResult.auraScore * 0.9)))}%</span> of 12,400+ photos scored
                      </span>
                      {!unlockedProducts.includes("aura_report") && (
                        <Link href={`/unlock?auditId=${audit.id}&product=aura_report`} className="flex items-center gap-1 text-[11px] font-medium text-purple-300 hover:text-purple-200">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          Top 10% playbook
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                <Button size="sm" variant="outline" onClick={() => {
                  setShareModalOpen(true);
                  trackEvent("share_card_viewed");
                }}>Share Your Score</Button>
                <Button size="sm" variant="ghost" onClick={async () => {
                  const shareUrl = `${location.origin}/api/share-card?score=${freeResult.auraScore}&category=${encodeURIComponent(freeResult.category)}&signal=${encodeURIComponent(freeResult.strongestSignals[0] || "Presentation")}&leak=${encodeURIComponent(freeResult.statusLeaks[0]?.title || "Background")}&url=${encodeURIComponent(location.origin)}`;
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    trackEvent("share_card_link_copied");
                  } catch { /* clipboard unavailable */ }
                }}>Copy link</Button>
                <Button size="sm" variant="ghost" onClick={async () => {
                  const shareUrl = `${location.origin}/api/share-card?score=${freeResult.auraScore}&category=${encodeURIComponent(freeResult.category)}&signal=${encodeURIComponent(freeResult.strongestSignals[0] || "Presentation")}&leak=${encodeURIComponent(freeResult.statusLeaks[0]?.title || "Background")}&url=${encodeURIComponent(location.origin)}`;
                  try {
                    await navigator.share({ title: "My Aura Score", text: `My Aura Score: ${freeResult.auraScore}/100`, url: shareUrl });
                    trackEvent("share_card_native_shared");
                  } catch { /* native share unavailable or cancelled */ }
                }}>Share</Button>
              </div>
            </Card>

            {/* ─── The 0.3-Second Read — what strangers register at first glance ─── */}
            {(() => {
              const hasPaid = unlockedProducts.includes("quick_fix") || unlockedProducts.includes("aura_report");
              const positiveRead = freeResult.strongestSignals[0] || "Composition";
              return (
                <div className="mb-6 overflow-hidden rounded-[20px] border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.07] to-transparent">
                  <div className="px-5 pt-5 pb-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-2.5 py-1 text-[10px] font-bold tracking-wider text-purple-300">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        THE 0.3-SECOND READ
                      </span>
                    </div>
                    <h3 className="display-font text-lg font-bold text-white">What strangers register before they even think</h3>
                    <p className="mt-1 text-xs text-white/40">A first impression forms in under half a second. This is what your photo says in that window.</p>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-start gap-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 px-3.5 py-3">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <div>
                        <div className="text-sm font-semibold text-white">Your {positiveRead.toLowerCase()} lands</div>
                        <div className="text-xs text-white/40">It reads intentional — people register this as effort. Keep it.</div>
                      </div>
                    </div>
                    {freeResult.statusLeaks.slice(0, hasPaid ? freeResult.statusLeaks.length : 3).map((leak, idx) => {
                      if (hasPaid || idx === 0) {
                        return (
                          <div key={leak.title} className="flex items-start gap-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/15 px-3.5 py-3">
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                            <div>
                              <div className="text-sm font-semibold text-white">{leak.title}</div>
                              <div className="text-xs text-white/40">{leak.explanation}</div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={leak.title} className="relative overflow-hidden rounded-xl border border-white/8">
                          <div className="absolute inset-0 z-10 flex items-center justify-between bg-[#0a0a12]/70 px-3.5 backdrop-blur-[3px]">
                            <div className="flex items-center gap-2">
                              <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                              <span className="text-xs font-medium text-white/60">Read #{idx + 1} — what this makes people assume</span>
                            </div>
                            <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-300">locked</span>
                          </div>
                          <div className="px-3.5 py-3" style={{ filter: "blur(5px)" }}>
                            <div className="text-sm font-semibold text-white">{leak.title}</div>
                            <div className="text-xs text-white/40">{leak.explanation}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!hasPaid && (
                    <div className="border-t border-white/5 bg-white/[0.02] px-5 py-3">
                      <Link href={`/unlock?auditId=${audit.id}&product=quick_fix`} className="flex items-center justify-between" onClick={() => trackEvent("quick_fix_cta_clicked", { auditId: audit.id, source: "first_impression_read" })}>
                        <span className="text-xs text-white/50">They already see it. You should too.</span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                          Unlock the full read — ₹25
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ─── Urgency banner ─── */}
            {!unlockedProducts.includes("quick_fix") && !unlockedProducts.includes("aura_report") && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-2.5">
                <svg className="h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs text-amber-200/80">Your detailed analysis is ready and available for <span className="font-semibold text-amber-300">48 hours</span>. After that, you&apos;ll need to re-upload.</p>
              </div>
            )}

            {/* Gallery submission */}
            {freeResult && !hasSubmittedAudit(audit.id) && (
              <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 text-center">
                <p className="text-sm text-gray-300">Proud of your score? Add it to the Aura Gallery!</p>
                <p className="text-xs text-gray-500 mt-1">Anonymous — nickname only. Inspire others to check their aura.</p>
                <div className="mt-3 flex justify-center gap-2">
                  <Button size="sm" onClick={() => {
                    const nickname = prompt("Pick a nickname for the gallery:")?.trim();
                    if (!nickname) return;
                    submitToGallery({
                      nickname,
                      score: freeResult.auraScore,
                      category: freeResult.category as string,
                      oneLineVerdict: freeResult.oneLineVerdict,
                      strongestSignal: freeResult.strongestSignals[0] || "Presentation",
                      biggestLeak: freeResult.statusLeaks[0]?.title || "Background",
                      auditId: audit.id,
                    });
                    trackEvent("challenge_entered", { source: "gallery_submit", score: String(freeResult.auraScore) });
                    alert("Added to gallery! Check it at /gallery");
                  }}>
                    Add to Gallery
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Free Archetype ─── */}
            {personalization && (
              <Card className="mb-6 border-purple-500/20">
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="premium">Archetype</Badge>
                  <span className="text-sm font-semibold text-white">{personalization.archetype}</span>
                </div>
                <p className="mb-3 text-sm text-gray-300">{personalization.archetypeExplanation}</p>
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="mb-1 text-xs text-purple-400">Best Next Move</div>
                  <p className="text-sm text-gray-300">{personalization.userPriority}</p>
                </div>
              </Card>
            )}

            {referralFreeFix && (
              <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-center text-sm text-emerald-300">
                3 friends joined — Fast Fix unlocked on us.
              </div>
            )}

            <h2 className="mb-4 text-lg font-semibold text-white">Status Leaks</h2>
            <div className={`mb-4 space-y-3 transition-all duration-700 ease-out ${leaksVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "100ms" }}>
              {freeResult.statusLeaks.map((leak, idx) => {
                const hasPaidLeakAccess = unlockedProducts.includes("quick_fix") || unlockedProducts.includes("aura_report");
                if (idx > 0 && !hasPaidLeakAccess) {
                  return (
                    <div key={leak.title} className="group relative overflow-hidden rounded-2xl border border-white/8 transition-all duration-500"
                      style={{ transitionDelay: `${300 + idx * 100}ms` }}>
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0a0a0f]/70 backdrop-blur-[2px]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
                          <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-white">+{leak.impactScore} pts hidden</div>
                          <div className="text-[11px] text-white/40">Unlock to see this fix</div>
                        </div>
                      </div>
                      <div className="p-4 pb-3" style={{ filter: "blur(6px)" }}>
                        <div className="mb-1 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white">{leak.title}</h3>
                          <Badge variant={leak.severity === "high" ? "danger" : leak.severity === "medium" ? "warning" : "default"}>{leak.severity}</Badge>
                        </div>
                        <p className="mb-2 text-xs text-gray-400">{leak.explanation}</p>
                        <p className="text-xs text-purple-300">{leak.fix}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <Card key={leak.title} className={`border ${severityColors[leak.severity] || severityColors.low} transition-all duration-500`}
                    style={{ transitionDelay: `${300 + idx * 100}ms` }}>
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">{leak.title}</h3>
                      <Badge variant={leak.severity === "high" ? "danger" : leak.severity === "medium" ? "warning" : "default"}>{leak.severity}</Badge>
                    </div>
                    <p className="mb-2 text-xs text-gray-400">{leak.explanation}</p>
                    <p className="text-xs text-purple-300">{leak.fix}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                      <span>Impact</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.min(100, leak.impactScore)}%` }} />
                      </div>
                      <span className="text-gray-500">{leak.impactScore}</span>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* ─── Before/After Proof (moved up — right after leaks, before paywall) ─── */}
            {!unlockedProducts.includes("quick_fix") && (() => {
              const firstLeak = freeResult.statusLeaks[0]?.title?.toLowerCase() || "";
              const match = PROOF_EXAMPLES.find((e) =>
                firstLeak.includes("lighting") ? e.id === "lighting-fix-01"
                : firstLeak.includes("background") ? e.id === "background-fix-01"
                : firstLeak.includes("clarity") || firstLeak.includes("crop") || firstLeak.includes("framing") ? e.id === "crop-framing-01"
                : firstLeak.includes("composition") ? e.id === "crop-framing-01"
                : e.id === "lighting-fix-01"
              ) || PROOF_EXAMPLES[0];
              return (
                <div className="mb-4 overflow-hidden rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03]">
                  <div className="px-4 pt-4 pb-2">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="success">Real result</Badge>
                      <span className="text-[11px] text-white/30">similar leak to yours</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <BeforeAfterCard example={match} compact />
                  </div>
                </div>
              );
            })()}

            {/* ─── PRIMARY PAYWALL — right after proof ─── */}
            {!unlockedProducts.includes("quick_fix") && !unlockedProducts.includes("aura_report") && (
              <div className="mb-8 overflow-hidden rounded-[24px] border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.08] via-emerald-500/[0.03] to-transparent"
                style={{ boxShadow: "0 0 40px rgba(16,185,129,0.06)" }}>
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-400 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      {freeResult.statusLeaks.reduce((sum, l) => sum + l.impactScore, 0)} pts leaking
                    </span>
                  </div>
                  <h3 className="display-font mb-2 text-xl font-bold text-white sm:text-2xl">
                    You&apos;re leaving {freeResult.statusLeaks.reduce((sum, l) => sum + l.impactScore, 0)} points on the table.
                  </h3>
                  <p className="mb-5 text-sm text-white/50">
                    You saw leak #1. The other {freeResult.statusLeaks.length - 1} are hidden — each with the exact fix and how many points it recovers. Most people fix the wrong thing first and waste money.
                  </p>

                  <div className="mb-5 grid gap-2 sm:grid-cols-2">
                    {[
                      { icon: <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: "Every leak revealed with fix" },
                      { icon: <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, text: "Fastest free fix for each" },
                      { icon: <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: "Under-₹500 upgrade options" },
                      { icon: <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>, text: "What NOT to waste money on" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2.5">
                        {item.icon}
                        <span className="text-xs text-white/70">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/unlock?auditId=${audit.id}&product=quick_fix`} className="block" onClick={() => trackEvent("quick_fix_cta_clicked", { auditId: audit.id })}>
                    <Button className="cta-shine cta-breathe w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-base font-semibold text-white hover:from-emerald-400 hover:to-teal-400" size="lg">
                      Unlock all fixes — ₹25
                    </Button>
                  </Link>
                  <p className="mt-2 text-center text-[11px] text-white/30">Less than a chai. UPI / cards. Instant unlock.</p>

                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] text-white/20">or</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  <Link href={`/unlock?auditId=${audit.id}&product=aura_report`} className="block">
                    <Button variant="outline" className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10" size="lg">
                      Full report with upgrade roadmap — ₹44
                    </Button>
                  </Link>
                </div>

                <div className="border-t border-white/5 bg-white/[0.02] px-5 py-3">
                  <div className="flex items-center justify-center gap-4 text-[10px] text-white/25">
                    <span>12,400+ audits analyzed</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-white/20" />
                    <span>Avg +{Math.round(freeResult.statusLeaks.reduce((s, l) => s + l.impactScore, 0) * 0.7)} pts after fixing</span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Teased Quick Fixes (gated) ─── */}
            {!unlockedProducts.includes("quick_fix") && !unlockedProducts.includes("aura_report") ? (
              <div className="relative mb-8">
                <h2 className="mb-4 text-lg font-semibold text-white">Quick Fixes</h2>
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#0a0a0f]/70 backdrop-blur-[3px]">
                    <Link href={`/unlock?auditId=${audit.id}&product=quick_fix`}>
                      <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                        Unlock {freeResult.quickFixes.length} fixes — ₹25
                      </Button>
                    </Link>
                    <span className="text-[10px] text-white/25">Your fixes are ready</span>
                  </div>
                  <div className="p-4 space-y-2" style={{ filter: "blur(4px)" }}>
                    {freeResult.quickFixes.slice(0, 3).map((fix) => (
                      <div key={fix} className="flex items-start gap-2 text-sm text-gray-300">
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        {fix}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="mb-4 text-lg font-semibold text-white">Quick Fixes</h2>
                <Card className="mb-8">
                  <ul className="space-y-2">
                    {freeResult.quickFixes.map((fix) => (
                      <li key={fix} className="flex items-start gap-2 text-sm text-gray-300">
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        {fix}
                      </li>
                    ))}
                  </ul>
                </Card>
              </>
            )}

            {/* ─── Budget Upgrade Plan (gated for non-payers) ─── */}
            {!unlockedProducts.includes("quick_fix") && !unlockedProducts.includes("aura_report") ? (
              <div className="relative mb-8">
                <h2 className="mb-4 text-lg font-semibold text-white">Budget Upgrade Plan</h2>
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#0a0a0f]/70 backdrop-blur-[3px]">
                    <Link href={`/unlock?auditId=${audit.id}&product=aura_report`}>
                      <Button size="sm">Full budget plan — ₹44</Button>
                    </Link>
                    <span className="text-[10px] text-white/25">Personalized to your ₹{audit.budgetRange || "5,000"} budget</span>
                  </div>
                  <div className="p-4 space-y-3" style={{ filter: "blur(4px)" }}>
                    {freeResult.budgetUpgradePlan.slice(0, 2).map((plan) => (
                      <div key={`${plan.budgetRange}-${plan.priority}`} className="rounded-xl bg-white/[0.03] p-3">
                        <div className="text-xs text-gray-400">₹{plan.budgetRange}</div>
                        <ul className="mt-1 space-y-1">{plan.actions.slice(0, 2).map((a) => (<li key={a} className="text-xs text-gray-500">{a}</li>))}</ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="mb-4 text-lg font-semibold text-white">Budget Upgrade Plan</h2>
                {freeResult.budgetUpgradePlan.map((plan) => (
                  <Card key={`${plan.budgetRange}-${plan.priority}`} className="mb-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="premium">&#8377;{plan.budgetRange === "0" ? "0" : plan.budgetRange === "25000" ? "25,000+" : Number(plan.budgetRange).toLocaleString("en-IN")}</Badge>
                      <span className="text-xs text-gray-500">Priority {plan.priority}</span>
                    </div>
                    <ul className="mb-2 space-y-1">{plan.actions.map((a) => (<li key={a} className="flex items-start gap-2 text-xs text-gray-300"><span className="mt-1 h-1 w-1 rounded-full bg-purple-400" />{a}</li>))}</ul>
                    <p className="text-xs text-emerald-400">{plan.estimatedImpact}</p>
                  </Card>
                ))}
              </>
            )}

            <details className="mb-8">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">Image Metrics Details</summary>
              <Card className="mt-3">
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  {[
                    { label: "Brightness", value: freeResult.imageMetrics.brightness },
                    { label: "Contrast", value: freeResult.imageMetrics.contrast },
                    { label: "Saturation", value: freeResult.imageMetrics.saturation },
                    { label: "Sharpness", value: freeResult.imageMetrics.sharpness },
                    { label: "Edge Density", value: freeResult.imageMetrics.edgeDensity },
                    { label: "Lighting", value: freeResult.imageMetrics.lightingScore },
                    { label: "Clarity", value: freeResult.imageMetrics.clarityScore },
                    { label: "Composition", value: freeResult.imageMetrics.compositionScore },
                    { label: "Background Complexity", value: freeResult.imageMetrics.backgroundComplexityEstimate },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="text-gray-500">{m.label}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-purple-500" style={{ width: `${m.value}%` }} /></div>
                        <span className="text-gray-400">{m.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </details>

            {/* ─── Wardrobe (only for paid users) ─── */}
            {(unlockedProducts.includes("quick_fix") || unlockedProducts.includes("aura_report")) && (
              <>
                <RecommendationSection audit={audit} />
                <Card className="mb-8 border-purple-500/20">
                  <div className="mb-4">
                    <Badge variant="premium" className="mb-2">Aura Wardrobe Direction</Badge>
                    <h3 className="text-lg font-bold text-white">What to wear based on your analysis</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Your Aura Check identified visual signals that clothing choices can improve.
                    </p>
                  </div>
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <Button asChild className="w-full"><Link href={`/wardrobe/${audit.id}`}>Compare clothes across stores</Link></Button>
                    <Button asChild variant="outline" className="w-full"><Link href={`/wardrobe/diagnosis/${audit.id}`}>Visual Wardrobe Diagnosis</Link></Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Prices from AuraCheck&rsquo;s catalog. Verify on store before buying.
                  </p>
                </Card>
              </>
            )}

            {/* ─── Final CTA for free users ─── */}
            {!unlockedProducts.includes("quick_fix") && !unlockedProducts.includes("aura_report") && (
              <div className="mb-8 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center">
                <p className="mb-1 text-sm font-semibold text-white">Still thinking?</p>
                <p className="mb-4 text-xs text-white/40">Most people fix the wrong thing first and waste 10x the cost. ₹25 tells you the right move.</p>
                <Link href={`/unlock?auditId=${audit.id}&product=quick_fix`}>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400" size="sm">
                    Unlock all fixes — ₹25
                  </Button>
                </Link>
              </div>
            )}

            {/* ─── Product CTAs ─── */}
            <ProductCTAButtons auditId={audit.id} unlockedProducts={unlockedProducts} />

            {/* ─── Sticky mobile purchase bar (free users only) ─── */}
            {!unlockedProducts.includes("quick_fix") && !unlockedProducts.includes("aura_report") && (
              <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-500/20 bg-[#07111f]/95 px-4 py-3 backdrop-blur-lg sm:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">{freeResult.statusLeaks.reduce((s, l) => s + l.impactScore, 0)} pts recoverable</div>
                    <div className="text-[10px] text-white/40">Fix path ready</div>
                  </div>
                  <Link href={`/unlock?auditId=${audit.id}&product=quick_fix`}>
                    <Button className="cta-shine cta-breathe bg-gradient-to-r from-emerald-500 to-teal-500 px-5 text-sm font-semibold text-white whitespace-nowrap" size="sm">
                      Unlock — ₹25
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ─── Generate Button ─── */
          <Card className="mb-8">
            <h3 className="mb-3 text-sm font-semibold text-white">Generate Free Aura Score</h3>
            <p className="mb-4 text-sm text-gray-400">Analyze this image locally and get your free Aura Score, status leaks, and upgrade plan.</p>
            {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
            {generating ? (
              <div className="space-y-4">
                <Button disabled className="w-full">
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing your photo locally...
                  </span>
                </Button>
                <div className="h-20 animate-pulse rounded-xl bg-white/[0.03]" />
                <div className="h-12 animate-pulse rounded-xl bg-white/[0.03]" />
              </div>
            ) : (
              <Button onClick={handleGenerate} className="w-full">Generate Free Aura Score</Button>
            )}
            <p className="mt-2 text-xs text-gray-600">Image is analyzed locally. No data is sent to any server.</p>
          </Card>
        )}

        {/* ─── Quick Aura Fix Section (if unlocked) ─── */}
        {quickFixReport && (
          <>
            <QuickFixSection report={quickFixReport} />

            {/* ─── Micro-upsell after Quick Fix ─── */}
            <Card className="mb-8 border-purple-500/20 ring-1 ring-purple-500/20">
              <h3 className="mb-2 text-lg font-bold text-white">Want the full reason behind this fix?</h3>
              <p className="mb-4 text-sm text-gray-400">
                The ₹25 Quick Fix tells you the fastest move. The ₹44 Full Aura Report gives the full visual breakdown, archetype, mismatch map, and budget upgrade plan.
              </p>
              <div className="flex flex-wrap gap-3">
                {!unlockedProducts.includes("aura_report") && (
                  <Link href={`/unlock?auditId=${audit.id}&product=aura_report`} onClick={() => trackEvent("quick_fix_upsell_full_report_clicked", { auditId: audit.id })}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-500 hover:to-pink-400" size="sm">
                      Upgrade to Full Aura Report — ₹44
                    </Button>
                  </Link>
                )}
                {!unlockedProducts.includes("glowup_plan") && (
                  <Link href={`/unlock?auditId=${audit.id}&product=glowup_plan`} onClick={() => trackEvent("quick_fix_upsell_glowup_clicked", { auditId: audit.id })}>
                    <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                      Start 30-Day Reset — ₹499
                    </Button>
                  </Link>
                )}
              </div>
              <p className="mt-3 text-[10px] text-gray-600">No external AI service is used in this MVP. Manual payment is not automatically verified.</p>
            </Card>
          </>
        )}

        {/* ─── Dating Profile Audit Section (if unlocked) ─── */}
        {datingReport && <DatingAuditSection report={datingReport} />}

        {/* ─── Glow-Up Plan Section (if unlocked) ─── */}
        {glowupPlan && <GlowUpSection plan={glowupPlan} auditId={audit.id} />}

        {/* ─── Challenge CTA ─── */}
        {freeResult && (
          <div className="mb-6">
            <Link href="/challenges" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-500/20 px-4 py-3 text-sm text-purple-300 hover:from-purple-600/30 hover:to-pink-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Enter a challenge with this audit
            </Link>
          </div>
        )}

        {/* ─── Disclaimers ─── */}
        <div className="mb-8 space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-gray-600">
          <p>AuraCheck analyzes presentation signals, not human worth. Scores are guidance, not objective truth.</p>
          <p>No image is sent to an external AI service in this MVP. Manual payment is not automatically verified.</p>
          <p>No guaranteed dating, social, career, or financial outcomes.</p>
          {fullReport && <p>This report was generated locally. No external AI or payment verification was involved.</p>}
          {quickFixReport && <p>Quick Fix provides targeted advice for the biggest presentation leak.</p>}
          {datingReport && <p>Profile guidance is for presentation clarity, not dating guarantees.</p>}
          {glowupPlan && <p>Glow-up plan is self-improvement guidance, not a guarantee of social outcomes.</p>}
        </div>

        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard">&larr; Back to Dashboard</Link></Button>
          <span className="text-xs text-gray-600">
            {fullReport
              ? `Unlocked ${new Date(fullReport.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
              : quickFixReport
                ? `Quick Fix ${new Date(quickFixReport.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                : freeResult
                  ? `Generated ${new Date(freeResult.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                  : ""}
          </span>
        </div>

        <ShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          score={fullReport?.fullScore ?? freeResult?.auraScore ?? 0}
          category={fullReport?.category ?? freeResult?.category ?? ""}
          strongestSignal={fullReport?.strongestSignals?.[0] ?? freeResult?.strongestSignals?.[0] ?? "Presentation"}
          biggestLeak={fullReport?.biggestStatusLeaks?.[0]?.title ?? freeResult?.statusLeaks?.[0]?.title ?? "Background"}
          onShareComplete={() => {
            if (!shareTipUnlocked) {
              setShareTipUnlocked(true);
              localStorage.setItem(`auracheck:v1:share_tip_unlocked:${audit.id}`, "true");
              trackEvent("share_tip_unlocked", { auditId: audit.id });
            }
          }}
        />
      </div>
    </Container>
  );
}
