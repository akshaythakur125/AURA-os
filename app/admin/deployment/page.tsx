"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DeploymentChecklist } from "@/components/admin/DeploymentChecklist";
import { DomainStatusPanel } from "@/components/admin/DomainStatusPanel";
import { ProductionModePanel } from "@/components/admin/ProductionModePanel";
import { PostDeploySmokeTestPanel } from "@/components/admin/PostDeploySmokeTestPanel";
import { EnvironmentStatusTable } from "@/components/admin/EnvironmentStatusTable";
import type { DeploymentChecklist as DeploymentChecklistType } from "@/types/deployment";

export default function AdminDeploymentPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [deployment, setDeployment] = useState<DeploymentChecklistType | null>(null);
  const [mode, setMode] = useState<Record<string, unknown> | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => setAuthenticated(sessionStorage.getItem("auracheck_admin_auth") === "true"));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/deployment/check", {
        headers: { "x-admin-code": "aura-admin-internal" },
      });
      const data = await res.json();
      if (data.success) {
        setDeployment(data.deployment);
        setMode(data.mode);
        setWarnings(data.warnings || []);
      }
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

  function handleCopyEnv() {
    const keys = Object.keys(process.env).filter((k) => k.startsWith("NEXT_PUBLIC_") || ["SUPABASE_SERVICE_ROLE_KEY", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET", "LOCAL_ADMIN_CODE", "COMMERCE_REFRESH_SECRET"].includes(k));
    const text = keys.map((k) => `${k}=${process.env[k] || ""}`).join("\n");
    navigator.clipboard?.writeText(text);
    alert("Environment variable list copied to clipboard (values may be empty for unset vars).");
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Deployment Center</h1>
            <p className="text-xs text-gray-500">Vercel production deployment readiness checks</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyEnv}>Copy Env List</Button>
            <Button variant="outline" size="sm" onClick={() => {
              const report = { deployment, mode, warnings, exportedAt: new Date().toISOString() };
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `auracheck-deployment-report-${Date.now()}.json`;
              a.click();
            }}>Export Report</Button>
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse"><div className="h-5 w-40 rounded bg-white/10" /></Card>
            ))}
          </div>
        )}

        {!loading && deployment && (
          <>
            {/* Deployment score */}
            <div className="mb-8">
              <DeploymentChecklist categories={deployment.categories} score={deployment.score} label={deployment.label} />
            </div>

            {/* Production mode */}
            {mode && (
              <div className="mb-8">
                <ProductionModePanel mode={(mode as unknown) as React.ComponentProps<typeof ProductionModePanel>["mode"]} warnings={warnings} />
              </div>
            )}

            {/* Domain status */}
            <div className="mb-8">
              <DomainStatusPanel
                checks={deployment.categories.find((c) => c.name === "Domain & DNS")?.checks || []}
                domain="fixmyaura.shop"
                configured={false}
              />
            </div>

            {/* Env vars by category */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <EnvironmentStatusTable checks={deployment.categories.find((c) => c.name === "Environment Variables")?.checks || []} title="Environment Variables" />
              <EnvironmentStatusTable checks={deployment.categories.find((c) => c.name === "Vercel Setup")?.checks || []} title="Vercel Setup" />
            </div>

            {/* Post-deploy smoke tests */}
            <div className="mb-8">
              <PostDeploySmokeTestPanel />
            </div>

            {/* View DEPLOYMENT.md */}
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Full deployment instructions available in DEPLOYMENT.md</span>
                <Button size="sm" variant="outline" onClick={() => window.open("/DEPLOYMENT.md", "_blank")}>View Guide</Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </Container>
  );
}
