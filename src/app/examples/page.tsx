"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SampleReportCard } from "@/components/examples/SampleReportCard";
import { ReportComparison } from "@/components/examples/ReportComparison";
import { InsightPreview } from "@/components/examples/InsightPreview";
import { LeadCaptureCard } from "@/components/marketing/LeadCaptureCard";
import { SAMPLE_REPORTS } from "@/config/sampleReports";

export default function ExamplesPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-24 pt-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.12),transparent_50%)]" />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
              See what AuraCheck actually gives you.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              Real sample reports from simulated audits. See the format, the insights, and the upgrade plans before you decide to unlock.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/audit/new"><Button size="lg">Start Free Aura Check</Button></Link>
              <Link href="/pricing"><Button variant="outline" size="lg">View Pricing</Button></Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-20">
        <Container>
          <SectionHeading title="Sample reports" subtitle="Three products, three different outputs. All generated locally." />
          <div className="grid gap-8 md:grid-cols-3">
            {SAMPLE_REPORTS.map((report) => (
              <SampleReportCard key={report.id} report={report} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-20">
        <Container>
          <SectionHeading title="Free vs Paid comparison" subtitle="See exactly what changes when you unlock." />
          <div className="mx-auto max-w-4xl">
            <ReportComparison />
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-20">
        <Container>
          <SectionHeading title="What a full report looks like" subtitle="Expanded insights from a sample Full Aura Report." />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <InsightPreview
                title="Visual breakdown"
                description="Lighting: 68/100 — Harsh overhead light creates unflattering shadows. Clarity: 74/100 — Image is sharp but slightly overprocessed."
                value="7 dimensions"
              />
              <InsightPreview
                title="Status leaks ranked"
                description="1. Background (high) — Cluttered frame weakens premium signal. 2. Color mismatch (medium) — Warm outfit in cool-toned setting."
                value="3+ leaks"
              />
              <InsightPreview
                title="Budget upgrade path"
                description="Free: Re-angle lighting + clear background. ₹2,000: Basic ring light. ₹5,000: Neutral outfit + backdrop."
                value="Tiered"
              />
              <InsightPreview
                title="Goal strategy"
                description="For dating: lead with a candid full-body shot in natural light. For Instagram: consistent color palette across grid."
                value="Goal-specific"
              />
            </div>
            <div className="space-y-4">
              <Card>
                <h4 className="mb-3 text-sm font-semibold text-white">Sample archetype: Urban Aspirational</h4>
                <p className="mb-3 text-xs text-gray-400">
                  You invest in visible status items (phone, watch, shoes) but often miss the framing — background, lighting, and fit. Your upgrade path is about polishing the details around your assets.
                </p>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                  <div className="text-xs text-gray-500">Biggest signal mismatch</div>
                  <div className="text-sm text-gray-300">Premium watch + cluttered background</div>
                  <div className="mt-2 text-xs text-gray-500">Fix: Crop tight or shoot against a clean wall</div>
                </div>
              </Card>
              <LeadCaptureCard source="examples-page" />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-20">
        <Container>
          <Card className="mx-auto max-w-lg text-center">
            <h3 className="mb-2 text-lg font-semibold text-white">Ready to see your own report?</h3>
            <p className="mb-6 text-sm text-gray-400">
              Upload a photo, answer 3 questions, and get your free Aura Score in under 2 minutes.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/audit/new"><Button>Start Free Aura Check</Button></Link>
              <Link href="/pricing"><Button variant="outline">View Pricing</Button></Link>
            </div>
          </Card>
        </Container>
      </section>

      <section className="border-t border-white/5 py-12">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center text-xs text-gray-500">
            <p>AuraCheck analyzes presentation, not human worth. Scores are guidance, not objective truth.</p>
            <p className="mt-2">No external AI service is used in this MVP. No data is uploaded to any server.</p>
          </div>
        </Container>
      </section>
    </>
  );
}
