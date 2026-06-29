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

export default function GlowupPlanPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-32 pt-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_50%)]" />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="premium" className="mb-4">30-Day Glow-Up Plan — ₹499</Badge>
            <h1 className="bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
              Get a 30-day plan to make your presentation cleaner and more intentional.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              A practical, budget-aware roadmap for grooming, outfit basics, background, photo system, and profile consistency.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <AuditCTA productType="glowup_plan" />
              <Link href="/examples"><Button variant="outline" size="lg">See Example</Button></Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-20">
        <Container>
          <SectionHeading title="What the 30-day plan includes" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Week 1 — Foundation", desc: "Photo audit, grooming basics, color palette for your skin tone, lighting setup." },
              { title: "Week 2 — Style awareness", desc: "Outfit formulas, fit adjustments, background cleanup, accessory signals." },
              { title: "Week 3 — Expression & context", desc: "Photo system, profile coherence, visual storytelling across platforms." },
              { title: "Week 4 — Integration & polish", desc: "Review progress, refine system, plan next 30 days, create content batch." },
            ].map((w) => (
              <Card key={w.title} hover>
                <h3 className="mb-2 text-sm font-semibold text-white">{w.title}</h3>
                <p className="text-xs leading-relaxed text-gray-400">{w.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-20">
        <Container>
          <SectionHeading title="Daily mission preview" subtitle="Every day has one specific action across 5 categories." />
          <div className="grid gap-4 sm:grid-cols-5">
            {[
              { cat: "Photo", color: "from-purple-600 to-purple-400", missions: ["Take one intentional selfie", "Find your best angle", "Check lighting at 3 times of day"] },
              { cat: "Grooming", color: "from-pink-500 to-rose-400", missions: ["Consistent skincare AM/PM", "Eyebrow cleanup", "Lip balm habit"] },
              { cat: "Outfit", color: "from-amber-500 to-orange-400", missions: ["Wear one well-fitted solid", "Create 3 outfit formulas", "Check fit in mirror"] },
              { cat: "Background", color: "from-emerald-500 to-teal-400", missions: ["Clean one photo spot", "Find a neutral wall", "Remove clutter from frame"] },
              { cat: "Mindset", color: "from-blue-500 to-cyan-400", missions: ["No scroll 30 min before photos", "Write one intentional caption", "Plan your visual goals"] },
            ].map((cat) => (
              <Card key={cat.cat}>
                <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${cat.color}`} />
                <h3 className="mb-2 text-sm font-semibold text-white">{cat.cat}</h3>
                <ul className="space-y-1.5">
                  {cat.missions.map((m) => (
                    <li key={m} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                      {m}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading title="Budget roadmap" align="left" />
              <div className="space-y-3">
                {[
                  { tier: "Free", items: "Lighting position, background cleanup, outfit combinations from existing wardrobe" },
                  { tier: "₹2,000", items: "Basic grooming kit, one well-fitted solid tee, ring light" },
                  { tier: "₹5,000", items: "2 outfit formulas, basic skincare, photo backdrop" },
                  { tier: "₹10,000+", items: "Wardrobe refresh, professional haircut, premium photo setup" },
                ].map((t) => (
                  <div key={t.tier} className="rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
                    <div className="mb-1 text-xs text-amber-400">Up to {t.tier}</div>
                    <p className="text-xs text-gray-400">{t.items}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading title="What to avoid" align="left" />
              <div className="space-y-3">
                {[
                  { title: "Buying expensive clothes before fit", desc: "A ₹5,000 shirt that does not fit looks worse than a ₹500 one that does." },
                  { title: "Expensive skincare without basics", desc: "Moisturizer and sunscreen matter more than a 10-step routine when starting." },
                  { title: "Chasing trends instead of consistency", desc: "A consistent clean look beats an inconsistent trendy one every time." },
                ].map((a) => (
                  <Card key={a.title}>
                    <h4 className="mb-1 text-sm font-medium text-white">{a.title}</h4>
                    <p className="text-xs text-gray-400">{a.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-20">
        <Container>
          <SectionHeading title="Sample report preview" />
          <Card className="mx-auto max-w-lg">
            <div className="mb-3 flex items-center justify-between">
              <Badge variant="premium">Sample — Glow-Up Plan</Badge>
              <span className="text-2xl font-bold text-white">{SAMPLE_REPORTS[2].score}</span>
            </div>
            <div className="mb-3 rounded-lg border border-red-500/10 bg-red-500/5 p-3">
              <div className="text-xs text-red-400">Primary bottleneck</div>
              <div className="text-sm text-gray-300">{SAMPLE_REPORTS[2].bottleneck}</div>
            </div>
            <p className="mb-4 text-sm text-gray-400">{SAMPLE_REPORTS[2].topInsight}</p>
          </Card>
          <div className="mt-6 mx-auto max-w-md">
            <LeadCaptureCard source="glowup-plan-page" defaultProduct="glowup_plan" />
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-20">
        <Container>
          <SectionHeading title="Free vs Paid" />
          <div className="mx-auto max-w-4xl">
            <ComparisonTable />
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-12">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center text-xs text-gray-500">
            <p>AuraCheck analyzes presentation signals, not human worth. Scores are guidance, not objective truth.</p>
            <p className="mt-2">No guaranteed transformation — the plan gives you a system, consistency is up to you.</p>
            <p className="mt-2">Manual UPI unlock flow — payment is not automatically verified.</p>
          </div>
        </Container>
      </section>
    </>
  );
}
