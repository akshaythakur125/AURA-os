"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";

/**
 * The homepage's "what the scan reads" beat — the same signals + now→ceiling
 * story the report tells, animated on scroll: bars fill, numbers count up, the
 * ceiling gap resolves. Product-true (these are the real measured dimensions),
 * and it earns the ₹21 pitch before the shopping sections below.
 */
const SIGNALS: { name: string; val: number; note: string }[] = [
  { name: "Clarity", val: 68, note: "Slightly soft — wipe the lens, tap-to-focus, shoot on the rear camera." },
  { name: "Composition", val: 78, note: "Well framed. Eyes near the top-third line — keep it." },
  { name: "Lighting", val: 55, note: "Face reads darker than the background — turn toward a window." },
  { name: "Background", val: 80, note: "Clean and controlled — it supports you instead of competing." },
  { name: "Colour", val: 60, note: "A touch cool — a small warmth tweak makes skin read healthier." },
  { name: "Expression", val: 85, note: "Genuine, eyes engaged — the hardest thing to fake, and you've got it." },
];

function useCountUp(target: number, run: boolean, dur = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(target); return; }
    let raf = 0; const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Guarantee the final value even if rAF is throttled or stalled.
    const done = window.setTimeout(() => setN(target), dur + 200);
    return () => { cancelAnimationFrame(raf); clearTimeout(done); };
  }, [run, target, dur]);
  return n;
}

function SignalRow({ s, run }: { s: (typeof SIGNALS)[number]; run: boolean }) {
  const n = useCountUp(s.val, run);
  return (
    <div className="border-t border-[#1c1917]/[0.1] pt-4">
      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-[#1C1917]">{s.name}</span>
        <span className="font-mono text-lg font-bold tabular-nums text-[#1C1917]">{n}</span>
      </div>
      <div className="relative mt-3 h-1.5 overflow-hidden rounded bg-[#F2ECE1]">
        <i
          className="absolute inset-y-0 left-0 rounded bg-[#E14434] transition-[width] duration-1000 ease-out"
          style={{ width: run ? `${s.val}%` : "0%" }}
        />
      </div>
      <p className="mt-2 text-xs text-[#857b6e]">{s.note}</p>
    </div>
  );
}

export function ScanSignals() {
  const sigRef = useRef<HTMLDivElement>(null);
  const ceilRef = useRef<HTMLDivElement>(null);
  const [sigRun, setSigRun] = useState(false);
  const [ceilRun, setCeilRun] = useState(false);
  const now = useCountUp(66, ceilRun, 1000);
  const ceil = useCountUp(81, ceilRun, 1400);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        if (en.target === sigRef.current) setSigRun(true);
        if (en.target === ceilRef.current) setCeilRun(true);
        io.unobserve(en.target);
      });
    }, { threshold: 0.3 });
    if (sigRef.current) io.observe(sigRef.current);
    if (ceilRef.current) io.observe(ceilRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative border-t border-[#1c1917]/[0.08] bg-[#FBF8F2] py-16 sm:py-24">
      <Container>
        <FadeInView>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#B23A25]">
            <span className="h-px w-5 bg-[#E14434]" /> The read
          </span>
          <h2 className="mt-4 max-w-[20ch] text-balance text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">
            Seven signals a stranger reads before you say a word.
          </h2>
          <p className="mt-4 max-w-[52ch] text-[#6F675E]">
            Each one is measured off your actual pixels — not a vibe, a number. Here&apos;s a real read, low to high.
          </p>
        </FadeInView>

        <div ref={sigRef} className="mt-11 grid gap-x-10 gap-y-3.5 sm:grid-cols-2">
          {SIGNALS.map((s) => (
            <SignalRow key={s.name} s={s} run={sigRun} />
          ))}
        </div>

        {/* Now → ceiling */}
        <div className="mt-16">
          <FadeInView>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#B23A25]">
              <span className="h-px w-5 bg-[#E14434]" /> The gap
            </span>
            <h2 className="mt-4 max-w-[22ch] text-balance text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl">
              You&apos;re at 66. This photo can hit 81.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[#6F675E]">
              Most of that gap is free — lighting and a warmth tweak alone move the needle. The full report shows the exact 15 points you&apos;re leaving on the table.
            </p>
          </FadeInView>

          <div
            ref={ceilRef}
            className="mt-9 grid items-center gap-6 rounded-[22px] border border-[#1c1917]/[0.08] bg-white p-6 shadow-[0_24px_60px_-32px_rgba(28,25,23,0.4)] sm:grid-cols-[auto_1fr_auto] sm:gap-11 sm:p-10"
          >
            <div className="text-center">
              <div className="font-mono text-4xl font-bold tabular-nums leading-none tracking-tight text-[#1C1917] sm:text-5xl">{now}</div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#857b6e]">now</div>
            </div>
            <div>
              <div className="relative h-2.5 overflow-hidden rounded-md bg-[#F2ECE1]">
                <i
                  className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-[#E14434] to-[#ff8a4c] transition-[width] duration-[1400ms] ease-out"
                  style={{ width: ceilRun ? "81%" : "0%" }}
                />
              </div>
              <p className="mt-3 text-center font-mono text-xs tracking-wide text-[#857b6e]">+15 points on the table · start with lighting</p>
            </div>
            <div className="text-center">
              <div className="font-mono text-4xl font-bold tabular-nums leading-none tracking-tight text-[#E14434] sm:text-5xl">{ceil}</div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#857b6e]">your ceiling</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
