"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateEditRecipe } from "@/lib/aura-engine/editRecipe";
import { buildLightroomXmp, presetValues } from "@/lib/share/lightroomPreset";
import { downloadTextFile } from "@/lib/share/download";

interface Metrics {
  brightness: number; contrast: number; saturation: number; sharpness: number;
  imageDullness: number; colorHarmony: number; dominantHue: string;
  faceBrightness: number; backgroundBrightness: number;
}

/**
 * Pro perk (inside the ₹21 report): a real, importable Lightroom preset built
 * from THIS photo's measured edit recipe — not a generic filter, the exact
 * corrections the analysis called for. A tangible thing the buyer owns and can
 * one-tap onto every future photo in the free Lightroom mobile app.
 */
export function PresetDownloadCard({ metrics }: { metrics: Metrics }) {
  const [saved, setSaved] = useState(false);
  const { recipe, values } = useMemo(() => {
    const recipe = generateEditRecipe(metrics);
    return { recipe, values: presetValues(recipe) };
  }, [metrics]);

  const chips: { label: string; val: string }[] = [
    { label: "Exposure", val: (values.exposure >= 0 ? "+" : "") + values.exposure.toFixed(2) },
    { label: "Contrast", val: fmt(values.contrast) },
    { label: "Highlights", val: fmt(values.highlights) },
    { label: "Shadows", val: fmt(values.shadows) },
    { label: "Warmth", val: fmt(values.temperature) },
    { label: "Vibrance", val: fmt(values.vibrance) },
    { label: "Clarity", val: fmt(values.clarity) },
  ].filter((c) => c.val !== "0" && c.val !== "+0");

  const download = () => {
    downloadTextFile(buildLightroomXmp(recipe), "auracheck-your-glow.xmp", "application/rdf+xml");
    setSaved(true);
  };

  return (
    <Card className="mb-6">
      <h3 className="mb-1 text-sm font-semibold text-[#1C1917]">🎞️ Your one-tap Lightroom preset</h3>
      <p className="mb-4 text-xs text-[#857b6e]">
        A real preset built from <span className="font-medium text-[#4a443d]">your</span> photo&apos;s numbers — the exact edit the analysis found, ready to one-tap onto every future photo.
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span key={c.label} className="rounded-full border border-[#1c1917]/10 bg-[#fbf8f2]/70 px-2.5 py-1 text-[11px] font-medium text-[#4a443d]">
            {c.label} <span className="font-bold text-[#1C1917]">{c.val}</span>
          </span>
        ))}
        {chips.length === 0 && (
          <span className="text-[11px] text-[#857b6e]">Your photo is already balanced — the preset applies a light, natural polish.</span>
        )}
      </div>

      <Button onClick={download} className="w-full">Download preset (.xmp)</Button>
      {saved && <p className="mt-2 text-xs text-emerald-600">Saved. Import it in Lightroom below 👇</p>}

      <div className="mt-4 rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-3.5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#857b6e]">How to use it (free app)</p>
        <ol className="space-y-1 text-[11px] leading-relaxed text-[#4a443d]">
          <li>1. Install <span className="font-medium text-[#1C1917]">Adobe Lightroom</span> (free) on your phone.</li>
          <li>2. Lightroom → <span className="font-medium">Presets → ⋯ → Import Presets</span> → pick this <span className="font-mono text-[10px]">.xmp</span>.</li>
          <li>3. Open your photo → <span className="font-medium">Presets → AuraCheck → Your Glow</span> → done.</li>
        </ol>
      </div>
    </Card>
  );
}

function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
