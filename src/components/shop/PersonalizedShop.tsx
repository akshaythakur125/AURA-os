"use client";
import Link from "next/link";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import type { Look } from "@/lib/shop/catalogTypes";
import type { StatusLeakTag } from "@/types/product";
import { buildRetailerUrl, type Retailer } from "@/lib/shop/linkBuilder";
import { formatLookPrice } from "@/lib/shop/pricing";
import { ShopCategoryImage } from "./ShopCategoryImage";
import { trackEvent, EVENTS } from "@/lib/analytics/events";
import { rankLooks, searchLooks } from "@/lib/shop/ranking";
import { useSavedProducts } from "@/hooks/useSavedProducts";

interface PersonalizedShopProps {
  looks: Look[];
  userScore?: number;
  archetype?: string;
  leakTags?: string[];
  gender?: "men" | "women" | "unisex";
  /** Free users: show `freeCount` picks fully, lock the rest behind the paywall. */
  locked?: boolean;
  /** How many picks a free user gets to see fully. Default 1. */
  freeCount?: number;
  /** Where the unlock CTA points. */
  unlockHref?: string;
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
  return <ShopCategoryImage category={look.category} title={look.title} keywords={look.keywords} />;
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
              className="block rounded-lg px-3 py-2 text-xs text-[#4a443d] transition-colors hover:bg-[#1c1917]/[0.04] hover:text-[#1C1917]"
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
  locked = false,
  freeCount = 1,
  unlockHref = "/pricing",
}: PersonalizedShopProps) {
  const [showAll, setShowAll] = useState(false);
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const { isSaved, toggleSave } = useSavedProducts();

  // ponytail: deterministic ranking + search
  const ranked = rankLooks(looks, { leakTags, goalTags: [], maxBudget: budgetFilter || undefined });
  const searched = searchQuery ? searchLooks(ranked, searchQuery) : ranked;
  // Free users get `freeCount` fully-usable picks; the rest are teased blurred.
  const visibleLooks = locked ? searched.slice(0, freeCount) : (showAll ? searched : searched.slice(0, 12));
  const lockedPreview = locked ? searched.slice(freeCount, freeCount + 3) : [];
  const lockedRemaining = Math.max(0, looks.length - freeCount);
  const compareLooks = looks.filter((l) => compareIds.includes(l.id));

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
    <section className="border-t border-[#1c1917]/[0.08] py-12">
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
            <p className="mt-3 text-sm text-[#6f675e]">
              {archetype && (
                <span className="text-red-300">{archetype}</span>
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

        {/* Free-pick note (locked/free users only) */}
        {locked && lockedRemaining > 0 && (
          <FadeInView delay={20}>
            <p className="mb-6 text-center text-xs text-[#857b6e]">
              Here&apos;s <span className="font-semibold text-[#B23A25]">1 free pick</span> from your
              personalized set — <span className="font-medium text-[#1C1917]">{lockedRemaining} more</span> are
              in the full report.
            </p>
          </FadeInView>
        )}

        {/* Search + budget — full (paid) experience only */}
        {!locked && (
          <>
            <FadeInView delay={30}>
              <div className="mb-4 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search by category, style, or need..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.03] px-4 py-2.5 text-sm text-[#1C1917] placeholder-gray-500 outline-none focus:border-red-500/30"
                />
              </div>
            </FadeInView>

            <FadeInView delay={50}>
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-[#857b6e]">Budget:</span>
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
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-[#1c1917]/[0.03] text-[#6f675e] border border-[#1c1917]/10 hover:bg-[#1c1917]/[0.05]"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </FadeInView>
          </>
        )}

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
                      <span className="text-xs font-medium text-[#1C1917]">{leakLabels[tag] || tag}: </span>
                      <span className="text-xs text-[#6f675e]">{
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
                      <Link href={"/shop/look/" + look.id} className="text-sm font-semibold text-[#1C1917] leading-tight hover:underline">
                        {look.title}
                      </Link>
                      <span className="text-xs font-medium text-amber-400 whitespace-nowrap">
                        {formatLookPrice(look.price)}
                      </span>
                    </div>
                    <p className="text-xs text-[#857b6e] line-clamp-2">
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
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1"><ShopLinks look={look} /></div>
                    <button
                      onClick={() => toggleSave({ id: look.id, title: look.title, category: look.category, priceLabel: look.priceLabel })}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1c1917]/10 text-xs transition-colors hover:bg-[#1c1917]/[0.04]"
                      aria-label={isSaved(look.id) ? "Remove from saved" : "Save product"}
                      title={isSaved(look.id) ? "Saved" : "Save"}
                    >
                      {isSaved(look.id) ? "★" : "☆"}
                    </button>
                    <button
                      onClick={() => {
                        setCompareIds((prev) =>
                          prev.includes(look.id)
                            ? prev.filter((id) => id !== look.id)
                            : prev.length < 4 ? [...prev, look.id] : prev
                        );
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1c1917]/10 text-xs transition-colors hover:bg-[#1c1917]/[0.04]"
                      aria-label={compareIds.includes(look.id) ? "Remove from compare" : "Add to compare"}
                    >
                      {compareIds.includes(look.id) ? "✓" : "⇔"}
                    </button>
                  </div>
                </Card>
              </FadeInView>
            );
          })}
        </div>

        {/* Locked teaser — the rest of the picks, blurred behind the paywall */}
        {locked && lockedRemaining > 0 && (
          <FadeInView delay={80}>
            <div className="relative mt-8">
              {/* Blurred preview of the next few picks */}
              <div className="pointer-events-none select-none grid gap-4 blur-[6px] sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                {(lockedPreview.length > 0 ? lockedPreview : searched.slice(0, 3)).map((look) => (
                  <Card key={look.id} className="flex flex-col">
                    <LookImage look={look} />
                    <div className="mt-3">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-[#1C1917] leading-tight">{look.title}</span>
                        <span className="text-xs font-medium text-amber-400 whitespace-nowrap">{formatLookPrice(look.price)}</span>
                      </div>
                      <p className="text-xs text-[#857b6e] line-clamp-2">{look.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
              {/* 3D unlock card */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                  className="max-w-sm rounded-2xl border border-[#E14434]/25 bg-[#F7F1E6]/95 px-6 py-6 text-center shadow-[0_18px_50px_rgba(28,25,23,0.22)] backdrop-blur-md"
                  style={{ transform: "perspective(800px) rotateX(6deg)", transformStyle: "preserve-3d" }}
                >
                  <p className="text-base font-semibold text-[#1C1917]">🔒 {lockedRemaining} more personalized picks</p>
                  <p className="mx-auto mt-1.5 max-w-[260px] text-xs text-[#857b6e]">
                    Every pick matched to your leaks, with direct buy links across Amazon, Flipkart, Myntra &amp; Ajio.
                  </p>
                  <Link href={unlockHref}>
                    <Button size="sm" className="mt-3 text-xs">Unlock all {looks.length} picks</Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeInView>
        )}

        {/* Comparison table */}
        {!locked && compareLooks.length >= 2 && (
          <FadeInView delay={100}>
            <div className="mb-8 overflow-x-auto rounded-2xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1C1917]">Compare ({compareLooks.length})</h3>
                <button onClick={() => setCompareIds([])} className="text-xs text-[#857b6e] hover:text-[#1C1917]">Clear</button>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1c1917]/10">
                    <th className="py-2 pr-3 text-left text-[#857b6e]">Product</th>
                    <th className="py-2 pr-3 text-left text-[#857b6e]">Category</th>
                    <th className="py-2 pr-3 text-left text-[#857b6e]">Price</th>
                    <th className="py-2 pr-3 text-left text-[#857b6e]">Addresses</th>
                  </tr>
                </thead>
                <tbody>
                  {compareLooks.map((l) => (
                    <tr key={l.id} className="border-b border-white/[0.03]">
                      <td className="py-2 pr-3 font-medium text-[#1C1917]">{l.title}</td>
                      <td className="py-2 pr-3 text-[#6f675e]">{l.category}</td>
                      <td className="py-2 pr-3 text-amber-400">{formatLookPrice(l.price)}</td>
                      <td className="py-2 pr-3 text-[#6f675e]">{l.statusLeakTags.join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeInView>
        )}

        {/* Affiliate disclosure */}
        <FadeInView delay={150}>
          <p className="mt-6 text-center text-[10px] text-[#9c9184]">
            FixMyAura may earn a commission when you purchase through eligible links. This does not change the price you pay.
            Product links open retailer search pages — verify current price and availability on the retailer site.
          </p>
        </FadeInView>

        {/* Show more */}
        {!locked && looks.length > 12 && !showAll && (
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
