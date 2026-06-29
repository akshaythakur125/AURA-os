"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAuditById, updateAudit } from "@/lib/storage/auditStore";
import { generateFreeAuraReport } from "@/lib/aura-engine/generateAuraReport";
import type { Audit, FreeAuraResult } from "@/types/audit";

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

export default function AuditDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [audit, rawSetAudit] = useState<Audit | null | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return getAuditById(id) ?? null;
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreeAuraResult | null>(null);

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

      const updated = updateAudit(audit.id, {
        freeScore: report.auraScore,
        freeSummary: report.oneLineVerdict,
        reportStatus: "free_generated",
        unlockStatus: "locked",
        fullReport: {
          id: audit.id + "-report",
          auditId: audit.id,
          score: {
            overall: report.auraScore,
            categories: {
              visual: report.imageMetrics.lightingScore,
              presentation: report.imageMetrics.clarityScore,
              signals: Math.round(
                (report.imageMetrics.contrast + report.imageMetrics.saturation) /
                  2
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

          {/* Results */}
          {displayResult && (
            <>
              {/* Aura Score Hero */}
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

              {/* Strongest Signals */}
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

              {/* Status Leaks */}
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

              {/* Quick Fixes */}
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

              {/* Budget Upgrade Plan */}
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

              {/* Image Signal Metrics Summary */}
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

              {/* Locked Premium Teaser */}
              <Card className="mb-6 border-purple-500/20 text-center">
                <Badge variant="premium" className="mb-3">
                  Premium
                </Badge>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Unlock the Full Aura Report
                </h3>
                <p className="mb-6 text-sm text-gray-400">
                  Get a detailed visual breakdown, goal-specific profile
                  strategy, personalized shopping plan, and a shareable Aura
                  card.
                </p>
                <div className="mx-auto mb-6 grid max-w-sm gap-3 text-left">
                  {[
                    "Full visual breakdown across 12+ dimensions",
                    "Detailed status leaks with personalized fixes",
                    "Goal-specific profile strategy",
                    "Shopping & action plan within your budget",
                    "Shareable Aura card for your profile",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-xs text-gray-400">
                      <svg
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m0 0v2m0-2h2m-2 0H10"
                        />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
                <Link href={`/unlock?auditId=${audit.id}&product=aura_report`}>
                  <Button variant="primary" className="w-full sm:w-auto">
                    Unlock Full Aura Report — &#8377;99
                  </Button>
                </Link>
              </Card>

              {/* Disclaimers */}
              <div className="space-y-2 text-center text-xs text-gray-600">
                <p>
                  AuraCheck analyzes presentation signals using local
                  browser-based rules. This is guidance, not objective truth.
                </p>
                <p>
                  No image is sent to an external AI service in this MVP.
                </p>
              </div>
            </>
          )}

          {!canGenerate && !displayResult && (
            <div className="flex flex-wrap gap-3">
              <Link href="/unlock">
                <Button variant="outline">Unlock Premium Report</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
