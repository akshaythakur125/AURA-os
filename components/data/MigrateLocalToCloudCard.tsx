"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import {
  getMigrationPreview,
  migrateAudits,
  migrateOrders,
  migrateLeads,
  migrateAnalytics,
} from "@/lib/migration/migrateLocalToSupabase";
import type { MigrationPreview } from "@/lib/migration/migrateLocalToSupabase";

export function MigrateLocalToCloudCard() {
  const [preview] = useState<MigrationPreview | null>(() => {
    return isSupabaseConfigured() ? getMigrationPreview() : null;
  });
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured()) return null;

  const total =
    (preview?.auditsCount || 0) +
    (preview?.ordersCount || 0) +
    (preview?.leadsCount || 0) +
    (preview?.analyticsCount || 0);

  if (total === 0) {
    return (
      <Card className="border-purple-500/20">
        <Badge variant="premium" className="mb-3">Cloud Sync</Badge>
        <h3 className="mb-2 text-sm font-semibold text-white">Move local data to cloud database</h3>
        <p className="text-xs text-gray-500">No local data found to migrate.</p>
      </Card>
    );
  }

  const handleMigrate = async () => {
    setMigrating(true);
    setResult(null);
    setError(null);
    try {
      const auditResult = await migrateAudits();
      const orderResult = await migrateOrders();
      const leadResult = await migrateLeads();
      const analyticsResult = await migrateAnalytics();

      setResult(
        `Audits: ${auditResult.success} ok, ${auditResult.failed} failed | ` +
        `Orders: ${orderResult.success} ok, ${orderResult.failed} failed | ` +
        `Leads: ${leadResult.success} ok, ${leadResult.failed} failed | ` +
        `Analytics: ${analyticsResult.success} ok, ${analyticsResult.failed} failed`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Card className="border-purple-500/20">
      <Badge variant="premium" className="mb-3">Cloud Sync</Badge>
      <h3 className="mb-3 text-sm font-semibold text-white">Move local data to cloud database</h3>
      <div className="mb-4 space-y-1 text-xs text-gray-400">
        <p>Local backup remains in this browser after migration.</p>
        <p>Duplicate audits (same ID already in cloud) will be skipped.</p>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/5 p-2">
          <div className="text-gray-500">Audits</div>
          <div className="text-lg font-bold text-white">{preview?.auditsCount || 0}</div>
          {preview && preview.auditsWithImages > 0 && (
            <div className="text-gray-600">{preview.auditsWithImages} with images</div>
          )}
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <div className="text-gray-500">Orders</div>
          <div className="text-lg font-bold text-white">{preview?.ordersCount || 0}</div>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <div className="text-gray-500">Leads</div>
          <div className="text-lg font-bold text-white">{preview?.leadsCount || 0}</div>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <div className="text-gray-500">Analytics</div>
          <div className="text-lg font-bold text-white">{preview?.analyticsCount || 0}</div>
        </div>
      </div>

      {result && (
        <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          {result}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      <Button
        onClick={handleMigrate}
        disabled={migrating}
        className="w-full"
        size="sm"
      >
        {migrating ? "Migrating..." : `Migrate ${total} items to cloud`}
      </Button>
    </Card>
  );
}
