"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAuditById, updateAudit } from "@/lib/storage/auditStore";

import { generateFreeAuraReport, generateFreeReportWithPersonalization } from "@/lib/aura-engine/generateFreeAuraReport";
import { RecommendationSection } from "@/components/products/RecommendationSection";
import { generateShareCardPng } from "@/lib/export/generateShareCard";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { isMissionComplete, markMissionComplete, isChecklistComplete, markChecklistComplete } from "@/lib/storage/habitStore";
import type { FreeAuraResult, FullAuraReport, ProductType } from "@/types";
import type { PersonalizationResult } from "@/types/personalization";
import type { ProfileAuditResult } from "@/types/profileAudit";
import type { GlowUpPlan } from "@/types/glowup";
import type { QuickAuraFixReport } from "@/types/quickFix";
import { generateGoalStrategy, generateGoalStrategyTitle } from "@/lib/aura-engine/goalStrategy";
import { AUDIT_TYPE_LABELS, GOAL_LABELS, BUDGET_LABELS } from "@/lib/audit/auditUtils";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "warning" | "success" | "premium" }> = {
  draft: { label: "Draft", variant: "default" },
  free_generated: { label: "Free Score Generated", variant: "success" },
  full_report: { label: "Full Report", variant: "premium" },
};

const PRODUCT_CTA: { type: ProductType; name: string; price: number; gradient: string; features: string[]; badge?: string }[] = [
  { type: "quick_fix", name: "Quick Aura Fix", price: 49, gradient: "from-emerald-500 to-teal-500", features: ["Biggest status leak", "Fastest free fix path", "Under ₹500 fix", "Under ₹2,000 fix", "Avoid wasting money"], badge: "Best first unlock" },
  { type: "aura_report", name: "Full Aura Report", price: 99, gradient: "from-purple-600 to-pink-500", features: ["Full visual breakdown", "Detailed status leak analysis", "Budget upgrade roadmap", "Shareable Aura card", "Product recommendations"], badge: "Most popular" },
  { type: "dating_audit", name: "Dating/Profile Audit", price: 299, gradient: "from-rose-500 to-red-500", features: ["Profile Presentation Score", "Bio/prompt/caption feedback", "Red-flag cleanup", "Suggested bio versions", "Photo order strategy"] },
  { type: "glowup_plan", name: "30-Day Glow-Up Plan", price: 499, gradient: "from-amber-500 to-orange-500", features: ["30 daily missions", "4-week structured plan", "Budget roadmap (₹0–₹25K+)", "Photo/grooming/outfit system", "Progress tracker"], badge: "Best value" },
];

