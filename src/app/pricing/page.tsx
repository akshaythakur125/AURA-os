import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Pricing — AuraCheck",
  description: "Unlock your full Aura Report — one-time payment, no subscription. Get detailed visual analysis, photo-quality issue fixes, and personalized upgrade path.",
  openGraph: {
    title: "AuraCheck Pricing — Full Report",
    description: "One-time payment. No subscription. Detailed visual analysis and personalized upgrade path.",
    type: "website",
  },
};
import { PAYMENT_PRODUCTS, formatPrice } from "@/config/pricing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { FadeInView } from "@/components/ui/FadeInView";
import { SocialProofBar } from "@/components/social-proof/SocialProofBar";
import { Scene3DAccent } from "@/components/hero/Scene3DAccent";

const tiers = [
  {
    name: "Free Aura Score",
    price: "0",
    bestFor: "Quick check",
    description: "A free snapshot of your first impression — no payment needed.",
    features: [
      "Single photo scan",
      "Basic aura score (0–100)",
      "3 photo-quality issue insights",
      "3 upgrade suggestions",
      "No login required",
    ],
    highlighted: false,
    href: "/audit/new",
    cta: "Start Free",
  },
  {
    name: "Quick Glance",
    price: "15",
    bestFor: "Just curious",
    description: "Bare-minimum scan. One photo, no breakdown, no roadmap.",
    features: [
      "Single photo only",
      "Score number (no explanation)",
      "No leak analysis",
      "No upgrade plan",
      "No style inspiration",
      "No progress tracking",
    ],
    highlighted: false,
    href: "/audit/new",
    cta: "Get Quick Glance",
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
        <GlowOrb color="rgba(225, 68, 52, 0.12)" size={400} className="top-[-5%] right-[10%]" delay={0} />
        <GlowOrb color="rgba(225, 68, 52, 0.08)" size={300} className="bottom-[10%] left-[5%]" delay={500} />
        <Container className="relative">
          <FadeInView>
            <div className="mb-6 flex justify-center">
              <Scene3DAccent size={190} />
            </div>
            <SectionHeading
              title="Simple pricing, real results"
              subtitle="Start free. Upgrade when you want the full picture."
            />
          </FadeInView>
          <FadeInView delay={50}>
            <div className="mb-10">
              <SocialProofBar variant="inline" />
            </div>
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
                  <div className="mb-1 text-xs text-[#857b6e]">{tier.bestFor}</div>
                  <h3 className="text-lg font-bold text-[#1C1917]">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`${tier.highlighted ? "text-5xl" : "text-4xl"} font-bold text-[#1C1917]`}>
                      &#8377;{tier.price}
                    </span>
                    <span className="text-sm text-[#857b6e]">one-time</span>
                  </div>
                  <p className="mt-2 text-sm text-[#6f675e]">{tier.description}</p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-sm text-[#4a443d]"
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

          <div className="mt-12 rounded-xl border border-red-500/10 bg-red-500/5 p-6 text-center">
            <p className="text-sm text-[#6f675e]">
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
          <div className="mt-12 space-y-4 text-center text-xs text-[#9c9184]">
            <p>Early users may receive manual offer codes. If you have one, enter it on the unlock page to get a discount.</p>
            <p>Manual UPI unlock flow for MVP. No automatic payment verification.</p>
            <p>AuraCheck analyzes presentation signals, not human worth. Scores are guidance, not objective truth.</p>
            <p>No external AI service is used. No data is uploaded to any server.</p>
            <p>No guaranteed dating, social, career, or financial outcomes.</p>
          </div>

          <div className="mt-16 text-center">
            <h3 className="mb-4 text-lg font-semibold text-[#1C1917]">
              Frequently Asked
            </h3>
            <div className="mx-auto grid max-w-2xl gap-6 text-left">
              {[
                {
                  q: "What do I get in the free version?",
                  a: "A basic Aura Score, 3 photo-quality issue insights, and 3 upgrade suggestions from a single photo.",
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
                  <h4 className="text-sm font-medium text-[#1C1917]">{faq.q}</h4>
                  <p className="mt-1 text-sm text-[#857b6e]">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
