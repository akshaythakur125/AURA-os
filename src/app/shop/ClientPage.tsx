"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { ShopCategoryImage } from "@/components/shop/ShopCategoryImage";
import { getShoppableLooks } from "@/lib/shop/catalog";
import { trackEvent, EVENTS } from "@/lib/analytics/events";
import { type Look, type LookCategory } from "@/lib/shop/catalogTypes";
import {
  getLookCelebritySource,
  formatIndianPrice,
  getLookDisplayDescription,
  getLookDisplayTitle,
  getLookPieceCount,
  getLookTotalPrice,
} from "@/lib/shop/lookCompositions";
import type { GoalTag, BudgetTag } from "@/types/product";
import type { StyleIntent } from "@/types/personalization";

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
  { label: "Under Rs 2,000", value: 2000 },
  { label: "Under Rs 5,000", value: 5000 },
  { label: "Under Rs 10,000", value: 10000 },
  { label: "Rs 10,000+", value: 25000 },
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

function ViewLookButton({ look }: { look: Look }) {
  return (
    <Link
      href={`/shop/look/${look.id}`}
      className="inline-flex w-full items-center justify-center rounded-lg bg-white px-3 py-2 text-xs font-medium text-black transition-opacity hover:opacity-90"
      onClick={() =>
        trackEvent(EVENTS.SHOP_LINK_CLICKED, {
          retailer: "amazon",
          lookCategory: look.category,
          exactMatch: true,
          destination: "look-detail",
        })
      }
    >
      View Full Look
    </Link>
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

  const allLooks = useMemo(() => getShoppableLooks(), []);

  const filtered = useMemo(() => {
    return allLooks.filter((look) => {
      if (category && look.category !== category) return false;
      if (budget && getLookTotalPrice(look) > budget) return false;
      if (goal && !look.goalTags.includes(goal)) return false;
      if (style && !look.styleArchetypes.includes(style)) return false;
      if (gender && look.gender !== gender && look.gender !== "unisex") return false;
      return true;
    });
  }, [allLooks, category, budget, goal, style, gender]);

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
        <GlowOrb color="rgba(147, 51, 234, 0.1)" size={350} className="top-[5%] right-[5%]" delay={0} />
        <GlowOrb color="rgba(14, 165, 233, 0.06)" size={250} className="bottom-[20%] left-[10%]" delay={500} />

        <div className="mb-10 relative">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Shop Celebrity-Inspired Looks
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Each card is a celebrity-inspired full look, not a random product. Open any look to shop every piece separately.
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {allLooks.length} looks | Exact piece links where available | Prices estimated per full look
          </p>
        </div>

        <Card className="mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs text-gray-500">Category</label>
              <select
                value={category || ""}
                onChange={(e) => setCategory((e.target.value as LookCategory) || null)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value ?? ""}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-gray-500">Budget</label>
              <select
                value={budget ?? ""}
                onChange={(e) => setBudget(e.target.value ? (Number(e.target.value) as BudgetTag) : null)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
              >
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value ?? ""}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-gray-500">Goal</label>
              <select
                value={goal || ""}
                onChange={(e) => setGoal((e.target.value as GoalTag) || null)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
              >
                {GOAL_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value ?? ""}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-gray-500">Style</label>
              <select
                value={style || ""}
                onChange={(e) => setStyle((e.target.value as StyleIntent) || null)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
              >
                {STYLE_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value ?? ""}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-gray-500">Gender</label>
              <select
                value={gender || ""}
                onChange={(e) => setGender((e.target.value as "men" | "women" | "unisex") || null)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value ?? ""}>{option.label}</option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <div className="flex items-end">
                <button
                  onClick={() => { setCategory(null); setBudget(null); setGoal(null); setStyle(null); setGender(null); }}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-sm text-gray-400">No looks match your filters.</p>
            <button
              onClick={() => { setCategory(null); setBudget(null); setGoal(null); setStyle(null); setGender(null); }}
              className="mt-3 text-xs text-purple-400 hover:text-purple-300"
            >
              Clear filters
            </button>
          </Card>
        ) : (
          <>
            <p className="mb-4 text-xs text-gray-500">
              Showing {visibleLooks.length} of {filtered.length} look{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleLooks.map((look, i) => (
                <FadeInView key={look.id} delay={Math.min(i * 50, 400)}>
                  <Card hover className="flex flex-col h-full">
                    <ShopCategoryImage category={look.category} title={getLookDisplayTitle(look)} />
                    <div className="mt-3 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white leading-tight">
                          {getLookDisplayTitle(look)}
                        </h3>
                        <span className="text-xs font-medium text-amber-400 whitespace-nowrap">
                          ~Rs {formatIndianPrice(getLookTotalPrice(look))}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {getLookDisplayDescription(look)}
                      </p>
                      {getLookCelebritySource(look) && (
                        <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-rose-300">
                          {getLookCelebritySource(look)}
                        </p>
                      )}
                      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-gray-600">
                        {getLookPieceCount(look)}-piece look
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
                      <ViewLookButton look={look} />
                    </div>
                  </Card>
                </FadeInView>
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => setVisibleCount((count) => count + BATCH_SIZE)}>
                  Load More ({filtered.length - visibleLooks.length} remaining)
                </Button>
              </div>
            )}
          </>
        )}

        <Card className="mt-8 text-center relative">
          <p className="text-xs text-gray-500">
            AuraCheck does not guarantee social, dating, career, or financial outcomes. Prices are approximate totals for the full look. Verify details before buying.
          </p>
        </Card>
      </Container>
    </>
  );
}
