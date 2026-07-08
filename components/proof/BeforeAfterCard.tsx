"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PhotoIllustration } from "./PhotoIllustration";
import type { ProofExample } from "@/types/proof";

interface BeforeAfterCardProps {
  example: ProofExample;
  compact?: boolean;
  onCtaClick?: () => void;
}

function getScenarioFromExample(id: string): "lighting" | "background" | "outfit" | "framing" | "profile" | "consistency" | "glowup" | "waste" {
  if (id.includes("lighting")) return "lighting";
  if (id.includes("background")) return "background";
  if (id.includes("crop") || id.includes("framing")) return "framing";
  if (id.includes("premium") || id.includes("minimal")) return "outfit";
  if (id.includes("dating") || id.includes("profile")) return "profile";
  if (id.includes("instagram") || id.includes("consistency")) return "consistency";
  if (id.includes("glowup") || id.includes("30")) return "glowup";
  if (id.includes("waste") || id.includes("avoid")) return "waste";
  return "lighting";
}

export function BeforeAfterCard({ example, compact, onCtaClick }: BeforeAfterCardProps) {
  const handleCta = () => {
    trackEvent("proof_cta_clicked", { proofId: example.id, product: example.productSuggested });
    onCtaClick?.();
  };

  return (
    <Card className={`float-card relative overflow-hidden border-white/5 ${compact ? "p-3" : "p-4"}`}>
      <div className="absolute right-3 top-3">
        <Badge variant={example.scoreDelta >= 10 ? "success" : "warning"}>
          {example.scoreDelta > 0 ? "+" : ""}
          {example.scoreDelta}
        </Badge>
      </div>

      <div className={`grid gap-4 ${compact ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
        <div className="rounded-xl border border-red-500/10 bg-gradient-to-br from-red-950/30 to-rose-950/20 p-3">
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="danger">Before</Badge>
            <span className="text-lg font-bold text-red-400">{example.beforeScore}</span>
          </div>
          <div className="mb-2 h-28 overflow-hidden rounded-lg bg-red-950/40">
            <PhotoIllustration variant="before" scenario={getScenarioFromExample(example.id)} />
          </div>
          <div className="text-xs text-red-300">{example.beforeVisualDescription}</div>
        </div>

        <div className={`rounded-xl border border-emerald-500/10 bg-gradient-to-br from-emerald-950/30 to-teal-950/20 p-3 ${compact ? "sm:col-start-1" : ""}`}>
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="success">After</Badge>
            <span className="text-lg font-bold text-emerald-400">{example.afterScore}</span>
          </div>
          <div className="mb-2 h-28 overflow-hidden rounded-lg bg-emerald-950/30">
            <PhotoIllustration variant="after" scenario={getScenarioFromExample(example.id)} />
          </div>
          <div className="text-xs text-emerald-300">{example.afterVisualDescription}</div>
        </div>
      </div>

      {!compact ? (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white/5 p-2">
              <div className="text-gray-500">Biggest Leak</div>
              <div className="text-gray-300">{example.biggestLeak}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <div className="text-gray-500">Fix Applied</div>
              <div className="text-gray-300">{example.fixApplied}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <div className="text-gray-500">Cost</div>
              <div className="text-emerald-400">{example.costLabel}</div>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <div className="text-gray-500">Time</div>
              <div className="text-amber-400">{example.timeLabel}</div>
            </div>
          </div>

          <div className="rounded-lg border border-purple-500/10 bg-purple-500/5 p-2 text-xs text-purple-300">
            {example.keyLesson}
          </div>
        </div>
      ) : null}

      <div className="mt-3">
        <Button asChild size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400">
          <Link href={example.ctaHref} onClick={handleCta}>
            {example.ctaText}
          </Link>
        </Button>
      </div>

      {example.isDemo ? (
        <p className="mt-2 text-center text-[10px] text-gray-600">Demo example, not a real user result</p>
      ) : null}
    </Card>
  );
}
