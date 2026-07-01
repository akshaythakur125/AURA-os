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
    tagline: "Quick snapshot of your first impression.",
    features: [
      "Basic aura score out of 100",
      "Your single biggest status leak",
      "Quick-fix suggestions",
      "Local-only result — stays in your browser",
      "Aura wardrobe direction preview",
    ],
    href: "/audit/new",
  },
  {
    name: "Quick Aura Fix",
    price: "49",
    tagline: "Get your biggest status leak and the fastest fix path.",
    features: [
      "Biggest status leak identified",
      "Fastest free fix for immediate improvement",
      "Under ₹500 low-cost fix",
      "Under ₹2,000 smart investment",
      "Avoid wasting money on wrong fixes",
      "3-step action plan",
      "Fastest clothing/photo fix path",
      "All processing is local — zero server upload",
    ],
    href: "/products/aura-report",
    badgeText: "Best first unlock",
  },
  {
    name: "Full Aura Report",
    price: "99",
    tagline: "Deep analysis with a clear upgrade roadmap.",
    features: [
      "Up to 3 photos analyzed",
      "Detailed visual breakdown per photo",
      "Status leak explanation with severity",
      "Personalized upgrade recommendations",
      "Budget bundle within your selected budget",
      "Status ROI score for every recommendation",
      "Full wardrobe direction with best upgrade per rupee",
      "Avoid-for-now advice to prevent waste",
      "Status Archetype classification (11 archetypes)",
      "Signal Mismatch Map with priority scoring",
      "Goal-Specific Strategy (optional questionnaire)",
      "Price comparison across Indian stores",
    ],
    href: "/products/aura-report",
    highlighted: true,
    badgeText: "Most popular",
  },
  {
    name: "Dating / Profile Audit",
    price: "299",
    tagline: "Optimize how you present yourself on dating apps and social profiles.",
    features: [
      "Profile Presentation Score",
      "Bio and prompt feedback with suggestions",
      "Photo order strategy for maximum impact",
      "Profile photo outfit direction",
      "Red-flag presentation cleanup",
      "3 suggested bio versions and 5 prompt ideas",
      "Text metrics (clarity, originality, warmth)",
      "Cliche detection and originality scoring",
    ],
    href: "/products/dating-audit",
    badgeText: "Best for profile clarity",
    disclaimer: "Profile guidance is for presentation clarity, not dating guarantees.",
  },
  {
    name: "30-Day Glow-Up Plan",
    price: "499",
    tagline: "A structured month-long roadmap for your visual upgrade.",
    features: [
      "4-week plan with weekly focus areas and checklist",
      "30 daily missions with practical actionable tasks",
      "Budget roadmap from ₹0 to ₹25,000+",
      "Photo, grooming, outfit, and background systems",
      "30-day wardrobe and presentation system",
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
    a: "Yes. The free Aura Score gives you a baseline assessment. You only pay if you want deeper analysis.",
  },
  {
    q: "How do I pay?",
    a: "Payments are manual via UPI in the current MVP. After payment, you will receive an unlock code to access your report.",
  },
  {
    q: "Is my image stored on a server?",
    a: "No. All processing is local. No image is uploaded to any external server.",
  },
  {
    q: "What if I am not satisfied?",
    a: "Since the entire analysis runs locally in your browser, we encourage you to test the free tier first before purchasing a deeper audit.",
  },
];

