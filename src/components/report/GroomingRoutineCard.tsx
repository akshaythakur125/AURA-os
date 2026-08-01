"use client";

import { useState } from "react";
import { buildGroomingRoutine, type SkinRead, type RoutineStep } from "@/lib/grooming/routine";
import { searchLink } from "@/lib/shop/searchLink";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

type Tab = "am" | "pm" | "weekly";
const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "am", label: "Morning", emoji: "☀️" },
  { key: "pm", label: "Night", emoji: "🌙" },
  { key: "weekly", label: "Weekly", emoji: "📅" },
];

function Step({ step, n }: { step: RoutineStep; n: number }) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E14434]/12 text-[11px] font-bold text-[#B23A25]">{n}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#1C1917]">{step.name} <span className="font-normal text-[#857b6e]">· {step.product}</span></p>
        <p className="mt-0.5 text-[11px] text-[#4a443d]">{step.why}</p>
        <div className="mt-1.5 flex gap-2">
          <a
            href={searchLink(step.query, "nykaa")}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "nykaa", lookCategory: "grooming" })}
            className="text-[11px] font-semibold text-[#B23A25] hover:underline"
          >
            Nykaa →
          </a>
          <a
            href={searchLink(step.query, "amazon")}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "amazon", lookCategory: "grooming" })}
            className="text-[11px] font-semibold text-[#857b6e] hover:underline"
          >
            Amazon →
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Grooming Routine — a real AM / PM / weekly regimen built from the measured
 * skin read, in order, each step shoppable. The "go deeper than product picks"
 * grooming payoff, and a daily-use reason to keep the report open.
 */
export function GroomingRoutineCard({ skin }: { skin: SkinRead }) {
  const [tab, setTab] = useState<Tab>("am");
  const routine = buildGroomingRoutine(skin);
  const steps = routine[tab];

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Your Grooming Routine</p>
      <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">A regimen built from your skin read</h3>
      <p className="mt-1 text-xs text-[#6f675e]">{routine.headline}</p>

      <div className="mt-4 flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${tab === t.key ? "border-[#E14434]/50 bg-[#E14434]/[0.08] text-[#B23A25]" : "border-[#1c1917]/10 bg-[#1c1917]/[0.02] text-[#1C1917] hover:border-[#1c1917]/20"}`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {steps.map((s, i) => <Step key={`${tab}-${i}`} step={s} n={i + 1} />)}
      </div>

      <p className="mt-3 text-[10px] text-[#9c9184]">{routine.note}</p>
    </div>
  );
}
