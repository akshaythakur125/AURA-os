"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useState, useEffect } from "react";
import { getOrders, updateOrder, deleteOrder, getOrderStats } from "@/lib/storage/orderStore";
import { getAudits } from "@/lib/storage/auditStore";
import { getAnalyticsSummary, clearAnalytics, getEvents } from "@/lib/storage/analyticsStore";
import { generateUnlockCode } from "@/lib/payments/unlockCodeGenerator";
import { downloadCSV } from "@/lib/export/csv";
import { downloadJSON } from "@/lib/export/downloadJson";
import type { ManualOrder, OrderStatus } from "@/types/order";
import { getLeads, deleteLead, clearLeads } from "@/lib/storage/leadStore";
import { OFFERS } from "@/config/offers";
import { getOrCreateReferralProfile, getReferralClaims } from "@/lib/storage/referralStore";
import { getChallengeEntries } from "@/lib/storage/challengeStore";
import { CHALLENGES } from "@/config/challenges";
import { getProgressComparisons, getProgressStats } from "@/lib/storage/progressStore";
import { getTwinStats } from "@/lib/storage/auraTwinStore";
import { getHabitStats } from "@/lib/storage/habitStore";
import { getItem, setItem } from "@/lib/storage/localStore";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getCommerceAnalytics, getCommerceClicks } from "@/lib/storage/commerceClickStore";
import { getEffectiveCatalog } from "@/lib/storage/commerceCatalogStore";
import { getAffiliateLinks } from "@/lib/commerce/affiliateManager";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Draft",
  payment_pending: "Payment Pending",
  payment_submitted: "Payment Submitted",
  code_sent: "Code Sent",
  unlocked: "Unlocked",
  cancelled: "Cancelled",
};

