"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ConnectorStatus {
  connectorKey: string;
  displayName: string;
  sourceType: string;
  isConfigured: boolean;
  isActive: boolean;
  lastImportAt: string | null;
  lastImportCount: number | null;
  indexedProductCount: number;
  supportsLiveApi: boolean;
  supportsFeedImport: boolean;
  supportsAffiliateLinks: boolean;
  notes: string;
}

export function ConnectorStatusCard({ connector }: { connector: ConnectorStatus }) {
  return (
    <Card className="group transition-colors hover:border-white/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white">{connector.displayName}</h4>
            {connector.isConfigured ? (
              <Badge variant="success" className="text-[10px]">Configured</Badge>
            ) : (
              <Badge variant="default" className="text-[10px] bg-gray-500/20">Not Configured</Badge>
            )}
          </div>
          <p className="mt-0.5 text-[10px] text-gray-500">{connector.sourceType.replace(/_/g, " ")}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{connector.indexedProductCount}</div>
          <div className="text-[10px] text-gray-500">indexed</div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {connector.supportsLiveApi && (
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">Live API</span>
        )}
        {connector.supportsFeedImport && (
          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">Feed Import</span>
        )}
        {connector.supportsAffiliateLinks && (
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">Affiliate</span>
        )}
      </div>

      {/* Last import */}
      {connector.lastImportAt && (
        <div className="mt-2 text-[10px] text-gray-500">
          Last import: {new Date(connector.lastImportAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
          })}
          {connector.lastImportCount !== null && ` (${connector.lastImportCount} products)`}
        </div>
      )}

      {/* Notes */}
      <p className="mt-2 text-[10px] text-gray-600">{connector.notes}</p>
    </Card>
  );
}

// Loading skeleton
export function ConnectorStatusCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="mb-3 h-5 w-32 rounded bg-white/10" />
      <div className="mb-2 h-3 w-48 rounded bg-white/5" />
      <div className="h-3 w-64 rounded bg-white/5" />
    </Card>
  );
}
