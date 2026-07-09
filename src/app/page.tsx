import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { FadeInView } from "@/components/ui/FadeInView";

const leaks = [
  {
    title: "Expensive phone, weak background",
    desc: "A flagship phone means little if the background behind you screams \u201Cunmade bed at 3 PM.\u201D",
    severity: "high" as const,
  },
  {
    title: "Good outfit, poor fit",
    desc: "Even a premium brand looks off when the fit is baggy or the shoulders don't align.",
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
    href: "/pricing",
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
    href: "/pricing",
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
    bestFor: "Maximum impact",
    href: "/pricing",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Aurora Mesh ─── */}
      <div className="aurora-mesh" />
      <div className="aurora-mesh-third" />

      {/* ─── Hero ─── */}
      <section className="parallax-section relative overflow-hidden pb-28 pt-20 sm:pt-28">
        <GlowOrb color="rgba(147, 51, 234, 0.22)" size={700} className="top-[-15%] left-[5%]" delay={0} />
        <GlowOrb color="rgba(236, 72, 153, 0.15)" size={550} className="top-[15%] right-[0%]" delay={600} />
        <GlowOrb color="rgba(14, 165, 233, 0.1)" size={450} className="bottom-[5%] left-[25%]" delay={1200} />

        <Container className="relative text-center">
          <FadeInView>
            <span className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1 text-xs text-purple-300 badge-embossed">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              First-Impression Intelligence
            </span>
          </FadeInView>
          <FadeInView delay={100}>
            <h1 className="mx-auto max-w-4xl gradient-text-animated text-5xl font-bold sm:text-6xl md:text-[4.5rem] md:leading-[1.02] lg:text-[5rem]">
              Find your biggest status leak.
            </h1>
          </FadeInView>
          <FadeInView delay={200}>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed">
              You may have the phone, the outfit, or the profile. AuraCheck shows
              what is weakening your first impression and how to upgrade your
              visual signal under your budget.
            </p>
          </FadeInView>
          <FadeInView delay={300}>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/audit/new">
                <Button size="lg">Start Free Aura Check</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </FadeInView>
          <FadeInView delay={400}>
            <p className="mt-8 text-xs text-gray-600">
              No login. No external API. Your image stays in your browser in this MVP.
            </p>
          </FadeInView>
        </Container>
      </section>

      {/* ─── Social Psychology Hook ─── */}
      <section className="relative border-t border-white/[0.04] py-24">
        <GlowOrb color="rgba(147, 51, 234, 0.1)" size={350} className="top-[20%] right-[10%]" delay={200} />
        <Container className="relative">
          <FadeInView>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
                People do not only buy products. They buy signals.
              </h2>
              <p className="mt-5 text-lg text-gray-400">
                Every visible detail in your photo or profile sends a message —
                whether you intend it or not.
              </p>
            </div>
          </FadeInView>
          <div className="bento-grid">
            <FadeInView delay={0}>
              <Card hover className="bento-span-2">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 shadow-[var(--shadow-glow-purple)]">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Phone is a signal
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  The phone in your hand says something. But a scratched screen,
                  dull case, or outdated model can quietly undermine the story
                  your photo tells.
                </p>
              </Card>
            </FadeInView>
            <FadeInView delay={100}>
              <Card hover>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-[var(--shadow-glow-pink)]">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Outfit is a signal
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  Fit matters more than brand. A well-fitted basic tee signals
                  self-awareness better than a logo-heavy hoodie that does not sit
                  right.
                </p>
              </Card>
            </FadeInView>
            <FadeInView delay={200}>
              <Card hover>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-[var(--shadow-glow-blue)]">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Background is a signal
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  Your background is the frame of your story. A cluttered room,
                  blank wall, or generic cafe each send different signals about
                  your lifestyle.
                </p>
              </Card>
            </FadeInView>
          </div>
        </Container>
      </section>

      {/* ─── Status Leak Detector ─── */}
      <section id="examples" className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              Your most expensive item may not be your strongest signal.
            </h2>
            <p className="mt-5 text-lg text-gray-400">
              These are the kinds of status leaks AuraCheck detects — small
              mismatches between what you own and how you present it.
            </p>
          </div>
          <div className="bento-grid">
            {leaks.map((leak, i) => (
              <Card key={leak.title} hover className={i < 2 ? "bento-span-2" : ""}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    {leak.title}
                  </h3>
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
                <p className="text-sm leading-relaxed text-gray-400">
                  {leak.desc}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Product Outcomes ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              AuraCheck gives you a practical upgrade path.
            </h2>
            <p className="mt-5 text-lg text-gray-400">
              Three clear outputs. No fluff.
            </p>
          </div>
          <div className="bento-grid">
            <Card hover className="bento-span-2 relative overflow-hidden">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-600/10 blur-2xl" />
              <Badge variant="premium" className="mb-3">
                Output 1
              </Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Aura Score
              </h3>
              <p className="mb-4 text-sm text-gray-400">
                A composite score across visual, presentation, signal, and
                cohesion dimensions.
              </p>
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Overall Score</span>
                  <span className="text-3xl font-bold text-white">68</span>
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
              <Badge variant="premium" className="mb-3">
                Output 2
              </Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Biggest Status Leaks
              </h3>
              <p className="mb-4 text-sm text-gray-400">
                Specific elements in your photos and profile that may be
                weakening your first impression.
              </p>
              <div className="space-y-2 rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
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
              <Badge variant="premium" className="mb-3">
                Output 3
              </Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Budget Upgrade Plan
              </h3>
              <p className="mb-4 text-sm text-gray-400">
                Actionable upgrades ranked by effort and cost — from free tweaks
                to high-impact investments.
              </p>
              <div className="space-y-2 rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
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

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Four steps to know where you stand.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {[
              {
                step: "1",
                title: "Upload photo or profile screenshot",
                desc: "Pick an image you have used or plan to use publicly.",
                highlight: true,
              },
              {
                step: "2",
                title: "Select your goal",
                desc: "Casual, professional, dating, or social — the lens changes.",
                highlight: false,
              },
              {
                step: "3",
                title: "Select your budget",
                desc: "From zero spend to a full upgrade — we match the plan.",
                highlight: false,
              },
              {
                step: "4",
                title: "Get your Aura Score & upgrade plan",
                desc: "See your score, leaks, and a clear path to upgrade.",
                highlight: true,
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`rounded-2xl p-6 text-left ${
                  item.highlight
                    ? "glass-elevated"
                    : "glass-card"
                }`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-lg font-bold text-white shadow-[var(--shadow-glow-purple)]">
                  {item.step}
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-xl border border-purple-500/10 bg-purple-500/5 p-4 text-center text-sm text-gray-400">
            The current MVP uses local rule-based AI-style logic. No image is
            sent to any external server.
          </div>
        </Container>
      </section>

      {/* ─── Monetization Preview ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              Choose your audit depth
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Start free. Go deeper when you are ready.
            </p>
          </div>
          <div className="bento-grid">
            {products.map((product) => (
              <Card
                key={product.name}
                className={`relative flex flex-col ${
                  product.highlighted
                    ? "bento-span-2 border-purple-500/30 ring-1 ring-purple-500/20 glass-elevated"
                    : ""
                }`}
              >
                {product.highlighted && (
                  <Badge variant="premium" className="absolute -top-2 right-4">
                    Popular
                  </Badge>
                )}
                <div className="mb-1 text-xs text-gray-500">
                  {product.bestFor}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {product.name}
                </h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`${product.highlighted ? "text-4xl" : "text-3xl"} font-bold text-white`}>
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

      {/* ─── See Sample Reports ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              See sample reports before paying
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Three demo reports — one for each product. See exactly what you get before you decide to unlock.
            </p>
          </div>
          <div className="bento-grid">
            <Link href="/products/aura-report" className="group bento-span-2">
              <Card hover className="relative overflow-hidden h-full">
                <Badge variant="premium" className="mb-3">Aura Report — ₹99</Badge>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-bold text-white">72</span>
                  <span className="text-xs text-gray-500">/ 100</span>
                </div>
                <p className="text-sm text-gray-400">Full visual breakdown, status leaks ranked, budget upgrade plan, and shareable card.</p>
                <span className="mt-4 inline-block text-xs text-purple-400 group-hover:text-purple-300">View product →</span>
              </Card>
            </Link>
            <Link href="/products/dating-audit" className="group">
              <Card hover className="relative overflow-hidden h-full">
                <Badge variant="premium" className="mb-3">Dating Audit — ₹299</Badge>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-white">68</span>
                  <span className="text-xs text-gray-500">/ 100</span>
                </div>
                <p className="text-sm text-gray-400">Bio analysis, red-flag detection, prompt grading, and 3 suggested bios.</p>
                <span className="mt-4 inline-block text-xs text-purple-400 group-hover:text-purple-300">View product →</span>
              </Card>
            </Link>
            <Link href="/products/glowup-plan" className="group">
              <Card hover className="relative overflow-hidden h-full">
                <Badge variant="premium" className="mb-3">Glow-Up Plan — ₹499</Badge>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-white">74</span>
                  <span className="text-xs text-gray-500">/ 100</span>
                </div>
                <p className="text-sm text-gray-400">30-day roadmap, daily missions, budget tiers, and week-by-week focus.</p>
                <span className="mt-4 inline-block text-xs text-purple-400 group-hover:text-purple-300">View product →</span>
              </Card>
            </Link>
          </div>
          <div className="mt-8 text-center">
            <Link href="/examples">
              <Button variant="outline" size="lg">View All Sample Reports</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── Three Paid Upgrades ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              Three paid upgrades. One clear path.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Start free. Go deeper when you are ready.
            </p>
          </div>
          <div className="bento-grid">
            <Card hover className="bento-span-2 text-center glass-elevated">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-lg font-bold text-white shadow-[var(--shadow-glow-purple)]">1</div>
              <h3 className="mb-2 text-lg font-semibold text-white">Full Aura Report</h3>
              <p className="mb-2 text-3xl font-bold text-amber-400">₹99</p>
              <p className="text-sm text-gray-400">Deep analysis of your visual signal with a detailed upgrade roadmap.</p>
              <div className="mt-4"><Link href="/products/aura-report"><Button variant="outline" size="sm">Learn More</Button></Link></div>
            </Card>
            <Card hover className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-lg font-bold text-white shadow-[var(--shadow-glow-pink)]">2</div>
              <h3 className="mb-2 text-lg font-semibold text-white">Dating Profile Audit</h3>
              <p className="mb-2 text-2xl font-bold text-amber-400">₹299</p>
              <p className="text-sm text-gray-400">Profile text analysis with bio suggestions, red-flag detection, and prompt grading.</p>
              <div className="mt-4"><Link href="/products/dating-audit"><Button variant="outline" size="sm">Learn More</Button></Link></div>
            </Card>
            <Card hover className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-lg font-bold text-white shadow-[var(--shadow-glow-blue)]">3</div>
              <h3 className="mb-2 text-lg font-semibold text-white">30-Day Glow-Up Plan</h3>
              <p className="mb-2 text-2xl font-bold text-amber-400">₹499</p>
              <p className="text-sm text-gray-400">A structured month-long roadmap for grooming, outfit, and photo consistency.</p>
              <div className="mt-4"><Link href="/products/glowup-plan"><Button variant="outline" size="sm">Learn More</Button></Link></div>
            </Card>
          </div>
        </Container>
      </section>

      {/* ─── Referral / Invite Section ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              Invite friends. Earn rewards.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Share your referral code after your first audit. When friends claim it, you both get a boost.
            </p>
          </div>
          <div className="mx-auto max-w-lg rounded-xl border border-purple-500/20 bg-purple-500/5 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            <p className="mb-4 text-sm text-gray-300">Get your unique referral link after completing an audit. Share it with friends to earn recognition on the leaderboard.</p>
            <p className="text-xs text-gray-500">Referral tracking is local-only in this MVP. No real rewards — just bragging rights.</p>
          </div>
          <div className="mt-8 text-center">
            <Link href="/dashboard"><Button variant="outline" size="lg">Get Your Referral Link</Button></Link>
          </div>
        </Container>
      </section>

      {/* ─── Challenges Section ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              Challenges to level up
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Daily and weekly challenges to improve your visual signal and track your progress against yourself.
            </p>
          </div>
          <div className="bento-grid">
            <Card hover className="bento-span-2 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-lg font-bold text-white shadow-[var(--shadow-glow-purple)]">1</div>
              <h3 className="mb-2 text-lg font-semibold text-white">Photo Challenge</h3>
              <p className="mb-4 text-sm text-gray-400">Upload a new photo with improved lighting and framing. Score yourself against your previous best.</p>
            </Card>
            <Card hover className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-lg font-bold text-white shadow-[var(--shadow-glow-pink)]">2</div>
              <h3 className="mb-2 text-lg font-semibold text-white">Consistency Challenge</h3>
              <p className="mb-4 text-sm text-gray-400">Submit the same photo type 3 days in a row. Track how your signal consistency improves.</p>
            </Card>
            <Card hover className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-lg font-bold text-white shadow-[var(--shadow-glow-blue)]">3</div>
              <h3 className="mb-2 text-lg font-semibold text-white">Profile Refresh</h3>
              <p className="mb-4 text-sm text-gray-400">Redo your dating or Instagram profile and run a new audit to compare the delta.</p>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <Link href="/challenges"><Button size="lg">Explore Challenges</Button></Link>
          </div>
        </Container>
      </section>

      {/* ─── Install App Section ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              Use AuraCheck like an app
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Install on your home screen for quick access. Works offline after first visit.
            </p>
          </div>
          <div className="mx-auto max-w-sm rounded-xl border border-white/[0.04] bg-white/[0.02] p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">AuraCheck</h3>
            <p className="mb-4 text-sm text-gray-400">First-impression intelligence</p>
            <div className="space-y-2 text-left text-xs text-gray-500">
              <p className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-purple-400" /> Chrome Android: Add to Home Screen</p>
              <p className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-purple-400" /> iOS Safari: Share → Add to Home Screen</p>
              <p className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-purple-400" /> Desktop: Install icon in address bar</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href="/install"><Button variant="outline" size="lg">Installation Guide</Button></Link>
          </div>
        </Container>
      </section>

      {/* ─── Example Report Preview ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
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
                    <div className="text-sm font-medium text-emerald-400">
                      Grooming
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">
                      Biggest Status Leak
                    </div>
                    <div className="text-sm font-medium text-red-400">
                      Background
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
                <div className="mb-1 text-xs text-gray-500">Quick Fix</div>
                <p className="text-sm text-gray-300">
                  Better lighting and cleaner frame
                </p>
                <div className="mt-3 border-t border-white/[0.04] pt-3">
                  <div className="text-xs text-gray-500">
                    Budget Upgrade:{" "}
                    <span className="text-amber-400">&#8377;2,000–&#8377;5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* ─── Signal Consistency ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              Status is not one thing. It is signal consistency.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Every visible detail in your presentation either strengthens or weakens your first impression.
              AuraCheck helps you find the gaps and fix them.
            </p>
          </div>
          <div className="bento-grid">
            <Card hover className="bento-span-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 shadow-[var(--shadow-glow-purple)]">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Archetype Detection</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                AuraCheck classifies your presentation into one of 11 status archetypes — from Clean Basic
                to Urban Aspirational to Premium Minimalist. Knowing your archetype tells you which direction
                to upgrade.
              </p>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-[var(--shadow-glow-pink)]">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Signal Mismatch Analysis</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Expensive phone with a cluttered background. Dating profile with a try-hard filter. Office photo
                with a casual selfie. AuraCheck detects these mismatches and tells you which one to fix first.
              </p>
            </Card>
            <Card hover>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-[var(--shadow-glow-blue)]">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Goal-Specific Upgrade Path</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                AuraCheck generates a personalized strategy for your specific goal — dating, Instagram, office,
                college, or glow-up. Every recommendation targets your biggest status leak first.
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

      {/* ─── Share Card Preview ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              Built to be shared.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Generate a clean Aura Score card without exposing your photo by
              default.
            </p>
          </div>
          <div className="mx-auto max-w-sm">
            <Card className="relative overflow-hidden border-purple-500/20">
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-purple-600/10 blur-2xl" />
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-purple-400">AuraCheck</span>
                <Badge variant="premium">Clean but Basic</Badge>
              </div>
              <div className="mb-4">
                <div className="text-5xl font-bold text-white">72</div>
                <div className="text-sm text-gray-500">/ 100</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-purple-600 to-pink-500" />
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2">
                  <span className="text-red-400">Biggest Status Leak:</span>
                  <span className="text-gray-300">Background</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
                  <span className="text-emerald-400">Upgrade Path:</span>
                  <span className="text-gray-300">Better lighting + cleaner frame</span>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-500/10 py-2 text-center text-xs text-purple-300">
                Find your biggest status leak
              </div>
            </Card>
          </div>
          <p className="mt-6 text-center text-xs text-gray-600">
            Your uploaded image is never included in a share card unless you
            turn it on.
          </p>
        </Container>
      </section>

      {/* ─── Upgrade Impact ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              Not every upgrade gives equal status impact.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              AuraCheck helps you find the cheapest change that improves your
              first impression the most.
            </p>
          </div>
          <div className="bento-grid">
            <Card hover className="border-red-500/10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600/20 to-red-500/10">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <Badge variant="danger" className="mb-3">Bad Upgrade</Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Buying an expensive phone before fixing basics
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                A flagship phone means little if the lighting is harsh, the
                background is cluttered, or your outfit does not fit. The
                contrast between a premium device and a weak frame makes the
                status leak worse, not better.
              </p>
            </Card>
            <Card hover className="bento-span-2 border-purple-500/10 glass-elevated">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-500/10 shadow-[var(--shadow-glow-purple)]">
                <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <Badge variant="premium" className="mb-3">Best Upgrade</Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Target your biggest status leak first
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                AuraCheck identifies your single biggest status leak — the one
                element weakening your first impression the most. Fixing that
                one thing delivers more visible upgrade per rupee than any
                random purchase.
              </p>
            </Card>
            <Card hover className="border-emerald-500/10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-500/10">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <Badge variant="success" className="mb-3">Smart Upgrade</Badge>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Better lighting + grooming + clean outfit
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Upgrading your lighting setup, basic grooming, and wearing a
                well-fitted solid-color outfit costs under ₹3,000 combined. This
                changes how every photo of you is perceived — regardless of the
                phone or background.
              </p>
            </Card>
          </div>
          <div className="mt-10 text-center">
            <Link href="/audit/new">
              <Button size="lg">Start Free Aura Check</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── Safety Note ─── */}
      <section className="border-t border-white/[0.04] py-12">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-white/[0.04] bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-gray-500">
              AuraCheck analyzes presentation, not human worth. Scores are
              guidance, not objective truth.
            </p>
          </div>
        </Container>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden border-t border-white/[0.04] py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.12),transparent_50%)]" />
        <Container className="relative text-center">
          <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
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
