import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { refreshIndexFreshness } from "@/lib/commerce/prices/priceFreshnessEngine";
import { recomputeConfidenceForItem } from "@/lib/commerce/prices/priceConfidence";
import type { CommerceSearchItem } from "@/types/commerceSearch";

export const dynamic = "force-dynamic";
// Refresh can touch every catalog row; give it headroom beyond the default.
export const maxDuration = 60;

/**
 * Scheduled catalog refresh — wired to Vercel Cron every 72h (see vercel.json).
 *
 * What it genuinely does today:
 *  - When Supabase is configured, it re-derives each persisted product's
 *    freshness label + confidence score and stamps a new `updated_at`, so
 *    stored rows stay honest over time instead of silently ageing.
 *  - When Supabase is NOT configured (the default MVP state), the search
 *    index is rebuilt from the static catalog on every request anyway, so
 *    there is no persisted server-side state for a cron to mutate — the
 *    endpoint reports that honestly rather than faking a "refresh".
 *
 * What it deliberately does NOT do: invent live prices. The store
 * connectors (Amazon/Flipkart/Myntra/AJIO) are documented stubs with no
 * live feed, so there is no real price data to pull. Wiring a real feed
 * requires connector credentials (see lib/commerce/connectors/*Stub.ts);
 * once those exist, fetch-and-upsert can be added to the Supabase branch
 * below.
 */
export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET
  // is set. Enforce it when present; also accept the existing manual refresh
  // secret so the job can be triggered/tested by hand.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const refreshSecret = request.headers.get("x-refresh-secret");
  const validRefreshSecret = process.env.COMMERCE_REFRESH_SECRET;

  const cronAuthorized = !!cronSecret && authHeader === `Bearer ${cronSecret}`;
  const manualAuthorized = !!validRefreshSecret && refreshSecret === validRefreshSecret;

  if (cronSecret && !cronAuthorized && !manualAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const notes: string[] = [];
  if (!cronSecret) {
    notes.push(
      "CRON_SECRET is not set — set it in the environment so the scheduled endpoint is protected in production.",
    );
  }

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        mode: "static",
        processed: 0,
        message:
          "No server-side catalog store is configured (Supabase off). The static catalog is rebuilt from source on every request, so freshness is always computed live — there is nothing persisted for a scheduled job to refresh.",
        notes,
        startedAt,
        completedAt: new Date().toISOString(),
      });
    }

    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("commerce_search_index")
      .select("*")
      .eq("is_active", true)
      .limit(5000);

    if (error) {
      // Table may not exist yet — honest report, not a hard failure.
      return NextResponse.json({
        success: true,
        mode: "supabase",
        processed: 0,
        message:
          "Supabase is configured but the commerce_search_index table returned an error (it may not exist yet). Nothing to refresh.",
        detail: error.message,
        notes,
        startedAt,
        completedAt: new Date().toISOString(),
      });
    }

    const rows = (data || []) as unknown as CommerceSearchItem[];
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        mode: "supabase",
        processed: 0,
        message: "Supabase commerce_search_index is empty — nothing to refresh.",
        notes,
        startedAt,
        completedAt: new Date().toISOString(),
      });
    }

    const nowIso = new Date().toISOString();
    const refreshed = refreshIndexFreshness(rows).map((item) => ({
      ...item,
      confidenceScore: recomputeConfidenceForItem(item),
      updatedAt: nowIso,
    }));

    // The commerce_search_index table isn't in the generated Supabase types,
    // so the client infers a `never` row type; cast the builder to keep the
    // upsert payload honest without fighting the missing table typing.
    const { error: upsertError } = await (
      supabase.from("commerce_search_index") as unknown as {
        upsert: (rows: unknown[]) => Promise<{ error: { message: string } | null }>;
      }
    ).upsert(refreshed);

    if (upsertError) {
      return NextResponse.json(
        { success: false, mode: "supabase", error: upsertError.message, notes },
        { status: 500 },
      );
    }

    const distribution = refreshed.reduce<Record<string, number>>((acc, item) => {
      acc[item.priceFreshness] = (acc[item.priceFreshness] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      mode: "supabase",
      processed: refreshed.length,
      freshnessDistribution: distribution,
      notes,
      startedAt,
      completedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Catalog refresh failed",
        notes,
      },
      { status: 500 },
    );
  }
}
