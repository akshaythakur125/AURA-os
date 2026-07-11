"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { buildShareCardData } from "@/lib/share/buildShareCardData";
import { renderShareCardToCanvas } from "@/lib/share/renderShareCard";
import { downloadCanvasAsPng, shareCanvasImage } from "@/lib/share/download";
import { copyShareText } from "@/lib/share/copy";
import type { Audit } from "@/types/audit";
import type { ShareCardType, ShareCardOptions, CardStyle, CardFormat } from "@/types/share";

interface Props {
  audit: Audit;
  type: ShareCardType;
}

export function ShareCardBuilder({ audit, type }: Props) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [options, setOptions] = useState<ShareCardOptions>({
    includeImage: false,
    includeStatusLeak: true,
    includeQuickFix: true,
    includeBranding: true,
    cardStyle: "premium_dark",
    format: "story",
  });
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  // ponytail: rejected images cannot generate share cards
  const freeResult = audit.fullReport?.freeResult as any;
  const isRejected = freeResult?.auraScore === null && freeResult?.qualityGate?.canProceed === false;

  if (isRejected) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-gray-400">Share cards are not available for images that could not be reliably analysed.</p>
      </Card>
    );
  }

  const data = buildShareCardData(audit, type);

  const generate = useCallback(async () => {
    setGenerating(true);
    setShareMsg(null);
    try {
      const canvas = await renderShareCardToCanvas(data, options);
      const w = options.format === "story" ? 1080 : 1080;
      const h = options.format === "story" ? 1920 : 1080;
      if (previewRef.current) {
        const ctx = previewRef.current.getContext("2d");
        if (ctx) {
          previewRef.current.width = w;
          previewRef.current.height = h;
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(canvas, 0, 0);
        }
      }
      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch {
      setShareMsg("Failed to generate card. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [data, options]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleDownload = useCallback(async () => {
    if (!previewUrl) await generate();
    const canvas = previewRef.current;
    if (!canvas) return;
    downloadCanvasAsPng(
      canvas,
      `auracheck-score-${data.auraScore}-${data.auditId.slice(0, 8)}`
    );
  }, [previewUrl, generate, data]);

  const handleShare = useCallback(async () => {
    if (!previewUrl) await generate();
    const canvas = previewRef.current;
    if (!canvas) return;
    const text = `My Aura Score: ${data.auraScore}/100 — find yours at auracheck.app`;
    const result = await shareCanvasImage(
      canvas,
      `auracheck-score-${data.auraScore}.png`,
      text
    );
    if (result === "downloaded") {
      setShareMsg("Saved! Share it on your story.");
    } else if (result === "unavailable") {
      setShareMsg("Could not share. Try downloading instead.");
    }
  }, [previewUrl, generate, data]);

  const handleCopy = useCallback(async () => {
    const ok = await copyShareText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (!ok) {
      setShareMsg("Could not copy automatically. Select the text manually.");
    }
  }, [data]);

  const isStory = options.format === "story";

  return (
    <Card>
      <h3 className="mb-2 text-sm font-semibold text-white">
        Share your result
      </h3>
      <p className="mb-4 text-xs text-gray-500">
        Your image is never included unless you turn it on. One-tap share to Instagram Stories.
      </p>

      {/* Format toggle */}
      <div className="mb-3">
        <div className="flex gap-2">
          {([["story", "Story (9:16)"], ["square", "Square (1:1)"]] as [CardFormat, string][]).map(([fmt, label]) => (
            <button
              key={fmt}
              onClick={() => setOptions((p) => ({ ...p, format: fmt }))}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs transition-colors ${
                options.format === fmt
                  ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                  : "border-white/10 text-gray-500 hover:border-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Style selector */}
      <div className="mb-3">
        <div className="flex gap-1.5">
          {(["premium_dark", "clean_minimal", "bold_score"] as CardStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setOptions((p) => ({ ...p, cardStyle: style }))}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-[10px] transition-colors ${
                options.cardStyle === style
                  ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                  : "border-white/10 text-gray-500 hover:border-white/20"
              }`}
            >
              {style === "premium_dark" ? "Aurora" : style === "clean_minimal" ? "Clean" : "Bold"}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles — compact */}
      <div className="mb-3 flex flex-wrap gap-2">
        {[
          { key: "includeImage" as const, label: "Image" },
          { key: "includeStatusLeak" as const, label: "Leak" },
          { key: "includeQuickFix" as const, label: "Fix" },
          { key: "includeBranding" as const, label: "Brand" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setOptions((p) => ({ ...p, [t.key]: !p[t.key] }))}
            className={`rounded-md border px-2 py-1 text-[10px] transition-colors ${
              options[t.key]
                ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                : "border-white/10 text-gray-600 hover:text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="mb-4 overflow-hidden rounded-xl border border-white/[0.04] bg-black">
        <canvas
          ref={previewRef}
          width={1080}
          height={isStory ? 1920 : 1080}
          className="mx-auto max-h-[360px] w-auto max-w-full"
          style={{ aspectRatio: isStory ? "9/16" : "1/1" }}
        />
        {generating && (
          <div className="flex h-[200px] items-center justify-center text-xs text-gray-500">
            Generating...
          </div>
        )}
      </div>

      {shareMsg && (
        <p className="mb-3 text-xs text-amber-400">{shareMsg}</p>
      )}

      {/* Actions — one-tap share prominent */}
      <div className="space-y-2">
        <Button onClick={handleShare} disabled={generating} className="w-full">
          Share to Story
        </Button>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleDownload} disabled={generating} className="flex-1">
            Download
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCopy} className="flex-1">
            {copied ? "Copied!" : "Copy Text"}
          </Button>
        </div>
      </div>

      {type !== "full_report" && (
        <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-500/10 p-3 text-center">
          <p className="text-xs text-purple-300">
            Unlock the full report for a premium card with detailed breakdown.
          </p>
        </div>
      )}
    </Card>
  );
}
