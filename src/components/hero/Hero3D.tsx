"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HeroMockup } from "@/components/hero/HeroMockup";
import { SocialProofBar } from "@/components/social-proof/SocialProofBar";
import { FadeInView } from "@/components/ui/FadeInView";

/**
 * Apple-style hero: one big product image, one headline, one CTA.
 * No floating photos, no orbs, no dots, no badges. Clean and focused.
 */
export function Hero3D() {
  return (
    <section className="relative overflow-hidden bg-black">
      {/* Hero content */}
      <Container className="relative pt-24 pb-12 sm:pt-32 sm:pb-16">
        <FadeInView>
          <div className="text-center">
            {/* Headline — Apple-style huge, clean */}
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              See what your photo
              <span className="block bg-gradient-to-r from-violet-400 to-amber-300 bg-clip-text text-transparent">
                is really saying.
              </span>
            </h1>

            {/* Subhead — simple, direct */}
            <p className="mx-auto mt-6 max-w-xl text-base text-gray-400 sm:text-lg">
              Upload a photo. Get your Aura Score. Find out what your first impression reveals — in 60 seconds.
            </p>

            {/* CTA — one button, Apple-style */}
            <div className="mt-10">
              <Link href="/audit/new" className="inline-block">
                <Button size="lg" className="px-10 py-4 text-base font-semibold">
                  Start Free Aura Check
                </Button>
              </Link>
              <p className="mt-4 text-xs text-gray-600">Free · No signup · Results in 60 seconds</p>
            </div>
          </div>
        </FadeInView>
      </Container>

      {/* Phone mockup — full-width product shot, Apple-style */}
      <div className="relative mx-auto max-w-4xl px-4">
        <FadeInView delay={200}>
          <div className="relative overflow-hidden rounded-t-3xl border border-white/[0.08] bg-[#111] shadow-2xl shadow-black/50">
            <HeroMockup />
          </div>
        </FadeInView>
      </div>

      {/* Social proof — minimal, below the fold */}
      <Container className="py-12 sm:py-16">
        <FadeInView delay={300}>
          <SocialProofBar variant="inline" />
        </FadeInView>
      </Container>
    </section>
  );
}
