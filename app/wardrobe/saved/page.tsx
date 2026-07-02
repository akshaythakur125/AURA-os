"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SavedWardrobeCard } from "@/components/commerce/SavedWardrobeCard";
import { SavedBundleCard } from "@/components/commerce/SavedBundleCard";
import type { WishlistItem, SavedWardrobeBundle } from "@/types/wishlist";

export default function SavedWardrobePage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [bundles, setBundles] = useState<SavedWardrobeBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"saved" | "bundles">("saved");

  const loadData = useCallback(async () => {
    try {
      const [{ getWishlistItems }, { getSavedBundles }] = await Promise.all([
        import("@/lib/commerce/wishlist/wishlistStore"),
        import("@/lib/commerce/wishlist/savedWardrobeStore"),
      ]);
      setWishlist(getWishlistItems());
      setBundles(getSavedBundles());
    } catch { /* no-op */ }
    setLoading(false);
  }, []);

  useEffect(() => { Promise.resolve().then(loadData); }, [loadData]);

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white">Your Saved Aura Wardrobe</h1>
          <p className="mx-auto max-w-xl text-sm text-gray-400">
            Save aura-improving clothes to watch price changes before buying.
            Prices are from AuraCheck&rsquo;s catalog. Verify on store before purchasing.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button onClick={() => setTab("saved")}
            className={`rounded-full px-4 py-1.5 text-xs transition-all ${tab === "saved" ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500"}`}>
            Saved Products ({wishlist.length})
          </button>
          <button onClick={() => setTab("bundles")}
            className={`rounded-full px-4 py-1.5 text-xs transition-all ${tab === "bundles" ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500"}`}>
            Saved Bundles ({bundles.length})
          </button>
        </div>

        {/* Stats bar */}
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <StatCard label="Saved Items" value={wishlist.length} />
          <StatCard label="Price Drops" value={wishlist.filter((i) => i.currentPrice !== undefined && i.currentPrice < i.savedPrice).length} color="text-emerald-400" />
          <StatCard label="Needs Verification" value={wishlist.filter((i) => i.priceFreshness === "stale" || i.priceFreshness === "unknown").length} color="text-amber-400" />
          <StatCard label="Targets Hit" value={wishlist.filter((i) => i.targetPrice && i.currentPrice && i.currentPrice <= i.targetPrice).length} color="text-purple-400" />
        </div>

        {/* Saved products */}
        {tab === "saved" && (
          <>
            {wishlist.length === 0 && !loading ? (
              <Card>
                <div className="py-12 text-center">
                  <p className="mb-2 text-sm text-gray-400">No saved products yet.</p>
                  <p className="mb-4 text-xs text-gray-500">Save aura-improving clothes to watch price changes before buying.</p>
                  <Button asChild><Link href="/wardrobe/search">Browse Products</Link></Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {wishlist.map((item) => (
                  <SavedWardrobeCard key={item.id} item={item} onRemove={loadData} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Saved bundles */}
        {tab === "bundles" && (
          <>
            {bundles.length === 0 && !loading ? (
              <Card>
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-400">No saved outfit bundles yet.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {bundles.map((bundle) => (
                  <SavedBundleCard key={bundle.id} bundle={bundle} onRemove={loadData} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-[10px] text-gray-600">
          <p>Saved prices are from AuraCheck&rsquo;s catalog when you saved the item. Current prices are from the latest catalog snapshot.</p>
          <p className="mt-1">Deal alerts are informational. Always verify the final price on the store before buying.</p>
          <p className="mt-1">AuraCheck may earn affiliate commission from some outbound links.</p>
        </div>
      </div>
    </Container>
  );
}

function StatCard({ label, value, color = "text-white" }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg bg-white/5 p-3 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-500">{label}</div>
    </div>
  );
}
