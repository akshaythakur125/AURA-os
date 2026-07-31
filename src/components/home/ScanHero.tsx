"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";

/**
 * The homepage hero, made to *perform* the product: a photo gets scanned in a
 * canvas (sweep + landmark rings), the signal tags fade in, and the score
 * counts up. Pure Canvas + CSS — no 3D engine — so it stays fast on the mobile
 * India launch while still landing the "wow". Everything points at one action:
 * scan my photo.
 */
const MARKS: [number, number][] = [
  [0.5, 0.30], [0.38, 0.40], [0.62, 0.40], [0.5, 0.52],
  [0.42, 0.62], [0.58, 0.62], [0.5, 0.68], [0.35, 0.34], [0.65, 0.34],
];

// App light-theme tokens (the site commits to the warm theme).
const C = { ink: "#1C1917", accent: "#E14434", card: "#FFFFFF", card2: "#F2ECE1", faint: "rgba(28,25,23,0.10)" };

export function ScanHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [tagsIn, setTagsIn] = useState(false);

  useEffect(() => {
    const cv = canvasRef.current, card = cardRef.current;
    if (!cv || !card) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.width, H = cv.height;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function mix(a: string, b: string, t: number) {
      const pa = hex(a), pb = hex(b);
      return `rgb(${Math.round(pa[0] + (pb[0] - pa[0]) * t)},${Math.round(pa[1] + (pb[1] - pa[1]) * t)},${Math.round(pa[2] + (pb[2] - pa[2]) * t)})`;
    }
    function hex(h: string): [number, number, number] {
      const s = h.replace("#", "");
      return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
    }

    function portrait() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, C.card2); bg.addColorStop(1, C.card);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const cx = W * 0.5, cy = H * 0.42, r = W * 0.22;
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.2, cx, cy, r * 1.5);
      g.addColorStop(0, mix(C.ink, C.card, 0.74));
      g.addColorStop(1, mix(C.ink, C.card, 0.9));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.82, r, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.7, H);
      ctx.quadraticCurveTo(cx - r * 1.5, cy + r * 1.05, cx, cy + r * 1.15);
      ctx.quadraticCurveTo(cx + r * 1.5, cy + r * 1.05, cx + r * 1.7, H);
      ctx.closePath(); ctx.fill();
    }

    function draw(scanY: number) {
      if (!ctx) return;
      portrait();
      ctx.strokeStyle = "rgba(28,25,23,0.08)"; ctx.lineWidth = 1;
      for (let gx = 0; gx <= W; gx += W / 8) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (let gy = 0; gy <= H; gy += H / 10) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      for (const [mxN, myN] of MARKS) {
        const my = myN * H;
        if (my < scanY) {
          const mx = mxN * W;
          ctx.beginPath(); ctx.arc(mx, my, 7, 0, Math.PI * 2); ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.stroke();
          ctx.beginPath(); ctx.arc(mx, my, 2.2, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
        }
      }
      const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY);
      grad.addColorStop(0, "rgba(225,68,52,0)"); grad.addColorStop(1, "rgba(225,68,52,0.16)");
      ctx.fillStyle = grad; ctx.fillRect(0, scanY - 60, W, 60);
      ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(W, scanY); ctx.stroke();
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(W - 18, scanY, 4, 0, Math.PI * 2); ctx.fill();
    }

    let raf = 0, scanY = -20, running = false, payoff = 0;
    function countUp() {
      setTagsIn(true);
      const start = performance.now();
      function tick(now: number) {
        const p = Math.min(1, (now - start) / 900);
        setScore(Math.round(82 * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    function loop() {
      scanY += H / 150;
      if (scanY > H + 40) scanY = -20;
      draw(scanY);
      raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting && !running) {
        running = true;
        if (reduce) { draw(H); setScore(82); setTagsIn(true); return; }
        loop();
        // Resolve the score + tags on a timer, independent of the ambient scan's
        // frame rate — so the payoff always lands even on a throttled GPU.
        payoff = window.setTimeout(countUp, 1100);
      }
    }, { threshold: 0.2 });
    io.observe(card);
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(payoff); };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#FBF8F2]/60">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_30%,rgba(225,68,52,0.07),transparent_55%),radial-gradient(ellipse_at_10%_90%,rgba(28,25,23,0.05),transparent_50%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: "linear-gradient(rgba(28,25,23,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(28,25,23,0.04) 1px, transparent 1px)", backgroundSize: "44px 44px" }}
      />
      <Container className="relative py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Copy */}
          <div className="order-2 lg:order-1">
            <FadeInView>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#B23A25]">
                <span className="h-px w-5 bg-[#E14434]" /> First impressions, measured
              </span>
            </FadeInView>
            <FadeInView delay={80}>
              <h1 className="mt-5 text-balance text-4xl font-bold leading-[0.98] tracking-tight text-[#1C1917] sm:text-5xl lg:text-6xl">
                Your photo has a <span className="text-[#E14434]">score</span>. Now you can read it.
              </h1>
            </FadeInView>
            <FadeInView delay={160}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-[#6F675E] sm:text-lg">
                A stranger judges your photo in about 50 milliseconds. AuraCheck measures the same signals — lighting, framing, expression, colour — and hands you the exact fixes. Free, private, in your browser.
              </p>
            </FadeInView>
            <FadeInView delay={240}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/audit/new"><Button variant="solid" size="lg" className="w-full px-8 py-4 text-base font-semibold sm:w-auto">Scan my photo — free →</Button></Link>
                <Link href="/examples"><Button variant="outline" size="lg" className="w-full border-[#1c1917]/25! px-8 py-4 text-base text-[#1C1917]! hover:bg-[#1c1917]/[0.05]! sm:w-auto">See a sample read</Button></Link>
              </div>
            </FadeInView>
            <FadeInView delay={320}>
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] tracking-wide text-[#8B8175]">
                <span className="inline-flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-[#E14434]" /> No signup</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-[#E14434]" /> Stays on your device</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-[#E14434]" /> Under a minute</span>
              </div>
            </FadeInView>
          </div>

          {/* Scan card */}
          <div className="order-1 lg:order-2">
            <FadeInView delay={120}>
              <div
                ref={cardRef}
                className="relative mx-auto aspect-[4/5] w-full max-w-[400px] overflow-hidden rounded-[22px] border border-[#1c1917]/[0.08] bg-white shadow-[0_28px_64px_-32px_rgba(28,25,23,0.45)]"
                aria-label="Live photo analysis demo"
              >
                <canvas ref={canvasRef} width={640} height={800} className="block h-full w-full" />
                {(["lighting · side-lit", "expression · genuine", "background · clean"] as const).map((t, i) => (
                  <span
                    key={t}
                    className="absolute rounded-full border border-[#1c1917]/[0.08] bg-white/80 px-2.5 py-1 font-mono text-[11px] text-[#1C1917] backdrop-blur-sm transition-all duration-500"
                    style={{
                      opacity: tagsIn ? 1 : 0,
                      transform: tagsIn ? "none" : "translateY(6px)",
                      transitionDelay: `${200 + i * 300}ms`,
                      ...(i === 0 ? { top: 14, right: 16 } : i === 1 ? { top: "30%", left: 14 } : { top: "52%", right: 14 }),
                    }}
                  >
                    {t}
                  </span>
                ))}
                <div className="absolute bottom-4 left-4 flex items-baseline gap-2.5 rounded-2xl border border-[#1c1917]/[0.08] bg-white/80 px-3.5 py-3 backdrop-blur-sm">
                  <span className="font-mono text-[2.6rem] font-bold leading-none tracking-tight tabular-nums text-[#1C1917]">{score}</span>
                  <div>
                    <div className="font-mono text-sm text-[#857b6e]">/100</div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#B23A25]">Strong potential</div>
                  </div>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </Container>
    </section>
  );
}
