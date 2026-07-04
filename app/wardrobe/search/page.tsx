"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
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
import { STYLE_SEARCH_SUGGESTIONS, type StyleSearchSuggestion } from "@/config/styleSearchSuggestions";
import { getRotatingPresets } from "@/lib/marketing/rotatingPresets";
import { buildStoreSearchUrl } from "@/config/storeDirectory";

// Stores worth linking a whole style search to. Native search pages always
// resolve, so these links work for any style label.
const STYLE_STORE_LINKS: { key: StoreKey; name: string }[] = [
  { key: "myntra", name: "Myntra" },
  { key: "amazon_fashion", name: "Amazon" },
  { key: "ajio", name: "AJIO" },
  { key: "flipkart_fashion", name: "Flipkart" },
];

function WardrobeSearchContent() {
  const searchParams = useSearchParams();
  const presetParam = searchParams.get("preset");
  const activePreset = presetParam
    ? CELEBRITY_TREND_PRESETS.find((item) => item.id === presetParam)
    : undefined;
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
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const selectedStyle: StyleSearchSuggestion | undefined = selectedStyleId
    ? STYLE_SEARCH_SUGGESTIONS.find((s) => s.id === selectedStyleId)
    : undefined;

  // Core search runner. Takes an explicit input so chip clicks can search
  // immediately without waiting for state updates to land.
  const runSearch = useCallback(async (input: CommerceSearchInput) => {
    setLoading(true);
    setSearched(true);

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
  }, []);

  const doSearch = useCallback(async () => {
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
    await runSearch(input);
  }, [query, category, budgetMin, budgetMax, storeFilter, styleDirection, auraLeakTag, sort, runSearch]);

  // Style chip click: search that style client-side and bring the results
  // into view directly below the chips — no page reload.
  function handleStyleSelect(style: StyleSearchSuggestion) {
    setSelectedStyleId(style.id);
    setQuery(style.query);
    setSort("aura_best");
    void runSearch({ query: style.query, sort: "aura_best", limit: 50 });
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/wardrobe/search?styleId=${style.id}`);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  useEffect(() => {
    if (initializedFromUrl) return;

    const queryParam = searchParams.get("query") || "";
    const categoryParam = searchParams.get("category") || "";
    const budgetMaxParam = searchParams.get("maxBudget") || "";
    const styleParam = searchParams.get("style") || "";
    const leakParam = searchParams.get("leak") || "";
    const sortParam = searchParams.get("sort") as CommerceSearchSort | null;
    const presetParam = searchParams.get("preset");
    const styleIdParam = searchParams.get("styleId");

    if (styleIdParam) {
      const style = STYLE_SEARCH_SUGGESTIONS.find((s) => s.id === styleIdParam);
      if (style) {
        setSelectedStyleId(style.id);
        setQuery(style.query);
        setSort(sortParam || "aura_best");
        setInitializedFromUrl(true);
        return;
      }
    }

    if (presetParam) {
      const preset = CELEBRITY_TREND_PRESETS.find((item) => item.id === presetParam);
      if (preset) {
        setQuery(preset.searchQuery);
        setStyleDirection(preset.styleDirection);
        setAuraLeakTag(preset.auraLeakTags[0] || "");
        setBudgetMax(String(preset.budgetMax || ""));
        setSort(sortParam || "aura_best");
        setInitializedFromUrl(true);
        return;
      }
    }

    // Old-style ?query= deep links that match a style chip highlight it too
    if (queryParam) {
      const matching = STYLE_SEARCH_SUGGESTIONS.find((s) => s.query === queryParam);
      if (matching) setSelectedStyleId(matching.id);
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
      searchParams.get("styleId") ||
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

  const showResultsBlock = searched || loading;

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Focused preset header — shown when the user landed here from a
           celebrity trend card. Puts the picked look front-and-centre and
           drops the visitor straight into that preset's results below,
           instead of a wall of unrelated trend cards. */}
        {activePreset ? (
          <div className="mb-8">
            <Card className="flex flex-col gap-4 border-white/10 md:flex-row md:items-center">
              <div className="overflow-hidden rounded-[18px] md:w-[260px]">
                <Image
                  src={activePreset.imageSrc}
                  alt={activePreset.label}
                  width={720}
                  height={960}
                  className="h-[220px] w-full object-cover md:h-[240px]"
                />
              </div>
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                    {activePreset.region}
                  </span>
                  <span className="text-[10px] text-gray-500">{activePreset.trendDateLabel}</span>
                </div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">{activePreset.label}</h1>
                <p className="mt-1 text-sm text-purple-300">{activePreset.celebrity}</p>
                <p className="mt-3 max-w-2xl text-sm text-gray-400">{activePreset.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activePreset.recommendedCategories.slice(0, 5).map((item) => (
                    <span key={item} className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-gray-400">
                      {item.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="/wardrobe/search"
                    className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    Try a different look
                  </a>
                  <a
                    href={activePreset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center px-1 text-xs text-gray-500 hover:text-gray-300"
                  >
                    Source: {activePreset.sourceLabel}
                  </a>
                </div>
              </div>
            </Card>
          </div>
        ) : selectedStyleId || searchParams.get("query") ? (
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-3xl font-bold text-white">
              {selectedStyle ? `${selectedStyle.label} — shop the look` : "Search results"}
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-gray-400">
              {selectedStyle
                ? "Matching clothes from Indian stores below. Tap any store button to browse more on their site."
                : "Prices come from AuraCheck’s catalog and should be verified on the store before buying."}
            </p>
            {selectedStyle && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {STYLE_STORE_LINKS.map((store) => (
                  <a
                    key={store.key}
                    href={buildStoreSearchUrl(store.key, `${selectedStyle.label} outfit`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-sky-300/25 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-400/20"
                  >
                    {store.name}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Landing hero — shown only when no search is active. */}
            <div className="mb-8 text-center">
              <h1 className="mb-3 text-3xl font-bold text-white">Find clothes across Indian stores</h1>
              <p className="mx-auto max-w-2xl text-sm text-gray-400">
                Pick a trending look below, or tap a style — its clothes appear right underneath.
                Prices come from AuraCheck&rsquo;s catalog and should be verified on the store before buying.
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
                        href={`/wardrobe/search?preset=${preset.id}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-[linear-gradient(135deg,rgba(125,211,252,0.95),rgba(59,130,246,0.92)_45%,rgba(249,115,22,0.84))] px-4 text-sm font-semibold tracking-[-0.02em] text-slate-950 shadow-[0_18px_48px_rgba(56,189,248,0.22)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(249,115,22,0.22)]"
                      >
                        Find these clothes
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
          </>
        )}

        {/* ─── 100 styles — tap a chip, clothes appear right below ─── */}
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">100 style ideas to choose from</h2>
            <p className="text-xs text-gray-500">
              Tap any style — matching clothes load instantly just below.
            </p>
          </div>
          <Card>
            <div className="flex flex-wrap gap-2">
              {STYLE_SEARCH_SUGGESTIONS.map((style) => {
                const isActive = style.id === selectedStyleId;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleStyleSelect(style)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      isActive
                        ? "border-sky-300/60 bg-sky-400/15 font-semibold text-sky-200"
                        : "border-white/10 bg-white/5 text-gray-300 hover:border-sky-300/30 hover:text-sky-200"
                    }`}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ─── Results — directly below the style chips ─── */}
        <div ref={resultsRef} className="mb-8 scroll-mt-20">
          {showResultsBlock && (
            <>
              {/* Selected style header + real store links for that style */}
              {selectedStyle && (
                <Card className="mb-4 border-sky-400/20 bg-sky-400/[0.04]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedStyle.label} — shop the look</h2>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Matches from AuraCheck&rsquo;s catalog below, or open this exact style on a store:
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {STYLE_STORE_LINKS.map((store) => (
                        <a
                          key={store.key}
                          href={buildStoreSearchUrl(store.key, `${selectedStyle.label} outfit`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-sky-300/25 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-400/20"
                        >
                          {store.name}
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Search stats */}
              {results && !loading && (
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
                        <p className="mb-2 text-sm text-gray-400">No catalog products match this style yet.</p>
                        {selectedStyle ? (
                          <p className="text-xs text-gray-500">
                            Use the store buttons above to open {selectedStyle.label} directly on Myntra, Amazon, AJIO, or Flipkart.
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">Try different filters, or search for a specific product name.</p>
                        )}
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

                  {/* Disclaimer */}
                  <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-[10px] text-gray-600">
                    <p>AuraCheck searches its own product index, not live websites. Prices may change. Verify on the store before buying.</p>
                    <p className="mt-1">Best listed price means best price in AuraCheck&rsquo;s current catalog.</p>
                    <p className="mt-1">Sponsored items do not automatically rank first. AuraCheck may earn affiliate commission from some links.</p>
                    <p className="mt-1">No scraping is used.</p>
                  </div>
                </>
              )}
            </>
          )}

          {/* Initial state */}
          {!showResultsBlock && (
            <Card>
              <div className="py-12 text-center">
                <p className="mb-2 text-lg text-gray-400">Tap a style above to see matching clothes here</p>
                <p className="text-xs text-gray-500">
                  Or open the advanced filters below to search by category, budget, store, or aura gap.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* ─── Advanced filters — below the results, out of the way ─── */}
        <details className="mb-8">
          <summary className="cursor-pointer text-sm font-semibold text-white hover:text-sky-200">
            Advanced filters &amp; custom search
          </summary>
          <Card className="mt-3">
            <div className="max-w-xl">
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
            </div>
            <Button
              className="mt-4 w-full sm:w-auto"
              onClick={() => {
                setSelectedStyleId(null);
                void doSearch();
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </Card>
        </details>
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
