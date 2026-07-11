"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import type { AuraDimension } from "./AuraCore";

const AuraCore = dynamic(() => import("./AuraCore").then((m) => m.AuraCore), {
  ssr: false,
  loading: () => <div className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] animate-pulse rounded-full bg-white/5" />,
});

const SAMPLE_DIMENSIONS: AuraDimension[] = [
  { id: "lighting", label: "Lighting", score: 72, color: "#a78bfa" },
  { id: "clarity", label: "Clarity", score: 85, color: "#60a5fa" },
  { id: "composition", label: "Composition", score: 64, color: "#34d399" },
  { id: "background", label: "Background", score: 58, color: "#fbbf24" },
  { id: "colour", label: "Colour Harmony", score: 78, color: "#f472b6" },
  { id: "style", label: "Style", score: 70, color: "#c084fc" },
  { id: "consistency", label: "Consistency", score: 66, color: "#fb923c" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#0a0a12] overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(124,58,237,0.08),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(59,130,246,0.05),transparent_50%)]" />

      <Container className="relative z-10 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Text */}
          <div className="order-2 lg:order-1">
            <FadeInView>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                <span className="text-xs font-medium text-violet-300">First-impression intelligence</span>
              </div>
            </FadeInView>

            <FadeInView delay={100}>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                See what your photo communicates{" "}
                <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  before anyone reads your bio.
                </span>
              </h1>
            </FadeInView>

            <FadeInView delay={200}>
              <p className="mt-6 max-w-xl text-base text-gray-400 sm:text-lg leading-relaxed">
                Upload one photo and receive a structured assessment of lighting, composition, background, colour, styling, and overall presentation — with clear actions to improve it.
              </p>
            </FadeInView>

            <FadeInView delay={300}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/audit/new">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-base font-semibold">
                    Start My Aura Check
                  </Button>
                </Link>
                <Link href="/examples">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-4 text-base">
                    Try a Sample Photo
                  </Button>
                </Link>
              </div>
            </FadeInView>

            <FadeInView delay={400}>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                <span>Private browser-based analysis</span>
                <span>No account required for the first scan</span>
                <span>Clear scoring with actionable recommendations</span>
              </div>
            </FadeInView>
          </div>

          {/* Aura Core */}
          <div className="order-1 lg:order-2 flex justify-center">
            <FadeInView delay={200}>
              <AuraCore dimensions={SAMPLE_DIMENSIONS} interactive />
            </FadeInView>
          </div>
        </div>
      </Container>
    </section>
  );
}
