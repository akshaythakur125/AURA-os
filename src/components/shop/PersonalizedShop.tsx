"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import type { Look } from "@/lib/shop/catalogTypes";
import { buildRetailerUrl, type Retailer } from "@/lib/shop/linkBuilder";

interface PersonalizedShopProps {
  looks: Look[];
  userScore?: number;
  archetype?: string;
  leakTags?: string[];
  gender?: "men" | "women" | "unisex";
}

const RETAILER_LABELS: Record<Retailer, string> = {
  amazon: "Amazon",
  flipkart: "Flipkart",
  myntra: "Myntra",
  ajio: "Ajio",
  nykaa: "Nykaa",
};

const RETAILERS: Retailer[] = ["amazon", "flipkart", "myntra", "ajio"];

/**
 * Category visual — renders the look's generated aurora-gradient SVG image.
 */
function LookImage({ look }: { look: Look }) {
  return (
    <div className="relative h-40 overflow-hidden rounded-xl bg-black/20">
      <img
        src={look.imageUrl}
        alt={look.imageAlt}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/**
 * Shop link dropdown — shows multiple retailer options.
 */
function ShopLinks({ look }: { look: Look }) {
  const [open, setOpen] = useState(false);

  const links = RETAILERS.map((retailer) => ({
    retailer,
    url: buildRetailerUrl(
      { category: look.category, keywords: look.keywords, gender: look.gender },
      retailer
    ),
    label: RETAILER_LABELS[retailer],
  }));

  return (
    <div className="relative">
      <Button
        variant="primary"
        size="sm"
        className="w-full text-xs"
        onClick={() => setOpen(!open)}
      >
        Shop This Look
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl glass-elevated p-1.5 shadow-2xl z-10">
          {links.map((link) => (
            <a
              key={link.retailer}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg px-3 py-2 text-xs text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              onClick={() => setOpen(false)}
            >
              {link.label} →
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function PersonalizedShop({
  looks,
  userScore,
  archetype,
  leakTags,
}: PersonalizedShopProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer>("amazon");

  const visibleLooks = showAll ? looks : looks.slice(0, 12);

  return (
    <section className="border-t border-white/[0.04] py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <FadeInView>
          <div className="mb-8 text-center">
            <h2 className="gradient-text-animated text-2xl font-bold sm:text-3xl">
              Looks matched to your result
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              {archetype && (
                <span className="text-purple-300">{archetype}</span>
              )}
              {archetype && leakTags && leakTags.length > 0 && " · "}
              {leakTags && leakTags.length > 0 && (
                <span>
                  Targeting:{" "}
                  {leakTags.slice(0, 3).join(", ")}
                </span>
              )}
              {!archetype && !leakTags && "Personalized picks based on your audit"}
            </p>
          </div>
        </FadeInView>

        {/* Retailer quick-select */}
        <FadeInView delay={100}>
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {RETAILERS.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRetailer(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedRetailer === r
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-gray-500 hover:text-gray-300 border border-transparent hover:border-white/[0.06]"
                }`}
              >
                {RETAILER_LABELS[r]}
              </button>
            ))}
          </div>
        </FadeInView>

        {/* Look grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleLooks.map((look, i) => (
            <FadeInView key={look.id} delay={Math.min(i * 50, 400)}>
              <Card hover className="flex flex-col h-full">
                <LookImage look={look} />
                <div className="mt-3 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white leading-tight">
                      {look.title}
                    </h3>
                    <span className="text-xs font-medium text-amber-400 whitespace-nowrap">
                      {look.priceLabel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {look.description}
                  </p>
                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {look.styleArchetypes.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="default" className="text-[9px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <ShopLinks look={look} />
                </div>
              </Card>
            </FadeInView>
          ))}
        </div>

        {/* Show more */}
        {looks.length > 12 && !showAll && (
          <FadeInView delay={200}>
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(true)}
              >
                Show All {looks.length} Looks
              </Button>
            </div>
          </FadeInView>
        )}
      </div>
    </section>
  );
}
