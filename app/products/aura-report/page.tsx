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
            Beyond the free score — get a complete visual analysis with a personalized upgrade roadmap.
          </p>
          <div className="mb-8 text-5xl font-bold text-amber-400">&#8377;99</div>
          <div className="flex flex-wrap justify-center gap-3">
            {upsell && !alreadyUnlocked ? (
              <Link href={`/unlock?auditId=${upsell.auditId}&product=aura_report`}>
                <Button size="lg" onClick={() => trackEvent("pricing_cta_clicked", { product: "aura_report", target: "unlock" })}>
                  Unlock for Latest Audit
                </Button>
              </Link>
            ) : upsell && alreadyUnlocked ? (
              <Link href={`/audit/${upsell.auditId}`}>
                <Button size="lg">View Your Report</Button>
              </Link>
            ) : (
              <Link href="/audit/new">
                <Button size="lg" onClick={() => trackEvent("pricing_cta_clicked", { product: "aura_report", target: "new_audit" })}>
                  Start Free Aura Check
                </Button>
              </Link>
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
              { step: "1", title: "Analyze", desc: "Upload 1&ndash;3 photos of yourself. The engine runs a full visual analysis locally." },
              { step: "2", title: "Pay & Unlock", desc: "Complete a manual UPI payment of ₹99. You'll receive an unlock code." },
              { step: "3", title: "Read Your Report", desc: "View your full report with visual breakdowns, archetype, and personalized upgrade plan." },
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
              { q: "What's the difference from the free score?", a: "The free score gives you a single number and your top status leak. The full report analyzes every photo, assigns an archetype, maps your signal mismatches, and gives you a complete upgrade roadmap with budget tiers." },
              { q: "Can I get the report for multiple audits?", a: "Yes. Each audit has its own unlock. You can unlock the full report for any audit you've created." },
              { q: "Is my image stored anywhere?", a: "No. Everything runs locally in your browser. No image leaves your device." },
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
          <h2 className="mb-4 text-2xl font-bold text-white">Ready for your full breakdown?</h2>
          <p className="mb-6 text-gray-400">Get your personalized upgrade roadmap in minutes.</p>
          {upsell && !alreadyUnlocked ? (
            <Link href={`/unlock?auditId=${upsell.auditId}&product=aura_report`}><Button size="lg">Unlock Now — ₹99</Button></Link>
          ) : (
            <Link href="/audit/new"><Button size="lg">Start Free Aura Check</Button></Link>
          )}
        </div>
      </div>
    </Container>
  );
}
