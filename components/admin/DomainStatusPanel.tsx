"use client";

import { EnvironmentStatusTable } from "./EnvironmentStatusTable";
import type { DeploymentCheck } from "@/types/deployment";

interface Props {
  checks: DeploymentCheck[];
  domain: string;
  configured: boolean;
}

export function DomainStatusPanel({ checks, domain, configured }: Props) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-white">Domain: {domain}</h3>
        {configured ? (
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">Connected</span>
        ) : (
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">Not connected</span>
        )}
      </div>
      <EnvironmentStatusTable checks={checks as React.ComponentProps<typeof EnvironmentStatusTable>["checks"]} />
    </div>
  );
}
