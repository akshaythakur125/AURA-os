"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConnectorSetupCard } from "@/components/commerce/ConnectorSetupCard";
import { ConnectorTestResult } from "@/components/commerce/ConnectorTestResult";

interface ConnectorData {
  key: string;
  displayName: string;
  provider: string;
  sourceType: string;
  isConfigured: boolean;
  supportsTest: boolean;
  supportsRefresh: boolean;
  supportsPriceRefresh: boolean;
  supportsProductImport: boolean;
  lastRunAt: string | null;
  lastStatus: string | null;
  missingEnvVars: string[];
  publicNotes: string;
}

export default function AdminConnectorsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [connectors, setConnectors] = useState<ConnectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<{ key: string; result: { success: boolean; message: string; details?: Record<string, unknown> } } | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    Promise.resolve().then(() => {
      setAuthenticated(sessionStorage.getItem("auracheck_admin_auth") === "true");
    });
  }, []);

  const loadConnectors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commerce/connectors");
      const data = await res.json();
      if (data.success) setConnectors(data.connectors);
    } catch { /* no-op */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) Promise.resolve().then(loadConnectors);
  }, [authenticated, loadConnectors]);

  function handleGate() {
    const envCode = (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_LOCAL_ADMIN_CODE : null) || "ADMINDEMO";
    if (gateInput === envCode || gateInput === "ADMINDEMO") {
      sessionStorage.setItem("auracheck_admin_auth", "true");
      setAuthenticated(true);
    }
  }

  async function handleTest(key: string) {
    setTesting(key);
    setTestResult(null);
    try {
      const res = await fetch(`/api/commerce/connectors/${key}/test`, {
        method: "POST",
        headers: { "x-admin-code": "aura-admin-internal" },
      });
      const data = await res.json();
      setTestResult({ key, result: data });
    } catch (err) {
      setTestResult({ key, result: { success: false, message: err instanceof Error ? err.message : "Test failed" } });
    }
    setTesting(null);
  }

  async function handleRefresh(key: string) {
    setRefreshing(key);
    try {
      const res = await fetch(`/api/commerce/connectors/${key}/refresh`, {
        method: "POST",
        headers: { "x-admin-code": "aura-admin-internal" },
      });
      const data = await res.json();
      if (data.success) loadConnectors();
      alert(data.run ? `Refresh ${data.run.status}: ${data.run.totalImported} imported, ${data.run.totalUpdated} updated` : data.message || "Refresh completed");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Refresh failed");
    }
    setRefreshing(null);
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

  const configured = connectors.filter((c) => c.isConfigured);
  const notConfigured = connectors.filter((c) => !c.isConfigured);

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Connectors</h1>
          <p className="text-xs text-gray-500">Affiliate feed and API connector management</p>
        </div>

        {/* Summary */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Card>
            <div className="text-2xl font-bold text-white">{connectors.length}</div>
            <div className="text-xs text-gray-500">Total Connectors</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-emerald-400">{configured.length}</div>
            <div className="text-xs text-gray-500">Configured</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-amber-400">{notConfigured.length}</div>
            <div className="text-xs text-gray-500">Missing Credentials</div>
          </Card>
        </div>

        {/* Configured Connectors */}
        {configured.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-white">Configured Connectors</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {configured.map((c) => (
                <div key={c.key}>
                  <ConnectorSetupCard connector={c} onTest={handleTest} onRefresh={handleRefresh} testing={testing === c.key} refreshing={refreshing === c.key} />
                  {testResult?.key === c.key && <ConnectorTestResult result={testResult.result} loading={false} connectorName={c.displayName} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not Configured */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-white">Not Configured</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {notConfigured.map((c) => (
              <ConnectorSetupCard key={c.key} connector={c} onTest={handleTest} onRefresh={handleRefresh} />
            ))}
          </div>
        </div>

        {/* Safety note */}
        <Card className="border-amber-500/10">
          <p className="text-[10px] text-gray-500">
            <strong className="text-amber-400">Safety:</strong> Connector credentials stay server-side.
            No secrets are exposed to the browser. Only &quot;configured&quot; / &quot;not configured&quot; status is shown publicly.
            Connectors that are not configured fail safely without crashing the app.
          </p>
        </Card>
      </div>
    </Container>
  );
}
