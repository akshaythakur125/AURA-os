"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { WARDROBE_CATALOG } from "@/config/auraWardrobeCatalog";
import { STYLE_SEARCH_SUGGESTIONS } from "@/config/styleSearchSuggestions";
import { getRotatingPresets } from "@/lib/marketing/rotatingPresets";
import { getActiveStores } from "@/config/storeDirectory";
import { getButtonLabel, getClickUrl } from "@/lib/commerce/affiliateLinks";
import { trackStoreClick } from "@/lib/commerce/commerceTracking";
import { formatPrice } from "@/lib/commerce/dealScoring";
import { buildComparisonForProduct } from "@/lib/commerce/priceComparison";
import type { AuraStyleDirection, StoreKey, WardrobeCategory } from "@/types/commerce";

type TabId = "all" | "aura_wardrobe" | "best_deals" | "under_500" | "under_2000" | "full_outfit";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "General Upgrades" },
  { id: "aura_wardrobe", label: "Aura Wardrobe" },
  { id: "best_deals", label: "Best Deals" },
  { id: "under_500", label: "Under Rs 500" },
  { id: "under_2000", label: "Under Rs 2,000" },
  { id: "full_outfit", label: "Full Outfit Bundles" },
];

const CATEGORY_LABELS: Record<WardrobeCategory, string> = {
  tshirt: "T-Shirts",
  shirt: "Shirts",
  overshirt: "Overshirts",
  jeans: "Jeans",
  trousers: "Trousers",
  chinos: "Chinos",
  sneakers: "Sneakers",
  formal_shoes: "Formal Shoes",
  watch: "Watches",
  belt: "Belts",
  sunglasses: "Sunglasses",
  jacket: "Jackets",
  hoodie: "Hoodies",
  kurta: "Kurtas",
  perfume: "Perfumes",
  grooming: "Grooming",
  background_item: "Background",
  photo_accessory: "Photo Gear",
  jewellery: "Jewellery",
  wallet: "Wallets",
};

const BUDGET_OPTIONS = [
  { value: "all", label: "All Budgets" },
  { value: "500", label: "Under Rs 500" },
  { value: "2000", label: "Under Rs 2,000" },
  { value: "5000", label: "Under Rs 5,000" },
  { value: "10000", label: "Under Rs 10,000" },
];

const STYLE_OPTIONS = [
  { value: "", label: "All Styles" },
  { value: "clean_basic", label: "Clean Basic" },
  { value: "premium_minimal", label: "Premium Minimal" },
  { value: "urban_aspirational", label: "Urban Aspirational" },
  { value: "soft_luxury", label: "Soft Luxury" },
  { value: "creator_bold", label: "Creator Bold" },
  { value: "college_casual", label: "College Casual" },
  { value: "corporate_sharp", label: "Corporate Sharp" },
  { value: "dating_warm", label: "Dating Warm" },
  { value: "street_smart", label: "Street Smart" },
  { value: "ethnic_clean", label: "Ethnic Clean" },
];

