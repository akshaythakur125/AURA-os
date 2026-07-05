"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { STYLE_SEARCH_SUGGESTIONS } from "@/config/styleSearchSuggestions";
import { CELEBRITY_TREND_PRESETS } from "@/config/celebrityTrendPresets";
import { ReferralBanner } from "@/components/marketing/ReferralBanner";
import { getMarqueePresets, getDailySubset } from "@/lib/marketing/rotatingPresets";
import { getHomepageProofEntries } from "@/data/homepageProof";
import { getGalleryEntries } from "@/lib/storage/galleryStore";

const marqueeStyles = getMarqueePresets();

const quickFixProducts = [
  {
    label: "Ring Light",
    leak: "Bad lighting ages you instantly",
    price: "Rs 399",
    points: "+12 pts",
    emoji: "💡",
    url: "https://www.amazon.in/s?k=ring+light+selfie&tag=auracheck-21",
  },
  {
    label: "Solid Colour Tee",
    leak: "Logo tees kill first impressions",
    price: "Rs 349",
    points: "+8 pts",
    emoji: "👕",
    url: "https://www.amazon.in/s?k=solid+colour+tshirt+men&tag=auracheck-21",
  },
  {
    label: "Grooming Kit",
    leak: "Unkempt is the first thing people see",
    price: "Rs 499",
    points: "+9 pts",
    emoji: "✂️",
    url: "https://www.amazon.in/s?k=mens+grooming+kit&tag=auracheck-21",
  },
  {
    label: "Phone Tripod",
    leak: "Bad angle = bad face. Not you.",
    price: "Rs 299",
    points: "+11 pts",
    emoji: "📱",
    url: "https://www.amazon.in/s?k=phone+tripod+stand&tag=auracheck-21",
  },
  {
    label: "Minimal Watch",
    leak: "Empty wrist reads 'didn't try'",
    price: "Rs 899",
    points: "+7 pts",
    emoji: "⌚",
    url: "https://www.amazon.in/s?k=minimal+analog+watch+men&tag=auracheck-21",
  },
  {
    label: "White Sneakers",
    leak: "Old shoes ruin the whole outfit",
    price: "Rs 799",
    points: "+6 pts",
    emoji: "👟",
    url: "https://www.amazon.in/s?k=white+sneakers+men+casual&tag=auracheck-21",
  },
];

const occasionShops = [
  { emoji: "💘", label: "Date Night", query: "date night outfit men", hook: "Look like you tried. Without looking like you tried too hard." },
  { emoji: "💼", label: "Interview", query: "interview formal shirt trousers men", hook: "They decide before you sit down." },
  { emoji: "🎉", label: "Wedding Guest", query: "wedding guest outfit kurta men", hook: "250 people. One group photo. Zero do-overs." },
  { emoji: "🏖️", label: "Goa Trip", query: "beach vacation shirt men", hook: "Trip photos live forever. Dress like it." },
  { emoji: "🎓", label: "College Fit", query: "college casual outfit men", hook: "Effortless is a look. It takes effort." },
  { emoji: "📸", label: "Profile Photo", query: "solid colour polo tshirt men", hook: "Wrong shirt color = tired face. Free fix." },
];

const heroScenarios = [
  {
    id: "date",
    emoji: "💘",
    label: "Date this week",
    question: "They checked your profile before you even showed up. What did they think?",
    cta: "Check now — free",
  },
  {
    id: "interview",
    emoji: "💼",
    label: "Interview coming up",
    question: "Your LinkedIn photo loaded. They decided before reading your resume.",
    cta: "Check now — free",
  },
  {
    id: "event",
    emoji: "🎉",
    label: "Wedding / event",
    question: "Group photo gets posted. Everyone looks great except one person. Is it you?",
    cta: "Check now — free",
  },
  {
    id: "dp",
    emoji: "📸",
    label: "New DP loading",
    question: "Changed it three times this month. Still not sure. There's a reason.",
    cta: "Check now — free",
  },
  {
    id: "curious",
    emoji: "👀",
    label: "Just curious",
    question: "Someone looked at your photo today. Formed an opinion in 0.3 seconds. Want to know what it was?",
    cta: "Check now — free",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload a photo",
    body: "The one you're most unsure about.",
  },
  {
    number: "02",
    title: "Get your score",
    body: "Score out of 100. Exact leaks. No sugarcoating.",
  },
  {
    number: "03",
    title: "Fix it today",
    body: "Most fixes cost nothing. The rest cost less than lunch.",
  },
];

