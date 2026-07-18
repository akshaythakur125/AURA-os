"use client";

import { useState, useMemo, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { getAllLooks } from "@/lib/shop/catalog";
import { buildRetailerUrl, type Retailer } from "@/lib/shop/linkBuilder";
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
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);

  const allLooks = useMemo(() => getAllLooks(), []);

  const filtered = useMemo(() => {
    return allLooks.filter((look) => {
      if (category && look.category !== category) return false;
      if (budget && look.price > budget) return false;
      if (goal && !look.goalTags.includes(goal)) return false;
      if (style && !look.styleArchetypes.includes(style)) return false;
      if (gender && look.gender !== gender && look.gender !== "unisex") return false;
      return true;
    });
  }, [allLooks, category, budget, goal, style, gender]);

  // Reset to first batch when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [category, budget, goal, style, gender]);

  const hasFilters = category || budget || goal || style || gender;
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
            {allLooks.length} looks · Real retailer search links · Prices verified
          </p>
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
                  onClick={() => { setCategory(null); setBudget(null); setGoal(null); setStyle(null); setGender(null); }}
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
                    <ShopCategoryImage category={look.category} title={look.title} />
                    <div className="mt-3 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-[#1C1917] leading-tight">
                          {look.title}
                        </h3>
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
                    <div className="mt-3">
                      <ShopLinks look={look} />
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
