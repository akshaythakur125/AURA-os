"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { buildPrimaryShopLink } from "@/lib/shop/linkBuilder";
import { formatLookPrice } from "@/lib/shop/pricing";
import { getAllLooks } from "@/lib/shop/catalog";
import { STYLE_COLLECTIONS } from "@/lib/shop/styleCollections";
import type { Look } from "@/lib/shop/catalogTypes";

const FREE_LOOKS = 50;
const INITIAL = 20;

/**
 * Homepage "Shop the look" band — the FREE shopping tier: 50 hand-diverse,
 * fully shoppable (affiliate-tagged) looks anyone can browse and buy. The rest
 * of the catalog and the personalized shopping are members-only (unlocked with
 * any ₹25 report), so this band is the free sample that also earns commission
 * from non-paying traffic.
 */
export function ShopTheVibeBand() {
  const [expanded, setExpanded] = useState(false);

  // 50 diverse looks: round-robin across categories so the free set never
  // reads as ten near-identical tees.
  const picks = useMemo<Look[]>(() => {
    const byCat = new Map<string, Look[]>();
    for (const l of getAllLooks()) {
      if (l.price <= 0) continue;
      const arr = byCat.get(l.category) || [];
      arr.push(l);
      byCat.set(l.category, arr);
    }
    for (const arr of byCat.values()) arr.sort((a, b) => a.price - b.price);
    const cats = [...byCat.keys()];
    const out: Look[] = [];
    const seen = new Set<string>();
    let i = 0;
    while (out.length < FREE_LOOKS && i < 200) {
      const cat = cats[i % cats.length];
      const arr = byCat.get(cat)!;
      const idx = Math.floor(i / cats.length);
      const look = arr[idx];
      if (look && !seen.has(look.id)) { seen.add(look.id); out.push(look); }
      i++;
    }
    return out.slice(0, FREE_LOOKS);
  }, []);

  const shown = expanded ? picks : picks.slice(0, INITIAL);

  return (
    <section id="shop" className="scroll-mt-20 py-16 sm:py-20">
      <Container>
        <FadeInView>
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1">
              <span className="text-xs">🛍️</span>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-amber-600">Shop the look · {FREE_LOOKS} free</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl">
              {FREE_LOOKS} camera-ready looks — free to shop
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#6F675E]">
              A stylist&apos;s edit you can shop right now. The full catalog and picks matched to <em>your</em> photo unlock with any ₹25 report.
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

        {/* Free shoppable edit */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((look, i) => (
            <FadeInView key={look.id} delay={Math.min(i * 20, 300)}>
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

        {!expanded && picks.length > INITIAL && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1c1917]/15 px-5 py-2.5 text-sm font-semibold text-[#4a443d] transition-colors hover:border-[#E14434]/40 hover:text-[#1C1917]"
            >
              Show all {FREE_LOOKS} free looks →
            </button>
          </div>
        )}

        {/* Unlock the full shop */}
        <FadeInView delay={120}>
          <div className="mt-10 rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-6 text-center">
            <p className="text-sm font-semibold text-[#1C1917]">Want the full shop + picks matched to your photo?</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-[#6f675e]">
              Unlock the entire catalog, your personalized buy list, colour palette, and capsule wardrobe with any ₹25 report.
            </p>
            <Link
              href="/audit/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Scan &amp; unlock the full shop →
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
