"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRODUCTS } from "@/config/products";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/product";
import { getAffiliateStats, getAffiliateClicks } from "@/lib/storage/affiliateStore";
import { getOrders, updateOrder, deleteOrder, getOrderStats } from "@/lib/storage/orderStore";
import { getAuditStats, getAudits } from "@/lib/storage/auditStore";
import { getAnalyticsSummary, clearAnalytics } from "@/lib/storage/analyticsStore";
import { generateUnlockCode } from "@/lib/payments/unlockCodeGenerator";
import { downloadJson } from "@/lib/export/downloadJson";
import { jsonToCsv, downloadCsv } from "@/lib/export/csv";
import type { ManualOrder } from "@/types/order";

function getAdminCode(): string {
  if (typeof process !== "undefined" && process.env && (process.env as Record<string, string | undefined>).NEXT_PUBLIC_LOCAL_ADMIN_CODE) {
    return (process.env as Record<string, string | undefined>).NEXT_PUBLIC_LOCAL_ADMIN_CODE as string;
  }
  return "ADMINDEMO";
}

const STATUS_BADGE: Record<string, "default" | "success" | "warning" | "danger" | "premium"> = {
  draft: "default",
  payment_pending: "warning",
  payment_submitted: "success",
  code_sent: "premium",
  unlocked: "premium",
  cancelled: "danger",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  function handleSubmit() {
    if (code.trim().toUpperCase() === getAdminCode().toUpperCase()) {
      sessionStorage.setItem("auracheck_admin_auth", "true");
      onUnlock();
    } else {
      setError("Invalid admin code.");
    }
  }
  return (
    <Container className="py-24">
      <Card className="mx-auto max-w-sm py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10" /></svg>
        </div>
        <h2 className="mb-2 text-lg font-bold text-white">Admin Access</h2>
        <p className="mb-6 text-xs text-gray-500">Enter the local admin code to access the panel. This is not secure — for local MVP testing only.</p>
        <input type="password" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="Admin code" className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none" />
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <Button onClick={handleSubmit} className="w-full">Unlock Admin Panel</Button>
        <p className="mt-4 text-xs text-gray-600">⚠ This is a local-only MVP admin panel. No real authentication.</p>
      </Card>
    </Container>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("auracheck_admin_auth") === "true";
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const orders = useMemo(() => {
    if (!authenticated) return [];
    return getOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, refreshKey]);

  const orderStats = useMemo(() => {
    if (!authenticated) return null;
    return getOrderStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, refreshKey]);

  const auditStats = useMemo(() => {
    if (!authenticated) return null;
    return getAuditStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, refreshKey]);

  const affiliateStats = useMemo(() => {
    if (!authenticated) return null;
    return getAffiliateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, refreshKey]);

  const analyticsSummary = useMemo(() => {
    if (!authenticated) return null;
    return getAnalyticsSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, refreshKey]);

  const totalActive = useMemo(() => PRODUCTS.filter((p) => p.isActive).length, []);
  const totalSponsored = useMemo(() => PRODUCTS.filter((p) => p.isSponsored).length, []);

  function handleGenerateCode(order: ManualOrder) {
    const code = generateUnlockCode(order.auditId, order.productType);
    updateOrder(order.id, { generatedUnlockCode: code, status: "code_sent" });
    setRefreshKey((k) => k + 1);
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
  }

  function handleMarkStatus(orderId: string, status: ManualOrder["status"]) {
    updateOrder(orderId, { status } as Partial<ManualOrder>);
    setRefreshKey((k) => k + 1);
  }

  function handleDeleteOrder(orderId: string) {
    if (!window.confirm("Delete this order?")) return;
    deleteOrder(orderId);
    setRefreshKey((k) => k + 1);
  }

  function handleExportOrdersJSON() {
    downloadJson(orders, `auracheck-orders-${new Date().toISOString().slice(0, 10)}.json`);
  }

  function handleExportOrdersCSV() {
    const rows = orders.map((o) => ({
      id: o.id,
      auditId: o.auditId,
      productType: o.productType,
      productName: o.productName,
      amount: o.amount,
      status: o.status,
      customerName: o.customerName || "",
      customerContact: o.customerContact || "",
      upiTransactionRef: o.upiTransactionRef || "",
      generatedUnlockCode: o.generatedUnlockCode || "",
      createdAt: o.createdAt,
      unlockedAt: o.unlockedAt || "",
    }));
    const csv = jsonToCsv(rows);
    downloadCsv(csv, `auracheck-orders-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function handleExportAuditsCSV() {
    if (typeof window === "undefined") return;
    const audits = getAudits();
    const rows = audits.map((a) => ({
      id: a.id,
      auditType: a.auditType,
      goal: a.goal,
      budgetRange: a.budgetRange,
      reportStatus: a.reportStatus,
      unlockStatus: a.unlockStatus,
      freeScore: a.freeScore ?? "",
      fullScore: a.fullScore ?? "",
      unlockedProducts: Array.isArray(a.unlockedProducts) ? (a.unlockedProducts as string[]).join(";") : "",
      createdAt: a.createdAt,
    }));
    const csv = jsonToCsv(rows);
    downloadCsv(csv, `auracheck-audits-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function handleExportAffiliateCSV() {
    const clicks = getAffiliateClicks();
    const rows = clicks.map((c) => ({
      id: c.id,
      productId: c.productId,
      auditId: c.auditId || "",
      source: c.source,
      clickedAt: c.clickedAt,
    }));
    const csv = jsonToCsv(rows);
    downloadCsv(csv, `auracheck-affiliate-clicks-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  if (!authenticated) {
    return <AdminGate onUnlock={() => setAuthenticated(true)} />;
  }

  return (
    <Container className="py-16">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <SectionHeading title="Admin Panel" subtitle="Orders, analytics, unlock codes, and exports." />
        <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem("auracheck_admin_auth"); setAuthenticated(false); }}>
          Lock Admin
        </Button>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card><div className="text-xs text-gray-500">Total Orders</div><div className="mt-1 text-2xl font-bold text-white">{orderStats?.totalOrders ?? 0}</div></Card>
        <Card><div className="text-xs text-gray-500">Payment Submitted</div><div className="mt-1 text-2xl font-bold text-amber-400">{orderStats?.paymentSubmitted ?? 0}</div></Card>
        <Card><div className="text-xs text-gray-500">Unlocked</div><div className="mt-1 text-2xl font-bold text-emerald-400">{orderStats?.unlockedOrders ?? 0}</div></Card>
        <Card><div className="text-xs text-gray-500">Cancelled</div><div className="mt-1 text-2xl font-bold text-red-400">{orderStats?.cancelledOrders ?? 0}</div></Card>
        <Card><div className="text-xs text-gray-500">Expected Revenue</div><div className="mt-1 text-2xl font-bold text-white">₹{orderStats?.totalExpectedRevenue ?? 0}</div></Card>
        <Card><div className="text-xs text-gray-500">Unlocked Revenue</div><div className="mt-1 text-2xl font-bold text-emerald-400">₹{orderStats?.totalUnlockedRevenue ?? 0}</div></Card>
        <Card><div className="text-xs text-gray-500">Total Audits</div><div className="mt-1 text-2xl font-bold text-white">{auditStats?.totalAudits ?? 0}</div></Card>
        <Card><div className="text-xs text-gray-500">Total Unlocked</div><div className="mt-1 text-2xl font-bold text-purple-400">{auditStats?.unlockedReports ?? 0}</div></Card>
      </div>

      {/* ─── Products Summary ─── */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card><div className="text-xs text-gray-500">Products</div><div className="mt-1 text-2xl font-bold text-white">{PRODUCTS.length}</div></Card>
        <Card><div className="text-xs text-gray-500">Active</div><div className="mt-1 text-2xl font-bold text-emerald-400">{totalActive}</div></Card>
        <Card><div className="text-xs text-gray-500">Sponsored</div><div className="mt-1 text-2xl font-bold text-amber-400">{totalSponsored}</div></Card>
        <Card><div className="text-xs text-gray-500">Affiliate Clicks</div><div className="mt-1 text-2xl font-bold text-purple-400">{affiliateStats?.totalClicks ?? 0}</div></Card>
      </div>

      {/* ─── Analytics ─── */}
      <Card className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Local Analytics</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { clearAnalytics(); setRefreshKey((k) => k + 1); }}>Clear</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Total Events</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.totalEvents ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Free Scores</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.freeScoreGenerated ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Unlock Views</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.unlockPageViewed ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Payment Reqs</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.paymentRequestSaved ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Unlocks</div>
            <div className="mt-1 text-lg font-bold text-emerald-400">{analyticsSummary?.productUnlocked ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Share Downloads</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.shareCardDownloaded ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Affiliate Clicks</div>
            <div className="mt-1 text-lg font-bold text-amber-400">{analyticsSummary?.affiliateClicked ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Printed</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.reportPrinted ?? 0}</div>
          </div>
        </div>
        {(analyticsSummary?.freeScoreGenerated ?? 0) > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
              <div className="text-xs text-gray-500">Payment Req / Free Score</div>
              <div className="mt-1 text-lg font-bold text-purple-300">{analyticsSummary?.conversionEstimate.paymentRequestsPerFreeScore ?? "—"}</div>
            </div>
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
              <div className="text-xs text-gray-500">Unlocks / Payment Req</div>
              <div className="mt-1 text-lg font-bold text-purple-300">{analyticsSummary?.conversionEstimate.unlocksPerPaymentRequest ?? "—"}</div>
            </div>
          </div>
        )}
      </Card>

      {/* ─── Manual Orders Table ─── */}
      <Card className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Manual Orders ({orders.length})</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportOrdersJSON}>Export JSON</Button>
            <Button variant="secondary" size="sm" onClick={handleExportOrdersCSV}>Export CSV</Button>
            <Button variant="ghost" size="sm" onClick={handleExportAuditsCSV}>Audits CSV</Button>
            <Button variant="ghost" size="sm" onClick={handleExportAffiliateCSV}>Affiliate CSV</Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="pb-2 pr-3 font-medium">Order</th>
                  <th className="pb-2 pr-3 font-medium">Audit</th>
                  <th className="pb-2 pr-3 font-medium">Product</th>
                  <th className="pb-2 pr-3 font-medium">Amount</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 pr-3 font-medium">Customer</th>
                  <th className="pb-2 pr-3 font-medium">UPI Ref</th>
                  <th className="pb-2 pr-3 font-medium">Code</th>
                  <th className="pb-2 pr-3 font-medium">Created</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 text-gray-300">
                    <td className="py-2 pr-3 text-[10px] text-gray-500">{o.id.slice(0, 8)}</td>
                    <td className="py-2 pr-3 text-[10px] text-gray-500">{o.auditId.slice(0, 8)}</td>
                    <td className="py-2 pr-3">{o.productName}</td>
                    <td className="py-2 pr-3 text-amber-400">₹{o.amount}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={STATUS_BADGE[o.status] || "default"}>{o.status.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="py-2 pr-3">
                      <div>{o.customerName || "—"}</div>
                      {o.customerContact && <div className="text-[10px] text-gray-500">{o.customerContact}</div>}
                    </td>
                    <td className="py-2 pr-3 text-[10px] text-gray-500">{o.upiTransactionRef || "—"}</td>
                    <td className="py-2 pr-3">
                      {o.generatedUnlockCode ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[10px] text-purple-300">{o.generatedUnlockCode}</span>
                          <button onClick={() => handleCopyCode(o.generatedUnlockCode!)} className="text-[10px] text-gray-500 hover:text-purple-300">Copy</button>
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-[10px] text-gray-500">{formatDate(o.createdAt)}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {!o.generatedUnlockCode && (
                          <button onClick={() => handleGenerateCode(o)} className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] text-purple-300 hover:bg-purple-500/30">
                            Generate Code
                          </button>
                        )}
                        {o.status !== "unlocked" && o.status !== "cancelled" && (
                          <>
                            <button onClick={() => handleMarkStatus(o.id, "unlocked")} className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 hover:bg-emerald-500/30">
                              Unlock
                            </button>
                            <button onClick={() => handleMarkStatus(o.id, "cancelled")} className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-300 hover:bg-red-500/30">
                              Cancel
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDeleteOrder(o.id)} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-white/10">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ─── Affiliate Stats ─── */}
      <Card className="mb-8">
        <h3 className="mb-4 text-sm font-semibold text-white">Affiliate Click Statistics</h3>
        {!affiliateStats || affiliateStats.totalClicks === 0 ? (
          <p className="text-sm text-gray-500">No clicks recorded yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-xs text-gray-500">Clicks by Product</div>
              <div className="space-y-1.5">
                {Object.entries(affiliateStats.clicksByProduct).sort(([, a], [, b]) => b - a).map(([pid, count]) => {
                  const product = PRODUCTS.find((p) => p.id === pid);
                  return <div key={pid} className="flex items-center justify-between text-xs"><span className="text-gray-300">{product?.title || pid}</span><span className="text-gray-500">{count}</span></div>;
                })}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs text-gray-500">Clicks by Source</div>
              <div className="space-y-1.5">
                {Object.entries(affiliateStats.clicksBySource).sort(([, a], [, b]) => b - a).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between text-xs"><span className="text-gray-300">{source}</span><span className="text-gray-500">{count}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ─── Product Catalog ─── */}
      <Card className="mb-8">
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
                  <td className="py-2 pr-4"><Badge variant={CATEGORY_COLORS[p.category] === "premium" ? "premium" : "default"}>{CATEGORY_LABELS[p.category]}</Badge></td>
                  <td className="py-2 pr-4">{p.priceLabel}</td>
                  <td className="py-2 pr-4">{p.isActive ? <span className="text-emerald-400">Yes</span> : <span className="text-red-400">No</span>}</td>
                  <td className="py-2 pr-4">{p.isSponsored ? <span className="text-amber-400">Yes</span> : "—"}</td>
                  <td className="py-2"><div className="flex flex-wrap gap-1">{p.goalTags.map((g) => (<span key={g} className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500">{g}</span>))}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-gray-600">
        ⚠ This admin panel is a local-only MVP tool. No real authentication. No external database. Data is read from localStorage.
      </div>
    </Container>
  );
}
