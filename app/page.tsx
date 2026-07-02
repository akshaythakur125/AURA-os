"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ReferralBanner } from "@/components/marketing/ReferralBanner";
import { PROOF_EXAMPLES } from "@/config/proofExamples";
import { getAudits } from "@/lib/storage/auditStore";
import { getTwinStats } from "@/lib/storage/auraTwinStore";

const signalLeaks = [
  {
    title: "Premium device, weak frame",
    body: "A high-end phone cannot rescue a cluttered room, bad crop, or dead lighting. The frame still wins.",
  },
  {
    title: "Strong face, noisy styling",
    body: "Gen Z premium does not mean louder logos. Clean fit, controlled palette, and intentional texture signal more.",
  },
  {
    title: "Great outfit, wrong order",
    body: "If the first image is confusing, the audience leaves before they even register the strongest shot in the stack.",
  },
];

const featurePillars = [
  {
    title: "See what is hurting your first impression",
    body: "AuraCheck reads your photo, profile, and presentation details to find the exact visual leaks lowering your impact.",
    stat: "What it does",
  },
  {
    title: "Get clear fixes instead of vague advice",
    body: "You do not just get a score. You get the next move: better crop, better light, stronger outfit direction, and smarter photo order.",
    stat: "How it helps",
  },
  {
    title: "Pay only when you want deeper execution",
    body: "Free shows the problem. Paid tiers go deeper with full breakdowns, budget-aware upgrade paths, and done-for-you strategy.",
    stat: "Why paid exists",
  },
];

const offerCards = [
  {
    name: "Free Aura Check",
    price: "Free",
    caption: "Start here",
    description: "Best for new visitors. Get a baseline score, your biggest leak, and a quick idea of what to fix first.",
    href: "/audit/new",
  },
  {
    name: "Quick Fix",
    price: "Rs 49",
    caption: "Fastest ROI",
    description: "Pay when you want the fastest action plan: your biggest leak, the fastest free fix, and the smartest low-cost upgrade.",
    href: "/unlock?product=quick_fix",
  },
  {
    name: "Full Aura Report",
    price: "Rs 99",
    caption: "Most popular",
    description: "Pay for the full reasoning layer: deeper analysis, full signal breakdown, mismatch map, and a personalized upgrade roadmap.",
    href: "/products/aura-report",
    featured: true,
  },
  {
    name: "30-Day Glow-Up",
    price: "Rs 499",
    caption: "System play",
    description: "A structured plan for improving grooming, outfit choices, photo quality, and consistency over time.",
    href: "/products/glowup-plan",
  },
];

const journeySteps = [
  {
    label: "1. Start free",
    title: "Find the problem first",
    body: "A visitor uploads a photo or screenshot and gets a baseline score plus the biggest leak hurting their image.",
  },
  {
    label: "2. Upgrade if needed",
    title: "Pay for deeper clarity",
    body: "If they want more than a teaser, paid features explain why the leak exists and what exactly to do next.",
  },
  {
    label: "3. Use the plan",
    title: "Improve faster, waste less",
    body: "The paid tiers save time and money by telling users what to fix now, what to buy later, and what to avoid.",
  },
];

