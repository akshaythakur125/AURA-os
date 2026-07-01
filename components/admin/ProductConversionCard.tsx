"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ProductFunnel } from "@/types/funnel";

interface Props {
  funnels: ProductFunnel[];
}

const PRODUCT_LABELS: Record<string, string> = {
  quick_fix: "Quick Fix (₹49)",
  aura_report: "Aura Report (₹99)",
  dating_audit: "Dating Audit (₹299)",
  glowup_plan: "Glow-Up Plan (₹499)",
};

export function ProductConversionCard({ funnels }: Props) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Product Funnels</h3>
      <div className="space-y-3">
        {funnels.map((f) => (
          <div key={f.productType} className="rounded-lg bg-white/5 p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-white">{PRODUCT_LABELS[f.productType] || f.productType}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">₹{f.revenue}</span>
                <Badge variant={f.conversionRate > 10 ? "success" : f.conversionRate > 5 ? "warning" : "default"} className="text-[9px]">
                  {f.conversionRate}%
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-500">
              <div><span className="text-gray-400">{f.paywallViews}</span> views</div>
              <div><span className="text-gray-400">{f.unlockStarts}</span> starts</div>
              <div><span className="text-gray-400">{f.paymentSuccess}</span> paid</div>
              <div><span className="text-gray-400">{f.unlocks}</span> unlocks</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
