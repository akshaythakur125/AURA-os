"use client";

import { useEffect, useState } from "react";
import { useMouseTilt } from "@/hooks/useMouseTilt";

/**
 * The hero's focal object: a faithful phone screenshot of the *actual* Aura
 * report a user gets — same light theme, same vermilion brand, same score
 * gauge, measured fix, strongest-signal chips and the ₹25 unlock. It's a
 * product mockup (illustrative example values), not a real user's result, but
 * every element mirrors the live report UI so the hero shows exactly what you
 * pay for. Pure CSS/SVG — renders everywhere, no WebGL, no fallback needed.
 */
export function HeroReportMockup() {
  const tilt = useMouseTilt({ maxTilt: 5, scale: 1.015 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Score gauge geometry (74 / 100)
  const size = 92;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const score = 74;
  const offset = circ * (1 - score / 100);

  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      {/* Ambient vermilion glow behind the phone */}
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-[#E14434]/10 blur-[60px]" />

      <div
        ref={reduced ? undefined : tilt.ref}
        onMouseMove={reduced ? undefined : tilt.onMouseMove}
        onMouseLeave={reduced ? undefined : tilt.onMouseLeave}
        className="relative mx-auto w-[300px] sm:w-[320px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Phone frame */}
        <div className="relative overflow-hidden rounded-[2.4rem] border border-[#1c1917]/10 bg-[#1C1917] p-1.5 shadow-[0_30px_70px_-20px_rgba(28,25,23,0.45)]">
          {/* Notch */}
          <div className="absolute left-1/2 top-1.5 z-20 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-[#1C1917]" />

          {/* Screen */}
          <div className="relative overflow-hidden rounded-[2rem] bg-[#FBF8F2] px-4 pb-4 pt-7">
            {/* App header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#E14434] text-[10px] font-bold text-white">A</div>
                <span className="text-[12px] font-semibold tracking-tight text-[#1C1917]">AuraCheck</span>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-600">Report ready</span>
            </div>

            {/* Score card */}
            <div className="mb-2.5 flex items-center gap-3 rounded-2xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] p-3.5">
              <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                  <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(28,25,23,0.07)" strokeWidth={6} />
                  <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#22c55e" strokeWidth={6} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold leading-none text-[#1C1917]">{score}</span>
                  <span className="text-[9px] text-[#857b6e]">/ 100</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-[#857b6e]">Your Aura Score</div>
                <div className="mt-0.5 text-[13px] font-semibold text-[#1C1917]">Solid base.</div>
                <div className="mt-0.5 text-[11px] leading-snug text-[#6f675e]">Two quick fixes from a strong profile.</div>
              </div>
            </div>

            {/* Top fix callout (measured) */}
            <div className="mb-2.5 rounded-xl border border-amber-400/30 bg-amber-500/[0.07] p-2.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[9px] text-amber-600">!</span>
                <span className="text-[10px] font-semibold text-amber-700">Fix this first</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-[#4a443d]">
                <span className="font-semibold text-[#1C1917]">Eye contact</span> — you&apos;re looking slightly off-lens. Look straight down the barrel.
              </p>
            </div>

            {/* Strongest signals */}
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[#857b6e]">Working for you:</span>
              {["Framing", "Colour", "Background"].map((s) => (
                <span key={s} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-600">{s}</span>
              ))}
            </div>

            {/* Two score bars (mirrors the real breakdown) */}
            <div className="space-y-2">
              {[
                { label: "💡 Lighting", value: 68, rating: "Good", grad: "from-blue-500 to-cyan-400" },
                { label: "✂️ Grooming", value: 82, rating: "Excellent", grad: "from-emerald-500 to-green-400" },
              ].map((b) => (
                <div key={b.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#6f675e]">{b.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-[#857b6e]">{b.rating}</span>
                      <span className="text-[10px] font-bold text-[#1C1917]">{b.value}</span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#1c1917]/[0.05]">
                    <div className={`h-full rounded-full bg-gradient-to-r ${b.grad}`} style={{ width: `${b.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Locked teaser — real paywall */}
            <div className="relative mt-2.5 overflow-hidden rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] p-3">
              <div className="select-none blur-[3px]" aria-hidden="true">
                <div className="mb-1 text-[10px] font-semibold text-[#1C1917]">Skin & presence detail</div>
                <div className="h-1.5 w-4/5 rounded-full bg-[#1c1917]/10" />
                <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-[#1c1917]/10" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-[#E14434] px-3 py-1 text-[10px] font-semibold text-white shadow-sm">
                  🔓 Unlock full report · ₹25
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
