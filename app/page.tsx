"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { STYLE_SEARCH_SUGGESTIONS } from "@/config/styleSearchSuggestions";
import { ReferralBanner } from "@/components/marketing/ReferralBanner";
import { getMarqueePresets } from "@/lib/marketing/rotatingPresets";

const marqueeStyles = getMarqueePresets();

const steps = [
  {
    number: "01",
    title: "Drop a photo",
    body: "Selfie, mirror fit, dating pic, LinkedIn headshot — anything you want people to react to.",
  },
  {
    number: "02",
    title: "Get the read",
    body: "Your Aura Score out of 100, plus the exact “vibe leaks” quietly dragging it down.",
  },
  {
    number: "03",
    title: "Fix it or shop it",
    body: "Get the fastest fix — or tap straight into pieces that patch the leak, price-compared across Myntra, Amazon, Flipkart & more.",
  },
];

const exploreCards = [
  {
    title: "Aura Twin",
    tag: "simulator",
    body: "Test-drive a new look on your style twin before you spend a rupee on it.",
    href: "/twin-simulator",
  },
  {
    title: "Wardrobe Scan",
    tag: "diagnosis",
    body: "Show us your wardrobe. We find the gaps that keep your fits stuck on repeat.",
    href: "/wardrobe/diagnosis",
  },
  {
    title: "Glow-Up Challenges",
    tag: "streaks",
    body: "Daily missions that level up your look one small win at a time.",
    href: "/challenges",
  },
  {
    title: "Trend Shop",
    tag: "price compare",
    body: "Every trending look broken into pieces you can compare across 6 Indian stores.",
    href: "/shop",
  },
];

const offerCards = [
  {
    name: "Free Check",
    price: "Free",
    body: "Your Aura Score + the #1 thing holding your photo back. No sign-up.",
    cta: "Start free",
    href: "/audit/new",
  },
  {
    name: "Quick Fix",
    price: "Rs 49",
    body: "The single fastest change that moves your score the most. One clear move.",
    cta: "Unlock",
    href: "/unlock?product=quick_fix",
  },
  {
    name: "Full Report",
    price: "Rs 99",
    body: "Full breakdown — fit, color, grooming, posture — with a step-by-step fix path.",
    cta: "Get the report",
    href: "/products/aura-report",
    featured: true,
  },
  {
    name: "Glow-Up Plan",
    price: "Rs 499",
    body: "30 days of weekly missions and tracked progress. The full reset.",
    cta: "Start the plan",
    href: "/products/glowup-plan",
  },
];

const demoLeaks = [
  {
    kind: "leak",
    label: "Washed-out top drains your skin tone",
    delta: "+9 pts if fixed",
  },
  {
    kind: "leak",
    label: "Oversized fit hides your frame",
    delta: "+6 pts if fixed",
  },
  {
    kind: "pass",
    label: "Grooming — clean, on point",
    delta: "keep it",
  },
];

