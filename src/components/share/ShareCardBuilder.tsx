"use client";

import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { buildShareCardData } from "@/lib/share/buildShareCardData";
import { renderShareCardToCanvas } from "@/lib/share/renderShareCard";
import { downloadCanvasAsPng, shareCanvasImage } from "@/lib/share/download";
import { copyShareText } from "@/lib/share/copy";
import type { Audit } from "@/types/audit";
import type { ShareCardType, ShareCardOptions, CardStyle } from "@/types/share";

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
  });
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const data = buildShareCardData(audit, type);

  const generate = useCallback(async () => {
    setGenerating(true);
    setShareMsg(null);
    try {
      const canvas = await renderShareCardToCanvas(data, options);
      if (previewRef.current) {
        const ctx = previewRef.current.getContext("2d");
        if (ctx) {
          previewRef.current.width = 1080;
          previewRef.current.height = 1080;
          ctx.clearRect(0, 0, 1080, 1080);
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
    const text = `My Aura Score: ${data.auraScore}/100`;
    const result = await shareCanvasImage(
      canvas,
      `auracheck-score-${data.auraScore}.png`,
      text
    );
    if (result === "downloaded") {
      setShareMsg("Shared via download (native share not available on this browser).");
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

  const toggle = (key: "includeImage" | "includeStatusLeak" | "includeQuickFix" | "includeBranding") => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setStyle = (s: CardStyle) => {
    setOptions((prev) => ({ ...prev, cardStyle: s }));
  };

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">
        Share {type === "full_report" ? "Your Full Aura Result" : "Your Aura Score"}
      </h3>

      <p className="mb-4 text-xs text-gray-500">
        Your uploaded image is never included in a share card unless you turn it on below.
      </p>

      {/* Style selector */}
      <div className="mb-4">
        <div className="mb-2 text-xs text-gray-500">Card Style</div>
        <div className="flex flex-wrap gap-2">
          {(["premium_dark", "clean_minimal", "bold_score"] as CardStyle[]).map(
            (style) => (
              <button
                key={style}
                onClick={() => setStyle(style)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  options.cardStyle === style
                    ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                    : "border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                {style === "premium_dark"
                  ? "Premium Dark"
                  : style === "clean_minimal"
                    ? "Clean Minimal"
                    : "Bold Score"}
              </button>
            )
          )}
        </div>
      </div>

      {/* Toggles */}
      <div className="mb-4 space-y-2">
        {[
          { key: "includeImage" as const, label: "Include my uploaded image" },
          { key: "includeStatusLeak" as const, label: "Include biggest status leak" },
          { key: "includeQuickFix" as const, label: "Include quick fix" },
          { key: "includeBranding" as const, label: "Include AuraCheck branding" },
        ].map((t) => (
          <label
            key={t.key}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
          >
            <input
              type="checkbox"
              checked={options[t.key]}
              onChange={() => toggle(t.key)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-xs text-gray-300">{t.label}</span>
          </label>
        ))}
      </div>

      {/* Preview */}
      <div className="mb-4 overflow-hidden rounded-xl border border-white/5 bg-black">
        <canvas
          ref={previewRef}
          width={1080}
          height={1080}
          className="mx-auto max-h-[280px] w-auto max-w-full"
          style={{ aspectRatio: "1/1" }}
        />
        {!previewUrl && !generating && (
          <div className="flex h-[200px] items-center justify-center text-xs text-gray-600">
            Click &quot;Generate Preview&quot; to see your card
          </div>
        )}
        {generating && (
          <div className="flex h-[200px] items-center justify-center text-xs text-gray-500">
            Generating card...
          </div>
        )}
      </div>

      {shareMsg && (
        <p className="mb-3 text-xs text-amber-400">{shareMsg}</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={generate} disabled={generating}>
          {generating ? "Generating..." : "Generate Preview"}
        </Button>
        {previewUrl && (
          <>
            <Button size="sm" variant="secondary" onClick={handleDownload}>
              Download PNG
            </Button>
            <Button size="sm" variant="outline" onClick={handleShare}>
              Share
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy Text"}
            </Button>
          </>
        )}
      </div>

      {type !== "full_report" && (
        <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-500/10 p-3 text-center">
          <p className="text-xs text-purple-300">
            Unlock the full report to create a premium share card with
            detailed breakdown, upgrade map, and photo guidance.
          </p>
        </div>
      )}
    </Card>
  );
}
