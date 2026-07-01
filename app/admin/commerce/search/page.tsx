"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConnectorStatusCard } from "@/components/commerce/ConnectorStatusCard";
interface ConnectorStatus {
  connectorKey: string; displayName: string; sourceType: string;
  isConfigured: boolean; isActive: boolean;
  lastImportAt: string | null; lastImportCount: number | null;
  indexedProductCount: number;
  supportsLiveApi: boolean; supportsFeedImport: boolean; supportsAffiliateLinks: boolean;
  notes: string;
}
import { PriceFreshnessBadge } from "@/components/commerce/PriceFreshnessBadge";
import type { CommerceSearchInput, CommerceSearchSort } from "@/types/commerceSearch";
import type { WardrobeCategory, StoreKey, AuraStyleDirection, AuraLeakTag } from "@/types/commerce";

type AdminTab = "health" | "search_test" | "import" | "connectors" | "freshness" | "stale" | "affiliate" | "groups";

const TABS: { id: AdminTab; label: string }[] = [
  { id: "health", label: "Index Health" },
  { id: "search_test", label: "Search Test Console" },
  { id: "import", label: "Import Feed" },
  { id: "connectors", label: "Connector Status" },
  { id: "freshness", label: "Freshness Summary" },
  { id: "stale", label: "Stale Prices" },
  { id: "affiliate", label: "Missing Affiliate Links" },
  { id: "groups", label: "Comparison Groups" },
];

