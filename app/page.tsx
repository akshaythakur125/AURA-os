"use client";

import { useEffect, useState } from "react";
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

const marqueeStyles = getMarqueePresets();

const heroScenarios = [
  {
    id: "date",
    emoji: "💘",
    label: "Date this week",
    question:
      "Would they swipe right on this photo? Be honest — you can't tell. You've seen your face too many times. Strangers haven't.",
    cta: "Am I date-ready? — free",
  },
  {
    id: "interview",
    emoji: "💼",
    label: "Interview coming up",
    question:
      "Does your photo say “hire me” — or “scroll past”? The recruiter decides before reading a single word.",
    cta: "Am I interview-ready? — free",
  },
  {
    id: "event",
    emoji: "🎉",
    label: "Wedding / event",
    question:
      "Everyone's posting the same night. Same venue, same lighting. Will your photo win the group chat — or disappear in it?",
    cta: "Am I event-ready? — free",
  },
  {
    id: "dp",
    emoji: "📸",
    label: "New DP loading",
    question:
      "You've been staring at it for ten minutes and still can't decide. That feeling has a name — it's a leak you can't see.",
    cta: "Rate my DP — free",
  },
  {
    id: "curious",
    emoji: "👀",
    label: "Just curious",
    question:
      "Strangers make up their mind about you in 0.3 seconds. Want to know what they decide — or keep guessing?",
    cta: "Show me what they see — free",
  },
];

const steps = [
  {
    number: "01",
    title: "Drop a photo",
    body: "Selfie, mirror fit, dating pic, LinkedIn headshot — anything you want people to react to.",
  },
  {
    number: "02",
    title: "Get the read",
    body: "Your Aura Score out of 100, plus the leaks you can't see — because you've looked at your own face too many times to notice.",
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
    body: "Would that outfit even suit you? Test it on your style twin before you spend a rupee.",
    href: "/twin-simulator",
  },
  {
    title: "Wardrobe Scan",
    tag: "diagnosis",
    body: "Why do all your fits feel the same? Your wardrobe already knows. We make it talk.",
    href: "/wardrobe/diagnosis",
  },
  {
    title: "Glow-Up Challenges",
    tag: "streaks",
    body: "How different could you look in 7 days? Daily missions. Small wins. Ask your streak.",
    href: "/challenges",
  },
  {
    title: "Trend Shop",
    tag: "price compare",
    body: "Saved a look you never bought? We break it into pieces, price-compared across 6 stores.",
    href: "/shop",
  },
];

