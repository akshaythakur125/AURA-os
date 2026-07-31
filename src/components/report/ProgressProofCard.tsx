"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Audit } from "@/types/audit";
import type { ProgressComparison } from "@/types/progress";
import { getAudits } from "@/lib/storage/auditStore";
import { compareAudits } from "@/lib/progress/compareAudits";

/**
 * The proof loop, made contextual. Instead of sending people to /progress to
 * hand-pick two scans, this finds the user's most recent re-scan (any audit
 * newer than this one) and shows the before → after right in the report — the
 * evidence that the glow-up worked. If they haven't re-scanned yet, it nudges
 * them to, which is exactly the payoff the plan is building toward.
 */
export function ProgressProofCard({ audit }: { audit: Audit }) {
  const [cmp, setCmp] = useState<ProgressComparison | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | undefined>();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const baseTime = new Date(audit.createdAt).getTime();
    const after = getAudits()
      .filter((a) => a.id !== audit.id && (a.freeScore ?? a.fullScore) != null && new Date(a.createdAt).getTime() > baseTime)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (after) {
      setCmp(compareAudits(audit, after));
      setAfterPhoto(after.imageDataUrl);
    }
    setChecked(true);
  }, [audit]);

  if (!checked) return null;

  // Not re-scanned yet → the nudge (the payoff the plan builds toward).
  if (!cmp) {
    return (
      <div className="mt-4 rounded-2xl border border-[#E14434]/25 bg-gradient-to-b from-[#E14434]/[0.07] to-transparent p-5 text-center">
        <p className="text-sm font-bold text-[#1C1917]">Prove your glow-up</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-[#6f675e]">Done a few missions? Re-scan the same way you shot your first photo and watch your score move — side by side, in numbers.</p>
        <Link href="/audit/new" className="mt-3 inline-flex rounded-xl bg-[#1C1917] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
          Re-scan to see my progress →
        </Link>
      </div>
    );
  }

  const up = cmp.scoreDelta > 0;
  return (
    <div className="mt-4 rounded-2xl border border-[#1c1917]/[0.1] bg-white/70 p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-[#1C1917]">Your glow-up, in numbers</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${up ? "bg-emerald-500/15 text-emerald-700" : cmp.scoreDelta < 0 ? "bg-[#E14434]/15 text-[#B23A25]" : "bg-[#1c1917]/[0.08] text-[#4a443d]"}`}>
          {up ? `+${cmp.scoreDelta}` : cmp.scoreDelta} pts
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-center">
          {audit.imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={audit.imageDataUrl} alt="Before" className="mx-auto mb-2 h-20 w-20 rounded-xl object-cover opacity-90" />
          ) : null}
          <div className="font-mono text-3xl font-bold tabular-nums text-[#857b6e]">{cmp.beforeScore}</div>
          <div className="font-mono text-[10px] uppercase tracking-wide text-[#857b6e]">before</div>
        </div>
        <div className="text-2xl text-[#857b6e]">→</div>
        <div className="text-center">
          {afterPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={afterPhoto} alt="After" className="mx-auto mb-2 h-20 w-20 rounded-xl object-cover" />
          ) : null}
          <div className={`font-mono text-3xl font-bold tabular-nums ${up ? "text-emerald-600" : "text-[#1C1917]"}`}>{cmp.afterScore}</div>
          <div className="font-mono text-[10px] uppercase tracking-wide text-[#B23A25]">after</div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[#4a443d]">{cmp.summary}</p>

      {cmp.improvedSignals.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {cmp.improvedSignals.slice(0, 4).map((s) => (
            <span key={s} className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">↑ {s}</span>
          ))}
        </div>
      )}

      <div className="mt-4 text-center">
        <Link href="/audit/new" className="text-xs font-semibold text-[#B23A25] hover:underline">Re-scan again →</Link>
      </div>
    </div>
  );
}