const exploreCards = [
  {
    title: "Aura Twin",
    tag: "simulator",
    body: "Test an outfit before you buy it.",
    href: "/twin-simulator",
  },
  {
    title: "Wardrobe Scan",
    tag: "diagnosis",
    body: "40 items. Nothing to wear. Find out why.",
    href: "/wardrobe/diagnosis",
  },
  {
    title: "Glow-Up Challenges",
    tag: "streaks",
    body: "Daily missions. 15+ point jumps in 30 days.",
    href: "/challenges",
  },
  {
    title: "Trend Shop",
    tag: "price compare",
    body: "Same brands. Different pieces. That's the gap.",
    href: "/shop",
  },
];

const offerCards = [
  {
    name: "Vibe Check",
    price: "Free",
    body: "Your score + your #1 leak. No sign-up.",
    sub: "8 seconds",
    cta: "Try it",
    href: "/audit/new",
  },
  {
    name: "Fast Fix",
    price: "Rs 25",
    body: "Your single highest-impact fix. One answer.",
    sub: "less than a coffee",
    cta: "Get the fix",
    href: "/unlock?product=quick_fix",
  },
  {
    name: "Full Read",
    price: "Rs 44",
    body: "Every leak. Every fix. The full truth.",
    sub: "less than lunch",
    cta: "Get the truth",
    href: "/products/aura-report",
    featured: true,
  },
  {
    name: "30-Day Reset",
    price: "Rs 499",
    body: "Daily missions. 30 days. People will notice.",
    sub: "less than a haircut",
    cta: "Start the reset",
    href: "/products/glowup-plan",
  },
];

