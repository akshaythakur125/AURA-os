"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { DeploymentCategory } from "@/types/deployment";

interface Props {
  categories: DeploymentCategory[];
  score: number;
  label: string;
}

const LABEL_STYLES: Record<string, string> = {
  not_ready: "bg-red-500 text-white",
  preview_ready: "bg-amber-500 text-black",
  soft_launch_ready: "bg-blue-500 text-white",
  production_ready: "bg-emerald-500 text-white",
};

const STATUS_VARIANTS: Record<string, "success" | "danger" | "warning" | "default"> = {
  pass: "success",
  fail: "danger",
  warning: "warning",
  manual: "default",
};

export function DeploymentChecklist({ categories, score, label }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Deployment Readiness</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${LABEL_STYLES[label] || ""}`}>{score}/100</span>
      </div>
      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${score >= 90 ? "bg-emerald-500" : score >= 75 ? "bg-blue-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
          style={{ width: `${score}%` }} />
      </div>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{cat.name}</span>
              <span className="text-[10px] text-gray-500">{cat.score}/{cat.maxScore}</span>
            </div>
            <div className="space-y-1">
              {cat.checks.slice(0, 5).map((check, i) => (
                <div key={i} className="flex items-center justify-between rounded bg-white/5 px-2 py-1 text-[10px]">
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANTS[check.status] || "default"} className="text-[8px]">{check.status}</Badge>
                    <span className="text-gray-300">{check.name}</span>
                  </div>
                  <span className="text-gray-500 max-w-[200px] truncate text-right">{check.message}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
