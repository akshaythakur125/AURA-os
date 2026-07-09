"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Props {
  styleDirection: string;
  recommendedCategories: string[];
  avoidCategories: string[];
  recommendedColors: string[];
}

export function StyleDirectionCard({ styleDirection, recommendedCategories, avoidCategories, recommendedColors }: Props) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Recommended Style Direction</h3>
      <div className="mb-3">
        <Badge variant="premium" className="text-xs">{styleDirection.replace(/_/g, " ")}</Badge>
      </div>
      <div className="mb-3">
        <div className="mb-1 text-[10px] text-gray-500 font-medium">Focus on these categories</div>
        <div className="flex flex-wrap gap-1">
          {recommendedCategories.map((c) => (
            <span key={c} className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-300">{c}</span>
          ))}
        </div>
      </div>
      {avoidCategories.length > 0 && (
        <div>
          <div className="mb-1 text-[10px] text-gray-500 font-medium">Avoid for now</div>
          <div className="flex flex-wrap gap-1">
            {avoidCategories.map((c) => (
              <span key={c} className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">{c}</span>
            ))}
          </div>
        </div>
      )}
      {recommendedColors.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 text-[10px] text-gray-500 font-medium">Colors to use</div>
          <div className="flex flex-wrap gap-1">
            {recommendedColors.map((c, i) => (
              <span key={i} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-300">{c}</span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
