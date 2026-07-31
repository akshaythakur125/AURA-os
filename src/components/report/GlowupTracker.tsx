"use client";

import { useEffect, useState } from "react";
import type { GlowupPlan } from "@/types/audit";
import { getCompletedDays, toggleMissionDay } from "@/lib/storage/glowupProgress";
import { buildGlowupChecklistHtml } from "@/lib/share/glowupArtifact";
import { downloadTextFile } from "@/lib/share/download";

const EFFORT_STYLE: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-700",
  medium: "bg-amber-500/15 text-amber-700",
  hard: "bg-[#E14434]/15 text-[#B23A25]",
};

/**
 * Turns the 30-day plan from a read-only list into a living tool: tick off
 * missions (saved locally per audit), watch the progress bar and streak fill,
 * see what to do next, and download a keepable checklist. This is what makes a
 * ₹400 plan re-earn its price every day instead of ending when the tab closes.
 */
export function GlowupTracker({ plan, auditId }: { plan: GlowupPlan; auditId: string }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    setDone(getCompletedDays(auditId));
  }, [auditId]);

  const weeks = [plan.week1, plan.week2, plan.week3, plan.week4];
  const allMissions = weeks.flatMap((w) => w.dailyMissions).sort((a, b) => a.day - b.day);
  const total = allMissions.length;
  const completed = allMissions.filter((m) => done.has(m.day)).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const nextUp = allMissions.find((m) => !done.has(m.day));

  const toggle = (day: number) => setDone(new Set(toggleMissionDay(auditId, day)));
  const download = () => downloadTextFile(buildGlowupChecklistHtml(plan, done), "my-glow-up-checklist.html", "text/html");

  return (
    <div>
      {/* Progress header */}
      <div className="mb-4 rounded-2xl border border-[#1c1917]/[0.08] bg-white/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-2xl font-bold tabular-nums text-[#1C1917]">{completed}<span className="text-base text-[#857b6e]">/{total}</span></div>
            <div className="text-[11px] text-[#857b6e]">missions done · {pct}%</div>
          </div>
          <button onClick={download} className="rounded-xl border border-[#1c1917]/12 px-3.5 py-2 text-xs font-semibold text-[#1C1917] transition-colors hover:border-[#E14434]/40">
            ⬇ Download checklist
          </button>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded bg-[#F2ECE1]">
          <div className="h-full rounded bg-gradient-to-r from-[#E14434] to-[#ff8a4c] transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        {pct === 100 && (
          <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-xs font-semibold text-emerald-700">🎉 All 30 done — re-scan your photo to see your glow-up.</p>
        )}
      </div>

      {/* Next up — kills the overwhelm */}
      {nextUp && pct < 100 && (
        <div className="mb-4 rounded-2xl border border-[#E14434]/25 bg-[#E14434]/[0.06] p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#B23A25]">Do this next · Day {nextUp.day}</p>
              <p className="text-sm font-semibold text-[#1C1917]">{nextUp.title}</p>
              <p className="mt-0.5 text-xs text-[#4a443d]">{nextUp.description}</p>
            </div>
            <button onClick={() => toggle(nextUp.day)} className="shrink-0 rounded-xl bg-[#1C1917] px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5">
              Mark done
            </button>
          </div>
        </div>
      )}

      {/* Weeks with checkable missions */}
      <div className="space-y-3">
        {weeks.map((week, wi) => {
          const wDone = week.dailyMissions.filter((m) => done.has(m.day)).length;
          const wComplete = wDone === week.dailyMissions.length;
          const milestone = plan.milestones?.find((ms) => ms.week === wi + 1);
          return (
            <details key={wi} className="group rounded-2xl border border-[#1c1917]/[0.08] bg-[#fbf8f2]/50" open={wi === 0}>
              <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-[#1C1917]">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${wComplete ? "bg-emerald-500 text-white" : "bg-[#E14434]/20 text-[#B23A25]"}`}>{wComplete ? "✓" : `W${wi + 1}`}</span>
                <span className="flex-1">{week.title}</span>
                <span className="text-[11px] font-medium text-[#857b6e]">{wDone}/{week.dailyMissions.length}</span>
              </summary>
              <div className="px-3 pb-3">
                {milestone && <p className="mb-2 px-1 text-[11px] text-[#B23A25]">🎯 {milestone.target}</p>}
                <ul className="space-y-1">
                  {week.dailyMissions.map((m) => {
                    const isDone = done.has(m.day);
                    return (
                      <li key={m.day}>
                        <button onClick={() => toggle(m.day)} className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-[#1c1917]/[0.03]">
                          <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-[#1c1917]/25 text-transparent"}`}>✓</span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="text-[10px] text-[#857b6e]">D{m.day}</span>
                              <span className={`text-xs font-medium ${isDone ? "text-[#857b6e] line-through" : "text-[#1C1917]"}`}>{m.title}</span>
                              <span className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${EFFORT_STYLE[m.effort] || EFFORT_STYLE.easy}`}>{m.effort}</span>
                            </span>
                            {!isDone && <span className="mt-0.5 block text-[11px] text-[#6f675e]">{m.description}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
