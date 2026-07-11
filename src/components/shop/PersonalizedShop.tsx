"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import type { Look } from "@/lib/shop/catalogTypes";
import type { StatusLeakTag } from "@/types/product";
import { buildRetailerUrl, type Retailer } from "@/lib/shop/linkBuilder";
import { ShopCategoryImage } from "./ShopCategoryImage";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

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
  return <ShopCategoryImage category={look.category} title={look.title} />;
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
        Search This Item
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
              onClick={() => {
                setOpen(false);
                trackEvent(EVENTS.SHOP_LINK_CLICKED, {
                  retailer: link.retailer,
                  lookCategory: look.category,
                });
              }}
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
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);

  const filteredLooks = budgetFilter
    ? looks.filter((l) => l.price <= budgetFilter)
    : looks;
  const visibleLooks = showAll ? filteredLooks : filteredLooks.slice(0, 12);

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
        {/* Header — stylist picks branding */}
        <FadeInView>
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1">
              <span className="text-xs">✨</span>
              <span className="text-xs font-medium text-amber-300">Personalized Picks</span>
            </div>
            <h2 className="gradient-text-animated text-2xl font-bold sm:text-3xl">
              {worstLeak
                ? `Your stylist picks to fix "${leakLabels[worstLeak] || worstLeak}"`
                : "Your personalized style picks"}
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
              {!worstLeak && "Curated based on your audit results"}
            </p>
          </div>
        </FadeInView>

        {/* Budget filter */}
        <FadeInView delay={50}>
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-500">Budget:</span>
            {[
              { label: "All", value: null },
              { label: "Under ₹500", value: 500 },
              { label: "Under ₹1000", value: 1000 },
              { label: "Under ₹2000", value: 2000 },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => setBudgetFilter(b.value)}
                className={`rounded-full px-3 py-1 text-xs transition-all ${
                  budgetFilter === b.value
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08]"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </FadeInView>

        {/* Free fixes — always first, no purchase needed */}
        {leakTags && leakTags.length > 0 && (
          <FadeInView delay={30}>
            <div className="mb-8 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm">💡</span>
                <h3 className="text-sm font-semibold text-emerald-300">Try these free fixes first</h3>
              </div>
              <div className="space-y-2">
                {leakTags.slice(0, 3).map((tag) => (
                  <div key={tag} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-500">✓</span>
                    <div>
                      <span className="text-xs font-medium text-white">{leakLabels[tag] || tag}: </span>
                      <span className="text-xs text-gray-400">{
                        tag === "lighting" && "Face a window at 45°. Natural side light is free and the single biggest upgrade."
                        || tag === "background" && "Stand against a plain wall or step outside. A clean background costs nothing."
                        || tag === "clarity" && "Use your phone's rear camera, clean the lens, and hold steady or use a timer."
                        || tag === "framing" && "Centre yourself with eyes at the top-third line. Chest-up framing works best."
                        || tag === "color" && "Wear solid colours that contrast your skin — dark on light, light on dark."
                        || tag === "grooming" && "Clean, neat grooming reads as put-together. No product needed."
                        || tag === "outfit_fit" && "Well-fitted basics beat expensive logos every time."
                        || "Small changes in this area can make a significant difference to your photo."
                      }</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>
        )}

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

        {/* Affiliate disclosure */}
        <FadeInView delay={150}>
          <p className="mt-6 text-center text-[10px] text-gray-600">
            FixMyAura may earn a commission when you purchase through eligible links. This does not change the price you pay.
            Product links open retailer search pages — verify current price and availability on the retailer site.
          </p>
        </FadeInView>

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
