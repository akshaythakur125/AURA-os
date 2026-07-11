"use client";

import { useState, useMemo, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRODUCTS } from "@/config/products";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/product";
import { getAffiliateStats, getAffiliateClicks } from "@/lib/storage/affiliateStore";
import { getOrders, updateOrder, deleteOrder, getOrderStats } from "@/lib/storage/orderStore";
import { getAuditStats, getAudits } from "@/lib/storage/auditStore";
import { getAnalyticsSummary, clearAnalytics, getEvents } from "@/lib/storage/analyticsStore";
import { downloadJson } from "@/lib/export/downloadJson";
import { jsonToCsv, downloadCsv } from "@/lib/export/csv";
import { getLeads, deleteLead, clearLeads, exportLeads } from "@/lib/storage/leadStore";
import { exportAllData, downloadExport } from "@/lib/data/exportAllData";
import { getItem, setItem } from "@/lib/storage/localStore";
import { getReferralProfile, getReferralStats, getReferralClaims } from "@/lib/storage/referralStore";
import { getChallengeEntries, getChallengeStats } from "@/lib/storage/challengeStore";
import { getProgressComparisons, getProgressStats } from "@/lib/storage/progressStore";
import type { ManualOrder } from "@/types/order";

async function verifyAdminSession(code: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function checkAdminSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/auth");
    const data = await res.json();
    return data.authenticated === true;
  } catch {
    return false;
  }
}

