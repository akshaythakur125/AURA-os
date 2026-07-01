"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getAudits } from "@/lib/storage/auditStore";
import { getTwinStats } from "@/lib/storage/auraTwinStore";
import { ReferralBanner } from "@/components/marketing/ReferralBanner";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { PROOF_EXAMPLES } from "@/config/proofExamples";

const statusLeaks = [
  {
    title: "Expensive phone, weak background",
    desc: "A flagship phone means little if the background behind you screams \u201Cunmade bed at 3 PM.\u201D",
    severity: "high" as const,
  },
  {
    title: "Good outfit, poor fit",
    desc: "Even a premium brand looks off when the fit is baggy or the shoulders don\u2019t align.",
    severity: "high" as const,
  },
  {
    title: "Good face, bad lighting",
    desc: "Harsh overhead light can undo good grooming in a single frame.",
    severity: "medium" as const,
  },
  {
    title: "Premium watch, messy room",
    desc: "Luxury accessories lose impact when the surroundings suggest chaos.",
    severity: "medium" as const,
  },
  {
    title: "Nice profile, weak photo order",
    desc: "Your best photo should be first. Order signals priority.",
    severity: "low" as const,
  },
  {
    title: "Trying to look premium, mismatched details",
    desc: "A blazer with gym shorts. Formal shoes with a beach photo. The inconsistency leaks signal.",
    severity: "medium" as const,
  },
];

const products = [
  {
    name: "Free Aura Score",
    price: "0",
    desc: "Quick snapshot of your first impression.",
    features: ["Single photo scan", "Basic aura score", "3 leak insights"],
    bestFor: "Quick check",
    href: "/audit/new",
  },
  {
    name: "Quick Aura Fix",
    price: "49",
    desc: "Biggest leak and fastest fix path.",
    features: ["Biggest status leak", "Fastest free fix", "Under ₹500 fix", "Avoid wasting money"],
    bestFor: "Best first unlock",
    href: "/unlock?product=quick_fix",
    badgeText: "Best first unlock",
  },
  {
    name: "Full Aura Report",
    price: "99",
    desc: "Deep analysis with upgrade roadmap.",
    features: [
      "Up to 3 photos",
      "Full score breakdown",
      "Unlimited leak detection",
      "Priority upgrade plan",
    ],
    bestFor: "Serious upgrade",
    href: "/products/aura-report",
    highlighted: true,
  },
  {
    name: "Dating / Profile Audit",
    price: "299",
    desc: "Optimize your dating profile presentation.",
    features: [
      "Profile screenshot analysis",
      "Bio & photo coherence check",
      "Platform-specific tips",
      "Competitive signal audit",
    ],
    bestFor: "Profile optimizer",
    href: "/products/dating-audit",
  },
  {
    name: "30-Day Glow-Up Plan",
    price: "499",
    desc: "Weekly upgrade plan with tracking.",
    features: [
      "Full audit every week",
      "Personalized upgrade tasks",
      "Progress tracking",
      "Priority support",
    ],
    bestFor: "Best value",
    href: "/products/glowup-plan",
    badgeText: "Best value",
  },
];

