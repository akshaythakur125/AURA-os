"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { getAllLooks } from "@/lib/shop/catalog";
import { STYLE_COLLECTIONS, getCollectionLooks } from "@/lib/shop/styleCollections";
import { buildRetailerUrl, type Retailer } from "@/lib/shop/linkBuilder";
import { hasAnyUnlock } from "@/lib/storage/unlockStore";
import { trackEvent, EVENTS } from "@/lib/analytics/events";
import type { Look, LookCategory } from "@/lib/shop/catalogTypes";
import type { GoalTag, BudgetTag } from "@/types/product";
import type { StyleIntent } from "@/types/personalization";
import { Scene3DAccent } from "@/components/hero/Scene3DAccent";

const CATEGORY_OPTIONS: { label: string; value: LookCategory | null }[] = [
  { label: "All Categories", value: null },
  { label: "T-Shirts", value: "tshirt" },
  { label: "Shirts", value: "shirt" },
  { label: "Jeans", value: "jeans" },
  { label: "Trousers", value: "trousers" },
  { label: "Shorts", value: "shorts" },
  { label: "Jackets", value: "jacket" },
  { label: "Hoodies", value: "hoodie" },
  { label: "Sweatshirts", value: "sweatshirt" },
  { label: "Sneakers", value: "sneakers" },
  { label: "Shoes", value: "shoes" },
  { label: "Sandals", value: "sandals" },
  { label: "Watches", value: "watch" },
  { label: "Sunglasses", value: "sunglasses" },
  { label: "Backpacks", value: "backpack" },
  { label: "Fragrance", value: "fragrance" },
  { label: "Grooming", value: "grooming" },
  { label: "Earrings", value: "earrings" },
  { label: "Heels", value: "heels" },
  { label: "Flats", value: "flats" },
  { label: "Dresses", value: "dress" },
  { label: "Kurtas", value: "kurta" },
  { label: "Sarees", value: "saree" },
  { label: "Accessories", value: "accessory" },
];

const BUDGET_OPTIONS: { label: string; value: BudgetTag | null }[] = [
  { label: "Any Budget", value: null },
  { label: "Under ₹2,000", value: 2000 },
  { label: "Under ₹5,000", value: 5000 },
  { label: "Under ₹10,000", value: 10000 },
  { label: "₹10,000+", value: 25000 },
];

const GOAL_OPTIONS: { label: string; value: GoalTag | null }[] = [
  { label: "Any Goal", value: null },
  { label: "Dating", value: "dating" },
  { label: "Instagram", value: "instagram" },
  { label: "College", value: "college" },
  { label: "Office", value: "office" },
  { label: "Glow-Up", value: "glowup" },
];

const STYLE_OPTIONS: { label: string; value: StyleIntent | null }[] = [
  { label: "Any Style", value: null },
  { label: "Clean", value: "clean" },
  { label: "Bold", value: "bold" },
  { label: "Premium", value: "premium" },
  { label: "Professional", value: "professional" },
  { label: "Confident", value: "confident" },
  { label: "Creator", value: "creator" },
  { label: "College", value: "college" },
  { label: "Understated", value: "understated" },
  { label: "Attractive", value: "attractive" },
];

const GENDER_OPTIONS: { label: string; value: "men" | "women" | "unisex" | null }[] = [
  { label: "All", value: null },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
];

const RETAILER_LABELS: Record<Retailer, string> = {
  amazon: "Amazon",
  flipkart: "Flipkart",
  myntra: "Myntra",
  ajio: "Ajio",
  nykaa: "Nykaa",
};

const RETAILERS: Retailer[] = ["amazon", "flipkart", "myntra", "ajio"];

function ShopLinks({ look }: { look: Look }) {
  const [open, setOpen] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);

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
        onClick={() => {
          // Retailer links are a paid perk — free users get a locked glimpse.
          if (hasAnyUnlock()) { setLockedOpen(false); setOpen(!open); }
          else { setOpen(false); setLockedOpen(!lockedOpen); }
        }}
      >
        Shop This Look
      </Button>
      {lockedOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl glass-elevated p-3 shadow-2xl z-10" style={{ transform: "perspective(600px) rotateX(4deg)", transformOrigin: "bottom" }}>
          <div className="pointer-events-none select-none blur-[5px]" aria-hidden="true">
            {links.slice(0, 3).map((l) => (
              <div key={l.retailer} className="px-3 py-1.5 text-xs text-[#4a443d]">{l.label} →</div>
            ))}
          </div>
          <div className="mt-1 border-t border-[#1c1917]/[0.08] pt-2 text-center">
            <p className="mb-1.5 text-[11px] text-[#857b6e]">🔒 Direct retailer links are part of the Full Report</p>
            <Link href="/pricing" className="inline-block rounded-lg bg-gradient-to-r from-[#E14434] to-[#c0341f] px-4 py-1.5 text-[11px] font-semibold text-white">
              Unlock to Shop
            </Link>
          </div>
        </div>
      )}
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

