"use client";

import { useMemo, useState } from "react";
import { buildOccasionKit, OCCASIONS, type Occasion, type OccasionTraits } from "@/lib/style/occasionKit";

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full border border-[#E14434]/30 bg-[#E14434]/[0.05] px-2.5 py-1 text-[11px] capitalize text-[#B23A25]">{i}</span>
      ))}
    </div>
  );
}

/**
 * Occasion Kit — pick where you're headed, get a tailored prep kit (what to
 * wear from your own colours, how to groom, which photo/how to show up, and the
 * classic mistake to skip). Consolidates the three things people google
 * separately before any event, personalised to the traits the scan produced.
 */
export function OccasionKitCard(traits: OccasionTraits) {
  const [occasion, setOccasion] = useState<Occasion>("first-date");
  const kit = useMemo(() => buildOccasionKit(occasion, traits), [occasion, traits]);

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B23A25]">Occasion Kits</p>
      <h3 className="mt-0.5 text-base font-bold text-[#1C1917]">Getting ready for something? Pick it.</h3>
      <p className="mt-1 text-xs text-[#6f675e]">What to wear (from your colours), how to groom, which photo, and the mistake to skip — tailored to you, for wherever you&apos;re headed.</p>

      {/* Occasion picker */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {OCCASIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOccasion(o.id)}
            className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all ${occasion === o.id ? "border-[#E14434]/50 bg-[#E14434]/[0.08] text-[#B23A25]" : "border-[#1c1917]/10 bg-[#1c1917]/[0.02] text-[#1C1917] hover:border-[#1c1917]/20"}`}
          >
            {o.emoji} {o.label}
          </button>
        ))}
      </div>

      {/* The kit */}
      <div className="mt-4 space-y-3">
        <div className="rounded-xl border border-[#E14434]/20 bg-[#E14434]/[0.06] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#B23A25]">The vibe</p>
          <p className="text-sm font-semibold text-[#1C1917]">{kit.vibe}</p>
        </div>

        <div className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e]">👕 Wear</p>
          <p className="text-xs text-[#33302b]">{kit.wear}</p>
          {kit.colors.length > 0 && <div className="mt-2.5"><Chips items={kit.colors} /></div>}
        </div>

        <div className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e]">✂️ Groom</p>
          <ul className="space-y-1">
            {kit.groom.map((g) => (
              <li key={g} className="flex items-start gap-2 text-xs text-[#4a443d]">
                <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[9px] text-emerald-700">✓</span>
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[#1c1917]/[0.06] bg-white/50 p-3.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#857b6e]">📸 Show up</p>
          <p className="text-xs text-[#33302b]">{kit.presence}</p>
        </div>

        <p className="text-[11px] text-[#9c9184]">✕ {kit.avoid}</p>
      </div>
    </div>
  );
}
