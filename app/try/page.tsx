"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createAudit } from "@/lib/storage/auditStore";
import { validateImage, processImage } from "@/lib/image/processImage";
import { trackEvent } from "@/lib/storage/analyticsStore";

const DEMO_LEAKS = [
  { label: "Washed-out top drains your skin tone", delta: "+9 pts", kind: "leak" as const },
  { label: "Oversized fit hides your frame", delta: "+6 pts", kind: "leak" as const },
  { label: "Grooming — clean, on point", delta: "locked", kind: "pass" as const },
];

const PROOF = [
  { initials: "AK", city: "Bangalore", before: 58, after: 84, fix: "Outfit contrast", time: "4 wk", gradient: "from-purple-500 to-pink-500" },
  { initials: "RJ", city: "Mumbai", before: 45, after: 76, fix: "Background clutter", time: "3 wk", gradient: "from-sky-500 to-indigo-500" },
  { initials: "SM", city: "Delhi", before: 62, after: 91, fix: "Flat lighting", time: "6 wk", gradient: "from-emerald-500 to-teal-500" },
  { initials: "VP", city: "Pune", before: 51, after: 79, fix: "Neutral expression", time: "2 wk", gradient: "from-amber-500 to-orange-500" },
];

export default function TryPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    trackEvent("landing_page_viewed", {
      source: typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("utm_source") ?? "direct"
        : "direct",
    });
  }, []);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const target = 78;
    const duration = 2200;
    function tick(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setProcessing(true);
    trackEvent("landing_cta_clicked", { action: "upload" });
    processImage(file)
      .then((result) => {
        const audit = createAudit({
          auditType: "photo",
          goal: "glowup",
          budgetRange: "5000",
          imageDataUrl: result.dataUrl,
          imageMeta: result.meta,
        });
        router.push(`/audit/${audit.id}`);
      })
      .catch(() => {
        setError("Could not process that image. Try a different photo.");
        setProcessing(false);
      });
  }

  function handleCTA() {
    trackEvent("landing_cta_clicked", { action: "hero" });
    fileRef.current?.click();
  }

  const dashArray = `${(animatedScore / 100) * 327} 327`;

  return (
    <div
      className="min-h-dvh"
      style={{
        background: "linear-gradient(180deg, #050b14 0%, #09111f 20%, #0b172b 50%, #09111f 80%, #06101f 100%)",
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFile}
        className="hidden"
      />

      {/* ─── Minimal top bar ─── */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-[#07111f]/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-[linear-gradient(145deg,rgba(125,211,252,0.95),rgba(59,130,246,0.78),rgba(249,115,22,0.7))] text-xs font-black text-slate-950">
            <span className="display-font text-sm">A</span>
          </div>
          <span className="display-font text-base font-bold text-white">AuraCheck</span>
        </Link>
        <Button onClick={handleCTA} size="sm" disabled={processing}>
          {processing ? "Analyzing..." : "Try free"}
        </Button>
      </div>

      {/* ─── Hero (fills viewport) ─── */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 pb-12 pt-20">
        <div className="hero-grid absolute inset-0 opacity-60" />
        <div className="mesh-glow floating-orb absolute left-[-6rem] top-16 h-56 w-56 bg-sky-400/25" />
        <div className="mesh-glow floating-orb absolute bottom-20 right-[-5rem] h-64 w-64 bg-orange-400/20" />

        <div className="relative z-10 mx-auto max-w-lg text-center">
          {/* Animated score ring */}
          <div className="relative mx-auto mb-6 h-44 w-44 sm:h-52 sm:w-52">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke="url(#tryGrad)"
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={dashArray}
                className="transition-[stroke-dasharray] duration-100"
              />
              <defs>
                <linearGradient id="tryGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="display-font text-6xl font-bold text-white sm:text-7xl">{animatedScore}</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/50">aura score</div>
            </div>
            <div className="pulse-glow absolute -inset-3 rounded-full border border-sky-300/10" />
          </div>

          <h1 className="display-font text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Your photo has a score.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-white/65 sm:text-lg">
            Drop a selfie. See your aura in 8 seconds. Find out what&apos;s quietly holding your vibe back.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={handleCTA} size="lg" disabled={processing} className="cta-shine cta-breathe text-base">
              {processing ? "Processing..." : "Score my photo — free"}
            </Button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-white/50">
            <span>Free forever</span>
            <span className="text-white/20">|</span>
            <span>No sign-up</span>
            <span className="text-white/20">|</span>
            <span>Photo stays on your device</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ─── Social proof strip ─── */}
      <section className="border-y border-white/10 bg-white/[0.03] py-7">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-6 px-4 text-center sm:gap-10">
          <div>
            <div className="display-font text-2xl font-bold text-white">12,400+</div>
            <div className="text-[11px] text-white/50">vibe checks this week</div>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <div className="display-font text-2xl font-bold text-white">+24 pts</div>
            <div className="text-[11px] text-white/50">avg score jump after fix</div>
          </div>
          <div className="hidden h-8 w-px bg-white/15 sm:block" />
          <div className="hidden sm:block">
            <div className="display-font text-2xl font-bold text-white">8 sec</div>
            <div className="text-[11px] text-white/50">to get your score</div>
          </div>
        </div>
      </section>

      {/* ─── Sample report card ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center rounded-full border border-sky-200/20 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200">
              what you get
            </span>
            <h2 className="display-font mt-4 text-3xl font-bold text-white sm:text-4xl">
              Your free report looks like this.
            </h2>
          </div>

          <div className="prism-panel glow-frame rounded-[28px] p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="url(#demoGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray="255 327" />
                  <defs>
                    <linearGradient id="demoGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="display-font text-2xl font-bold text-white">78</div>
                  <div className="text-[7px] uppercase tracking-widest text-white/50">score</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Strong base. Two leaks holding you back.</div>
                <p className="mt-1 text-xs text-white/55">Fix both and hit 93. Here&apos;s what they are.</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {DEMO_LEAKS.map((leak) => (
                <div key={leak.label} className="flex items-center justify-between gap-3 rounded-[16px] bg-white/[0.06] px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${leak.kind === "leak" ? "bg-amber-400" : "bg-emerald-400"}`} />
                    <span className="text-xs text-white/80">{leak.label}</span>
                  </div>
                  <span className={`shrink-0 text-[11px] font-semibold ${leak.kind === "leak" ? "text-sky-300" : "text-white/25"}`}>
                    {leak.delta === "locked" ? (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/35">unlock</span>
                    ) : leak.delta}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[16px] bg-sky-400/10 px-4 py-3 text-center">
              <span className="text-xs font-semibold text-sky-200">
                Fix both leaks → estimated score 93
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="display-font mb-10 text-center text-3xl font-bold text-white sm:text-4xl">
            20 seconds. Three steps.
          </h2>
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {[
              { step: "01", title: "Drop a photo", desc: "Selfie, mirror pic, dating profile — anything.", color: "from-sky-400 to-blue-500" },
              { step: "02", title: "Get the read", desc: "Score out of 100 + the leaks dragging it down.", color: "from-purple-400 to-violet-500" },
              { step: "03", title: "Fix or shop it", desc: "One-tap fixes or shop the pieces that patch the leak.", color: "from-amber-400 to-orange-500" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-lg`}>
                  <span className="display-font text-2xl font-black text-white">{s.step}</span>
                </div>
                <h3 className="display-font mb-2 text-xl font-bold text-white">{s.title}</h3>
                <p className="text-sm leading-relaxed text-white/55">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Real results ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              real results
            </span>
            <h2 className="display-font mt-4 text-3xl font-bold text-white sm:text-4xl">
              Small changes. Sharp jumps.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PROOF.map((p) => (
              <div key={p.initials} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${p.gradient} text-xs font-bold text-white`}>
                    {p.initials}
                  </div>
                  <div className="text-[11px] text-white/50">{p.city}</div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-lg font-bold text-white/45">{p.before}</span>
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-lg font-bold text-white">{p.after}</span>
                  <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                    +{p.after - p.before} pts
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
                  <span>Fixed: {p.fix}</span>
                  <span>{p.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing strip ─── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4">
          <div className="mb-8 text-center">
            <h2 className="display-font text-3xl font-bold text-white sm:text-4xl">
              Free score. Small money for the fix.
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { name: "Vibe Check", price: "Free", desc: "Score + #1 vibe leak", highlight: false },
              { name: "Fast Fix", price: "Rs 25", desc: "The single move that changes the most", highlight: false },
              { name: "Full Read", price: "Rs 44", desc: "Complete breakdown + step-by-step fix path", highlight: true },
              { name: "30-Day Reset", price: "Rs 499", desc: "Weekly missions + tracked progress", highlight: false },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`flex items-center justify-between rounded-[18px] px-5 py-4 ${
                  tier.highlight
                    ? "border border-sky-300/25 bg-sky-400/10 shadow-[0_0_30px_rgba(56,189,248,0.08)]"
                    : "border border-white/10 bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`display-font min-w-[52px] text-sm font-bold ${tier.highlight ? "text-sky-200" : "text-white/65"}`}>
                    {tier.price}
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${tier.highlight ? "text-white" : "text-white/85"}`}>{tier.name}</div>
                    <div className={`text-[11px] ${tier.highlight ? "text-white/55" : "text-white/45"}`}>{tier.desc}</div>
                  </div>
                </div>
                {tier.highlight && (
                  <span className="rounded-full bg-sky-400/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-sky-300">
                    popular
                  </span>
                )}
              </div>
            ))}
            <p className="text-center text-[11px] text-white/35">All payments via UPI. No subscription traps.</p>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="pb-24 pt-6 sm:pb-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="prism-panel glow-frame shine-sweep rounded-[32px] px-6 py-10 sm:px-10">
            <h2 className="display-font text-3xl font-bold text-white sm:text-4xl">
              Your next photo could hit different.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-white/55">
              One photo. Zero sign-ups. Takes 8 seconds.
            </p>
            <div className="mt-7">
              <Button onClick={handleCTA} size="lg" disabled={processing} className="cta-shine cta-breathe w-full max-w-xs text-base">
                {processing ? "Processing..." : "Score my photo — free"}
              </Button>
            </div>
          </div>

          <div className="mt-8 space-y-2 text-[10px] text-white/30">
            <p>Your photo never leaves your device. AuraCheck analyzes presentation signals, not human worth.</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/privacy" className="underline hover:text-white/50">Privacy</Link>
              <Link href="/terms" className="underline hover:text-white/50">Terms</Link>
              <Link href="/" className="underline hover:text-white/50">Home</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Sticky mobile CTA bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#07111f]/90 px-4 py-3 backdrop-blur-lg sm:hidden">
        <Button onClick={handleCTA} size="lg" disabled={processing} className="cta-shine cta-breathe w-full text-base">
          {processing ? "Processing..." : "Score my photo — free"}
        </Button>
      </div>
    </div>
  );
}
