"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FunnelChart } from "@/components/admin/FunnelChart";
import { ProductConversionCard } from "@/components/admin/ProductConversionCard";
import { SeoPagePerformanceCard } from "@/components/admin/SeoPagePerformanceCard";
import { CommerceIntentPanel } from "@/components/admin/CommerceIntentPanel";
import { FunnelLeakCard } from "@/components/admin/FunnelLeakCard";
import { SourceBreakdownCard } from "@/components/admin/SourceBreakdownCard";

export default function AdminGrowthPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => setAuthenticated(sessionStorage.getItem("auracheck_admin_auth") === "true"));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { getFunnelEvents } = await import("@/lib/storage/funnelStore");
      const { computeConversionMetrics, computeProductFunnels, computeCommerceFunnel, computeSeoFunnel, computeFunnelLeaks } = await import("@/lib/analytics/conversionMetrics");
      const { getSourceBreakdown } = await import("@/lib/analytics/attribution");
      const { getRevenueRecords } = await import("@/lib/analytics/revenueAttribution");
      const events = getFunnelEvents();
      const metrics = computeConversionMetrics(events);
      const productFunnels = computeProductFunnels(events);
      const commerceFunnel = computeCommerceFunnel(events);
      const seoFunnel = computeSeoFunnel(events);
      const leaks = computeFunnelLeaks(metrics);
      const sources = getSourceBreakdown(events);
      const revenue = getRevenueRecords();
      setData({ events: events.length, metrics, productFunnels, commerceFunnel, seoFunnel, leaks, sources, revenue: revenue.length } as Record<string, unknown>);
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

  const d = data as Record<string, unknown> | null;

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Growth Analytics</h1>
          <p className="text-xs text-gray-500">Funnel, attribution, and conversion analytics</p>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse"><div className="h-5 w-40 rounded bg-white/10" /></Card>
            ))}
          </div>
        )}

        {!loading && d && (
          <>
            {/* Main funnel */}
            {d.metrics && (
              <div className="mb-8">
                <FunnelChart
                  title="Audit Funnel"
                  steps={[
                    { name: "Landing Page Visitors", count: (d.metrics as Record<string, unknown>).overall ? ((d.metrics as Record<string, unknown>).overall as Record<string, unknown>).visitors as number : 0, rate: null },
                    { name: "Audits Created", count: ((d.metrics as Record<string, unknown>).overall as Record<string, unknown>).audits as number, rate: null },
                    { name: "Free Scores Generated", count: ((d.metrics as Record<string, unknown>).overall as Record<string, unknown>).freeScores as number, rate: ((d.metrics as Record<string, unknown>).rates as Record<string, unknown>).auditToFreeScore as number },
                    { name: "₹25 Paywall Viewed", count: ((d.metrics as Record<string, unknown>).overall as Record<string, unknown>).paywallViews as number, rate: ((d.metrics as Record<string, unknown>).rates as Record<string, unknown>).freeScoreToPaywall as number },
                    { name: "Checkout Started", count: ((d.metrics as Record<string, unknown>).overall as Record<string, unknown>).checkoutStarts as number, rate: ((d.metrics as Record<string, unknown>).rates as Record<string, unknown>).paywallToCheckout as number },
                    { name: "Payment Verified", count: ((d.metrics as Record<string, unknown>).overall as Record<string, unknown>).payments as number, rate: ((d.metrics as Record<string, unknown>).rates as Record<string, unknown>).checkoutToPayment as number },
                    { name: "Product Unlocked", count: ((d.metrics as Record<string, unknown>).overall as Record<string, unknown>).unlocks as number, rate: ((d.metrics as Record<string, unknown>).rates as Record<string, unknown>).paymentToUnlock as number },
                  ]}
                />
              </div>
            )}

            {/* Product funnels + Sources row */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <ProductConversionCard funnels={((d.productFunnels || []) as unknown) as React.ComponentProps<typeof ProductConversionCard>["funnels"]} />
              <SourceBreakdownCard sources={((d.sources || []) as unknown) as React.ComponentProps<typeof SourceBreakdownCard>["sources"]} title="Revenue by Source" />
            </div>

            {/* Funnel leaks */}
            {d.leaks && (
              <div className="mb-8">
                <FunnelLeakCard leaks={(d.leaks as unknown) as React.ComponentProps<typeof FunnelLeakCard>["leaks"]} />
              </div>
            )}

            {/* SEO + Commerce row */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <SeoPagePerformanceCard seoFunnel={((d.seoFunnel || {}) as unknown) as React.ComponentProps<typeof SeoPagePerformanceCard>["seoFunnel"]} />
              <CommerceIntentPanel commerceFunnel={((d.commerceFunnel || {}) as unknown) as React.ComponentProps<typeof CommerceIntentPanel>["commerceFunnel"]} />
            </div>

            {/* Total events */}
            <Card>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Total funnel events tracked: {d.events as number}</span>
                <span className="text-gray-500">Revenue records: {d.revenue as number}</span>
              </div>
            </Card>
          </>
        )}

        {!loading && !d && (
          <Card>
            <div className="py-12 text-center text-sm text-gray-500">No funnel data yet. Events will appear as users interact with the app.</div>
          </Card>
        )}
      </div>
    </Container>
  );
}
