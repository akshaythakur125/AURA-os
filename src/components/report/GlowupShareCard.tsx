"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { renderGlowupCard } from "@/lib/share/renderGlowupCard";
import { shareCanvasImage, downloadCanvasAsPng } from "@/lib/share/download";
import type { FullAuraReportContent } from "@/types/audit";

/**
 * Paid-only "flex your glow-up" Story card. Turns the score→ceiling story into
 * a share-ready image so a GenZ buyer can post their potential — social
 * currency that makes the ₹25 feel worth it, and pulls new users in with every
 * share. Numbers only; the photo is never included.
 */
export function GlowupShareCard({ content, auditId }: { content: FullAuraReportContent; auditId: string }) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const current = content.improvementScore?.currentScore ?? content.fullScore;
  const ceiling = content.improvementScore?.potentialScore ?? current;
  const edge = content.strongestSignals?.[0];
  const move = [...(content.biggestStatusLeaks || [])].sort((a, b) => b.impactScore - a.impactScore)[0]?.title;

  const build = useCallback(() => {
    const canvas = renderGlowupCard({ current, ceiling, edge, move });
    const dst = previewRef.current;
    if (!dst) return null;
    dst.width = canvas.width;
    dst.height = canvas.height;
    dst.getContext("2d")?.drawImage(canvas, 0, 0);
    return dst;
  }, [current, ceiling, edge, move]);

  useEffect(() => { build(); }, [build]);

  const handleShare = useCallback(async () => {
    const canvas = previewRef.current || build();
    if (!canvas) return;
    const result = await shareCanvasImage(canvas, `auracheck-glowup-${ceiling}.png`, `My aura ceiling: ${ceiling}/100 🔥 find yours at fixmyaura.shop`);
    if (result === "downloaded") setMsg("Saved! Post it on your story.");
    else if (result === "unavailable") setMsg("Couldn't share — try downloading instead.");
  }, [build, ceiling]);

  const handleDownload = useCallback(() => {
    const canvas = previewRef.current || build();
    if (canvas) downloadCanvasAsPng(canvas, `auracheck-glowup-${ceiling}-${auditId.slice(0, 8)}`);
  }, [build, ceiling, auditId]);

  return (
    <Card className="mb-6">
      <h3 className="mb-1 text-sm font-semibold text-[#1C1917]">Flex your glow-up ✨</h3>
      <p className="mb-4 text-xs text-[#857b6e]">Post your ceiling to your story. Your photo is never included.</p>

      <div className="mb-4 overflow-hidden rounded-xl border border-[#1c1917]/[0.08] bg-black">
        <canvas
          ref={previewRef}
          width={1080}
          height={1920}
          className="mx-auto max-h-[360px] w-auto max-w-full"
          style={{ aspectRatio: "9/16" }}
        />
      </div>

      {msg && <p className="mb-3 text-xs text-amber-500">{msg}</p>}

      <div className="space-y-2">
        <Button onClick={handleShare} className="w-full">Share to Story</Button>
        <Button size="sm" variant="secondary" onClick={handleDownload} className="w-full">Download</Button>
      </div>
    </Card>
  );
}
