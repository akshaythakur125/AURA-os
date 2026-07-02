"use client";

import { Card } from "@/components/ui/Card";
import type { UpgradeBundle } from "@/types/product";
import { recordAffiliateClick } from "@/lib/storage/affiliateStore";
import { getProductExternalUrl } from "@/lib/utils/externalLinks";

export function UpgradeBundleCard({
  bundle,
  auditId,
}: {
  bundle: UpgradeBundle;
  auditId?: string;
}) {
  const budgetLabel: Record<string, string> = {
    "0": "₹0",
    "2000": "₹2,000",
    "5000": "₹5,000",
    "10000": "₹10,000",
    "25000": "₹25,000+",
  };

  return (
    <Card className="border-purple-500/20">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Your Upgrade Bundle</h3>
          <p className="text-xs text-gray-500">Budget: {budgetLabel[bundle.budgetRange] || bundle.budgetRange}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-amber-400">₹{bundle.totalEstimatedCost.toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-gray-600">estimated total</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-gray-500">Status ROI Score</span>
          <span className="text-purple-300">{bundle.statusRoiScore}/100</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
            style={{ width: `${bundle.statusRoiScore}%` }}
          />
        </div>
      </div>

      {bundle.products.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-xs text-gray-500">In this bundle ({bundle.products.length} items):</div>
          <ul className="space-y-1">
            {bundle.products.map((rec) => (
              <li key={rec.product.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span className="text-gray-300">{rec.product.title}</span>
                </div>
                <a
                  href={getProductExternalUrl(rec.product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    recordAffiliateClick({ productId: rec.product.id, auditId, source: "bundle" });
                  }}
                  className="text-purple-400 hover:underline"
                >
                  {rec.product.priceLabel}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bundle.freeActions.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-xs text-emerald-400">Free actions you can take right now:</div>
          <ul className="space-y-1">
            {bundle.freeActions.map((action) => (
              <li key={action} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="mt-1 h-1 w-1 rounded-full bg-emerald-400" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4 rounded-lg bg-white/5 p-3">
        <p className="text-xs text-gray-300">{bundle.expectedUpgradeText}</p>
      </div>

      {bundle.avoidForNow.length > 0 && (
        <div>
          <div className="mb-2 text-xs text-red-400">Avoid for now:</div>
          <ul className="space-y-1">
            {bundle.avoidForNow.map((advice) => (
              <li key={advice} className="flex items-start gap-2 text-xs text-gray-500">
                <svg className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {advice}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
