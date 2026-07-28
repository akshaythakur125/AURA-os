"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAudits } from "@/lib/storage/auditStore";
import type { Audit } from "@/types/audit";

const GOAL_LABEL: Record<string, string> = {
  dating: "dating", instagram: "Instagram", office: "LinkedIn", linkedin: "LinkedIn",
  college: "college", glowup: "glow-up", content: "content", festival: "festival",
  travel: "travel", confidence: "confidence",
};

function scoreOf(a: Audit): number {
  return (a.freeScore ?? a.fullScore ?? 0) as number;
}

/**
 * Pro perk: rank ALL of this browser's scanned photos and name the strongest —
 * so a returning user knows exactly which shot to post. Uses their real audit
 * history (their own photos + measured scores), plus best-per-goal when they've
 * scanned for different platforms.
 */
export function BestPhotoCard({ currentId }: { currentId: string }) {
  const [ranked, setRanked] = useState<Audit[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const withScore = getAudits().filter((a) => a.imageDataUrl && typeof (a.freeScore ?? a.fullScore) === "number");
    withScore.sort((a, b) => scoreOf(b) - scoreOf(a));
    setTotal(withScore.length);
    setRanked(withScore.slice(0, 4));
  }, []);

  if (ranked.length < 2) {
    return (
      <Card className="mb-6">
        <h3 className="mb-1 text-sm font-semibold text-[#1C1917]">🏅 Your best shot</h3>
        <p className="mb-3 text-xs text-[#857b6e]">Scan another photo and we&apos;ll rank them side by side — so you know exactly which one to post.</p>
        <Link href="/audit/new"><Button size="sm">Scan another photo</Button></Link>
      </Card>
    );
  }

  // Best per distinct goal (only when the user scanned for more than one).
  const byGoal = new Map<string, Audit>();
  for (const a of ranked) {
    const g = a.goal || "glowup";
    if (!byGoal.has(g) || scoreOf(a) > scoreOf(byGoal.get(g)!)) byGoal.set(g, a);
  }
  const perGoal = byGoal.size > 1 ? [...byGoal.entries()] : [];

  return (
    <Card className="mb-6">
      <h3 className="mb-1 text-sm font-semibold text-[#1C1917]">🏅 Your best shot so far</h3>
      <p className="mb-4 text-xs text-[#857b6e]">Ranked across your {total} scans — post the top one.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ranked.map((a, i) => (
          <Link key={a.id} href={`/audit/${a.id}`} className="group flex flex-col rounded-xl border border-[#1c1917]/[0.07] bg-[#fbf8f2]/60 p-2">
            <div className="relative overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.imageDataUrl} alt={`Scan scoring ${scoreOf(a)}`} className="h-28 w-full object-cover" />
              <span className={`absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white ${i === 0 ? "bg-[#E14434]" : "bg-[#1c1917]/70"}`}>{i + 1}</span>
              {a.id === currentId && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-[#1C1917]/80 px-1.5 py-0.5 text-[9px] font-medium text-white">this one</span>
              )}
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-sm font-bold text-[#1C1917]">{scoreOf(a)}</span>
              <span className="text-[10px] text-[#857b6e]">{GOAL_LABEL[a.goal] || a.goal}</span>
            </div>
          </Link>
        ))}
      </div>

      {perGoal.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {perGoal.map(([g, a]) => (
            <Link key={g} href={`/audit/${a.id}`} className="rounded-full border border-[#1c1917]/10 bg-[#1c1917]/[0.03] px-2.5 py-1 text-[11px] text-[#4a443d] hover:border-[#E14434]/40">
              Best for {GOAL_LABEL[g] || g}: <span className="font-semibold text-[#1C1917]">{scoreOf(a)}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Link href="/audit/new"><Button size="sm" variant="secondary">Scan another to beat it</Button></Link>
      </div>
    </Card>
  );
}
