import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { FadeInView } from "@/components/ui/FadeInView";

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
    href: "/products/dating-audit",
    cta: "Learn More",
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
    href: "/products/glowup-plan",
    cta: "Learn More",
  },
];

export default function PricingPage() {
  return (
    <>
      <div className="aurora-mesh" />
      <div className="aurora-mesh-third" />

      <section className="parallax-section relative overflow-hidden py-24 sm:py-32">
        <GlowOrb color="rgba(147, 51, 234, 0.12)" size={400} className="top-[-5%] right-[10%]" delay={0} />
        <GlowOrb color="rgba(236, 72, 153, 0.08)" size={300} className="bottom-[10%] left-[5%]" delay={500} />
        <Container className="relative">
          <FadeInView>
            <SectionHeading
              title="Simple pricing, real results"
              subtitle="Start free. Upgrade when you want the full picture."
            />
          </FadeInView>
          <div className="bento-grid">
            {tiers.map((tier, i) => (
              <FadeInView key={tier.name} delay={i * 80}>
                <Card
                  className={`relative flex flex-col h-full ${
                    tier.highlighted
                      ? "bento-span-2 card-3d-lifted aurora-border glass-elevated"
                      : ""
                  }`}
                  tilt={tier.highlighted}
                >
                  {tier.highlighted && (
                    <Badge variant="premium" className="absolute -top-2 right-4">
                      Popular
                    </Badge>
                  )}
                  <div className="mb-1 text-xs text-gray-500">{tier.bestFor}</div>
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`${tier.highlighted ? "text-5xl" : "text-4xl"} font-bold text-white`}>
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
                    <Link href={tier.href}>
                      <Button
                        variant={tier.highlighted ? "primary" : "outline"}
                        className="w-full"
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </FadeInView>
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

          {/* ─── Comparison Table ─── */}
          <div className="mt-16">
            <SectionHeading title="Free vs Paid comparison" subtitle="See exactly what changes when you unlock." />
            <div className="mx-auto max-w-4xl">
              <ComparisonTable />
            </div>
          </div>

          {/* ─── Trust & Offer Notes ─── */}
          <div className="mt-12 space-y-4 text-center text-xs text-gray-600">
            <p>Early users may receive manual offer codes. If you have one, enter it on the unlock page to get a discount.</p>
            <p>Manual UPI unlock flow for MVP. No automatic payment verification.</p>
            <p>AuraCheck analyzes presentation signals, not human worth. Scores are guidance, not objective truth.</p>
            <p>No external AI service is used. No data is uploaded to any server.</p>
            <p>No guaranteed dating, social, career, or financial outcomes.</p>
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
