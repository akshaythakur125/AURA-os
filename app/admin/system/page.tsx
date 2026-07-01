"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AdminSystemPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setAuthenticated(sessionStorage.getItem("auracheck_admin_auth") === "true"));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    Promise.resolve().then(async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setHealth(data);
      } catch { /* no-op */ }
    });
  }, [authenticated]);

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
            placeholder="Enter admin code"
            className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none" />
          <Button onClick={handleGate}>Enter</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-xs text-gray-500">App version, storage mode, and service status</p>
        </div>

        <div className="space-y-4">
          {health && (
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <Badge variant={health.status === "ok" ? "success" : "danger"}>{health.status as string}</Badge>
                </div>
                <div><div className="text-xs text-gray-500">App</div><div className="text-sm text-white">{health.app as string}</div></div>
                <div><div className="text-xs text-gray-500">Storage Mode</div><div className="text-sm text-white">{health.storageMode as string}</div></div>
                <div><div className="text-xs text-gray-500">App URL</div><div className="text-sm text-white">{health.appUrl as string}</div></div>
              </div>
            </Card>
          )}

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-white">Service Status</h3>
            <div className="space-y-2">
              <ServiceRow label="Supabase" status={health?.supabaseConfigured === true ? "ok" : "missing"} />
              <ServiceRow label="Razorpay" status={health?.razorpayConfigured === true ? "ok" : "missing"} />
              <ServiceRow label="Razorpay Webhook" status={health?.razorpayWebhookConfigured === true ? "ok" : "missing"} />
              <ServiceRow label="Commerce Refresh" status="info" />
              <ServiceRow label="Affiliate Disclosure" status="info" />
              <ServiceRow label="localStorage" status="ok" />
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-white">System Info</h3>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between"><span>App URL</span><span>{String(health?.appUrl || "—")}</span></div>
              <div className="flex justify-between"><span>Storage Mode</span><span>{String(health?.storageMode || "—")}</span></div>
              <div className="flex justify-between"><span>Supabase</span><span>{health?.supabaseConfigured ? "Configured" : "Not configured"}</span></div>
              <div className="flex justify-between"><span>Razorpay</span><span>{health?.razorpayConfigured ? "Configured" : "Not configured"}</span></div>
              <div className="flex justify-between"><span>Webhook</span><span>{health?.razorpayWebhookConfigured ? "Configured" : "Not configured"}</span></div>
              <div className="flex justify-between"><span>Timestamp</span><span>{health?.timestamp ? new Date(String(health.timestamp)).toLocaleString("en-IN") : "—"}</span></div>
            </div>
          </Card>

          <Card>
            <p className="text-[10px] text-gray-500">
              Use the Launch Control Center at /admin/launch for detailed production readiness checks and smoke tests.
            </p>
          </Card>
        </div>
      </div>
    </Container>
  );
}

function ServiceRow({ label, status }: { label: string; status: "ok" | "missing" | "info" }) {
  return (
    <div className="flex items-center justify-between rounded bg-white/5 px-2.5 py-1.5 text-xs">
      <span className="text-gray-300">{label}</span>
      <Badge variant={status === "ok" ? "success" : status === "missing" ? "danger" : "default"} className="text-[9px]">
        {status === "ok" ? "Active" : status === "missing" ? "Missing" : "Check manually"}
      </Badge>
    </div>
  );
}
