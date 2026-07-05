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

export default function AuraReportPage() {
  const [upsell, setUpsell] = useState<{ auditId: string; auditType: string } | null>(null);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);

  useEffectOnce(() => {
    trackEvent("product_page_viewed", { product: "aura_report" });
    const best = getBestAuditForUpsell("aura_report");
    if (best) {
      setUpsell(best);
      setAlreadyUnlocked(isProductUnlocked(best.auditId, "aura_report"));
    }
  });

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-4xl">
        {/* ─── Hero ─── */}
        <div className="mb-12 text-center">
          <Badge variant="premium" className="mb-4">Best starter</Badge>
          <h1 className="mb-4 text-4xl font-bold text-white">Full Aura Report</h1>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-400">
            Every leak. Every fix. Priority order.
          </p>
          <div className="mb-8 text-5xl font-bold text-amber-400">&#8377;99</div>
          <div className="flex flex-wrap justify-center gap-3">
            {upsell && !alreadyUnlocked ? (
              <Button asChild size="lg">
                <Link href={`/unlock?auditId=${upsell.auditId}&product=aura_report`} onClick={() => trackEvent("pricing_cta_clicked", { product: "aura_report", target: "unlock" })}>
                  Unlock for Latest Audit
                </Link>
              </Button>
            ) : upsell && alreadyUnlocked ? (
              <Button asChild size="lg">
                <Link href={`/audit/${upsell.auditId}`}>View Your Report</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/audit/new" onClick={() => trackEvent("pricing_cta_clicked", { product: "aura_report", target: "new_audit" })}>
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
              "Up to 3 photos analyzed in detail",
              "Visual breakdown per photo (lighting, clarity, composition, background, color, premium signal)",
              "Status leak detection with severity and impact scoring",
              "Personalized upgrade roadmap with priority order",
              "Status Archetype classification (11 archetypes)",
              "Signal Mismatch Map — what your photos say vs what you want",
              "Budget bundle: curated upgrades within your selected budget",
              "Status ROI score for every recommendation",
              "Avoid-for-now advice to prevent waste",
              "Goal-specific strategy (dating / Instagram / college / office / glow-up)",
              "Budget upgrade plan across 5 tiers (₹0 &ndash; ₹25,000+)",
              "Print and save your report as a PDF",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-gray-300">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {item}
              </div>
            ))}
          </div>
        </Card>

        {/* ─── How It Works ─── */}
        <Card className="mb-8">
          <h2 className="mb-6 text-xl font-bold text-white">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: "Upload", desc: "Drop 1-3 photos. Analysis runs locally." },
              { step: "2", title: "Pay", desc: "₹99 via Razorpay. Instant unlock." },
              { step: "3", title: "Read", desc: "Full report with fixes and roadmap." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-300">{s.step}</div>
                <h3 className="mb-2 text-sm font-semibold text-white">{s.title}</h3>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── Proof Examples ─── */}
        <Card className="mb-8">
          <h2 className="mb-6 text-xl font-bold text-white">Example insight from a Full Aura Report</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <BeforeAfterCard example={PROOF_EXAMPLES[3]} compact />
            <BeforeAfterCard example={PROOF_EXAMPLES[1]} compact />
            <BeforeAfterCard example={PROOF_EXAMPLES[2]} compact />
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
              { q: "How is this different from the free score?", a: "Free = one number + top leak. This = full breakdown, archetype, roadmap, and budget plan." },
              { q: "Multiple audits?", a: "Yes. Each audit unlocks separately." },
              { q: "Is my photo stored?", a: "No. Runs locally. Nothing leaves your device." },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="mb-1 text-sm font-semibold text-white">{faq.q}</h3>
                <p className="text-sm text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── Lead Capture ─── */}
        <LeadCaptureCard source="product_aura_report" defaultProduct="aura_report" />

        {/* ─── CTA ─── */}
        <div className="mt-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Get your full breakdown.</h2>
          <p className="mb-6 text-gray-400">Takes minutes. Fixes everything.</p>
          {upsell && !alreadyUnlocked ? (
            <Button asChild size="lg"><Link href={`/unlock?auditId=${upsell.auditId}&product=aura_report`}>Unlock Now — ₹44</Link></Button>
          ) : (
            <Button asChild size="lg"><Link href="/audit/new">Start Free Aura Check</Link></Button>
          )}
        </div>
      </div>
    </Container>
  );
}
