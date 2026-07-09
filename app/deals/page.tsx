"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DealAlertCard } from "@/components/commerce/DealAlertCard";
import { SavedWardrobeCard } from "@/components/commerce/SavedWardrobeCard";
import type { DealAlert, WishlistItem } from "@/types/wishlist";

type FilterTab = "all" | "unread" | "price_drops" | "targets" | "discounts" | "stale";

export default function DealsPage() {
  const [alerts, setAlerts] = useState<DealAlert[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  const loadData = useCallback(async () => {
    try {
      const [{ getDealAlerts }, { getWishlistItems }] = await Promise.all([
        import("@/lib/commerce/deals/dealAlertEngine"),
        import("@/lib/commerce/wishlist/wishlistStore"),
      ]);
      setAlerts(getDealAlerts());
      setWishlist(getWishlistItems());
    } catch { /* no-op */ }
    setLoading(false);
  }, []);

  useEffect(() => { Promise.resolve().then(loadData); }, [loadData]);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "unread") return !a.isRead;
    if (filter === "price_drops") return a.alertType === "price_drop";
    if (filter === "targets") return a.alertType === "target_price_hit";
    if (filter === "discounts") return a.alertType === "strong_discount";
    if (filter === "stale") return a.alertType === "stale_price_warning";
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const itemsWithDrops = wishlist.filter((i) => i.currentPrice !== undefined && i.currentPrice < i.savedPrice);
  const strongDiscounts = wishlist.filter((i) => i.currentPrice && i.savedPrice && ((i.savedPrice - i.currentPrice) / i.savedPrice) >= 0.4);

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white">Watch Prices Before Buying</h1>
          <p className="mx-auto max-w-xl text-sm text-gray-400">
            Save products from Aura Wardrobe Finder and AuraCheck will highlight price drops, target-price hits, and better listed alternatives from its catalog.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <StatCard label="Deal Alerts" value={alerts.length} />
          <StatCard label="Unread" value={unreadCount} color="text-purple-400" />
          <StatCard label="Price Drops" value={itemsWithDrops.length} color="text-emerald-400" />
          <StatCard label="Strong Discounts" value={strongDiscounts.length} color="text-amber-400" />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(["all", "unread", "price_drops", "targets", "discounts", "stale"] as FilterTab[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs transition-all ${filter === f ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}>
              {f === "all" ? "All" : f === "unread" ? `Unread (${unreadCount})` : f.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Deal alerts */}
        {filteredAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold text-white">Alerts</h2>
            <div className="space-y-2">
              {filteredAlerts.slice(0, 30).map((alert) => (
                <DealAlertCard key={alert.id} alert={alert} onRead={loadData} />
              ))}
            </div>
          </div>
        )}

        {/* Saved items with price changes */}
        {itemsWithDrops.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold text-white">Price Drops on Saved Items</h2>
            <div className="space-y-3">
              {itemsWithDrops.slice(0, 10).map((item) => (
                <SavedWardrobeCard key={item.id} item={item} onRemove={loadData} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {alerts.length === 0 && wishlist.length === 0 && !loading && (
          <Card>
            <div className="py-12 text-center">
              <p className="mb-2 text-sm text-gray-400">No deal alerts yet.</p>
              <p className="mb-4 text-xs text-gray-500">Save products from the Wardrobe Finder or Search to start tracking price changes.</p>
              <div className="flex justify-center gap-3">
                <Button asChild><Link href="/wardrobe/search">Find Products</Link></Button>
                <Button asChild variant="outline"><Link href="/wardrobe">Wardrobe Finder</Link></Button>
              </div>
            </div>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-[10px] text-gray-600">
          <p>Deal alerts are based on AuraCheck&rsquo;s product catalog and feed snapshots. Verify final price on store.</p>
          <p className="mt-1">AuraCheck may earn affiliate commission from some outbound links. No scraping is used.</p>
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