const offerCards = [
  {
    name: "Vibe Check",
    price: "Free",
    body: "Your Aura Score + the #1 thing holding your photo back. No sign-up.",
    sub: "no card, no sign-up",
    cta: "Start free",
    href: "/audit/new",
  },
  {
    name: "Fast Fix",
    price: "Rs 25",
    body: "The single fastest change that moves your score the most. One clear move.",
    sub: "less than a coffee · UPI in one tap",
    cta: "Unlock",
    href: "/unlock?product=quick_fix",
  },
  {
    name: "Full Read",
    price: "Rs 44",
    body: "Full breakdown — fit, color, grooming, posture — with a step-by-step fix path.",
    sub: "one lunch · UPI in one tap",
    cta: "Get the report",
    href: "/products/aura-report",
    featured: true,
  },
  {
    name: "30-Day Reset",
    price: "Rs 499",
    body: "30 days of weekly missions and tracked progress. The full reset.",
    sub: "cheaper than a haircut · UPI supported",
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
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [userPicked, setUserPicked] = useState(false);

  useEffect(() => {
    if (userPicked) return;
    const timer = setInterval(() => {
      setScenarioIndex((i) => (i + 1) % heroScenarios.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [userPicked]);

  const scenario = heroScenarios[scenarioIndex];

  return (
    <>
      <ReferralBanner />

      <section className="relative overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="hero-grid absolute inset-x-0 top-0 h-[40rem]" />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <Badge variant="premium" className="mb-5">
                free ai first-impression check
              </Badge>
              <h1 className="display-font max-w-3xl text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                Going somewhere?{" "}
                <span className="bg-gradient-to-r from-sky-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Let&apos;s see how ready you are.
                </span>
              </h1>

              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  what&apos;s coming up?
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {heroScenarios.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setScenarioIndex(i);
                        setUserPicked(true);
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                        i === scenarioIndex
                          ? "border-sky-300/60 bg-sky-400/15 text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.25)]"
                          : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white/85"
                      }`}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <p
                key={scenario.id}
                className="mt-5 min-h-[5.5rem] max-w-xl text-base leading-7 text-white/75 sm:text-lg"
              >
                {scenario.question}
              </p>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={`/audit/new?intent=${scenario.id}`}>{scenario.cta}</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/examples">See a real example</Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/50">
                <span>8 seconds. No sign-up.</span>
                <span aria-hidden className="text-white/25">·</span>
                <span>Free tier, forever</span>
                <span aria-hidden className="text-white/25">·</span>
                <span>Your photo never leaves your browser</span>
              </div>
            </div>

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
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#auraScoreGradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray="255 327" />
                    <defs>
                      <linearGradient id="auraScoreGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="display-font text-4xl font-bold text-white">78</div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-white/50">aura score</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Strong base. Two leaks are holding you back.
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    This person had no idea. That&apos;s the point — you can&apos;t see your own leaks. What&apos;s yours?
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2.5">
                {demoLeaks.map((leak) => (
                  <div key={leak.label} className="glass-card flex items-center justify-between gap-3 rounded-[18px] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${leak.kind === "leak" ? "bg-amber-400" : "bg-emerald-400"}`} />
                      <span className="text-xs text-white/80">{leak.label}</span>
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold ${leak.kind === "leak" ? "text-sky-300" : "text-emerald-300"}`}>
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

      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">how it works</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Think you already know how you come across?
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              Nobody does. It takes 20 seconds to stop guessing.
            </p>
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
              Know the vibe you want? Tap it.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/62">
              Old money, airport fit, wedding guest — pick where you&apos;re headed and we pull the exact pieces. No blank search box, no guessing.
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

      <section className="pb-16">
        <Container>
          <div className="prism-panel glow-frame shine-sweep overflow-hidden rounded-[30px] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                  celebrity trend radar · refreshed every 72h
                </div>
                <h2 className="display-font mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Ever seen a fit and thought “I could pull that off”?
                </h2>
                <p className="mt-2 max-w-xl text-sm text-white/55">
                  You probably can. Tap a look to see the exact pieces behind it, price-compared across Indian stores.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/battle"
                  className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-[11px] text-purple-300 transition-colors hover:bg-purple-500/15"
                >
                  ⚔️ Aura Battle <span className="rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[9px] text-purple-300">new</span>
                </Link>
                <Button asChild size="sm" variant="outline">
                  <Link href="/wardrobe/search">Shop all trends</Link>
                </Button>
              </div>
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
                      <img src={preset.imageSrc} alt={preset.celebrity} className="h-[300px] w-full object-cover" />
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

      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">more ways to play</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Got your score. Now what?
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

      {/* ─── Real Results Gallery ─── */}
      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default" className="mb-4">Real vibe checks this week</Badge>
            <h2 className="display-font text-4xl font-bold text-white sm:text-5xl">
              They found their one thing. What&apos;s yours?
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              Every one of these people thought their photo was fine. It was one fix away from a different reaction.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              <Link href="/gallery" className="text-purple-400 hover:text-purple-300 underline">View full gallery →</Link>
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const realEntries = typeof window !== "undefined" ? getGalleryEntries("recent", 6) : [];
              if (realEntries.length >= 3) {
                return realEntries.map((entry) => (
                  <div key={entry.id} className="prism-panel float-card group rounded-[22px] p-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-xs font-bold text-white">
                        {entry.nickname.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{entry.nickname}</div>
                        {entry.city && <div className="text-[10px] text-white/45">{entry.city}</div>}
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl font-bold text-white">{entry.score}</span>
                      <span className="text-xs text-gray-500">/100</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">{entry.strongestSignal}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-white/55 italic">"{entry.oneLineVerdict}"</div>
                    <div className="mt-3">
                      <Link href="/gallery" className="text-[10px] text-purple-400 hover:text-purple-300">See full gallery →</Link>
                    </div>
                  </div>
                ));
              }
              // Fallback to static proof entries
              return getDailySubset(getHomepageProofEntries(), 6).map((entry) => (
                <div key={entry.initials} className="prism-panel float-card group rounded-[22px] p-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${entry.gradient} text-xs font-bold text-white`}>
                      {entry.initials}
                    </div>
                    <div>
                      <div className="text-xs text-white/45">{entry.city}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-lg font-bold text-white/50">{entry.beforeScore}</span>
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    <span className="text-lg font-bold text-white">{entry.afterScore}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">{entry.leakLabel}</span>
                    <span className="text-emerald-400 font-medium">+{entry.pointsGained} pts</span>
                  </div>
                  <div className="mt-3 text-[10px] text-white/35">{entry.timeframe}</div>
                </div>
              ));
            })()}
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">simple pricing</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              The score is free. What&apos;s knowing the fix worth?
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              Less than your coffee, as it turns out.
            </p>
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
                <p className="mt-1.5 text-[10px] italic text-gray-500">{offer.sub}</p>
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

      <section className="pb-12">
        <Container>
          <div className="glass-panel glow-frame shine-sweep relative overflow-hidden rounded-[36px] px-6 py-10 text-center sm:px-10 sm:py-14">
            <Badge variant="premium">free to try</Badge>
            <h2 className="display-font mt-5 text-4xl font-bold text-white sm:text-5xl">
              Still wondering what people see?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              You&apos;ve scrolled this far because part of you wants to know. One photo. Eight seconds. Zero sign-ups. Find out — or keep guessing.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/audit/new">End the suspense — free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/shop">Shop this vibe</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
