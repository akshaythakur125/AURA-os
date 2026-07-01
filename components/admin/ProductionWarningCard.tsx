"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ProductionWarning } from "@/types/launch";

interface Props {
  warnings: ProductionWarning[];
}

export function ProductionWarningCard({ warnings }: Props) {
  if (warnings.length === 0) {
    return (
      <Card>
        <div className="py-4 text-center text-xs text-emerald-400">No production warnings. All critical checks pass.</div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Production Warnings ({warnings.length})</h3>
      <div className="space-y-2">
        {warnings.map((w, i) => (
          <div key={i} className={`rounded-lg p-2.5 ${
            w.type === "critical" ? "bg-red-500/10 border border-red-500/20" :
            w.type === "warning" ? "bg-amber-500/10 border border-amber-500/20" :
            "bg-blue-500/5"
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={w.type === "critical" ? "danger" : w.type === "warning" ? "warning" : "default"} className="text-[9px]">
                  {w.type}
                </Badge>
                <span className="text-xs text-gray-300">{w.message}</span>
              </div>
            </div>
            {w.fix && <p className="mt-1 text-[10px] text-gray-500">{w.fix}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}
