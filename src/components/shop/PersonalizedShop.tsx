"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import type { Look } from "@/lib/shop/catalogTypes";
import type { StatusLeakTag } from "@/types/product";
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

const LEAK_FIX_COPY: Record<StatusLeakTag, string> = {
  lighting: "Fixes your harsh or flat lighting",
  clarity: "Adds visual clarity to your frame",
  background: "Cleans up your background signal",
  framing: "Improves your photo composition",
  color: "Adds better color coordination",
  resolution: "Upgrades your image quality signal",
  grooming: "Boosts your grooming presence",
  outfit_fit: "Fixes the fit mismatch in your outfit",
  accessories: "Adds a premium accessory signal",
  fragrance: "Completes your sensory presentation",
  phone_condition: "Upgrades your phone-as-signal",
  room_clutter: "Reduces visual noise in your space",
  posture: "Improves your body language signal",
};

function getLeakFixText(look: Look, leakTags: string[]): string | null {
  for (const tag of look.statusLeakTags) {
    if (leakTags.includes(tag)) {
      return LEAK_FIX_COPY[tag] || null;
    }
  }
  return null;
}

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
  archetype,
  leakTags,
}: PersonalizedShopProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleLooks = showAll ? looks : looks.slice(0, 12);

  const worstLeak = leakTags && leakTags.length > 0 ? leakTags[0] : null;

  const leakLabels: Record<string, string> = {
    lighting: "lighting",
    clarity: "clarity",
    background: "background",
    framing: "composition",
    color: "color coordination",
    resolution: "resolution",
    grooming: "grooming",
    outfit_fit: "outfit fit",
    accessories: "accessories",
    fragrance: "fragrance",
    phone_condition: "phone condition",
    room_clutter: "room clutter",
    posture: "posture",
  };

  return (
    <section className="border-t border-white/[0.04] py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        {/* Header — names the specific leak */}
        <FadeInView>
          <div className="mb-8 text-center">
            <h2 className="gradient-text-animated text-2xl font-bold sm:text-3xl">
              {worstLeak
                ? `Fix your "${leakLabels[worstLeak] || worstLeak}" leak`
                : "Looks matched to your result"}
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              {archetype && (
                <span className="text-purple-300">{archetype}</span>
              )}
              {archetype && worstLeak && " · "}
              {worstLeak && (
                <span>
                  Each pick directly addresses your{" "}
                  <span className="text-red-300">{leakLabels[worstLeak] || worstLeak}</span> issue
                </span>
              )}
              {!worstLeak && "Personalized picks based on your audit"}
            </p>
          </div>
        </FadeInView>

        {/* Look grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleLooks.map((look, i) => {
            const fixText = leakTags ? getLeakFixText(look, leakTags) : null;
            return (
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
                    {/* Why this fixes it */}
                    {fixText && (
                      <div className="mt-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-1.5">
                        <p className="text-[10px] font-medium text-emerald-400">
                          ✓ {fixText}
                        </p>
                      </div>
                    )}
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
            );
          })}
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
