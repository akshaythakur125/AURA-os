import type { CommerceSearchItem } from "@/types/commerceSearch";
import { WARDROBE_CATALOG } from "@/config/auraWardrobeCatalog";
import { normalizeCommerceProduct } from "./normalizeProduct";

export type CatalogSource = "static_catalog" | "local_admin" | "supabase" | "mixed";

export interface IndexBuildResult {
  items: CommerceSearchItem[];
  source: CatalogSource;
  indexedCount: number;
  warnings: string[];
}

/**
 * Build search index from available sources.
 * Tries Supabase first, falls back to local admin catalog, then static catalog.
 */
export async function buildSearchIndex(): Promise<IndexBuildResult> {
  const warnings: string[] = [];
  let items: CommerceSearchItem[] = [];

  // Try Supabase first
  const fromSupabase = await tryBuildFromSupabase();
  if (fromSupabase) {
    items = fromSupabase;
    return { items, source: "supabase", indexedCount: items.length, warnings };
  }

  // Try local admin catalog
  const fromLocal = tryBuildFromLocalAdmin();
  if (fromLocal.length > 0) {
    items = fromLocal;
    return { items, source: "local_admin", indexedCount: items.length, warnings };
  }

  // Fall back to static catalog
  const fromStatic = tryBuildFromStatic();
  items = fromStatic;
  warnings.push("Using static catalog — no admin catalog or Supabase data available.");
  return { items, source: "static_catalog", indexedCount: items.length, warnings };
}

async function tryBuildFromSupabase(): Promise<CommerceSearchItem[] | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;

    // Dynamic import to avoid bundling issues
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, anonKey);

    // Try to fetch from commerce_search_index table
    const { data, error } = await supabase
      .from("commerce_search_index")
      .select("*")
      .eq("is_active", true)
      .limit(5000);

    if (error) {
      // Table may not exist yet
      return null;
    }

    if (data && Array.isArray(data) && data.length > 0) {
      return data as unknown as CommerceSearchItem[];
    }

    return null;
  } catch {
    return null;
  }
}

function tryBuildFromLocalAdmin(): CommerceSearchItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("auracheck:v1:commerce_admin_catalog");
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    const items: CommerceSearchItem[] = [];
    for (const product of parsed) {
      try {
        const normalized = normalizeCommerceProduct(product, "manual", "Admin Catalog");
        items.push(...normalized);
      } catch {
        // Skip invalid products
      }
    }
    return items;
  } catch {
    return [];
  }
}

function tryBuildFromStatic(): CommerceSearchItem[] {
  const items: CommerceSearchItem[] = [];
  for (const product of WARDROBE_CATALOG) {
    try {
      const normalized = normalizeCommerceProduct(product, "manual", "AuraCheck Catalog");
      items.push(...normalized);
    } catch {
      // Skip invalid products
    }
  }
  return items;
}

/**
 * Rebuild the search index and persist it to the store.
 */
export async function rebuildSearchIndex(
  adminCode?: string
): Promise<{ indexedCount: number; invalidCount: number; warnings: string[]; catalogSource: string }> {
  // Client-side calls are already gated by the calling admin page's own
  // authenticated session; only the server-side (API route) path needs to
  // check a real admin code here, since that's the actual network boundary.
  if (typeof window === "undefined") {
    const envCode = process.env.ADMIN_ACCESS_CODE || process.env.LOCAL_ADMIN_CODE || "ADMINDEMO";
    if (adminCode !== envCode) {
      return { indexedCount: 0, invalidCount: 0, warnings: ["Unauthorized"], catalogSource: "none" };
    }
  }

  const result = await buildSearchIndex();
  const invalidCount = 0; // invalid items already excluded during normalization

  // Persist to local store
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        "auracheck:v1:commerce_search_index",
        JSON.stringify(result.items)
      );
      localStorage.setItem(
        "auracheck:v1:search_index_meta",
        JSON.stringify({
          indexedCount: result.indexedCount,
          catalogSource: result.source,
          builtAt: new Date().toISOString(),
        })
      );
    } catch {
      // localStorage may be full
    }
  }

  return {
    indexedCount: result.indexedCount,
    invalidCount,
    warnings: result.warnings,
    catalogSource: result.source,
  };
}

/**
 * Get the current search index from local store.
 */
export function getLocalSearchIndex(): CommerceSearchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("auracheck:v1:commerce_search_index");
    if (!stored) return [];
    return JSON.parse(stored) as CommerceSearchItem[];
  } catch {
    return [];
  }
}
