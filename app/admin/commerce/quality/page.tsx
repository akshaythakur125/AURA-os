"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataQualityPanel } from "@/components/commerce/DataQualityPanel";
import { PriceFreshnessSummary } from "@/components/commerce/PriceFreshnessSummary";
import { PriceAnomalyWarnings } from "@/components/commerce/PriceAnomalyWarnings";
import type { DataQualitySummary } from "@/types/dataQuality";
import type { CommerceSearchItem } from "@/types/commerceSearch";
import type { DataQualityWarning } from "@/types/dataQuality";

export default function AdminQualityPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [summary, setSummary] = useState<DataQualitySummary | null>(null);
  const [anomalyItems, setAnomalyItems] = useState<Array<{ item: CommerceSearchItem; warnings: DataQualityWarning[] }>>([]);
  const [allItems, setAllItems] = useState<CommerceSearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    Promise.resolve().then(() => {
      setAuthenticated(sessionStorage.getItem("auracheck_admin_auth") === "true");
    });
  }, []);

  function handleGate() {
    const envCode = process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
    if (gateInput === envCode || gateInput === "ADMINDEMO") {
      sessionStorage.setItem("auracheck_admin_auth", "true");
      setAuthenticated(true);
    }
  }

  useEffect(() => {
    if (!authenticated) return;
    loadData();
  }, [authenticated]);

  async function loadData() {
    setLoading(true);
    try {
      const { buildQualitySummary } = await import("@/lib/commerce/index/searchIndexQuality");
      const { detectPriceAnomalies } = await import("@/lib/commerce/prices/priceAnomalyDetector");
      const { getSearchIndex } = await import("@/lib/storage/commerceSearchStore");

      const items = getSearchIndex();
      setAllItems(items);
      setSummary(buildQualitySummary());

      const anomalies = detectPriceAnomalies(items);
      setAnomalyItems(anomalies);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (!summary) return;
    const rows = summary.warnings.map((w) => ({
      productId: w.productId,
      warningType: w.warningType,
      severity: w.severity,
      message: w.message,
      createdAt: w.createdAt,
    }));
    const csv = [
      "productId,warningType,severity,message,createdAt",
      ...rows.map((r) =>
        `"${r.productId}","${r.warningType}","${r.severity}","${r.message.replace(/"/g, '""')}","${r.createdAt}"`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `auracheck-quality-report-${Date.now()}.csv`;
    a.click();
  }

  async function handleRebuildIndex() {
    setLoading(true);
    try {
      const { rebuildFullIndex } = await import("@/lib/commerce/index/rebuildCommerceIndex");
      const result = await rebuildFullIndex();
      alert(`Index rebuilt: ${result.totalProcessed} processed, ${result.freshnessUpdated} freshness updated`);
      loadData();
    } catch (err) {
      alert("Rebuild failed: " + (err instanceof Error ? err.message : "Unknown"));
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-sm text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Admin Access</h1>
          <input
            type="password"
            value={gateInput}
            onChange={(e) => setGateInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGate()}
            placeholder="Enter admin code"
            className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
          />
          <Button onClick={handleGate}>Enter</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Data Quality</h1>
          <p className="text-xs text-gray-500">Product index quality, freshness, and anomaly monitoring</p>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="mb-3 h-5 w-32 rounded bg-white/10" />
                <div className="mb-2 h-3 w-48 rounded bg-white/5" />
              </Card>
            ))}
          </div>
        )}

        {!loading && summary && (
          <>
            {/* Quality Panel */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-bold text-white">Quality Metrics</h2>
              <DataQualityPanel
                summary={summary}
                onExport={handleExport}
                onRebuildIndex={handleRebuildIndex}
              />
            </div>

            {/* Freshness Summary */}
            {allItems.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-bold text-white">Price Freshness</h2>
                <PriceFreshnessSummary items={allItems} />
              </div>
            )}

            {/* Anomaly Warnings */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-bold text-white">Anomaly Warnings</h2>
              <PriceAnomalyWarnings items={anomalyItems} />
            </div>
          </>
        )}

        {!loading && !summary && (
          <Card>
            <div className="py-12 text-center text-sm text-gray-500">
              No data available. Import products first or rebuild the search index.
            </div>
          </Card>
        )}
      </div>
    </Container>
  );
}
