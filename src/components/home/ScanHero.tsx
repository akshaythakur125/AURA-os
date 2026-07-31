"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";

/**
 * The homepage hero, made to *perform* the product: a REAL face photo gets
 * scanned — a sweep line runs down it, facial landmark points light up as it
 * passes, the signal tags fade in, and the score counts up. The photo is the
 * base layer; a transparent canvas draws the analysis overlay on top; the tags
 * and score sit at real depth (translateZ) on a preserve-3d card that tilts
 * (ambient + gyro + pointer) so they pop off the face. Everything points at one
 * action: scan my photo.
 */
const HERO_PHOTO = "/celebs/instagram-photoshoot.jpg";
// Framing so the face lands in the upper-centre of the 4:5 card.
const HERO_FOCUS = "34% 4%";

// Landmark points over the face region (normalised to the card), roughly on
// brow / eyes / nose / mouth / jaw — they illuminate as the scan line passes.
const MARKS: [number, number][] = [
  [0.5, 0.16], [0.4, 0.20], [0.6, 0.20], [0.5, 0.26],
  [0.44, 0.32], [0.56, 0.32], [0.5, 0.38], [0.35, 0.22], [0.65, 0.22],
];

const ACCENT = "#E14434";

export function ScanHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [tagsIn, setTagsIn] = useState(false);

  // 3D depth engine. Drives the card's rotation every frame from three sources
  // so the depth is alive on ANY device, not just under a mouse:
  //   • ambient — a slow sine sway, always on (this is what mobile mostly sees);
  //   • gyroscope — tilt the phone, the card tilts with it (mobile "wow");
  //   • pointer — follows the cursor on desktop.
  // The layers sit at different translateZ, so this rotation parallaxes them for
  // real depth. Skipped only for reduced-motion.
  useEffect(() => {
    const el = cardRef.current;
    const wrap = el?.parentElement;
    if (!el || !wrap) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0, raf = 0;
    const t0 = performance.now();

    const onPointer = (e: PointerEvent) => {
      if (matchMedia("(pointer: coarse)").matches) return; // touch handled by gyro/ambient
      const r = el.getBoundingClientRect();
      targetRX = -((e.clientY - r.top) / r.height - 0.5) * 12;
      targetRY = ((e.clientX - r.left) / r.width - 0.5) * 14;
    };
    const onLeave = () => { targetRX = 0; targetRY = 0; };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      const clamp = (v: number) => Math.max(-32, Math.min(32, v));
      targetRX = -clamp(e.beta - 42) * 0.3; // ~42° = a comfortable holding angle
      targetRY = clamp(e.gamma) * 0.55;
    };

    wrap.addEventListener("pointermove", onPointer);
    wrap.addEventListener("pointerleave", onLeave);
    window.addEventListener("deviceorientation", onOrient);

    const frame = (now: number) => {
      const s = (now - t0) / 1000;
      // Ambient sway is added on top of whatever pointer/gyro asks for, so the
      // card always breathes even with no input.
      const tRX = targetRX + Math.sin(s * 0.7) * 3;
      const tRY = targetRY + Math.cos(s * 0.52) * 4.4;
      curRX += (tRX - curRX) * 0.07;
      curRY += (tRY - curRY) * 0.07;
      el.style.transform = `rotateX(${curRX.toFixed(2)}deg) rotateY(${curRY.toFixed(2)}deg)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onPointer);
      wrap.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, []);

  useEffect(() => {
    const cv = canvasRef.current, card = cardRef.current;
    if (!cv || !card) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.width, H = cv.height;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The canvas is a TRANSPARENT overlay on top of the real face photo — it
    // draws only the analysis: a faint mesh, landmark points that light up as
    // the scan line passes, and the sweep line itself with its glow.
    function draw(scanY: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Faint measurement mesh over the photo.
      ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
      for (let gx = 0; gx <= W; gx += W / 8) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (let gy = 0; gy <= H; gy += H / 10) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

      // Landmark points — appear once the scan has swept past them.
      for (const [mxN, myN] of MARKS) {
        const my = myN * H;
        if (my >= scanY) continue;
        const mx = mxN * W;
        const fresh = scanY - my < 90; // brief flare right after the line passes
        ctx.beginPath(); ctx.arc(mx, my, fresh ? 9 : 7, 0, Math.PI * 2);
        ctx.strokeStyle = fresh ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)";
        ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(mx, my, 2.4, 0, Math.PI * 2); ctx.fillStyle = ACCENT; ctx.fill();
      }

      // Scan sweep: a soft leading glow + the bright line + an end node.
      const grad = ctx.createLinearGradient(0, scanY - 80, 0, scanY);
      grad.addColorStop(0, "rgba(225,68,52,0)"); grad.addColorStop(1, "rgba(225,68,52,0.28)");
      ctx.fillStyle = grad; ctx.fillRect(0, scanY - 80, W, 80);
      ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(W, scanY); ctx.stroke();
      ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(W - 18, scanY, 4.5, 0, Math.PI * 2); ctx.fill();
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
             <div className="mx-auto w-full max-w-[400px] [perspective:1100px] [perspective-origin:50%_40%]">
              <div
                ref={cardRef}
                className="relative aspect-[4/5] w-full rounded-[22px] border border-[#1c1917]/[0.08] bg-white shadow-[0_28px_64px_-32px_rgba(28,25,23,0.45)] [transform-style:preserve-3d] will-change-transform"
                aria-label="Live photo analysis demo"
              >
                {/* Base layer — the REAL face being analysed, clipped to the card.
                    Kept in its own overflow-hidden wrapper so the CARD itself can
                    stay a real 3D context (overflow:hidden would flatten it). */}
                <div className="absolute inset-0 overflow-hidden rounded-[22px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HERO_PHOTO}
                    alt="A portrait being analysed by AuraCheck"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: HERO_FOCUS }}
                  />
                  {/* Readability + brand tint so the white overlay and chips read
                      cleanly against any photo. */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, rgba(20,14,11,0.20), rgba(20,14,11,0.02) 38%, rgba(20,14,11,0.45))" }}
                  />
                  <canvas ref={canvasRef} width={640} height={800} className="absolute inset-0 block h-full w-full" />
                </div>
                {/* Floating signal tags — lifted toward the viewer so the card's
                    rotation parallaxes them over the face. */}
                {(["lighting · side-lit", "expression · genuine", "background · clean"] as const).map((t, i) => (
                  <span
                    key={t}
                    className="absolute rounded-full border border-[#1c1917]/[0.08] bg-white/80 px-2.5 py-1 font-mono text-[11px] text-[#1C1917] shadow-[0_6px_18px_-8px_rgba(28,25,23,0.5)] backdrop-blur-sm transition-[opacity] duration-500"
                    style={{
                      opacity: tagsIn ? 1 : 0,
                      transform: `translateZ(42px) translateY(${tagsIn ? 0 : 6}px)`,
                      transitionDelay: `${200 + i * 300}ms`,
                      ...(i === 0 ? { top: 14, right: 16 } : i === 1 ? { top: "30%", left: 14 } : { top: "52%", right: 14 }),
                    }}
                  >
                    {t}
                  </span>
                ))}
                {/* Score chip — closest to the viewer, strongest parallax. */}
                <div className="absolute bottom-4 left-4 flex items-baseline gap-2.5 rounded-2xl border border-[#1c1917]/[0.08] bg-white/85 px-3.5 py-3 shadow-[0_12px_30px_-12px_rgba(28,25,23,0.55)] backdrop-blur-sm" style={{ transform: "translateZ(72px)" }}>
                  <span className="font-mono text-[2.6rem] font-bold leading-none tracking-tight tabular-nums text-[#1C1917]">{score}</span>
                  <div>
                    <div className="font-mono text-sm text-[#857b6e]">/100</div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#B23A25]">Strong potential</div>
                  </div>
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
