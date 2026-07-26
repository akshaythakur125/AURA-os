"use client";

import { useEffect, useState } from "react";
import { getAudits } from "@/lib/storage/auditStore";
import { compareAudits } from "@/lib/progress/compareAudits";
import { FadeInView } from "@/components/ui/FadeInView";
import type { Audit } from "@/types/audit";
import type { ProgressComparison } from "@/types/progress";

/**
 * Closes the loop: when a returning user re-scores a new photo higher than
 * their previous one, celebrate the jump. This proves the advice actually
 * works — the strongest reason to trust (and pay again). Only shows on a real
 * improvement over the user's most recent earlier scan; silent otherwise, so
 * it never nags or fabricates progress.
 */
export function ReshootCelebration({ audit }: { audit: Audit }) {
  const [cmp, setCmp] = useState<ProgressComparison | null>(null);

  useEffect(() => {
    const cur = audit.freeScore ?? audit.fullScore;
    if (typeof cur !== "number") return;
    const prev = getAudits()
      .filter(
        (a) =>
          a.id !== audit.id &&
          typeof (a.freeScore ?? a.fullScore) === "number" &&
          new Date(a.createdAt).getTime() < new Date(audit.createdAt).getTime()
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (!prev) return;
    const c = compareAudits(prev, audit);
    if (c.scoreDelta > 0) setCmp(c);
  }, [audit]);

  if (!cmp) return null;

  const signals = cmp.improvedSignals.slice(0, 4);

  return (
    <FadeInView>
      <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.10] via-[#f59e0b]/[0.04] to-transparent p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base">📈</span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Your reshoot worked</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-[#857b6e]">{cmp.beforeScore}</span>
          <span className="text-lg text-[#857b6e]">→</span>
          <span className="text-4xl font-bold text-[#1C1917]">{cmp.afterScore}</span>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-bold text-emerald-700">+{cmp.scoreDelta} 🔥</span>
        </div>

        {signals.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">What leveled up</p>
            <div className="flex flex-wrap gap-1.5">
              {signals.map((s) => (
                <span key={s} className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 text-xs leading-relaxed text-[#4a443d]">
          Proof the fixes work. Bank this shot — then push for your ceiling.
        </p>
      </div>
    </FadeInView>
  );
}
