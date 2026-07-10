"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ProductCard } from "@/components/products/ProductCard";
import { FadeInView } from "@/components/ui/FadeInView";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { PRODUCTS } from "@/config/products";
import { CATEGORY_LABELS } from "@/types/product";
import type { ProductCategory, BudgetTag, GoalTag } from "@/types/product";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];
const BUDGETS: { label: string; value: BudgetTag | null }[] = [
  { label: "Any", value: null },
  { label: "₹0–₹2,000", value: 2000 },
  { label: "₹2,000–₹5,000", value: 5000 },
  { label: "₹5,000–₹10,000", value: 10000 },
  { label: "₹10,000+", value: 25000 },
];
const GOALS: { label: string; value: GoalTag | null }[] = [
  { label: "Any Goal", value: null },
  { label: "Dating", value: "dating" },
  { label: "Instagram", value: "instagram" },
  { label: "College", value: "college" },
  { label: "Office", value: "office" },
  { label: "Glow-Up", value: "glowup" },
];

export default function ShopPage() {
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [budget, setBudget] = useState<BudgetTag | null>(null);
  const [goal, setGoal] = useState<GoalTag | null>(null);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (!p.isActive) return false;
      if (category && p.category !== category) return false;
      if (budget && !p.budgetTags.some((b) => b <= budget)) return false;
      if (goal && !p.goalTags.includes(goal)) return false;
      return true;
    });
  }, [category, budget, goal]);

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-12">
        <GlowOrb color="rgba(147, 51, 234, 0.1)" size={350} className="top-[5%] right-[5%]" delay={0} />
        <GlowOrb color="rgba(14, 165, 233, 0.06)" size={250} className="bottom-[20%] left-[10%]" delay={500} />

        {/* Hero */}
        <div className="mb-10 relative">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Upgrade Your Visual Signal
          </h1>
        <p className="mt-2 text-sm text-gray-400">
          Curated upgrades that target your biggest status leaks — without
          wasting money.
        </p>
        <p className="mt-1 text-xs text-gray-600">
          Manually curated local recommendations. Prices and links are
          placeholders in this MVP.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">Category</label>
            <select
              value={category || ""}
              onChange={(e) => setCategory(e.target.value ? (e.target.value as ProductCategory) : null)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">Budget</label>
            <select
              value={budget ?? ""}
              onChange={(e) => setBudget(e.target.value ? (Number(e.target.value) as BudgetTag) : null)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
            >
              {BUDGETS.map((b) => (
                <option key={b.label} value={b.value ?? ""}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">Goal</label>
            <select
              value={goal || ""}
              onChange={(e) => setGoal(e.target.value ? (e.target.value as GoalTag) : null)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
            >
              {GOALS.map((g) => (
                <option key={g.label} value={g.value ?? ""}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-gray-400">No products match your filters.</p>
          <button
            onClick={() => { setCategory(null); setBudget(null); setGoal(null); }}
            className="mt-3 text-xs text-purple-400 hover:text-purple-300"
          >
            Clear filters
          </button>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-xs text-gray-500">
            Showing {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <FadeInView key={p.id} delay={Math.min(i * 50, 400)}>
                <ProductCard product={p} source="shop" />
              </FadeInView>
            ))}
          </div>
        </>
      )}

      {/* Trust */}
      <Card className="mt-8 text-center relative">
        <p className="text-xs text-gray-500">
          AuraCheck does not guarantee social, dating, career, or financial
          outcomes. Prices and links are placeholders. Verify details before
          buying from any vendor.
        </p>
      </Card>
    </Container>
    </>
  );
}
