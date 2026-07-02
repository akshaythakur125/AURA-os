"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ProofExample } from "@/types/proof";

interface BeforeAfterCardProps {
  example: ProofExample;
  compact?: boolean;
  onCtaClick?: () => void;
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
          <div className="mb-2 h-20 overflow-hidden rounded-lg bg-red-950/40">
            <svg className="h-full w-full opacity-40" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="80" fill="#1a1a2e" />
              <circle cx="50" cy="35" r="15" fill="#2a1a1a" opacity="0.6" />
              <rect x="10" y="55" width="30" height="20" rx="2" fill="#2a1a1a" opacity="0.4" />
              <rect x="60" y="50" width="30" height="25" rx="2" fill="#2a1a1a" opacity="0.3" />
              <line x1="20" y1="10" x2="80" y2="70" stroke="#3a1a1a" strokeWidth="0.5" opacity="0.3" />
              <line x1="10" y1="20" x2="90" y2="60" stroke="#3a1a1a" strokeWidth="0.5" opacity="0.2" />
            </svg>
          </div>
          <div className="text-xs text-red-300">{example.beforeVisualDescription}</div>
        </div>

        <div className={`rounded-xl border border-emerald-500/10 bg-gradient-to-br from-emerald-950/30 to-teal-950/20 p-3 ${compact ? "sm:col-start-1" : ""}`}>
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="success">After</Badge>
            <span className="text-lg font-bold text-emerald-400">{example.afterScore}</span>
          </div>
          <div className="mb-2 h-20 overflow-hidden rounded-lg bg-emerald-950/30">
            <svg className="h-full w-full opacity-50" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="80" fill="#0a1a0a" />
              <circle cx="50" cy="35" r="18" fill="#1a3a1a" opacity="0.7" />
              <rect x="15" y="58" width="20" height="18" rx="2" fill="#1a3a1a" opacity="0.5" />
              <rect x="40" y="3" width="20" height="8" rx="2" fill="#1a3a1a" opacity="0.3" />
              <circle cx="38" cy="22" r="3" fill="#0a2a0a" opacity="0.4" />
              <circle cx="62" cy="22" r="3" fill="#0a2a0a" opacity="0.4" />
              <path d="M38 28 Q50 32 62 28" stroke="#1a4a1a" strokeWidth="0.5" fill="none" opacity="0.4" />
            </svg>
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
