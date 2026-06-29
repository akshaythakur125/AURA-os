import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";

const tiers = [
  {
    name: "Free Aura Score",
    price: "0",
    bestFor: "Quick check",
    description: "A free snapshot of your first impression — no payment needed.",
    features: [
      "Single photo scan",
      "Basic aura score (0–100)",
      "3 status leak insights",
      "3 upgrade suggestions",
      "No login required",
    ],
    highlighted: false,
    href: "/audit/new",
    cta: "Start Free",
  },
  {
    name: "Full Aura Report",
    price: "99",
    bestFor: "Serious upgrade",
    description: "Deep analysis with a clear, actionable upgrade roadmap.",
    features: [
      "Up to 3 photos",
      "Full score breakdown by category",
      "Unlimited leak detection",
      "Status Archetype classification",
      "Signal mismatch analysis",
      "Goal-specific strategy",
      "What to fix before spending more",
      "Priority upgrade plan",
      "Personalized upgrade recommendations",
      "Budget bundle with status ROI score",
      "Avoid-for-now advice",
      "Shareable Aura card",
      "Downloadable report (PNG)",
      "Print / save as PDF",
      "Unlock code access",
    ],
    highlighted: true,
    href: "/audit/new",
    cta: "Start Free, Then Unlock",
  },
  {
    name: "Dating / Profile Audit",
    price: "299",
    bestFor: "Profile optimizer",
    description: "Optimize how your dating profile presents you.",
    features: [
      "Profile screenshot analysis",
      "Bio & photo coherence check",
      "Platform-specific tips",
      "Competitive signal audit",
      "Photo order optimization",
    ],
    highlighted: false,
    href: "/unlock?product=dating_audit",
    cta: "Coming Soon",
    disabled: true,
  },
  {
    name: "30-Day Glow-Up Plan",
    price: "499",
    bestFor: "Maximum impact",
    description: "A month-long upgrade program with tracking and support.",
    features: [
      "Full audit every week",
      "Personalized upgrade tasks",
      "Progress tracking dashboard",
      "Priority email support",
      "Final comparison report",
    ],
    highlighted: false,
    href: "/unlock?product=glowup_plan",
    cta: "Coming Soon",
    disabled: true,
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.1),transparent_50%)]" />
        <Container className="relative">
          <SectionHeading
            title="Simple pricing, real results"
            subtitle="Start free. Upgrade when you want the full picture."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col ${tier.highlighted ? "border-purple-500/30 ring-1 ring-purple-500/20" : ""}`}
              >
                {tier.highlighted && (
                  <Badge variant="premium" className="absolute -top-2 right-4">
                    Popular
                  </Badge>
                )}
                <div className="mb-1 text-xs text-gray-500">{tier.bestFor}</div>
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    &#8377;{tier.price}
                  </span>
                  <span className="text-sm text-gray-500">one-time</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">{tier.description}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm text-gray-300"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400"
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

                <div className="mt-8">
                  {tier.disabled ? (
                    <Button variant="outline" className="w-full" disabled>
                      {tier.cta}
                    </Button>
                  ) : (
                    <Link href={tier.href}>
                      <Button
                        variant={tier.highlighted ? "primary" : "outline"}
                        className="w-full"
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-purple-500/10 bg-purple-500/5 p-6 text-center">
            <p className="text-sm text-gray-400">
              All payments are processed manually via UPI. No automatic
              recurring billing.
              <br />
              Your report is unlocked after payment verification. No external
              payment API is used.
            </p>
          </div>

          <div className="mt-16 text-center">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Frequently Asked
            </h3>
            <div className="mx-auto grid max-w-2xl gap-6 text-left">
              {[
                {
                  q: "What do I get in the free version?",
                  a: "A basic Aura Score, 3 status leak insights, and 3 upgrade suggestions from a single photo.",
                },
                {
                  q: "How do I unlock a paid report?",
                  a: "Send payment via UPI, enter your transaction ID, and receive an unlock code within 24 hours.",
                },
                {
                  q: "Is my data safe?",
                  a: "Yes. All processing is local in your browser. No images are uploaded to any server in the current MVP.",
                },
                {
                  q: "Can I upgrade from Free to Premium later?",
                  a: "Yes. Your free audit can be upgraded to a full report at any time.",
                },
              ].map((faq) => (
                <div key={faq.q}>
                  <h4 className="text-sm font-medium text-white">{faq.q}</h4>
                  <p className="mt-1 text-sm text-gray-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
