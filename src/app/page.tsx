import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { FadeInView } from "@/components/ui/FadeInView";
import { HeroMockup } from "@/components/hero/HeroMockup";
import { SocialProofBar } from "@/components/social-proof/SocialProofBar";
import { Testimonials } from "@/components/marketing/Testimonials";
import { LeakComparison } from "@/components/examples/LeakComparison";

const leaks = [
  {
    title: "Expensive phone, weak background",
    desc: "A flagship phone means little if the background behind you screams \u201Cunmade bed at 3 PM.\u201D",
    severity: "high" as const,
  },
  {
    title: "Good outfit, poor fit",
    desc: "Even a premium brand looks off when the fit is baggy or the shoulders don\u2019t align.",
    severity: "high" as const,
  },
  {
    title: "Good face, bad lighting",
    desc: "Harsh overhead light can undo good grooming in a single frame.",
    severity: "medium" as const,
  },
  {
    title: "Premium watch, messy room",
    desc: "Luxury accessories lose impact when the surroundings suggest chaos.",
    severity: "medium" as const,
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Aurora Mesh ─── */}
      <div className="aurora-mesh" />
      <div className="aurora-mesh-third" />

      {/* ─── Hero ─── */}
      <section className="parallax-section relative overflow-hidden pb-28 pt-20 sm:pt-28">
        <GlowOrb color="rgba(147, 51, 234, 0.22)" size={700} className="top-[-15%] left-[5%]" delay={0} />
        <GlowOrb color="rgba(236, 72, 153, 0.15)" size={550} className="top-[15%] right-[0%]" delay={600} />
        <GlowOrb color="rgba(14, 165, 233, 0.1)" size={450} className="bottom-[5%] left-[25%]" delay={1200} />

        <Container className="relative text-center">
          <FadeInView>
            <span className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1 text-xs text-purple-300 badge-embossed">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              First-Impression Intelligence
            </span>
          </FadeInView>
          <FadeInView delay={100}>
            <h1 className="mx-auto max-w-4xl gradient-text-animated text-4xl font-bold sm:text-5xl md:text-6xl md:text-[4.5rem] md:leading-[1.02] lg:text-[5rem]">
              Find your biggest status leak.
            </h1>
          </FadeInView>
          <FadeInView delay={200}>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed">
              You may have the phone, the outfit, or the profile. AuraCheck shows
              what is weakening your first impression and how to upgrade your
              visual signal under your budget.
            </p>
          </FadeInView>
          <FadeInView delay={300}>
            <div className="mt-12">
              <Link href="/audit/new">
                <Button size="lg">Start Free Aura Check</Button>
              </Link>
            </div>
          </FadeInView>
          <FadeInView delay={400}>
            <HeroMockup />
          </FadeInView>
          <FadeInView delay={500}>
            <div className="mt-6">
              <SocialProofBar variant="hero" />
            </div>
          </FadeInView>
        </Container>
      </section>

      {/* ─── What It Finds ─── */}
      <section id="examples" className="border-t border-white/[0.04] py-24">
        <Container>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
              Your most expensive item may not be your strongest signal.
            </h2>
            <p className="mt-5 text-lg text-gray-400">
              These are the kinds of status leaks AuraCheck detects — small
              mismatches between what you own and how you present it.
            </p>
          </div>
          <div className="bento-grid">
            {leaks.map((leak, i) => (
              <Card key={leak.title} hover className={i < 2 ? "bento-span-2" : ""}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">
                    {leak.title}
                  </h3>
                  <Badge
                    variant={
                      leak.severity === "high"
                        ? "danger"
                        : leak.severity === "medium"
                          ? "warning"
                          : "default"
                    }
                  >
                    {leak.severity}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">
                  {leak.desc}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-10">
            <LeakComparison />
          </div>
          <div className="mt-10 text-center">
            <Link href="/examples">
              <Button variant="outline" size="lg">See Sample Reports</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="border-t border-white/[0.04] py-24">
        <Container>
          <FadeInView>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
                What a report catches
              </h2>
              <p className="mt-5 text-lg text-gray-400">
                Illustrative examples of the kind of specific, actionable
                calls a Full Aura Report makes.
              </p>
            </div>
          </FadeInView>
          <FadeInView delay={100}>
            <Testimonials />
          </FadeInView>
        </Container>
      </section>

      {/* ─── Safety Note ─── */}
      <section className="border-t border-white/[0.04] py-12">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-white/[0.04] bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-gray-500">
              AuraCheck analyzes presentation, not human worth. Scores are
              guidance, not objective truth.
            </p>
          </div>
        </Container>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden border-t border-white/[0.04] py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.12),transparent_50%)]" />
        <Container className="relative text-center">
          <h2 className="gradient-text-animated text-3xl font-bold sm:text-4xl">
            Ready to check your visual signal?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-400">
            Two minutes. No login. See what your first impression is really
            saying.
          </p>
          <div className="mt-8">
            <Link href="/audit/new">
              <Button size="lg">Start Free Aura Check</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