async function logoutAdmin(): Promise<void> {
  try {
    await fetch("/api/admin/auth", { method: "DELETE" });
  } catch {
    // ignore
  }
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
  const [loading, setLoading] = useState(false);
  async function handleSubmit() {
    if (!code.trim()) { setError("Please enter the admin code."); return; }
    setLoading(true);
    setError(null);
    try {
      const ok = await verifyAdminSession(code.trim());
      if (ok) {
        onUnlock();
      } else {
        setError("Invalid admin code.");
      }
    } catch {
      setError("Could not verify admin code. Check your connection.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-24">
        <GlowOrb color="rgba(147, 51, 234, 0.1)" size={350} className="top-[20%] left-[15%]" delay={0} />
        <Card className="relative mx-auto max-w-sm py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10" /></svg>
        </div>
        <h2 className="mb-2 text-lg font-bold text-white">Admin Access</h2>
        <p className="mb-6 text-xs text-gray-500">Enter the admin code to access the panel. Server-side verified.</p>
        <input type="password" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()} placeholder="Admin code" className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none" />
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <Button onClick={handleSubmit} className="w-full" disabled={loading}>{loading ? "Verifying..." : "Unlock Admin Panel"}</Button>
      </Card>
      </Container>
    </>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAdminSession().then((ok) => {
      setAuthenticated(ok);
      setChecking(false);
    });
  }, []);

  async function handleLogout() {
    await logoutAdmin();
    setAuthenticated(false);
  }

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

  const leads = useMemo(() => {
    if (!authenticated) return [];
    return getLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, refreshKey]);

  const CHECKLIST_KEY = "auracheck:v1:founder_checklist";
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() => getItem<Record<string, boolean>>(CHECKLIST_KEY, {}));
  const checklistItems = [
    { id: "upi_id", label: "Set UPI ID in env (NEXT_PUBLIC_MANUAL_UPI_ID)" },
    { id: "support_email", label: "Set support email (NEXT_PUBLIC_SUPPORT_EMAIL)" },
    { id: "whatsapp", label: "Set owner WhatsApp (NEXT_PUBLIC_OWNER_WHATSAPP)" },
    { id: "admin_code", label: "Set local admin code (NEXT_PUBLIC_LOCAL_ADMIN_CODE)" },
    { id: "free_score", label: "Test free score generation" },
    { id: "aura_report", label: "Test Aura Report unlock (₹25)" },
    { id: "dating_audit", label: "Test Dating Audit unlock (₹299)" },
    { id: "glowup_plan", label: "Test Glow-Up Plan unlock (₹499)" },
    { id: "offer_codes", label: "Test offer codes (EARLY50, AURA99, etc.)" },
    { id: "order_export", label: "Test order export (JSON + CSV)" },
    { id: "data_export", label: "Test data export from /data page" },
    { id: "mobile_upload", label: "Test mobile image upload" },
    { id: "share_card", label: "Test share card download" },
    { id: "privacy_terms", label: "Review privacy/terms/privacy-center pages" },
    { id: "examples_pricing", label: "Review examples and pricing pages" },
    { id: "challenges_progress", label: "Review challenges and progress pages" },
  ];

  function toggleChecklistItem(id: string) {
    const current = getItem<Record<string, boolean>>(CHECKLIST_KEY, {});
    current[id] = !current[id];
    setItem(CHECKLIST_KEY, current);
    setChecklistState({ ...current });
  }

  const productPageViews = useMemo(() => {
    if (!authenticated) return { aura_report: 0, dating_audit: 0, glowup_plan: 0, examples: 0 };
    const events = getEvents();
    return {
      aura_report: events.filter((e) => e.eventName === "product_page_viewed" && e.metadata?.product === "aura_report").length,
      dating_audit: events.filter((e) => e.eventName === "product_page_viewed" && e.metadata?.product === "dating_audit").length,
      glowup_plan: events.filter((e) => e.eventName === "product_page_viewed" && e.metadata?.product === "glowup_plan").length,
      examples: events.filter((e) => e.eventName === "examples_viewed").length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, refreshKey]);

  const productUnlockCounts = useMemo(() => {
    if (!authenticated) return { aura_report: 0, dating_audit: 0, glowup_plan: 0 };
    const orders = getOrders();
    return {
      aura_report: orders.filter((o) => o.productType === "aura_report" && o.status === "unlocked").length,
      dating_audit: orders.filter((o) => o.productType === "dating_audit" && o.status === "unlocked").length,
      glowup_plan: orders.filter((o) => o.productType === "glowup_plan" && o.status === "unlocked").length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, refreshKey]);

  const totalActive = useMemo(() => PRODUCTS.filter((p) => p.isActive).length, []);
  const totalSponsored = useMemo(() => PRODUCTS.filter((p) => p.isSponsored).length, []);

  async function handleGenerateCode(order: ManualOrder) {
    try {
      const res = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId: order.auditId, productType: order.productType }),
      });
      const data = await res.json();
      if (data.code) {
        updateOrder(order.id, { generatedUnlockCode: data.code, status: "code_sent" });
        setRefreshKey((k) => k + 1);
      }
    } catch {
      // silent — admin will see the error
    }
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

  function handleExportLeadsCSV() {
    const allLeads = exportLeads();
    const rows = allLeads.map((l) => ({
      id: l.id,
      name: l.name || "",
      contact: l.contact || "",
      interestProduct: l.interestProduct || "",
      note: l.note || "",
      source: l.source,
      createdAt: l.createdAt,
    }));
    const csv = jsonToCsv(rows);
    downloadCsv(csv, `auracheck-leads-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function handleDeleteLead(id: string) {
    if (!window.confirm("Delete this lead?")) return;
    deleteLead(id);
    setRefreshKey((k) => k + 1);
  }

  if (checking) {
    return (
      <>
        <div className="aurora-mesh" />
        <Container className="relative py-24">
          <GlowOrb color="rgba(147, 51, 234, 0.08)" size={300} className="top-[20%] left-[15%]" delay={0} />
          <Card className="relative mx-auto max-w-sm py-12 text-center">
            <p className="text-sm text-gray-500">Verifying admin session...</p>
          </Card>
        </Container>
      </>
    );
  }

  if (!authenticated) {
    return <AdminGate onUnlock={() => setAuthenticated(true)} />;
  }

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-16">
        <GlowOrb color="rgba(147, 51, 234, 0.06)" size={300} className="top-[5%] right-[5%]" delay={0} />
        <GlowOrb color="rgba(245, 158, 11, 0.05)" size={200} className="bottom-[10%] left-[10%]" delay={300} />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <SectionHeading title="Admin Panel" subtitle="Orders, analytics, unlock codes, and exports." />
        <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem("auracheck_admin_auth"); setAuthenticated(false); }}>
          Lock Admin
        </Button>
      </div>

      {/* ─── Admin Snapshot Export ─── */}
      <div className="mb-8 flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => {
          const data = exportAllData();
          downloadExport(data);
        }}>
          Export Full Admin Snapshot
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
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Total Events</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.totalEvents ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Free Scores</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.freeScoreGenerated ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Unlock Views</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.unlockPageViewed ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Payment Reqs</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.paymentRequestSaved ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Unlocks</div>
            <div className="mt-1 text-lg font-bold text-emerald-400">{analyticsSummary?.productUnlocked ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Share Downloads</div>
            <div className="mt-1 text-lg font-bold text-white">{analyticsSummary?.shareCardDownloaded ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Affiliate Clicks</div>
            <div className="mt-1 text-lg font-bold text-amber-400">{analyticsSummary?.affiliateClicked ?? 0}</div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
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

      {/* ─── Funnel Analytics ─── */}
      <Card className="mb-8">
        <h3 className="mb-4 text-sm font-semibold text-white">Product Funnel</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Aura Report views</div>
            <div className="mt-1 text-lg font-bold text-white">{productPageViews.aura_report}</div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Dating Audit views</div>
            <div className="mt-1 text-lg font-bold text-white">{productPageViews.dating_audit}</div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Glow-Up Plan views</div>
            <div className="mt-1 text-lg font-bold text-white">{productPageViews.glowup_plan}</div>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Examples views</div>
            <div className="mt-1 text-lg font-bold text-white">{productPageViews.examples}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
            <div className="text-xs text-gray-500">Aura Report unlocked</div>
            <div className="mt-1 text-lg font-bold text-emerald-400">{productUnlockCounts.aura_report}</div>
          </div>
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
            <div className="text-xs text-gray-500">Dating Audit unlocked</div>
            <div className="mt-1 text-lg font-bold text-emerald-400">{productUnlockCounts.dating_audit}</div>
          </div>
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
            <div className="text-xs text-gray-500">Glow-Up Plan unlocked</div>
            <div className="mt-1 text-lg font-bold text-emerald-400">{productUnlockCounts.glowup_plan}</div>
          </div>
        </div>
      </Card>

      {/* ─── Leads ─── */}
      <Card className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">Local Leads ({leads.length})</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportLeadsCSV}>Export CSV</Button>
            <Button variant="ghost" size="sm" onClick={() => { if (window.confirm("Clear all leads?")) { clearLeads(); setRefreshKey((k) => k + 1); } }}>Clear All</Button>
          </div>
        </div>
        {leads.length === 0 ? (
          <p className="text-sm text-gray-500">No leads captured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.04] text-gray-500">
                  <th className="pb-2 pr-3 font-medium">Name</th>
                  <th className="pb-2 pr-3 font-medium">Contact</th>
                  <th className="pb-2 pr-3 font-medium">Interest</th>
                  <th className="pb-2 pr-3 font-medium">Source</th>
                  <th className="pb-2 pr-3 font-medium">Note</th>
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-white/[0.04] text-gray-300">
                    <td className="py-2 pr-3">{l.name || "—"}</td>
                    <td className="py-2 pr-3">{l.contact || "—"}</td>
                    <td className="py-2 pr-3">{l.interestProduct || "—"}</td>
                    <td className="py-2 pr-3">{l.source}</td>
                    <td className="py-2 pr-3 text-[10px] text-gray-500 max-w-[120px] truncate">{l.note || "—"}</td>
                    <td className="py-2 pr-3 text-[10px] text-gray-500">{formatDate(l.createdAt)}</td>
                    <td className="py-2">
                      <button onClick={() => handleDeleteLead(l.id)} className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-300 hover:bg-red-500/30">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <tr className="border-b border-white/[0.04] text-gray-500">
                  <th className="pb-2 pr-3 font-medium">Order</th>
                  <th className="pb-2 pr-3 font-medium">Audit</th>
                  <th className="pb-2 pr-3 font-medium">Product</th>
                  <th className="pb-2 pr-3 font-medium">Amount</th>
                  <th className="pb-2 pr-3 font-medium">Discount</th>
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
                  <tr key={o.id} className="border-b border-white/[0.04] text-gray-300">
                    <td className="py-2 pr-3 text-[10px] text-gray-500">{o.id.slice(0, 8)}</td>
                    <td className="py-2 pr-3 text-[10px] text-gray-500">{o.auditId.slice(0, 8)}</td>
                    <td className="py-2 pr-3">{o.productName}</td>
                    <td className="py-2 pr-3 text-amber-400">
                      {o.discountAmount ? <span className="line-through text-gray-600 mr-1">₹{o.originalAmount || o.amount}</span> : ""}
                      ₹{o.amount}
                    </td>
                    <td className="py-2 pr-3">{o.discountCode ? <span className="text-emerald-400 text-[10px]">{o.discountCode} (-₹{o.discountAmount})</span> : <span className="text-gray-600">—</span>}</td>
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

      {/* ─── Growth Dashboard ─── */}
      <Card className="mb-8">
        <h3 className="mb-4 text-sm font-semibold text-white">Growth Dashboard</h3>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-4">
            <div className="mb-2 text-xs text-gray-500">Referral Program</div>
            {(() => { const rs = getReferralStats(); return (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Referral Code</span><span className="text-purple-300">{getReferralProfile()?.referralCode || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Total Claims</span><span className="text-white">{rs?.totalClaimsLocal ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Referral Code Used</span><span className="text-white">{rs?.referralCode || "—"}</span></div>
                <div className="mt-2"><Button variant="ghost" size="sm" onClick={() => { const data = getReferralClaims(); const csv = jsonToCsv(data.map((c) => ({ id: c.id, referralCode: c.referralCode, claimedAt: c.claimedAt }))); downloadCsv(csv, `referral-claims-${new Date().toISOString().slice(0, 10)}.csv`); }}>Export Claims CSV</Button></div>
              </div>
            );})()}
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-4">
            <div className="mb-2 text-xs text-gray-500">Challenge Entries</div>
            {(() => { const cs = getChallengeStats(); const entries = getChallengeEntries(); const uniqueChallenges = cs ? Object.keys(cs.entriesByChallenge).length : 0; return (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Total Entries</span><span className="text-white">{cs?.totalEntries ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Unique Challenges</span><span className="text-white">{uniqueChallenges}</span></div>
                <div className="mt-2"><Button variant="ghost" size="sm" onClick={() => { const csv = jsonToCsv(entries.map((e) => ({ id: e.id, challengeId: e.challengeId, score: e.auraScore, timestamp: e.createdAt }))); downloadCsv(csv, `challenge-entries-${new Date().toISOString().slice(0, 10)}.csv`); }}>Export Entries CSV</Button></div>
              </div>
            );})()}
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-4">
            <div className="mb-2 text-xs text-gray-500">Progress Comparisons</div>
            {(() => { const ps = getProgressStats(); const all = getProgressComparisons(); const improved = all.filter((c) => c.scoreDelta > 0).length; const deltas = all.map((c) => c.scoreDelta); const avgDelta = deltas.length > 0 ? Math.round(deltas.reduce((s, d) => s + d, 0) / deltas.length) : null; return (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Total Comparisons</span><span className="text-white">{ps?.totalComparisons ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Improved</span><span className="text-emerald-400">{improved}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Avg Delta</span><span className="text-amber-400">{avgDelta != null ? `${avgDelta > 0 ? "+" : ""}${avgDelta}` : "—"}</span></div>
                <div className="mt-2"><Button variant="ghost" size="sm" onClick={() => { const csv = jsonToCsv(all.map((c) => ({ id: c.id, beforeAuditId: c.beforeAuditId, afterAuditId: c.afterAuditId, scoreDelta: c.scoreDelta, summary: c.summary, createdAt: c.createdAt }))); downloadCsv(csv, `progress-comparisons-${new Date().toISOString().slice(0, 10)}.csv`); }}>Export Comparisons CSV</Button></div>
              </div>
            );})()}
          </div>
        </div>
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

      {/* ─── Founder Launch Checklist ─── */}
      {(() => {
        const completedCount = Object.values(checklistState).filter(Boolean).length;
        return (
          <Card className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Founder Launch Checklist</h3>
              <span className="text-xs text-gray-500">{completedCount}/{checklistItems.length} completed</span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all"
                style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {checklistItems.map((item) => (
                <label key={item.id} className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5 hover:bg-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={!!checklistState[item.id]}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                  />
                  <span className={`text-xs ${checklistState[item.id] ? "text-gray-500 line-through" : "text-gray-300"}`}>{item.label}</span>
                </label>
              ))}
            </div>
          </Card>
        );
      })()}

      {/* ─── Product Catalog ─── */}
      <Card className="mb-8">
        <h3 className="mb-4 text-sm font-semibold text-white">Product Catalog ({PRODUCTS.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.04] text-gray-500">
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
                <tr key={p.id} className="border-b border-white/[0.04] text-gray-300">
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

      <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 text-xs text-gray-600">
        <span>⚠ Admin panel — data stored in localStorage. Server-side session auth.</span>
        <button onClick={handleLogout} className="rounded-lg border border-white/10 px-3 py-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Logout</button>
      </div>
      </Container>
    </>
  );
}
