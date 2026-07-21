"use client";

import Link from "next/link";
import { useRef, useCallback } from "react";

interface LockedSectionProps {
  /** when false, children render normally (paid users) */
  locked: boolean;
  /** short name of what's hidden, e.g. "Quick Fixes" */
  label: string;
  /** where the unlock CTA goes */
  unlockHref: string;
  children: React.ReactNode;
}

/**
 * Paywall wrapper: paid users see the content; free users see a blurred,
 * unclickable glimpse underneath a 3D-tilting lock card. The blur IS the
 * pitch — real personalized content is visibly there, just out of reach.
 */
export function LockedSection({ locked, label, unlockHref, children }: LockedSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) translateZ(14px)`;
  }, []);
  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  }, []);

  if (!locked) return <>{children}</>;

  return (
    <div className="relative mb-6">
      {/* the real content, blurred and inert — a glimpse, not a gift */}
      <div className="pointer-events-none select-none blur-[7px] opacity-80" aria-hidden="true">
        {children}
      </div>
      {/* soft bone wash so the blur reads as locked, not broken */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F2ECE1]/10 via-transparent to-[#F2ECE1]/60" />
      {/* 3D lock card */}
      <div className="absolute inset-0 flex items-center justify-center" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div
          ref={cardRef}
          className="mx-4 rounded-2xl border border-[#E14434]/25 bg-[#F7F1E6]/95 px-6 py-5 text-center shadow-[0_10px_30px_rgba(28,25,23,0.18),0_30px_60px_-20px_rgba(225,68,52,0.25)] backdrop-blur-md transition-transform duration-200"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E14434]/10 text-lg" style={{ transform: "translateZ(26px)" }}>
            🔒
          </div>
          <p className="text-sm font-semibold text-[#1C1917]" style={{ transform: "translateZ(20px)" }}>
            {label} — in the full report
          </p>
          <p className="mx-auto mt-1 max-w-[240px] text-[11px] leading-relaxed text-[#857b6e]" style={{ transform: "translateZ(14px)" }}>
            Personalized to your photo&apos;s exact measurements.
          </p>
          <Link
            href={unlockHref}
            className="mt-3 inline-block rounded-xl bg-gradient-to-r from-[#E14434] to-[#c0341f] px-5 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-[1.04]"
            style={{ transform: "translateZ(30px)" }}
          >
            Unlock Full Report
          </Link>
        </div>
      </div>
    </div>
  );
}
