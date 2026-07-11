"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMouseTilt } from "@/hooks/useMouseTilt";

interface HeroMockupProps {
  depthRef?: RefObject<HTMLDivElement | null>;
  entranceRef?: RefObject<HTMLDivElement | null>;
}

export function HeroMockup({ depthRef, entranceRef }: HeroMockupProps) {
  const tilt = useMouseTilt({ maxTilt: 6, scale: 1.02 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return (
    <div ref={depthRef} className="mx-auto mt-16 max-w-lg px-4 sm:mt-20" style={{ transformStyle: "preserve-3d" }}>
      <div ref={entranceRef} style={{ transformStyle: "preserve-3d", opacity: 0 }}>
      <div
        ref={tilt.ref}
        onMouseMove={reducedMotion ? undefined : tilt.onMouseMove}
        onMouseLeave={reducedMotion ? undefined : tilt.onMouseLeave}
        className="relative cursor-default"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Phone frame */}
        <div className="relative mx-auto max-w-[320px] overflow-hidden rounded-[2.5rem] border-[3px] border-white/[0.08] bg-[#0a0a0f] shadow-[0_0_80px_rgba(147,51,234,0.15),0_20px_60px_rgba(0,0,0,0.5)]">
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[#0a0a0f]" />

          {/* Screen content */}
          <div className="relative min-h-[520px] overflow-hidden bg-gradient-to-b from-[#0d0d1a] to-[#0a0a0f] p-5 pt-10">
            {/* Status bar */}
            <div className="mb-4 flex items-center justify-between text-[10px] text-gray-500">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg>
              </div>
            </div>

            {/* App header */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-blue-500">
                <span className="text-[10px] font-bold text-white">A</span>
              </div>
              <span className="text-xs font-semibold text-white">AuraCheck</span>
            </div>

            {/* Score card - real UI */}
            <div className="mb-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="mb-2 text-[10px] text-gray-500">Your Aura Score</div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">72</span>
                <span className="mb-1 text-sm text-gray-500">/100</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-rose-500 to-blue-500" />
              </div>
              <div className="mt-2 text-[10px] text-gray-400">
                Your strongest signal is <span className="text-emerald-400">background control</span>.
              </div>
            </div>

            {/* Leak callout - real UI */}
            <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20">
                  <span className="text-[10px]">!</span>
                </div>
                <span className="text-[10px] font-medium text-amber-300">Photo-Quality Issue Detected</span>
              </div>
              <p className="mt-1.5 text-[11px] text-gray-300">
                <span className="font-medium text-white">Lighting</span> — flat, overhead lighting
                washes out dimension and reads as low-effort.
              </p>
            </div>

            {/* Strongest signals */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {["Background", "Color", "Composition"].map((s) => (
                <span key={s} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-400">
                  {s}
                </span>
              ))}
            </div>

            {/* Blur preview - locked content teaser */}
            <div className="relative overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
              <div className="blur-[2px]">
                <div className="mb-1 text-[10px] font-medium text-white">Clarity Leak</div>
                <div className="text-[10px] text-gray-400">
                  Slight motion blur from unstable framing reduces sharpness...
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-rose-600/80 px-3 py-1 text-[9px] font-medium text-white backdrop-blur-sm">
                  Unlock to see all leaks
                </span>
              </div>
            </div>

            {/* Bottom fade */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
          </div>
        </div>

        {/* Ambient glow behind phone */}
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-rose-500/10 blur-[60px]" />
      </div>
      </div>
    </div>
  );
}