function handleStoreClick(
  url: string,
  storeKey: string,
  productId: string,
  offerId: string,
  price: number,
  isAffiliate: boolean,
  source: string,
) {
  trackStoreClick(storeKey as StoreKey, productId, offerId, price, isAffiliate, source);
  window.open(url, "_blank");
}

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [budgetFilter, setBudgetFilter] = useState<string>("all");
  const [styleFilter, setStyleFilter] = useState<string>("");

  const stores = getActiveStores().filter((s) => s.isActive);

  const filtered = (function () {
    let products = WARDROBE_CATALOG.filter((p) => p.isActive);

    if (activeTab === "aura_wardrobe") {
      products = products.filter((p) => p.auraLeakTags.length > 0);
    }
    if (activeTab === "best_deals") {
      products = products.filter((p) => p.offers.some((o) => (o.discountPercent || 0) >= 30));
    }
    if (activeTab === "under_500") {
      products = products.filter((p) => p.offers.length > 0 && Math.min(...p.offers.map((o) => o.price)) <= 500);
    }
    if (activeTab === "under_2000") {
      products = products.filter((p) => p.offers.length > 0 && Math.min(...p.offers.map((o) => o.price)) <= 2000);
    }
    if (activeTab === "full_outfit") {
      const cats = new Set(
        products
          .filter((p) => ["tshirt", "shirt", "jeans", "chinos", "sneakers"].includes(p.category))
          .map((p) => p.category),
      );
      products = products.filter((p) => cats.has(p.category));
    }

    if (categoryFilter !== "all") {
      products = products.filter((p) => p.category === categoryFilter);
    }
    if (budgetFilter !== "all") {
      const max = parseInt(budgetFilter, 10);
      if (!Number.isNaN(max)) {
        products = products.filter((p) => Math.min(...p.offers.map((o) => o.price)) <= max);
      }
    }
    if (styleFilter) {
      products = products.filter((p) => p.styleDirections.includes(styleFilter as AuraStyleDirection));
    }

    return products.sort((a, b) => b.priorityScore - a.priorityScore);
  })();

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="prism-panel glow-frame shine-sweep mb-8 rounded-[34px] px-6 py-8 text-center sm:px-10">
          <h1 className="mb-3 text-3xl font-bold text-white">Everyone shopping here just found out something uncomfortable about how they look.</h1>
          <p className="mx-auto max-w-xl text-sm text-gray-400">
            They saw their score. They saw the leak. Now they&apos;re fixing it — for less than a movie ticket. Every piece here patches a real aura leak. Price-compared across 6 stores.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/wardrobe/search">Search All Products →</Link>
            </Button>
          </div>
        </div>

        <Card className="glow-frame mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Latest celebrity styles now trending</h2>
            <p className="text-xs text-gray-500">
              India + global looks mapped to Indian shopping sites in one click.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {getRotatingPresets().map((preset) => (
              <div key={preset.id} className="prism-panel float-card overflow-hidden rounded-[28px] p-3">
                <div className="overflow-hidden rounded-[22px]">
                  <Image
                    src={preset.imageSrc}
                    alt={preset.celebrity}
                    width={720}
                    height={960}
                    className="h-[260px] w-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                      {preset.region}
                    </span>
                    <span className="text-[10px] text-gray-500">{preset.trendDateLabel}</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">{preset.label}</h3>
                  <p className="mt-1 text-xs text-sky-200">{preset.celebrity}</p>
                  <p className="mt-3 text-xs leading-6 text-gray-400">{preset.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {preset.recommendedCategories.slice(0, 3).map((item) => (
                      <span key={item} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">
                        {item.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/wardrobe/search?preset=${preset.id}`}>Shop this look</Link>
                    </Button>
                    <a
                      href={preset.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center text-[11px] text-gray-500 hover:text-gray-300"
                    >
                      Source
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Choose from 100 styles</h2>
            <p className="text-xs text-gray-500">
              Users can jump into any vibe without guessing the right search words.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STYLE_SEARCH_SUGGESTIONS.map((style) => (
              <Link
                key={style.id}
                href={`/wardrobe/search?query=${encodeURIComponent(style.query)}&sort=aura_best`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-sky-300/30 hover:text-sky-200"
              >
                {style.label}
              </Link>
            ))}
          </div>
        </Card>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                activeTab === tab.id
                  ? "bg-sky-400/18 text-sky-200"
                  : "bg-white/5 text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Card className="mb-8">
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium text-gray-500">Category</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    categoryFilter === "all" ? "bg-sky-500 text-slate-950" : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  All
                </button>
                {(Object.entries(CATEGORY_LABELS) as [WardrobeCategory, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                      categoryFilter === key ? "bg-sky-500 text-slate-950" : "bg-white/5 text-gray-400 hover:bg-white/10"
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
                  {BUDGET_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setBudgetFilter(f.value)}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${
                        budgetFilter === f.value ? "bg-sky-500 text-slate-950" : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-gray-500">Style Direction</div>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setStyleFilter(f.value)}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${
                        styleFilter === f.value ? "bg-sky-500 text-slate-950" : "bg-white/5 text-gray-400 hover:bg-white/10"
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

        <div className="mb-8 space-y-4">
          {filtered.map((product) => {
            const comparison = buildComparisonForProduct(product);
            return (
              <Card key={product.id} className="float-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{product.title}</span>
                      <span className="text-xs text-gray-500">{CATEGORY_LABELS[product.category]}</span>
                      {product.isSponsored ? (
                        <Badge variant="default" className="text-[10px]">
                          Sponsored
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-400">{product.whyItImprovesAura}</p>
                    <p className="mt-1 text-xs text-gray-500">{product.stylingTip}</p>

                    {comparison ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {comparison.offersSortedByPrice.slice(0, 5).map((offer) => (
                          <button
                            key={offer.id}
                            onClick={() =>
                              handleStoreClick(
                                getClickUrl(offer),
                                offer.storeKey,
                                product.id,
                                offer.id,
                                offer.price,
                                offer.isAffiliate,
                                "shop_comparison",
                              )
                            }
                            className="rounded bg-white/5 px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-sky-200"
                          >
                            {offer.storeName}: {formatPrice(offer.price)}
                            {offer.discountPercent ? (
                              <span className="ml-1 text-emerald-400">-{offer.discountPercent}%</span>
                            ) : (
                              ""
                            )}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {comparison ? (
                      <>
                        <div className="text-2xl font-bold text-white">{formatPrice(comparison.cheapestOffer.price)}</div>
                        <div className="text-xs text-gray-500">at {comparison.cheapestOffer.storeName}</div>
                        {comparison.highestDiscountOffer ? (
                          <div className="text-xs text-emerald-400">{comparison.highestDiscountOffer.discountPercent}% off</div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>

                {comparison ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStoreClick(
                          getClickUrl(comparison.cheapestOffer),
                          comparison.cheapestOffer.storeKey,
                          product.id,
                          comparison.cheapestOffer.id,
                          comparison.cheapestOffer.price,
                          comparison.cheapestOffer.isAffiliate,
                          "shop_cheapest",
                        )
                      }
                    >
                      {getButtonLabel(comparison.cheapestOffer)}
                    </Button>
                    {comparison.bestValueOffer.storeKey !== comparison.cheapestOffer.storeKey ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleStoreClick(
                            getClickUrl(comparison.bestValueOffer),
                            comparison.bestValueOffer.storeKey,
                            product.id,
                            comparison.bestValueOffer.id,
                            comparison.bestValueOffer.price,
                            comparison.bestValueOffer.isAffiliate,
                            "shop_best_value",
                          )
                        }
                      >
                        Best value: {comparison.bestValueOffer.storeName} ({formatPrice(comparison.bestValueOffer.price)})
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <p className="mb-2 text-sm text-gray-400">No products match your filters.</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setCategoryFilter("all");
                  setBudgetFilter("all");
                  setStyleFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : null}

        <Card className="glow-frame mb-8">
          <h3 className="mb-3 text-sm font-semibold text-white">Supported Stores</h3>
          <div className="flex flex-wrap gap-2">
            {stores.filter((store) => store.homepageUrl !== "#").map((store) => (
              <a
                key={store.key}
                href={store.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-sky-300/30 hover:text-sky-200"
              >
                {store.displayName}
              </a>
            ))}
          </div>
        </Card>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-gray-600">
          <p>Best listed price in AuraCheck catalog. Verify price on store before buying.</p>
          <p className="mt-1">AuraCheck may earn affiliate commission from some links. Sponsored items do not automatically rank first.</p>
          <p className="mt-1">AuraCheck analyzes presentation, not human worth.</p>
        </div>
      </div>
    </Container>
  );
}
