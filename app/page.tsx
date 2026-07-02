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
    title: "Read the visual signal",
    body: "AuraCheck spots the mismatch between what you own and what your photos actually communicate.",
    stat: "Signal audit",
  },
  {
    title: "Show the upgrade path",
    body: "You get the next move, not vague motivation: better lighting, tighter crop, clearer outfit direction, stronger image order.",
    stat: "Action map",
  },
  {
    title: "Make the spend smarter",
    body: "The app surfaces what to buy later and what to fix first so your money compounds instead of disappearing into random upgrades.",
    stat: "Budget logic",
  },
];

const offerCards = [
  {
    name: "Quick Fix",
    price: "Rs 49",
    caption: "Fastest ROI",
    description: "One-screen diagnosis for the single biggest leak killing your first impression.",
    href: "/unlock?product=quick_fix",
  },
  {
    name: "Full Aura Report",
    price: "Rs 99",
    caption: "Most popular",
    description: "Deep score breakdown, signal mismatch map, and a premium-looking upgrade roadmap.",
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
                premium gen-z first-impression engine
              </Badge>
              <h1 className="display-font max-w-4xl text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                Make the site feel like a luxury product before the first click even lands.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                AuraCheck reads the hidden leaks in your photos, profile, and style choices. The product should look just as sharp: cinematic, trend-aware, and premium enough to feel like a real brand instead of a useful tool.
              </p>

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
            <Badge variant="default">what makes this feel premium</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              The UI should communicate the same taste the product is trying to teach.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              Not generic SaaS. Not neon chaos. A calmer, richer visual language with depth, light, and enough motion to feel current without becoming gimmicky.
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
              <Badge variant="premium">proof examples</Badge>
              <h2 className="display-font mt-4 text-4xl font-bold text-white">Real upgrade energy, not fake hype.</h2>
              <p className="mt-4 text-sm leading-7 text-white/62">
                The product already has strong proof data. The interface should frame it with confidence: cleaner hierarchy, stronger contrast, and showcase cards that feel collectible.
              </p>
              <div className="mt-8 space-y-4">
                {PROOF_EXAMPLES.slice(0, 3).map((example) => (
                  <div
                    key={example.id}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="display-font text-2xl font-bold text-white">{example.title}</div>
                      <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                        +{example.scoreDelta}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-white/56">{example.fixApplied}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card hover>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">step 01</div>
                <h3 className="display-font mt-3 text-3xl font-bold text-white">Upload</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Start with a photo or screenshot that actually represents how you show up online.
                </p>
              </Card>
              <Card hover>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">step 02</div>
                <h3 className="display-font mt-3 text-3xl font-bold text-white">Diagnose</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  The engine identifies the strongest and weakest signals in the frame, then ranks the leaks.
                </p>
              </Card>
              <Card hover>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">step 03</div>
                <h3 className="display-font mt-3 text-3xl font-bold text-white">Upgrade</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  You see the cheapest fix with the biggest visible payoff before spending on the wrong thing.
                </p>
              </Card>
              <Card hover>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">step 04</div>
                <h3 className="display-font mt-3 text-3xl font-bold text-white">Track</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Recheck the signal after changes, compare progress, and build consistency instead of random bursts.
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
              Premium enough to convert, simple enough to trust.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
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
