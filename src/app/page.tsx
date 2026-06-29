import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pb-32 pt-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.08),transparent_50%)]" />
        <Container className="relative text-center">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            First-Impression Intelligence
          </span>
          <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl">
            Find your biggest status leak.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 sm:text-xl">
            You may have the phone, the outfit, or the profile. AuraCheck shows
            what is weakening your first impression and how to upgrade your
            visual signal under your budget.
          </p>
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
            No login. No external API. Your image stays in your browser in this
            MVP.
          </p>
        </Container>
      </section>

      {/* ─── Social Psychology Hook ─── */}
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
              <h3 className="mb-2 text-lg font-semibold text-white">
                Phone is a signal
              </h3>
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
              <h3 className="mb-2 text-lg font-semibold text-white">
                Outfit is a signal
              </h3>
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
              <h3 className="mb-2 text-lg font-semibold text-white">
                Background is a signal
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Your background is the frame of your story. A cluttered room,
                blank wall, or generic cafe each send different signals about
                your lifestyle.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* ─── Status Leak Detector ─── */}
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
            {leaks.map((leak) => (
              <Card key={leak.title} hover>
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

      {/* ─── How It Works ─── */}
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
                title: "Get your Aura Score & upgrade plan",
                desc: "See your score, leaks, and a clear path to upgrade.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500">
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

      {/* ─── Example Report Preview ─── */}
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
        </Container>
      </section>

      {/* ─── Safety Note ─── */}
      <section className="border-t border-white/5 py-12">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-gray-500">
              AuraCheck analyzes presentation, not human worth. Scores are
              guidance, not objective truth.
            </p>
          </div>
        </Container>
      </section>

      {/* ─── Final CTA ─── */}
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
