"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LaunchScoreCard } from "@/components/admin/LaunchScoreCard";
import { LaunchChecklist } from "@/components/admin/LaunchChecklist";
import { EnvironmentStatusTable } from "@/components/admin/EnvironmentStatusTable";
import { SupabaseHealthPanel } from "@/components/admin/SupabaseHealthPanel";
import { PaymentHealthPanel } from "@/components/admin/PaymentHealthPanel";
import { CommerceHealthPanel } from "@/components/admin/CommerceHealthPanel";
import { SeoHealthPanel } from "@/components/admin/SeoHealthPanel";
import { SmokeTestPanel } from "@/components/admin/SmokeTestPanel";
import { ProductionWarningCard } from "@/components/admin/ProductionWarningCard";
import type { LaunchScore, LaunchCategory, LaunchChecklistItem, ProductionWarning } from "@/types/launch";

export default function AdminLaunchPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [score, setScore] = useState<LaunchScore | null>(null);
  const [checklist, setChecklist] = useState<LaunchChecklistItem[]>([]);
  const [warnings, setWarnings] = useState<ProductionWarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => setAuthenticated(sessionStorage.getItem("auracheck_admin_auth") === "true"));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ getLaunchChecklist, getProductionWarnings }, { auditEnv }, { checkRazorpayHealth }, { checkCommerceHealth }, { checkSeoHealth }, { checkPaymentProductHealth }, { computeLaunchScore }, { checkDomainHealth }] = await Promise.all([
        import("@/lib/launch/launchChecklistStore"),
        import("@/lib/launch/envAudit"),
        import("@/lib/launch/razorpayHealth"),
        import("@/lib/launch/commerceHealth"),
        import("@/lib/launch/seoHealth"),
        import("@/lib/launch/paymentProductHealth"),
        import("@/lib/launch/launchScore"),
        import("@/lib/launch/domainHealth"),
      ]);

      const env = auditEnv();
      const razorpay = checkRazorpayHealth();
      const comm = checkCommerceHealth();
      const seo = checkSeoHealth();
      const products = checkPaymentProductHealth();
      const domain = checkDomainHealth();

      const categories: LaunchCategory[] = [
        { name: "Environment", score: 0, maxScore: 15, checks: env.checks },
        { name: "Domain & Deployment", score: 0, maxScore: 5, checks: domain.checks },
        { name: "Razorpay & Payments", score: 0, maxScore: 15, checks: razorpay.checks },
        { name: "Payment Products", score: 0, maxScore: 15, checks: products.checks },
        { name: "Commerce & Affiliate", score: 0, maxScore: 10, checks: comm.checks },
        { name: "SEO & Public Pages", score: 0, maxScore: 10, checks: seo.checks },
      ];

      setScore(computeLaunchScore(categories));
      setChecklist(getLaunchChecklist());
      setWarnings(getProductionWarnings());
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

  async function handleToggle(id: string) {
    const { toggleChecklistItem } = await import("@/lib/launch/launchChecklistStore");
    setChecklist(toggleChecklistItem(id));
  }

  async function handleReset() {
    const { resetChecklist } = await import("@/lib/launch/launchChecklistStore");
    resetChecklist();
    setChecklist([]);
  }

  function handleExport() {
    const report = { score, checklist, warnings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `auracheck-launch-report-${Date.now()}.json`;
    a.click();
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

  const checklistProgress = { checked: checklist.filter((i) => i.checked).length, total: checklist.length, percent: checklist.length > 0 ? Math.round((checklist.filter((i) => i.checked).length / checklist.length) * 100) : 0 };

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Launch Control Center</h1>
            <p className="text-xs text-gray-500">Production readiness checks, smoke tests, and launch checklist</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>Export Report</Button>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse"><div className="h-5 w-40 rounded bg-white/10" /></Card>
            ))}
          </div>
        )}

        {!loading && score && (
          <>
            {/* Launch score */}
            <div className="mb-8">
              <LaunchScoreCard score={score} />
            </div>

            {/* Production warnings */}
            <div className="mb-8">
              <ProductionWarningCard warnings={warnings} />
            </div>

            {/* Environment + Domain */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <EnvironmentStatusTable checks={score.categories.find((c) => c.name === "Environment")?.checks || []} title="Environment Variables" />
              <EnvironmentStatusTable checks={score.categories.find((c) => c.name === "Domain & Deployment")?.checks || []} title="Domain & Deployment" />
            </div>

            {/* Payments + Products */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <PaymentHealthPanel checks={score.categories.find((c) => c.name === "Razorpay & Payments")?.checks || []} />
              <EnvironmentStatusTable checks={score.categories.find((c) => c.name === "Payment Products")?.checks || []} title="Payment Products" />
            </div>

            {/* Commerce + SEO */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <CommerceHealthPanel checks={score.categories.find((c) => c.name === "Commerce & Affiliate")?.checks || []} />
              <SeoHealthPanel checks={score.categories.find((c) => c.name === "SEO & Public Pages")?.checks || []} />
            </div>

            {/* Supabase health */}
            <div className="mb-8">
              <SupabaseHealthPanel checks={[
                { name: "Supabase configured", status: "manual", message: "Run checkSupabaseHealth for table-level verification" },
                { name: "RLS policies", status: "manual", message: "Confirm RLS before production" },
              ]} />
            </div>

            {/* Smoke tests */}
            <div className="mb-8">
              <SmokeTestPanel />
            </div>

            {/* Manual checklist */}
            <div className="mb-8">
              <LaunchChecklist items={checklist} onToggle={handleToggle} onReset={handleReset} progress={checklistProgress} />
            </div>

            {/* Export */}
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Download a launch readiness report for your records.</span>
                <Button size="sm" variant="outline" onClick={handleExport}>Export JSON Report</Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </Container>
  );
}
