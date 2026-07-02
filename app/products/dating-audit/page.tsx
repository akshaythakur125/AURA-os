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

export default function DatingAuditPage() {
  const [upsell, setUpsell] = useState<{ auditId: string; auditType: string } | null>(null);
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);

  useEffectOnce(() => {
    trackEvent("product_page_viewed", { product: "dating_audit" });
    const best = getBestAuditForUpsell("dating_audit");
    if (best) {
      setUpsell(best);
      setAlreadyUnlocked(isProductUnlocked(best.auditId, "dating_audit"));
    }
  });

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-4xl">
        {/* ─── Hero ─── */}
        <div className="mb-12 text-center">
          <Badge variant="success" className="mb-4">Best for profile clarity</Badge>
          <h1 className="mb-4 text-4xl font-bold text-white">Dating / Profile Audit</h1>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-400">
            Optimize how you present yourself on dating apps and social profiles.
          </p>
          <div className="mb-8 text-5xl font-bold text-amber-400">&#8377;299</div>
          <div className="flex flex-wrap justify-center gap-3">
            {upsell && !alreadyUnlocked ? (
              <Button asChild size="lg">
                <Link href={`/unlock?auditId=${upsell.auditId}&product=dating_audit`} onClick={() => trackEvent("pricing_cta_clicked", { product: "dating_audit", target: "unlock" })}>
                  Unlock for Latest Audit
                </Link>
              </Button>
            ) : upsell && alreadyUnlocked ? (
              <Button asChild size="lg">
                <Link href={`/audit/${upsell.auditId}`}>View Your Report</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/audit/new" onClick={() => trackEvent("pricing_cta_clicked", { product: "dating_audit", target: "new_audit" })}>
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
              "Profile Presentation Score (0&ndash;100)",
              "Bio and prompt feedback with improvement suggestions",
              "3 rewritten bio versions tailored to your goal",
              "5 prompt ideas to increase engagement",
              "Photo order strategy for maximum impact",
              "Red-flag presentation identification and cleanup",
              "Text metrics: clarity, originality, warmth, and confidence scoring",
              "Cliché detection with originality scoring",
              "Emoji density analysis",
              "Photo-specific notes for lighting, background, and vibe alignment",
              "Final strategy for your profile refresh",
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
              { step: "1", title: "Upload & Input", desc: "Upload photos and optionally provide your bio, prompts, and captions for text analysis." },
              { step: "2", title: "Pay & Unlock", desc: "Complete a manual UPI payment of ₹299. You'll receive an unlock code." },
              { step: "3", title: "Read Your Audit", desc: "Get your profile score, bio rewrites, photo order strategy, and a full refresh plan." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-sm font-bold text-rose-300">{s.step}</div>
                <h3 className="mb-2 text-sm font-semibold text-white">{s.title}</h3>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-gray-500">Profile guidance is for presentation clarity, not dating guarantees.</p>
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
              { q: "Does this work for Instagram too?", a: "Yes. Select 'Instagram' or 'Dating' as your audit type during setup. The audit adapts its analysis and suggestions accordingly." },
              { q: "Do I need to provide my bio text?", a: "It's optional but recommended. Adding your bio, prompts, and captions allows the engine to do a full text analysis including cliché detection and originality scoring." },
              { q: "Is this a guarantee of more matches?", a: "No. This is a presentation clarity tool. We help you present your best self — outcomes depend on many factors beyond profile presentation." },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="mb-1 text-sm font-semibold text-white">{faq.q}</h3>
                <p className="text-sm text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── Lead Capture ─── */}
        <LeadCaptureCard source="product_dating_audit" defaultProduct="dating_audit" />

        {/* ─── CTA ─── */}
        <div className="mt-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Ready to optimize your profile?</h2>
          <p className="mb-6 text-gray-400">Get profile feedback that actually helps you stand out.</p>
          {upsell && !alreadyUnlocked ? (
            <Button asChild size="lg"><Link href={`/unlock?auditId=${upsell.auditId}&product=dating_audit`}>Unlock Now — ₹299</Link></Button>
          ) : (
            <Button asChild size="lg"><Link href="/audit/new">Start Free Aura Check</Link></Button>
          )}
        </div>
      </div>
    </Container>
  );
}
