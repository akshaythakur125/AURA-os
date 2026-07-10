"use client";

import { useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { HeroMockup } from "@/components/hero/HeroMockup";
import { SocialProofBar } from "@/components/social-proof/SocialProofBar";
import { useHeroParallax } from "@/hooks/useHeroParallax";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { useHeroEntrance } from "@/hooks/useHeroEntrance";

export function Hero3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const orbLayerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const mockupDepthRef = useRef<HTMLDivElement>(null);
  const mockupEntranceRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLDivElement>(null);

  useHeroParallax({
    section: sectionRef,
    backLayer: orbLayerRef,
    midLayer: textLayerRef,
    depthLayer: mockupDepthRef,
  });

  useMagneticHover(ctaRef);

  useHeroEntrance({
    badge: badgeRef,
    heading: headingRef,
    paragraph: paragraphRef,
    ctaWrap: ctaWrapRef,
    mockup: mockupEntranceRef,
    socialProof: socialProofRef,
  });

  return (
    <section
      ref={sectionRef}
      className="parallax-section relative overflow-hidden pb-28 pt-20 sm:pt-28"
      style={{ perspective: "1200px" }}
    >
      {/* Dot grid overlay */}
      <div className="hero-grid pointer-events-none absolute inset-0 z-[1]" />

      {/* Floating decorative shapes */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute left-[8%] top-[18%] h-3 w-3 rounded-full border border-rose-400/30 bg-rose-400/10 animate-[float-dramatic_8s_ease-in-out_infinite]" />
        <div className="absolute right-[12%] top-[25%] h-2 w-2 rounded bg-blue-400/20 animate-[float-dramatic_10s_ease-in-out_infinite_1s]" style={{ rotate: "45deg" }} />
        <div className="absolute left-[15%] bottom-[30%] h-4 w-4 rounded-full border border-rose-300/20 bg-rose-300/5 animate-[float-dramatic_9s_ease-in-out_infinite_2s]" />
        <div className="absolute right-[25%] top-[45%] h-5 w-5 rounded-full border border-blue-400/10 bg-blue-400/5 animate-[float-dramatic_7s_ease-in-out_infinite_0.5s]" />
        <div className="absolute left-[50%] bottom-[15%] h-2 w-2 rounded bg-rose-500/15 animate-[float-dramatic_11s_ease-in-out_infinite_1.5s]" style={{ rotate: "45deg" }} />
      </div>

      <div ref={orbLayerRef}>
        <GlowOrb color="rgba(251, 113, 133, 0.22)" size={700} className="top-[-15%] left-[5%]" delay={0} />
        <GlowOrb color="rgba(225, 29, 72, 0.18)" size={550} className="top-[15%] right-[0%]" delay={600} />
        <GlowOrb color="rgba(37, 99, 235, 0.1)" size={450} className="bottom-[5%] left-[25%]" delay={1200} />
        {/* Extra spectacle orbs */}
        <GlowOrb color="rgba(251, 113, 133, 0.08)" size={350} className="top-[30%] left-[40%]" delay={200} />
        <GlowOrb color="rgba(96, 165, 250, 0.06)" size={300} className="bottom-[20%] right-[30%]" delay={800} />
      </div>

      <Container className="relative text-center">
        <div ref={textLayerRef}>
          <div ref={badgeRef} style={{ opacity: 0, transformStyle: "preserve-3d" }} className="mb-8 inline-block">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3.5 py-1 text-xs text-rose-300 badge-embossed">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              First-Impression Intelligence
            </span>
          </div>
          <h1
            ref={headingRef}
            style={{ opacity: 0, transformStyle: "preserve-3d" }}
            className="mx-auto max-w-4xl gradient-text-animated text-4xl font-bold sm:text-5xl md:text-6xl md:text-[4.5rem] md:leading-[1.02] lg:text-[5rem]"
          >
            Find your biggest status leak.
          </h1>
          <p
            ref={paragraphRef}
            style={{ opacity: 0 }}
            className="mx-auto mt-8 max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed"
          >
            You may have the phone, the outfit, or the profile. AuraCheck shows
            what is weakening your first impression and how to upgrade your
            visual signal under your budget.
          </p>
          <div ref={ctaWrapRef} style={{ opacity: 0 }} className="mt-12">
            <Link ref={ctaRef} href="/audit/new" className="inline-block">
              <Button size="lg">Start Free Aura Check</Button>
            </Link>
          </div>
        </div>
        <HeroMockup depthRef={mockupDepthRef} entranceRef={mockupEntranceRef} />
        <div ref={socialProofRef} style={{ opacity: 0 }} className="mt-6">
          <SocialProofBar variant="hero" />
        </div>
      </Container>
    </section>
  );
}