function ScoreGauge({ score, size = "lg", animate = true }: { score: number; size?: "sm" | "lg"; animate?: boolean }) {
  const [displayScore, setDisplayScore] = useState(score);
  const [barWidth, setBarWidth] = useState(score);
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return; }
    if (!animate) return;
    const duration = 1200;
    let rafId: number;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      setBarWidth(score * eased);
      if (progress < 1) rafId = requestAnimationFrame(tick);
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
            <h2 className="mt-2 text-lg font-bold text-white">30-Day Glow-Up Plan</h2>
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
        <Badge variant="premium">₹49 Quick Aura Fix</Badge>
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
                <Link href={`/unlock?auditId=${auditId}&product=${product.type}`}>
                  <Button className="w-full" size="sm">Unlock — ₹{product.price}</Button>
                </Link>
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
  const [audit, setAudit] = useState(() => getAuditById(id) || null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (audit?.freeResult && !(audit.unlockedProducts || []).includes("quick_fix")) {
      trackEvent("quick_fix_paywall_viewed", { auditId: audit.id });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!audit) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Audit not found</h1>
          <p className="mb-6 text-sm text-gray-400">This audit does not exist or may have been deleted.</p>
          <Link href="/dashboard"><Button variant="outline">Go to Dashboard</Button></Link>
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
  const unlockedProducts: ProductType[] = (audit.unlockedProducts || []).filter((p): p is ProductType =>
    p === "quick_fix" || p === "aura_report" || p === "dating_audit" || p === "glowup_plan"
  );

  async function handleGenerate() {
    if (!audit) return;
    const currentAudit = audit;
    setGenerating(true);
    setError(null);
    try {
      if (currentAudit.deepInput) {
        const { freeResult, personalization } = await generateFreeReportWithPersonalization(currentAudit);
        const updated = updateAudit(currentAudit.id, {
          reportStatus: "free_generated",
          freeScore: freeResult.auraScore,
          freeSummary: freeResult.oneLineVerdict,
          freeResult,
          personalization,
        });
        if (updated) setAudit(updated);
      } else {
        const freeResult = await generateFreeAuraReport(currentAudit.imageDataUrl, currentAudit.budgetRange);
        const updated = updateAudit(currentAudit.id, {
          reportStatus: "free_generated",
          freeScore: freeResult.auraScore,
          freeSummary: freeResult.oneLineVerdict,
          freeResult,
        });
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
                  generateShareCardPng(
                    fullReport.fullScore, fullReport.category,
                    fullReport.strongestSignals[0] || "Presentation",
                    fullReport.biggestStatusLeaks[0]?.title || "Background",
                  );
                  trackEvent("share_card_downloaded");
                }}>📤 Share Aura Card</Button>
                <Link href="/progress"><Button size="sm" variant="ghost">📊 Compare Progress</Button></Link>
                <Link href="/twin-simulator"><Button size="sm" variant="ghost">🔮 Aura Twin</Button></Link>
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
                  The Full Report shows what to fix. The Glow-Up Plan shows how to fix it — day by day, step by step.
                </p>
                <Link href={`/unlock?auditId=${audit.id}&product=glowup_plan`}>
                  <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                    Unlock 30-Day Glow-Up Plan — ₹499
                  </Button>
                </Link>
              </Card>
            )}
          </>
        ) : freeResult ? (
          <>
            {/* ─── Free Score Results ─── */}
            <Card className="mb-8">
              <div className="mb-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-gray-500">Aura Score</div>
                  <ScoreGauge score={freeResult.auraScore} />
                  <div className="mt-3"><Badge variant="premium">{freeResult.category}</Badge></div>
                </div>
                <div className="space-y-4">
                  <div><div className="text-xs text-gray-500">Verdict</div><p className="mt-1 text-sm text-gray-300">{freeResult.oneLineVerdict}</p></div>
                  <div><div className="text-xs text-gray-500">Strongest Signals</div><div className="mt-1 flex flex-wrap gap-1.5">{freeResult.strongestSignals.map((s) => (<span key={s} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">{s}</span>))}</div></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4">
                <Button size="sm" variant="outline" onClick={() => {
                  generateShareCardPng(
                    freeResult.auraScore, freeResult.category,
                    freeResult.strongestSignals[0] || "Presentation",
                    freeResult.statusLeaks[0]?.title || "Background",
                  );
                  trackEvent("share_card_downloaded");
                }}>📤 Share Aura Card</Button>
                <Link href="/progress"><Button size="sm" variant="ghost">📊 Compare Progress</Button></Link>
                <Link href="/twin-simulator"><Button size="sm" variant="ghost">🔮 Aura Twin</Button></Link>
              </div>
            </Card>

            {/* ─── Free Archetype ─── */}
            {personalization && (
              <Card className="mb-8 border-purple-500/20">
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="premium">Archetype</Badge>
                  <span className="text-sm font-semibold text-white">{personalization.archetype}</span>
                </div>
                <p className="mb-3 text-sm text-gray-300">{personalization.archetypeExplanation}</p>
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="mb-1 text-xs text-purple-400">Best Next Move</div>
                  <p className="text-sm text-gray-300">{personalization.userPriority}</p>
                </div>
                {personalization.signalMismatches.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {personalization.signalMismatches.slice(0, 2).map((m) => (
                      <div key={m.title} className="flex items-start gap-2 text-xs">
                        <svg className={`mt-0.5 h-3 w-3 flex-shrink-0 ${m.severity === "high" ? "text-red-400" : m.severity === "medium" ? "text-amber-400" : "text-blue-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-gray-400">{m.title}: {m.explanation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            <h2 className="mb-4 text-lg font-semibold text-white">Status Leaks</h2>
            <div className="mb-8 space-y-3">
              {freeResult.statusLeaks.map((leak, idx) => {
                if (idx > 1 && !unlockedProducts.includes("aura_report")) {
                  return (
                    <div key={leak.title} className="relative">
                      <div className="pointer-events-none mt-3 opacity-15 blur-sm">
                        <Card className={`border ${severityColors[leak.severity] || severityColors.low}`}>
                          <div className="mb-1 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white">{leak.title}</h3>
                          </div>
                          <p className="mb-2 text-xs text-gray-400">{leak.explanation.slice(0, 60)}...</p>
                        </Card>
                      </div>
                    </div>
                  );
                }
                return (
                  <Card key={leak.title} className={`border ${severityColors[leak.severity] || severityColors.low}`}>
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
              {freeResult.statusLeaks.length > 2 && !unlockedProducts.includes("aura_report") && (
                <div className="flex justify-center py-2">
                  <Link href={`/unlock?auditId=${audit.id}&product=aura_report`} className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs text-purple-300 hover:bg-purple-500/20 transition-colors">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                    Unlock Full Report — See {freeResult.statusLeaks.length - 2} more leaks → ₹99
                  </Link>
                </div>
              )}
            </div>

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

            {/* ─── Recommendations ─── */}
            <RecommendationSection audit={audit} />

            {/* ─── ₹49 Paywall (if Quick Fix not unlocked) ─── */}
            {!unlockedProducts.includes("quick_fix") && (
              <Card className="mb-8 border-emerald-500/30 ring-1 ring-emerald-500/20">
                <div className="mb-4">
                  <Badge variant="success" className="mb-3">₹49 — Quick Aura Fix</Badge>
                  <h3 className="text-xl font-bold text-white">Your biggest status leak is visible.</h3>
                  <p className="mt-2 text-sm text-gray-400">Unlock the fastest fix path for ₹49 before spending money on the wrong upgrade.</p>
                </div>
                <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center">
                    <div className="text-xs text-gray-500">Your free score shows the problem.</div>
                  </div>
                  <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-3 text-center">
                    <div className="text-xs text-emerald-400">The ₹49 Quick Fix shows the exact first move.</div>
                  </div>
                  <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.03] p-3 text-center">
                    <div className="text-xs text-amber-400">Avoid wasting money on upgrades that will not fix your main leak.</div>
                  </div>
                  <div className="rounded-lg border border-red-500/10 bg-red-500/[0.03] p-3 text-center">
                    <div className="text-xs text-red-400">Fix the right thing first — or nothing else will matter.</div>
                  </div>
                </div>
                <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="text-xs text-gray-500">🔍 Biggest leak detected</div>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="text-xs text-gray-500">⚡ Fastest free fix</div>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="text-xs text-gray-500">💰 Under ₹500 fix</div>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="text-xs text-gray-500">🚫 What not to buy right now</div>
                  </div>
                </div>
                <Link href={`/unlock?auditId=${audit.id}&product=quick_fix`} onClick={() => trackEvent("quick_fix_cta_clicked", { auditId: audit.id })}>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400" size="lg">
                    Unlock Quick Aura Fix — ₹49
                  </Button>
                </Link>
                <p className="mt-3 text-xs text-gray-500 text-center">AuraCheck analyzes presentation signals, not human worth. Scores are guidance, not objective truth.</p>
              </Card>
            )}

            {/* ─── Product CTAs ─── */}
            <ProductCTAButtons auditId={audit.id} unlockedProducts={unlockedProducts} />
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
                The ₹49 Quick Fix tells you the fastest move. The ₹99 Full Aura Report gives the full visual breakdown, archetype, mismatch map, and budget upgrade plan.
              </p>
              <div className="flex flex-wrap gap-3">
                {!unlockedProducts.includes("aura_report") && (
                  <Link href={`/unlock?auditId=${audit.id}&product=aura_report`} onClick={() => trackEvent("quick_fix_upsell_full_report_clicked", { auditId: audit.id })}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-500 hover:to-pink-400" size="sm">
                      Upgrade to Full Aura Report — ₹99
                    </Button>
                  </Link>
                )}
                {!unlockedProducts.includes("glowup_plan") && (
                  <Link href={`/unlock?auditId=${audit.id}&product=glowup_plan`} onClick={() => trackEvent("quick_fix_upsell_glowup_clicked", { auditId: audit.id })}>
                    <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                      Start 30-Day Glow-Up Plan — ₹499
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
          <Link href="/dashboard"><Button variant="ghost" size="sm">&larr; Back to Dashboard</Button></Link>
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
      </div>
    </Container>
  );
}
