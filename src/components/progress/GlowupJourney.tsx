"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAudits } from "@/lib/storage/auditStore";
import type { Audit } from "@/types/audit";

function scoreOf(a: Audit): number {
  return (a.freeScore ?? a.fullScore ?? 0) as number;
}

function daysBetween(aIso: string, bIso: string): number {
  const ms = Math.abs(new Date(bIso).getTime() - new Date(aIso).getTime());
  return Math.round(ms / 86_400_000);
}

/**
 * The glow-up journey hero — the emotional payoff of the progress hub. Instead
 * of only an abstract trend line, it shows the user's *real* first photo →
 * latest photo with the measured score jump between them, framed as a journey
 * ("+12 aura in 34 days across 5 scans"). One tap compares first ↔ latest so
 * the detailed breakdown appears below without fiddling with dropdowns. Every
 * number is real — pulled straight from their own scan history.
 */
export function GlowupJourney({ onCompare }: { onCompare?: (beforeId: string, afterId: string) => void }) {
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    const scored = getAudits()
      .filter((a) => a.imageDataUrl && typeof (a.freeScore ?? a.fullScore) === "number")
      .sort((x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime());
    setAudits(scored);
  }, []);

  const journey = useMemo(() => {
    if (audits.length < 2) return null;
    const first = audits[0];
    const latest = audits[audits.length - 1];
    const best = [...audits].sort((a, b) => scoreOf(b) - scoreOf(a))[0];
    const delta = scoreOf(latest) - scoreOf(first);
    return {
      first,
      latest,
      best,
      delta,
      days: daysBetween(first.createdAt, latest.createdAt),
      scans: audits.length,
      bestIsLatest: best.id === latest.id,
    };
  }, [audits]);

  if (!journey) return null;

  const { first, latest, best, delta, days, scans, bestIsLatest } = journey;
  const up = delta > 0;
  const milestone = delta >= 15 ? "🔥 Major glow-up" : delta >= 6 ? "📈 Real progress" : delta > 0 ? "🌱 Trending up" : delta === 0 ? "➡️ Holding steady" : "🔁 Keep going";

  return (
    <Card className="mb-8 overflow-hidden border-[#10b981]/25 bg-gradient-to-br from-[#10b981]/[0.08] via-transparent to-[#E14434]/[0.05]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f8a63]">Your glow-up journey</span>
        <span className="rounded-full border border-[#1c1917]/10 bg-[#fbf8f2]/70 px-2.5 py-1 text-[11px] font-medium text-[#4a443d]">{milestone}</span>
      </div>

      {/* First → latest photo with the measured jump between */}
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        <figure className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={first.imageDataUrl} alt="Your first scan" className="h-24 w-24 rounded-2xl object-cover ring-2 ring-[#1c1917]/10 sm:h-28 sm:w-28" />
          <figcaption className="mt-1.5 text-center">
            <span className="text-lg font-bold text-[#1C1917]">{scoreOf(first)}</span>
            <span className="block text-[10px] uppercase tracking-wide text-[#857b6e]">first scan</span>
          </figcaption>
        </figure>

        <div className="flex flex-col items-center px-1">
          <span className={`text-2xl font-bold leading-none sm:text-3xl ${up ? "text-emerald-600" : delta < 0 ? "text-[#E14434]" : "text-[#857b6e]"}`}>
            {up ? "+" : ""}{delta}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wide text-[#857b6e]">aura</span>
          <svg className="mt-1 h-4 w-8 text-[#9c9184]" fill="none" viewBox="0 0 32 16" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 8h26m0 0l-5-5m5 5l-5 5" />
          </svg>
        </div>

        <figure className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={latest.imageDataUrl} alt="Your latest scan" className="h-24 w-24 rounded-2xl object-cover ring-2 ring-[#10b981]/35 sm:h-28 sm:w-28" />
          <figcaption className="mt-1.5 text-center">
            <span className="text-lg font-bold text-[#1C1917]">{scoreOf(latest)}</span>
            <span className="block text-[10px] uppercase tracking-wide text-[#857b6e]">latest scan</span>
          </figcaption>
        </figure>
      </div>

      <p className="mt-4 text-center text-sm text-[#4a443d]">
        {up
          ? `You're up ${delta} ${delta === 1 ? "point" : "points"}`
          : delta < 0
            ? `Down ${Math.abs(delta)} from where you started`
            : "Same score as your first scan"}
        {days > 0 ? ` over ${days} ${days === 1 ? "day" : "days"}` : ""} · {scans} scans
        {!bestIsLatest && ` · best yet: ${scoreOf(best)}`}
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {onCompare && (
          <Button size="sm" onClick={() => onCompare(first.id, latest.id)}>
            Break down first → latest
          </Button>
        )}
        <Link href="/audit/new"><Button size="sm" variant="outline">New scan</Button></Link>
      </div>
    </Card>
  );
}
