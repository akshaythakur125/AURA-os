"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Props {
  run: {
    id: string;
    trigger: string;
    status: string;
    totalImported: number;
    totalUpdated: number;
    totalSkipped: number;
    totalInvalid: number;
    totalPriceChanges: number;
    warningsCount?: number;
    errorsCount?: number;
    startedAt: string;
    completedAt: string | null;
    resultCount?: number;
  } | null;
  loading: boolean;
}

export function RefreshRunCard({ run, loading }: Props) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="mb-3 h-5 w-40 rounded bg-white/10" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded bg-white/5" />
          ))}
        </div>
      </Card>
    );
  }

  if (!run) {
    return (
      <Card>
        <div className="py-6 text-center text-sm text-gray-500">No refresh runs yet</div>
      </Card>
    );
  }

  const statusColor = run.status === "completed" ? "success" : run.status === "failed" ? "danger" : "warning";

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Latest Refresh Run</h3>
          <Badge variant={statusColor}>{run.status}</Badge>
        </div>
        <span className="text-[10px] text-gray-500">Trigger: {run.trigger}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-emerald-500/10 p-2 text-center">
          <div className="text-lg font-bold text-emerald-400">{run.totalImported}</div>
          <div className="text-[10px] text-gray-500">Imported</div>
        </div>
        <div className="rounded-lg bg-blue-500/10 p-2 text-center">
          <div className="text-lg font-bold text-blue-400">{run.totalUpdated}</div>
          <div className="text-[10px] text-gray-500">Updated</div>
        </div>
        <div className="rounded-lg bg-purple-500/10 p-2 text-center">
          <div className="text-lg font-bold text-purple-400">{run.totalPriceChanges}</div>
          <div className="text-[10px] text-gray-500">Price Changes</div>
        </div>
        <div className="rounded-lg bg-amber-500/10 p-2 text-center">
          <div className="text-lg font-bold text-amber-400">{run.warningsCount || 0}</div>
          <div className="text-[10px] text-gray-500">Warnings</div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500">
        <span>Started: {new Date(run.startedAt).toLocaleString("en-IN")}</span>
        {run.completedAt && <span>Completed: {new Date(run.completedAt).toLocaleString("en-IN")}</span>}
        {run.resultCount !== undefined && <span>{run.resultCount} connector(s)</span>}
      </div>
    </Card>
  );
}
