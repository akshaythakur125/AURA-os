"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PriceFreshnessBadge } from "@/components/commerce/PriceFreshnessBadge";
import type { DataQualityWarning } from "@/types/dataQuality";
import type { CommerceSearchItem } from "@/types/commerceSearch";

interface Props {
  items: Array<{
    item: CommerceSearchItem;
    warnings: DataQualityWarning[];
  }>;
}

export function PriceAnomalyWarnings({ items }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <div className="py-8 text-center text-sm text-gray-500">No anomalies detected. All prices look good.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Anomalies ({items.length})</h3>
      </div>
      {items.slice(0, 50).map(({ item, warnings }) => (
        <Card key={item.id} className="border-red-500/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{item.originalTitle}</span>
                <PriceFreshnessBadge status={item.priceFreshness} />
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span>{item.storeName}</span>
                <span>₹{item.price}</span>
                {item.mrp && <span className="text-gray-500 line-through">₹{item.mrp}</span>}
                {item.discountPercent && <span className="text-emerald-400">-{item.discountPercent}%</span>}
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              Score: {item.confidenceScore}
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {warnings.map((w, i) => (
              <WarningDetail key={i} warning={w} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function WarningDetail({ warning }: { warning: DataQualityWarning }) {
  const severityStyles: Record<string, string> = {
    error: "border-l-red-500 bg-red-500/5",
    warning: "border-l-amber-500 bg-amber-500/5",
    info: "border-l-blue-500 bg-blue-500/5",
  };

  return (
    <div className={`border-l-2 px-2 py-1 text-[10px] ${severityStyles[warning.severity] || "border-l-gray-500"}`}>
      <div className="flex items-center justify-between">
        <span className="text-gray-300">{warning.message}</span>
        <Badge variant={warning.severity === "error" ? "danger" : "default"} className="text-[8px]">
          {warning.warningType.replace(/_/g, " ")}
        </Badge>
      </div>
    </div>
  );
}
