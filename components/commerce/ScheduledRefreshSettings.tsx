"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Props {
  status: {
    all: number;
    configured: number;
    refreshable: number;
    notConfigured: number;
    connectors: Array<{ key: string; displayName: string; isConfigured: boolean; supportsRefresh: boolean }>;
  } | null;
  onRunAll: () => void;
  running: boolean;
}

export function ScheduledRefreshSettings({ status, onRunAll, running }: Props) {
  if (!status) {
    return (
      <Card>
        <div className="py-4 text-center text-sm text-gray-500">Loading refresh status...</div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Scheduled Refresh</h3>
        <Button size="sm" onClick={onRunAll} disabled={running || status.refreshable === 0}>
          {running ? "Running..." : "Run All Connectors"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <div className="text-lg font-bold text-white">{status.all}</div>
          <div className="text-[10px] text-gray-500">Total Connectors</div>
        </div>
        <div className="rounded-lg bg-emerald-500/10 p-2 text-center">
          <div className="text-lg font-bold text-emerald-400">{status.configured}</div>
          <div className="text-[10px] text-gray-500">Configured</div>
        </div>
        <div className="rounded-lg bg-blue-500/10 p-2 text-center">
          <div className="text-lg font-bold text-blue-400">{status.refreshable}</div>
          <div className="text-[10px] text-gray-500">Refreshable</div>
        </div>
        <div className="rounded-lg bg-amber-500/10 p-2 text-center">
          <div className="text-lg font-bold text-amber-400">{status.notConfigured}</div>
          <div className="text-[10px] text-gray-500">Not Configured</div>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {status.connectors.map((c) => (
          <div key={c.key} className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-gray-300">{c.displayName}</span>
              {c.isConfigured ? (
                <Badge variant="success" className="text-[8px]">Ready</Badge>
              ) : (
                <Badge variant="default" className="text-[8px] bg-amber-500/20 text-amber-300">Not configured</Badge>
              )}
            </div>
            <span className="text-gray-500">{c.supportsRefresh ? "Auto-refresh" : "Manual only"}</span>
          </div>
        ))}
      </div>

      {/* Vercel Cron Info */}
      <div className="mt-4 rounded-lg bg-blue-500/5 p-3">
        <p className="text-[10px] text-blue-300 font-medium">Vercel Cron Setup</p>
        <p className="mt-1 text-[9px] text-gray-500">
          To enable automatic daily refresh, add to vercel.json: a cron job hitting
          POST /api/commerce/refresh/run with x-refresh-secret header.
          See README for details.
        </p>
      </div>
    </Card>
  );
}
