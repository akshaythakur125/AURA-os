"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { buildPrimaryShopLink } from "@/lib/shop/linkBuilder";
import { formatLookPrice } from "@/lib/shop/pricing";
import { HERO_LOOKS } from "@/lib/shop/heroLooks";
import { STYLE_COLLECTIONS } from "@/lib/shop/styleCollections";
import type { Look } from "@/lib/shop/catalogTypes";

/**
 * Homepage "Shop the look" band — puts commissionable, affiliate-tagged product
 * suggestions at the top of the funnel so browsers who never scan can still
 * shop. A curated spread of looks (one per category, cheapest-first) plus the
 * aesthetic collection rail; every card links out to a retailer (affiliate) or
 * into /shop, which is fully open. On-brand and tasteful — a stylist's edit,
 * not a product wall.
 */
export function ShopTheVibeBand() {
  const picks = useMemo<Look[]>(() => {
    // one cheapest look per category, for a diverse, clean six-card edit
    const byCat = new Map<string, Look>();
    for (const l of HERO_LOOKS) {
      if (l.price <= 0) continue;
      const cur = byCat.get(l.category);
      if (!cur || l.price < cur.price) byCat.set(l.category, l);
    }
    return [...byCat.values()].sort((a, b) => a.price - b.price).slice(0, 6);
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <FadeInView>
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1">
              <span className="text-xs">🛍️</span>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-amber-600">Shop the look</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl">
              Pieces that photograph well — shop your vibe
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#6F675E]">
              A stylist&apos;s edit of clean, camera-ready looks. Scan your photo and every pick gets matched to your measured gaps.
            </p>
          </div>
        </FadeInView>

        {/* Aesthetic collection rail */}
        <FadeInView delay={60}>
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {STYLE_COLLECTIONS.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                href="/shop"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#1c1917]/10 bg-[#1c1917]/[0.03] px-3 py-1.5 text-xs font-medium text-[#4a443d] transition-colors hover:border-[#E14434]/40 hover:text-[#1C1917]"
              >
                <span>{c.emoji}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </FadeInView>

        {/* Shoppable edit */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {picks.map((look, i) => (
            <FadeInView key={look.id} delay={Math.min(80 + i * 40, 320)}>
              <a
                href={buildPrimaryShopLink({ category: look.category, keywords: look.keywords, gender: look.gender })}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#1c1917]/[0.08] bg-[#FBF8F2] transition-all hover:-translate-y-0.5 hover:border-[#E14434]/30 hover:shadow-[0_10px_30px_-12px_rgba(28,25,23,0.25)]"
              >
                <div className="overflow-hidden">
                  <div className="transition-transform duration-500 group-hover:scale-[1.05]">
                    <ShopCategoryImage category={look.category} title={look.title} keywords={look.keywords} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-2.5">
                  <p className="line-clamp-2 text-xs font-semibold leading-tight text-[#1C1917]">{look.title}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-[11px] font-medium text-amber-600">{formatLookPrice(look.price)}</span>
                    <span className="text-[11px] font-semibold text-[#E14434] group-hover:underline">Shop →</span>
                  </div>
                </div>
              </a>
            </FadeInView>
          ))}
        </div>

        <FadeInView delay={120}>
          <div className="mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Browse all {HERO_LOOKS.length}+ looks →
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
