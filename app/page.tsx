'use client';

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { STYLE_SEARCH_SUGGESTIONS } from "@/config/styleSearchSuggestions";
import { ReferralBanner } from "@/components/marketing/ReferralBanner";
import { getMarqueePresets, getDailySubset } from "@/lib/marketing/rotatingPresets";
import { getHomepageProofEntries } from "@/data/homepageProof";
import { getGalleryEntries } from "@/lib/storage/galleryStore";

// ponytail: pure-CSS visual identity per feature — no images
const FEATURE_GRADIENTS: Record<string, string> = {
  "Aura Twin": "from-cyan-400/20 via-teal-500/10 to-transparent",
  "Wardrobe Scan": "from-emerald-400/20 via-green-500/10 to-transparent",
  "Glow-Up Challenges": "from-amber-400/20 via-orange-500/10 to-transparent",
  "Trend Shop": "from-sky-400/20 via-blue-500/10 to-transparent",
};
const FEATURE_EMOJI: Record<string, string> = {
  "Aura Twin": "👯",
  "Wardrobe Scan": "👕",
  "Glow-Up Challenges": "🔥",
  "Trend Shop": "🛍️",
};
const OFFER_GRADIENTS: Record<string, string> = {
  "Vibe Check": "from-sky-400/20 via-blue-500/10 to-transparent",
  "Fast Fix": "from-emerald-400/20 via-green-500/10 to-transparent",
  "Full Read": "from-violet-400/20 via-purple-500/10 to-transparent",
  "30-Day Reset": "from-amber-400/20 via-orange-500/10 to-transparent",
};
const OFFER_EMOJI: Record<string, string> = {
  "Vibe Check": "✨",
  "Fast Fix": "⚡",
  "Full Read": "📋",
  "30-Day Reset": "📅",
};

const marqueeStyles = getMarqueePresets();

const steps = [
  {
    number: "01",
    title: "Drop a photo",
    body: "Selfie, mirror fit, dating pic — anything.",
  },
  {
    number: "02",
    title: "Get your score",
    body: "Aura Score out of 100 + what's dragging it down.",
  },
  {
    number: "03",
    title: "Fix or shop",
    body: "Quick fix or shop the pieces across Myntra, Amazon, Flipkart.",
  },
];

const exploreCards = [
  {
    title: "Aura Twin",
    tag: "simulator",
    body: "Test-drive a look on your style twin before you spend.",
    href: "/twin-simulator",
  },
  {
    title: "Wardrobe Scan",
    tag: "diagnosis",
    body: "Show us your closet. We find the gaps.",
    href: "/wardrobe/diagnosis",
  },
  {
    title: "Glow-Up Challenges",
    tag: "streaks",
    body: "Daily missions that level up your look.",
    href: "/challenges",
  },
  {
    title: "Trend Shop",
    tag: "price compare",
    body: "Every trending look, pieces compared across 6 stores.",
    href: "/shop",
  },
];

const offerCards = [
  {
    name: "Vibe Check",
    price: "Free",
    body: "Your Aura Score + the #1 thing holding you back. No sign-up.",
    sub: "no card, no sign-up",
    cta: "Try it",
    href: "/audit/new",
  },
  {
    name: "Fast Fix",
    price: "₹49",
    body: "The single biggest fix for your score. One clear move.",
    sub: "less than a chai",
    cta: "Unlock",
    href: "/unlock?product=quick_fix",
  },
  {
    name: "Full Read",
    price: "₹99",
    body: "Full breakdown — fit, color, grooming, posture — with a fix path.",
    sub: "one chai + samosa",
    cta: "Get it",
    href: "/products/aura-report",
    featured: true,
  },
  {
    name: "30-Day Reset",
    price: "₹499",
    body: "30 days of weekly missions. The glow-up plan.",
    sub: "cheaper than a haircut",
    cta: "Start",
    href: "/products/glowup-plan",
  },
];

