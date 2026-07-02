"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ReferralBanner } from "@/components/marketing/ReferralBanner";
import { getAudits } from "@/lib/storage/auditStore";
import { getTwinStats } from "@/lib/storage/auraTwinStore";
import { getMarqueePresets } from "@/lib/marketing/rotatingPresets";

const marqueeStyles = getMarqueePresets();

const quickExplain = [
  {
    title: "Upload",
    body: "Drop a photo.",
  },
  {
    title: "Catch it",
    body: "See what kills the vibe.",
  },
  {
    title: "Switch it",
    body: "Fix it or shop it.",
  },
];

const offerCards = [
  {
    name: "Free Check",
    price: "Free",
    body: "Score + weak spot",
    href: "/audit/new",
  },
  {
    name: "Quick Fix",
    price: "Rs 49",
    body: "Fast next move",
    href: "/unlock?product=quick_fix",
  },
  {
    name: "Full Report",
    price: "Rs 99",
    body: "Deep breakdown",
    href: "/products/aura-report",
    featured: true,
  },
  {
    name: "Glow-Up",
    price: "Rs 499",
    body: "Full reset",
    href: "/products/glowup-plan",
  },
];

export default function HomePage() {
  const stats = useMemo(
    () => ({
      audits: typeof window !== "undefined" ? getAudits().length : 0,
      twins: typeof window !== "undefined" ? getTwinStats().totalSimulations : 0,
    }),
    [],
  );

  return (
    <>
      <ReferralBanner />

      <section className="relative overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-14">
        <div className="hero-grid absolute inset-x-0 top-0 h-[40rem]" />
        <Container className="relative">
          <div className="prism-panel glow-frame shine-sweep mb-6 overflow-hidden rounded-[30px] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">celebrity trend radar</div>
                <h2 className="display-font mt-2 text-2xl font-bold text-white sm:text-3xl">
                  See the looks moving live.
                </h2>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/wardrobe/search">Shop trends</Link>
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

          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <Badge variant="premium" className="mb-5">
                gen z first-impression upgrade
              </Badge>
              <h1 className="display-font max-w-4xl text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                Fix your look. Shop the better version.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/68 sm:text-lg">
                Find what feels off. Fix it fast. Compare the pieces before you buy.
              </p>

              <div className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="prism-panel float-card rounded-[22px] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">What it does</div>
                  <div className="mt-2 text-sm text-white/72">Finds the weakest part first</div>
                </div>
                <div className="prism-panel float-card rounded-[22px] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">How it helps</div>
                  <div className="mt-2 text-sm text-white/72">Shows the next best move</div>
                </div>
                <div className="prism-panel float-card rounded-[22px] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">Why pay</div>
                  <div className="mt-2 text-sm text-white/72">More depth. Better picks.</div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/audit/new">Start free</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/wardrobe/search">Compare style options</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <Card hover className="glow-frame spotlight p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">how it works</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {quickExplain.map((item) => (
                    <div key={item.title} className="prism-panel float-card rounded-[22px] p-4">
                      <div className="display-font text-2xl font-bold text-white">{item.title}</div>
                      <p className="mt-2 text-xs leading-6 text-white/62">{item.body}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card hover className="glow-frame p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">why it converts</div>
                    <div className="display-font mt-2 text-3xl font-bold text-white">Free finds it. Paid maps it.</div>
                    <p className="mt-2 text-sm leading-7 text-white/62">
                      No guesswork. Just the fix path and better buying options.
                    </p>
                  </div>
                  <div className="grid gap-3 text-right">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">audits</div>
                      <div className="display-font text-3xl font-bold text-white">{stats.audits || "Live"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">style sims</div>
                      <div className="display-font text-3xl font-bold text-white">{stats.twins || "3D"}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default">simple pricing</Badge>
            <h2 className="display-font mt-4 text-4xl font-bold text-white sm:text-5xl">
              Start free. Unlock more only if you want more detail.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {offerCards.map((offer) => (
              <Card
                key={offer.name}
                hover
                className={`float-card ${offer.featured ? "border-sky-200/28 shadow-[0_26px_90px_rgba(56,189,248,0.16)]" : ""}`}
              >
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">{offer.price}</div>
                <h3 className="display-font mt-3 text-3xl font-bold text-white">{offer.name}</h3>
                <p className="mt-3 text-sm text-white/62">{offer.body}</p>
                <div className="mt-6">
                  <Button asChild className="w-full" variant={offer.featured ? "primary" : "secondary"}>
                    <Link href={offer.href}>Open</Link>
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
            <Badge variant="premium">one line summary</Badge>
            <h2 className="display-font mt-5 text-4xl font-bold text-white sm:text-5xl">
              Spot the leak. Fix the vibe. Shop smarter.
            </h2>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/audit/new">Try free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/shop">Browse trends</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
