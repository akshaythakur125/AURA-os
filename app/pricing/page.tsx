import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { BeforeAfterCard } from "@/components/proof/BeforeAfterCard";
import { PROOF_EXAMPLES } from "@/config/proofExamples";

const plans = [
  {
    name: "Free Aura Score",
    price: "0",
    tagline: "see the damage. free.",
    features: [
      "Basic aura score out of 100",
      "Your single biggest status leak",
      "Quick-fix suggestions",
      "Local-only result that stays in your browser",
      "Aura wardrobe direction preview",
    ],
    href: "/audit/new",
  },
  {
    name: "Quick Aura Fix",
    price: "25",
    tagline: "fastest glow-up move.",
    features: [
      "Biggest status leak identified",
      "Fastest free fix for immediate improvement",
      "Under Rs 500 low-cost fix",
      "Under Rs 2,000 smart investment",
      "Avoid wasting money on wrong fixes",
      "3-step action plan",
      "Fastest clothing or photo fix path",
      "Local-only processing",
    ],
    href: "/unlock?product=quick_fix",
    badgeText: "Best first unlock",
  },
  {
    name: "Full Aura Report",
    price: "50",
    tagline: "every leak. every fix. priority order.",
    features: [
      "Up to 3 photos analyzed",
      "Detailed visual breakdown per photo",
      "Status leak explanation with severity",
      "Personalized upgrade recommendations",
      "Budget bundle within your selected budget",
      "Status ROI score for every recommendation",
      "Full wardrobe direction with best upgrade per rupee",
      "Avoid-for-now advice to prevent waste",
      "Status archetype classification",
      "Signal mismatch map with priority scoring",
      "Goal-specific strategy",
      "Price comparison across Indian stores",
    ],
    href: "/products/aura-report",
    highlighted: true,
    badgeText: "Most popular",
  },
  {
    name: "Dating / Profile Audit",
    price: "299",
    tagline: "make your profile stop fumbling.",
    features: [
      "Profile presentation score",
      "Bio and prompt feedback with suggestions",
      "Photo order strategy for maximum impact",
      "Profile photo outfit direction",
      "Red-flag presentation cleanup",
      "3 suggested bio versions and 5 prompt ideas",
      "Text metrics like clarity, originality, and warmth",
      "Cliche detection and originality scoring",
    ],
    href: "/products/dating-audit",
    badgeText: "Best for profile clarity",
    disclaimer: "Profile guidance is for presentation clarity, not dating guarantees.",
  },
  {
    name: "30-Day Reset",
    price: "499",
    tagline: "30 days. Complete transformation.",
    features: [
      "4-week plan with weekly focus areas",
      "30 daily missions with practical tasks",
      "Budget roadmap from Rs 0 to Rs 25,000+",
      "Photo, grooming, outfit, and background systems",
      "30-day wardrobe and presentation structure",
      "Avoid-for-now guidance to prevent waste",
      "Progress tracking with check-ins",
      "Shopping and action list",
    ],
    href: "/products/glowup-plan",
    badgeText: "Best value",
    disclaimer: "Glow-up plan is self-improvement guidance, not a guarantee of social outcomes.",
  },
];

const faqs = [
  {
    q: "Can I try before paying?",
    a: "Yes. Free score first. Pay only if you want more.",
  },
  {
    q: "Why multiple tiers?",
    a: "Different depths. Quick fix vs full roadmap vs 30-day system.",
  },
  {
    q: "Is my photo stored?",
    a: "No. Everything runs locally in your browser.",
  },
  {
    q: "How do I pay?",
    a: "Razorpay. Cards, UPI, and wallets accepted.",
  },
];

