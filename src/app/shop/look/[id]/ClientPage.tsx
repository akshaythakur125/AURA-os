"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import type { Look } from "@/lib/shop/catalogTypes";
import {
  formatIndianPrice,
  getLookDisplayDescription,
  getLookDisplayTitle,
  getLookTotalPrice,
  getResolvedLookPieces,
} from "@/lib/shop/lookCompositions";

export function LookDetailClient({ look }: { look: Look }) {
  const pieces = getResolvedLookPieces(look);

  return (
    <Container className="py-12">
      <FadeInView>
        <Link href="/shop" className="mb-6 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-white">
          {"<-"} Back to shop
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Card className="overflow-hidden">
              <ShopCategoryImage category={look.category} title={getLookDisplayTitle(look)} />
            </Card>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="default">{look.category}</Badge>
              <span className="text-xs font-medium text-amber-400">~Rs {formatIndianPrice(getLookTotalPrice(look))}</span>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-white">{getLookDisplayTitle(look)}</h1>
            <p className="mb-4 text-sm text-gray-400">{getLookDisplayDescription(look)}</p>

            {look.statusLeakTags.length > 0 && (
              <div className="mb-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3">
                <p className="text-xs font-medium text-emerald-400">Addresses</p>
                <p className="mt-1 text-xs text-gray-400">
                  {look.statusLeakTags.join(", ")} presentation signals
                </p>
              </div>
            )}

            <div className="mb-6 flex flex-wrap gap-1.5">
              {look.styleArchetypes.map((tag) => (
                <Badge key={tag} variant="default" className="text-[10px]">{tag}</Badge>
              ))}
              {look.goalTags.map((tag) => (
                <Badge key={tag} variant="default" className="text-[10px]">{tag}</Badge>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500">Shop each piece in this look:</p>
              {pieces.map((piece) => (
                <div
                  key={`${look.id}-${piece.slot}-${piece.item.id}`}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">{piece.slot}</p>
                      <p className="mt-1 text-sm font-medium text-white">{piece.item.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{piece.productTitle}</p>
                    </div>
                    <span className="text-xs font-medium text-amber-400">{piece.item.priceLabel}</span>
                  </div>
                  <a
                    href={piece.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <span>Buy this piece</span>
                    <span className="text-xs text-gray-600">Open {"->"}</span>
                  </a>
                </div>
              ))}
            </div>

            <p className="mt-6 text-[10px] text-gray-600">
              Every look is broken into individual pieces so users can buy the exact top, bottom, shoes, and finishing items separately. FixMyAura may earn a commission on eligible purchases.
            </p>
          </div>
        </div>
      </FadeInView>
    </Container>
  );
}
