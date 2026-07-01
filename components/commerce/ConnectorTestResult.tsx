"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Props {
  result: { success: boolean; message: string; details?: Record<string, unknown> } | null;
  loading: boolean;
  connectorName: string;
}

export function ConnectorTestResult({ result, loading, connectorName }: Props) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-4 w-32 rounded bg-white/10" />
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card className={result.success ? "border-emerald-500/20" : "border-red-500/20"}>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={result.success ? "success" : "danger"}>
          {result.success ? "Connected" : "Failed"}
        </Badge>
        <span className="text-xs text-gray-400">{connectorName} test</span>
      </div>
      <p className="text-xs text-gray-300">{result.message}</p>
      {result.details && (
        <pre className="mt-2 rounded bg-black/20 p-2 text-[10px] text-gray-400 overflow-auto max-h-32">
          {JSON.stringify(result.details, null, 2)}
        </pre>
      )}
    </Card>
  );
}