export default function PricingPage() {
  return (
    <Container className="py-12">
      <div className="prism-panel glow-frame shine-sweep mx-auto mb-12 max-w-4xl rounded-[34px] px-6 py-10 text-center sm:px-10">
        <h1 className="mb-4 text-4xl font-bold text-white">Pick your depth.</h1>
        <p className="text-lg text-gray-400">
          Start free. Go deeper if you want.
        </p>
      </div>

      <div className="mx-auto mb-10 grid max-w-5xl gap-4 sm:grid-cols-3">
        <div className="prism-panel float-card rounded-[24px] p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500">what it does</div>
          <p className="mt-2 text-sm text-gray-300">
            Finds what's hurting your first impression.
          </p>
        </div>
        <div className="prism-panel float-card rounded-[24px] p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500">how it helps</div>
          <p className="mt-2 text-sm text-gray-300">
            Shows the fix. In order. Within budget.
          </p>
        </div>
        <div className="prism-panel float-card rounded-[24px] p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500">why pay</div>
          <p className="mt-2 text-sm text-gray-300">
            More depth. More personalization. Better plan.
          </p>
        </div>
      </div>

      <div className="mx-auto mb-10 max-w-4xl">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-white">Each tier goes deeper</h2>
        </div>
        <div className="grid gap-3 text-center text-xs sm:grid-cols-4">
          <div className="float-card rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-3">
            <div className="font-semibold text-emerald-400">1. Free Score</div>
            <div className="mt-1 text-gray-500">Shows the problem</div>
          </div>
          <div className="float-card rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
            <div className="font-semibold text-emerald-300">2. Rs 25 Quick Fix</div>
            <div className="mt-1 text-emerald-300/70">Gives the fastest first move</div>
          </div>
          <div className="float-card rounded-lg border border-purple-500/10 bg-purple-500/[0.03] p-3">
            <div className="font-semibold text-purple-400">3. Rs 50 Full Report</div>
            <div className="mt-1 text-purple-300/70">Explains the full reason and roadmap</div>
          </div>
          <div className="float-card rounded-lg border border-amber-500/10 bg-amber-500/[0.03] p-3">
            <div className="font-semibold text-amber-400">4. Rs 499 30-Day Reset</div>
            <div className="mt-1 text-amber-300/70">Gives the long-term system</div>
          </div>
        </div>
      </div>

      <div className="mx-auto mb-10 grid max-w-4xl gap-6 sm:grid-cols-2">
        <BeforeAfterCard example={PROOF_EXAMPLES[0]} compact />
        <BeforeAfterCard example={PROOF_EXAMPLES[1]} compact />
      </div>

      <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`float-card relative flex flex-col ${plan.highlighted ? "border-purple-500/30 ring-1 ring-purple-500/20" : ""}`}
          >
            {plan.badgeText ? (
              <Badge variant={plan.highlighted ? "premium" : "success"} className="absolute -top-2 right-4">
                {plan.badgeText}
              </Badge>
            ) : null}
            <div className="mb-1 text-xs text-gray-500">one-time</div>
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">
                {plan.price === "0" ? "Free" : `Rs ${plan.price}`}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-400">{plan.tagline}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-gray-300">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            {plan.disclaimer ? (
              <p className="mt-3 text-[10px] leading-relaxed text-gray-600">{plan.disclaimer}</p>
            ) : null}
            <div className="mt-6">
              <Button
                asChild
                variant={plan.highlighted ? "primary" : "outline"}
                className="w-full text-xs"
                size="sm"
              >
                <Link href={plan.href}>{plan.price === "0" ? "Start Free" : "Learn More"}</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mx-auto mb-8 max-w-3xl">
        <div className="grid gap-3 text-center text-xs sm:grid-cols-5">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="font-semibold text-gray-400">Free</div>
            <div className="mt-1 text-gray-500">Shows score and top leak</div>
          </div>
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-3">
            <div className="font-semibold text-emerald-400">Rs 25</div>
            <div className="mt-1 text-emerald-300/70">Shows fastest fix path</div>
          </div>
          <div className="rounded-lg border border-purple-500/10 bg-purple-500/[0.03] p-3">
            <div className="font-semibold text-purple-400">Rs 50</div>
            <div className="mt-1 text-purple-300/70">Shows full reasoning and roadmap</div>
          </div>
          <div className="rounded-lg border border-rose-500/10 bg-rose-500/[0.03] p-3">
            <div className="font-semibold text-rose-400">Rs 299</div>
            <div className="mt-1 text-rose-300/70">Improves profile conversion</div>
          </div>
          <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.03] p-3">
            <div className="font-semibold text-amber-400">Rs 499</div>
            <div className="mt-1 text-amber-300/70">Builds a 30-day system</div>
          </div>
        </div>
      </div>

      <div className="mx-auto mb-16 max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">Compare what you get</h2>
        <div className="glow-frame overflow-hidden rounded-2xl border border-white/5 p-4">
          <ComparisonTable />
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <h3 className="mb-2 text-sm font-semibold text-white">{faq.q}</h3>
              <p className="text-sm text-gray-400">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">Not sure? Start free.</h2>
        <p className="mb-6 text-gray-400">
          See your score first. Decide after.
        </p>
        <Button asChild size="lg">
          <Link href="/audit/new">Start Free Aura Check</Link>
        </Button>
      </div>
    </Container>
  );
}
