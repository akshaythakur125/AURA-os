"use client";

import { useEffect, useRef } from "react";
import { generatePhotoRead, type PhotoMetricsLike, type FaceReadLike } from "@/lib/aura-engine/photoRead";

/**
 * "Your photo, read like a stranger would" — the premium, specific, visual read.
 * Draws the person's actual photo with a framing grid and marks the shadow side
 * when lighting is uneven, then lists the exact, measured findings (biggest
 * impact first) with the fix, plus the strengths worth keeping. Every line is
 * grounded in their own image, which is what makes it feel worth paying for.
 */
export function PhotoReadCard({ imageDataUrl, metrics, face }: { imageDataUrl?: string; metrics: PhotoMetricsLike; face?: FaceReadLike }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const read = generatePhotoRead(metrics, face);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !imageDataUrl) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      const W = (cv.width = cv.clientWidth * 2);
      const H = (cv.height = (cv.clientWidth * 2 * img.height) / img.width);
      ctx.drawImage(img, 0, 0, W, H);

      // Rule-of-thirds grid — where the eyes should sit (upper third).
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo((W / 3) * i, 0); ctx.lineTo((W / 3) * i, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, (H / 3) * i); ctx.lineTo(W, (H / 3) * i); ctx.stroke();
      }

      // Mark the shadow side when the light is clearly one-directional.
      const dir = metrics.lightingDirection;
      const lit = (metrics.lightingScore ?? 60) < 58;
      if (lit && (dir === "left" || dir === "right")) {
        const shadowLeft = dir === "right"; // light from right → left is shadow
        const g = ctx.createLinearGradient(shadowLeft ? 0 : W, 0, shadowLeft ? W * 0.55 : W * 0.45, 0);
        g.addColorStop(0, "rgba(20,14,11,0.45)"); g.addColorStop(1, "rgba(20,14,11,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = `${Math.round(W * 0.035)}px sans-serif`;
        ctx.fillText("shadow side", shadowLeft ? W * 0.04 : W * 0.66, H * 0.5);
      }
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, metrics]);

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5">
      <h3 className="text-sm font-bold text-[#1C1917]">👁️ Your photo, read like a stranger would</h3>
      <p className="mt-0.5 text-xs text-[#6f675e]">Every line below is measured off your actual photo — not a template.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,180px)_1fr]">
        {imageDataUrl && (
          <div className="overflow-hidden rounded-xl border border-[#1c1917]/[0.08]">
            <canvas ref={canvasRef} className="block w-full" />
          </div>
        )}
        <div>
          <div className="rounded-xl border border-[#E14434]/20 bg-[#E14434]/[0.06] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#B23A25]">Start here</p>
            <p className="text-sm font-semibold text-[#1C1917]">{read.headline}</p>
          </div>
          {read.strengths.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {read.strengths.slice(0, 4).map((s) => (
                <span key={s.title} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">✓ {s.title}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {read.fixes.slice(0, 6).map((f) => (
          <div key={f.title} className="rounded-xl border border-[#1c1917]/[0.08] bg-white/60 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-semibold text-[#1C1917]">{f.title}</p>
              <span className="shrink-0 font-mono text-[10px] text-[#857b6e]">+{Math.round(f.impact / 10)} pts</span>
            </div>
            <p className="mt-0.5 text-xs text-[#4a443d]">{f.detail}</p>
            {f.fix && <p className="mt-1 text-xs text-[#B23A25]">→ {f.fix}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
