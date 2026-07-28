"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { HeroReportMockup } from "@/components/hero/HeroReportMockup";
import { CityHero } from "@/components/world/CityHero";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#F2ECE1]/60 overflow-hidden">
      {/* Cinematic 3D city flying past behind the hero */}
      <CityHero />
      {/* Warm paper grain + a faint darkroom vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(225,68,52,0.06),transparent_55%),radial-gradient(ellipse_at_15%_85%,rgba(28,25,23,0.05),transparent_50%)]" />

      <Container className="relative z-10 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Text */}
          <div className="order-2 lg:order-1">
            <FadeInView>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E14434]/25 bg-[#E14434]/[0.07] px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E14434]" />
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#B23A25]">Your first impression, scored</span>
              </div>
            </FadeInView>

            <FadeInView delay={100}>
              <h1 className="text-4xl font-bold tracking-tight text-[#1C1917] sm:text-5xl lg:text-6xl">
                See what your pic{" "}
                <span className="text-[#E14434]">
                  actually says about you.
                </span>
              </h1>
            </FadeInView>

            <FadeInView delay={200}>
              <p className="mt-6 max-w-md text-base text-[#6F675E] sm:text-lg leading-relaxed">
                Drop one photo → get your Aura Score, then the exact fixes for your lighting, angle, and expression. Measured, not vibes. Free and private, under a minute.
              </p>
            </FadeInView>

            <FadeInView delay={300}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/audit/new">
                  <Button variant="solid" size="lg" className="w-full sm:w-auto px-8 py-4 text-base font-semibold">
                    Get My Aura Score
                  </Button>
                </Link>
                <Link href="/examples">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-base border-[#1c1917]/25! text-[#1C1917]! hover:bg-[#1c1917]/[0.05]! hover:border-[#1c1917]/40!">
                    Try a sample pic
                  </Button>
                </Link>
              </div>
            </FadeInView>

            <FadeInView delay={400}>
              <p className="mt-5 text-xs text-[#8B8175]">
                No signup · Stays on your phone · 100 = elite
              </p>
            </FadeInView>
          </div>

          {/* Hero focal — a faithful screenshot of the real Aura report */}
          <div className="order-1 lg:order-2 flex justify-center">
            <FadeInView delay={200}>
              <HeroReportMockup />
            </FadeInView>
          </div>
        </div>
      </Container>
    </section>
  );
}
