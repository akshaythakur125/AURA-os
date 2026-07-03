"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { LeadCaptureCard } from "@/components/marketing/LeadCaptureCard";
import { getBestAuditForUpsell } from "@/lib/audits/getBestAuditForUpsell";
import { isProductUnlocked } from "@/lib/storage/unlockStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { useEffectOnce } from "@/lib/utils/effectOnce";
import { BeforeAfterCard } from "@/components/proof/BeforeAfterCard";
import { PROOF_EXAMPLES } from "@/config/proofExamples";

export default function GlowUpPlanPage() {
  const [upsell, setUpsell] = useState<{ auditId: string; auditType: string } | null>(null);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);

  useEffectOnce(() => {
    trackEvent("product_page_viewed", { product: "glowup_plan" });
    const best = getBestAuditForUpsell("glowup_plan");
    if (best) {
      setUpsell(best);
      setAlreadyUnlocked(isProductUnlocked(best.auditId, "glowup_plan"));
    }
  });

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-4xl">
        {/* ─── Hero ─── */}
        <div className="mb-12 text-center">
          <Badge variant="warning" className="mb-4">Best value</Badge>
          <h1 className="mb-4 text-4xl font-bold text-white">30-Day Reset</h1>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-400">
            A structured month-long roadmap with daily missions to level up your visual presence.
          </p>
          <div className="mb-8 text-5xl font-bold text-amber-400">&#8377;499</div>
          <div className="flex flex-wrap justify-center gap-3">
            {upsell && !alreadyUnlocked ? (
              <Button asChild size="lg">
                <Link href={`/unlock?auditId=${upsell.auditId}&product=glowup_plan`} onClick={() => trackEvent("pricing_cta_clicked", { product: "glowup_plan", target: "unlock" })}>
                  Unlock for Latest Audit
                </Link>
              </Button>
            ) : upsell && alreadyUnlocked ? (
              <Button asChild size="lg">
                <Link href={`/audit/${upsell.auditId}`}>View Your Plan</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/audit/new" onClick={() => trackEvent("pricing_cta_clicked", { product: "glowup_plan", target: "new_audit" })}>
                  Start Free Aura Check
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* ─── What's Included ─── */}
        <Card className="mb-8">
          <h2 className="mb-6 text-xl font-bold text-white">What&apos;s Included</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "4-week plan with weekly focus areas and checklist",
              "30 daily missions with practical actionable tasks",
              "Budget roadmap across 5 tiers (₹0 to ₹25,000+)",
              "Photo system: lighting, framing, expression, editing guides",
              "Grooming system: skin, hair, facial, body care routines",
              "Outfit system: color palette, fit, signature style, and key pieces",
              "Background system: clutter-free, texture, depth, props guidance",
              "Avoid-for-now guidance to prevent wasted spend",
              "Progress tracking with weekly check-ins",
              "Shopping and action list per week",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-gray-300">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {item}
              </div>
            ))}
          </div>
        </Card>

        {/* ─── Weekly Breakdown ─── */}
        <Card className="mb-8">
          <h2 className="mb-6 text-xl font-bold text-white">Weekly Breakdown</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { week: 1, title: "Photo Refresh & Grooming Basics", tasks: "7 daily missions focused on lighting, skincare, and a new profile photo." },
              { week: 2, title: "Wardrobe Signature Style", tasks: "7 daily missions to define your color palette, fit, and key outfit pieces." },
              { week: 3, title: "Background Curation & Props", tasks: "7 daily missions to clean up spaces, add depth, and use props intentionally." },
              { week: 4, title: "Consistency & Batch Mode", tasks: "9 daily missions to systematize your new look, track progress, and batch content." },
            ].map((w) => (
              <div key={w.week} className="rounded-xl bg-white/5 p-4">
                <div className="mb-2 text-xs text-amber-400">Week {w.week}</div>
                <h3 className="mb-2 text-sm font-semibold text-white">{w.title}</h3>
                <p className="text-xs text-gray-400">{w.tasks}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── How It Works ─── */}
        <Card className="mb-8">
          <h2 className="mb-6 text-xl font-bold text-white">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: "Analyze & Generate", desc: "Your photos are analyzed to identify the biggest bottlenecks in your current presentation." },
              { step: "2", title: "Pay & Unlock", desc: "Complete a manual UPI payment of ₹499. You'll receive an unlock code." },
              { step: "3", title: "Follow Your Plan", desc: "Open your 30-day plan, complete daily missions, and track your progress week by week." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-300">{s.step}</div>
                <h3 className="mb-2 text-sm font-semibold text-white">{s.title}</h3>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-gray-500">Glow-up plan is self-improvement guidance, not a guarantee of social outcomes.</p>
        </Card>

        {/* ─── Proof Example ─── */}
        <Card className="mb-8">
          <h2 className="mb-6 text-xl font-bold text-white">Example 30-day presentation shift</h2>
          <div className="mx-auto max-w-md">
            <BeforeAfterCard example={PROOF_EXAMPLES[6]} compact />
          </div>
        </Card>

        {/* ─── Comparison ─── */}
        <Card className="mb-8">
          <h2 className="mb-6 text-xl font-bold text-white">Free vs Paid</h2>
          <ComparisonTable />
        </Card>

        {/* ─── FAQ ─── */}
        <Card className="mb-8">
          <h2 className="mb-6 text-xl font-bold text-white">Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Do I need to complete the plan in 30 days?", a: "No. Take it at your own pace. The plan is structured as 30 days but you can stretch or repeat weeks as needed." },
              { q: "Is this tailored to my photos?", a: "Yes. The plan uses your uploaded photos to identify personalized bottlenecks, suggest specific improvements, and build a roadmap around your unique situation." },
              { q: "What if I have no budget for upgrades?", a: "The plan includes a ₹0 tier. Many improvements — lighting, posture, background decluttering, expression practice — cost nothing." },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="mb-1 text-sm font-semibold text-white">{faq.q}</h3>
                <p className="text-sm text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── Lead Capture ─── */}
        <LeadCaptureCard source="product_glowup_plan" defaultProduct="glowup_plan" />

        {/* ─── CTA ─── */}
        <div className="mt-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Ready for your 30-day transformation?</h2>
          <p className="mb-6 text-gray-400">Get a personalized roadmap with daily missions to level up your presence.</p>
          {upsell && !alreadyUnlocked ? (
            <Button asChild size="lg"><Link href={`/unlock?auditId=${upsell.auditId}&product=glowup_plan`}>Unlock Now — ₹499</Link></Button>
          ) : (
            <Button asChild size="lg"><Link href="/audit/new">Start Free Aura Check</Link></Button>
          )}
        </div>
      </div>
    </Container>
  );
}
