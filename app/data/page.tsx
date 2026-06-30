"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { getStorageSummary, formatBytes } from "@/lib/data/getStorageSummary";
import { downloadSnapshot, validateSnapshot, importAllData } from "@/lib/data/exportAllData";
import type { DataSnapshot } from "@/lib/data/exportAllData";
import { clearLocalData } from "@/lib/data/clearLocalData";
import type { ClearTarget } from "@/lib/data/clearLocalData";
import { getStorageHealth } from "@/lib/storage/storageHealth";

export default function DataPage() {
  const [summary] = useState(() => getStorageSummary());
  const [health] = useState(() => getStorageHealth());
  const [importPreview, setImportPreview] = useState<DataSnapshot | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [status, setStatus] = useState<string | null>(null);
  const [clearTarget, setClearTarget] = useState<ClearTarget | null>(null);
  const [typedConfirm, setTypedConfirm] = useState("");

  const activeEntries = summary.entries.filter((e) => e.count > 0);

  function handleExport() {
    downloadSnapshot();
    setStatus("Data exported as JSON.");
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null);
    setImportPreview(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = validateSnapshot(reader.result as string);
      if (result.valid && result.data) {
        setImportPreview(result.data);
      } else {
        setImportError(result.message);
      }
    };
    reader.onerror = () => setImportError("Failed to read file.");
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleConfirmImport() {
    if (!importPreview) return;
    const result = importAllData(importPreview, importMode);
    setStatus(result.message);
    setImportPreview(null);
    window.location.reload();
  }

  function handleClear(target: ClearTarget) {
    if (target === "all" && typedConfirm !== "DELETE") return;
    clearLocalData(target);
    setClearTarget(null);
    setTypedConfirm("");
    setStatus(`Cleared ${target} data.`);
    window.location.reload();
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Your Local Data</h1>
        <p className="mb-8 text-gray-400">AuraCheck MVP stores data locally in this browser. Nothing is uploaded to an external server.</p>

        {/* ─── Storage Health ─── */}
        <Card className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-white">Storage Health</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-xs text-gray-500">localStorage Available</div>
              <div className="mt-1 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${health.localStorageAvailable ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-sm text-white">{health.localStorageAvailable ? "Yes" : "No"}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Estimated Usage</div>
              <div className="mt-1 text-sm text-white">{health.estimatedUsageFormatted} / 5 MB</div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full ${health.estimatedPercentage > 80 ? "bg-red-400" : health.estimatedPercentage > 50 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${Math.min(health.estimatedPercentage, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Corrupt Stores</div>
              <div className="mt-1 text-sm text-white">{health.corruptStores.length > 0 ? `${health.corruptStores.length} found` : "None"}</div>
              {health.corruptStores.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => { const { repaired } = window.__repairStores?.() ?? { repaired: 0 }; setStatus(`Repaired stores.`); }} className="mt-2">Repair</Button>
              )}
            </div>
          </div>
          {health.warning && (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-300">{health.warning}</div>
          )}
          <div className="mt-3 text-[10px] text-gray-600">Note: Private/incognito browsing may clear localStorage when the browser is closed.</div>
        </Card>

        {/* ─── Summary Cards ─── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeEntries.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState title="No local data found" description="Create an audit or unlock a product to see stored data here." actionLabel="Start Aura Check" actionHref="/audit/new" />
            </div>
          ) : (
            summary.entries.map((entry) => (
              <Card key={entry.key} className={`${entry.count === 0 ? "opacity-40" : ""}`}>
                <div className="mb-2 text-xs text-gray-500">{entry.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{entry.count}</span>
                  <span className="text-xs text-gray-500">{formatBytes(entry.estimatedBytes)}</span>
                </div>
                {entry.lastUpdated && (
                  <div className="mt-1 text-[10px] text-gray-600">Last: {new Date(entry.lastUpdated).toLocaleDateString("en-IN")}</div>
                )}
              </Card>
            ))
          )}
          <Card className="border-purple-500/20">
            <div className="mb-2 text-xs text-gray-500">Total Estimated</div>
            <div className="text-2xl font-bold text-white">{formatBytes(summary.totalEstimatedBytes)}</div>
            <div className="mt-1 text-[10px] text-gray-600">{activeEntries.length} store(s) with data</div>
          </Card>
        </div>

        {/* ─── Export / Import ─── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-white">Export All Data</h3>
            <p className="mb-4 text-xs text-gray-400">Download a JSON backup of all your AuraCheck data.</p>
            <Button onClick={handleExport} variant="outline" size="sm">Export as JSON</Button>
          </Card>
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-white">Import / Restore</h3>
            <p className="mb-4 text-xs text-gray-400">Upload a previously exported JSON backup.</p>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-purple-500/50 px-5 py-2.5 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/10">
              Choose File
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
            {importError && <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{importError}</div>}
            {importPreview && (
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="mb-2 text-xs text-emerald-400">Preview: {Object.keys(importPreview.stores).length} store(s) from {new Date(importPreview.exportedAt).toLocaleDateString("en-IN")}</p>
                <div className="mb-3 flex gap-2">
                  <label className="flex items-center gap-1 text-xs text-gray-400">
                    <input type="radio" name="importMode" checked={importMode === "merge"} onChange={() => setImportMode("merge")} /> Merge
                  </label>
                  <label className="flex items-center gap-1 text-xs text-gray-400">
                    <input type="radio" name="importMode" checked={importMode === "replace"} onChange={() => setImportMode("replace")} /> Replace
                  </label>
                </div>
                <Button onClick={handleConfirmImport} size="sm">Confirm Import</Button>
              </div>
            )}
          </Card>
        </div>

        {/* ─── Clear Data ─── */}
        <Card className="mb-8 border-red-500/20">
          <h3 className="mb-4 text-sm font-semibold text-white">Clear Data</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {([
              { target: "all" as ClearTarget, label: "Clear All Data", require: "DELETE" },
              { target: "audits" as ClearTarget, label: "Clear Audits Only" },
              { target: "orders" as ClearTarget, label: "Clear Orders Only" },
              { target: "analytics" as ClearTarget, label: "Clear Analytics Only" },
              { target: "leads" as ClearTarget, label: "Clear Leads Only" },
              { target: "referral" as ClearTarget, label: "Clear Referral Data" },
              { target: "challenges" as ClearTarget, label: "Clear Challenge Entries" },
              { target: "progress" as ClearTarget, label: "Clear Progress Data" },
            ].map((item) => (
              <div key={item.target}>
                {clearTarget === item.target ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                    <p className="mb-2 text-xs text-red-300">Confirm clearing {item.label}:</p>
                    {item.require ? (
                      <div className="space-y-2">
                        <input type="text" value={typedConfirm} onChange={(e) => setTypedConfirm(e.target.value)} placeholder='Type "DELETE" to confirm' className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:border-red-500/50 focus:outline-none" />
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" disabled={typedConfirm !== "DELETE"} onClick={() => handleClear(item.target)} className="text-red-400">Confirm</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setClearTarget(null); setTypedConfirm(""); }}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleClear(item.target)} className="text-red-400">Confirm</Button>
                        <Button size="sm" variant="ghost" onClick={() => setClearTarget(null)}>Cancel</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setClearTarget(item.target)} className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">{item.label}</Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {status && (
          <div className="mb-8 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{status}</div>
        )}
      </div>
    </Container>
  );
}
