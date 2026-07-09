"use client";

import { Card } from "@/components/ui/Card";
import type { UpgradeBundle } from "@/types/product";

interface Props {
  bundle: UpgradeBundle;
  budget: number;
}

export function UpgradeBundleCard({ bundle, budget }: Props) {
  const roiColor = bundle.statusRoiScore >= 70 ? "emerald" : bundle.statusRoiScore >= 45 ? "amber" : "red";

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Your Upgrade Bundle</h3>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3 text-center">
          <div className="text-xs text-gray-500">Budget</div>
          <div className="text-sm font-medium text-amber-400">₹{budget.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3 text-center">
          <div className="text-xs text-gray-500">Estimated Cost</div>
          <div className="text-sm font-medium text-white">₹{bundle.totalEstimatedCost.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3 text-center">
          <div className="text-xs text-gray-500">Recommendations</div>
          <div className="text-sm font-medium text-white">{bundle.products.length}</div>
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3 text-center">
          <div className="text-xs text-gray-500">Status ROI Score</div>
          <div className={`text-sm font-medium text-${roiColor}-400`}>{bundle.statusRoiScore}/100</div>
        </div>
      </div>

      <p className="mb-4 text-xs text-gray-400">{bundle.expectedUpgradeText}</p>

      {bundle.freeActions.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-xs text-emerald-400">Free Actions — Do Now</div>
          <div className="space-y-1.5">
            {bundle.freeActions.map((a) => (
              <div key={a} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {a}
              </div>
            ))}
          </div>
        </div>
      )}

      {bundle.avoidForNow.length > 0 && (
        <div>
          <div className="mb-2 text-xs text-red-400">Avoid For Now</div>
          <div className="space-y-1.5">
            {bundle.avoidForNow.map((a) => (
              <div key={a} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="mt-0.5 shrink-0 text-red-400">&#10005;</span>
                {a}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-lg bg-white/[0.02] p-3 text-xs text-gray-600">
        Recommendations are presentation guidance only. AuraCheck does not guarantee social, dating, career, or financial outcomes.
        Prices and links are placeholders in this local MVP. Verify details before buying.
      </div>
    </Card>
  );
}
