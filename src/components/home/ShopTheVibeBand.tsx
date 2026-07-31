"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";
import { LookGallery } from "@/components/shop/LookGallery";

/**
 * Homepage "Shop the vibe" — the free shopping tier, built around curated LOOKS
 * (complete outfits per aesthetic) rather than individual products. The full
 * catalog + picks matched to your own photo unlock with any ₹21 report.
 */
export function ShopTheVibeBand() {
  return (
    <section id="shop" className="scroll-mt-20 py-16 sm:py-20">
      <Container>
        <FadeInView>
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1">
              <span className="text-xs">🛍️</span>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-amber-600">Shop the vibe · free</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl">
              Steal the whole fit, not just one piece
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#6F675E]">
              Complete looks that photograph well — each one styled to a vibe and ready to shop. Picks matched to <em>your</em> photo unlock with any ₹21 report.
            </p>
          </div>
        </FadeInView>

        <LookGallery initial={6} />

        {/* Unlock the full shop */}
        <FadeInView delay={120}>
          <div className="mt-12 rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-6 text-center">
            <p className="text-sm font-semibold text-[#1C1917]">Want looks built for your face, colours &amp; vibe?</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-[#6f675e]">
              Unlock the full catalog, your personalized buy list, colour palette, and capsule wardrobe with any ₹21 report.
            </p>
            <Link
              href="/audit/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Scan &amp; unlock your looks →
            </Link>
            <p className="mx-auto mt-4 max-w-md text-[10px] text-[#9c9184]">
              FixMyAura may earn a commission on purchases through these links, at no extra cost to you.
            </p>
          </div>
        </FadeInView>
      </Container>
    </section>
  );
}
