import type { CommerceSearchItem, SearchClickEvent } from "@/types/commerceSearch";
import type { ConnectorImportResult, ConnectorStatus } from "@/types/storeConnector";
import { getItem, setItem } from "./localStore";

const SEARCH_INDEX_KEY = "auracheck:v1:commerce_search_index";
const SEARCH_META_KEY = "auracheck:v1:search_index_meta";
const IMPORT_RUNS_KEY = "auracheck:v1:import_runs";
const SEARCH_CLICKS_KEY = "auracheck:v1:search_clicks";

interface SearchIndexMeta {
  indexedCount: number;
  catalogSource: string;
  builtAt: string;
}

// ─── Search Index ───

export function getSearchIndex(): CommerceSearchItem[] {
  return getItem<CommerceSearchItem[]>(SEARCH_INDEX_KEY, []);
}

export function saveSearchIndex(items: CommerceSearchItem[]): void {
  setItem(SEARCH_INDEX_KEY, items);
}

export function getSearchIndexMeta(): SearchIndexMeta | null {
  return getItem<SearchIndexMeta | null>(SEARCH_META_KEY, null);
}

export function saveSearchIndexMeta(meta: SearchIndexMeta): void {
  setItem(SEARCH_META_KEY, meta);
}

export function clearSearchIndex(): void {
  setItem(SEARCH_INDEX_KEY, []);
  setItem(SEARCH_META_KEY, null);
}

export function getIndexedProductCount(): number {
  const meta = getSearchIndexMeta();
  return meta?.indexedCount || getSearchIndex().length;
}

export function getIndexCatalogSource(): string {
  const meta = getSearchIndexMeta();
  return meta?.catalogSource || "none";
}

// ─── Import Runs ───

export interface ImportRunRecord {
  id: string;
  connectorKey: string;
  sourceType: string;
  importedCount: number;
  invalidCount: number;
  warnings: string[];
  status: string;
  error?: string;
  timestamp: string;
}

export function getImportRuns(): ImportRunRecord[] {
  return getItem<ImportRunRecord[]>(IMPORT_RUNS_KEY, []);
}

export function addImportRun(result: ConnectorImportResult): void {
  const runs = getImportRuns();
  runs.push({
    id: `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    connectorKey: result.connectorKey,
    sourceType: result.connectorKey,
    importedCount: result.importedCount,
    invalidCount: result.invalidCount,
    warnings: result.warnings,
    status: result.status,
    error: result.error,
    timestamp: result.timestamp,
  });
  // Keep last 50 runs
  setItem(IMPORT_RUNS_KEY, runs.slice(-50));
}

export function getLastImportRun(): ImportRunRecord | null {
  const runs = getImportRuns();
  return runs.length > 0 ? runs[runs.length - 1] : null;
}

// ─── Search Clicks ───

export function getSearchClicks(): SearchClickEvent[] {
  return getItem<SearchClickEvent[]>(SEARCH_CLICKS_KEY, []);
}

export function addSearchClick(event: SearchClickEvent): void {
  const clicks = getSearchClicks();
  clicks.push(event);
  setItem(SEARCH_CLICKS_KEY, clicks);
}

export function getSearchClickStats(): {
  total: number;
  byStore: Record<string, number>;
  byQuery: Record<string, number>;
  affiliateCount: number;
} {
  const clicks = getSearchClicks();
  const byStore: Record<string, number> = {};
  const byQuery: Record<string, number> = {};
  let affiliateCount = 0;

  for (const c of clicks) {
    byStore[c.storeKey] = (byStore[c.storeKey] || 0) + 1;
    if (c.searchQuery) {
      byQuery[c.searchQuery] = (byQuery[c.searchQuery] || 0) + 1;
    }
    if (c.affiliateUsed) affiliateCount++;
  }

  return {
    total: clicks.length,
    byStore,
    byQuery,
    affiliateCount,
  };
}

// ─── Connector Status ───

export function getConnectorStatuses(): ConnectorStatus[] {
  return getItem<ConnectorStatus[]>("auracheck:v1:connector_statuses", []);
}

export function saveConnectorStatuses(statuses: ConnectorStatus[]): void {
  setItem("auracheck:v1:connector_statuses", statuses);
}

// ─── Freshness Summary ───

export function getFreshnessSummary(): {
  fresh: number;
  recent: number;
  stale: number;
  manual: number;
  unknown: number;
  total: number;
} {
  const index = getSearchIndex();
  const counts = { fresh: 0, recent: 0, stale: 0, manual: 0, unknown: 0 };

  for (const item of index) {
    const status = item.priceFreshness;
    if (status in counts) {
      (counts as Record<string, number>)[status]++;
    } else {
      counts.unknown++;
    }
  }

  return { ...counts, total: index.length };
}

// ─── Stale/Issue Reports ───

export function getStalePriceItems(): CommerceSearchItem[] {
  return getSearchIndex().filter(
    (item) => item.priceFreshness === "stale" || item.priceFreshness === "unknown"
  );
}

export function getMissingAffiliateItems(): CommerceSearchItem[] {
  return getSearchIndex().filter(
    (item) => !item.affiliateUrl || item.affiliateUrl === "#"
  );
}

export function getInvalidComparisonGroups(): { key: string; count: number }[] {
  const groups = new Map<string, number>();
  for (const item of getSearchIndex()) {
    const key = item.comparableGroupKey;
    groups.set(key, (groups.get(key) || 0) + 1);
  }

  return Array.from(groups.entries())
    .filter(([, count]) => count < 2) // Groups with only 1 item are "invalid" for comparison
    .map(([key, count]) => ({ key, count }));
}

// ─── Supabase Sync ───

export async function syncSearchIndexToSupabase(): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return false;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, anonKey);
    const items = getSearchIndex();

    if (items.length === 0) return false;

    // Batch upsert in chunks
    const chunkSize = 100;
    let success = true;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const { error } = await supabase
        .from("commerce_search_index")
        .upsert(
          chunk.map((item) => ({
            id: item.id,
            source_product_id: item.sourceProductId,
            normalized_title: item.normalizedTitle,
            original_title: item.originalTitle,
            category: item.category,
            sub_category: item.subCategory || null,
            store_key: item.storeKey,
            store_name: item.storeName,
            brand: item.brand || null,
            color_tags: item.colorTags,
            style_tags: item.styleTags,
            aura_leak_tags: item.auraLeakTags,
            goal_tags: item.goalTags,
            fit_tags: item.fitTags,
            material_tags: item.materialTags || null,
            price: item.price,
            mrp: item.mrp || null,
            discount_percent: item.discountPercent || null,
            currency: item.currency,
            product_url: item.productUrl,
            affiliate_url: item.affiliateUrl || null,
            image_url: item.imageUrl || null,
            availability_status: item.availabilityStatus,
            source_type: item.sourceType,
            source_name: item.sourceName,
            price_freshness: item.priceFreshness,
            last_checked_at: item.lastCheckedAt || null,
            last_checked_text: item.lastCheckedText,
            confidence_score: item.confidenceScore,
            search_tokens: item.searchTokens,
            comparable_group_key: item.comparableGroupKey,
            is_sponsored: item.isSponsored,
            is_affiliate: item.isAffiliate,
            is_active: item.isActive,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
          })),
          { onConflict: "id", ignoreDuplicates: false }
        );

      if (error) {
        console.error("Failed to sync chunk to Supabase:", error);
        success = false;
      }
    }

    return success;
  } catch {
    return false;
  }
}
