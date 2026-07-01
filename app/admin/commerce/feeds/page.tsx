"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FeedImportWizard } from "@/components/commerce/FeedImportWizard";
import { getImportHistory, getImportStats } from "@/lib/commerce/feeds/feedImportHistory";
import type { FeedImportRun } from "@/types/feedImport";

export default function AdminFeedsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [activeTab, setActiveTab] = useState<"import" | "history">("import");
  const [history, setHistory] = useState<FeedImportRun[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getImportStats> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    Promise.resolve().then(() => {
      setAuthenticated(sessionStorage.getItem("auracheck_admin_auth") === "true");
    });
  }, []);

  const loadHistory = useCallback(() => {
    setHistory(getImportHistory());
    setStats(getImportStats());
  }, []);

  useEffect(() => {
    if (authenticated && activeTab === "history") {
      Promise.resolve().then(loadHistory);
    }
  }, [authenticated, activeTab, loadHistory]);

  function handleGate() {
    const envCode = process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
    if (gateInput === envCode || gateInput === "ADMINDEMO") {
      sessionStorage.setItem("auracheck_admin_auth", "true");
      setAuthenticated(true);
    }
  }

  if (!authenticated) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-sm text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Admin Access</h1>
          <input
            type="password"
            value={gateInput}
            onChange={(e) => setGateInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGate()}
            placeholder="Enter admin code"
            className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
          />
          <Button onClick={handleGate}>Enter</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Feed Import</h1>
          <p className="text-xs text-gray-500">Import product feeds from CSV or JSON files</p>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("import")}
            className={`rounded-full px-4 py-1.5 text-xs transition-all ${
              activeTab === "import" ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500"
            }`}
          >
            Import
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-full px-4 py-1.5 text-xs transition-all ${
              activeTab === "history" ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500"
            }`}
          >
            History
          </button>
        </div>

        {activeTab === "import" && <FeedImportWizard />}

        {activeTab === "history" && (
          <div className="space-y-4">
            {stats && (
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-white">Import Statistics</h3>
                <div className="grid gap-3 sm:grid-cols-5">
                  <div className="rounded-lg bg-white/5 p-2 text-center">
                    <div className="text-lg font-bold text-white">{stats.totalRuns}</div>
                    <div className="text-[10px] text-gray-500">Total Runs</div>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-center">
                    <div className="text-lg font-bold text-emerald-400">{stats.totalImported}</div>
                    <div className="text-[10px] text-gray-500">Imported</div>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-2 text-center">
                    <div className="text-lg font-bold text-blue-400">{stats.totalUpdated}</div>
                    <div className="text-[10px] text-gray-500">Updated</div>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 p-2 text-center">
                    <div className="text-lg font-bold text-amber-400">{stats.totalSkipped}</div>
                    <div className="text-[10px] text-gray-500">Skipped</div>
                  </div>
                  <div className="rounded-lg bg-red-500/10 p-2 text-center">
                    <div className="text-lg font-bold text-red-400">{stats.totalInvalid}</div>
                    <div className="text-[10px] text-gray-500">Invalid</div>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <h3 className="mb-3 text-sm font-semibold text-white">Import History</h3>
              {history.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">No imports yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map((run) => (
                    <div key={run.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`font-medium ${
                          run.status === "completed" ? "text-emerald-400" :
                          run.status === "failed" ? "text-red-400" : "text-amber-400"
                        }`}>
                          {run.status}
                        </span>
                        <span className="text-gray-400">{run.sourceType.replace(/_/g, " ")}</span>
                        <span className="text-gray-500">{run.sourceName}</span>
                        {run.fileName && <span className="text-gray-600">{run.fileName}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{run.importedCount} imported</span>
                        <span className="text-gray-500">{run.invalidCount} invalid</span>
                        <span className="text-gray-600">
                          {new Date(run.createdAt).toLocaleString("en-IN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Container>
  );
}
