"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAudits } from "@/lib/storage/auditStore";
import { getProgressComparisons, createProgressComparison, deleteProgressComparison } from "@/lib/storage/progressStore";
import { compareAudits } from "@/lib/progress/compareAudits";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { updateOnboarding } from "@/lib/storage/onboardingStore";


export default function ProgressPage() {
  const [audits] = useState(() => getAudits().filter((a) => a.freeScore !== undefined || a.fullScore !== undefined));
  const [comparisons, setComparisons] = useState(() => getProgressComparisons());
  const [beforeId, setBeforeId] = useState("");
  const [afterId, setAfterId] = useState("");
  const [result, setResult] = useState<ReturnType<typeof compareAudits> | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCompare() {
    setError(null);
    setResult(null);
    if (!beforeId || !afterId) { setError("Select both before and after audits."); return; }
    if (beforeId === afterId) { setError("Before and after must be different audits."); return; }
    const before = audits.find((a) => a.id === beforeId);
    const after = audits.find((a) => a.id === afterId);
    if (!before || !after) { setError("Audit not found."); return; }
    const comp = compareAudits(before, after);
    setResult(comp);
  }

  function handleSave() {
    if (!result) return;
    createProgressComparison(result);
    setComparisons(getProgressComparisons());
    trackEvent("progress_comparison_created", { delta: String(result.scoreDelta) });
    updateOnboarding({ hasComparedProgress: true });
    setResult(null);
  }

  function handleDelete(id: string) {
    deleteProgressComparison(id);
    setComparisons(getProgressComparisons());
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">Before / After Tracker</h1>
        <p className="mb-8 text-center text-gray-400">Compare two audits to see how your score and signals improved.</p>

        {/* ─── Select Audits ─── */}
        <Card className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-white">Select Audits</h2>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Before Audit</label>
              <select value={beforeId} onChange={(e) => setBeforeId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none">
                <option value="">Select before audit</option>
                {audits.map((a) => (
                  <option key={a.id} value={a.id}>{a.id.slice(0, 8)}... Score: {a.freeScore ?? a.fullScore ?? "—"} ({new Date(a.createdAt).toLocaleDateString("en-IN")})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">After Audit</label>
              <select value={afterId} onChange={(e) => setAfterId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none">
                <option value="">Select after audit</option>
                {audits.map((a) => (
                  <option key={a.id} value={a.id}>{a.id.slice(0, 8)}... Score: {a.freeScore ?? a.fullScore ?? "—"} ({new Date(a.createdAt).toLocaleDateString("en-IN")})</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={handleCompare} disabled={!beforeId || !afterId}>Compare</Button>
          {error && <div className="mt-3 text-xs text-red-400">{error}</div>}
        </Card>

        {/* ─── Comparison Result ─── */}
        {result && (
          <Card className="mb-8 border-purple-500/30">
            <h2 className="mb-4 text-lg font-bold text-white">Comparison Result</h2>
            <div className="mb-4 flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500">Before</div>
                <div className="text-2xl font-bold text-white">{result.beforeScore}</div>
              </div>
              <div className="text-2xl text-gray-600">&rarr;</div>
              <div className="text-center">
                <div className="text-xs text-gray-500">After</div>
                <div className={`text-2xl font-bold ${result.scoreDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>{result.afterScore}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Change</div>
                <div className={`text-lg font-bold ${result.scoreDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {result.scoreDelta >= 0 ? "+" : ""}{result.scoreDelta}
                </div>
              </div>
            </div>
            <div className="mb-4 rounded-xl bg-white/5 p-3 text-sm text-gray-300">{result.summary}</div>
            {result.improvedSignals.length > 0 && (
              <div className="mb-3">
                <div className="mb-1 text-xs text-emerald-400">Improved Signals</div>
                <div className="flex flex-wrap gap-2">
                  {result.improvedSignals.map((s) => <Badge key={s} variant="success">{s}</Badge>)}
                </div>
              </div>
            )}
            {result.remainingLeaks.length > 0 && result.remainingLeaks[0] !== "None detected" && (
              <div className="mb-3">
                <div className="mb-1 text-xs text-amber-400">Remaining Leaks</div>
                <div className="flex flex-wrap gap-2">
                  {result.remainingLeaks.map((s) => <Badge key={s} variant="warning">{s}</Badge>)}
                </div>
              </div>
            )}
            <Button onClick={handleSave} size="sm">Save Comparison</Button>
          </Card>
        )}

        {/* ─── Saved Comparisons ─── */}
        {comparisons.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-white">Saved Comparisons ({comparisons.length})</h2>
            <div className="space-y-3">
              {comparisons.map((c) => (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                        <Badge variant={c.scoreDelta >= 0 ? "success" : "danger"}>{c.scoreDelta >= 0 ? "+" : ""}{c.scoreDelta}</Badge>
                      </div>
                      <div className="mb-2 text-sm text-gray-300">{c.summary}</div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Before: {c.beforeScore}</span>
                        <span>After: {c.afterScore}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)}>
                      <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ─── CTA ─── */}
        <div className="text-center">
          <Link href="/audit/new">
            <Button variant="outline" size="lg">Create New Audit</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
