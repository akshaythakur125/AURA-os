"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { planAutoFix, applyPixels, computeCrop, type AutoFixMetrics } from "@/lib/photo/autoFix";

type AspectKey = "original" | "portrait" | "square";
const ASPECTS: { key: AspectKey; label: string; ratio: number | null; use: string }[] = [
  { key: "portrait", label: "4:5 Portrait", ratio: 4 / 5, use: "Instagram feed · Hinge · Bumble" },
  { key: "square", label: "1:1 Square", ratio: 1, use: "LinkedIn · profile pics · avatars" },
  { key: "original", label: "Original ratio", ratio: null, use: "keep the full frame" },
];

const CAPTION_FRAMES: { platform: string; frame: string }[] = [
  { platform: "Instagram", frame: "[where this was / what you were doing] — [one honest feeling]. 📍[your city]" },
  { platform: "Hinge / Bumble", frame: "Ask me about [the thing in this photo]. Fair warning: I won't stop." },
  { platform: "LinkedIn", frame: "[what you do] · [one thing you care about]. Open to [conversations / coffee / roles]." },
];

const MAX_OUT = 1080; // cap the exported edge for fast, share-friendly files

/**
 * Ready-to-Post Pack — applies the recommended correction to the user's actual
 * photo in-browser (brightness / contrast / warmth / saturation, from the same
 * measured signals the edit recipe explains) and reframes it to the right aspect
 * for where they're posting, then hands the improved image back to download.
 * Skips the editing app entirely. The photo never leaves the device.
 */
export function ReadyToPostPack({ imageDataUrl, metrics }: { imageDataUrl?: string; metrics: AutoFixMetrics }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aspect, setAspect] = useState<AspectKey>("portrait");
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const plan = useMemo(() => planAutoFix(metrics), [metrics]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !imageDataUrl) return;
    setReady(false);
    const img = new Image();
    img.onload = () => {
      const ratio = ASPECTS.find((a) => a.key === aspect)?.ratio ?? img.width / img.height;
      const crop = computeCrop(img.width, img.height, ratio, metrics.subjectCenterX ?? 0.5, metrics.subjectCenterY ?? 0.42);

      // Scale the export down to a share-friendly size.
      const scale = Math.min(1, MAX_OUT / Math.max(crop.sw, crop.sh));
      const outW = Math.max(1, Math.round(crop.sw * scale));
      const outH = Math.max(1, Math.round(crop.sh * scale));
      cv.width = outW; cv.height = outH;

      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, outW, outH);
      try {
        const id = ctx.getImageData(0, 0, outW, outH);
        applyPixels(id.data, plan);
        ctx.putImageData(id, 0, 0);
      } catch {
        // If the canvas is tainted for any reason, the un-corrected crop still shows.
      }
      setReady(true);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, aspect, plan, metrics.subjectCenterX, metrics.subjectCenterY]);

  function download() {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auracheck-ready-${aspect}.jpg`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.92);
  }

  async function copyFrame(text: string, platform: string) {
    try { await navigator.clipboard.writeText(text); setCopied(platform); setTimeout(() => setCopied(null), 1500); } catch { /* clipboard blocked */ }
  }

  if (!imageDataUrl) return null;

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Ready-to-Post Pack</p>
      <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">We fixed your photo — download and post</h3>
      <p className="mt-1 text-xs text-[#6f675e]">The recommended edit, applied to your actual photo and cropped for where you&apos;re posting. No editing app, no tutorials. Runs in your browser — the photo never leaves your device.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e]">Before</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageDataUrl} alt="Your original photo" className="w-full rounded-xl border border-[#1c1917]/[0.08] object-cover" />
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B23A25]">After — auto-fixed</p>
          <div className="overflow-hidden rounded-xl border border-[#E14434]/25">
            <canvas ref={canvasRef} className="block w-full" />
          </div>
        </div>
      </div>

      {/* What we fixed */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {plan.changes.map((c) => (
          <span key={c} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">✓ {c}</span>
        ))}
      </div>

      {/* Aspect / platform */}
      <div className="mt-4">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e]">Crop for your platform</p>
        <div className="flex flex-wrap gap-1.5">
          {ASPECTS.map((a) => (
            <button
              key={a.key}
              onClick={() => setAspect(a.key)}
              title={a.use}
              className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all ${aspect === a.key ? "border-[#E14434]/50 bg-[#E14434]/[0.08] text-[#B23A25]" : "border-[#1c1917]/10 bg-[#1c1917]/[0.02] text-[#1C1917] hover:border-[#1c1917]/20"}`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-[#857b6e]">{ASPECTS.find((a) => a.key === aspect)?.use}</p>
      </div>

      <button
        onClick={download}
        disabled={!ready}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E14434] to-[#c0341f] px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        ⬇ Download my fixed photo
      </button>

      {/* Caption starters */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold text-[#1C1917]">Caption starters — fill the brackets, post it</p>
        <div className="space-y-1.5">
          {CAPTION_FRAMES.map((c) => (
            <div key={c.platform} className="flex items-start justify-between gap-2 rounded-lg border border-[#1c1917]/[0.08] bg-white/60 p-2.5">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#857b6e]">{c.platform}</span>
                <p className="mt-0.5 text-xs text-[#4a443d]">{c.frame}</p>
              </div>
              <button onClick={() => copyFrame(c.frame, c.platform)} className="shrink-0 text-[11px] font-semibold text-[#B23A25] hover:underline">
                {copied === c.platform ? "Copied ✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
