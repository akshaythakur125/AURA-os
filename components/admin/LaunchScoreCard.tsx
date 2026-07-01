"use client";

import { Card } from "@/components/ui/Card";
import type { LaunchScore, LaunchLabel } from "@/types/launch";

interface Props {
  score: LaunchScore;
}

const LABEL_STYLES: Record<LaunchLabel, string> = {
  not_ready: "bg-red-500 text-white",
  test_mode: "bg-amber-500 text-black",
  soft_launch: "bg-blue-500 text-white",
  production_ready: "bg-emerald-500 text-white",
};

export function LaunchScoreCard({ score }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Launch Readiness</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${LABEL_STYLES[score.label]}`}>
          {score.total}/100
        </span>
      </div>
      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${
            score.total >= 90 ? "bg-emerald-500" : score.total >= 75 ? "bg-blue-500" : score.total >= 50 ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${score.total}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mb-3">
        {score.label === "not_ready" && "Critical setup incomplete. Complete required checks before launch."}
        {score.label === "test_mode" && "Test mode only. Complete remaining checks for production."}
        {score.label === "soft_launch" && "Ready for soft launch. Complete final checks for full production."}
        {score.label === "production_ready" && "Ready for production launch. Continue monitoring."}
      </div>
      <div className="space-y-2">
        {score.categories.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{cat.name}</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${(cat.score / cat.maxScore) * 100}%` }} />
              </div>
              <span className="w-8 text-right text-gray-500">{cat.score}/{cat.maxScore}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
