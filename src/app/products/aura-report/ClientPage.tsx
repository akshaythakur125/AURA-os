"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { LeadCaptureCard } from "@/components/marketing/LeadCaptureCard";
import { SAMPLE_REPORTS } from "@/config/sampleReports";
import { getBestAuditForUpsell } from "@/lib/audits/getBestAuditForUpsell";
import type { ProductType } from "@/types/payment";

const sampleReport = SAMPLE_REPORTS[0];

function AuditCTA({ productType }: { productType: string }) {
  const [link] = useState(() => {
    if (typeof window === "undefined") return { href: "/audit/new", label: "Start Free Aura Check" };
    const audit = getBestAuditForUpsell(productType as ProductType);
    if (audit) {
      return { href: `/unlock?auditId=${audit.id}&product=${productType}`, label: "Unlock for My Latest Audit" };
    }
    return { href: "/audit/new", label: "Start Free Aura Check" };
  });

  return (
    <Link href={link.href}>
      <Button size="lg">{link.label}</Button>
    </Link>
  );
}

export default function AuraReportPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-32 pt-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.12),transparent_50%)]" />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="premium" className="mb-4">Full Aura Report — ₹25</Badge>
            <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
              Unlock the full reason behind your Aura Score.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              The free score tells you what is leaking. The Full Aura Report tells you what to fix first, what to avoid, and how to upgrade your visual signal under your budget.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <AuditCTA productType="aura_report" />
              <Link href="/examples"><Button variant="outline" size="lg">See Example</Button></Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <SectionHeading title="What you get" subtitle="Everything in the free score, plus a detailed breakdown." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Full visual breakdown", desc: "7-dimension analysis: lighting, clarity, composition, background control, color signal, premium signal, and overall consistency." },
              { title: "Detailed status leaks", desc: "Every element weakening your first impression, ranked by severity. No fluff — just what matters." },
              { title: "Status archetype", desc: "See which of 11 status archetypes your presentation matches and which direction to upgrade." },
              { title: "Signal mismatch map", desc: "AuraCheck detects contradictions — expensive phone with cluttered background, premium outfit with poor lighting." },
              { title: "Budget upgrade plan", desc: "From free tweaks to ₹25,000 — ranked by impact per rupee so you never waste money on the wrong upgrade." },
              { title: "Marketplace recommendations", desc: "Products matched to your archetype, budget, and biggest leak. Not random shopping." },
              { title: "Goal-specific strategy", desc: "Advice tailored to your goal — dating, Instagram, college, office, or general glow-up." },
              { title: "Shareable card", desc: "Generate a clean Aura Score card without exposing your photo. Built to share." },
              { title: "Print / save report", desc: "Export your full report as a printable page. Keep it, share it, track your progress." },
            ].map((f) => (
              <Card key={f.title} hover>
                <h3 className="mb-2 text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{f.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading title="Who it is for" align="left" />
              <ul className="space-y-4">
                {[
                  "You got a free score and want to know what it really means",
                  "You want a clear, ranked list of what to fix first",
                  "You want to spend money on upgrades that actually improve your signal",
                  "You want a shareable score card",
                  "You want a budget-aware plan — not a generic checklist",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHeading title="Example insights" align="left" />
              <Card className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="premium">Sample — Urban Aspirational</Badge>
                  <span className="text-2xl font-bold text-white">{sampleReport.score}</span>
                </div>
                <div className="mb-3 rounded-lg border border-red-500/10 bg-red-500/5 p-3">
                  <div className="text-xs text-red-400">Primary bottleneck</div>
                  <div className="text-sm text-gray-300">{sampleReport.bottleneck}</div>
                </div>
                <p className="text-sm text-gray-400">{sampleReport.topInsight}</p>
              </Card>
              <LeadCaptureCard source="aura-report-page" defaultProduct="aura_report" />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <SectionHeading title="Free vs Paid" subtitle="See exactly what changes when you unlock the full report." />
          <div className="mx-auto max-w-4xl">
            <ComparisonTable />
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto max-w-2xl rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Why ₹25?</h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              ₹25 is a conscious price point — low enough that anyone can unlock their report after a free audit, 
              but high enough that you value what you get. The analysis is generated locally in your browser 
              using a rule-based engine. No external AI, no subscription, no hidden costs.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <AuditCTA productType="aura_report" />
              <Link href="/audit/new"><Button variant="outline">Start Free First</Button></Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/[0.04] py-12">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-white/[0.04] bg-white/[0.02] p-6 text-center text-xs text-gray-500">
            <p>AuraCheck analyzes presentation, not human worth. Scores are guidance, not objective truth.</p>
            <p className="mt-2">Manual UPI unlock flow — payment is not automatically verified. Contact support if you have issues.</p>
          </div>
        </Container>
      </section>
    </>
  );
}
