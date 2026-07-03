"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchFilters } from "@/components/commerce/SearchFilters";
import { SearchResultCard } from "@/components/commerce/SearchResultCard";
import { PriceComparisonCard } from "@/components/commerce/PriceComparisonCard";
import type { CommerceSearchInput, CommerceSearchSort, CommerceSearchResponse } from "@/types/commerceSearch";
import type { WardrobeCategory, StoreKey, AuraStyleDirection, AuraLeakTag } from "@/types/commerce";
import { CELEBRITY_TREND_PRESETS } from "@/config/celebrityTrendPresets";
import { getRotatingPresets } from "@/lib/marketing/rotatingPresets";

function WardrobeSearchContent() {
  const searchParams = useSearchParams();
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
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);

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

  useEffect(() => {
    if (initializedFromUrl) return;

    const queryParam = searchParams.get("query") || "";
    const categoryParam = searchParams.get("category") || "";
    const budgetMaxParam = searchParams.get("maxBudget") || "";
    const styleParam = searchParams.get("style") || "";
    const leakParam = searchParams.get("leak") || "";
    const sortParam = searchParams.get("sort") as CommerceSearchSort | null;
    const presetParam = searchParams.get("preset");

    if (presetParam) {
      const preset = CELEBRITY_TREND_PRESETS.find((item) => item.id === presetParam);
      if (preset) {
        setQuery(preset.searchQuery);
        setStyleDirection(preset.styleDirection);
        setAuraLeakTag(preset.auraLeakTags[0] || "");
        setCategory(preset.recommendedCategories[0] || "");
        setBudgetMax(String(preset.budgetMax || ""));
        setSort(sortParam || "cheapest");
        setInitializedFromUrl(true);
        return;
      }
    }

    setQuery(queryParam);
    setCategory(categoryParam);
    setBudgetMax(budgetMaxParam);
    setStyleDirection(styleParam);
    setAuraLeakTag(leakParam);
    if (sortParam) setSort(sortParam);
    setInitializedFromUrl(true);
  }, [initializedFromUrl, searchParams]);

  useEffect(() => {
    if (!initializedFromUrl) return;
    if (searched) return;

    const hasPreset = searchParams.get("preset");
    const hasDirectFilters =
      searchParams.get("query") ||
      searchParams.get("category") ||
      searchParams.get("maxBudget") ||
      searchParams.get("style") ||
      searchParams.get("leak");

    if (hasPreset || hasDirectFilters) {
      void doSearch();
    }
  }, [initializedFromUrl, searched, searchParams, doSearch]);

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

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Latest celebrity trend presets</h2>
              <p className="text-xs text-gray-500">
                One click opens a current trend-inspired search with multi-site Indian price comparison.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {getRotatingPresets().map((preset) => (
              <Card key={preset.id} className="flex flex-col gap-4">
                <div className="overflow-hidden rounded-[18px]">
                  <Image
                    src={preset.imageSrc}
                    alt={preset.label}
                    width={720}
                    height={960}
                    className="h-[220px] w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                    {preset.region}
                  </span>
                  <span className="text-[10px] text-gray-500">{preset.trendDateLabel}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{preset.label}</h3>
                  <p className="mt-1 text-xs text-purple-300">{preset.celebrity}</p>
                </div>
                <p className="text-sm text-gray-400">{preset.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {preset.recommendedCategories.slice(0, 3).map((item) => (
                    <span key={item} className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-gray-400">
                      {item.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex flex-col gap-2">
                  <a
                    href={`/wardrobe/search?preset=${preset.id}&sort=cheapest`}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-[linear-gradient(135deg,rgba(125,211,252,0.95),rgba(59,130,246,0.92)_45%,rgba(249,115,22,0.84))] px-4 text-sm font-semibold tracking-[-0.02em] text-slate-950 shadow-[0_18px_48px_rgba(56,189,248,0.22)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(249,115,22,0.22)]"
                  >
                    Compare cheapest now
                  </a>
                  <a
                    href={preset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center text-[11px] text-gray-500 hover:text-gray-300"
                  >
                    Source: {preset.sourceLabel}
                  </a>
                </div>
              </Card>
            ))}
          </div>
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

export default function WardrobeSearchPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-8 sm:py-12">
          <Card>
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">Loading wardrobe search...</p>
            </div>
          </Card>
        </Container>
      }
    >
      <WardrobeSearchContent />
    </Suspense>
  );
}
