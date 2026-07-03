"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BeforeAfterCard } from "@/components/proof/BeforeAfterCard";
import { ProofGallery } from "@/components/proof/ProofGallery";
import { PROOF_EXAMPLES } from "@/config/proofExamples";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { getProgressComparisons } from "@/lib/storage/progressStore";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BeforeAfterPage() {
  const [progressComparisons] = useState(() => {
    trackEvent("before_after_page_viewed");
    return getProgressComparisons();
  });

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge variant="premium" className="mb-4">Before / After</Badge>
          <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            See what fixing one status leak can change.
          </h1>
          <p className="text-base text-gray-400">
            Demo examples showing how lighting, background, framing, and consistency can improve presentation before you spend money.
          </p>
        </div>

        {/* Quick Fix Examples */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">Quick Aura Fix Examples</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROOF_EXAMPLES.filter((e) => e.productSuggested === "quick_fix").slice(0, 3).map((ex) => (
              <BeforeAfterCard key={ex.id} example={ex} />
            ))}
          </div>
        </section>

        {/* Full Report Examples */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">Full Aura Report Examples</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROOF_EXAMPLES.filter((e) => e.productSuggested === "aura_report").map((ex) => (
              <BeforeAfterCard key={ex.id} example={ex} />
            ))}
          </div>
        </section>

        {/* Dating/Profile Examples */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">Dating &amp; Profile Examples</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROOF_EXAMPLES.filter((e) => e.productSuggested === "dating_audit").map((ex) => (
              <BeforeAfterCard key={ex.id} example={ex} />
            ))}
          </div>
        </section>

        {/* Glow-Up Plan Examples */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">30-Day Reset Example</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROOF_EXAMPLES.filter((e) => e.productSuggested === "glowup_plan").map((ex) => (
              <BeforeAfterCard key={ex.id} example={ex} />
            ))}
          </div>
        </section>

        {/* Avoid Waste Examples */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">Avoid Wasting Money</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROOF_EXAMPLES.filter((e) => e.id === "avoid-waste-01").map((ex) => (
              <BeforeAfterCard key={ex.id} example={ex} />
            ))}
          </div>
        </section>

        {/* Full Gallery */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">All Examples</h2>
          <ProofGallery />
        </section>

        {/* Local Progress */}
        {progressComparisons.length > 0 && (
          <section className="mb-12">
            <Card className="border-emerald-500/20">
              <Badge variant="success" className="mb-3">Your Local Progress</Badge>
              <h2 className="mb-2 text-lg font-bold text-white">Your personal before/after</h2>
              <p className="mb-4 text-xs text-gray-500">Stored only in this browser. Not uploaded anywhere.</p>
              <div className="space-y-3">
                {progressComparisons.map((cmp) => (
                  <Card key={cmp.id} className="border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-red-400">{cmp.beforeScore}</span>
                          <span className="text-gray-500">→</span>
                          <span className="text-emerald-400">{cmp.afterScore}</span>
                          <Badge variant={cmp.scoreDelta >= 0 ? "success" : "danger"}>
                            {cmp.scoreDelta > 0 ? "+" : ""}{cmp.scoreDelta}
                          </Badge>
                        </div>
                        {cmp.improvedSignals.length > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            Improved: {cmp.improvedSignals.join(", ")}
                          </div>
                        )}
                        {cmp.remainingLeaks.length > 0 && (
                          <div className="text-xs text-gray-600">
                            Remaining leaks: {cmp.remainingLeaks.join(", ")}
                          </div>
                        )}
                        {cmp.summary && <p className="mt-1 text-xs text-gray-400">{cmp.summary}</p>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* CTA */}
        <section className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Ready to see your own before/after?</h2>
          <p className="mb-6 text-sm text-gray-400">
            Generate a free Aura Score and see exactly what to fix first.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/audit/new">Start Free Aura Check</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="mt-12 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-gray-600">
          <p>Demo examples are illustrative, not guaranteed. AuraCheck analyzes presentation signals, not human worth.</p>
          <p className="mt-1">Scores are guidance, not objective truth. No guaranteed dating, social, career, or financial outcomes.</p>
          <p className="mt-1">No external AI service is used in this MVP. Your image stays in this browser.</p>
        </div>
      </div>
    </Container>
  );
}
