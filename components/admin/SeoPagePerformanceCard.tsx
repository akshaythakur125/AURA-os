"use client";

import { Card } from "@/components/ui/Card";
import type { SeoFunnel } from "@/types/funnel";

interface Props {
  seoFunnel: SeoFunnel;
}

export function SeoPagePerformanceCard({ seoFunnel }: Props) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">SEO Page Performance</h3>
      <div className="grid grid-cols-5 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{seoFunnel.seoPageViews}</div>
          <div className="text-[9px] text-gray-500">Page Views</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">{seoFunnel.ctaClicks}</div>
          <div className="text-[9px] text-gray-500">CTA Clicks</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-400">{seoFunnel.auditStarts}</div>
          <div className="text-[9px] text-gray-500">Audit Starts</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{seoFunnel.wardrobeSearches}</div>
          <div className="text-[9px] text-gray-500">Searches</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-400">{seoFunnel.commerceClickouts}</div>
          <div className="text-[9px] text-gray-500">Clickouts</div>
        </div>
      </div>
    </Card>
  );
}
