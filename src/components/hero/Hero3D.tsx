"use client";

import { useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { FadeInView } from "@/components/ui/FadeInView";
import { HeroMockup } from "@/components/hero/HeroMockup";
import { SocialProofBar } from "@/components/social-proof/SocialProofBar";
import { useHeroParallax } from "@/hooks/useHeroParallax";
import { useMagneticHover } from "@/hooks/useMagneticHover";

export function Hero3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const orbLayerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const mockupDepthRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useHeroParallax({
    section: sectionRef,
    backLayer: orbLayerRef,
    midLayer: textLayerRef,
    depthLayer: mockupDepthRef,
  });

  useMagneticHover(ctaRef);

  return (
    <section
      ref={sectionRef}
      className="parallax-section relative overflow-hidden pb-28 pt-20 sm:pt-28"
      style={{ perspective: "1200px" }}
    >
      <div ref={orbLayerRef}>
        <GlowOrb color="rgba(147, 51, 234, 0.22)" size={700} className="top-[-15%] left-[5%]" delay={0} />
        <GlowOrb color="rgba(236, 72, 153, 0.15)" size={550} className="top-[15%] right-[0%]" delay={600} />
        <GlowOrb color="rgba(14, 165, 233, 0.1)" size={450} className="bottom-[5%] left-[25%]" delay={1200} />
      </div>

      <Container className="relative text-center">
        <div ref={textLayerRef}>
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
              <Link ref={ctaRef} href="/audit/new" className="inline-block">
                <Button size="lg">Start Free Aura Check</Button>
              </Link>
            </div>
          </FadeInView>
        </div>
        <FadeInView delay={400}>
          <HeroMockup depthRef={mockupDepthRef} />
        </FadeInView>
        <FadeInView delay={500}>
          <div className="mt-6">
            <SocialProofBar variant="hero" />
          </div>
        </FadeInView>
      </Container>
    </section>
  );
}
