"use client";

import { useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { HeroMockup } from "@/components/hero/HeroMockup";
import { SocialProofBar } from "@/components/social-proof/SocialProofBar";
import { RecentScores } from "@/components/social-proof/RecentScores";
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

      {/* Large Gen Z lifestyle photos — faces visible, not tiny decorations */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute left-[3%] top-[8%] h-40 w-28 overflow-hidden rounded-3xl border border-white/[0.1] shadow-[0_0_60px_rgba(0,0,0,0.5)] animate-[float-dramatic_12s_ease-in-out_infinite] sm:h-56 sm:w-40 lg:h-64 lg:w-44">
          <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80" alt="Fashion forward style" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 text-[10px] font-medium text-white/80">Style ✓</div>
        </div>
        <div className="absolute right-[4%] top-[12%] h-36 w-36 overflow-hidden rounded-full border border-white/[0.1] shadow-[0_0_60px_rgba(0,0,0,0.5)] animate-[float-dramatic_14s_ease-in-out_infinite_2s] sm:h-48 sm:w-48 lg:h-56 lg:w-56">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" alt="Confident portrait" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 text-[10px] font-medium text-white/80">Aura 82</div>
        </div>
        <div className="absolute left-[8%] bottom-[15%] h-32 w-24 overflow-hidden rounded-2xl border border-white/[0.1] shadow-[0_0_60px_rgba(0,0,0,0.5)] animate-[float-dramatic_10s_ease-in-out_infinite_4s] sm:h-44 sm:w-32 lg:h-52 lg:w-36">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" alt="Natural lighting" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 text-[10px] font-medium text-white/80">Lighting ✓</div>
        </div>
        <div className="absolute right-[6%] bottom-[20%] h-36 w-28 overflow-hidden rounded-3xl border border-white/[0.1] shadow-[0_0_60px_rgba(0,0,0,0.5)] animate-[float-dramatic_11s_ease-in-out_infinite_1s] sm:h-48 sm:w-36 lg:h-56 lg:w-40">
          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80" alt="Clean background" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 text-[10px] font-medium text-white/80">Background ✓</div>
        </div>
        {/* Small decorative shapes */}
        <div className="absolute left-[8%] top-[18%] h-3 w-3 rounded-full border border-rose-400/30 bg-rose-400/10 animate-[float-dramatic_8s_ease-in-out_infinite]" />
        <div className="absolute right-[12%] top-[25%] h-2 w-2 rounded bg-blue-400/20 animate-[float-dramatic_10s_ease-in-out_infinite_1s]" style={{ rotate: "45deg" }} />
        <div className="absolute left-[15%] bottom-[30%] h-4 w-4 rounded-full border border-rose-300/20 bg-rose-300/5 animate-[float-dramatic_9s_ease-in-out_infinite_2s]" />
        <div className="absolute right-[25%] top-[45%] h-5 w-5 rounded-full border border-blue-400/10 bg-blue-400/5 animate-[float-dramatic_7s_ease-in-out_infinite_0.5s]" />
      </div>

      <div ref={orbLayerRef}>
        <GlowOrb color="rgba(251, 113, 133, 0.22)" size={700} className="top-[-15%] left-[5%]" delay={0} />
        <GlowOrb color="rgba(225, 29, 72, 0.18)" size={550} className="top-[15%] right-[0%]" delay={600} />
        <GlowOrb color="rgba(37, 99, 235, 0.1)" size={450} className="bottom-[5%] left-[25%]" delay={1200} />
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
            See what your presentation is really saying.
          </h1>
          <p
            ref={paragraphRef}
            style={{ opacity: 0 }}
            className="mx-auto mt-8 max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed"
          >
            Find out what your photo is <span className="text-rose-300 font-medium">really</span> saying.
            Get scored, get the fix, get the links — all in 60 seconds.
          </p>
          <div ref={ctaWrapRef} style={{ opacity: 0 }} className="mt-12">
            <Link ref={ctaRef} href="/audit/new" className="inline-block">
              <Button size="lg">Start Free Aura Check</Button>
            </Link>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Free score instantly</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Browser-based analysis</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Nearby salons & gyms</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Buy links included</span>
            </div>
          </div>
        </div>
        <HeroMockup depthRef={mockupDepthRef} entranceRef={mockupEntranceRef} />
        <div ref={socialProofRef} style={{ opacity: 0 }} className="mt-6">
          <SocialProofBar variant="hero" />
          <RecentScores />
        </div>
      </Container>
    </section>
  );
}
