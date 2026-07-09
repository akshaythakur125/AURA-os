"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ConnectorStatusData {
  key: string;
  displayName: string;
  provider: string;
  sourceType: string;
  isConfigured: boolean;
  supportsTest: boolean;
  supportsRefresh: boolean;
  supportsPriceRefresh: boolean;
  supportsProductImport: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
  missingEnvVars: string[];
  publicNotes: string;
}

interface Props {
  connector: ConnectorStatusData;
  onTest?: (key: string) => void;
  onRefresh?: (key: string) => void;
  onViewDocs?: (key: string) => void;
  testing?: boolean;
  refreshing?: boolean;
}

export function ConnectorSetupCard({ connector, onTest, onRefresh, onViewDocs, testing, refreshing }: Props) {
  const capBadge = (label: string) => (
    <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] text-gray-500">{label}</span>
  );

  return (
    <Card className={`transition-colors ${connector.isConfigured ? "border-emerald-500/20" : "border-amber-500/10"}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white">{connector.displayName}</h4>
            {connector.isConfigured ? (
              <Badge variant="success" className="text-[10px]">Configured</Badge>
            ) : (
              <Badge variant="default" className="text-[10px] bg-amber-500/20 text-amber-300">Not Configured</Badge>
            )}
          </div>
          <div className="mt-0.5 text-[10px] text-gray-500">{connector.provider} · {connector.sourceType}</div>
        </div>
        {connector.lastRunAt && (
          <div className="text-right text-[9px] text-gray-500">
            Last: {new Date(connector.lastRunAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            <div className={`text-[10px] font-medium ${connector.lastStatus === "success" ? "text-emerald-400" : connector.lastStatus === "failed" ? "text-red-400" : "text-amber-400"}`}>
              {connector.lastStatus}
            </div>
          </div>
        )}
      </div>

      {/* Capabilities */}
      <div className="mt-2 flex flex-wrap gap-1">
        {connector.supportsTest && capBadge("Test")}
        {connector.supportsRefresh && capBadge("Refresh")}
        {connector.supportsPriceRefresh && capBadge("Price Check")}
        {connector.supportsProductImport && capBadge("Product Import")}
      </div>

      {/* Missing env vars */}
      {connector.missingEnvVars.length > 0 && (
        <div className="mt-2">
          <p className="text-[9px] text-amber-400/80 font-medium">Missing environment variables:</p>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {connector.missingEnvVars.map((v) => (
              <code key={v} className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-300">{v}</code>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <p className="mt-2 text-[9px] text-gray-600">{connector.publicNotes}</p>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {connector.supportsTest && (
          <Button size="sm" variant="outline" onClick={() => onTest?.(connector.key)} disabled={testing || !connector.isConfigured}>
            {testing ? "Testing..." : "Test"}
          </Button>
        )}
        {connector.supportsRefresh && (
          <Button size="sm" variant="outline" onClick={() => onRefresh?.(connector.key)} disabled={refreshing || !connector.isConfigured}>
            {refreshing ? "Refreshing..." : "Run Refresh"}
          </Button>
        )}
        {onViewDocs && (
          <Button size="sm" variant="ghost" onClick={() => onViewDocs(connector.key)}>Docs</Button>
        )}
      </div>
    </Card>
  );
}
