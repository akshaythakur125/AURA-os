"use client";

import { useState } from "react";
import { buildDatePlaybook, mapSearchLink } from "@/lib/dining/dateSpots";

/**
 * Date & Dining Playbook — where to go, what to order, when, and what to wear
 * (from the user's own colours), with a one-tap "find near me" map search. The
 * dining layer the app was missing, and the natural companion to the dating
 * work: the profile gets the match, this plans the date.
 */
export function DateSpotsCard({ budget, powerColors }: { budget?: number; powerColors?: string[] }) {
  const [city, setCity] = useState("");
  const plan = buildDatePlaybook({ budget, powerColors, city: city.trim() || undefined });

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Date &amp; Dining Playbook</p>
      <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">Where to take them — and what to order</h3>
      <p className="mt-1 text-xs text-[#6f675e]">Budget-smart, first-date-tested spots, with what to order and when to go. Add your city for one-tap map searches.</p>

      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Your city (e.g. Bangalore) — optional"
        className="mt-3 w-full rounded-lg border border-[#1c1917]/10 bg-[#fbf8f2]/70 px-3 py-2 text-xs text-[#33302b] outline-none placeholder:text-[#9c9184] focus:border-[#E14434]/40"
      />

      <div className="mt-4 space-y-2.5">
        {plan.spots.map((s) => (
          <div key={s.type} className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold text-[#1C1917]">{s.emoji} {s.type}</p>
              <span className="shrink-0 text-[10px] font-semibold text-[#857b6e]">{s.cost}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#4a443d]">{s.idea}</p>
            <p className="mt-1.5 text-[11px] text-[#33302b]"><span className="font-semibold">Order:</span> {s.order} · <span className="font-semibold">Best time:</span> {s.timing}</p>
            <a
              href={mapSearchLink(s.query, city.trim() || undefined)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block text-[11px] font-semibold text-[#B23A25] hover:underline"
            >
              📍 Find one near {city.trim() || "me"} →
            </a>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-xl border border-[#E14434]/20 bg-[#E14434]/[0.06] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#B23A25]">The first move</p>
          <p className="text-xs text-[#33302b]">{plan.firstMove}</p>
        </div>
        <div className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#857b6e]">What to wear</p>
          <p className="text-xs text-[#33302b]">{plan.wear}</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-[#9c9184]">💡 {plan.note}</p>
    </div>
  );
}
