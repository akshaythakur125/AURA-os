"use client";

import { Card } from "@/components/ui/Card";
import type { SourceBreakdown } from "@/types/attribution";

interface Props {
  sources: SourceBreakdown[];
  title?: string;
}

export function SourceBreakdownCard({ sources, title }: Props) {
  const maxRevenue = Math.max(...sources.map((s) => s.revenue), 1);

  return (
    <Card>
      {title && <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>}
      {sources.length === 0 ? (
        <p className="text-xs text-gray-500">No source data yet.</p>
      ) : (
        <div className="space-y-2">
          {sources.slice(0, 8).map((s) => (
            <div key={s.source}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-gray-300">{s.source}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{s.visitors} visitors</span>
                  {s.revenue > 0 && <span className="font-medium text-emerald-400">₹{s.revenue}</span>}
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${(s.revenue / maxRevenue) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
