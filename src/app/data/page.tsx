"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { getStorageSummary, type StorageSummary } from "@/lib/data/getStorageSummary";
import { exportAllData, downloadExport, type ExportedData } from "@/lib/data/exportAllData";
import { validateImportData, importAllData, type ImportResult } from "@/lib/data/importAllData";
import { clearLocalData, type ClearTarget } from "@/lib/data/clearLocalData";
import { estimateLocalStorageUsage, checkStorageAvailability, detectCorruptStore, repairKnownStores, isLowOnStorage, formatStorageBytes } from "@/lib/storage/storageHealth";

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function DataPage() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState<ClearTarget | null>(null);
  const [importPreview, setImportPreview] = useState<ExportedData | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importError, setImportError] = useState<string | null>(null);

  const summary = useMemo(() => getStorageSummary(), [refreshKey]);
  const storageUsage = useMemo(() => estimateLocalStorageUsage(), [refreshKey]);
  const storageAvail = useMemo(() => checkStorageAvailability(), [refreshKey]);
  const lowStorage = useMemo(() => isLowOnStorage(), [refreshKey]);

  const dataTypes = useMemo(() => [
    { label: "Audits", count: summary.audits.count, size: summary.audits.size, updated: summary.lastUpdated.audits, key: "audits" as ClearTarget },
    { label: "Orders / Payments", count: summary.orders.count, size: summary.orders.size, updated: summary.lastUpdated.orders, key: "orders" as ClearTarget },
    { label: "Unlock Records", count: summary.unlocks.count, size: summary.unlocks.size, updated: "", key: "unlocks" as ClearTarget },
    { label: "Leads / Contact Requests", count: summary.leads.count, size: summary.leads.size, updated: summary.lastUpdated.leads, key: "leads" as ClearTarget },
    { label: "Analytics Events", count: summary.analytics.count, size: summary.analytics.size, updated: summary.lastUpdated.analytics, key: "analytics" as ClearTarget },
    { label: "Affiliate Clicks", count: summary.affiliateClicks.count, size: summary.affiliateClicks.size, updated: "", key: "affiliate_clicks" as ClearTarget },
    { label: "Referral Data", count: summary.referralClaims.count, size: summary.referralProfile.size + summary.referralClaims.size, updated: "", key: "referral" as ClearTarget },
    { label: "Challenge Entries", count: summary.challengeEntries.count, size: summary.challengeEntries.size, updated: summary.lastUpdated.challengeEntries, key: "challenges" as ClearTarget },
    { label: "Progress Comparisons", count: summary.progressComparisons.count, size: summary.progressComparisons.size, updated: summary.lastUpdated.progressComparisons, key: "progress" as ClearTarget },
    { label: "Onboarding State", count: summary.onboarding.exists ? 1 : 0, size: summary.onboarding.size, updated: "", key: "onboarding" as ClearTarget },
    { label: "User Preferences", count: summary.user.exists ? 1 : 0, size: summary.user.size, updated: "", key: "user" as ClearTarget },
    { label: "Settings", count: summary.settings.exists ? 1 : 0, size: summary.settings.size, updated: "", key: "settings" as ClearTarget },
  ], [summary]);

  function handleExport() {
    const data = exportAllData();
    downloadExport(data);
    toast("Data exported successfully", "success");
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = validateImportData(text);
      if (!result.valid || !result.data) {
        setImportError(result.error || "Invalid file");
        setImportPreview(null);
      } else {
        setImportPreview(result.data);
        setImportError(null);
      }
    };
    reader.onerror = () => {
      setImportError("Failed to read file");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleConfirmImport() {
    if (!importPreview) return;
    const result = importAllData(importPreview, importMode);
    if (result.success) {
      toast(`Imported ${result.importedKeys.length} data types`, "success");
    } else {
      toast(`Import completed with ${result.errors.length} errors`, "warning");
    }
    setImportPreview(null);
    setRefreshKey((k) => k + 1);
  }

  function handleClear(target: ClearTarget) {
    setConfirmTarget(target);
  }

  function executeClear() {
    if (!confirmTarget) return;
    const removed = clearLocalData(confirmTarget);
    toast(`Cleared ${removed.length} storage keys`, "success");
    setConfirmTarget(null);
    setRefreshKey((k) => k + 1);
  }

  function handleRepair() {
    const results = repairKnownStores();
    if (results.length > 0) {
      toast(`Repaired ${results.length} stores`, "success");
    } else {
      toast("No corrupted stores found", "info");
    }
    setRefreshKey((k) => k + 1);
  }

  const totalItems = dataTypes.reduce((s, d) => s + d.count, 0);
  const isServer = typeof window === "undefined";

  if (isServer) return null;

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Your Local Data</h1>
        <p className="mt-1 text-sm text-gray-500">See what AuraCheck stores in your browser and manage your data.</p>
      </div>

      {/* Storage Health */}
      <Card className="mb-8">
        <h3 className="mb-4 text-sm font-semibold text-white">Storage Health</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">localStorage Available</div>
            <div className="mt-1 text-sm font-medium text-white">{storageAvail.available ? "Yes" : "No"}</div>
            {storageAvail.error && <p className="mt-1 text-[10px] text-amber-400">{storageAvail.error}</p>}
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Estimated Usage</div>
            <div className="mt-1 text-sm font-medium text-white">{formatStorageBytes(storageUsage.totalBytes)}</div>
            {lowStorage && <p className="mt-1 text-[10px] text-amber-400">Storage is running low</p>}
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Total Items</div>
            <div className="mt-1 text-sm font-medium text-white">{totalItems}</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <div className="text-xs text-gray-500">Private Mode</div>
            <div className="mt-1 text-sm font-medium text-white">{storageAvail.isPrivateMode === null ? "Unknown" : storageAvail.isPrivateMode ? "Likely" : "No"}</div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button variant="ghost" size="sm" onClick={handleRepair}>Repair Corrupted Stores</Button>
        </div>
      </Card>

      {/* Data Summary Table */}
      <Card className="mb-8">
        <h3 className="mb-4 text-sm font-semibold text-white">Data Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="pb-2 pr-4 font-medium">Data Type</th>
                <th className="pb-2 pr-4 font-medium">Count</th>
                <th className="pb-2 pr-4 font-medium">Estimated Size</th>
                <th className="pb-2 pr-4 font-medium">Last Updated</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataTypes.map((dt) => (
                <tr key={dt.key} className="border-b border-white/5 text-gray-300">
                  <td className="py-2 pr-4 text-white">{dt.label}</td>
                  <td className="py-2 pr-4">{dt.count}</td>
                  <td className="py-2 pr-4 text-gray-500">{formatStorageBytes(dt.size)}</td>
                  <td className="py-2 pr-4 text-[10px] text-gray-500">{formatDate(dt.updated)}</td>
                  <td className="py-2">
                    {dt.count > 0 && (
                      <button
                        onClick={() => handleClear(dt.key)}
                        className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-300 hover:bg-red-500/30"
                      >
                        Clear
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export/Import */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-white">Export All Data</h3>
          <p className="mb-4 text-xs text-gray-500">Download a JSON backup of all your local AuraCheck data. Includes audits, orders, analytics, and more.</p>
          <Button size="sm" onClick={handleExport}>Download Backup</Button>
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-white">Import Data</h3>
          <p className="mb-4 text-xs text-gray-500">Restore from a previous backup. Choose merge (adds to existing) or replace (overwrites).</p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setImportMode("merge")}
              className={`rounded-lg px-3 py-1 text-xs transition-colors ${importMode === "merge" ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500 hover:text-white"}`}
            >
              Merge
            </button>
            <button
              onClick={() => setImportMode("replace")}
              className={`rounded-lg px-3 py-1 text-xs transition-colors ${importMode === "replace" ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-500 hover:text-white"}`}
            >
              Replace
            </button>
          </div>
          <label className="inline-block cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300 transition-colors hover:bg-white/10">
            Select Backup File
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
          {importError && <p className="mt-2 text-xs text-red-400">{importError}</p>}
        </Card>
      </div>

      {/* Import Preview */}
      {importPreview && (
        <Card className="mb-8 border-purple-500/30">
          <h3 className="mb-4 text-sm font-semibold text-white">Import Preview</h3>
          <div className="space-y-2 text-xs text-gray-400">
            <p><span className="text-gray-500">Backup created:</span> {formatDate(importPreview.exportedAt)}</p>
            <p><span className="text-gray-500">Data types included:</span> {Object.keys(importPreview.data).length}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(importPreview.data).map(([key, val]) => {
                const count = Array.isArray(val) ? val.length : typeof val === "object" && val ? 1 : 0;
                return <Badge key={key} variant="default">{key.split(":").pop()} ({count})</Badge>;
              })}
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button size="sm" onClick={handleConfirmImport}>Confirm Import ({importMode})</Button>
            <Button variant="ghost" size="sm" onClick={() => setImportPreview(null)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="mb-8 border-red-500/20">
        <h3 className="mb-4 text-sm font-semibold text-red-400">Danger Zone</h3>
        <p className="mb-4 text-xs text-gray-500">These actions cannot be undone. Make sure you have exported your data first.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" size="sm" onClick={() => handleClear("all")}>Clear All Local Data</Button>
          <Button variant="ghost" size="sm" onClick={() => handleClear("audits")}>Clear Only Audits</Button>
          <Button variant="ghost" size="sm" onClick={() => handleClear("orders")}>Clear Only Orders</Button>
          <Button variant="ghost" size="sm" onClick={() => handleClear("analytics")}>Clear Only Analytics</Button>
          <Button variant="ghost" size="sm" onClick={() => handleClear("leads")}>Clear Only Leads</Button>
          <Button variant="ghost" size="sm" onClick={() => handleClear("referral")}>Clear Referral/Challenge/Progress</Button>
        </div>
      </Card>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-gray-600">
        AuraCheck MVP stores data locally in this browser. Nothing is uploaded to an external server.
        Clearing browser data may remove your audits and reports.
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmTarget !== null}
        title={`Clear ${confirmTarget === "all" ? "All Data" : confirmTarget + " data"}?`}
        message={confirmTarget === "all"
          ? "This will delete ALL local AuraCheck data including audits, orders, analytics, leads, referrals, challenges, and settings."
          : `This will delete all ${confirmTarget} data stored in your browser.`
        }
        confirmLabel="DELETE"
        variant="danger"
        requireTypedConfirm="DELETE"
        onConfirm={executeClear}
        onCancel={() => setConfirmTarget(null)}
      />
    </Container>
  );
}
