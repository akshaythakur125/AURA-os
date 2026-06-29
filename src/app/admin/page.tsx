"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRODUCTS } from "@/config/products";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/product";
import { getAffiliateStats } from "@/lib/storage/affiliateStore";

export default function AdminPage() {
  const [stats] = useState(() => getAffiliateStats());

  const totalActive = useMemo(() => PRODUCTS.filter((p) => p.isActive).length, []);
  const totalSponsored = useMemo(() => PRODUCTS.filter((p) => p.isSponsored).length, []);

  return (
    <Container className="py-16">
      <SectionHeading
        title="Admin Panel"
        subtitle="Product catalog, affiliate stats, and system status."
      />

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <div className="text-xs text-gray-500">Total Products</div>
          <div className="mt-1 text-2xl font-bold text-white">{PRODUCTS.length}</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500">Active</div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">{totalActive}</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500">Sponsored</div>
          <div className="mt-1 text-2xl font-bold text-amber-400">{totalSponsored}</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500">Affiliate Clicks</div>
          <div className="mt-1 text-2xl font-bold text-purple-400">{stats.totalClicks}</div>
        </Card>
      </div>

      {/* Affiliate Stats */}
      <Card className="mb-8">
        <h3 className="mb-4 text-sm font-semibold text-white">Affiliate Click Statistics</h3>
        {stats.totalClicks === 0 ? (
          <p className="text-sm text-gray-500">No clicks recorded yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-xs text-gray-500">Clicks by Product</div>
              <div className="space-y-1.5">
                {Object.entries(stats.clicksByProduct)
                  .sort(([, a], [, b]) => b - a)
                  .map(([pid, count]) => {
                    const product = PRODUCTS.find((p) => p.id === pid);
                    return (
                      <div key={pid} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{product?.title || pid}</span>
                        <span className="text-gray-500">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs text-gray-500">Clicks by Source</div>
              <div className="space-y-1.5">
                {Object.entries(stats.clicksBySource)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{source}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Product Catalog */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-white">Product Catalog ({PRODUCTS.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="pb-2 pr-4 font-medium">Title</th>
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Price</th>
                <th className="pb-2 pr-4 font-medium">Active</th>
                <th className="pb-2 pr-4 font-medium">Sponsored</th>
                <th className="pb-2 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.filter((p) => p.isActive).map((p) => (
                <tr key={p.id} className="border-b border-white/5 text-gray-300">
                  <td className="py-2 pr-4">{p.title}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={CATEGORY_COLORS[p.category] === "premium" ? "premium" : "default"}>
                      {CATEGORY_LABELS[p.category]}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4">{p.priceLabel}</td>
                  <td className="py-2 pr-4">
                    {p.isActive ? <span className="text-emerald-400">Yes</span> : <span className="text-red-400">No</span>}
                  </td>
                  <td className="py-2 pr-4">
                    {p.isSponsored ? <span className="text-amber-400">Yes</span> : "—"}
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {p.goalTags.map((g) => (
                        <span key={g} className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500">
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-gray-600">
        Admin data is read from localStorage and the static product catalog.
        No external database is used in this MVP.
      </div>
    </Container>
  );
}