export default function HomePage() {
  const [showAllVibes, setShowAllVibes] = useState(false);
  const visibleVibes = showAllVibes ? STYLE_SEARCH_SUGGESTIONS : STYLE_SEARCH_SUGGESTIONS.slice(0, 12);
  return (
    <>
      <ReferralBanner />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14">
        <div className="hero-grid absolute inset-x-0 top-0 h-[40rem]" />
        <Container className="relative">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left — punchy copy */}
            <div className="max-w-2xl">
              <Badge variant="premium" className="mb-4 animate-pulse">
                              ✨ free vibe check
                            </Badge>
              <h1 className="display-font max-w-3xl text-5xl font-bold leading-[0.92] text-white sm:text-6xl lg:text-7xl">
                your vibe has a{" "}
                <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                                  score
                                </span>
                .
              </h1>
              <p className="mt-4 max-w-md text-base leading-6 text-white/55 sm:text-lg">
                              drop a photo. get your aura in 8 seconds. see what's off. fix it.
                            </p>
                            <p className="mt-2 text-xs text-white/40 italic">psst — your friends might already know theirs 👀</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/audit/new" className="cta-shine">check my vibe — free →</Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/examples">see an example</Link>
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/35">
                              <span>free forever</span>
                              <span aria-hidden>·</span>
                              <span>no sign-up</span>
                              <span aria-hidden>·</span>
                              <span>photo stays on your phone</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-[11px] text-white/45">
                              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span><span className="text-white/70 font-medium">12,847 vibes</span> checked this week</span>
                            </div>
            </div>

            {/* Right — greeting image */}
            <div className="relative mx-auto w-full max-w-[400px]">
              <div className="absolute -inset-10 rounded-full bg-gradient-to-br from-sky-400/30 via-blue-500/20 to-orange-400/25 blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=500&q=80&auto=format"
                alt="welcome to auracheck"
                className="relative w-full rounded-[32px] object-cover shadow-2xl"
                style={{ aspectRatio: "4/5" }}
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/50 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-sm font-semibold text-white">👋 welcome — ready for your vibe check?</p>
                <p className="mt-0.5 text-xs text-white/60">free, 8 seconds, no sign-up</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── HOW IT WORKS — ultra short ─── */}
      <section className="pb-14">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Badge>20 seconds</Badge>
            <h2 className="display-font mt-3 text-3xl font-bold text-white sm:text-4xl">
              start to finish.
            </h2>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {steps.map((step) => (
                        <Card key={step.number} hover className="float-card stagger-in p-5 overflow-hidden">
                          <div className="h-1.5 bg-gradient-to-r from-sky-400/20 via-blue-500/10 to-transparent" />
                          <div className="display-font text-sm font-bold text-sky-300">{step.number}</div>
                          <h3 className="display-font mt-2 text-xl font-bold text-white">{step.title}</h3>
                          <p className="mt-2 text-sm leading-5 text-white/55">{step.body}</p>
                        </Card>
                      ))}
                    </div>
        </Container>
      </section>

      {/* ─── STYLE SEARCH ─── */}
      <section className="pb-14">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="premium">100 vibes</Badge>
            <h2 className="display-font mt-3 text-3xl font-bold text-white sm:text-4xl">
              pick a vibe. we search it.
            </h2>
          </div>

          <div className="glass-panel glow-frame mt-6 rounded-[28px] p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              {visibleVibes.map((style) => (
                <Link
                  key={style.id}
                  href={`/wardrobe/search?query=${encodeURIComponent(style.query)}&sort=aura_best`}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-sky-300/30 hover:text-sky-200"
                >
                  {style.label}
                </Link>
              ))}
              {!showAllVibes && STYLE_SEARCH_SUGGESTIONS.length > 12 && (
                <button
                  onClick={() => setShowAllVibes(true)}
                  className="rounded-full border border-sky-300/20 bg-sky-300/5 px-3 py-1.5 text-xs text-sky-300 transition-colors hover:bg-sky-300/10"
                >
                  +{STYLE_SEARCH_SUGGESTIONS.length - 12} more vibes
                </button>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── CELEBRITY TRENDS ─── */}
      <section className="pb-14">
        <Container>
          <div className="prism-panel glow-frame shine-sweep overflow-hidden rounded-[28px] p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                  celebrity trend radar · refreshed every 72h
                </div>
                <h2 className="display-font mt-1.5 text-2xl font-bold text-white sm:text-3xl">
                  steal a look that&apos;s working.
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/battle"
                  className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-[11px] text-purple-300 transition-colors hover:bg-purple-500/15"
                >
                  ⚔️ Aura Battle <span className="rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[9px] text-purple-300">new</span>
                </Link>
                <Button asChild size="sm" variant="outline">
                  <Link href="/wardrobe/search">shop all</Link>
                </Button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div className="marquee-track gap-3 pr-3">
                {marqueeStyles.map((preset, index) => (
                  <Link
                    key={`${preset.id}-${index}`}
                    href={`/wardrobe/search?preset=${preset.id}&sort=cheapest`}
                    className="glass-card float-card block w-[220px] min-w-[220px] overflow-hidden rounded-[24px] p-2.5 hover:-translate-y-1"
                  >
                    <div className="overflow-hidden rounded-[20px]">
                      <img src={preset.imageSrc} alt={preset.celebrity} className="h-[260px] w-full object-cover" />
                    </div>
                    <div className="px-1 pb-1 pt-2">
                      <h3 className="text-sm font-semibold text-white">{preset.celebrity}</h3>
                      <p className="mt-0.5 text-xs text-sky-200">{preset.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── MORE WAYS TO PLAY ─── */}
      <section className="pb-14">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Badge>more than a score</Badge>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {exploreCards.map((item) => (
                          <Card key={item.title} hover className="float-card stagger-in neon-hover group p-5 overflow-hidden">
                            <div className={`h-1.5 bg-gradient-to-r ${FEATURE_GRADIENTS[item.title] || "from-white/5 to-transparent"}`} />
                            <div className="text-[10px] uppercase tracking-[0.2em] text-sky-300/70">{item.tag}</div>
                            <h3 className="display-font mt-2 text-xl font-bold text-white">{FEATURE_EMOJI[item.title] || "✨"} {item.title}</h3>
                            <p className="mt-2 text-sm leading-5 text-white/55">{item.body}</p>
                            <div className="mt-4">
                              <Button asChild size="sm" variant="secondary" className="w-full">
                                <Link href={item.href}>Open</Link>
                              </Button>
                            </div>
                          </Card>
                        ))}
          </div>
        </Container>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="pb-14">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-3">real vibe checks</Badge>
            <h2 className="display-font text-3xl font-bold text-white sm:text-4xl">
              small changes, sharp jumps.
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              <Link href="/gallery" className="text-purple-400 hover:text-purple-300 underline">
                view full gallery →
              </Link>
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const realEntries = typeof window !== "undefined" ? getGalleryEntries("recent", 6) : [];
              if (realEntries.length >= 3) {
                return realEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="prism-panel float-card stagger-in neon-hover group rounded-[22px] p-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-xs font-bold text-white">
                        {entry.nickname.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{entry.nickname}</div>
                        {entry.city && <div className="text-[10px] text-white/40">{entry.city}</div>}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-bold text-white">{entry.score}</span>
                      <span className="text-xs text-gray-500">/100</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                        {entry.strongestSignal}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[11px] text-white/50 italic">&quot;{entry.oneLineVerdict}&quot;</div>
                  </div>
                ));
              }
              return getDailySubset(getHomepageProofEntries(), 6).map((entry) => (
                <div
                  key={entry.initials}
                  className="prism-panel float-card stagger-in neon-hover group rounded-[22px] p-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${entry.gradient} text-xs font-bold text-white`}
                    >
                      {entry.initials}
                    </div>
                    <div className="text-[10px] text-white/40">{entry.city}</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-lg font-bold text-white/50">{entry.beforeScore}</span>
                    <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-lg font-bold text-white">{entry.afterScore}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">{entry.leakLabel}</span>
                    <span className="font-medium text-emerald-400">+{entry.pointsGained} pts</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </Container>
      </section>

      {/* ─── PRICING — playful, not corporate ─── */}
      <section className="pb-14">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="premium">simple pricing</Badge>
            <h2 className="display-font mt-3 text-3xl font-bold text-white sm:text-4xl">
              free scores. small money for the fix.
            </h2>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-4">
                      {offerCards.map((offer) => (
                        <Card
                          key={offer.name}
                          hover
                          className={`float-card stagger-in overflow-hidden ${offer.featured ? "border-sky-200/25 shadow-[0_20px_70px_rgba(56,189,248,0.14)]" : ""}`}
                        >
                          <div className={`h-1.5 bg-gradient-to-r ${OFFER_GRADIENTS[offer.name] || "from-white/5 to-transparent"}`} />
                          <div className="flex items-center justify-between">
                            <div className="display-font text-2xl font-bold text-white">{offer.price}</div>
                            {offer.featured && (
                              <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                                most picked
                              </span>
                            )}
                          </div>
                          <h3 className="display-font mt-2 text-lg font-bold text-white">{OFFER_EMOJI[offer.name] || "💎"} {offer.name}</h3>
                          <p className="mt-1.5 text-[13px] leading-5 text-white/55">{offer.body}</p>
                          <p className="mt-1 text-[10px] italic text-gray-500">{offer.sub}</p>
                          <div className="mt-4">
                            <Button asChild className="w-full" variant={offer.featured ? "primary" : "secondary"} size="sm">
                              <Link href={offer.href}>{offer.cta}</Link>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
        </Container>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="pb-24 sm:pb-10">
        <Container>
          <div className="glass-panel glow-frame shine-sweep relative overflow-hidden rounded-[32px] px-6 py-10 text-center sm:px-10 sm:py-12 shadow-[0_0_80px_rgba(56,189,248,0.12)]">
            <Badge variant="premium">free to try</Badge>
            <h2 className="display-font mt-4 text-3xl font-bold text-white sm:text-4xl">
              your next photo could hit different.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">
              find the leak. fix the vibe. one photo, zero sign-ups.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/audit/new">get my aura score — free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/shop">shop this vibe</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Sticky Mobile CTA ─── */}
      <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:hidden glass-panel border-t border-white/10">
        <Button asChild size="lg" className="w-full cta-shine">
          <Link href="/audit/new">check my vibe — free →</Link>
        </Button>
        <div className="mt-1.5 text-center text-[10px] text-white/35">free forever · no sign-up</div>
      </div>
    </>
  );
}
