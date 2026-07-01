"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SmokeTestSuite } from "@/types/smokeTest";

export function SmokeTestPanel() {
  const [suite, setSuite] = useState<SmokeTestSuite | null>(null);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    try {
      const res = await fetch("/api/launch/smoke-test", {
        method: "POST",
        headers: { "x-admin-code": "aura-admin-internal" },
      });
      const data = await res.json();
      if (data.success) setSuite(data.suite);
    } catch { /* no-op */ }
    setRunning(false);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Smoke Tests</h3>
        <Button size="sm" onClick={handleRun} disabled={running}>
          {running ? "Running..." : "Run Smoke Tests"}
        </Button>
      </div>

      {suite && (
        <>
          <div className="mb-3 grid grid-cols-4 gap-2 text-center text-xs">
            <div><span className="text-emerald-400 font-bold">{suite.passed}</span> <span className="text-gray-500">Passed</span></div>
            <div><span className="text-red-400 font-bold">{suite.failed}</span> <span className="text-gray-500">Failed</span></div>
            <div><span className="text-amber-400 font-bold">{suite.manual}</span> <span className="text-gray-500">Manual</span></div>
            <div><span className="text-white font-bold">{suite.total}</span> <span className="text-gray-500">Total</span></div>
          </div>
          <div className="space-y-1 max-h-60 overflow-auto">
            {suite.tests.map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded bg-white/5 px-2 py-1 text-[10px]">
                <div className="flex items-center gap-2">
                  <Badge variant={t.status === "pass" ? "success" : t.status === "fail" ? "danger" : "default"} className="text-[8px]">{t.status}</Badge>
                  <span className="text-gray-300">{t.testName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 max-w-[200px] truncate">{t.message}</span>
                  <span className="text-gray-600">{t.durationMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!suite && !running && (
        <p className="text-xs text-gray-500">Click &quot;Run Smoke Tests&quot; to verify core functionality.</p>
      )}
    </Card>
  );
}
