"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { buildRetailerUrl, type Retailer } from "@/lib/shop/linkBuilder";
import type { Look } from "@/lib/shop/catalogTypes";

const RETAILERS: Retailer[] = ["amazon", "flipkart", "myntra", "ajio", "nykaa"];
const RETAILER_NAMES: Record<Retailer, string> = {
  amazon: "Amazon", flipkart: "Flipkart", myntra: "Myntra", ajio: "Ajio", nykaa: "Nykaa Fashion",
};

export function LookDetailClient({ look }: { look: Look }) {
  return (
    <Container className="py-12">
      <FadeInView>
        <Link href="/shop" className="mb-6 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-white">
          ← Back to shop
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div>
            <Card className="overflow-hidden">
              <ShopCategoryImage category={look.category} title={look.title} />
            </Card>
          </div>

          {/* Details */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="default">{look.category}</Badge>
              <span className="text-xs text-amber-400 font-medium">{look.priceLabel}</span>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-white">{look.title}</h1>
            <p className="mb-4 text-sm text-gray-400">{look.description}</p>

            {/* Why recommended */}
            {look.statusLeakTags.length > 0 && (
              <div className="mb-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3">
                <p className="text-xs font-medium text-emerald-400">Addresses</p>
                <p className="text-xs text-gray-400 mt-1">
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

            {/* Retailer links */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Search on retailers:</p>
              {RETAILERS.map((r) => (
                <a
                  key={r}
                  href={buildRetailerUrl(
                    { category: look.category, keywords: look.keywords, gender: look.gender },
                    r
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <span>{RETAILER_NAMES[r]}</span>
                  <span className="text-xs text-gray-600">Search →</span>
                </a>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="mt-6 text-[10px] text-gray-600">
              Links open retailer search pages. Verify current price and availability on the retailer site.
              FixMyAura may earn a commission on eligible purchases.
            </p>
          </div>
        </div>
      </FadeInView>
    </Container>
  );
}