export default function HomePage() {
  const stats = useMemo(() => ({
    auditCount: typeof window !== "undefined" ? getAudits().length : 0,
    twinCount: typeof window !== "undefined" ? getTwinStats().totalSimulations : 0,
  }), []);

  return (
    <>
      <ReferralBanner />
      {/* ─── 1. Hero ─── */}
      <section className="relative overflow-hidden pb-32 pt-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.08),transparent_50%)]" />
        <Container className="relative text-center">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
            First-Impression Intelligence
          </span>
          <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl">
            Find your biggest status leak.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 sm:text-xl">
            You may have the phone, the outfit, or the profile. AuraCheck shows
            what is weakening your first impression — and how to upgrade your
            visual signal under your budget.
          </p>

          {/* Live counter */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500">
            {stats.auditCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {stats.auditCount} audit{stats.auditCount !== 1 ? "s" : ""} completed
              </span>
            )}
            {stats.twinCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                {stats.twinCount} twin simulation{stats.twinCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/audit/new">
              <Button size="lg">Start Free Aura Check</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-600">
            Local-only MVP. No external AI. Your image stays in your browser.
          </p>
        </Container>
      </section>

      {/* ─── 2. Social Psychology Hook ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              People do not only buy products. They buy signals.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Every visible detail in your photo or profile sends a message —
              whether you intend it or not.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Phone is a signal</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                The phone in your hand says something. But a scratched screen,
                dull case, or outdated model can quietly undermine the story
                your photo tells.
              </p>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Outfit is a signal</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Fit matters more than brand. A well-fitted basic tee signals
                self-awareness better than a logo-heavy hoodie that does not sit
                right.
              </p>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Background is a signal</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Your background is the frame of your story. A cluttered room,
                blank wall, or generic cafe each send different signals about
                your lifestyle.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* ─── 3. Status Leak Detector ─── */}
      <section id="examples" className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Your most expensive item may not be your strongest signal.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              These are the kinds of status leaks AuraCheck detects — small
              mismatches between what you own and how you present it.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statusLeaks.map((leak) => (
              <Card key={leak.title} hover>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{leak.title}</h3>
                  <Badge
                    variant={
                      leak.severity === "high"
                        ? "danger"
                        : leak.severity === "medium"
                          ? "warning"
                          : "default"
                    }
                  >
                    {leak.severity}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">{leak.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── 4. Product Outputs ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              AuraCheck gives you a practical upgrade path.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Three clear outputs. No fluff.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card hover className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-600/10 blur-2xl" />
              <Badge variant="premium" className="mb-3">Output 1</Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">Aura Score</h3>
              <p className="mb-4 text-sm text-gray-400">
                A composite score across visual, presentation, signal, and
                cohesion dimensions.
              </p>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Overall Score</span>
                  <span className="text-2xl font-bold text-white">68</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-purple-600 to-pink-500" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-600">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            </Card>
            <Card hover className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-pink-600/10 blur-2xl" />
              <Badge variant="premium" className="mb-3">Output 2</Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">Biggest Status Leaks</h3>
              <p className="mb-4 text-sm text-gray-400">
                Specific elements in your photos and profile that may be
                weakening your first impression.
              </p>
              <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span className="text-gray-300">Background quality</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="text-gray-300">Lighting consistency</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span className="text-gray-300">Outfit fit</span>
                </div>
              </div>
            </Card>
            <Card hover className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-600/10 blur-2xl" />
              <Badge variant="premium" className="mb-3">Output 3</Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">Budget Upgrade Plan</h3>
              <p className="mb-4 text-sm text-gray-400">
                Actionable upgrades ranked by effort and cost — from free tweaks
                to high-impact investments.
              </p>
              <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Better lighting</span>
                  <span className="text-xs text-emerald-400">Free</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Cleaner frame</span>
                  <span className="text-xs text-emerald-400">Free</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Neutral outfit</span>
                  <span className="text-xs text-amber-400">₹2,000</span>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* ─── 5. How It Works ─── */}
      <section id="how-it-works" className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Four steps to know where you stand.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-4">
            {[
              {
                step: "1",
                title: "Upload photo or profile screenshot",
                desc: "Pick an image you have used or plan to use publicly.",
              },
              {
                step: "2",
                title: "Select your goal",
                desc: "Casual, professional, dating, or social — the lens changes.",
              },
              {
                step: "3",
                title: "Select your budget",
                desc: "From zero spend to a full upgrade — we match the plan.",
              },
              {
                step: "4",
                title: "Get your Aura Score & upgrade path",
                desc: "See your score, leaks, and a clear path to upgrade.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-xl border border-purple-500/10 bg-purple-500/5 p-4 text-center text-sm text-gray-400">
            The current MVP uses local rule-based AI-style logic. No image is
            sent to any external server.
          </div>
        </Container>
      </section>

      {/* ─── 5.5. Start Small — Fix the Biggest Leak First ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Start small. Fix the biggest leak first.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Not every upgrade costs thousands. Start with one step and go deeper when you are ready.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            <Card hover>
              <Badge variant="success" className="mb-3">₹0 — Free</Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">Free Score</h3>
              <p className="text-sm text-gray-400">Find your Aura Score.</p>
              <div className="mt-6">
                <Link href="/audit/new"><Button size="sm" variant="outline" className="w-full">Start Free</Button></Link>
              </div>
            </Card>
            <Card hover className="border-emerald-500/30 ring-1 ring-emerald-500/20">
              <Badge variant="success" className="absolute -top-2 right-4">Best first unlock</Badge>
              <Badge variant="premium" className="mb-3">₹49 — Quick Fix</Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">Quick Aura Fix</h3>
              <p className="text-sm text-gray-400">Know exactly what to fix first.</p>
              <div className="mt-6">
                <Link href="/unlock?product=quick_fix"><Button size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400">See ₹49 Quick Fix</Button></Link>
              </div>
            </Card>
            <Card hover>
              <Badge variant="premium" className="mb-3">₹99 — Full Report</Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">Full Aura Report</h3>
              <p className="text-sm text-gray-400">Understand the full reason.</p>
              <div className="mt-6">
                <Link href="/products/aura-report"><Button size="sm" variant="outline" className="w-full">Learn More</Button></Link>
              </div>
            </Card>
            <Card hover className="border-amber-500/20">
              <Badge variant="premium" className="absolute -top-2 right-4">Best value</Badge>
              <Badge variant="premium" className="mb-3">₹499 — Glow-Up</Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">30-Day Glow-Up Plan</h3>
              <p className="text-sm text-gray-400">Follow a 30-day upgrade system.</p>
              <div className="mt-6">
                <Link href="/products/glowup-plan"><Button size="sm" variant="outline" className="w-full">Learn More</Button></Link>
              </div>
            </Card>
          </div>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/audit/new"><Button size="lg">Start Free Aura Check</Button></Link>
            <Link href="/unlock?product=quick_fix"><Button variant="outline" size="lg" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">See ₹49 Quick Fix</Button></Link>
          </div>
        </Container>
      </section>

      {/* ─── 6. Pricing Teaser ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Choose your audit depth
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Start free. Go deeper when you are ready.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Card
                key={product.name}
                className={`relative flex flex-col ${product.highlighted ? "border-purple-500/30 ring-1 ring-purple-500/20" : ""}`}
              >
                {product.badgeText && (
                  <Badge variant={product.badgeText === "Best first unlock" ? "success" : "premium"} className="absolute -top-2 right-4">
                    {product.badgeText}
                  </Badge>
                )}
                <div className="mb-1 text-xs text-gray-500">{product.bestFor}</div>
                <h3 className="text-lg font-bold text-white">{product.name}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    &#8377;{product.price}
                  </span>
                  <span className="text-xs text-gray-500">one-time</span>
                </div>
                <p className="mt-2 text-xs text-gray-400">{product.desc}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                      <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link href={product.href}>
                    <Button
                      variant={product.highlighted ? "primary" : "outline"}
                      className="w-full text-xs"
                      size="sm"
                    >
                      {product.price === "0" ? "Start Free" : "Learn More"}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-gray-600">
            Payment unlock will be available soon through manual UPI transfer.
          </p>
        </Container>
      </section>

      {/* ─── 7. Small Fixes Beat Expensive Upgrades ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Small fixes can beat expensive upgrades.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              You do not need to spend thousands. Fix the right thing first.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { example: PROOF_EXAMPLES[0], label: "Lighting Fix" },
              { example: PROOF_EXAMPLES[1], label: "Background Fix" },
              { example: PROOF_EXAMPLES[7], label: "Avoid Waste" },
            ].map(({ example, label }) => (
              <Card key={example.id} className="border-white/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="success">{label}</Badge>
                  <span className="text-xs text-emerald-400">+{example.scoreDelta} pts</span>
                </div>
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-red-950/30 p-2 text-center">
                    <div className="text-[10px] text-red-400">Before</div>
                    <div className="text-lg font-bold text-red-400">{example.beforeScore}</div>
                  </div>
                  <div className="rounded-lg bg-emerald-950/30 p-2 text-center">
                    <div className="text-[10px] text-emerald-400">After</div>
                    <div className="text-lg font-bold text-emerald-400">{example.afterScore}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">{example.biggestLeak} → {example.fixApplied}</div>
                <div className="mt-1 text-xs text-emerald-500">{example.costLabel}</div>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/before-after">
              <Button variant="outline" size="lg" onClick={() => trackEvent("proof_pricing_clicked", { source: "homepage" })}>
                See Before/After Examples
              </Button>
            </Link>
            <Link href="/audit/new">
              <Button size="lg">Start Free Aura Check</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── 8. Sample Report Preview ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              See what a report looks like
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              A real preview from a simulated audit.
            </p>
          </div>
          <Card className="relative mx-auto max-w-2xl overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-300">
                  Sample Report
                </span>
                <Badge variant="premium">Urban Aspirational</Badge>
              </div>
              <div className="mb-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-gray-500">Aura Score</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">72</span>
                    <span className="text-sm text-gray-500">/ 100</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-purple-600 to-pink-500" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Strongest Signal</div>
                    <div className="text-sm font-medium text-emerald-400">Grooming</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Biggest Status Leak</div>
                    <div className="text-sm font-medium text-red-400">Background</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="mb-1 text-xs text-gray-500">Quick Fix</div>
                <p className="text-sm text-gray-300">
                  Better lighting and cleaner frame
                </p>
                <div className="mt-3 border-t border-white/5 pt-3">
                  <div className="text-xs text-gray-500">
                    Budget Upgrade:{" "}
                    <span className="text-amber-400">&#8377;2,000–&#8377;5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <div className="mt-8 text-center">
            <Link href="/examples">
              <Button variant="outline">View All Sample Reports</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── 8. Status Consistency ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Status is not one thing. It is signal consistency.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Every visible detail in your presentation either strengthens or
              weakens your first impression. AuraCheck helps you find the gaps
              and fix them.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Archetype Detection</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                AuraCheck classifies your presentation into one of 11 status
                archetypes — from Clean Basic to Urban Aspirational to Premium
                Minimalist.
              </p>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Signal Mismatch Analysis</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Expensive phone with a cluttered background. Dating profile with
                a try-hard filter. AuraCheck detects these mismatches and tells
                you which one to fix first.
              </p>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Goal-Specific Upgrade Path</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                AuraCheck generates a personalized strategy for your specific
                goal — dating, Instagram, office, college, or glow-up. Every
                recommendation targets your biggest status leak first.
              </p>
            </Card>
          </div>
          <div className="mt-10 text-center">
            <Link href="/audit/new">
              <Button size="lg">Find Your Status Archetype</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── 9. Four Ways to Upgrade ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Four ways to upgrade your signal
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Start with a ₹49 fix. Go deeper when you are ready.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card hover className="border-emerald-500/20">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Quick Aura Fix</h3>
              <p className="mb-4 text-sm text-gray-400">Find your biggest leak and the fastest fix. Best first unlock at ₹49.</p>
              <Badge variant="success">Best first unlock</Badge>
              <ul className="mt-4 space-y-1.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Biggest status leak</li>
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Fastest free fix path</li>
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Under ₹500 fix</li>
              </ul>
              <div className="mt-6">
                <Link href="/unlock?product=quick_fix"><Button variant="outline" size="sm" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">Get Quick Fix — ₹49</Button></Link>
              </div>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Full Aura Report</h3>
              <p className="mb-4 text-sm text-gray-400">Deep visual analysis with upgrade roadmap. Most popular at ₹99.</p>
              <Badge variant="premium">Most popular</Badge>
              <ul className="mt-4 space-y-1.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Full score breakdown</li>
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Status leak analysis</li>
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Archetype + mismatch map</li>
              </ul>
              <div className="mt-6">
                <Link href="/products/aura-report"><Button variant="outline" size="sm">Learn More</Button></Link>
              </div>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Dating/Profile Audit</h3>
              <p className="mb-4 text-sm text-gray-400">Profile presentation score, bio feedback, and photo strategy at ₹299.</p>
              <Badge variant="success">Best for profile clarity</Badge>
              <ul className="mt-4 space-y-1.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Text clarity & originality score</li>
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Bio + prompt feedback</li>
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Photo order strategy</li>
              </ul>
              <div className="mt-6">
                <Link href="/products/dating-audit"><Button variant="outline" size="sm">Learn More</Button></Link>
              </div>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">30-Day Glow-Up Plan</h3>
              <p className="mb-4 text-sm text-gray-400">Structured 30-day roadmap with daily missions and systems. Best value at ₹499.</p>
              <Badge variant="premium">Best value</Badge>
              <ul className="mt-4 space-y-1.5 text-sm text-gray-400">
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>30 daily missions</li>
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Budget roadmap (₹0–₹25K+)</li>
                <li className="flex items-center gap-2"><svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Photo/grooming/outfit systems</li>
              </ul>
              <div className="mt-6">
                <Link href="/products/glowup-plan"><Button variant="outline" size="sm">Learn More</Button></Link>
              </div>
            </Card>
          </div>
          <div className="mt-10 text-center">
            <Link href="/audit/new">
              <Button size="lg">Start Free — ₹0</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── 10. Upgrade ROI ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Not every upgrade gives equal status impact.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              AuraCheck helps you find the cheapest change that improves your first impression the most.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-red-500/10">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-sm font-bold text-red-400">X</span>
                <Badge variant="danger">Bad Upgrade</Badge>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">Expensive item before fixing basics</h3>
              <p className="text-sm text-gray-400">
                Buying a flagship phone or premium watch before fixing lighting and background. The expensive item loses impact when the frame is weak.
              </p>
              <div className="mt-3 rounded-lg bg-red-500/5 p-3 text-xs text-red-400">
                ROI: Low — the upgrade is invisible because the basics are broken.
              </div>
            </Card>
            <Card className="border-emerald-500/10">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-400">✓</span>
                <Badge variant="success">Smart Upgrade</Badge>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">Lighting + grooming + clean outfit</h3>
              <p className="text-sm text-gray-400">
                A ring light, fresh haircut, and solid-color shirt cost under ₹2,000 combined. The improvement in first impression is dramatic.
              </p>
              <div className="mt-3 rounded-lg bg-emerald-500/5 p-3 text-xs text-emerald-400">
                ROI: High — each element compounds the others for maximum visible impact.
              </div>
            </Card>
            <Card className="border-purple-500/10">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-sm font-bold text-purple-400">★</span>
                <Badge variant="premium">Best Upgrade</Badge>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">Target your biggest status leak</h3>
              <p className="text-sm text-gray-400">
                AuraCheck identifies the single leak causing the most signal damage. Fixing it first gives you the highest ROI per rupee spent.
              </p>
              <div className="mt-3 rounded-lg bg-purple-500/5 p-3 text-xs text-purple-300">
                ROI: Maximum — targeted fixes eliminate the weakest link in your presentation.
              </div>
            </Card>
          </div>
          <div className="mt-10 text-center">
            <Link href="/shop">
              <Button variant="outline">Browse Upgrade Recommendations</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── 11. Growth Features ─── */}
      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Share, Compete, Improve
            </h2>
            <p className="mt-4 text-lg text-gray-400">Your Aura Score is the start. Challenges and progress tracking make it stick.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Share Your Score</h3>
              <p className="text-sm text-gray-400">Share your Aura Score without sharing your photo. Invite friends to check their own status leak.</p>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Join Challenges</h3>
              <p className="text-sm text-gray-400">Enter your audit into challenges like Best Background or Dating Profile Cleanup.</p>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Track Progress</h3>
              <p className="text-sm text-gray-400">Compare before and after audits. See your score improve and which signals got better.</p>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Invite Friends</h3>
              <p className="text-sm text-gray-400">Share your referral code. Friends can check their own Aura Score and join challenges.</p>
            </Card>
          </div>
          <div className="mt-10 text-center">
            <Link href="/challenges">
              <Button variant="outline" size="lg">View Challenges</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── 12. Safety Note ─── */}
      <section className="border-t border-white/5 py-12">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <p className="mb-3 text-sm text-gray-500">
              AuraCheck analyzes presentation, not human worth. Scores are
              guidance, not objective truth.
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>Profile guidance is for presentation clarity, not dating guarantees.</p>
              <p>Glow-up plan is self-improvement guidance, not a guarantee of social outcomes.</p>
              <p>No external AI service is used in this MVP.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 11. Final CTA ─── */}
      <section className="relative overflow-hidden border-t border-white/5 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.12),transparent_50%)]" />
        <Container className="relative text-center">
          <h2 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            Ready to check your visual signal?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-400">
            Two minutes. No login. See what your first impression is really
            saying.
          </p>
          <div className="mt-8">
            <Link href="/audit/new">
              <Button size="lg">Start Free Aura Check</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
