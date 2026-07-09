"use client";

import type { DealAlert } from "@/types/wishlist";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { markAlertRead } from "@/lib/commerce/deals/dealAlertEngine";

interface Props {
  alert: DealAlert;
  onRead?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  price_drop: "Price Drop",
  target_price_hit: "Target Reached",
  strong_discount: "Strong Discount",
  stale_price_warning: "Stale Price",
  back_in_stock: "Back in Stock",
  better_store_found: "Better Store",
};

const SEVERITY_VARIANTS: Record<string, "success" | "danger" | "warning" | "default"> = {
  high: "success",
  medium: "warning",
  low: "default",
};

export function DealAlertCard({ alert, onRead }: Props) {
  function handleClick() {
    if (!alert.isRead) {
      markAlertRead(alert.id);
      onRead?.();
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-colors hover:border-purple-500/30 ${!alert.isRead ? "border-purple-500/20 bg-purple-500/[0.02]" : ""}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={SEVERITY_VARIANTS[alert.severity] || "default"} className="text-[9px]">
              {TYPE_LABELS[alert.alertType] || alert.alertType}
            </Badge>
            {!alert.isRead && <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />}
          </div>
          <p className="text-xs text-gray-300">{alert.message}</p>
          <div className="mt-1 flex items-center gap-2 text-[9px] text-gray-500">
            <span>{new Date(alert.createdAt).toLocaleString("en-IN")}</span>
            {alert.oldPrice !== undefined && (
              <span>Was: ₹{alert.oldPrice}</span>
            )}
            {alert.newPrice !== undefined && (
              <span>Now: ₹{alert.newPrice}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