export default function HomePage() {
  return (
    <>
      <ReferralBanner />

      {/* HERO — the first thing a visitor sees must explain the product. */}
      <section className="relative overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="hero-grid absolute inset-x-0 top-0 h-[40rem]" />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <Badge variant="premium" className="mb-5">
                free ai first-impression check
              </Badge>
              <h1 className="display-font max-w-3xl text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                Your vibe has a score. Find yours.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/68 sm:text-lg">
                Drop any photo — a selfie, a date-night fit, your LinkedIn headshot.
                AuraCheck reads the first impression it gives, flags exactly
                what&apos;s off, and shows you the fix — plus where to shop it.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/audit/new">Score my photo — free</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/examples">See a real example</Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/50">
                <span>Free tier, forever</span>
                <span aria-hidden className="text-white/25">•</span>
                <span>No sign-up needed</span>
                <span aria-hidden className="text-white/25">•</span>
                <span>Your photo never leaves your browser</span>
              </div>
            </div>

            {/* Mock report card — shows a visitor exactly what they get before they try it. */}
            <div className="prism-panel glow-frame spotlight relative overflow-hidden rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                  your aura report · sample
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  what you get
                </span>
              </div>

              <div className="mt-5 flex items-center gap-5">
                <div className="relative h-28 w-28 shrink-0">
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="url(#auraScoreGradient)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="255 327"
                    />
                    <defs>
                      <linearGradient id="auraScoreGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="display-font text-4xl font-bold text-white">78</div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-white/50">
                      aura score
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Strong base. Two leaks are holding you back.
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    This is what your free check looks like — a score, the leaks,
                    and what each fix is worth.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2.5">
                {demoLeaks.map((leak) => (
                  <div
                    key={leak.label}
                    className="glass-card flex items-center justify-between gap-3 rounded-[18px] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          leak.kind === "leak" ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                      />
                      <span className="text-xs text-white/80">{leak.label}</span>
                    </div>
                    <span
                      className={`shrink-0 text-[11px] font-semibold ${
                        leak.kind === "leak" ? "text-sky-300" : "text-emerald-300"
                      }`}
                    >
                      {leak.delta}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 rounded-[18px] bg-sky-400/10 px-4 py-3">
                <span className="text-xs font-semibold text-sky-200">
                  Fix both leaks → estimated score 93
                </span>
                <Button asChild size="sm">
                  <Link href="/audit/new">Try yours</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS — numbered, concrete, 20 seconds. */}
      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">how it works</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              20 seconds, start to finish.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.number} hover className="float-card p-6">
                <div className="display-font text-sm font-bold text-sky-300">{step.number}</div>
                <h3 className="display-font mt-3 text-2xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{step.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="premium">100 styles</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Pick a vibe. We search it for you.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/62">
              From old money to airport fit to wedding guest, users can start from a real style instead of a blank search box.
            </p>
          </div>

          <div className="glass-panel glow-frame mt-8 rounded-[32px] p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {STYLE_SEARCH_SUGGESTIONS.map((style) => (
                <Link
                  key={style.id}
                  href={`/wardrobe/search?query=${encodeURIComponent(style.query)}&sort=aura_best`}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition-colors hover:border-sky-300/30 hover:text-sky-200"
                >
                  {style.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* TREND RADAR — now below the hero, with context so it makes sense. */}
      <section className="pb-16">
        <Container>
          <div className="prism-panel glow-frame shine-sweep overflow-hidden rounded-[30px] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                  celebrity trend radar · refreshed every 72h
                </div>
                <h2 className="display-font mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Steal a look that&apos;s working.
                </h2>
                <p className="mt-2 max-w-xl text-sm text-white/55">
                  Every card is shoppable — tap one to see the pieces behind the
                  look and compare prices across Indian stores.
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/wardrobe/search">Shop all trends</Link>
              </Button>
            </div>

            <div className="overflow-hidden">
              <div className="marquee-track gap-4 pr-4">
                {marqueeStyles.map((preset, index) => (
                  <Link
                    key={`${preset.id}-${index}`}
                    href={`/wardrobe/search?preset=${preset.id}&sort=cheapest`}
                    className="glass-card float-card block w-[250px] min-w-[250px] overflow-hidden rounded-[28px] p-3 hover:-translate-y-1"
                  >
                    <div className="overflow-hidden rounded-[22px]">
                      <img
                        src={preset.imageSrc}
                        alt={preset.celebrity}
                        className="h-[300px] w-full object-cover"
                      />
                    </div>
                    <div className="px-1 pb-1 pt-3">
                      <h3 className="text-sm font-semibold text-white">{preset.celebrity}</h3>
                      <p className="mt-1 text-xs text-sky-200">{preset.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* EXPLORE — give a curious visitor somewhere to go and a reason to stay. */}
      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">more ways to play</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Not just a score.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exploreCards.map((item) => (
              <Card key={item.title} hover className="float-card group p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-sky-300/80">{item.tag}</div>
                <h3 className="display-font mt-3 text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{item.body}</p>
                <div className="mt-5">
                  <Button asChild size="sm" variant="secondary" className="w-full">
                    <Link href={item.href}>Open</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* PRICING — plain words about what each tier actually contains. */}
      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">simple pricing</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Start free. Pay only for more depth.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {offerCards.map((offer) => (
              <Card
                key={offer.name}
                hover
                className={`float-card ${offer.featured ? "border-sky-200/28 shadow-[0_26px_90px_rgba(56,189,248,0.16)]" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/40">{offer.price}</div>
                  {offer.featured && (
                    <span className="rounded-full bg-sky-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                      most picked
                    </span>
                  )}
                </div>
                <h3 className="display-font mt-3 text-3xl font-bold text-white">{offer.name}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{offer.body}</p>
                <div className="mt-6">
                  <Button asChild className="w-full" variant={offer.featured ? "primary" : "secondary"}>
                    <Link href={offer.href}>{offer.cta}</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="pb-12">
        <Container>
          <div className="glass-panel glow-frame shine-sweep relative overflow-hidden rounded-[36px] px-6 py-10 text-center sm:px-10 sm:py-14">
            <Badge variant="premium">free to try</Badge>
            <h2 className="display-font mt-5 text-4xl font-bold text-white sm:text-5xl">
              Your next photo could hit different.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Find the leak, fix the vibe, shop smarter. It takes one photo and
              zero sign-ups to see your score.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/audit/new">Get my Aura Score — free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/shop">Browse trending looks</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
