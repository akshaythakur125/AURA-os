"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import type { FullAuraReportContent } from "@/types/audit";

/**
 * The unlock payoff. When someone pays ₹25 the report used to just appear —
 * no moment, and the sheer breadth of what they bought was buried in scroll.
 * This leads the paid report with a celebratory, GenZ-native summary: the
 * score→ceiling flex, an honest inventory of what the ₹25 actually unlocked
 * (every count is real content below), and the single highest-impact move to
 * make right now. Nothing here is invented — it just surfaces value already
 * generated so it's felt instantly.
 */
export function UnlockedValueHeader({ content }: { content: FullAuraReportContent }) {
  const current = content.improvementScore?.currentScore ?? content.fullScore;
  const ceiling = content.improvementScore?.potentialScore ?? current;
  const gain = Math.max(0, ceiling - current);

  const topFix = [...(content.biggestStatusLeaks || [])].sort((a, b) => b.impactScore - a.impactScore)[0];
  const topFixLine = topFix ? topFix.fix.split(/(?<=\.)\s/)[0] : null;
  const topFixFree = topFix?.estimatedCost === "free";

  const deliverables = [
    content.biggestStatusLeaks?.length ? `${content.biggestStatusLeaks.length} fixes found` : null,
    content.actionPlan?.length ? `${content.actionPlan.length}-day reshoot plan` : null,
    content.observations?.length ? `${content.observations.length} stylist notes` : null,
    "Money map · ₹0–25k",
    "Skin + presence read",
    "Your colours + capsule fit",
    "Face-shape studio",
  ].filter(Boolean) as string[];

  return (
    <FadeInView>
      <div className="mb-6 overflow-hidden rounded-2xl border border-[#E14434]/25 bg-gradient-to-br from-[#E14434]/[0.10] via-[#f59e0b]/[0.05] to-transparent p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-base">🔓</span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B23A25]">Report unlocked — here&apos;s everything you got</span>
        </div>

        {/* Score → ceiling flex */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold leading-none text-[#1C1917]">{current}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-[#857b6e]">now</div>
          </div>
          <div className="flex-1">
            <div className="relative h-2 overflow-hidden rounded-full bg-[#1c1917]/[0.08]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E14434] to-[#ff8a4c]"
                style={{ width: `${Math.min(100, (current / Math.max(1, ceiling)) * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-center text-[11px] font-medium text-[#B23A25]">
              {gain > 0 ? `+${gain} points on the table` : "You're right at your ceiling 🔥"}
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold leading-none text-[#E14434]">{ceiling}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wide text-[#857b6e]">your ceiling</div>
          </div>
        </div>

        {/* What the ₹25 unlocked */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {deliverables.map((d) => (
            <span key={d} className="rounded-full border border-[#1c1917]/10 bg-[#fbf8f2]/70 px-2.5 py-1 text-[11px] font-medium text-[#4a443d]">
              {d}
            </span>
          ))}
        </div>

        {/* The one move to make first */}
        {topFix && (
          <div className="mt-4 rounded-xl border border-[#1c1917]/[0.08] bg-[#fbf8f2]/60 p-3.5">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#B23A25]">Do this first</span>
              {topFixFree && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">free</span>}
            </div>
            <p className="text-sm font-semibold text-[#1C1917]">{topFix.title}</p>
            {topFixLine && <p className="mt-0.5 text-xs leading-relaxed text-[#4a443d]">{topFixLine}</p>}
          </div>
        )}
      </div>
    </FadeInView>
  );
}
