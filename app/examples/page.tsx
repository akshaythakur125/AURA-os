"use client";

import Link from "next/link";
import { InsightPreview } from "@/components/examples/InsightPreview";
import { ReportComparison } from "@/components/examples/ReportComparison";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { useEffectOnce } from "@/lib/utils/effectOnce";

export default function ExamplesPage() {
  useEffectOnce(() => {
    trackEvent("examples_viewed");
  });

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-5xl">
        <div className="prism-panel glow-frame shine-sweep mb-12 rounded-[34px] px-6 py-10 text-center sm:px-10">
          <h1 className="mb-4 text-4xl font-bold text-white">Sample Reports</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            See what each report looks like before you buy. All data shown is sample data, not based on any real person.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-white">At a Glance</h2>
          <ReportComparison />
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-white">Sample Insights</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <InsightPreview label="Status Archetype">
              The Quiet Achiever &mdash; strong in-person presence that doesn&apos;t translate online. Your photos show competence but lack warmth signals.
            </InsightPreview>
            <InsightPreview label="Signal Mismatch Map">
              High mismatch in &quot;approachability.&quot; Your candid photos read as serious, but your goal requires a warm, open vibe.
            </InsightPreview>
            <InsightPreview label="Priority Upgrade">
              Replace photo #2 with a candid taken in natural light. Current background clutter distracts from your face.
            </InsightPreview>
            <InsightPreview label="Dating: Bio Originality">
              Your bio uses 3 cliches (&quot;Love traveling,&quot; &quot;Good vibes only,&quot; &quot;Looking for my better half&quot;). Suggested rewrite removes all three.
            </InsightPreview>
            <InsightPreview label="Dating: Photo Order">
              Photo #4 (group shot) should move to #2 &mdash; it shows social proof. Photo #2 (mirror selfie) should move down or be replaced.
            </InsightPreview>
            <InsightPreview label="Glow-Up: Week 1 Mission">
              Day 3: Take 20 self-portraits in natural window light. Delete 18. Pick your best expression and lighting combo.
            </InsightPreview>
          </div>
        </div>

        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">See before/after examples</h2>
          <p className="mb-6 text-gray-400">Realistic demo examples showing how much a single fix can change a presentation.</p>
          <Button asChild variant="outline" size="lg">
            <Link href="/before-after">View Before/After Gallery</Link>
          </Button>
        </div>

        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Ready to get your own report?</h2>
          <p className="mb-6 text-gray-400">Start with a free Aura Score and unlock deeper analysis when you&apos;re ready.</p>
          <Button asChild size="lg">
            <Link href="/audit/new">Start Free Aura Check</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
