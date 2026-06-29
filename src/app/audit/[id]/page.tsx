"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { getAuditById, updateAudit, deleteAudit, createAudit } from "@/lib/storage/auditStore";
import { generateFreeAuraReport } from "@/lib/aura-engine/generateAuraReport";
import { generateStatusArchetype } from "@/lib/aura-engine/archetypes";
import { ShareCardBuilder } from "@/components/share/ShareCardBuilder";
import { RecommendationSection } from "@/components/products/RecommendationSection";
import type { Audit, FreeAuraResult, FullAuraReportContent } from "@/types/audit";
import type { PersonalizationResult, SignalMismatch, GoalStrategy } from "@/types/personalization";

const auditTypeLabels: Record<string, string> = {
  photo: "Photo Aura Check",
  instagram: "Instagram Profile Audit",
  dating: "Dating Profile Audit",
  outfit: "Outfit Audit",
  room: "Room / Background Audit",
};

const statusBadge: Record<string, "default" | "success" | "warning" | "danger" | "premium"> = {
  draft: "default",
  free_generated: "success",
  locked: "warning",
  unlocked: "premium",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ArchetypeCard({ personalization }: { personalization: PersonalizationResult }) {
  const colorMap: Record<string, string> = {
    "Clean Basic": "border-slate-500/30 bg-slate-500/10",
    "Urban Aspirational": "border-purple-500/30 bg-purple-500/10",
    "Premium Minimalist": "border-emerald-500/30 bg-emerald-500/10",
    "Loud Flex": "border-rose-500/30 bg-rose-500/10",
    "Soft Luxury": "border-amber-500/30 bg-amber-500/10",
    "Creator Vibe": "border-cyan-500/30 bg-cyan-500/10",
    "College Casual": "border-blue-500/30 bg-blue-500/10",
    "Corporate Sharp": "border-indigo-500/30 bg-indigo-500/10",
    "Try-Hard Signal": "border-orange-500/30 bg-orange-500/10",
    "Mismatched Flex": "border-red-500/30 bg-red-500/10",
    "Low-Clarity Potential": "border-gray-500/30 bg-gray-500/10",
  };
  const colors = colorMap[personalization.archetype] || colorMap["Clean Basic"];
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Your Status Archetype</h3>
      <div className={`mb-4 rounded-xl border p-4 ${colors}`}>
        <div className="text-lg font-bold text-white">{personalization.archetype}</div>
        <p className="mt-2 text-xs text-gray-300">{personalization.archetypeExplanation}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <div className="text-xs text-purple-400">Priority</div>
          <p className="mt-1 text-xs text-gray-300">{personalization.userPriority}</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <div className="text-xs text-purple-400">Focus Areas</div>
          <p className="mt-1 text-xs text-gray-300">{personalization.recommendedFocus}</p>
        </div>
      </div>
    </Card>
  );
}

