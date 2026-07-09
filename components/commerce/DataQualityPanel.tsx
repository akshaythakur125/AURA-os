"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DataQualitySummary, DataQualityWarning } from "@/types/dataQuality";

interface Props {
  summary: DataQualitySummary;
  onExport?: () => void;
  onRebuildIndex?: () => void;
}

export function DataQualityPanel({ summary, onExport, onRebuildIndex }: Props) {
  const severityCount = (severity: string) =>
    summary.warnings.filter((w) => w.severity === severity).length;

  return (
    <div className="space-y-4">
      {/* Metric cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Total Indexed" value={summary.totalIndexed} color="text-white" />
        <MetricCard label="Active Products" value={summary.activeProducts} color="text-emerald-400" />
        <MetricCard label="Inactive Products" value={summary.inactiveProducts} color="text-gray-400" />
        <MetricCard label="Low Confidence" value={summary.lowConfidenceProducts} color="text-red-400" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <IssueCard label="Stale Prices" value={summary.stalePrices} severity={summary.stalePrices > 10 ? "error" : "warning"} />
        <IssueCard label="Manual Prices" value={summary.manualPrices} severity="info" />
        <IssueCard label="Unknown Prices" value={summary.unknownPrices} severity={summary.unknownPrices > 5 ? "warning" : "info"} />
        <IssueCard label="Suspicious Discounts" value={summary.suspiciousDiscounts} severity={summary.suspiciousDiscounts > 0 ? "error" : "info"} />
        <IssueCard label="Invalid URLs" value={summary.invalidUrls} severity={summary.invalidUrls > 0 ? "error" : "info"} />
        <IssueCard label="Missing Affiliate" value={summary.missingAffiliateLinks} severity="info" />
        <IssueCard label="Missing Images" value={summary.missingImages} severity={summary.missingImages > 10 ? "warning" : "info"} />
        <IssueCard label="Duplicates" value={summary.duplicateProducts} severity={summary.duplicateProducts > 0 ? "warning" : "info"} />
        <IssueCard label="High Click + Stale" value={summary.highClickStalePrices} severity={summary.highClickStalePrices > 0 ? "error" : "info"} />
      </div>

      {/* Warning severity summary */}
      <Card>
        <h4 className="mb-2 text-xs font-semibold text-gray-400">Warning Severity Breakdown</h4>
        <div className="flex gap-3 text-xs">
          <span className="text-red-400">🔴 Errors: {severityCount("error")}</span>
          <span className="text-amber-400">🟡 Warnings: {severityCount("warning")}</span>
          <span className="text-blue-400">🔵 Info: {severityCount("info")}</span>
        </div>
      </Card>

      {/* Recent warnings */}
      {summary.warnings.length > 0 && (
        <Card>
          <h4 className="mb-3 text-xs font-semibold text-gray-400">Recent Warnings ({summary.warnings.length})</h4>
          <div className="max-h-48 space-y-1 overflow-auto">
            {summary.warnings.slice(0, 30).map((w, i) => (
              <WarningRow key={i} warning={w} />
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onExport && (
          <Button size="sm" variant="outline" onClick={onExport}>
            Export Quality Report CSV
          </Button>
        )}
        {onRebuildIndex && (
          <Button size="sm" variant="outline" onClick={onRebuildIndex}>
            Rebuild Index
          </Button>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </Card>
  );
}

function IssueCard({ label, value, severity }: { label: string; value: number; severity: "error" | "warning" | "info" }) {
  const colors = { error: "text-red-400", warning: "text-amber-400", info: "text-gray-400" };
  return (
    <div className={`rounded-lg bg-white/5 p-3 ${value > 0 ? "border border-white/10" : ""}`}>
      <div className={`text-lg font-bold ${colors[severity]}`}>{value}</div>
      <div className="text-[10px] text-gray-500">{label}</div>
    </div>
  );
}

function WarningRow({ warning }: { warning: DataQualityWarning }) {
  const severityColors: Record<string, string> = {
    error: "border-l-red-500 bg-red-500/5",
    warning: "border-l-amber-500 bg-amber-500/5",
    info: "border-l-blue-500 bg-blue-500/5",
  };

  return (
    <div className={`border-l-2 px-2 py-1 text-[10px] ${severityColors[warning.severity] || "border-l-gray-500"}`}>
      <div className="flex items-start justify-between">
        <span className="text-gray-300">{warning.message}</span>
        <Badge variant={warning.severity === "error" ? "danger" : warning.severity === "warning" ? "default" : "default"} className="ml-2 text-[8px]">
          {warning.warningType}
        </Badge>
      </div>
      <div className="text-gray-600">Product: {warning.productId.slice(0, 24)}...</div>
    </div>
  );
}
