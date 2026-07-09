"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ProductionMode } from "@/lib/deployment/productionMode";

interface Props {
  mode: ProductionMode;
  warnings: string[];
}

export function ProductionModePanel({ mode, warnings }: Props) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Production Mode</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="text-[10px] text-gray-500">Host Mode</div>
          <Badge variant={mode.hostMode === "production" ? "success" : mode.hostMode === "preview" ? "warning" : "default"} className="text-[10px]">
            {mode.hostMode}
          </Badge>
        </div>
        <div>
          <div className="text-[10px] text-gray-500">Domain</div>
          <div className="text-xs text-white">{mode.domain}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500">App URL</div>
          <div className="text-xs text-white truncate">{mode.appUrl}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500">Environment</div>
          <div className="text-xs text-white">{mode.isProductionDomain ? "Production" : mode.isVercel ? "Vercel Preview" : mode.isLocalhost ? "Local Development" : "Unknown"}</div>
        </div>
      </div>
      {warnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {warnings.map((w, i) => (
            <div key={i} className="rounded bg-amber-500/10 px-2 py-1 text-[10px] text-amber-400">{w}</div>
          ))}
        </div>
      )}
    </Card>
  );
}
