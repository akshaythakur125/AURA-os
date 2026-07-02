"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EnvironmentStatusTable } from "@/components/admin/EnvironmentStatusTable";
import { ProductionWarningCard } from "@/components/admin/ProductionWarningCard";
import { getAdminCodeWarning, logoutAdmin } from "@/lib/security/adminAuth";
import { getSecurityEvents, getSecurityEventStats, clearSecurityEvents } from "@/lib/security/securityEventStore";
import type { SecurityAuditResult, SecurityEvent } from "@/types/security";

export default function AdminSecurityPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [audit, setAudit] = useState<SecurityAuditResult | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((data) => setAuthenticated(!!data.authenticated))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    loadData();
  }, [authenticated]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/security/audit");
      const data = await res.json();
      if (data.success) setAudit(data.audit);

      setEvents(getSecurityEvents().slice(-50).reverse());
    } catch { /* no-op */ }
    setLoading(false);
  }

  async function handleGate() {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: gateInput }),
    });
    const data = await res.json();
    if (data.success) setAuthenticated(true);
  }

  const adminWarning = getAdminCodeWarning();
  const eventStats = getSecurityEventStats();

  const labelColors: Record<string, string> = {
    unsafe: "bg-red-500 text-white",
    test_mode: "bg-amber-500 text-black",
    acceptable: "bg-blue-500 text-white",
    production_ready: "bg-emerald-500 text-white",
  };

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
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
            <p className="text-xs text-gray-500">Security audit, secret exposure check, and event monitoring</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { logoutAdmin(); fetch("/api/admin/auth", { method: "DELETE" }); setAuthenticated(false); }}>Logout Admin</Button>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse"><div className="h-5 w-40 rounded bg-white/10" /></Card>
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* Admin code warning */}
            {adminWarning && (
              <div className="mb-6">
                <ProductionWarningCard warnings={[{ type: "critical", message: adminWarning }]} />
              </div>
            )}

            {/* Security score */}
            {audit && (
              <div className="mb-8">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Security Score</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${labelColors[audit.label] || ""}`}>
                      {audit.score}/100
                    </span>
                  </div>
                  <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full transition-all ${audit.score >= 90 ? "bg-emerald-500" : audit.score >= 75 ? "bg-blue-500" : audit.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${audit.score}%` }} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {audit.categories.map((cat) => (
                      <div key={cat.name} className="rounded-lg bg-white/5 p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-400">{cat.name}</span>
                          <span className="text-xs text-white">{cat.score}/{cat.maxScore}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: `${(cat.score / cat.maxScore) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Critical blockers */}
            {audit && audit.criticalBlockers.length > 0 && (
              <div className="mb-6">
                <Card>
                  <h3 className="mb-3 text-sm font-semibold text-red-400">Critical Blockers ({audit.criticalBlockers.length})</h3>
                  <div className="space-y-2">
                    {audit.criticalBlockers.map((b, i) => (
                      <div key={i} className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs">
                        <span className="text-red-300 font-medium">{b.name}:</span>
                        <span className="ml-2 text-gray-400">{b.message}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Category detail panels */}
            {audit && (
              <div className="mb-8 grid gap-6 lg:grid-cols-2">
                {audit.categories.map((cat) => (
                  <EnvironmentStatusTable key={cat.name} checks={cat.checks} title={cat.name} />
                ))}
              </div>
            )}

            {/* Security events */}
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Security Events ({eventStats.total})</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={loadData}>Refresh</Button>
                  <Button size="sm" variant="ghost" onClick={() => { clearSecurityEvents(); setEvents([]); }}>Clear</Button>
                </div>
              </div>
              {eventStats.total > 0 && (
                <div className="mb-3 grid grid-cols-4 gap-2 text-xs text-center">
                  <div><span className="text-red-400 font-bold">{eventStats.bySeverity.critical || 0}</span> <span className="text-gray-500">Critical</span></div>
                  <div><span className="text-amber-400 font-bold">{eventStats.bySeverity.high || 0}</span> <span className="text-gray-500">High</span></div>
                  <div><span className="text-blue-400 font-bold">{eventStats.bySeverity.medium || 0}</span> <span className="text-gray-500">Medium</span></div>
                  <div><span className="text-gray-400 font-bold">{eventStats.bySeverity.low || 0}</span> <span className="text-gray-500">Low</span></div>
                </div>
              )}
              {events.length === 0 ? (
                <p className="text-xs text-gray-500">No security events recorded.</p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-auto">
                  {events.slice(0, 30).map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded bg-white/5 px-2 py-1 text-[10px]">
                      <div className="flex items-center gap-2">
                        <Badge variant={e.severity === "critical" || e.severity === "high" ? "danger" : e.severity === "medium" ? "warning" : "default"} className="text-[8px]">{e.severity}</Badge>
                        <span className="text-gray-300">{e.eventType.replace(/_/g, " ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 max-w-[200px] truncate">{e.message}</span>
                        <span className="text-gray-600">{new Date(e.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Export */}
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Export security report for audit trail.</span>
                <Button size="sm" variant="outline" onClick={() => {
                  const report = { audit, events, exportedAt: new Date().toISOString() };
                  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `auracheck-security-report-${Date.now()}.json`;
                  a.click();
                }}>Export Report</Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </Container>
  );
}
