"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { HeroModel } from "@/components/hero/HeroModel";
import { CityHero } from "@/components/world/CityHero";
import type { AuraDimension } from "./AuraCore";

const SAMPLE_DIMENSIONS: AuraDimension[] = [
  { id: "lighting", label: "Lighting", score: 72, color: "#E14434" },
  { id: "clarity", label: "Clarity", score: 85, color: "#E9A23B" },
  { id: "composition", label: "Composition", score: 64, color: "#C0341F" },
  { id: "background", label: "Background", score: 58, color: "#B27A4B" },
  { id: "colour", label: "Colour Harmony", score: 78, color: "#D9663C" },
  { id: "style", label: "Style", score: 70, color: "#8A8175" },
  { id: "consistency", label: "Consistency", score: 66, color: "#E14434" },
];

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
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#B23A25]">First-impression intelligence</span>
              </div>
            </FadeInView>

            <FadeInView delay={100}>
              <h1 className="text-4xl font-bold tracking-tight text-[#1C1917] sm:text-5xl lg:text-6xl">
                See what your photo communicates{" "}
                <span className="text-[#E14434]">
                  before anyone reads your bio.
                </span>
              </h1>
            </FadeInView>

            <FadeInView delay={200}>
              <p className="mt-6 max-w-xl text-base text-[#6F675E] sm:text-lg leading-relaxed">
                Upload one photo and receive a structured assessment of lighting, composition, background, colour, styling, and overall presentation — with clear actions to improve it.
              </p>
            </FadeInView>

            <FadeInView delay={300}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/audit/new">
                  <Button variant="solid" size="lg" className="w-full sm:w-auto px-8 py-4 text-base font-semibold">
                    Start My Aura Check
                  </Button>
                </Link>
                <Link href="/examples">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-base border-[#1c1917]/25! text-[#1C1917]! hover:bg-[#1c1917]/[0.05]! hover:border-[#1c1917]/40!">
                    Try a Sample Photo
                  </Button>
                </Link>
              </div>
            </FadeInView>

            <FadeInView delay={400}>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#8B8175]">
                <span>Private browser-based analysis</span>
                <span>No account required for the first scan</span>
                <span>Clear scoring with actionable recommendations</span>
              </div>
            </FadeInView>
          </div>

          {/* Hero 3D object — modelled camera on desktop, AuraCore fallback */}
          <div className="order-1 lg:order-2 flex justify-center">
            <FadeInView delay={200}>
              <ErrorBoundary fallback={<div className="w-[320px] h-[320px] rounded-full bg-[#1c1917]/5 flex items-center justify-center text-xs text-[#8B8175]">3D view unavailable</div>}><HeroModel dimensions={SAMPLE_DIMENSIONS} /></ErrorBoundary>
            </FadeInView>
          </div>
        </div>
      </Container>
    </section>
  );
}
