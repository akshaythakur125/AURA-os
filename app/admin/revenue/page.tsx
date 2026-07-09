"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RevenueAttributionTable } from "@/components/admin/RevenueAttributionTable";
import { SourceBreakdownCard } from "@/components/admin/SourceBreakdownCard";
import type { RevenueSummary, RevenueAttribution } from "@/types/revenueAnalytics";

export default function AdminRevenuePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [records, setRecords] = useState<RevenueAttribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => setAuthenticated(sessionStorage.getItem("auracheck_admin_auth") === "true"));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { getRevenueSummary, getRevenueRecords } = await import("@/lib/analytics/revenueAttribution");
      setSummary(getRevenueSummary());
      setRecords(getRevenueRecords());
    } catch { /* no-op */ }
    setLoading(false);
  }, []);

  useEffect(() => { if (authenticated) { Promise.resolve().then(loadData); } }, [authenticated, loadData]);

  function handleGate() {
    const code = "ADMINDEMO";
    if (gateInput === code) {
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
            placeholder="Enter admin code" className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none" />
          <Button onClick={handleGate}>Enter</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Revenue Analytics</h1>
          <p className="text-xs text-gray-500">Revenue attribution, payment methods, and estimates</p>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse"><div className="h-5 w-40 rounded bg-white/10" /></Card>
            ))}
          </div>
        )}

        {!loading && summary && (
          <>
            {/* Summary cards */}
            <div className="mb-6 grid gap-3 sm:grid-cols-4">
              <Card>
                <div className="text-2xl font-bold text-emerald-400">₹{summary.totalRevenue}</div>
                <div className="text-xs text-gray-500">Total Revenue</div>
              </Card>
              <Card>
                <div className="text-2xl font-bold text-purple-400">₹{summary.razorpayRevenue}</div>
                <div className="text-xs text-gray-500">Razorpay</div>
              </Card>
              <Card>
                <div className="text-2xl font-bold text-amber-400">₹{summary.manualRevenue}</div>
                <div className="text-xs text-gray-500">Manual UPI</div>
              </Card>
              <Card>
                <div className="text-2xl font-bold text-white">{summary.totalOrders}</div>
                <div className="text-xs text-gray-500">Total Orders</div>
              </Card>
            </div>

            {/* Revenue by product */}
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-white">Revenue by Product</h3>
                <div className="space-y-2">
                  {Object.entries(summary.byProduct).length === 0 && <p className="text-xs text-gray-500">No revenue yet</p>}
                  {Object.entries(summary.byProduct).map(([product, amount]) => (
                    <div key={product} className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5 text-xs">
                      <span className="text-gray-300">{product.replace(/_/g, " ")}</span>
                      <span className="font-medium text-emerald-400">₹{amount}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-white">Revenue by Payment Method</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5 text-xs">
                    <span className="text-gray-300">Razorpay</span>
                    <span className="font-medium text-purple-400">₹{summary.razorpayRevenue}</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5 text-xs">
                    <span className="text-gray-300">Manual UPI</span>
                    <span className="font-medium text-amber-400">₹{summary.manualRevenue}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Verified vs estimated */}
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <Card>
                <div className="text-lg font-bold text-emerald-400">₹{summary.verifiedRevenue}</div>
                <div className="text-[10px] text-gray-500">Verified Payment Revenue</div>
              </Card>
              <Card>
                <div className="text-lg font-bold text-amber-400">₹{summary.pendingRevenue}</div>
                <div className="text-[10px] text-gray-500">Pending Review Revenue</div>
              </Card>
              <Card>
                <div className="text-lg font-bold text-blue-400">~₹{summary.estimatedAffiliateRevenue}</div>
                <div className="text-[10px] text-gray-500">Estimated Affiliate Revenue (5%)</div>
              </Card>
            </div>

            {/* Revenue by source */}
            {Object.keys(summary.bySource).length > 0 && (
              <div className="mb-6">
                <SourceBreakdownCard
                  sources={Object.entries(summary.bySource).map(([source, revenue]) => ({
                    source, visitors: 0, audits: 0, freeScores: 0, unlocks: 0, revenue, conversionRate: 0,
                  }))}
                  title="Revenue by Source"
                />
              </div>
            )}

            {/* Revenue records table */}
            <RevenueAttributionTable records={records} />

            {/* Disclaimers */}
            <Card className="mt-6 border-amber-500/10">
              <p className="text-[10px] text-gray-500">
                <strong className="text-amber-400">Note:</strong> Affiliate revenue is estimated at 5% of product revenue.
                Actual affiliate revenue depends on store commission rates and may differ.
                Revenue data is stored locally. Supabase sync is optional.
              </p>
            </Card>
          </>
        )}

        {!loading && !summary && (
          <Card>
            <div className="py-12 text-center text-sm text-gray-500">No revenue data yet. Revenue appears when products are unlocked.</div>
          </Card>
        )}
      </div>
    </Container>
  );
}
