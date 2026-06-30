"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { PRODUCTS } from "@/config/products";
import { CATEGORY_LABELS } from "@/types/product";
import type { Goal } from "@/types";
import type { ProductCategory } from "@/types/product";

const BUDGET_FILTERS = [
  { value: "all", label: "All Budgets" },
  { value: "0", label: "Free" },
  { value: "2000", label: "Under ₹2,000" },
  { value: "5000", label: "Under ₹5,000" },
  { value: "10000", label: "Under ₹10,000" },
  { value: "25000", label: "₹25,000+" },
];

const GOAL_FILTERS = [
  { value: "all", label: "All Goals" },
  { value: "dating", label: "Dating" },
  { value: "instagram", label: "Instagram" },
  { value: "college", label: "College" },
  { value: "office", label: "Office" },
  { value: "glowup", label: "General Glow-Up" },
];

export default function ShopPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [budgetFilter, setBudgetFilter] = useState<string>("all");
  const [goalFilter, setGoalFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const active = PRODUCTS.filter((p) => {
      if (!p.isActive) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (budgetFilter !== "all") {
        if (budgetFilter === "0" && p.price !== 0) return false;
        else if (budgetFilter === "2000" && (p.price <= 0 || p.price > 2000)) return false;
        else if (budgetFilter === "5000" && (p.price <= 0 || p.price > 5000)) return false;
        else if (budgetFilter === "10000" && (p.price <= 0 || p.price > 10000)) return false;
        else if (budgetFilter === "25000" && p.price <= 0) return false;
      }
      if (goalFilter !== "all" && !p.goalTags.includes(goalFilter as Goal)) return false;
      return true;
    });

    // Sort by priorityScore descending
    return active.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [categoryFilter, budgetFilter, goalFilter]);

  const categories = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white">Upgrade Your Visual Signal</h1>
          <p className="mx-auto max-w-xl text-sm text-gray-400">
            Without wasting money. Every recommendation targets a specific status leak identified by your Aura Check.
          </p>
        </div>

        <Card className="mb-8">
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium text-gray-500">Category</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    categoryFilter === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  All
                </button>
                {categories.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                      categoryFilter === key
                        ? "bg-purple-600 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-medium text-gray-500">Budget</div>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setBudgetFilter(f.value)}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${
                        budgetFilter === f.value
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium text-gray-500">Goal</div>
                <div className="flex flex-wrap gap-2">
                  {GOAL_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setGoalFilter(f.value)}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${
                        goalFilter === f.value
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">{filtered.length} products</span>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              recommendation={{
                product,
                matchScore: product.priorityScore,
                reason: product.whyItWorks || "",
                linkedStatusLeak: product.statusLeakTags?.[0] || "",
                estimatedImpact: product.priorityScore >= 80 ? "High impact" : product.priorityScore >= 50 ? "Moderate" : "Low",
                priority: product.priorityScore >= 80 ? "high" : product.priorityScore >= 50 ? "medium" : "low",
              }}
              source="shop"
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <Card>
            <div className="py-12 text-center">
              <p className="mb-2 text-sm text-gray-400">No products match your filters.</p>
              <Button variant="ghost" onClick={() => { setCategoryFilter("all"); setBudgetFilter("all"); setGoalFilter("all"); }}>
                Clear Filters
              </Button>
            </div>
          </Card>
        )}

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-gray-600">
          <p>Prices and links are placeholders in this local MVP. Verify details before buying.</p>
          <p className="mt-1">AuraCheck does not guarantee social, dating, career, or financial outcomes from these products.</p>
        </div>
      </div>
    </Container>
  );
}