const INITIAL_BATCH = 36;
const BATCH_SIZE = 36;

export default function ShopPage() {
  const [category, setCategory] = useState<LookCategory | null>(null);
  const [budget, setBudget] = useState<BudgetTag | null>(null);
  const [goal, setGoal] = useState<GoalTag | null>(null);
  const [style, setStyle] = useState<StyleIntent | null>(null);
  const [gender, setGender] = useState<"men" | "women" | "unisex" | null>(null);
  const [collection, setCollection] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);

  const allLooks = useMemo(() => getAllLooks(), []);

  // Precompute each collection's size so the rail can show real counts.
  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of STYLE_COLLECTIONS) counts[c.id] = getCollectionLooks(c.id, allLooks).length;
    return counts;
  }, [allLooks]);

  const filtered = useMemo(() => {
    const base = collection ? getCollectionLooks(collection, allLooks) : allLooks;
    return base.filter((look) => {
      if (category && look.category !== category) return false;
      if (budget && look.price > budget) return false;
      if (goal && !look.goalTags.includes(goal)) return false;
      if (style && !look.styleArchetypes.includes(style)) return false;
      if (gender && look.gender !== gender && look.gender !== "unisex") return false;
      return true;
    });
  }, [allLooks, collection, category, budget, goal, style, gender]);

  // Reset to first batch when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [collection, category, budget, goal, style, gender]);

  const hasFilters = category || budget || goal || style || gender || collection;
  const visibleLooks = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-12">
        <GlowOrb color="rgba(225, 68, 52, 0.1)" size={350} className="top-[5%] right-[5%]" delay={0} />
        <GlowOrb color="rgba(14, 165, 233, 0.06)" size={250} className="bottom-[20%] left-[10%]" delay={500} />

        {/* Hero */}
        <div className="mb-10 relative">
          <div className="mb-4">
            <Scene3DAccent size={110} shape="sunglasses" />
          </div>
          <h1 className="text-2xl font-bold text-[#1C1917] sm:text-3xl">
            Upgrade Your Visual Signal
          </h1>
          <p className="mt-2 text-sm text-[#6f675e]">
            Curated upgrades that target your biggest photo-quality issues — without
            wasting money.
          </p>
          <p className="mt-1 text-xs text-[#9c9184]">
            {allLooks.length} looks · {STYLE_COLLECTIONS.length} style collections · Real retailer links
          </p>
        </div>

        {/* Style collections rail — browse by aesthetic */}
        <div className="mb-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-[#857b6e]">Shop by aesthetic</p>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STYLE_COLLECTIONS.map((c) => {
              const active = collection === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCollection(active ? null : c.id)}
                  className={`group shrink-0 rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                    active
                      ? "border-[#E14434]/50 bg-[#E14434]/[0.08] shadow-[0_8px_24px_-8px_rgba(225,68,52,0.4)]"
                      : "border-[#1c1917]/10 bg-[#1c1917]/[0.02] hover:border-[#1c1917]/20 hover:-translate-y-0.5"
                  }`}
                  style={{ minWidth: 150 }}
                >
                  <div className="mb-1 text-2xl transition-transform duration-300 group-hover:scale-110">{c.emoji}</div>
                  <div className={`text-sm font-semibold ${active ? "text-[#B23A25]" : "text-[#1C1917]"}`}>{c.name}</div>
                  <div className="text-[11px] text-[#9c9184]">{c.tagline}</div>
                  <div className="mt-1 text-[10px] font-medium text-[#857b6e]">{collectionCounts[c.id] ?? 0} looks</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs text-[#857b6e]">Category</label>
              <select
                value={category || ""}
                onChange={(e) => setCategory(e.target.value as LookCategory || null)}
                className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] focus:border-red-500/50 focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.label} value={c.value ?? ""}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="mb-1.5 block text-xs text-[#857b6e]">Budget</label>
              <select
                value={budget ?? ""}
                onChange={(e) => setBudget(e.target.value ? (Number(e.target.value) as BudgetTag) : null)}
                className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] focus:border-red-500/50 focus:outline-none"
              >
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b.label} value={b.value ?? ""}>{b.label}</option>
                ))}
              </select>
            </div>

            {/* Goal */}
            <div>
              <label className="mb-1.5 block text-xs text-[#857b6e]">Goal</label>
              <select
                value={goal || ""}
                onChange={(e) => setGoal(e.target.value as GoalTag || null)}
                className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] focus:border-red-500/50 focus:outline-none"
              >
                {GOAL_OPTIONS.map((g) => (
                  <option key={g.label} value={g.value ?? ""}>{g.label}</option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="mb-1.5 block text-xs text-[#857b6e]">Style</label>
              <select
                value={style || ""}
                onChange={(e) => setStyle(e.target.value as StyleIntent || null)}
                className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] focus:border-red-500/50 focus:outline-none"
              >
                {STYLE_OPTIONS.map((s) => (
                  <option key={s.label} value={s.value ?? ""}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="mb-1.5 block text-xs text-[#857b6e]">Gender</label>
              <select
                value={gender || ""}
                onChange={(e) => setGender(e.target.value as "men" | "women" | "unisex" || null)}
                className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] focus:border-red-500/50 focus:outline-none"
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.label} value={g.value ?? ""}>{g.label}</option>
                ))}
              </select>
            </div>

            {/* Clear */}
            {hasFilters && (
              <div className="flex items-end">
                <button
                  onClick={() => { setCategory(null); setBudget(null); setGoal(null); setStyle(null); setGender(null); setCollection(null); }}
                  className="rounded-lg border border-[#1c1917]/10 px-4 py-2 text-xs text-[#6f675e] transition-colors hover:border-[#1c1917]/20 hover:text-[#1C1917]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        {filtered.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-sm text-[#6f675e]">No looks match your filters.</p>
            <button
              onClick={() => { setCategory(null); setBudget(null); setGoal(null); setStyle(null); setGender(null); }}
              className="mt-3 text-xs text-red-400 hover:text-red-300"
            >
              Clear filters
            </button>
          </Card>
        ) : (
          <>
            <p className="mb-4 text-xs text-[#857b6e]">
              Showing {visibleLooks.length} of {filtered.length} look{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleLooks.map((look, i) => (
                <FadeInView key={look.id} delay={Math.min(i * 50, 400)}>
                  <Card hover className="flex flex-col h-full">
                    <Link
                      href={`/shop/look/${look.id}`}
                      className="group block overflow-hidden rounded-xl"
                      aria-label={`View ${look.title}`}
                    >
                      <div className="transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                        <ShopCategoryImage category={look.category} title={look.title} keywords={look.keywords} />
                      </div>
                    </Link>
                    <div className="mt-3 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <Link href={`/shop/look/${look.id}`} className="min-w-0">
                          <h3 className="text-sm font-semibold text-[#1C1917] leading-tight transition-colors hover:text-[#B23A25]">
                            {look.title}
                          </h3>
                        </Link>
                        <span className="text-xs font-medium text-amber-400 whitespace-nowrap">
                          {look.priceLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#857b6e] line-clamp-2">
                        {look.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {look.styleArchetypes.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="default" className="text-[9px] px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {look.gender !== "unisex" && (
                          <Badge variant="default" className="text-[9px] px-1.5 py-0">
                            {look.gender}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <ShopLinks look={look} />
                      <Link
                        href={`/shop/look/${look.id}`}
                        className="block text-center text-[11px] font-medium text-[#857b6e] transition-colors hover:text-[#B23A25]"
                      >
                        View details →
                      </Link>
                    </div>
                  </Card>
                </FadeInView>
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((c) => c + BATCH_SIZE)}
                >
                  Load More ({filtered.length - visibleLooks.length} remaining)
                </Button>
              </div>
            )}
          </>
        )}

        {/* Trust */}
        <Card className="mt-8 text-center relative">
          <p className="text-xs text-[#857b6e]">
            AuraCheck does not guarantee social, dating, career, or financial
            outcomes. Prices are approximate. Verify details before buying from any vendor.
          </p>
        </Card>
      </Container>
    </>
  );
}
