"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuraOrb } from "@/components/three/AuraPlayground";

const AuraPlayground = dynamic(() => import("@/components/three/AuraPlayground"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#a78bfa]/30 border-t-[#a78bfa]" />
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a78bfa]/70">
          Charging the aura core…
        </p>
      </div>
    </div>
  ),
});

export default function ExploreClient() {
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<AuraOrb | null>(null);
  useEffect(() => setMounted(true), []);

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#0a0a1a] text-[#faf5ff]">
      {/* The 3D playground fills the viewport */}
      <div className="fixed inset-0 z-0">{mounted && <AuraPlayground onSelect={setSelected} />}</div>

      {/* top fade for legibility */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-[#0a0a1a] via-[#0a0a1a]/60 to-transparent" />

      {/* Heading */}
      <div className="pointer-events-none relative z-20 mx-auto max-w-6xl px-6 pt-24 sm:pt-28">
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#a78bfa]/30 bg-[#a78bfa]/10 px-4 py-1.5 text-[11px] font-semibold text-[#c4b5fd] backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399]" />
          Live WebGL · 11 status archetypes in orbit
        </div>

        <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          Your aura,{" "}
          <span className="bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-[#60a5fa] bg-clip-text text-transparent">
            in your hands.
          </span>
        </h1>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-[#c7c7d9]">
          Every status archetype is a living orb. <b className="text-white">Drag</b> to
          grab and <b className="text-white">fling</b> it, watch them collide and bounce, then{" "}
          <b className="text-white">tap</b> any orb to meet the archetype — and its level-up.
        </p>
      </div>

      {/* Interaction hints */}
      <div className="pointer-events-none fixed bottom-6 left-6 z-20 flex flex-col gap-2">
        {[
          { k: "Drag", v: "grab & fling an orb" },
          { k: "Tap", v: "see the fix" },
          { k: "Move", v: "parallax the camera" },
        ].map((h) => (
          <div key={h.k} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] backdrop-blur">
            <span className="rounded bg-[#a78bfa]/15 px-2 py-0.5 font-bold text-[#c4b5fd]">{h.k}</span>
            <span className="text-[#c7c7d9]">{h.v}</span>
          </div>
        ))}
      </div>

      {/* Quick exits */}
      <div className="fixed bottom-6 right-6 z-20 flex flex-wrap justify-end gap-2">
        <Link href="/examples" className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold text-[#e5e5f0] backdrop-blur transition hover:border-[#a78bfa]/40 hover:text-white">
          See Examples →
        </Link>
        <Link href="/audit/new" className="rounded-xl bg-gradient-to-b from-[#a78bfa] to-[#7c3aed] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#7c3aed]/25 transition hover:brightness-110">
          Get My Aura Score →
        </Link>
      </div>

      {/* Fix card (opens on orb tap) */}
      {selected && (
        <div className="fixed inset-0 z-30 grid place-items-center p-6" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12122a]/95 p-6 shadow-2xl"
            style={{ boxShadow: `0 30px 90px -20px ${selected.color}55` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className="grid h-12 w-12 place-items-center rounded-xl text-2xl"
                style={{ background: `${selected.color}22`, border: `1px solid ${selected.color}55` }}
              >
                {selected.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold">{selected.name}</h2>
                <p className="text-xs text-[#a0a0b8]">{selected.desc}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-[#a0a0b8] transition hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">The leak</p>
              <p className="mt-1 text-sm text-[#e5e5f0]">{selected.issue}</p>
            </div>

            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">The fix</p>
              <p className="mt-1 text-sm text-[#e5e5f0]">{selected.fix}</p>
            </div>

            <Link
              href="/audit/new"
              className="mt-5 block rounded-xl bg-gradient-to-b from-[#a78bfa] to-[#7c3aed] px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-[#7c3aed]/25 transition hover:brightness-110"
            >
              Find my real archetype →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
