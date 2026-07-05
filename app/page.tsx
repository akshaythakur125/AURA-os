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
    leak: "Your lighting is aging you — people see 'tired'",
    price: "Rs 399",
    points: "+12 pts avg",
    emoji: "💡",
    url: "https://www.amazon.in/s?k=ring+light+selfie&tag=auracheck-21",
  },
  {
    label: "Solid Colour Tee",
    leak: "That logo tee is why they swipe left",
    price: "Rs 349",
    points: "+8 pts avg",
    emoji: "👕",
    url: "https://www.amazon.in/s?k=solid+colour+tshirt+men&tag=auracheck-21",
  },
  {
    label: "Grooming Kit",
    leak: "People notice unkempt before anything else",
    price: "Rs 499",
    points: "+9 pts avg",
    emoji: "✂️",
    url: "https://www.amazon.in/s?k=mens+grooming+kit&tag=auracheck-21",
  },
  {
    label: "Phone Tripod",
    leak: "Bad angle = bad face. It's the crop, not you.",
    price: "Rs 299",
    points: "+11 pts avg",
    emoji: "📱",
    url: "https://www.amazon.in/s?k=phone+tripod+stand&tag=auracheck-21",
  },
  {
    label: "Minimal Watch",
    leak: "Empty wrist reads 'didn't try' subconsciously",
    price: "Rs 899",
    points: "+7 pts avg",
    emoji: "⌚",
    url: "https://www.amazon.in/s?k=minimal+analog+watch+men&tag=auracheck-21",
  },
  {
    label: "White Sneakers",
    leak: "Dirty/old shoes ruin the entire outfit signal",
    price: "Rs 799",
    points: "+6 pts avg",
    emoji: "👟",
    url: "https://www.amazon.in/s?k=white+sneakers+men+casual&tag=auracheck-21",
  },
];

const occasionShops = [
  { emoji: "💘", label: "Date Night", query: "date night outfit men", hook: "They'll decide in 3 seconds if you made an effort. Did you?" },
  { emoji: "💼", label: "Interview", query: "interview formal shirt trousers men", hook: "The person who got your dream job dressed better. Not smarter." },
  { emoji: "🎉", label: "Wedding Guest", query: "wedding guest outfit kurta men", hook: "250 people will see you that night. 250 first impressions you can't redo." },
  { emoji: "🏖️", label: "Goa Trip", query: "beach vacation shirt men", hook: "Your trip photos live on Instagram forever. Your outfit choice doesn't get a second take." },
  { emoji: "🎓", label: "College Fit", query: "college casual outfit men", hook: "You're being ranked every time you walk into class. You just can't see the scoreboard." },
  { emoji: "📸", label: "Profile Photo", query: "solid colour polo tshirt men", hook: "Your face isn't the problem. Your shirt color is draining your skin tone and you can't tell." },
];

const heroScenarios = [
  {
    id: "date",
    emoji: "💘",
    label: "Date this week",
    question:
      "They already checked your profile. They already formed an opinion. You just don't know what it was — or why they didn't reply.",
    cta: "Am I date-ready? — free",
  },
  {
    id: "interview",
    emoji: "💼",
    label: "Interview coming up",
    question:
      "The recruiter Googled you. Your LinkedIn photo loaded. They made a decision about you before reading a single line of your resume. Do you know what that decision was?",
    cta: "Am I interview-ready? — free",
  },
  {
    id: "event",
    emoji: "🎉",
    label: "Wedding / event",
    question:
      "The group photo gets posted. Everyone looks great — except one person who didn't realize something was off. What if that person is you, and nobody's going to tell you?",
    cta: "Am I event-ready? — free",
  },
  {
    id: "dp",
    emoji: "📸",
    label: "New DP loading",
    question:
      "You've changed it three times this month and still aren't sure. That nagging feeling? It's because something is off and you literally cannot see it — you've looked at your own face too many times.",
    cta: "Rate my DP — free",
  },
  {
    id: "curious",
    emoji: "👀",
    label: "Just curious",
    question:
      "Right now, someone is looking at your photo and forming a permanent opinion about you. In 0.3 seconds. You'll never get a second chance at that moment. Want to know what they decided?",
    cta: "Show me what they see — free",
  },
];

const steps = [
  {
    number: "01",
    title: "Drop the photo you're most unsure about",
    body: "The one you almost posted. The one you keep second-guessing. That uncertainty isn't random — something specific is causing it.",
  },
  {
    number: "02",
    title: "See what everyone else already sees",
    body: "Your Aura Score out of 100 + the exact leaks dragging you down. The things your friends noticed but never mentioned.",
  },
  {
    number: "03",
    title: "Fix it before more people see the old version",
    body: "Every day you don't fix it, more people form the wrong first impression. Most fixes take under Rs 500 and 10 minutes.",
  },
];