export default function AdminCommerceSearchPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("health");
  const [loading, setLoading] = useState(false);

  // Index health state
  const [indexHealth, setIndexHealth] = useState<{
    indexedCount: number;
    catalogSource: string;
    freshCount: number;
    staleCount: number;
    lastBuilt: string | null;
  } | null>(null);

  // Search test state
  const [testQuery, setTestQuery] = useState("");
  const [testCategory, setTestCategory] = useState("");
  const [testBudgetMin, setTestBudgetMin] = useState("");
  const [testBudgetMax, setTestBudgetMax] = useState("");
  const [testStyle, setTestStyle] = useState("");
  const [testLeak, setTestLeak] = useState("");
  const [testStore, setTestStore] = useState("");
  const [testSort, setTestSort] = useState<CommerceSearchSort>("aura_best");
  const [testResults, setTestResults] = useState<Record<string, unknown> | null>(null);

  // Import state
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Connector state
  const [connectors, setConnectors] = useState<Record<string, unknown>[] | null>(null);

  // Stale items state
  const [staleItems, setStaleItems] = useState<Record<string, unknown>[]>([]);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    try {
      const { getSearchIndexMeta, getSearchIndex, getFreshnessSummary } = await import("@/lib/storage/commerceSearchStore");
      const meta = getSearchIndexMeta();
      const index = getSearchIndex();
      const freshness = getFreshnessSummary();
      setIndexHealth({
        indexedCount: meta?.indexedCount || index.length,
        catalogSource: meta?.catalogSource || "unknown",
        freshCount: freshness.fresh,
        staleCount: freshness.stale + freshness.unknown,
        lastBuilt: meta?.builtAt || null,
      });
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStaleItems = useCallback(async () => {
    try {
      const { getStalePriceItems } = await import("@/lib/storage/commerceSearchStore");
      const items = getStalePriceItems().slice(0, 50);
      setStaleItems(items as unknown as Record<string, unknown>[]);
    } catch {
      // no-op
    }
  }, []);

  const loadConnectors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commerce/connector-status");
      const data = await res.json();
      if (data.success) {
        setConnectors(data.connectors);
      }
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "health") {
      Promise.resolve().then(loadHealth);
    } else if (activeTab === "stale") {
      Promise.resolve().then(loadStaleItems);
    } else if (activeTab === "connectors") {
      Promise.resolve().then(loadConnectors);
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRebuildIndex() {
    setLoading(true);
    try {
      const { rebuildSearchIndex } = await import("@/lib/commerce/search/buildSearchIndex");
      const result = await rebuildSearchIndex("aura-admin-internal");
      alert(`Index rebuilt: ${result.indexedCount} products indexed, ${result.warnings.length} warnings`);
      loadHealth();
    } catch (err) {
      alert("Rebuild failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchTest() {
    setLoading(true);
    try {
      const input: CommerceSearchInput = {
        query: testQuery || undefined,
        category: (testCategory as WardrobeCategory) || undefined,
        storeKeys: testStore ? [testStore as StoreKey] : undefined,
        budgetMin: testBudgetMin ? parseInt(testBudgetMin, 10) : undefined,
        budgetMax: testBudgetMax ? parseInt(testBudgetMax, 10) : undefined,
        styleDirection: (testStyle as AuraStyleDirection) || undefined,
        auraLeakTags: testLeak ? [testLeak as AuraLeakTag] : undefined,
        sort: testSort,
        limit: 20,
      };

      const { searchCommerceIndex } = await import("@/lib/commerce/search/searchCommerceIndex");
      const result = await searchCommerceIndex(input);
      setTestResults(result as unknown as Record<string, unknown>);
    } catch (err) {
      alert("Search test failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleImportFeed(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const res = await fetch("/api/commerce/import-feed", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setImportStatus(data.success
        ? `Imported ${data.importedCount} products. Total indexed: ${data.totalIndexed}`
        : `Import failed: ${data.error || "Unknown error"}`
      );
    } catch (err) {
      setImportStatus("Import error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Commerce Search Admin</h1>
          <p className="text-xs text-gray-500">Manage search index, connectors, and test search results</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                activeTab === tab.id
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-white/5 text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Health */}
        {activeTab === "health" && (
          <div className="space-y-4">
            <Card>
              <h2 className="mb-4 text-lg font-bold text-white">Search Index Health</h2>
              {indexHealth ? (
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <div className="text-2xl font-bold text-white">{indexHealth.indexedCount}</div>
                    <div className="text-xs text-gray-500">Indexed Products</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-400">{indexHealth.freshCount}</div>
                    <div className="text-xs text-gray-500">Fresh Prices</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <div className="text-2xl font-bold text-red-400">{indexHealth.staleCount}</div>
                    <div className="text-xs text-gray-500">Stale/Unknown Prices</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <div className="text-xs text-gray-400">Source: {indexHealth.catalogSource}</div>
                    <div className="text-xs text-gray-500">
                      {indexHealth.lastBuilt
                        ? `Built: ${new Date(indexHealth.lastBuilt).toLocaleString("en-IN")}`
                        : "Not built yet"}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Loading health data...</p>
              )}
              <Button className="mt-4" onClick={handleRebuildIndex} disabled={loading}>
                {loading ? "Rebuilding..." : "Rebuild Index"}
              </Button>
              <p className="mt-2 text-[10px] text-gray-500">
                Rebuilds the search index from static catalog, admin catalog, and Supabase (if configured).
              </p>
            </Card>
          </div>
        )}

        {/* Tab: Search Test Console */}
        {activeTab === "search_test" && (
          <div className="space-y-4">
            <Card>
              <h2 className="mb-4 text-lg font-bold text-white">Search Test Console</h2>
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Query</label>
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                    placeholder="e.g. white sneakers"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Category</label>
                  <select
                    value={testCategory}
                    onChange={(e) => setTestCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                  >
                    <option value="">All</option>
                    {["tshirt","shirt","overshirt","jeans","trousers","chinos","sneakers","watch","belt"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Budget Min</label>
                  <input
                    type="number"
                    value={testBudgetMin}
                    onChange={(e) => setTestBudgetMin(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Budget Max</label>
                  <input
                    type="number"
                    value={testBudgetMax}
                    onChange={(e) => setTestBudgetMax(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Style Direction</label>
                  <select
                    value={testStyle}
                    onChange={(e) => setTestStyle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                  >
                    <option value="">Any</option>
                    {["clean_basic","premium_minimal","urban_aspirational","soft_luxury","creator_bold","college_casual","corporate_sharp","dating_warm","street_smart","ethnic_clean"].map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Aura Leak</label>
                  <select
                    value={testLeak}
                    onChange={(e) => setTestLeak(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                  >
                    <option value="">Any</option>
                    {["weak_lighting","busy_background","too_plain","low_premium_signal","color_mismatch","professional_mismatch","dating_warmth_missing","creator_energy_missing"].map((l) => (
                      <option key={l} value={l}>{l.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Store</label>
                  <select
                    value={testStore}
                    onChange={(e) => setTestStore(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                  >
                    <option value="">All</option>
                    {["myntra","ajio","amazon_fashion","flipkart_fashion","tata_cliq","nykaa_fashion","meesho","snitch","souled_store","bewakoof","hm_india"].map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Sort</label>
                  <select
                    value={testSort}
                    onChange={(e) => setTestSort(e.target.value as CommerceSearchSort)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                  >
                    {["aura_best","cheapest","best_value","highest_discount","fresh_price","store_trust"].map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button onClick={handleSearchTest} disabled={loading}>
                {loading ? "Searching..." : "Test Search"}
              </Button>
            </Card>

            {testResults && (
              <Card>
                <h3 className="mb-3 text-sm font-semibold text-white">Results</h3>
                <div className="mb-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>Total: {(testResults as Record<string, unknown>).totalResults as number}</span>
                  <span>Source: {String((testResults as Record<string, unknown>).catalogSource)}</span>
                </div>
                <pre className="max-h-96 overflow-auto rounded-lg bg-black/30 p-3 text-[10px] text-gray-400">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </Card>
            )}
          </div>
        )}

        {/* Tab: Import */}
        {activeTab === "import" && (
          <Card>
            <h2 className="mb-4 text-lg font-bold text-white">Import CSV/JSON Feed</h2>
            <form onSubmit={handleImportFeed}>
              <div className="mb-4">
                <label className="mb-1 block text-xs text-gray-500">Format</label>
                <select
                  name="format"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-xs text-gray-500">Connector Key</label>
                <select
                  name="connectorKey"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                >
                  <option value="manual_json">Manual JSON</option>
                  <option value="manual_csv">Manual CSV</option>
                  <option value="generic_affiliate">Generic Affiliate Feed</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-xs text-gray-500">File (JSON or CSV)</label>
                <input
                  type="file"
                  name="file"
                  accept=".json,.csv"
                  className="w-full text-sm text-gray-400 file:mr-3 file:rounded-xl file:border-0 file:bg-purple-500/10 file:px-4 file:py-2 file:text-xs file:text-purple-300"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Importing..." : "Import"}
              </Button>
            </form>
            {importStatus && (
              <div className={`mt-4 rounded-lg p-3 text-xs ${importStatus.startsWith("Imported") ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {importStatus}
              </div>
            )}
          </Card>
        )}

        {/* Tab: Connectors */}
        {activeTab === "connectors" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Connector Status</h2>
              <Button size="sm" variant="ghost" onClick={loadConnectors}>Refresh</Button>
            </div>
            {connectors ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {(connectors as Record<string, unknown>[]).map((conn) => (
                  <ConnectorStatusCard key={conn.connectorKey as string} connector={conn as unknown as ConnectorStatus} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">{loading ? "Loading..." : "No connector data. Click refresh."}</p>
            )}
          </div>
        )}

        {/* Tab: Freshness */}
        {activeTab === "freshness" && (
          <Card>
            <h2 className="mb-4 text-lg font-bold text-white">Price Freshness Summary</h2>
            <div className="mb-4 grid gap-3 sm:grid-cols-5">
              {(["fresh","recent","stale","manual","unknown"] as const).map((status) => (
                <div key={status} className="rounded-lg bg-white/5 p-3 text-center">
                  <PriceFreshnessBadge status={status} />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Fresh: checked within 24h | Recent: within 7 days | Stale: older than 7 days |
              Manual: manually entered | Unknown: no timestamp
            </p>
          </Card>
        )}

        {/* Tab: Stale */}
        {activeTab === "stale" && (
          <Card>
            <h2 className="mb-4 text-lg font-bold text-white">Stale Price Products ({staleItems.length})</h2>
            {staleItems.length > 0 ? (
              <div className="space-y-2">
                {staleItems.map((item) => {
                  const i = item as Record<string, unknown>;
                  return (
                    <div key={i.id as string} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <div>
                        <span className="text-sm text-white">{i.originalTitle as string}</span>
                        <span className="ml-2 text-xs text-gray-500">at {i.storeName as string}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">₹{Number(i.price).toLocaleString("en-IN")}</span>
                        <PriceFreshnessBadge status={i.priceFreshness as "stale" | "unknown"} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">All prices are fresh. No stale items found.</p>
            )}
          </Card>
        )}

        {/* Tab: Missing Affiliate */}
        {activeTab === "affiliate" && (
          <Card>
            <h2 className="mb-4 text-lg font-bold text-white">Missing Affiliate Links</h2>
            <p className="mb-3 text-xs text-gray-500">
              Products without affiliate URLs. Add affiliate links to earn commission.
            </p>
            <MissingAffiliateList />
          </Card>
        )}

        {/* Tab: Comparison Groups */}
        {activeTab === "groups" && (
          <Card>
            <h2 className="mb-4 text-lg font-bold text-white">Comparison Groups</h2>
            <p className="mb-3 text-xs text-gray-500">
              Groups with only 1 item cannot be compared. Add more products to these groups.
            </p>
            <ComparisonGroupList />
          </Card>
        )}
      </div>
    </Container>
  );
}

function MissingAffiliateList() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  useEffect(() => {
    import("@/lib/storage/commerceSearchStore").then((m) => {
      setItems(m.getMissingAffiliateItems().slice(0, 50) as unknown as Record<string, unknown>[]);
    });
  }, []);

  if (items.length === 0) return <p className="text-sm text-gray-400">All products have affiliate links.</p>;

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id as string} className="rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-400">
          {item.originalTitle as string} <span className="text-xs text-gray-600">at {item.storeName as string}</span>
        </div>
      ))}
    </div>
  );
}

function ComparisonGroupList() {
  const [groups, setGroups] = useState<{ key: string; count: number }[]>([]);
  useEffect(() => {
    import("@/lib/storage/commerceSearchStore").then((m) => {
      setGroups(m.getInvalidComparisonGroups().slice(0, 50));
    });
  }, []);

  if (groups.length === 0) return <p className="text-sm text-gray-400">All comparison groups are valid.</p>;

  return (
    <div className="space-y-2">
      {groups.map((g) => (
        <div key={g.key} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
          <span className="text-gray-400">{g.key}</span>
          <span className="text-xs text-gray-500">{g.count} item{g.count > 1 ? "s" : ""}</span>
        </div>
      ))}
    </div>
  );
}
