"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAuditById, updateAudit } from "@/lib/storage/auditStore";
import { generateFreeAuraReport } from "@/lib/aura-engine/generateFreeAuraReport";
import type { FreeAuraResult } from "@/types";

const AUDIT_TYPE_LABELS: Record<string, string> = {
  photo: "Photo Aura Check",
  instagram: "Instagram Profile Audit",
  dating: "Dating Profile Audit",
  outfit: "Outfit Audit",
  background: "Room / Background Audit",
};

const GOAL_LABELS: Record<string, string> = {
  dating: "Dating",
  instagram: "Instagram",
  college: "College",
  office: "Office",
  glowup: "General Glow-Up",
};

const BUDGET_LABELS: Record<string, string> = {
  "0": "₹0 — Free only",
  "2000": "₹2,000",
  "5000": "₹5,000",
  "10000": "₹10,000",
  "25000": "₹25,000+",
};

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "warning" | "success" | "premium" }> = {
  draft: { label: "Draft", variant: "default" },
  free_generated: { label: "Free Score Generated", variant: "success" },
  full_report: { label: "Full Report", variant: "premium" },
};

function ScoreGauge({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const dimension = size === "lg" ? "h-3" : "h-2";
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className={`font-bold text-white ${size === "lg" ? "text-5xl" : "text-lg"}`}>{score}</span>
        <span className="text-sm text-gray-500">/ 100</span>
      </div>
      <div className={`mt-2 overflow-hidden rounded-full bg-white/5 ${dimension}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [audit, setAudit] = useState(() => getAuditById(id) || null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!audit) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Audit not found</h1>
          <p className="mb-6 text-sm text-gray-400">
            This audit does not exist or may have been deleted.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const statusInfo = STATUS_BADGE[audit.reportStatus] || STATUS_BADGE.draft;
  const result: FreeAuraResult | undefined = audit.freeResult;

  async function handleGenerate() {
    if (!audit) return;
    const currentAudit = audit;
    setGenerating(true);
    setError(null);
    try {
      const freeResult = await generateFreeAuraReport(currentAudit.imageDataUrl, currentAudit.budgetRange);
      const updated = updateAudit(currentAudit.id, {
        reportStatus: "free_generated",
        freeScore: freeResult.auraScore,
        freeSummary: freeResult.oneLineVerdict,
        freeResult,
      });
      if (updated) setAudit(updated);
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
        {/* ─── Header ─── */}
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
                <div>
                  <div className="text-xs text-gray-500">Audit Type</div>
                  <div className="text-sm text-white">{AUDIT_TYPE_LABELS[audit.auditType] || audit.auditType}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Goal</div>
                  <div className="text-sm text-white">{GOAL_LABELS[audit.goal] || audit.goal}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Budget Range</div>
                  <div className="text-sm text-white">{BUDGET_LABELS[audit.budgetRange] || audit.budgetRange}</div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>File name</span>
                  <span className="text-gray-400">{audit.imageMeta.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimensions</span>
                  <span className="text-gray-400">{audit.imageMeta.width} &times; {audit.imageMeta.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compressed size</span>
                  <span className="text-gray-400">{(audit.imageMeta.compressedSize / 1024).toFixed(0)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Score</span>
                  <span className="text-gray-400">{audit.freeScore !== undefined ? audit.freeScore : "—"}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ─── Result or Generate ─── */}
        {result ? (
          <>
            {/* ─── Score Card ─── */}
            <Card className="mb-8">
              <div className="mb-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-gray-500">Aura Score</div>
                  <ScoreGauge score={result.auraScore} />
                  <div className="mt-3">
                    <Badge variant="premium">{result.category}</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500">Verdict</div>
                    <p className="mt-1 text-sm text-gray-300">{result.oneLineVerdict}</p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Strongest Signals</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {result.strongestSignals.map((s) => (
                        <span key={s} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ─── Status Leaks ─── */}
            <h2 className="mb-4 text-lg font-semibold text-white">Status Leaks</h2>
            <div className="mb-8 space-y-3">
              {result.statusLeaks.map((leak) => (
                <Card key={leak.title} className={`border ${severityColors[leak.severity] || severityColors.low}`}>
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{leak.title}</h3>
                    <Badge variant={leak.severity === "high" ? "danger" : leak.severity === "medium" ? "warning" : "default"}>
                      {leak.severity}
                    </Badge>
                  </div>
                  <p className="mb-2 text-xs text-gray-400">{leak.explanation}</p>
                  <p className="text-xs text-purple-300">{leak.fix}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <span>Impact</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{ width: `${Math.min(100, leak.impactScore)}%` }}
                      />
                    </div>
                    <span className="text-gray-500">{leak.impactScore}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* ─── Quick Fixes ─── */}
            <h2 className="mb-4 text-lg font-semibold text-white">Quick Fixes</h2>
            <Card className="mb-8">
              <ul className="space-y-2">
                {result.quickFixes.map((fix) => (
                  <li key={fix} className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {fix}
                  </li>
                ))}
              </ul>
            </Card>

            {/* ─── Budget Upgrade Plan ─── */}
            <h2 className="mb-4 text-lg font-semibold text-white">Budget Upgrade Plan</h2>
            {result.budgetUpgradePlan.map((plan) => (
              <Card key={`${plan.budgetRange}-${plan.priority}`} className="mb-3">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="premium">&#8377;{plan.budgetRange === "0" ? "0" : plan.budgetRange === "25000" ? "25,000+" : Number(plan.budgetRange).toLocaleString("en-IN")}</Badge>
                  <span className="text-xs text-gray-500">Priority {plan.priority}</span>
                </div>
                <ul className="mb-2 space-y-1">
                  {plan.actions.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="mt-1 h-1 w-1 rounded-full bg-purple-400" />
                      {a}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-emerald-400">{plan.estimatedImpact}</p>
              </Card>
            ))}

            {/* ─── Image Metrics ─── */}
            <details className="mb-8">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">Image Metrics Details</summary>
              <Card className="mt-3">
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  {[
                    { label: "Brightness", value: result.imageMetrics.brightness },
                    { label: "Contrast", value: result.imageMetrics.contrast },
                    { label: "Saturation", value: result.imageMetrics.saturation },
                    { label: "Sharpness", value: result.imageMetrics.sharpness },
                    { label: "Edge Density", value: result.imageMetrics.edgeDensity },
                    { label: "Lighting", value: result.imageMetrics.lightingScore },
                    { label: "Clarity", value: result.imageMetrics.clarityScore },
                    { label: "Composition", value: result.imageMetrics.compositionScore },
                    { label: "Background Complexity", value: result.imageMetrics.backgroundComplexityEstimate },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="text-gray-500">{m.label}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: `${m.value}%` }} />
                        </div>
                        <span className="text-gray-400">{m.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </details>

            {/* ─── Locked Teaser ─── */}
            <Card className="mb-8 border-purple-500/20">
              <h3 className="mb-3 text-sm font-semibold text-white">Unlock Full Aura Report</h3>
              <ul className="mb-4 space-y-1.5 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Full visual breakdown
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Detailed status leak analysis
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Budget upgrade roadmap
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Shareable Aura card
                </li>
              </ul>
              <Link href={`/unlock?auditId=${audit.id}&product=aura_report`}>
                <Button className="w-full" size="sm">
                  Unlock Full Aura Report — ₹99
                </Button>
              </Link>
            </Card>
          </>
        ) : (
          /* ─── Generate Button ─── */
          <Card className="mb-8">
            <h3 className="mb-3 text-sm font-semibold text-white">Generate Free Aura Score</h3>
            <p className="mb-4 text-sm text-gray-400">
              Analyze this image locally in your browser and get your free Aura Score, status leaks, and upgrade plan.
            </p>
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? "Analyzing image..." : "Generate Free Aura Score"}
            </Button>
            <p className="mt-2 text-xs text-gray-600">
              Image is analyzed locally. No data is sent to any server.
            </p>
          </Card>
        )}

        {/* ─── Disclaimers ─── */}
        <div className="mb-8 space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-gray-600">
          <p>AuraCheck analyzes presentation signals using local browser-based rules. This is guidance, not objective truth.</p>
          <p>No image is sent to an external AI service in this MVP.</p>
          <p>AuraCheck analyzes presentation, not human worth.</p>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">&larr; Back to Dashboard</Button>
          </Link>
          {result && (
            <span className="text-xs text-gray-600">
              Generated {new Date(result.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>
    </Container>
  );
}
