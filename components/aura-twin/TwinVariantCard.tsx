"use client";

import type { AuraTwinVariant } from "@/types/auraTwin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface TwinVariantCardProps {
  variant: AuraTwinVariant;
  isBest?: boolean;
}

function MetricBar({ label, value, maxVal = 100 }: { label: string; value: number; maxVal?: number }) {
  const pct = Math.min(100, Math.max(0, (value / maxVal) * 100));
  const color =
    value >= 70 ? "bg-emerald-500" :
    value >= 50 ? "bg-amber-500" :
    "bg-red-500/70";
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-18 flex-shrink-0 text-[10px] text-gray-500">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 flex-shrink-0 text-right text-[10px] tabular-nums text-gray-400">{value}</span>
    </div>
  );
}

export function TwinVariantCard({ variant, isBest = false }: TwinVariantCardProps) {
  const deltaColor = variant.scoreDelta >= 5
    ? "text-emerald-300"
    : variant.scoreDelta > 0
      ? "text-emerald-400"
      : variant.scoreDelta < -2
        ? "text-red-400"
        : "text-gray-400";

  const deltaBgClass = variant.scoreDelta >= 3
    ? "border-emerald-500/30"
    : variant.scoreDelta > 0
      ? "border-emerald-500/10"
      : variant.scoreDelta < 0
        ? "border-red-500/10"
        : "";

  return (
    <Card
      className={`relative overflow-hidden ${isBest ? "border-purple-500/40 bg-purple-500/[0.06] ring-1 ring-purple-500/20" : deltaBgClass}`}
    >
      {isBest && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="premium">Best Pick</Badge>
        </div>
      )}

      {variant.scoreDelta >= 5 && !isBest && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="success">+{variant.scoreDelta}</Badge>
        </div>
      )}

      {variant.scoreDelta < -2 && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="danger">{variant.scoreDelta}</Badge>
        </div>
      )}

      <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={variant.imageDataUrl}
          alt={variant.title}
          className="h-full w-full object-cover"
        />
      </div>

      <h3 className="mb-1 text-sm font-semibold text-white">
        {variant.emoji} {variant.title}
      </h3>

      <p className="mb-2 text-xs leading-relaxed text-gray-500">{variant.description}</p>

      <div className="mb-3 flex items-center gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{variant.score}</div>
          <div className="text-[10px] text-gray-600">score</div>
        </div>
        <div className={`text-center ${deltaColor}`}>
          <div className="text-lg font-bold tabular-nums">
            {variant.scoreDelta > 0 ? "+" : ""}{variant.scoreDelta}
          </div>
          <div className="text-[10px] opacity-70">{variant.scoreDelta > 0 ? "gain" : variant.scoreDelta < 0 ? "loss" : "—"}</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-gray-500">
          <span className={variant.isFree ? "text-emerald-400" : "text-amber-400"}>
            {variant.isFree ? "FREE" : "₹"}
          </span>
        </div>
      </div>

      <div className="mb-3 space-y-0.5">
        <MetricBar label="Lighting" value={variant.metrics.lightingScore} />
        <MetricBar label="Clarity" value={variant.metrics.clarityScore} />
        <MetricBar label="Composition" value={variant.metrics.compositionScore} />
        <MetricBar label="Bg control" value={100 - variant.metrics.backgroundComplexityEstimate} />
      </div>

      <div className="mb-2 rounded-lg bg-white/5 px-2.5 py-2 text-xs leading-relaxed text-gray-400">
        {variant.improvementReason}
      </div>

      <div className="mb-1 flex items-start gap-1.5">
        <svg className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-xs text-gray-400">{variant.freeFix}</span>
      </div>

      {variant.paidFix && (
        <div className="mb-1 flex items-start gap-1.5">
          <svg className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-gray-400">{variant.paidFix}</span>
        </div>
      )}

      {variant.caution && (
        <div className="flex items-start gap-1.5">
          <svg className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-xs text-amber-400/80">{variant.caution}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.03] px-2 py-1.5 text-[10px]">
        <span className="text-gray-500">{variant.isFree ? "💰 Free" : "💰 Paid"}</span>
        <span className="text-gray-500">{variant.estimatedCost}</span>
      </div>
    </Card>
  );
}
