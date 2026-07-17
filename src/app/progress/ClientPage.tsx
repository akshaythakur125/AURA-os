"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAudits } from "@/lib/storage/auditStore";
import { getProgressComparisons, createProgressComparison, deleteProgressComparison } from "@/lib/storage/progressStore";
import { compareAudits } from "@/lib/progress/compareAudits";
import { trackEvent } from "@/lib/storage/analyticsStore";
import type { ProgressComparison } from "@/types/progress";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function ProgressPage() {
  const [comparisons, setComparisons] = useState<ProgressComparison[]>(() => {
    if (typeof window === "undefined") return [];
    return getProgressComparisons();
  });
  const [beforeId, setBeforeId] = useState("");
  const [afterId, setAfterId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const audits = useMemo(() => {
    if (typeof window === "undefined") return [];
    return getAudits().filter((a) => a.freeScore !== undefined || a.fullScore !== undefined);
  }, []);

  const alreadyCompared = useMemo(() => {
    const pairs = new Set<string>();
    comparisons.forEach((c) => {
      pairs.add(`${c.beforeAuditId}-${c.afterAuditId}`);
    });
    return pairs;
  }, [comparisons]);

  function handleCompare() {
    setError(null);
    setSuccess(null);

    if (!beforeId || !afterId) {
      setError("Please select both a before and after audit.");
      return;
    }
    if (beforeId === afterId) {
      setError("Before and after audits must be different.");
      return;
    }
    if (alreadyCompared.has(`${beforeId}-${afterId}`)) {
      setError("This comparison already exists.");
      return;
    }

    const beforeAudit = audits.find((a) => a.id === beforeId);
    const afterAudit = audits.find((a) => a.id === afterId);
    if (!beforeAudit || !afterAudit) {
      setError("One or both audits not found.");
      return;
    }

    const comparison = compareAudits(beforeAudit, afterAudit);
    const saved = createProgressComparison(comparison);
    setComparisons((prev) => [saved, ...prev]);
    setSuccess("Comparison saved! See your improvement below.");
    trackEvent({ eventName: "progress_comparison_created", auditId: afterId, metadata: { beforeScore: String(saved.beforeScore), afterScore: String(saved.afterScore) } });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this comparison?")) return;
    deleteProgressComparison(id);
    setComparisons((prev) => prev.filter((c) => c.id !== id));
  }

  const stats = useMemo(() => {
    if (comparisons.length === 0) return null;
    const deltas = comparisons.map((c) => c.scoreDelta);
    return {
      total: comparisons.length,
      avg: Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length),
      best: Math.max(...deltas),
      worst: Math.min(...deltas),
    };
  }, [comparisons]);

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-12">
        <GlowOrb color="rgba(16, 185, 129, 0.08)" size={250} className="top-[8%] right-[10%]" delay={0} />
        <GlowOrb color="rgba(225, 68, 52, 0.06)" size={200} className="bottom-[20%] left-[8%]" delay={400} />
      <SectionHeading title="Track Your Improvement" subtitle="Compare two audits and see your progress over time." />

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card><div className="text-xs text-[#857b6e]">Comparisons</div><div className="mt-1 text-2xl font-bold text-[#1C1917]">{stats.total}</div></Card>
          <Card><div className="text-xs text-[#857b6e]">Avg Change</div><div className="mt-1 text-2xl font-bold text-[#1C1917]">{stats.avg >= 0 ? "+" : ""}{stats.avg}</div></Card>
          <Card><div className="text-xs text-[#857b6e]">Best Improvement</div><div className="mt-1 text-2xl font-bold text-emerald-400">+{stats.best}</div></Card>
          <Card><div className="text-xs text-[#857b6e]">Biggest Drop</div><div className="mt-1 text-2xl font-bold text-red-400">{stats.worst}</div></Card>
        </div>
      )}

      <Card className="mb-8">
        <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">New Comparison</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-[#857b6e]">Before Audit</label>
            <select
              value={beforeId}
              onChange={(e) => setBeforeId(e.target.value)}
              className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] focus:border-red-500/50 focus:outline-none"
            >
              <option value="">Select...</option>
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.freeScore ?? a.fullScore ?? "?"} — {a.auditType} ({formatDate(a.createdAt)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#857b6e]">After Audit</label>
            <select
              value={afterId}
              onChange={(e) => setAfterId(e.target.value)}
              className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] focus:border-red-500/50 focus:outline-none"
            >
              <option value="">Select...</option>
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.freeScore ?? a.fullScore ?? "?"} — {a.auditType} ({formatDate(a.createdAt)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        {success && <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">{success}</p>}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleCompare}>Compare Audits</Button>
          <Link href="/audit/new"><Button variant="outline">Create New Audit</Button></Link>
        </div>
      </Card>

      {comparisons.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#1C1917]">Past Comparisons ({comparisons.length})</h3>
          {comparisons.map((c) => (
            <Card key={c.id}>
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-[#857b6e]">Before</div>
                    <div className="text-xl font-bold text-[#1C1917]">{c.beforeScore}</div>
                  </div>
                  <svg className="h-5 w-5 text-[#9c9184]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div className="text-center">
                    <div className="text-xs text-[#857b6e]">After</div>
                    <div className="text-xl font-bold text-[#1C1917]">{c.afterScore}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#857b6e]">Delta</div>
                    <div className={`text-xl font-bold ${c.scoreDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {c.scoreDelta >= 0 ? "+" : ""}{c.scoreDelta}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-[#9c9184]">{formatDate(c.createdAt)}</span>
              </div>

              <p className="mb-3 text-sm text-[#4a443d]">{c.summary}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {c.improvedSignals.length > 0 && (
                  <div>
                    <div className="mb-1 text-xs text-emerald-400">Improved</div>
                    <div className="flex flex-wrap gap-1">
                      {c.improvedSignals.map((s) => (
                        <Badge key={s} variant="success">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {c.remainingLeaks.length > 0 && (
                  <div>
                    <div className="mb-1 text-xs text-amber-400">Still to work on</div>
                    <div className="flex flex-wrap gap-1">
                      {c.remainingLeaks.map((s) => (
                        <Badge key={s} variant="warning">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <Link href={`/audit/${c.afterAuditId}`}>
                  <Button variant="secondary" size="sm">View After Audit</Button>
                </Link>
                <button onClick={() => handleDelete(c.id)} className="rounded-lg px-2 py-1 text-xs text-[#857b6e] hover:text-red-400">
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {comparisons.length === 0 && (
        <Card className="py-12 text-center">
          <p className="mb-2 text-lg text-[#4a443d]">No comparisons yet</p>
          <p className="mb-6 text-sm text-[#857b6e]">Select two audits above and compare them to see your progress.</p>
          <Link href="/audit/new"><Button>Create First Audit</Button></Link>
        </Card>
      )}

      <div className="mt-8 rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-4 text-center text-xs text-[#9c9184]">
        <p>AuraCheck analyzes presentation signals, not human worth. Scores are guidance, not objective truth.</p>
      </div>
      </Container>
    </>
  );
}