const ORDER_STATUS_VARIANTS: Record<OrderStatus, "default" | "warning" | "success" | "premium" | "danger"> = {
  draft: "default",
  payment_pending: "warning",
  payment_submitted: "success",
  code_sent: "premium",
  unlocked: "success",
  cancelled: "danger",
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("auracheck_admin_auth") === "true";
  });
  const [codeInput, setCodeInput] = useState("");
  const [orders, setOrders] = useState(() => getOrders());
  const [audits] = useState(() => getAudits());
  const [analytics] = useState(() => getAnalyticsSummary());
  const [leads, setLeads] = useState(() => getLeads());
  const [referralProfile] = useState(() => getOrCreateReferralProfile());
  const [referralClaims] = useState(() => getReferralClaims());
  const [challengeEntries] = useState(() => getChallengeEntries());
  const [progressComparisons] = useState(() => getProgressComparisons());
  const [progressStats] = useState(() => getProgressStats());
  const [twinStats] = useState(() => getTwinStats());
  const [habitStats] = useState(() => getHabitStats());
  const [activeTab, setActiveTab] = useState<"orders" | "analytics" | "leads" | "funnel" | "commerce" | "growth" | "export" | "checklist">("orders");
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => getItem<Record<string, boolean>>("auracheck:v1:founder_checklist", {}));
  function toggleChecklistItem(key: string) {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    setItem("auracheck:v1:founder_checklist", next);
  }
  const [toast, setToast] = useState<string | null>(null);

  function refresh() {
    setOrders(getOrders());
    setLeads(getLeads());
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleLogin() {
    const adminCode = process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE || "ADMINDEMO";
    if (codeInput === adminCode) {
      sessionStorage.setItem("auracheck_admin_auth", "true");
      setAuthenticated(true);
    }
  }

  function handleGenerateCode(order: ManualOrder) {
    const code = generateUnlockCode(order.auditId, order.productType);
    updateOrder(order.id, { generatedUnlockCode: code, status: "code_sent" });
    refresh();
    showToast(`Code generated: ${code}`);
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    showToast("Code copied!");
  }

  function handleMarkSent(order: ManualOrder) {
    updateOrder(order.id, { status: "code_sent" });
    refresh();
    showToast("Marked as code sent");
  }

  function handleCancel(order: ManualOrder) {
    updateOrder(order.id, { status: "cancelled" });
    refresh();
    showToast("Order cancelled");
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this order permanently?")) return;
    deleteOrder(id);
    refresh();
    showToast("Order deleted");
  }

  function handleExportOrdersCSV() {
    const rows = orders.map((o) => ({
      id: o.id,
      auditId: o.auditId,
      product: o.productName,
      amount: o.amount,
      status: o.status,
      customerName: o.customerName || "",
      customerContact: o.customerContact || "",
      upiRef: o.upiTransactionRef || "",
      unlockCode: o.generatedUnlockCode || "",
      created: o.createdAt,
      unlockedAt: o.unlockedAt || "",
    }));
    downloadCSV(rows, `auracheck-orders-${Date.now()}.csv`);
    showToast("Orders CSV downloaded");
  }

  function handleExportOrdersJSON() {
    downloadJSON(orders, `auracheck-orders-${Date.now()}.json`);
    showToast("Orders JSON downloaded");
  }

  function handleExportAuditsCSV() {
    const rows = audits.map((a) => ({
      id: a.id,
      type: a.auditType,
      goal: a.goal,
      budget: a.budgetRange,
      score: a.freeScore ?? "",
      fullScore: a.fullScore ?? "",
      status: a.reportStatus,
      unlockedProducts: (a.unlockedProducts || []).join("; "),
      created: a.createdAt,
    }));
    downloadCSV(rows, `auracheck-audits-${Date.now()}.csv`);
    showToast("Audits CSV downloaded");
  }

  function handleExportAnalyticsCSV() {
    const events = getEvents();
    const rows = events.map((e) => ({
      event: e.event,
      metadata: e.metadata ? JSON.stringify(e.metadata) : "",
      timestamp: e.timestamp,
    }));
    downloadCSV(rows, `auracheck-analytics-${Date.now()}.csv`);
    showToast("Analytics CSV downloaded");
  }

  if (!authenticated) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-sm">
          <Card>
            <h1 className="mb-2 text-xl font-bold text-white">Admin Access</h1>
            <p className="mb-4 text-xs text-gray-500">Local admin gate is for MVP testing only, not production security.</p>
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter admin code"
              className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
            />
            <button
              onClick={handleLogin}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-500 hover:to-pink-400"
            >
              Login
            </button>
          </Card>
        </div>
      </Container>
    );
  }

  const stats = getOrderStats();

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <Badge variant={isSupabaseConfigured() ? "success" : "default"}>
              {isSupabaseConfigured() ? "Storage: Supabase" : "Storage: Local browser"}
            </Badge>
            <button onClick={() => { refresh(); showToast("Refreshed"); }} className="text-xs text-gray-500 hover:text-gray-300">Refresh</button>
            <button onClick={() => { sessionStorage.removeItem("auracheck_admin_auth"); setAuthenticated(false); }} className="text-xs text-gray-500 hover:text-gray-300">Logout</button>
          </div>
        </div>

        {/* ─── Toast ─── */}
        {toast && (
          <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">{toast}</div>
        )}

        {/* ─── Stats ─── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Card><div className="text-xs text-gray-500">Total Orders</div><div className="mt-1 text-3xl font-bold text-white">{stats.totalOrders}</div></Card>
          <Card><div className="text-xs text-gray-500">Payment Submitted</div><div className="mt-1 text-3xl font-bold text-amber-400">{stats.paymentSubmitted}</div></Card>
          <Card><div className="text-xs text-gray-500">Unlocked</div><div className="mt-1 text-3xl font-bold text-emerald-400">{stats.unlockedOrders}</div></Card>
          <Card><div className="text-xs text-gray-500">Cancelled</div><div className="mt-1 text-3xl font-bold text-red-400">{stats.cancelledOrders}</div></Card>
          <Card><div className="text-xs text-gray-500">Expected Revenue</div><div className="mt-1 text-2xl font-bold text-amber-400">₹{stats.totalExpectedRevenue}</div></Card>
          <Card><div className="text-xs text-gray-500">Unlocked Revenue</div><div className="mt-1 text-2xl font-bold text-emerald-400">₹{stats.totalUnlockedRevenue}</div></Card>
          <Card><div className="text-xs text-gray-500">Total Audits</div><div className="mt-1 text-3xl font-bold text-white">{audits.length}</div></Card>
          <Card><div className="text-xs text-gray-500">Unlocked Reports</div><div className="mt-1 text-3xl font-bold text-purple-400">{audits.filter((a) => a.fullReport).length}</div></Card>
          <Card><div className="text-xs text-gray-500">Aura Twin Sims</div><div className="mt-1 text-2xl font-bold text-white">{twinStats.totalSimulations}</div></Card>
          <Card><div className="text-xs text-gray-500">Avg Twin Improvement</div><div className="mt-1 text-2xl font-bold text-emerald-400">{twinStats.averageImprovement > 0 ? "+" : ""}{twinStats.averageImprovement}</div></Card>
          <Card><div className="text-xs text-gray-500">Top Twin Variant</div><div className="mt-1 text-lg font-bold text-purple-300">{twinStats.mostCommonWinner}</div></Card>
          <Card><div className="text-xs text-gray-500">Habit Completions</div><div className="mt-1 text-2xl font-bold text-white">{habitStats.totalCompletions}</div></Card>
          <Card><div className="text-xs text-gray-500">Current Streak</div><div className="mt-1 text-2xl font-bold text-amber-400">🔥 {habitStats.currentStreak}</div></Card>
          <Card><div className="text-xs text-gray-500">Longest Streak</div><div className="mt-1 text-2xl font-bold text-emerald-400">{habitStats.longestStreak}</div></Card>
        </div>

        {/* ─── Aura Commerce Card ─── */}
        <div className="mb-8">
          <Card className="border-purple-500/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Aura Commerce</h3>
                <div className="mt-2 grid gap-2 text-xs sm:grid-cols-5">
                  <div><span className="text-gray-500">Active Products</span><div className="font-bold text-white">{getEffectiveCatalog().filter(p => p.isActive).length}</div></div>
                  <div><span className="text-gray-500">Affiliate Links</span><div className="font-bold text-amber-400">{getAffiliateLinks(getEffectiveCatalog()).length}</div></div>
                  <div><span className="text-gray-500">Store Clicks</span><div className="font-bold text-white">{getCommerceClicks().length}</div></div>
                  <div><span className="text-gray-500">Top Store</span><div className="font-bold text-purple-300">{getCommerceAnalytics().topClickedStores[0]?.store || "—"}</div></div>
                  <div><span className="text-gray-500">Est. Revenue (5%)</span><div className="font-bold text-emerald-400">~₹{Math.round(getCommerceClicks().reduce((s, c) => s + c.productPrice, 0) * 0.05)}</div></div>
                </div>
                <CommerceSearchStats />
              </div>
              <div className="flex flex-col gap-2">
                <a href="/admin/commerce" className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-500 hover:to-pink-400">
                  Open Commerce Admin
                </a>
                <a href="/admin/commerce/search" className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-purple-500/30">
                  Search Admin &rarr;
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── Tabs ─── */}
        <div className="mb-6 flex gap-2">
          {(["orders", "analytics", "leads", "funnel", "commerce", "growth", "checklist", "export"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${activeTab === tab ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500 hover:text-gray-300"}`}
            >
              {tab === "orders" ? "Orders" : tab === "analytics" ? "Analytics" : tab === "leads" ? "Leads" : tab === "funnel" ? "Funnel" : tab === "commerce" ? "Commerce" : tab === "growth" ? "Growth" : tab === "checklist" ? "Checklist" : "Export"}
            </button>
          ))}
        </div>

        {/* ─── Orders Tab ─── */}
        {activeTab === "orders" && (
          <>
            {orders.length === 0 ? (
              <Card><div className="py-8 text-center text-sm text-gray-500">No orders yet.</div></Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500">{order.id.slice(0, 8)}</span>
                          <Badge variant={ORDER_STATUS_VARIANTS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                        </div>
                        <div className="grid gap-1 text-xs sm:grid-cols-2">
                          <div><span className="text-gray-500">Audit:</span> <span className="text-purple-300">{order.auditId.slice(0, 8)}...</span></div>
                          <div><span className="text-gray-500">Product:</span> <span className="text-white">{order.productName}</span></div>
                          <div><span className="text-gray-500">Amount:</span> <span className="text-amber-400">₹{order.amount}</span></div>
                          <div><span className="text-gray-500">Customer:</span> <span className="text-gray-300">{order.customerName || "—"}</span></div>
                          <div><span className="text-gray-500">Contact:</span> <span className="text-gray-300">{order.customerContact || "—"}</span></div>
                          <div><span className="text-gray-500">UPI Ref:</span> <span className="text-gray-300">{order.upiTransactionRef || "—"}</span></div>
                          <div><span className="text-gray-500">Method:</span> <span className="text-gray-300">{order.razorpayPaymentId || order.razorpayOrderId ? "Razorpay" : order.upiId ? "Manual UPI" : "—"}</span></div>
                          {order.razorpayPaymentId && <div><span className="text-gray-500">Verification:</span> <span className="text-emerald-400">{order.razorpayPaymentId ? "checkout_verify" : "—"}</span></div>}
                          {order.razorpayOrderId && <div><span className="text-gray-500">Razorpay Order:</span> <span className="font-mono text-xs text-purple-300">{order.razorpayOrderId.slice(0, 20)}...</span></div>}
                          <div><span className="text-gray-500">Code:</span> <span className="font-mono text-purple-300">{order.generatedUnlockCode || "—"}</span></div>
                          <div><span className="text-gray-500">Created:</span> <span className="text-gray-300">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span></div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.status !== "unlocked" && order.status !== "cancelled" && (
                          <>
                            {!order.generatedUnlockCode ? (
                              <Button size="sm" onClick={() => handleGenerateCode(order)}>Generate Code</Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleCopyCode(order.generatedUnlockCode!)}>Copy Code</Button>
                            )}
                            {order.status !== "code_sent" && (
                              <Button size="sm" variant="ghost" onClick={() => handleMarkSent(order)}>Mark Sent</Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => handleCancel(order)}>Cancel</Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(order.id)}>
                          <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── Analytics Tab ─── */}
        {activeTab === "analytics" && (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-4">
              <Card><div className="text-xs text-gray-500">Total Events</div><div className="mt-1 text-2xl font-bold text-white">{analytics.totalEvents}</div></Card>
              <Card><div className="text-xs text-gray-500">Free Scores</div><div className="mt-1 text-2xl font-bold text-white">{analytics.freeScoreGenerated}</div></Card>
              <Card><div className="text-xs text-gray-500">Unlock Page Views</div><div className="mt-1 text-2xl font-bold text-white">{analytics.unlockPageViewed}</div></Card>
              <Card><div className="text-xs text-gray-500">Payment Requests</div><div className="mt-1 text-2xl font-bold text-amber-400">{analytics.paymentRequestSaved}</div></Card>
              <Card><div className="text-xs text-gray-500">Product Unlocks</div><div className="mt-1 text-2xl font-bold text-emerald-400">{analytics.productUnlocked}</div></Card>
              <Card><div className="text-xs text-gray-500">Share Downloads</div><div className="mt-1 text-2xl font-bold text-white">{analytics.shareCardDownloaded}</div></Card>
              <Card><div className="text-xs text-gray-500">Affiliate Clicks</div><div className="mt-1 text-2xl font-bold text-white">{analytics.affiliateClicked}</div></Card>
              <Card><div className="text-xs text-gray-500">Audits Created</div><div className="mt-1 text-2xl font-bold text-white">{analytics.auditCreated}</div></Card>
            </div>
            <Card className="mb-8 border-amber-500/20">
              <h3 className="mb-3 text-sm font-semibold text-amber-400">Payment Reliability</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-xs text-gray-500">Razorpay Orders Created</div>
                  <div className="mt-1 text-2xl font-bold text-white">{orders.filter(o => o.razorpayPaymentId || o.razorpayOrderId).length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Checkout Verify Unlocks</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-400">{orders.filter(o => o.razorpayPaymentId && o.status === "unlocked").length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Manual / Founder Unlocks</div>
                  <div className="mt-1 text-2xl font-bold text-white">{orders.filter(o => !o.razorpayPaymentId && o.status === "unlocked").length}</div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-amber-500/5 p-3 text-xs text-gray-400">
                Webhook, recovery, and zero-amount order stats are available in Supabase mode via /api/health. This panel shows localStorage-only data.
              </div>
            </Card>

            <Card className="mb-8">
              <h3 className="mb-3 text-sm font-semibold text-white">Conversion Estimate</h3>
              <div className="grid gap-3 text-xs sm:grid-cols-2">
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-gray-500">Payment Requests / Free Scores</div>
                  <div className="mt-1 text-lg font-bold text-white">
                    {analytics.freeScoreGenerated > 0
                      ? `${(analytics.paymentRequestSaved / analytics.freeScoreGenerated * 100).toFixed(1)}%`
                      : "—"}
                  </div>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-gray-500">Unlocks / Payment Requests</div>
                  <div className="mt-1 text-lg font-bold text-emerald-400">
                    {analytics.paymentRequestSaved > 0
                      ? `${(analytics.productUnlocked / analytics.paymentRequestSaved * 100).toFixed(1)}%`
                      : "—"}
                  </div>
                </div>
              </div>
            </Card>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearAnalytics}>Clear Analytics</Button>
            </div>
          </>
        )}

        {/* ─── Leads Tab ─── */}
        {activeTab === "leads" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Leads ({leads.length})</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { downloadCSV(leads.map(l => ({ id: l.id, name: l.name || "", contact: l.contact || "", product: l.interestProduct || "", source: l.source, note: l.note || "", createdAt: l.createdAt })), `auracheck-leads-${Date.now()}.csv`); showToast("Leads CSV downloaded"); }}>Export CSV</Button>
                <Button variant="ghost" size="sm" onClick={() => { if (confirm("Clear all leads?")) { clearLeads(); refresh(); showToast("Leads cleared"); } }}>Clear All</Button>
              </div>
            </div>
            {leads.length === 0 ? (
              <Card><div className="py-8 text-center text-sm text-gray-500">No leads captured yet.</div></Card>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <Card key={lead.id}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500">{lead.id.slice(0, 8)}</span>
                          {lead.interestProduct && <span className="text-xs text-purple-300">{lead.interestProduct}</span>}
                        </div>
                        <div className="grid gap-1 text-xs sm:grid-cols-2">
                          <div><span className="text-gray-500">Name:</span> <span className="text-gray-300">{lead.name || "—"}</span></div>
                          <div><span className="text-gray-500">Contact:</span> <span className="text-gray-300">{lead.contact || "—"}</span></div>
                          <div><span className="text-gray-500">Source:</span> <span className="text-gray-300">{lead.source}</span></div>
                          <div><span className="text-gray-500">Date:</span> <span className="text-gray-300">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span></div>
                          {lead.note && <div className="sm:col-span-2"><span className="text-gray-500">Note:</span> <span className="text-gray-300">{lead.note}</span></div>}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => { deleteLead(lead.id); refresh(); showToast("Lead deleted"); }}>
                        <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── Funnel Tab ─── */}
        {activeTab === "funnel" && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(["quick_fix", "aura_report", "dating_audit", "glowup_plan"] as const).map((pt) => {
                const productOrders = orders.filter((o) => o.productType === pt);
                const productUnlocks = productOrders.filter((o) => o.status === "unlocked");
                const productPayments = productOrders.filter((o) => o.status === "payment_submitted" || o.status === "code_sent");
                const pageViews = analytics.productPageViewed || 0;
                return (
                  <Card key={pt}>
                    <h3 className="mb-3 text-sm font-semibold text-white capitalize">{pt.replace("_", " ")}</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Page Views</span><span className="text-white">{pageViews}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Payment Requests</span><span className="text-amber-400">{productPayments.length + productUnlocks.length}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Unlocks</span><span className="text-emerald-400">{productUnlocks.length}</span></div>
                      <div className="mt-2 border-t border-white/5 pt-2">
                        <div className="text-gray-500">Conversion Rate</div>
                        <div className="mt-1 text-lg font-bold text-white">
                          {pageViews > 0 ? `${((productUnlocks.length / pageViews) * 100).toFixed(1)}%` : "—"}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* ─── Quick Fix Funnel Metrics ─── */}
            <Card className="mb-6 border-emerald-500/20">
              <h3 className="mb-4 text-sm font-semibold text-emerald-400">Quick Aura Fix — Funnel Metrics</h3>
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-gray-500">Free Scores Generated</div>
                  <div className="mt-1 text-2xl font-bold text-white">{analytics.freeScoreGenerated}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Paywall Views</div>
                  <div className="mt-1 text-2xl font-bold text-white">{analytics.quickFixPaywallViewed}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">CTA Clicks</div>
                  <div className="mt-1 text-2xl font-bold text-amber-400">{analytics.quickFixCtaClicked}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Unlock Started</div>
                  <div className="mt-1 text-2xl font-bold text-amber-400">{analytics.quickFixUnlockStarted}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Payment Requests</div>
                  <div className="mt-1 text-2xl font-bold text-amber-400">{analytics.quickFixPaymentRequestSaved}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Unlocked</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-400">{analytics.quickFixUnlocked}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Est. Revenue</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-400">₹{analytics.quickFixUnlocked * 49}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Upsell Full Report</div>
                  <div className="mt-1 text-2xl font-bold text-purple-300">{analytics.quickFixUpsellFullReportClicked}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-xs text-gray-500">Payment Requests / Free Scores</div>
                  <div className="mt-1 text-lg font-bold text-white">
                    {analytics.freeScoreGenerated > 0
                      ? `${(analytics.quickFixPaymentRequestSaved / analytics.freeScoreGenerated * 100).toFixed(1)}%`
                      : "—"}
                  </div>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-xs text-gray-500">Unlocks / Payment Requests</div>
                  <div className="mt-1 text-lg font-bold text-emerald-400">
                    {analytics.quickFixPaymentRequestSaved > 0
                      ? `${(analytics.quickFixUnlocked / analytics.quickFixPaymentRequestSaved * 100).toFixed(1)}%`
                      : "—"}
                  </div>
                </div>
              </div>
            </Card>

            {/* ─── Proof Funnel Metrics ─── */}
            <Card className="mb-6 border-purple-500/20">
              <h3 className="mb-3 text-sm font-semibold text-purple-400">Before/After Proof — Funnel</h3>
              <div className="grid gap-4 sm:grid-cols-5">
                <div>
                  <div className="text-xs text-gray-500">Page Views</div>
                  <div className="mt-1 text-2xl font-bold text-white">{analytics.beforeAfterPageViewed}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Card Views</div>
                  <div className="mt-1 text-2xl font-bold text-white">{analytics.proofCardViewed}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">CTA Clicks</div>
                  <div className="mt-1 text-2xl font-bold text-amber-400">{analytics.proofCtaClicked}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Quick Fix Clicks</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-400">{analytics.proofQuickFixClicked}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Pricing Clicks</div>
                  <div className="mt-1 text-2xl font-bold text-purple-300">{analytics.proofPricingClicked}</div>
                </div>
              </div>
            </Card>

            {/* ─── Offer Usage ─── */}
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-white">Offer Usage</h3>
              {orders.filter((o) => o.discountCode).length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-500">No offers applied yet.</div>
              ) : (
                <div className="space-y-2">
                  {OFFERS.filter((o) => orders.some((order) => order.discountCode === o.code)).map((offer) => {
                    const usageCount = orders.filter((o) => o.discountCode === offer.code).length;
                    const revenue = orders.filter((o) => o.discountCode === offer.code).reduce((sum, o) => sum + (o.finalAmount || o.amount), 0);
                    return (
                      <div key={offer.code} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                        <div>
                          <span className="font-mono text-purple-300">{offer.code}</span>
                          <span className="ml-2 text-gray-500">{offer.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white">{usageCount}x used</div>
                          <div className="text-gray-500">₹{revenue} revenue</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        )}

        {/* ─── Commerce Tab ─── */}
        {activeTab === "commerce" && (
          <>
            {(() => {
              const ca = getCommerceAnalytics();
              const clicks = getCommerceClicks();
              return (
                <>
                  <div className="mb-6 grid gap-4 sm:grid-cols-4">
                    <Card><div className="text-xs text-gray-500">Recommendation Views</div><div className="mt-1 text-2xl font-bold text-white">{ca.totalRecommendationViews}</div></Card>
                    <Card><div className="text-xs text-gray-500">Product Clicks</div><div className="mt-1 text-2xl font-bold text-white">{ca.totalProductClicks}</div></Card>
                    <Card><div className="text-xs text-gray-500">Affiliate Clicks</div><div className="mt-1 text-2xl font-bold text-amber-400">{ca.affiliateClicks}</div></Card>
                    <Card><div className="text-xs text-gray-500">Sponsored Clicks</div><div className="mt-1 text-2xl font-bold text-purple-300">{ca.sponsoredClicks}</div></Card>
                  </div>
                  <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <Card>
                      <h3 className="mb-3 text-sm font-semibold text-white">Top Clicked Stores</h3>
                      {ca.topClickedStores.length === 0 ? <div className="text-xs text-gray-500">No data yet.</div> : (
                        <div className="space-y-2">{ca.topClickedStores.map((s) => (
                          <div key={s.store} className="flex items-center justify-between text-xs"><span className="text-gray-300">{s.store}</span><span className="text-white">{s.count}</span></div>
                        ))}</div>
                      )}
                    </Card>
                    <Card>
                      <h3 className="mb-3 text-sm font-semibold text-white">Top Clicked Categories</h3>
                      {ca.topClickedCategories.length === 0 ? <div className="text-xs text-gray-500">No data yet.</div> : (
                        <div className="space-y-2">{ca.topClickedCategories.map((c) => (
                          <div key={c.category} className="flex items-center justify-between text-xs"><span className="text-gray-300">{c.category}</span><span className="text-white">{c.count}</span></div>
                        ))}</div>
                      )}
                    </Card>
                    <Card>
                      <h3 className="mb-3 text-sm font-semibold text-white">Top Clicked Products</h3>
                      {ca.topClickedProducts.length === 0 ? <div className="text-xs text-gray-500">No data yet.</div> : (
                        <div className="space-y-2">{ca.topClickedProducts.map((p) => (
                          <div key={p.productId} className="flex items-center justify-between text-xs"><span className="text-gray-300 truncate max-w-[200px]">{p.title}</span><span className="text-white">{p.count}</span></div>
                        ))}</div>
                      )}
                    </Card>
                  </div>
                  {clicks.length > 0 && (
                    <Card>
                      <h3 className="mb-3 text-sm font-semibold text-white">Recent Clicks ({clicks.length} total)</h3>
                      <div className="max-h-64 space-y-1 overflow-y-auto">
                        {clicks.slice(-20).reverse().map((c, i) => (
                          <div key={i} className="flex items-center justify-between rounded bg-white/5 px-2 py-1 text-xs">
                            <span className="text-gray-300 truncate max-w-[200px]">{c.productId}</span>
                            <span className="text-gray-500">{c.storeKey} — {c.source}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              );
            })()}
          </>
        )}

        {/* ─── Growth Tab ─── */}
        {activeTab === "growth" && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              <Card>
                <div className="text-xs text-gray-500">Referral Code</div>
                <div className="mt-1 text-lg font-bold text-purple-300">{referralProfile.referralCode}</div>
              </Card>
              <Card>
                <div className="text-xs text-gray-500">Local Claims</div>
                <div className="mt-1 text-2xl font-bold text-white">{referralClaims.length}</div>
              </Card>
              <Card>
                <div className="text-xs text-gray-500">Challenge Entries</div>
                <div className="mt-1 text-2xl font-bold text-white">{challengeEntries.length}</div>
              </Card>
              <Card>
                <div className="text-xs text-gray-500">Progress Comparisons</div>
                <div className="mt-1 text-2xl font-bold text-white">{progressComparisons.length}</div>
              </Card>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <Card>
                <div className="text-xs text-gray-500">Share Events</div>
                <div className="mt-1 text-2xl font-bold text-white">{(analytics.referralLinkCopied || 0) + (analytics.referralShared || 0)}</div>
              </Card>
              <Card>
                <div className="text-xs text-gray-500">Onboarding Completion</div>
                <div className="mt-1 text-2xl font-bold text-white">{analytics.onboardingStepCompleted || 0}%</div>
              </Card>
              <Card>
                <div className="text-xs text-gray-500">Avg Improvement</div>
                <div className="mt-1 text-2xl font-bold text-emerald-400">{progressStats.averageImprovement > 0 ? "+" : ""}{progressStats.averageImprovement}</div>
              </Card>
            </div>

            <Card className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-white">Top Challenge by Entries</h3>
              {(() => {
                if (challengeEntries.length === 0) return <div className="py-4 text-center text-xs text-gray-500">No challenge entries yet.</div>;
                const entryCounts: Record<string, number> = {};
                for (const e of challengeEntries) entryCounts[e.challengeId] = (entryCounts[e.challengeId] || 0) + 1;
                const sorted = Object.entries(entryCounts).sort((a, b) => b[1] - a[1]);
                if (sorted.length === 0) return <div className="py-4 text-center text-xs text-gray-500">No data.</div>;
                const top = sorted[0];
                const challenge = CHALLENGES.find((c) => c.id === top[0]);
                return <div className="text-sm text-gray-300"><span className="text-purple-300">{challenge?.title ?? top[0]}</span> — {top[1]} entries</div>;
              })()}
            </Card>

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <Link href="/admin/growth">
                <Button className="w-full">Growth Dashboard &rarr;</Button>
              </Link>
              <Link href="/admin/revenue">
                <Button variant="outline" className="w-full">Revenue Dashboard &rarr;</Button>
              </Link>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                const rows = referralClaims.map((c) => ({ code: c.referralCode, source: c.source || "", claimedAt: c.claimedAt }));
                downloadCSV(rows, `auracheck-referrals-${Date.now()}.csv`);
                showToast("Referral CSV downloaded");
              }}>Export Referral Data</Button>
              <Button variant="ghost" size="sm" onClick={() => {
                const rows = challengeEntries.map((e) => ({ id: e.id, challengeId: e.challengeId, auditId: e.auditId || "", auraScore: e.auraScore ?? "", archetype: e.archetype || "", createdAt: e.createdAt }));
                downloadCSV(rows, `auracheck-challenges-${Date.now()}.csv`);
                showToast("Challenge entries CSV downloaded");
              }}>Export Challenge Entries</Button>
              <Button variant="ghost" size="sm" onClick={() => {
                const rows = progressComparisons.map((c) => ({ id: c.id, before: c.beforeAuditId, after: c.afterAuditId, delta: c.scoreDelta, improved: c.improvedSignals.join("; "), createdAt: c.createdAt }));
                downloadCSV(rows, `auracheck-progress-${Date.now()}.csv`);
                showToast("Progress CSV downloaded");
              }}>Export Progress Data</Button>
            </div>
          </>
        )}

        {/* ─── Founder Launch Checklist ─── */}
        {activeTab === "checklist" && (
          <>
            <Card className="mb-6">
              <h3 className="mb-4 text-lg font-bold text-white">Founder Launch Checklist</h3>
              <p className="mb-4 text-xs text-gray-400">Track your pre-launch readiness. Check off items as you complete them.</p>
              <div className="space-y-2">
                {[
                  { key: "upi_id", label: "Set UPI ID in .env (NEXT_PUBLIC_UPI_ID)" },
                  { key: "support_email", label: "Set support email (NEXT_PUBLIC_SUPPORT_EMAIL)" },
                  { key: "owner_whatsapp", label: "Set owner WhatsApp (NEXT_PUBLIC_OWNER_WHATSAPP)" },
                  { key: "admin_code", label: "Set local admin code (NEXT_PUBLIC_LOCAL_ADMIN_CODE)" },
                  { key: "free_score", label: "Test free score generation" },
                  { key: "quickfix_unlock", label: "Test Quick Aura Fix unlock" },
                  { key: "aura_unlock", label: "Test Full Aura Report unlock" },
                  { key: "dating_unlock", label: "Test Dating Audit unlock" },
                  { key: "glowup_unlock", label: "Test Glow-Up Plan unlock" },
                  { key: "offer_codes", label: "Test offer codes on unlock page" },
                  { key: "order_export", label: "Test order export (CSV/JSON)" },
                  { key: "data_export", label: "Test data export from /data page" },
                  { key: "mobile_upload", label: "Test mobile photo upload" },
                  { key: "share_card", label: "Test share card download" },
                  { key: "privacy_terms", label: "Review privacy & terms pages" },
                  { key: "examples_pricing", label: "Review examples & pricing pages" },
                  { key: "challenges", label: "Review challenges & progress pages" },
                ].map((item) => (
                  <label key={item.key} className="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm transition-colors hover:bg-white/10">
                    <input type="checkbox" checked={!!checklist[item.key]} onChange={() => toggleChecklistItem(item.key)} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-purple-500" />
                    <span className={checklist[item.key] ? "text-gray-500 line-through" : "text-gray-300"}>{item.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all" style={{ width: `${(Object.values(checklist).filter(Boolean).length / 17) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500">{Object.values(checklist).filter(Boolean).length}/17</span>
              </div>
            </Card>

            <Card>
              <h3 className="mb-3 text-sm font-semibold text-white">Export Full Admin Snapshot</h3>
              <p className="mb-4 text-xs text-gray-400">Download a JSON file containing all orders, leads, analytics, challenge entries, progress comparisons, and local stats.</p>
              <Button variant="outline" size="sm" onClick={() => {
                const snapshot = {
                  exportedAt: new Date().toISOString(),
                  orders: getOrders(),
                  leads: getLeads(),
                  events: getEvents(),
                  challengeEntries: getChallengeEntries(),
                  progressComparisons: getProgressComparisons(),
                  analytics: getAnalyticsSummary(),
                  stats,
                };
                downloadJSON(snapshot, `auracheck-admin-snapshot-${Date.now()}.json`);
                showToast("Admin snapshot downloaded");
              }}>Export Admin Snapshot</Button>
            </Card>
          </>
        )}

        {/* ─── Export Tab ─── */}
        {activeTab === "export" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-white">Export Orders</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleExportOrdersCSV}>CSV</Button>
                <Button size="sm" variant="outline" onClick={handleExportOrdersJSON}>JSON</Button>
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-white">Export Audits</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleExportAuditsCSV}>CSV</Button>
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-white">Export Analytics</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleExportAnalyticsCSV}>CSV</Button>
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-white">Export Leads</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { downloadCSV(leads.map(l => ({ id: l.id, name: l.name || "", contact: l.contact || "", product: l.interestProduct || "", source: l.source, note: l.note || "", createdAt: l.createdAt })), `auracheck-leads-${Date.now()}.csv`); showToast("Leads CSV downloaded"); }}>CSV</Button>
                <Button size="sm" variant="outline" onClick={() => { const json = JSON.stringify(leads, null, 2); const blob = new Blob([json], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `auracheck-leads-${Date.now()}.json`; a.click(); showToast("Leads JSON downloaded"); }}>JSON</Button>
              </div>
            </Card>
          </div>
        )}

        {/* ─── Footer Note ─── */}
        <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-gray-600">
          <p>Local admin panel for MVP testing. Not production-secure. All data stored in browser localStorage.</p>
        </div>
      </div>
    </Container>
  );
}

function CommerceSearchStats() {
  const [stats, setStats] = useState<{ indexedCount: number; staleCount: number; source: string } | null>(null);

  useEffect(() => {
    import("@/lib/storage/commerceSearchStore").then((m) => {
      const index = m.getSearchIndex();
      const meta = m.getSearchIndexMeta();
      if (index.length > 0) {
        setStats({
          indexedCount: meta?.indexedCount || index.length,
          staleCount: index.filter((i) => i.priceFreshness === "stale" || i.priceFreshness === "unknown").length,
          source: meta?.catalogSource || "local",
        });
      }
    });
  }, []);

  if (!stats) return null;

  return (
    <div className="mt-2 flex gap-3 text-[10px] text-gray-500">
      <span>{stats.indexedCount} indexed products</span>
      <span className="text-red-400">{stats.staleCount} stale prices</span>
      <span>Source: {stats.source}</span>
    </div>
  );
}