const demoLeaks = [
  {
    kind: "leak",
    label: "Shirt color washing out your skin",
    delta: "+9 pts",
  },
  {
    kind: "leak",
    label: "Oversized fit reads sloppy, not relaxed",
    delta: "+6 pts",
  },
  {
    kind: "pass",
    label: "Grooming on point — this is saving you",
    delta: "keep",
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
                free · 8 seconds · no sign-up
              </Badge>
              <h1 className="display-font max-w-3xl text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                Going somewhere?{" "}
                <span className="bg-gradient-to-r from-sky-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  See how ready you are.
                </span>
              </h1>

              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  where are you being judged next?
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
                <span>Photo stays on your device</span>
                <span aria-hidden className="text-white/25">·</span>
                <span>No downloads</span>
                <span aria-hidden className="text-white/25">·</span>
                <span>Works on any phone</span>
              </div>
            </div>

            <div className="prism-panel glow-frame spotlight relative overflow-hidden rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                  sample report
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  this is what you get
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
                    Two silent leaks. Nobody told them.
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    Friends won't. Strangers just swipe left.
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
              Three steps. Eight seconds.
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
              Pick a vibe. We find the pieces.
            </h2>
          </div>

          <div className="glass-panel glow-frame mt-8 rounded-[32px] p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {STYLE_SEARCH_SUGGESTIONS.map((style) => (
                <Link
                  key={style.id}
                  href={`/wardrobe/search?styleId=${style.id}&sort=aura_best`}
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
                  trending now
                </div>
                <h2 className="display-font mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Steal the look. Skip the guesswork.
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
                  <Link href="/wardrobe/search">Shop all trends</Link>
                </Button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div className="marquee-track gap-4 pr-4">
                {marqueeStyles.map((preset, index) => (
                  <Link
                    key={`${preset.id}-${index}`}
                    href={`/wardrobe/search?preset=${preset.id}`}
                    className="glass-card float-card block w-[250px] min-w-[250px] overflow-hidden rounded-[28px] p-3 hover:-translate-y-1"
                  >
                    <div className="overflow-hidden rounded-[22px]">
                      <img src={preset.imageSrc} alt={preset.celebrity} className="h-[300px] w-full object-cover" loading="lazy" />
                    </div>
                    <div className="px-1 pb-1 pt-3">
                      <h3 className="text-sm font-semibold text-white">{preset.celebrity}</h3>
                      <p className="mt-1 text-xs text-sky-200">{preset.label}</p>
                      <span className="mt-2 inline-block rounded-full bg-sky-400/15 px-2.5 py-0.5 text-[10px] font-semibold text-sky-300">
                        Shop this look →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── All Trending Looks Grid ─── */}
      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="premium">all trending looks</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Every look. Broken into buyable parts.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {CELEBRITY_TREND_PRESETS.map((preset) => (
              <Link
                key={preset.id}
                href={`/wardrobe/search?preset=${preset.id}`}
                className="glass-card float-card group overflow-hidden rounded-[22px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]"
              >
                <div className="overflow-hidden">
                  <img
                    src={preset.imageSrc}
                    alt={preset.label}
                    className="h-[200px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white">{preset.label}</h3>
                  <p className="mt-1 text-[11px] text-white/50">{preset.celebrity}</p>
                  <span className="mt-2 inline-block text-[10px] font-semibold text-sky-300 group-hover:text-sky-200">
                    Shop this look →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">explore</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              More tools. Same goal.
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
            <Badge variant="default" className="mb-4">real results</Badge>
            <h2 className="display-font text-4xl font-bold text-white sm:text-5xl">
              Real people. Real scores. Real fixes.
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
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

      {/* ─── Quick Fixes People Actually Buy ─── */}
      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="premium">quick fixes</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Most-bought after seeing their score.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickFixProducts.map((prod) => (
              <a
                key={prod.label}
                href={prod.url}
                target="_blank"
                rel="noopener noreferrer"
                className="prism-panel float-card group flex gap-4 rounded-[22px] p-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[14px] bg-white/5 text-3xl">
                  {prod.emoji}
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{prod.label}</div>
                    <div className="text-xs text-white/45">{prod.leak}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-white/50">from {prod.price}</span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">{prod.points}</span>
                    </div>
                  </div>
                  <span className="mt-2 text-[11px] font-semibold text-sky-300 group-hover:text-sky-200">
                    Buy on Amazon →
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild size="sm" variant="outline">
              <Link href="/shop">See all fixes by leak type →</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* ─── Shop by Occasion ─── */}
      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">shop by occasion</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Where are you going? Dress for it.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {occasionShops.map((occ) => (
              <Link
                key={occ.label}
                href={`/wardrobe/search?query=${encodeURIComponent(occ.query)}&sort=aura_best`}
                className="prism-panel float-card group rounded-[22px] p-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)]"
              >
                <div className="text-3xl">{occ.emoji}</div>
                <h3 className="display-font mt-3 text-xl font-bold text-white">{occ.label}</h3>
                <p className="mt-2 text-sm text-white/55 italic">&ldquo;{occ.hook}&rdquo;</p>
                <span className="mt-3 inline-block text-[11px] font-semibold text-purple-300 group-hover:text-purple-200">
                  Shop this occasion →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">pricing</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Free to find out. Cheap to fix.
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
            <Badge variant="premium">free</Badge>
            <h2 className="display-font mt-5 text-4xl font-bold text-white sm:text-5xl">
              One photo. Eight seconds. Free.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Find out now or keep wondering.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/audit/new">Find out now — free</Link>
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