function SignalMismatchCard({ mismatches }: { mismatches: SignalMismatch[] }) {
  if (mismatches.length === 0) return null;
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Signal Mismatches</h3>
      <div className="space-y-4">
        {mismatches.map((m) => (
          <div key={m.title} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-white">{m.title}</h4>
              <Badge variant={m.severity === "high" ? "danger" : m.severity === "medium" ? "warning" : "default"}>
                {m.severity}
              </Badge>
            </div>
            <p className="mb-2 text-xs text-gray-400">{m.explanation}</p>
            <p className="text-xs text-gray-500">
              <span className="text-purple-300">Correction:</span> {m.correction}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GoalStrategyCard({ strategy }: { strategy: GoalStrategy }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Goal Strategy</h3>
      <div className="space-y-4">
        <div>
          <div className="mb-1 text-xs text-purple-400">{strategy.goal}</div>
          <div className="text-xs text-gray-500">Strategy</div>
          <p className="text-sm text-gray-300">{strategy.strategyTitle}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="mb-1 text-xs text-emerald-400">Optimize</div>
            <p className="text-xs text-gray-300">{strategy.whatToOptimize}</p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="mb-1 text-xs text-red-400">Avoid</div>
            <p className="text-xs text-gray-300">{strategy.whatToAvoid}</p>
          </div>
        </div>
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
          <div className="mb-1 text-xs text-purple-400">Best Next Move</div>
          <p className="text-xs text-gray-300">{strategy.bestNextMove}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="mb-1 text-xs text-gray-500">Photo Direction</div>
            <p className="text-xs text-gray-300">{strategy.suggestedPhotoDirection}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="mb-1 text-xs text-gray-500">Style Direction</div>
            <p className="text-xs text-gray-300">{strategy.suggestedStyleDirection}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function AuditDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [audit, rawSetAudit] = useState<Audit | null | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return getAuditById(id) ?? null;
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreeAuraResult | null>(null);
  const [fullContent] = useState<FullAuraReportContent | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  function handlePrint() {
    window.print();
  }

  function setAudit(a: Audit | null) {
    rawSetAudit(a);
  }

  async function handleGenerate() {
    if (!audit || !audit.imageDataUrl) return;
    setGenerating(true);
    setError(null);

    try {
      const report = await generateFreeAuraReport(audit);
      setResult(report);

      const personalization = generateStatusArchetype(audit, report.imageMetrics);

      const updated = updateAudit(audit.id, {
        freeScore: report.auraScore,
        freeSummary: report.oneLineVerdict,
        reportStatus: "free_generated",
        unlockStatus: "locked",
        personalization,
        fullReport: {
          id: audit.id + "-report",
          auditId: audit.id,
          score: {
            overall: report.auraScore,
            categories: {
              visual: report.imageMetrics.lightingScore,
              presentation: report.imageMetrics.clarityScore,
              signals: Math.round(
                (report.imageMetrics.contrast + report.imageMetrics.saturation) / 2
              ),
              cohesion: report.imageMetrics.compositionScore,
            },
          },
          leaks: report.statusLeaks,
          suggestions: report.quickFixes.map((q) => ({
            id: "qf-" + q.title.toLowerCase().replace(/\s+/g, "-"),
            category: "quick-fix",
            title: q.title,
            description: q.description,
            effort: q.effort,
            cost: q.cost,
          })),
          summary: report.oneLineVerdict,
          createdAt: report.generatedAt,
          isPremium: false,
          freeResult: report,
        },
      });

      if (updated) setAudit(updated);
    } catch {
      setError("Something went wrong during analysis. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = audit?.reportStatus === "draft" && audit?.imageDataUrl;
  const hasResult = audit?.reportStatus === "free_generated" && audit?.fullReport?.freeResult;
  const displayResult = result || (hasResult ? (audit!.fullReport!.freeResult as FreeAuraResult) : null);
  const isUnlocked = audit?.reportStatus === "unlocked" && audit?.fullReport?.fullContent;
  const displayFull = fullContent || (isUnlocked ? (audit!.fullReport!.fullContent as FullAuraReportContent) : null);
  const personalization = audit?.personalization;

  return (
    <Container className="py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-300"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {audit === undefined && (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mb-2 text-lg text-gray-300">Loading...</p>
        </Card>
      )}

      {audit === null && (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mb-2 text-lg text-gray-300">Audit not found</p>
          <p className="mb-6 text-sm text-gray-500">
            This audit does not exist or may have been deleted.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
            <Link href="/audit/new">
              <Button>Start New Audit</Button>
            </Link>
          </div>
        </Card>
      )}

      {audit && !audit.imageDataUrl && audit.reportStatus === "draft" && (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mb-2 text-lg text-gray-300">No image to analyze</p>
          <p className="mb-6 text-sm text-gray-500">
            This audit has no image. Please create a new audit with an image.
          </p>
          <Link href="/audit/new">
            <Button>Create New Audit</Button>
          </Link>
        </Card>
      )}

      {audit && (audit.imageDataUrl || audit.reportStatus !== "draft") && (
        <div className="mx-auto max-w-2xl">
          <Card className="mb-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white">
                  {auditTypeLabels[audit.auditType] || audit.auditType}
                </h1>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>Created: {formatDate(audit.createdAt)}</span>
                  <span>Updated: {formatDate(audit.updatedAt)}</span>
                </div>
              </div>
              <Badge variant={statusBadge[audit.reportStatus] || "default"}>
                {audit.reportStatus.replace("_", " ")}
              </Badge>
            </div>

            {audit.imageDataUrl && (
              <div className="mb-6 overflow-hidden rounded-xl border border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={audit.imageDataUrl}
                  alt="Audit image"
                  className="max-h-[400px] w-full object-contain"
                />
              </div>
            )}

            {audit.imageMeta && (
              <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-gray-500">Width</div>
                  <div className="text-sm text-white">{audit.imageMeta.width || "—"} px</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Height</div>
                  <div className="text-sm text-white">{audit.imageMeta.height || "—"} px</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Original Size</div>
                  <div className="text-sm text-white">{formatBytes(audit.imageMeta.fileSize)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Compressed</div>
                  <div className="text-sm text-white">
                    {audit.imageMeta.compressedSize ? formatBytes(audit.imageMeta.compressedSize) : "—"}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="text-xs text-gray-500">Goal</div>
                <div className="mt-1 text-sm font-medium capitalize text-white">{audit.goal}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="text-xs text-gray-500">Budget Range</div>
                <div className="mt-1 text-sm font-medium text-amber-400">
                  &#8377;{audit.budgetRange.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="text-xs text-gray-500">Unlock Status</div>
                <div className="mt-1 text-sm font-medium capitalize text-white">{audit.unlockStatus}</div>
              </div>
            </div>
          </Card>

          {/* Score generation area */}
          {canGenerate && (
            <div className="mb-6 text-center">
              <Button size="lg" onClick={handleGenerate} disabled={generating}>
                {generating ? "Analyzing your image..." : "Generate Free Aura Score"}
              </Button>
              {generating && (
                <p className="mt-3 text-xs text-gray-500">
                  Analyzing image signals using browser-based rules...
                </p>
              )}
              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            </div>
          )}

          {/* Personalization sections for any generated result */}
          {personalization && (displayResult || displayFull) && (
            <div className="mb-6 space-y-6">
              <ArchetypeCard personalization={personalization} />
              <SignalMismatchCard mismatches={personalization.signalMismatches} />
              <GoalStrategyCard strategy={personalization.goalStrategy} />
            </div>
          )}

          {/* Full Paid Report */}
          {displayFull && (
            <>
              <Card className="relative mb-6 overflow-hidden text-center">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />
                <Badge variant="premium" className="mb-2">Premium Report</Badge>
                <Badge variant="success" className="mb-4">{displayFull.category}</Badge>
                <div className="text-6xl font-bold text-white">{displayFull.fullScore}</div>
                <div className="mt-1 text-sm text-gray-500">/ 100</div>
                <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000" style={{ width: `${displayFull.fullScore}%` }} />
                </div>
                <p className="mx-auto mt-4 max-w-md text-sm text-gray-300">{displayFull.detailedVerdict}</p>
              </Card>

              {/* Visual Breakdown */}
              <Card className="mb-6">
                <h3 className="mb-4 text-sm font-semibold text-white">Visual Breakdown</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Lighting", value: displayFull.visualBreakdown.lighting },
                    { label: "Clarity", value: displayFull.visualBreakdown.clarity },
                    { label: "Composition", value: displayFull.visualBreakdown.composition },
                    { label: "Background Control", value: displayFull.visualBreakdown.backgroundControl },
                    { label: "Color Signal", value: displayFull.visualBreakdown.colorSignal },
                    { label: "Premium Signal", value: displayFull.visualBreakdown.premiumSignal },
                    { label: "Overall Consistency", value: displayFull.visualBreakdown.overallConsistency, span: true },
                  ].map((m) => (
                    <div key={m.label} className={`rounded-lg border border-white/5 bg-white/[0.03] p-3 ${m.span ? "col-span-2 sm:col-span-4" : ""}`}>
                      <div className="text-xs text-gray-500">{m.label}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500" style={{ width: `${m.value}%` }} />
                        </div>
                        <span className="text-xs text-white">{m.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Strongest Signals */}
              <Card className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-white">Strongest Signals</h3>
                <div className="flex flex-wrap gap-2">
                  {displayFull.strongestSignals.map((s) => (
                    <Badge key={s} variant="success">{s}</Badge>
                  ))}
                </div>
              </Card>

              {/* Biggest Status Leaks */}
              <Card className="mb-6">
                <h3 className="mb-4 text-sm font-semibold text-white">Biggest Status Leaks</h3>
                <div className="space-y-4">
                  {displayFull.biggestStatusLeaks.map((leak) => (
                    <div key={leak.title} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-white">{leak.title}</h4>
                        <Badge variant={leak.severity === "high" ? "danger" : leak.severity === "medium" ? "warning" : "default"}>
                          {leak.severity}
                        </Badge>
                      </div>
                      <p className="mb-2 text-xs text-gray-400">{leak.explanation}</p>
                      <p className="text-xs text-gray-500">
                        <span className="text-purple-300">Fix:</span> {leak.fix}
                      </p>
                      {leak.estimatedCost && (
                        <p className="mt-1 text-xs text-gray-500">
                          <span className="text-purple-300">Estimated cost:</span> {leak.estimatedCost}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Priority Upgrade Map */}
              <Card className="mb-6">
                <h3 className="mb-4 text-sm font-semibold text-white">Priority Upgrade Map</h3>
                <div className="space-y-3">
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="text-xs text-emerald-400">First Priority</div>
                    <div className="text-sm text-white">{displayFull.priorityUpgradeMap.firstPriority}</div>
                  </div>
                  <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                    <div className="text-xs text-purple-400">Second Priority</div>
                    <div className="text-sm text-white">{displayFull.priorityUpgradeMap.secondPriority}</div>
                  </div>
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <div className="text-xs text-red-400">Avoid For Now</div>
                    <div className="text-sm text-white">{displayFull.priorityUpgradeMap.avoidForNow}</div>
                  </div>
                </div>
              </Card>

              {/* Budget Upgrade Plan */}
              <Card className="mb-6">
                <h3 className="mb-4 text-sm font-semibold text-white">Budget Upgrade Plan</h3>
                {[
                  { label: "Free — Do Now", items: displayFull.budgetUpgradePlan.immediateFree, color: "emerald" },
                  { label: "Under ₹2,000", items: displayFull.budgetUpgradePlan.under2000, color: "purple" },
                  { label: "Under ₹5,000", items: displayFull.budgetUpgradePlan.under5000, color: "amber" },
                  { label: "Under ₹10,000", items: displayFull.budgetUpgradePlan.under10000, color: "blue" },
                  { label: "Under ₹25,000+", items: displayFull.budgetUpgradePlan.under25000, color: "pink" },
                ].map((tier) => (
                  <details key={tier.label} className="group mb-2">
                    <summary className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white hover:bg-white/[0.05]">
                      <svg className={`h-4 w-4 text-${tier.color}-400 transition-transform group-open:rotate-90`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {tier.label}
                    </summary>
                    <ul className="mt-2 space-y-1.5 px-4">
                      {tier.items.map((action: string) => (
                        <li key={action} className="flex items-start gap-2 text-xs text-gray-400">
                          <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-${tier.color}-400`} />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </Card>

              {/* Photo Guidance */}
              <Card className="mb-6">
                <h3 className="mb-4 text-sm font-semibold text-white">Photo Guidance</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Lighting", value: displayFull.photoGuidance.lighting },
                    { label: "Framing", value: displayFull.photoGuidance.framing },
                    { label: "Background", value: displayFull.photoGuidance.background },
                    { label: "Posing / Presentation", value: displayFull.photoGuidance.posingOrPresentation },
                    { label: "Editing", value: displayFull.photoGuidance.editing, span: true },
                  ].map((g) => (
                    <div key={g.label} className={`rounded-lg border border-white/5 bg-white/[0.03] p-3 ${g.span ? "sm:col-span-2" : ""}`}>
                      <div className="mb-1 text-xs text-purple-400">{g.label}</div>
                      <p className="text-xs text-gray-300">{g.value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Goal-Specific Advice */}
              <Card className="mb-6">
                <h3 className="mb-4 text-sm font-semibold text-white">Goal-Specific Strategy</h3>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 text-xs text-purple-400">{displayFull.goalSpecificAdvice.goal}</div>
                    <div className="text-xs text-gray-500">Strategy</div>
                    <p className="text-sm text-gray-300">{displayFull.goalSpecificAdvice.strategy}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <div className="mb-1 text-xs text-emerald-400">Do This</div>
                      <p className="text-xs text-gray-300">{displayFull.goalSpecificAdvice.doThis}</p>
                    </div>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                      <div className="mb-1 text-xs text-red-400">Avoid This</div>
                      <p className="text-xs text-gray-300">{displayFull.goalSpecificAdvice.avoidThis}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Final Verdict */}
              <Card className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-white">Final Verdict</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{displayFull.finalVerdict}</p>
              </Card>

              {/* Print / PDF */}
              <div className="mb-6 flex flex-wrap gap-3">
                <Button variant="secondary" size="sm" onClick={handlePrint}>
                  Print Report
                </Button>
                <span className="text-xs text-gray-500 self-center">
                  Save as PDF from the print dialog (browser print-to-PDF).
                </span>
              </div>

              {/* Share section */}
              <div className="mb-6">
                <ShareCardBuilder audit={audit!} type="full_report" />
              </div>

              {/* Premium recommendations */}
              <div className="mb-6">
                <RecommendationSection audit={audit!} isPremium />
              </div>

              {/* Disclaimers */}
              <div className="space-y-2 text-center text-xs text-gray-600">
                <p>AuraCheck analyzes presentation signals, not human worth.</p>
                <p>Scores are guidance, not objective truth.</p>
                <p>Archetypes describe presentation style, not your identity or worth.</p>
                <p>No external AI service is used in this MVP.</p>
              </div>
            </>
          )}

          {/* Free Result + Locked Teaser */}
          {!displayFull && displayResult && (
            <>
              <Card className="relative mb-6 overflow-hidden text-center">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />
                <Badge variant="premium" className="mb-4">
                  {displayResult.category}
                </Badge>
                <div className="text-6xl font-bold text-white">
                  {displayResult.auraScore}
                </div>
                <div className="mt-1 text-sm text-gray-500">/ 100</div>
                <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000"
                    style={{ width: `${displayResult.auraScore}%` }}
                  />
                </div>
                <p className="mx-auto mt-4 max-w-md text-sm text-gray-300">
                  {displayResult.oneLineVerdict}
                </p>
              </Card>

              <Card className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Strongest Signals
                </h3>
                <div className="flex flex-wrap gap-2">
                  {displayResult.strongestSignals.map((s) => (
                    <Badge key={s} variant="success">
                      {s}
                    </Badge>
                  ))}
                </div>
              </Card>

              <Card className="mb-6">
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Biggest Status Leaks
                </h3>
                <div className="space-y-4">
                  {displayResult.statusLeaks.map((leak) => (
                    <div key={leak.id} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-white">
                          {leak.title}
                        </h4>
                        <Badge
                          variant={
                            leak.severity === "high"
                              ? "danger"
                              : leak.severity === "medium"
                                ? "warning"
                                : "default"
                          }
                        >
                          {leak.severity}
                        </Badge>
                      </div>
                      <p className="mb-2 text-xs text-gray-400">
                        {leak.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="text-purple-300">Fix:</span>{" "}
                        {leak.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="mb-6">
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Quick Fixes
                </h3>
                <div className="space-y-3">
                  {displayResult.quickFixes.map((fix) => (
                    <div key={fix.title} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400">
                        &#10003;
                      </div>
                      <div>
                        <p className="text-sm text-white">{fix.title}</p>
                        <p className="text-xs text-gray-500">
                          {fix.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="mb-6">
                <h3 className="mb-1 text-sm font-semibold text-white">
                  Budget Upgrade Plan
                </h3>
                <p className="mb-4 text-xs text-gray-500">
                  {displayResult.budgetUpgradePlan.priority}
                </p>
                <ul className="space-y-2">
                  {displayResult.budgetUpgradePlan.actions.map((action) => (
                    <li key={action} className="flex items-start gap-3 text-xs text-gray-300">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                      {action}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-lg bg-white/[0.03] p-3 text-xs text-gray-500">
                  Estimated impact: {displayResult.budgetUpgradePlan.estimatedImpact}
                </p>
              </Card>

              <Card className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Image Signal Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Lighting", value: displayResult.imageMetrics.lightingScore },
                    { label: "Clarity", value: displayResult.imageMetrics.clarityScore },
                    { label: "Composition", value: displayResult.imageMetrics.compositionScore },
                    { label: "Contrast", value: displayResult.imageMetrics.contrast },
                    { label: "Saturation", value: displayResult.imageMetrics.saturation },
                    { label: "Resolution", value: displayResult.imageMetrics.resolutionScore },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                      <div className="text-xs text-gray-500">{m.label}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
                            style={{ width: `${m.value}%` }}
                          />
                        </div>
                        <span className="text-xs text-white">{m.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* ─── Challenge CTA ─── */}
              <Card className="mb-6">
                <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-lg font-bold text-white">!</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">Compete in a Challenge</h4>
                    <p className="text-xs text-gray-400">Submit this audit to a challenge and see how you rank on the local leaderboard.</p>
                  </div>
                  <Link href="/challenges"><Button size="sm" variant="outline">View Challenges</Button></Link>
                </div>
              </Card>

              {/* ─── Multi-Product Unlock CTAs ─── */}
              <h3 className="mb-3 text-sm font-semibold text-white">Upgrade Options</h3>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                {[
                  { type: "aura_report" as const, name: "Full Aura Report", price: 99, desc: "Full visual breakdown, goal strategy, upgrade path", feature: "View full report" },
                  { type: "dating_audit" as const, name: "Dating / Profile Audit", price: 299, desc: "Bio analysis, red-flag detection, suggested bios", feature: "View dating audit" },
                  { type: "glowup_plan" as const, name: "30-Day Glow-Up Plan", price: 499, desc: "4-week roadmap, daily missions, budget plan", feature: "View glow-up plan" },
                ].map((p) => {
                  const unlocked = audit.unlockedProducts?.includes(p.type);
                  const hasReport = p.type === "dating_audit" ? audit.datingProfileReport : p.type === "glowup_plan" ? audit.glowupPlan : audit.fullReport?.fullContent;
                  return (
                    <Card key={p.type} className={`relative text-center ${unlocked ? "border-emerald-500/20" : "border-purple-500/20"}`}>
                      {unlocked ? (
                        <Badge variant="success" className="mb-2">Unlocked</Badge>
                      ) : (
                        <Badge variant="premium" className="mb-2">&#8377;{p.price}</Badge>
                      )}
                      <h4 className="mb-1 text-sm font-semibold text-white">{p.name}</h4>
                      <p className="mb-4 text-xs text-gray-400">{p.desc}</p>
                      {unlocked && hasReport ? (
                        <span className="text-xs text-emerald-400">{p.feature} available below</span>
                      ) : unlocked ? (
                        <span className="text-xs text-emerald-400">Unlocked</span>
                      ) : (
                        <Link href={`/unlock?auditId=${audit.id}&product=${p.type}`} className="block">
                          <Button size="sm" className="w-full">Unlock — &#8377;{p.price}</Button>
                        </Link>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* ─── Dating Profile Report Display ─── */}
              {audit.datingProfileReport && (
                <Card className="mb-6">
                  <Badge variant="success" className="mb-2">Dating / Profile Audit</Badge>
                  <h3 className="mb-4 text-sm font-semibold text-white">Profile Text Analysis</h3>
                  <div className="mb-4 text-center">
                    <div className="text-4xl font-bold text-white">{audit.datingProfileReport.textScore}</div>
                    <div className="text-xs text-gray-500">Text Score / 100</div>
                  </div>
                  <div className="mb-4 rounded-lg border border-white/5 bg-white/[0.03] p-4">
                    <p className="text-xs text-gray-300">{audit.datingProfileReport.overallAdvice}</p>
                  </div>
                  {audit.datingProfileReport.bioAnalysis && (
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                        <div className="text-xs text-gray-500">Bio Length</div>
                        <div className="text-sm text-white capitalize">{audit.datingProfileReport.bioAnalysis.length.replace(/_/g, " ")}</div>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                        <div className="text-xs text-gray-500">Effort</div>
                        <div className="text-sm text-white capitalize">{audit.datingProfileReport.bioAnalysis.effort}</div>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 sm:col-span-2">
                        <div className="text-xs text-purple-400">Feedback</div>
                        <p className="mt-1 text-xs text-gray-300">{audit.datingProfileReport.bioAnalysis.feedback}</p>
                      </div>
                    </div>
                  )}
                  {audit.datingProfileReport.redFlags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="mb-2 text-xs font-semibold text-white">Detected Issues</h4>
                      <div className="space-y-2">
                        {audit.datingProfileReport.redFlags.map((rf, i) => (
                          <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant={rf.severity === "high" ? "danger" : rf.severity === "medium" ? "warning" : "default"}>{rf.type}</Badge>
                            </div>
                            <p className="text-xs text-gray-300">{rf.explanation}</p>
                            <p className="mt-1 text-xs text-gray-500"><span className="text-purple-300">Fix:</span> {rf.fixSuggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {audit.datingProfileReport.suggestedBios.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-white">Suggested Bio Versions</h4>
                      <div className="space-y-3">
                        {audit.datingProfileReport.suggestedBios.map((sb, i) => (
                          <div key={i} className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                            <div className="mb-1 text-xs text-purple-300">{sb.version}</div>
                            <p className="mb-1 text-xs text-gray-200">{sb.text}</p>
                            <p className="text-[10px] text-gray-500">{sb.whyItWorks}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* ─── Glow-Up Plan Display ─── */}
              {audit.glowupPlan && (
                <Card className="mb-6">
                  <Badge variant="success" className="mb-2">30-Day Glow-Up Plan</Badge>
                  <h3 className="mb-4 text-sm font-semibold text-white">Your 4-Week Roadmap</h3>
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    {[audit.glowupPlan.week1, audit.glowupPlan.week2, audit.glowupPlan.week3, audit.glowupPlan.week4].map((week, wi) => (
                      <details key={wi} className="group rounded-lg border border-white/5 bg-white/[0.03]">
                        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-white hover:bg-white/[0.05]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">W{wi + 1}</span>
                          {week.title}
                        </summary>
                        <div className="px-4 pb-3">
                          <p className="mb-2 text-xs text-purple-300">{week.focus}</p>
                          <div className="space-y-1">
                            {week.dailyMissions.map((m) => (
                              <div key={m.day} className="flex items-start gap-2 text-xs">
                                <span className="shrink-0 text-gray-500">D{m.day}</span>
                                <span className="text-gray-300">{m.title}</span>
                                <Badge variant={m.effort === "hard" ? "danger" : m.effort === "medium" ? "warning" : "default"}>{m.effort}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
                    <h4 className="mb-2 text-xs font-semibold text-white">Budget Roadmap</h4>
                    <div className="space-y-2 text-xs">
                      {audit.glowupPlan.budgetRoadmap.free.length > 0 && (
                        <div>
                          <div className="text-emerald-400">Free Actions</div>
                          <ul className="ml-3 list-disc text-gray-400">{audit.glowupPlan.budgetRoadmap.free.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      {audit.glowupPlan.budgetRoadmap.under2000.length > 0 && (
                        <div>
                          <div className="text-amber-400">Under ₹2,000</div>
                          <ul className="ml-3 list-disc text-gray-400">{audit.glowupPlan.budgetRoadmap.under2000.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      {audit.glowupPlan.budgetRoadmap.under5000.length > 0 && (
                        <div>
                          <div className="text-purple-400">Under ₹5,000</div>
                          <ul className="ml-3 list-disc text-gray-400">{audit.glowupPlan.budgetRoadmap.under5000.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      {audit.glowupPlan.budgetRoadmap.under10000.length > 0 && (
                        <div>
                          <div className="text-blue-400">Under ₹10,000</div>
                          <ul className="ml-3 list-disc text-gray-400">{audit.glowupPlan.budgetRoadmap.under10000.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      <div className="mt-2 border-t border-white/5 pt-2">
                        <span className="text-gray-500">Estimated total: </span>
                        <span className="text-amber-400">₹{audit.glowupPlan.budgetRoadmap.totalEstimatedCost}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Share section for free result */}
              <div className="mb-6">
                <ShareCardBuilder audit={audit!} type="free_result" />
              </div>

              {/* Recommendations for free result */}
              <div className="mb-6">
                <RecommendationSection audit={audit!} />
              </div>

              <div className="space-y-2 text-center text-xs text-gray-600">
                <p>
                  AuraCheck analyzes presentation signals using local
                  browser-based rules. This is guidance, not objective truth.
                </p>
                <p>Archetypes describe presentation style, not your identity or worth.</p>
                <p>
                  No image is sent to an external AI service in this MVP.
                </p>
              </div>
            </>
          )}

          {!canGenerate && !displayResult && !displayFull && (
            <div className="flex flex-wrap gap-3">
              <Link href="/unlock">
                <Button variant="outline">Unlock Premium Report</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          )}

          {/* Report Management */}
          <Card className="mt-10 border-white/5">
            <h3 className="mb-4 text-sm font-semibold text-white">Report Management</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const draft = createAudit({ auditType: audit.auditType, goal: audit.goal, budgetRange: audit.budgetRange });
                  if (audit.deepInput) updateAudit(draft.id, { deepInput: audit.deepInput });
                  if (audit.profileTexts) updateAudit(draft.id, { profileTexts: audit.profileTexts });
                  router.push(`/audit/${draft.id}`);
                }}
              >
                Duplicate Settings
              </Button>
              {audit.imageDataUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirmAction("remove_image");
                  }}
                >
                  Remove Image Only
                </Button>
              )}
              {audit.reportStatus !== "draft" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirmAction("regenerate_free");
                  }}
                >
                  Regenerate Free Score
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setConfirmAction("delete_audit");
                }}
              >
                Delete This Audit
              </Button>
            </div>
            <p className="mt-3 text-[10px] text-gray-600">
              Removing the image keeps metadata and scores. Deleting the audit removes all associated data including unlocked products.
            </p>
          </Card>

          {/* Confirm Dialogs */}
          <ConfirmDialog
            open={confirmAction === "delete_audit"}
            title="Delete this audit?"
            message="This will permanently remove this audit and all associated data including unlocked products. This cannot be undone."
            confirmLabel="DELETE"
            variant="danger"
            requireTypedConfirm="DELETE"
            onConfirm={() => {
              deleteAudit(audit.id);
              toast("Audit deleted", "success");
              router.push("/dashboard");
            }}
            onCancel={() => setConfirmAction(null)}
          />
          <ConfirmDialog
            open={confirmAction === "remove_image"}
            title="Remove uploaded image?"
            message="This will remove the uploaded image data. Metadata, scores, and reports will be kept. Future regeneration may not work without an image."
            confirmLabel="Remove Image"
            variant="warning"
            onConfirm={() => {
              const updated = updateAudit(audit.id, {
                imageDataUrl: undefined,
              });
              if (updated) setAudit(updated);
              toast("Image removed", "success");
              setConfirmAction(null);
            }}
            onCancel={() => setConfirmAction(null)}
          />
          <ConfirmDialog
            open={confirmAction === "regenerate_free"}
            title="Regenerate free score?"
            message="This will overwrite the existing free score and personalization data. Your unlocked premium reports will not be affected."
            confirmLabel="Regenerate"
            variant="warning"
            onConfirm={async () => {
              setConfirmAction(null);
              if (!audit.imageDataUrl) {
                toast("No image to analyze", "error");
                return;
              }
              setGenerating(true);
              try {
                const report = await generateFreeAuraReport(audit);
                const personalization = generateStatusArchetype(audit, report.imageMetrics);
                const updated = updateAudit(audit.id, {
                  freeScore: report.auraScore,
                  freeSummary: report.oneLineVerdict,
                  reportStatus: "free_generated",
                  unlockStatus: "locked",
                  personalization,
                  fullReport: {
                    id: audit.id + "-report",
                    auditId: audit.id,
                    score: { overall: report.auraScore, categories: { visual: report.imageMetrics.lightingScore, presentation: report.imageMetrics.clarityScore, signals: Math.round((report.imageMetrics.contrast + report.imageMetrics.saturation) / 2), cohesion: report.imageMetrics.compositionScore } },
                    leaks: report.statusLeaks,
                    suggestions: report.quickFixes.map((q) => ({ id: "qf-" + q.title.toLowerCase().replace(/\s+/g, "-"), category: "quick-fix" as const, title: q.title, description: q.description, effort: q.effort, cost: q.cost })),
                    summary: report.oneLineVerdict,
                    createdAt: report.generatedAt,
                    isPremium: false,
                    freeResult: report,
                  },
                });
                if (updated) setAudit(updated);
                toast("Free score regenerated", "success");
              } catch {
                toast("Failed to regenerate", "error");
              } finally {
                setGenerating(false);
              }
            }}
            onCancel={() => setConfirmAction(null)}
          />
        </div>
      )}
    </Container>
  );
}
