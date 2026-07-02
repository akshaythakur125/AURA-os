"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { PostDeployResult } from "@/types/deployment";

export function PostDeploySmokeTestPanel() {
  const [results, setResults] = useState<PostDeployResult[] | null>(null);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    try {
      const res = await fetch("/api/deployment/post-deploy-smoke", {
        method: "POST",
      });
      const data = await res.json();
      if (data.tests) setResults(data.tests);
    } catch { /* no-op */ }
    setRunning(false);
  }

  const passed = results?.filter((t) => t.status === "pass").length || 0;
  const failed = results?.filter((t) => t.status === "fail").length || 0;
  const manual = results?.filter((t) => t.status === "manual").length || 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Post-Deploy Smoke Tests</h3>
        <Button size="sm" onClick={handleRun} disabled={running}>
          {running ? "Running..." : "Run Tests"}
        </Button>
      </div>

      {results && (
        <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div><span className="text-emerald-400 font-bold">{passed}</span> <span className="text-gray-500">Passed</span></div>
          <div><span className="text-red-400 font-bold">{failed}</span> <span className="text-gray-500">Failed</span></div>
          <div><span className="text-amber-400 font-bold">{manual}</span> <span className="text-gray-500">Manual</span></div>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-1 max-h-60 overflow-auto">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded bg-white/5 px-2 py-1 text-[10px]">
              <div className="flex items-center gap-2">
                <Badge variant={r.status === "pass" ? "success" : r.status === "fail" ? "danger" : "default"} className="text-[8px]">{r.status}</Badge>
                <span className="text-gray-300">{r.testName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 max-w-[200px] truncate">{r.message}</span>
                <span className="text-gray-600">{r.durationMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!results && !running && (
        <p className="text-xs text-gray-500">Run post-deploy smoke tests to verify core functionality.</p>
      )}
    </Card>
  );
}
