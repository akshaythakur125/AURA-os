"use client";

import { useState } from "react";
import { runLocalVisionAnalysis, type LocalVisionResult } from "@/lib/aura-engine/localVision";

const DIMS: { key: keyof LocalVisionResult["scores"]; label: string }[] = [
  { key: "lighting", label: "Lighting" },
  { key: "expression", label: "Expression" },
  { key: "background", label: "Background" },
  { key: "outfit", label: "Outfit" },
  { key: "grooming", label: "Grooming" },
];

const SEV_STYLE: Record<string, string> = {
  positive: "border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-700",
  suggestion: "border-amber-500/20 bg-amber-500/[0.05] text-[#4a443d]",
  warning: "border-[#E14434]/20 bg-[#E14434]/[0.05] text-[#B23A25]",
};

/**
 * Opt-in AI photo read — runs the in-browser CLIP model on the user's photo and
 * shows what it actually "sees" (outfit, grooming, expression, lighting,
 * background) as a semantic layer on top of the pixel metrics. Button-triggered
 * so the model only downloads for people who ask for it.
 */
export function AiPhotoReadCard({ imageDataUrl }: { imageDataUrl?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "unavailable">("idle");
  const [result, setResult] = useState<LocalVisionResult | null>(null);

  if (!imageDataUrl) return null;

  const run = async () => {
    setState("loading");
    try {
      const r = await runLocalVisionAnalysis(imageDataUrl);
      if (!r) { setState("unavailable"); return; }
      setResult(r);
      setState("done");
    } catch {
      setState("unavailable");
    }
  };

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#1C1917]">🤖 AI photo read</h3>
          <p className="mt-0.5 text-xs text-[#6f675e]">An on-device vision model reads your actual photo — outfit, grooming, expression, lighting, background.</p>
        </div>
      </div>

      {state === "idle" && (
        <button onClick={run} className="mt-3 w-full rounded-xl bg-[#1C1917] px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5">
          Run the AI read
        </button>
      )}
      {state === "loading" && (
        <p className="mt-3 rounded-xl border border-[#1c1917]/[0.08] bg-[#fbf8f2]/60 px-4 py-2.5 text-center text-xs text-[#857b6e]">Reading your photo… (first run loads the AI model once, then it&apos;s cached)</p>
      )}
      {state === "unavailable" && (
        <p className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-2.5 text-xs text-[#4a443d]">The on-device AI model couldn&apos;t load in this browser — your pixel-based scores above still cover the technical read.</p>
      )}

      {state === "done" && result && (
        <div className="mt-4">
          <div className="space-y-2.5">
            {DIMS.map((d) => {
              const v = result.scores[d.key];
              return (
                <div key={d.key}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-[#1C1917]">{d.label}</span>
                    <span className="font-mono text-xs font-bold text-[#1C1917]">{v}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded bg-[#F2ECE1]">
                    <div className="h-full rounded bg-[#E14434]" style={{ width: `${v}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {result.observations.length > 0 && (
            <div className="mt-4 space-y-2">
              {result.observations.slice(0, 5).map((o, i) => (
                <div key={i} className={`rounded-lg border p-2.5 ${SEV_STYLE[o.severity] || SEV_STYLE.suggestion}`}>
                  <p className="text-[11px] font-semibold">{o.title}</p>
                  <p className="mt-0.5 text-[11px] text-[#4a443d]">{o.suggestion}</p>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[10px] text-[#9c9184]">Ran entirely in your browser — your photo was never uploaded.</p>
        </div>
      )}
    </div>
  );
}
