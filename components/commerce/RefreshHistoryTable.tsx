"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface RefreshRunSummary {
  id: string;
  trigger: string;
  status: string;
  totalImported: number;
  totalUpdated: number;
  totalSkipped: number;
  totalInvalid: number;
  totalPriceChanges: number;
  warningsCount: number;
  errorsCount: number;
  startedAt: string;
  completedAt: string | null;
  resultCount: number;
}

interface Props {
  history: RefreshRunSummary[];
  loading: boolean;
}

export function RefreshHistoryTable({ history, loading }: Props) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="mb-3 h-5 w-32 rounded bg-white/10" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded bg-white/5" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Refresh History</h3>
      {history.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-500">No refresh runs yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-500">
                <th className="py-1.5 pr-2">Date</th>
                <th className="py-1.5 pr-2">Trigger</th>
                <th className="py-1.5 pr-2">Status</th>
                <th className="py-1.5 pr-2">Imported</th>
                <th className="py-1.5 pr-2">Updated</th>
                <th className="py-1.5 pr-2">Price Δ</th>
                <th className="py-1.5 pr-2">Warnings</th>
                <th className="py-1.5">Connectors</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-white/5 text-gray-300">
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    {new Date(h.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-1.5 pr-2 text-gray-500">{h.trigger}</td>
                  <td className="py-1.5 pr-2">
                    <Badge variant={h.status === "completed" ? "success" : h.status === "failed" ? "danger" : "warning"} className="text-[8px]">
                      {h.status}
                    </Badge>
                  </td>
                  <td className="py-1.5 pr-2 text-emerald-400">{h.totalImported}</td>
                  <td className="py-1.5 pr-2 text-blue-400">{h.totalUpdated}</td>
                  <td className="py-1.5 pr-2 text-purple-400">{h.totalPriceChanges}</td>
                  <td className="py-1.5 pr-2 text-amber-400">{h.warningsCount}</td>
                  <td className="py-1.5">{h.resultCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
