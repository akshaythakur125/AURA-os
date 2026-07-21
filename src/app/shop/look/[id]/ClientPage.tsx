"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { buildRetailerUrl, type Retailer } from "@/lib/shop/linkBuilder";
import { hasAnyUnlock } from "@/lib/storage/unlockStore";
import type { Look } from "@/lib/shop/catalogTypes";

const RETAILERS: Retailer[] = ["amazon", "flipkart", "myntra", "ajio", "nykaa"];
const RETAILER_NAMES: Record<Retailer, string> = {
  amazon: "Amazon", flipkart: "Flipkart", myntra: "Myntra", ajio: "Ajio", nykaa: "Nykaa Fashion",
};

export function LookDetailClient({ look }: { look: Look }) {
  // Retailer links are a paid perk; free users see a blurred glimpse.
  // null until mounted (avoids hydration mismatch), then real state.
  const [paid, setPaid] = useState<boolean | null>(null);
  useEffect(() => { try { setPaid(hasAnyUnlock()); } catch { setPaid(false); } }, []);
  return (
    <Container className="py-12">
      <FadeInView>
        <Link href="/shop" className="mb-6 inline-flex items-center gap-1 text-xs text-[#857b6e] hover:text-[#1C1917]">
          ← Back to shop
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div>
            <Card className="overflow-hidden">
              <ShopCategoryImage category={look.category} title={look.title} keywords={look.keywords} />
            </Card>
          </div>

          {/* Details */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="default">{look.category}</Badge>
              <span className="text-xs text-amber-400 font-medium">{look.priceLabel}</span>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-[#1C1917]">{look.title}</h1>
            <p className="mb-4 text-sm text-[#6f675e]">{look.description}</p>

            {/* Why recommended */}
            {look.statusLeakTags.length > 0 && (
              <div className="mb-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3">
                <p className="text-xs font-medium text-emerald-400">Addresses</p>
                <p className="text-xs text-[#6f675e] mt-1">
                  {look.statusLeakTags.join(", ")} presentation signals
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="mb-6 flex flex-wrap gap-1.5">
              {look.styleArchetypes.map((t) => (
                <Badge key={t} variant="default" className="text-[10px]">{t}</Badge>
              ))}
              {look.goalTags.map((t) => (
                <Badge key={t} variant="default" className="text-[10px]">{t}</Badge>
              ))}
            </div>

            {/* Retailer links — paid perk, blurred glimpse for free users */}
            {paid ? (
              <div className="space-y-2">
                <p className="text-xs text-[#857b6e]">Search on retailers:</p>
                {RETAILERS.map((r) => (
                  <a
                    key={r}
                    href={buildRetailerUrl(
                      { category: look.category, keywords: look.keywords, gender: look.gender },
                      r
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] px-4 py-3 text-sm text-[#4a443d] hover:bg-[#1c1917]/[0.04] hover:text-[#1C1917] transition-colors"
                  >
                    <span>{RETAILER_NAMES[r]}</span>
                    <span className="text-xs text-[#9c9184]">Search →</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="pointer-events-none select-none space-y-2 blur-[6px]" aria-hidden="true">
                  <p className="text-xs text-[#857b6e]">Search on retailers:</p>
                  {RETAILERS.slice(0, 3).map((r) => (
                    <div key={r} className="flex items-center justify-between rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] px-4 py-3 text-sm text-[#4a443d]">
                      <span>{RETAILER_NAMES[r]}</span>
                      <span className="text-xs text-[#9c9184]">Search →</span>
                    </div>
                  ))}
                </div>
                {paid === false && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="rounded-2xl border border-[#E14434]/25 bg-[#F7F1E6]/95 px-5 py-4 text-center shadow-[0_10px_30px_rgba(28,25,23,0.18)] backdrop-blur-md"
                      style={{ transform: "perspective(700px) rotateX(5deg)", transformStyle: "preserve-3d" }}
                    >
                      <p className="text-sm font-semibold text-[#1C1917]">🔒 Direct shop links</p>
                      <p className="mx-auto mt-1 max-w-[220px] text-[11px] text-[#857b6e]">Part of the Full Report — unlock once, shop every look.</p>
                      <Link href="/pricing">
                        <Button size="sm" className="mt-2 text-xs">Unlock to Shop</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <p className="mt-6 text-[10px] text-[#9c9184]">
              Links open retailer search pages. Verify current price and availability on the retailer site.
              FixMyAura may earn a commission on eligible purchases.
            </p>
          </div>
        </div>
      </FadeInView>
    </Container>
  );
}
