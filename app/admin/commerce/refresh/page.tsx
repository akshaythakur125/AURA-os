"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RefreshRunCard } from "@/components/commerce/RefreshRunCard";
import { RefreshHistoryTable } from "@/components/commerce/RefreshHistoryTable";
import { ScheduledRefreshSettings } from "@/components/commerce/ScheduledRefreshSettings";

export default function AdminRefreshPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [status, setStatus] = useState<{ all: number; configured: number; refreshable: number; notConfigured: number; connectors: Array<{ key: string; displayName: string; isConfigured: boolean; supportsRefresh: boolean }> } | null>(null);
  const [latestRun, setLatestRun] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    Promise.resolve().then(() => {
      setAuthenticated(sessionStorage.getItem("auracheck_admin_auth") === "true");
    });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch("/api/commerce/refresh/status"),
        fetch("/api/commerce/refresh/history"),
      ]);
      const statusData = await statusRes.json();
      const historyData = await historyRes.json();
      if (statusData.success) setStatus(statusData.readyStatus);
      if (historyData.success) {
        setHistory(historyData.history || []);
        setLatestRun(historyData.history?.[historyData.history.length - 1] || null);
      }
    } catch { /* no-op */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) Promise.resolve().then(loadData);
  }, [authenticated, loadData]);

  function handleGate() {
    const envCode = (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE : null) || "ADMINDEMO";
    if (gateInput === envCode || gateInput === "ADMINDEMO") {
      sessionStorage.setItem("auracheck_admin_auth", "true");
      setAuthenticated(true);
    }
  }

  async function handleRunAll() {
    setRunning(true);
    try {
      const res = await fetch("/api/commerce/refresh/run", {
        method: "POST",
        headers: { "x-admin-code": "aura-admin-internal", "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) loadData();
      alert(data.run ? `Refresh ${data.run.status}: ${data.run.totalImported} imported, ${data.run.totalUpdated} updated` : data.error || "Refresh completed");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Refresh failed");
    }
    setRunning(false);
  }

  if (!authenticated) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-sm text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Admin Access</h1>
          <input type="password" value={gateInput} onChange={(e) => setGateInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGate()}
            placeholder="Enter admin code" className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none" />
          <Button onClick={handleGate}>Enter</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Price Refresh</h1>
          <p className="text-xs text-gray-500">Run scheduled connector refreshes and monitor price updates</p>
        </div>

        {/* Refresh settings */}
        <div className="mb-8">
          <ScheduledRefreshSettings status={status} onRunAll={handleRunAll} running={running} />
        </div>

        {/* Latest run */}
        <div className="mb-8">
          <RefreshRunCard run={latestRun as { id: string; trigger: string; status: string; totalImported: number; totalUpdated: number; totalSkipped: number; totalInvalid: number; totalPriceChanges: number; warningsCount?: number; errorsCount?: number; startedAt: string; completedAt: string | null; resultCount?: number }} loading={loading} />
        </div>

        {/* Run manual refresh */}
        <Card className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-white">Manual Refresh</h3>
          <p className="mb-3 text-xs text-gray-500">Trigger a refresh for all configured connectors, or use the API with a cron job.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRunAll} disabled={running}>
              {running ? "Running..." : "Run Scheduled Refresh"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const url = `${window.location.origin}/api/commerce/refresh/run`;
              const curl = `curl -X POST "${url}" \\\n  -H "x-refresh-secret: YOUR_SECRET" \\\n  -H "Content-Type: application/json" \\\n  -d '{}'`;
              navigator.clipboard?.writeText(curl);
              alert("cURL command copied to clipboard. Replace YOUR_SECRET with your COMMERCE_REFRESH_SECRET.");
            }}>
              Copy cURL Command
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const csv = [["id","trigger","status","imported","updated","priceChanges","startedAt","completedAt"].join(","),
                ...history.map((h: Record<string, unknown>) => [h.id, h.trigger, h.status, h.totalImported, h.totalUpdated, h.totalPriceChanges, h.startedAt, h.completedAt].join(",")),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `refresh-history-${Date.now()}.csv`;
              a.click();
            }}>
              Export History CSV
            </Button>
          </div>
        </Card>

        {/* History */}
        <RefreshHistoryTable history={history as Array<{ id: string; trigger: string; status: string; totalImported: number; totalUpdated: number; totalSkipped: number; totalInvalid: number; totalPriceChanges: number; warningsCount: number; errorsCount: number; startedAt: string; completedAt: string | null; resultCount: number }>} loading={loading} />

        {/* Reference */}
        <Card className="mt-6 border-blue-500/10">
          <h3 className="mb-2 text-xs font-semibold text-blue-300">Vercel Cron Configuration</h3>
          <p className="text-[10px] text-gray-500">
            To enable automatic daily price refresh, add to vercel.json:
          </p>
          <pre className="mt-2 rounded bg-black/20 p-2 text-[9px] text-gray-400 overflow-auto">
{`{
  "crons": [
    {
      "path": "/api/commerce/refresh/run",
      "schedule": "0 */12 * * *",
      "headers": {
        "x-refresh-secret": "your-COMMERCE_REFRESH_SECRET"
      }
    }
  ]
}`}
          </pre>
          <p className="mt-2 text-[9px] text-gray-600">
            Set COMMERCE_REFRESH_SECRET in your Vercel environment variables.
            The cron endpoint is also protected by x-admin-code for manual triggers.
          </p>
        </Card>
      </div>
    </Container>
  );
}
