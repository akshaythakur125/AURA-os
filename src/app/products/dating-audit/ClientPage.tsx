"use client";
import { PAYMENT_PRODUCTS, formatPrice } from "@/config/pricing";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { LeadCaptureCard } from "@/components/marketing/LeadCaptureCard";
import { InsightPreview } from "@/components/examples/InsightPreview";
import { SAMPLE_REPORTS } from "@/config/sampleReports";
import { getBestAuditForUpsell } from "@/lib/audits/getBestAuditForUpsell";
import type { ProductType } from "@/types/payment";

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
    <Link href={link.href}><Button size="lg">{link.label}</Button></Link>
  );
}

export default function DatingAuditPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-32 pt-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.12),transparent_50%)]" />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="premium" className="mb-4">Dating / Profile Audit — {formatPrice(PAYMENT_PRODUCTS.dating_audit.price)}</Badge>
            <h1 className="bg-gradient-to-r from-[#1c1917] via-[#E14434] to-[#c0341f] bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
              Fix the friction in your dating/profile presentation.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#6f675e]">
              AuraCheck reviews your profile photo/screenshot, bio, prompts, and visual signal to show what may be weakening first-impression clarity.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <AuditCTA productType="dating_audit" />
              <Link href="/examples"><Button variant="outline" size="lg">See Example</Button></Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[#1c1917]/[0.08] py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading title="What it analyzes" align="left" />
              <ul className="space-y-4">
                {[
                  "Profile photo or screenshot visual signal",
                  "Bio length, effort, tone, and personality",
                  "Prompt answers — quality, creativity, red flags",
                  "Photo order and signal coherence",
                  "Red-flag detection: negativity, clichés, low effort, aggression, desperation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#4a443d]">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHeading title="Why profiles fail" align="left" />
              <div className="space-y-3">
                {[
                  { title: "Generic bio", desc: "I like traveling, food, and music' — this describes millions of people. Nothing starts a conversation." },
                  { title: "Weak photo order", desc: "Your best photo should be first. Group shots or low-quality images before your best one bury your first impression." },
                  { title: "Red flags in text", desc: "Negativity, clichés, low-effort answers, or aggressive language signal caution before you even meet." },
                  { title: "Signal mismatch", desc: "Casual selfie with a formal profile. Gym photo with no lifestyle context. The inconsistency confuses the viewer." },
                ].map((item) => (
                  <InsightPreview key={item.title} title={item.title} description={item.desc} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[#1c1917]/[0.08] py-24">
        <Container>
          <SectionHeading title="What you get" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Profile text score", desc: "A composite score (15–100) based on bio quality, prompt answers, and red-flag presence." },
              { title: "Bio analysis", desc: "Length, effort level, tone, hooks, and personality presence — with specific feedback." },
              { title: "Prompt grading", desc: "Each prompt answer graded weak/average/good/excellent with improvement suggestions." },
              { title: "Red-flag detection", desc: "5 categories: negative, cliché, low effort, aggressive, desperate — with severity." },
              { title: "3 suggested bios", desc: "Three alternative bio versions tailored to your style and confidence level." },
              { title: "Overall advice", desc: "A clear summary of your biggest friction points and what to change first." },
            ].map((f) => (
              <Card key={f.title} hover>
                <h3 className="mb-2 text-sm font-semibold text-[#1C1917]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#6f675e]">{f.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-[#1c1917]/[0.08] py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading title="Example profile fixes" align="left" />
              <div className="space-y-4">
                <Card>
                  <Badge variant="warning" className="mb-2">Before</Badge>
                  <p className="text-sm text-[#6f675e]">&ldquo;I like traveling, food, and hanging out with friends.&rdquo;</p>
                </Card>
                <Card>
                  <Badge variant="success" className="mb-2">After</Badge>
                  <p className="text-sm text-[#4a443d]">&ldquo;Trying to find someone who also thinks a 3-hour chai is a valid personality trait. Bonus points if you let me pick the playlist.&rdquo;</p>
                </Card>
              </div>
            </div>
            <div>
              <SectionHeading title="Sample report" align="left" />
              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="premium">Sample — Dating Audit</Badge>
                  <span className="text-2xl font-bold text-[#1C1917]">{SAMPLE_REPORTS[1].score}</span>
                </div>
                <div className="mb-3 rounded-lg border border-red-500/10 bg-red-500/5 p-3">
                  <div className="text-xs text-red-400">Main friction</div>
                  <div className="text-sm text-[#4a443d]">{SAMPLE_REPORTS[1].bottleneck}</div>
                </div>
                <p className="text-sm text-[#6f675e]">{SAMPLE_REPORTS[1].topInsight}</p>
              </Card>
              <div className="mt-4">
                <LeadCaptureCard source="dating-audit-page" defaultProduct="dating_audit" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[#1c1917]/[0.08] py-24">
        <Container>
          <SectionHeading title="Free vs Paid" />
          <div className="mx-auto max-w-4xl">
            <ComparisonTable />
          </div>
        </Container>
      </section>

      <section className="border-t border-[#1c1917]/[0.08] py-12">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-6 text-center text-xs text-[#857b6e]">
            <p>AuraCheck analyzes presentation signals, not attractiveness. No guaranteed matches or dating outcomes.</p>
            <p className="mt-2">Manual UPI unlock flow — payment is not automatically verified. Contact support if you have issues.</p>
          </div>
        </Container>
      </section>
    </>
  );
}
