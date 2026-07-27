"use client";

import { Card } from "@/components/ui/Card";
import { generateEditRecipe } from "@/lib/aura-engine/editRecipe";

interface Metrics {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  imageDullness: number;
  colorHarmony: number;
  dominantHue: string;
  faceBrightness: number;
  backgroundBrightness: number;
}

/**
 * "Which filter + how to edit" — the best-fit Instagram filter for this exact
 * photo, plus an ordered manual-slider recipe. Every pick is derived from the
 * measured colour/light, so it corrects a real gap rather than guessing.
 */
export function EditRecipeCard({ metrics }: { metrics: Metrics }) {
  const r = generateEditRecipe(metrics);
  const skip = r.filter.strength === 0;

  return (
    <Card className="mb-6">
      <h3 className="mb-1 text-sm font-semibold text-[#1C1917]">🎚️ Which filter &amp; how to edit</h3>
      <p className="mb-4 text-xs text-[#857b6e]">
        Picked from your photo&apos;s measured colour &amp; light — a filter that fixes a real gap, then the exact sliders to fine-tune.
      </p>

      {/* Best-fit filter */}
      <div className="rounded-2xl border border-[#E14434]/20 bg-gradient-to-br from-[#E14434]/[0.07] to-transparent p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#B23A25]">Best filter</span>
          <span className="text-base font-bold text-[#1C1917]">{r.filter.name}</span>
          {!skip && (
            <span className="rounded-full bg-[#1C1917] px-2 py-0.5 text-[10px] font-semibold text-white">at ~{r.filter.strength}%</span>
          )}
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#4a443d]">{r.filter.why}</p>
        {r.altFilter && (
          <p className="mt-2 text-[11px] text-[#857b6e]">
            <span className="font-medium text-[#6f675e]">Alternative:</span> {r.altFilter.name} — {r.altFilter.why}
          </p>
        )}
      </div>

      {/* Manual slider recipe */}
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#857b6e]">
          Then fine-tune (in order)
        </p>
        <ol className="space-y-2">
          {r.steps.map((s, i) => (
            <li key={s.tool + i} className="flex items-start gap-3 rounded-xl border border-[#1c1917]/[0.07] bg-[#fbf8f2]/70 p-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1c1917]/70 text-[10px] font-bold text-white">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-semibold text-[#1C1917]">{s.tool}</span>
                  <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">{s.amount}</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-[#6f675e]">{s.why}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#4a443d]">{r.summary}</p>
      {r.caution && (
        <p className="mt-2 rounded-lg border border-amber-400/25 bg-amber-500/[0.06] px-3 py-2 text-[11px] leading-relaxed text-[#7a5b1e]">
          {r.caution}
        </p>
      )}
    </Card>
  );
}
