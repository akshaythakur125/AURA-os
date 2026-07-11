"use client";

import { FadeInView } from "@/components/ui/FadeInView";

interface SmartInsightsProps {
  grooming?: {
    overallScore: number;
    assessment: string;
    topFix: string;
  };
  style?: {
    detectedStyle: string;
    confidence: number;
    reasoning: string;
  };
  colorPalette?: {
    name: string;
    colors: string[];
    reasoning: string;
  };
}

/**
 * Compact smart insights from the 5 engines.
 * Surfaces grooming, style detection, and color palette in the free report.
 */
export function SmartInsights({ grooming, style, colorPalette }: SmartInsightsProps) {
  const hasData = grooming || style || colorPalette;
  if (!hasData) return null;

  return (
    <FadeInView delay={150}>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm">🧠</span>
          <span className="text-xs font-semibold text-white">Smart Insights</span>
          <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] text-purple-300">AI-powered</span>
        </div>

        <div className="space-y-3">
          {grooming && grooming.overallScore > 0 && (
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-sm">
                ✂️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-white">Grooming</span>
                  <span className={`text-[10px] font-bold ${grooming.overallScore >= 70 ? 'text-emerald-400' : grooming.overallScore >= 45 ? 'text-amber-400' : 'text-red-400'}`}>
                    {grooming.overallScore}/100
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">{grooming.assessment}</p>
              </div>
            </div>
          )}

          {style && style.confidence > 40 && (
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-sm">
                👔
              </div>
              <div>
                <span className="text-[11px] font-medium text-white capitalize">{style.detectedStyle} style</span>
                <p className="text-[10px] text-gray-500">{style.reasoning}</p>
              </div>
            </div>
          )}

          {colorPalette && colorPalette.colors.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-sm">
                🎨
              </div>
              <div>
                <span className="text-[11px] font-medium text-white">{colorPalette.name}</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {colorPalette.colors.slice(0, 5).map((c) => (
                    <span key={c} className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[9px] text-gray-400 capitalize">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </FadeInView>
  );
}
