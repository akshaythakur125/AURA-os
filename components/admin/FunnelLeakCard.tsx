"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { FunnelLeak } from "@/types/funnel";

interface Props {
  leaks: FunnelLeak[];
}

export function FunnelLeakCard({ leaks }: Props) {
  if (leaks.length === 0) {
    return (
      <Card>
        <div className="py-4 text-center text-xs text-gray-500">No major funnel leaks detected.</div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Funnel Leaks</h3>
      <div className="space-y-3">
        {leaks.map((leak, i) => (
          <div key={i} className="rounded-lg border border-red-500/10 bg-red-500/[0.02] p-2.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-white">{leak.stage}</span>
              <Badge variant="danger" className="text-[9px]">-{leak.dropoffPercent}%</Badge>
            </div>
            <p className="text-[10px] text-gray-400">{leak.dropoffCount} users dropped off</p>
            <p className="mt-1 text-[10px] text-amber-400/80">{leak.suggestion}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