export default function HomePage() {
  const stats = useMemo(
    () => ({
      audits: typeof window !== "undefined" ? getAudits().length : 0,
      twins: typeof window !== "undefined" ? getTwinStats().totalSimulations : 0,
      proofDelta: Math.max(...PROOF_EXAMPLES.slice(0, 4).map((example) => example.scoreDelta)),
    }),
    [],
  );

  return (
    <>
      <ReferralBanner />

      <section className="relative overflow-hidden pb-18 pt-10 sm:pb-24 sm:pt-14">
        <div className="hero-grid absolute inset-x-0 top-0 h-[44rem]" />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <Badge variant="premium" className="mb-5">
                premium first-impression audit
              </Badge>
              <h1 className="display-font max-w-4xl text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                Know what your photos and profile are saying before other people decide for you.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                AuraCheck helps people understand how they come across online. It finds the visual leaks hurting first impression, explains how those leaks affect perception, and gives a clearer upgrade path so users stop guessing what to fix.
              </p>
              <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">Free tier</div>
                  <div className="mt-2 text-sm text-white/72">Score + biggest leak</div>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">Paid tier</div>
                  <div className="mt-2 text-sm text-white/72">Deeper analysis + action plan</div>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">Main outcome</div>
                  <div className="mt-2 text-sm text-white/72">Better photos, profile, and spend decisions</div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/audit/new">
                  <Button size="lg">Start Free Aura Check</Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="secondary">
                    Explore premium plans
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                <div className="glass-panel rounded-[24px] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/45">audits tracked</div>
                  <div className="mt-2 display-font text-3xl font-bold text-white">{stats.audits || "Live"}</div>
                </div>
                <div className="glass-panel rounded-[24px] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/45">twin sims</div>
                  <div className="mt-2 display-font text-3xl font-bold text-white">{stats.twins || "3D"}</div>
                </div>
                <div className="glass-panel rounded-[24px] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/45">proof lift</div>
                  <div className="mt-2 display-font text-3xl font-bold text-white">+{stats.proofDelta}</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="mesh-glow pulse-glow absolute left-10 top-10 h-36 w-36 bg-sky-400/25" />
              <div className="mesh-glow pulse-glow absolute bottom-6 right-0 h-40 w-40 bg-orange-400/20" />
              <div className="tilt-card glass-card relative rounded-[34px] p-5 shadow-[0_32px_120px_rgba(14,165,233,0.12)]">
                <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-slate-950/45 px-4 py-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-white/45">Live diagnosis</div>
                    <div className="mt-1 display-font text-2xl font-bold text-white">Signal Deck</div>
                  </div>
                  <Badge variant="premium">3D style</Badge>
                </div>

                <div className="mt-5 grid gap-4">
                  <div className="glass-panel rounded-[28px] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">overall impression</div>
                        <div className="mt-2 display-font text-5xl font-bold text-white">82</div>
                      </div>
                      <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                        +16 after fixes
                      </div>
                    </div>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full w-[82%] rounded-full bg-[linear-gradient(90deg,#7dd3fc,#3b82f6,#f97316)]" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="glass-panel rounded-[28px] p-5">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">biggest leak</div>
                      <div className="mt-2 display-font text-2xl font-bold text-white">Weak framing</div>
                      <p className="mt-3 text-sm leading-7 text-white/62">
                        Your crop is too wide, so the room is louder than the person.
                      </p>
                    </div>
                    <div className="glass-panel rounded-[28px] p-5">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">next move</div>
                      <div className="mt-2 display-font text-2xl font-bold text-white">4:5 crop + side light</div>
                      <p className="mt-3 text-sm leading-7 text-white/62">
                        Cheap fix, premium result. This is the kind of advice the product should visually embody.
                      </p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">signal matrix</div>
                        <div className="mt-2 display-font text-2xl font-bold text-white">Visual stack</div>
                      </div>
                      <div className="slow-spin h-16 w-16 rounded-full border border-white/10 border-t-sky-300/70" />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {["Lighting", "Fit", "Background"].map((item, index) => (
                        <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-white/45">{item}</div>
                          <div className="mt-2 display-font text-3xl font-bold text-white">{76 + index * 6}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-18">
        <Container>
          <div className="glass-panel rounded-[30px] px-6 py-5 sm:px-8">
            <div className="grid gap-5 md:grid-cols-3">
              {signalLeaks.map((item) => (
                <div key={item.title} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">common leak</div>
                  <h2 className="mt-3 display-font text-2xl font-bold text-white">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/60">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-18">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">what aura check offers</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              A visitor should understand the product in under 10 seconds.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              AuraCheck is not selling “confidence vibes.” It is a practical audit product that shows what is wrong, how to fix it, and which upgrade is worth paying for.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featurePillars.map((pillar) => (
              <Card key={pillar.title} hover>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="premium">{pillar.stat}</Badge>
                  <span className="text-xs uppercase tracking-[0.2em] text-white/35">aura system</span>
                </div>
                <h3 className="display-font mt-5 text-3xl font-bold text-white">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/60">{pillar.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-18">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="p-7" hover>
              <Badge variant="premium">why people pay</Badge>
              <h2 className="display-font mt-4 text-4xl font-bold text-white">Free reveals the issue. Paid removes the guesswork.</h2>
              <p className="mt-4 text-sm leading-7 text-white/62">
                Most users do not pay for “another score.” They pay because they want the reasoning, the priority order, and the cheapest high-impact fix without wasting time or money.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Free tier: find the biggest leak and get a quick sense of where the problem is.",
                  "Quick Fix: pay for the fastest next step when you want immediate improvement.",
                  "Full Report: pay for the detailed why, the full breakdown, and the personalized roadmap.",
                  "Glow-Up Plan: pay for structure when you want a system, not a one-off tip.",
                ].map((point) => (
                  <div
                    key={point}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="text-sm leading-7 text-white/68">{point}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              {journeySteps.map((step) => (
                <Card key={step.label} hover className="sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/40">{step.label}</div>
                  <h3 className="display-font mt-3 text-3xl font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    {step.body}
                  </p>
                </Card>
              ))}
              <Card hover>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">proof</div>
                <h3 className="display-font mt-3 text-3xl font-bold text-white">Results feel real</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Example fixes already show visible score lifts, so paid upgrades feel justified instead of arbitrary.
                </p>
              </Card>
              <Card hover>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">privacy</div>
                <h3 className="display-font mt-3 text-3xl font-bold text-white">Safe to try</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Local-first processing lowers friction. Visitors can try the value before deciding whether deeper paid guidance is worth it.
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-18">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">pricing architecture</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Clear payment logic, not random upsells.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              Each tier is paying for more certainty and more execution depth. The price goes up only when the help gets more detailed and more personalized.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {offerCards.map((offer) => (
              <Card
                key={offer.name}
                hover
                className={offer.featured ? "border-sky-200/28 shadow-[0_26px_90px_rgba(56,189,248,0.16)]" : ""}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">{offer.caption}</div>
                    <h3 className="display-font mt-3 text-4xl font-bold text-white">{offer.name}</h3>
                  </div>
                  {offer.featured ? <Badge variant="premium">hero offer</Badge> : null}
                </div>
                <div className="mt-5 display-font text-5xl font-bold text-white">{offer.price}</div>
                <p className="mt-4 text-sm leading-7 text-white/60">{offer.description}</p>
                <div className="mt-7">
                  <Link href={offer.href}>
                    <Button className="w-full" variant={offer.featured ? "primary" : "secondary"}>
                      View offer
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-12">
        <Container>
          <div className="glass-panel relative overflow-hidden rounded-[36px] px-6 py-10 text-center sm:px-10 sm:py-14">
            <div className="mesh-glow absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 bg-sky-400/18" />
            <Badge variant="premium">ready for the full experience</Badge>
            <h2 className="display-font relative mt-5 text-4xl font-bold text-white sm:text-6xl">
              Premium visual direction. Still fast. Still usable.
            </h2>
            <p className="relative mx-auto mt-5 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
              The overhaul turns AuraCheck into something that feels designed by a premium product team: stronger typography, richer light, cleaner spacing, and 3D-inspired motion without adding heavy dependencies.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/audit/new">
                <Button size="lg">Launch the free check</Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" variant="outline">
                  Explore the style engine
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