const exploreCards = [
  {
    title: "Aura Twin",
    tag: "simulator",
    body: "You bought that outfit thinking it would look like the photo. It didn't. Test before you waste another Rs 2,000.",
    href: "/twin-simulator",
  },
  {
    title: "Wardrobe Scan",
    tag: "diagnosis",
    body: "You own 40 items and still say 'I have nothing to wear.' That's not a wardrobe problem — it's a signal problem.",
    href: "/wardrobe/diagnosis",
  },
  {
    title: "Glow-Up Challenges",
    tag: "streaks",
    body: "Most people quit after 3 days. The ones who don't? Their scores jump by 15+ points. Can you outlast them?",
    href: "/challenges",
  },
  {
    title: "Trend Shop",
    tag: "price compare",
    body: "That person who always looks effortless? They're buying the same brands as you — just different pieces. See which ones.",
    href: "/shop",
  },
];

const offerCards = [
  {
    name: "Vibe Check",
    price: "Free",
    body: "Find out your score + the #1 thing silently hurting you. No sign-up. No excuses left.",
    sub: "no card, no sign-up",
    cta: "See what they see",
    href: "/audit/new",
  },
  {
    name: "Fast Fix",
    price: "Rs 25",
    body: "The single fastest change that moves your score the most. Know exactly what to fix — stop guessing.",
    sub: "less than a coffee · UPI in one tap",
    cta: "Stop guessing",
    href: "/unlock?product=quick_fix",
  },
  {
    name: "Full Read",
    price: "Rs 44",
    body: "Every leak exposed — fit, color, grooming, posture. The full truth your friends are too polite to say.",
    sub: "one lunch · UPI in one tap",
    cta: "Get the full truth",
    href: "/products/aura-report",
    featured: true,
  },
  {
    name: "30-Day Reset",
    price: "Rs 499",
    body: "30 days of daily missions. Systematic fix for every leak. In a month, people will ask what changed.",
    sub: "cheaper than a haircut · UPI supported",
    cta: "Fix everything",
    href: "/products/glowup-plan",
  },
];

const demoLeaks = [
  {
    kind: "leak",
    label: "Your shirt color is washing out your skin — people see 'tired'",
    delta: "+9 pts if fixed",
  },
  {
    kind: "leak",
    label: "Oversized fit is hiding your frame — reads as sloppy, not relaxed",
    delta: "+6 pts if fixed",
  },
  {
    kind: "pass",
    label: "Grooming — clean, on point (this is saving you)",
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
                <span>8 seconds to find out</span>
                <span aria-hidden className="text-white/25">·</span>
                <span>Free. No sign-up. No excuses.</span>
                <span aria-hidden className="text-white/25">·</span>
                <span>Your photo stays on your device</span>
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
                    This person thought they looked great. They had two silent leaks.
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    Nobody told them. Friends won&apos;t. Strangers just swipe left. The average person has 2.4 leaks they can&apos;t see. What are yours?
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
              You think you look fine. That&apos;s the problem.
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              Your brain literally can&apos;t see your own flaws. You&apos;ve looked at your face 10,000 times — you&apos;re blind to what strangers notice in 0.3 seconds.
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
              You know what looks good. You just can&apos;t recreate it on yourself.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/62">
              That&apos;s not a you problem — it&apos;s an information problem. Pick a vibe and we break it into the exact pieces. Stop guessing why their outfit works and yours doesn&apos;t.
            </p>
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
                  celebrity trend radar · refreshed every 72h
                </div>
                <h2 className="display-font mt-2 text-2xl font-bold text-white sm:text-3xl">
                  They&apos;re wearing the same brands as you. So why do they look better?
                </h2>
                <p className="mt-2 max-w-xl text-sm text-white/55">
                  It&apos;s not the brand. It&apos;s the combination. These celebrity looks are broken into exact pieces you can buy — and you&apos;ll finally see why your version never looked the same.
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
            <Badge variant="premium">all 16 trending looks</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              One of these looks would fix everything. You just don&apos;t know which one yet.
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              The difference between &ldquo;they look amazing&rdquo; and &ldquo;they look like they&apos;re trying&rdquo; is usually one wrong piece. Every look here is broken into buyable parts.
            </p>
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
            <Badge variant="default">more ways to play</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Knowing your score is step one. Living with it is the hard part.
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
              They looked just like you. Then they found the one thing nobody told them.
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              Every person below was walking around with a leak they couldn&apos;t see. Their friends saw it. Strangers saw it. Nobody said anything. Until they checked.
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

      {/* ─── Quick Fixes People Actually Buy ─── */}
      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="premium">top fixes this month</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              The thing silently ruining your photos costs Rs 399 to fix. You just don&apos;t know what it is yet.
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              These are the most-bought items right after someone sees their score for the first time. The average person jumps 9 points. Some jump 20.
            </p>
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
              Last time you walked into a room, what did people actually think?
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              You&apos;ll never know. But you can control what they think next time. Pick the occasion — we pull the exact outfit that changes the first impression.
            </p>
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
            <Badge variant="default">simple pricing</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              The problem isn&apos;t money. It&apos;s that you&apos;ve been walking around not knowing.
            </h2>
            <p className="mt-3 text-sm text-white/55 sm:text-base">
              Every day without the fix is another day of wrong first impressions. The score is free. The fix costs less than your lunch.
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
              You&apos;re either someone who finds out — or someone who keeps guessing forever.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              You scrolled this far because something doesn&apos;t sit right. That feeling in your gut when you look at your own photo? It&apos;s trying to tell you something. One photo. Eight seconds. Free. End it now — or wonder every time you post.
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
