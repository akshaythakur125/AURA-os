"use client";

import { Card } from "@/components/ui/Card";
import type { CommerceFunnel } from "@/types/funnel";

interface Props {
  commerceFunnel: CommerceFunnel;
}

export function CommerceIntentPanel({ commerceFunnel }: Props) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Commerce Intent Funnel</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <div className="text-lg font-bold text-white">{commerceFunnel.wardrobePageViews}</div>
          <div className="text-[9px] text-gray-500">Wardrobe Views</div>
        </div>
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <div className="text-lg font-bold text-purple-400">{commerceFunnel.affiliateClickouts}</div>
          <div className="text-[9px] text-gray-500">Clickouts</div>
        </div>
        <div className="rounded-lg bg-white/5 p-2 text-center">
          <div className="text-lg font-bold text-emerald-400">{commerceFunnel.savedProducts}</div>
          <div className="text-[9px] text-gray-500">Saved Products</div>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-gray-500">
        Est. affiliate revenue: ₹{commerceFunnel.estimatedAffiliateRevenue} (5% est.)
      </div>
    </Card>
  );
}
