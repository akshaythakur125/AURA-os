"use client";

import { Card } from "@/components/ui/Card";


interface Props {
  steps: { name: string; count: number; rate: number | null }[];
  title?: string;
}

export function FunnelChart({ steps, title }: Props) {
  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <Card>
      {title && <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-gray-300">{step.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-medium text-white">{step.count.toLocaleString()}</span>
                {step.rate !== null && (
                  <span className="w-12 text-right text-gray-500">{step.rate}%</span>
                )}
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-purple-500 transition-all"
                style={{ width: `${(step.count / maxCount) * 100}%` }}
              />
            </div>
            {i < steps.length - 1 && step.rate !== null && (
              <div className="mt-0.5 text-right text-[9px] text-gray-600">
                {step.rate}% conversion
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
