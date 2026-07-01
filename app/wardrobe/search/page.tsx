"use client";

import { useState, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchFilters } from "@/components/commerce/SearchFilters";
import { SearchResultCard } from "@/components/commerce/SearchResultCard";
import { PriceComparisonCard } from "@/components/commerce/PriceComparisonCard";
import type { CommerceSearchInput, CommerceSearchSort, CommerceSearchResponse } from "@/types/commerceSearch";
import type { WardrobeCategory, StoreKey, AuraStyleDirection, AuraLeakTag } from "@/types/commerce";

export default function WardrobeSearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [styleDirection, setStyleDirection] = useState("");
  const [auraLeakTag, setAuraLeakTag] = useState("");
  const [sort, setSort] = useState<CommerceSearchSort>("aura_best");
  const [results, setResults] = useState<CommerceSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);

    const input: CommerceSearchInput = {
      query: query || undefined,
      category: (category as WardrobeCategory) || undefined,
      storeKeys: storeFilter ? [storeFilter as StoreKey] : undefined,
      budgetMin: budgetMin ? parseInt(budgetMin, 10) : undefined,
      budgetMax: budgetMax ? parseInt(budgetMax, 10) : undefined,
      styleDirection: (styleDirection as AuraStyleDirection) || undefined,
      auraLeakTags: auraLeakTag ? [auraLeakTag as AuraLeakTag] : undefined,
      sort,
      limit: 50,
    };

    try {
      // Try API first
      const res = await fetch("/api/commerce/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        // Fallback to client-side search
        const { searchCommerceIndex } = await import("@/lib/commerce/search/searchCommerceIndex");
        const clientResult = await searchCommerceIndex(input);
        setResults(clientResult);
      }
    } catch {
      // Client-side fallback
      try {
        const { searchCommerceIndex } = await import("@/lib/commerce/search/searchCommerceIndex");
        const clientResult = await searchCommerceIndex(input);
        setResults(clientResult);
      } catch {
        setResults(null);
      }
    } finally {
      setLoading(false);
    }
  }, [query, category, budgetMin, budgetMax, storeFilter, styleDirection, auraLeakTag, sort]);

  function handlePresetSelect(presetId: string) {
    const presets = [
      { id: "dating_warm_fix", style: "dating_warm", leak: "dating_warmth_missing", category: "shirt", maxBudget: "5000" },
      { id: "college_casual_upgrade", style: "college_casual", leak: "too_plain", category: "tshirt", maxBudget: "3000" },
      { id: "corporate_sharp_look", style: "corporate_sharp", leak: "professional_mismatch", category: "shirt", maxBudget: "10000" },
      { id: "creator_bold_statement", style: "creator_bold", leak: "creator_energy_missing", category: "jacket", maxBudget: "15000" },
      { id: "premium_minimal_cleanup", style: "premium_minimal", leak: "low_premium_signal", category: "shirt", maxBudget: "8000" },
    ];

    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setStyleDirection(preset.style);
      setAuraLeakTag(preset.leak);
      setCategory(preset.category);
      setBudgetMax(preset.maxBudget);
    }
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white">Search aura-improving clothes across Indian stores</h1>
          <p className="mx-auto max-w-2xl text-sm text-gray-400">
            Find clothes by style direction, budget, and aura gap. Prices are from AuraCheck&rsquo;s catalog
            and should be verified on the store before buying.
          </p>
        </div>

        {/* Layout: filters sidebar + results */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <div>
            <Card className="sticky top-4">
              <h2 className="mb-4 text-sm font-semibold text-white">Filters</h2>
              <SearchFilters
                query={query}
                onQueryChange={setQuery}
                category={category}
                onCategoryChange={setCategory}
                budgetMin={budgetMin}
                onBudgetMinChange={setBudgetMin}
                budgetMax={budgetMax}
                onBudgetMaxChange={setBudgetMax}
                storeFilter={storeFilter}
                onStoreFilterChange={setStoreFilter}
                styleDirection={styleDirection}
                onStyleDirectionChange={setStyleDirection}
                auraLeakTag={auraLeakTag}
                onAuraLeakTagChange={setAuraLeakTag}
                sort={sort}
                onSortChange={setSort}
                onPresetSelect={handlePresetSelect}
              />
              <Button className="mt-4 w-full" onClick={doSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </Card>
          </div>

          {/* Results */}
          <div>
            {/* Search stats */}
            {results && (
              <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
                <span>{results.totalResults} results · {results.freshnessSummary.fresh} fresh prices · Source: {results.catalogSource}</span>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="mb-3 h-5 w-48 rounded bg-white/10" />
                    <div className="mb-2 h-3 w-64 rounded bg-white/5" />
                    <div className="h-3 w-32 rounded bg-white/5" />
                  </Card>
                ))}
              </div>
            )}

            {/* Results */}
            {results && !loading && (
              <>
                {/* Comparison groups */}
                {results.comparisonGroups.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-3 text-sm font-semibold text-white">Price Comparison Groups</h2>
                    <div className="space-y-3">
                      {results.comparisonGroups.slice(0, 5).map((group) => (
                        <PriceComparisonCard
                          key={group.key}
                          group={group}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Search results */}
                <h2 className="mb-3 text-sm font-semibold text-white">Results</h2>
                <div className="space-y-3">
                  {results.results.map((result, index) => (
                    <SearchResultCard
                      key={result.item.id}
                      result={result}
                      rankPosition={index + 1}
                    />
                  ))}
                </div>

                {results.results.length === 0 && (
                  <Card>
                    <div className="py-12 text-center">
                      <p className="mb-2 text-sm text-gray-400">No products match your criteria.</p>
                      <p className="text-xs text-gray-500">Try different filters, or search for a specific product name.</p>
                    </div>
                  </Card>
                )}

                {/* Freshness warnings */}
                {results.freshnessSummary.warnings.length > 0 && (
                  <Card className="mt-6 border-amber-500/20">
                    <h3 className="mb-2 text-xs font-semibold text-amber-400">Price Freshness Notes</h3>
                    <div className="space-y-1">
                      {results.freshnessSummary.warnings.map((w, i) => (
                        <p key={i} className="text-[10px] text-gray-400">{w}</p>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-gray-500">
                      AuraCheck searches its own product index, not live websites. Prices may change.
                      Verify on the store before buying. Best listed price means best price in AuraCheck&rsquo;s current catalog.
                      Sponsored items do not automatically rank first. No scraping is used.
                    </p>
                  </Card>
                )}
              </>
            )}

            {/* Initial state */}
            {!results && !loading && !searched && (
              <Card>
                <div className="py-16 text-center">
                  <p className="mb-2 text-lg text-gray-400">Search for clothes that improve your aura</p>
                  <p className="text-xs text-gray-500">
                    Use the filters to find clothes by style, budget, or aura gap.
                    Or pick a Quick Preset above to get started.
                  </p>
                </div>
              </Card>
            )}

            {/* Disclaimer */}
            {results && !loading && (
              <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-[10px] text-gray-600">
                <p>AuraCheck searches its own product index, not live websites. Prices may change. Verify on the store before buying.</p>
                <p className="mt-1">Best listed price means best price in AuraCheck&rsquo;s current catalog.</p>
                <p className="mt-1">Sponsored items do not automatically rank first. AuraCheck may earn affiliate commission from some links.</p>
                <p className="mt-1">No scraping is used.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
