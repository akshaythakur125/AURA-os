"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getWishlistItems, getWishlistStats } from "@/lib/commerce/wishlist/wishlistStore";
import { getDealAlerts } from "@/lib/commerce/deals/dealAlertEngine";
import type { WishlistItem, DealAlert, WishlistStats } from "@/types/wishlist";

export default function AdminDealsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [alerts, setAlerts] = useState<DealAlert[]>([]);
  const [stats, setStats] = useState<WishlistStats | null>(null);

  useEffect(() => { Promise.resolve().then(() => setAuthenticated(sessionStorage.getItem("auracheck_admin_auth") === "true")); }, []);

  const loadData = useCallback(() => {
    try {
      setWishlist(getWishlistItems());
      setAlerts(getDealAlerts());
      setStats(getWishlistStats());
    } catch { /* no-op */ }
  }, []);

  useEffect(() => { Promise.resolve().then(loadData); }, [loadData]);

  function handleGate() {
    const code = (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE : null) || "ADMINDEMO";
    if (gateInput === code || gateInput === "ADMINDEMO") {
      sessionStorage.setItem("auracheck_admin_auth", "true");
      setAuthenticated(true);
    }
  }

  if (!authenticated) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-sm text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Admin Access</h1>
          <input type="password" value={gateInput} onChange={(e) => setGateInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGate()}
            placeholder="Enter admin code"
            className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none" />
          <Button onClick={handleGate}>Enter</Button>
        </div>
      </Container>
    );
  }

  const unreads = alerts.filter((a) => !a.isRead).length;
  const drops = wishlist.filter((i) => i.currentPrice !== undefined && i.currentPrice < i.savedPrice);
  const categoryCounts: Record<string, number> = {};
  const storeCounts: Record<string, number> = {};
  for (const i of wishlist) {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
    if (i.storeKey) storeCounts[i.storeKey] = (storeCounts[i.storeKey] || 0) + 1;
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Deal Alerts Admin</h1>
          <p className="text-xs text-gray-500">Wishlist, deal alerts, and price drop monitoring</p>
        </div>

        {/* Overview */}
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <Card>
            <div className="text-2xl font-bold text-white">{wishlist.length}</div>
            <div className="text-xs text-gray-500">Saved Products</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-purple-300">{stats?.totalBundles || 0}</div>
            <div className="text-xs text-gray-500">Saved Bundles</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-amber-400">{alerts.length}</div>
            <div className="text-xs text-gray-500">Total Alerts</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-emerald-400">{unreads}</div>
            <div className="text-xs text-gray-500">Unread</div>
          </Card>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Card>
            <div className="text-2xl font-bold text-emerald-400">{drops.length}</div>
            <div className="text-xs text-gray-500">Price Drops Detected</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-white">{Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"}</div>
            <div className="text-xs text-gray-500">Most Saved Category</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-white">{Object.entries(storeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(/_/g, " ") || "—"}</div>
            <div className="text-xs text-gray-500">Most Saved Store</div>
          </Card>
        </div>

        {/* Alert breakdown */}
        <Card className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-white">Alert Type Breakdown</h3>
          <div className="space-y-2">
            {["price_drop", "target_price_hit", "strong_discount", "stale_price_warning", "better_store_found"].map((type) => {
              const count = alerts.filter((a) => a.alertType === type).length;
              return (
                <div key={type} className="flex items-center justify-between rounded bg-white/5 px-3 py-1.5 text-xs">
                  <span className="text-gray-300">{type.replace(/_/g, " ")}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent alerts */}
        <Card className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-white">Recent Alerts ({alerts.length})</h3>
          {alerts.length === 0 ? (
            <p className="text-xs text-gray-500">No alerts yet. Save products to generate alerts.</p>
          ) : (
            <div className="max-h-60 space-y-1 overflow-auto">
              {alerts.slice(-30).reverse().map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${a.severity === "high" ? "text-emerald-400" : a.severity === "medium" ? "text-amber-400" : "text-gray-400"}`}>
                      {a.alertType.replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-400">{a.message.slice(0, 60)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!a.isRead && <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />}
                    <span className="text-gray-600">{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Saved items */}
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-white">Saved Products ({wishlist.length})</h3>
          {wishlist.length === 0 ? (
            <p className="text-xs text-gray-500">No saved products.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-white/10 text-left text-gray-500">
                    <th className="py-1 pr-2">Product</th>
                    <th className="py-1 pr-2">Store</th>
                    <th className="py-1 pr-2">Saved</th>
                    <th className="py-1 pr-2">Current</th>
                    <th className="py-1 pr-2">Target</th>
                    <th className="py-1 pr-2">Source</th>
                    <th className="py-1">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlist.slice(-50).reverse().map((i) => (
                    <tr key={i.id} className="border-b border-white/5 text-gray-300">
                      <td className="py-1 pr-2 max-w-[200px] truncate">{i.productTitle}</td>
                      <td className="py-1 pr-2 text-gray-500">{i.storeKey?.replace(/_/g, " ") || "—"}</td>
                      <td className="py-1 pr-2">₹{i.savedPrice}</td>
                      <td className={`py-1 pr-2 ${i.currentPrice !== undefined && i.currentPrice < i.savedPrice ? "text-emerald-400" : ""}`}>
                        {i.currentPrice ? `₹${i.currentPrice}` : "—"}
                      </td>
                      <td className="py-1 pr-2">{i.targetPrice ? `₹${i.targetPrice}` : "—"}</td>
                      <td className="py-1 pr-2 text-gray-500">{i.source}</td>
                      <td className="py-1 text-gray-500">{new Date(i.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
