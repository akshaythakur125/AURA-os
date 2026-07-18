"use client";

import { useEffect, useState } from "react";

/**
 * Subtle city-HUD label that names the "district" you're currently scrolling
 * through, tying the homepage sections to the 3D city behind them. Observes the
 * homepage <section>s and shows the matching district. Desktop-only, fixed to
 * the lower-left, pointer-events off — pure atmosphere.
 */
const DISTRICTS = [
  "Arrivals",
  "The Process",
  "Signal District",
  "Privacy Quarter",
  "Departures",
];

export function DistrictLabel() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("#main-content section"),
    ).slice(0, DISTRICTS.length);
    if (!sections.length) return;

    const ratios = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target, e.intersectionRatio);
        let best = -1;
        let bestRatio = 0.05;
        sections.forEach((s, i) => {
          const r = ratios.get(s) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = i;
          }
        });
        if (best >= 0) {
          setIndex(best);
          setShow(true);
        } else {
          setShow(false);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`pointer-events-none fixed bottom-6 left-6 z-30 hidden md:block transition-all duration-500 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2.5 rounded-full border border-[#1c1917]/10 bg-[#F2ECE1]/70 px-3.5 py-1.5 backdrop-blur-md">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E14434] opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E14434]" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8B8175]">
          District {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[11px] font-medium tracking-wide text-[#1C1917]">
          {DISTRICTS[index]}
        </span>
      </div>
    </div>
  );
}
