"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { LaunchCheck } from "@/types/launch";

interface Props {
  checks: LaunchCheck[];
  title?: string;
}

const STATUS_VARIANTS: Record<string, "success" | "danger" | "warning" | "default"> = {
  pass: "success",
  fail: "danger",
  warning: "warning",
  manual: "default",
};

export function EnvironmentStatusTable({ checks, title }: Props) {
  return (
    <Card>
      {title && <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>}
      <div className="space-y-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5 text-[10px]">
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANTS[c.status] || "default"} className="text-[8px]">{c.status}</Badge>
              <span className="text-gray-300">{c.name}</span>
            </div>
            <span className="text-gray-500 max-w-[300px] truncate text-right">{c.message}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