export default function PricingPage() {
  return (
    <Container className="py-12">
      {/* ─── Header ─── */}
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          Choose your audit depth
        </h1>
        <p className="text-lg text-gray-400">
          Start free. Go deeper when you are ready. All prices are one-time.
        </p>
      </div>

      {/* ─── Proof Strip ─── */}
      <div className="mx-auto mb-10 max-w-4xl">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-white">See why the ₹49 fix comes first.</h2>
          <p className="text-sm text-gray-400">Fix leaks in order of impact. Start small, go deep later.</p>
        </div>
        <div className="grid gap-3 text-center text-xs sm:grid-cols-4">
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-3">
            <div className="font-semibold text-emerald-400">1. Free Score</div>
            <div className="mt-1 text-gray-500">Finds the leak</div>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
            <div className="font-semibold text-emerald-300">2. ₹49 Quick Fix</div>
            <div className="mt-1 text-emerald-300/70">Gives the first move</div>
          </div>
          <div className="rounded-lg border border-purple-500/10 bg-purple-500/[0.03] p-3">
            <div className="font-semibold text-purple-400">3. ₹99 Full Report</div>
            <div className="mt-1 text-purple-300/70">Explains the full reason</div>
          </div>
          <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.03] p-3">
            <div className="font-semibold text-amber-400">4. ₹499 Glow-Up Plan</div>
            <div className="mt-1 text-amber-300/70">Gives the system</div>
          </div>
        </div>
      </div>

      {/* Proof examples */}
      <div className="mx-auto mb-10 grid max-w-4xl gap-6 sm:grid-cols-2">
        <BeforeAfterCard example={PROOF_EXAMPLES[0]} compact />
        <BeforeAfterCard example={PROOF_EXAMPLES[1]} compact />
      </div>

      {/* ─── Plans Grid ─── */}
      <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${plan.highlighted ? "border-purple-500/30 ring-1 ring-purple-500/20" : ""}`}
          >
            {plan.badgeText && (
              <Badge variant={plan.highlighted ? "premium" : "success"} className="absolute -top-2 right-4">
                {plan.badgeText}
              </Badge>
            )}
            <div className="mb-1 text-xs text-gray-500">one-time</div>
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">
                &#8377;{plan.price}
              </span>
              {plan.price !== "0" && (
                <span className="text-xs text-gray-500">only</span>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-400">{plan.tagline}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {plan.disclaimer && (
              <p className="mt-3 text-[10px] leading-relaxed text-gray-600">
                {plan.disclaimer}
              </p>
            )}
            <div className="mt-6">
              <Link href={plan.href}>
                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full text-xs"
                  size="sm"
                >
                  {plan.price === "0" ? "Start Free" : "Learn More"}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

        {/* ─── Comparison Line ─── */}
        <div className="mx-auto mb-8 max-w-3xl">
          <div className="grid gap-3 text-center text-xs sm:grid-cols-5">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="font-semibold text-gray-400">Free</div>
              <div className="mt-1 text-gray-500">Shows score only</div>
            </div>
            <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-3">
              <div className="font-semibold text-emerald-400">₹49</div>
              <div className="mt-1 text-emerald-300/70">Shows fastest fix</div>
            </div>
            <div className="rounded-lg border border-purple-500/10 bg-purple-500/[0.03] p-3">
              <div className="font-semibold text-purple-400">₹99</div>
              <div className="mt-1 text-purple-300/70">Explains full reason</div>
            </div>
            <div className="rounded-lg border border-rose-500/10 bg-rose-500/[0.03] p-3">
              <div className="font-semibold text-rose-400">₹299</div>
              <div className="mt-1 text-rose-300/70">Fixes profile friction</div>
            </div>
            <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.03] p-3">
              <div className="font-semibold text-amber-400">₹499</div>
              <div className="mt-1 text-amber-300/70">Gives 30-day system</div>
            </div>
          </div>
        </div>

        {/* ─── Comparison Table ─── */}
        <div className="mx-auto mb-16 max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">
            Compare what you get
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/5 p-4">
            <ComparisonTable />
          </div>
        </div>

      {/* ─── FAQ ─── */}
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">
          Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <h3 className="mb-2 text-sm font-semibold text-white">{faq.q}</h3>
              <p className="text-sm text-gray-400">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Final CTA ─── */}
      <div className="mt-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">
          Not sure where to start?
        </h2>
        <p className="mb-6 text-gray-400">
          Begin with the free Aura Score. It takes two minutes and tells you
          your biggest status leak at no cost.
        </p>
        <Link href="/audit/new">
          <Button size="lg">Start Free Aura Check</Button>
        </Link>
      </div>
    </Container>
  );
}
