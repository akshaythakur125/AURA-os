"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { renderReportCard } from "@/lib/share/renderReportCard";
import { shareCanvasImage, downloadCanvasAsPng } from "@/lib/share/download";
import type { FullAuraReportContent } from "@/types/audit";

/**
 * Pro perk: download your full Aura Report as one premium, branded image — a
 * keepsake you own and can revisit or share. Built on the same self-contained
 * canvas as the share cards (no PDF library, renders everywhere).
 */
export function ReportDownloadCard({
  content,
  auditId,
  imageUrl,
}: {
  content: FullAuraReportContent;
  auditId: string;
  imageUrl?: string;
}) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const score = content.improvementScore?.currentScore ?? content.fullScore;
  const ceiling = content.improvementScore?.potentialScore ?? score;
  const vb = content.visualBreakdown;
  const breakdown = [
    { label: "Lighting", value: vb.lighting },
    { label: "Clarity", value: vb.clarity },
    { label: "Composition", value: vb.composition },
    { label: "Background", value: vb.backgroundControl },
    { label: "Colour", value: vb.colorSignal },
    { label: "Premium feel", value: vb.premiumSignal },
    { label: "Consistency", value: vb.overallConsistency },
  ];
  const topFixes = [...(content.biggestStatusLeaks || [])]
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3)
    .map((l) => ({ title: l.title, fix: l.fix }));

  const build = useCallback(async () => {
    const canvas = await renderReportCard({
      score,
      ceiling,
      category: content.category || "Your report",
      verdict: content.finalVerdict || content.detailedVerdict || "",
      breakdown,
      topFixes,
      strengths: content.strongestSignals || [],
      imageDataUrl: imageUrl,
    });
    const dst = previewRef.current;
    if (!dst) return null;
    dst.width = canvas.width;
    dst.height = canvas.height;
    dst.getContext("2d")?.drawImage(canvas, 0, 0);
    return dst;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, imageUrl]);

  useEffect(() => { build(); }, [build]);

  const handleDownload = useCallback(async () => {
    const canvas = previewRef.current || (await build());
    if (canvas) downloadCanvasAsPng(canvas, `auracheck-report-${score}-${auditId.slice(0, 8)}`);
  }, [build, score, auditId]);

  const handleShare = useCallback(async () => {
    const canvas = previewRef.current || (await build());
    if (!canvas) return;
    const r = await shareCanvasImage(canvas, `auracheck-report-${score}.png`, `My AuraCheck report — ${score}/100. fixmyaura.shop`);
    if (r === "downloaded") setMsg("Saved to your device.");
    else if (r === "unavailable") setMsg("Couldn't share — try downloading instead.");
  }, [build, score]);

  return (
    <Card className="mb-6">
      <h3 className="mb-1 text-sm font-semibold text-[#1C1917]">📄 Download your report</h3>
      <p className="mb-4 text-xs text-[#857b6e]">Your full read as one premium card — keep it, revisit it, or share it.</p>

      <div className="mb-4 overflow-hidden rounded-xl border border-[#1c1917]/[0.08] bg-[#FBF8F2]">
        <canvas ref={previewRef} width={1080} height={1460} className="mx-auto max-h-[420px] w-auto max-w-full" />
      </div>

      {msg && <p className="mb-3 text-xs text-amber-500">{msg}</p>}

      <div className="space-y-2">
        <Button onClick={handleDownload} className="w-full">Download report</Button>
        <Button size="sm" variant="secondary" onClick={handleShare} className="w-full">Share</Button>
      </div>
    </Card>
  );
}
