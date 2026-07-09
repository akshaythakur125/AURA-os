"use client";

import type { DominantColor } from "@/types/colorAnalysis";
import { Card } from "@/components/ui/Card";

interface Props {
  dominantColors: DominantColor[];
  recommendedPalette: string[];
  paletteType: string;
}

export function ColorPaletteCard({ dominantColors, recommendedPalette, paletteType }: Props) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Visual Palette</h3>
      <p className="mb-3 text-[10px] text-gray-500">Type: {paletteType.replace(/_/g, " ")}</p>

      {/* Current colors */}
      <div className="mb-3">
        <div className="mb-1 text-[10px] text-gray-500 font-medium">Current dominant colors</div>
        <div className="flex flex-wrap gap-2">
          {dominantColors.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1">
              <span
                className="inline-block h-4 w-4 rounded-full border border-white/10"
                style={{ backgroundColor: c.hex }}
              />
              <div>
                <div className="text-[10px] text-gray-300">{c.label}</div>
                <div className="text-[8px] text-gray-500">{c.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended palette */}
      <div>
        <div className="mb-1 text-[10px] text-gray-500 font-medium">Recommended palette</div>
        <div className="flex flex-wrap gap-1.5">
          {recommendedPalette.map((color, i) => (
            <span key={i} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-gray-300">
              {color}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
