"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getAudits, deleteAudit } from "@/lib/storage/auditStore";
import { getUnlockedAuditCount } from "@/lib/storage/unlockStore";
import { getRecommendationsForAudit } from "@/lib/recommendations/getRecommendations";
import { getOrdersByAuditId } from "@/lib/storage/orderStore";

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

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "warning" | "success" | "premium" }> = {
  draft: { label: "Draft", variant: "default" },
  free_generated: { label: "Free Score", variant: "success" },
  full_report: { label: "Full Report", variant: "premium" },
};

export default function DashboardPage() {
  const [audits, setAudits] = useState(() => getAudits());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function handleDelete(id: string) {
    deleteAudit(id);
    setAudits(getAudits());
    setDeleteTarget(null);
  }

  const scoredAudits = audits.filter((a) => a.freeScore !== undefined);
  const latestScore = audits.length > 0 ? audits[0].freeScore ?? null : null;
  const bestScore = scoredAudits.length > 0 ? Math.max(...scoredAudits.map((a) => a.freeScore!)) : null;
  const avgScore = scoredAudits.length > 0
    ? Math.round(scoredAudits.reduce((sum, a) => sum + (a.freeScore ?? 0), 0) / scoredAudits.length)
    : null;
  const unlockedCount = getUnlockedAuditCount();

  const scoredWithResults = scoredAudits.filter((a) => a.freeResult);
  const repeatedLeak = (() => {
    if (scoredWithResults.length < 2) return null;
    const leakCounts = new Map<string, number>();
    for (const a of scoredWithResults) {
      for (const l of (a.freeResult?.statusLeaks || [])) {
        const title = l.title.toLowerCase();
        if (title.includes("lighting")) leakCounts.set("lighting", (leakCounts.get("lighting") || 0) + 1);
        if (title.includes("background") || title.includes("clutter") || title.includes("busy")) leakCounts.set("background", (leakCounts.get("background") || 0) + 1);
        if (title.includes("clarity") || title.includes("sharp")) leakCounts.set("clarity", (leakCounts.get("clarity") || 0) + 1);
        if (title.includes("framing") || title.includes("composition")) leakCounts.set("framing", (leakCounts.get("framing") || 0) + 1);
      }
    }
    let maxLeak = "";
    let maxCount = 0;
    for (const [leak, count] of leakCounts) {
      if (count > maxCount) { maxCount = count; maxLeak = leak; }
    }
    if (maxCount < 2) return null;
    const labels: Record<string, string> = { lighting: "lighting", background: "background clutter", clarity: "image clarity", framing: "framing" };
    return { leak: labels[maxLeak] || maxLeak, count: maxCount, total: scoredWithResults.length };
  })();

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Link href="/audit/new">
            <Button size="sm">New Audit</Button>
          </Link>
        </div>

        {/* ─── Stats ─── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <div className="text-xs text-gray-500">Total Audits</div>
            <div className="mt-1 text-3xl font-bold text-white">{audits.length}</div>
          </Card>
          <Card>
            <div className="text-xs text-gray-500">Latest Aura Score</div>
            <div className="mt-1 text-3xl font-bold text-white">
              {latestScore !== null ? latestScore : <span className="text-base text-gray-500">—</span>}
            </div>
          </Card>
          <Card>
            <div className="text-xs text-gray-500">Best Score</div>
            <div className="mt-1 text-3xl font-bold text-emerald-400">
              {bestScore !== null ? bestScore : <span className="text-base text-gray-500">—</span>}
            </div>
          </Card>
        </div>

        {scoredAudits.length > 0 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <Card>
              <div className="text-xs text-gray-500">Average Score</div>
              <div className="mt-1 text-3xl font-bold text-white">{avgScore}</div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Scored Audits</div>
                  <div className="mt-1 text-3xl font-bold text-white">{scoredAudits.length} / {audits.length}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Unlocked</div>
                  <div className="mt-1 text-3xl font-bold text-purple-400">{unlockedCount}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ─── Latest Upgrade Path ─── */}
        {audits.length > 0 && audits[0].freeScore !== undefined && (() => {
          const latestRecs = getRecommendationsForAudit(audits[0], { limit: 3 });
          if (latestRecs.length === 0) return null;
          return (
            <Card className="mb-8 border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="mb-1 text-sm font-semibold text-white">Your Next Best Upgrade Path</h2>
                  <p className="text-xs text-gray-400">
                    Your latest Aura Check found {audits[0].freeResult?.statusLeaks.length ?? 0} status leaks.
                    Here are the highest-impact upgrades.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {latestRecs.slice(0, 3).map((rec) => (
                      <span key={rec.product.id} className="rounded-full bg-purple-500/10 px-2.5 py-1 text-xs text-purple-300">
                        {rec.product.title}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link href={`/audit/${audits[0].id}`}>
                    <Button size="sm" variant="outline">View Path</Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })()}

        {/* ─── Latest Audit Product CTAs ─── */}
        {audits.length > 0 && audits[0].freeScore !== undefined && (() => {
          const latest = audits[0];
          const hasDating = !!latest.datingProfileReport;
          const hasGlowup = !!latest.glowupPlan;
          if (!hasDating && !hasGlowup) return null;
          return (
            <Card className="mb-8 border-emerald-500/20">
              <div className="flex flex-wrap items-center gap-4">
                {hasGlowup && (
                  <Link href={`/audit/${latest.id}`} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    Continue your 30-day plan
                  </Link>
                )}
                {hasDating && (
                  <Link href={`/audit/${latest.id}`} className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Profile strategy ready
                  </Link>
                )}
              </div>
            </Card>
          );
        })()}

        {/* ─── Repeated Pattern ─── */}
        {repeatedLeak && (
          <Card className="mb-8 border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-white">Your Repeated Pattern</h3>
                <p className="text-xs text-gray-400">
                  <strong className="text-amber-300">{repeatedLeak.leak.charAt(0).toUpperCase() + repeatedLeak.leak.slice(1)}</strong> appears in {repeatedLeak.count} out of your last {repeatedLeak.total} scored audits. This may be a recurring gap worth prioritizing.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ─── Payment Request Status (latest audit) ─── */}
        {audits.length > 0 && audits[0].freeScore !== undefined && (() => {
          const latest = audits[0];
          const orders = getOrdersByAuditId(latest.id);
          const pendingOrder = orders.find((o) => o.status === "payment_submitted" || o.status === "code_sent" || o.status === "payment_pending");
          if (!pendingOrder) return null;
          return (
            <Card className="mb-8 border-amber-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Payment Request for {pendingOrder.productName}</h3>
                  <p className="text-xs text-gray-400">Status: {pendingOrder.status === "code_sent" ? "Code sent — enter it on the unlock page" : "Payment submitted — awaiting owner response"}</p>
                </div>
                <Link href={`/unlock?auditId=${latest.id}&product=${pendingOrder.productType}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            </Card>
          );
        })()}

        {/* ─── Audit History ─── */}
        <h2 className="mb-4 text-lg font-semibold text-white">Audit History</h2>

        {audits.length === 0 ? (
          <Card>
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mb-1 text-sm font-medium text-gray-300">No audits yet</p>
              <p className="mb-4 text-xs text-gray-500">
                Create your first Aura Check to get started.
              </p>
              <Link href="/audit/new">
                <Button size="sm">Start Aura Check</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {audits.map((audit) => {
              const statusInfo = STATUS_BADGE[audit.reportStatus] || STATUS_BADGE.draft;
              return (
                <Card key={audit.id} className="flex gap-4 p-4">
                  {/* ─── Thumbnail ─── */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={audit.imageDataUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* ─── Info ─── */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {AUDIT_TYPE_LABELS[audit.auditType] || audit.auditType}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                          <span>{GOAL_LABELS[audit.goal] || audit.goal}</span>
                        </div>
                      </div>
                      {audit.freeScore !== undefined && (
                        <div className="flex-shrink-0 text-right">
                          <div className="text-lg font-bold text-white">{audit.freeScore}</div>
                          <div className="text-[10px] text-gray-600">score</div>
                          {audit.personalization?.archetype && (
                            <div className="mt-0.5 text-[9px] text-purple-400">{audit.personalization.archetype}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        {audit.fullReport && (
                          <svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><title>Full Report</title>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                        )}
                        {audit.datingProfileReport && (
                          <svg className="h-3.5 w-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><title>Dating Audit</title>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {audit.glowupPlan && (
                          <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><title>Glow-Up Plan</title>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/audit/${audit.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(audit.id)}
                        >
                          <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ─── Delete Confirmation ─── */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Audit"
          message="This will permanently remove this audit and its image. This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          requireTypedConfirm="DELETE"
          variant="danger"
          onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </Container>
  );
}
