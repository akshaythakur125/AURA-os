import { getSupabaseClient } from "@/lib/supabase/client";
import { getAnonymousId } from "@/lib/storage/anonymousId";
import type { Audit } from "@/types/audit";

let _synced = false;

export async function syncAuditToSupabase(audit: Audit): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const anonId = getAnonymousId();
  if (!anonId) return;

  const statusLeaks: string[] = [];
  if (audit.fullReport?.fullContent) {
    for (const leak of audit.fullReport.fullContent.biggestStatusLeaks || []) {
      statusLeaks.push(leak.title);
    }
  } else if (audit.fullReport?.leaks) {
    for (const leak of audit.fullReport.leaks) {
      statusLeaks.push(leak.title);
    }
  }

  const row = {
    id: audit.id,
    anonymous_id: anonId,
    created_at: audit.createdAt,
    free_score: audit.freeScore ?? null,
    report_status: audit.reportStatus,
    unlock_status: audit.unlockStatus,
    goal: audit.goal ?? null,
    budget_range: audit.budgetRange ?? null,
    archetype: audit.fullReport?.fullContent?.category ?? audit.fullReport?.freeResult?.category ?? null,
    photo_issues: statusLeaks.length > 0 ? statusLeaks : null,
  };

  try {
    await supabase.from("audits").upsert(row, { onConflict: "id" });
  } catch {
    // silent — localStorage is the fallback
  }
}

export async function syncAllLocalAuditsToSupabase(audits: Audit[]): Promise<void> {
  if (_synced) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const anonId = getAnonymousId();
  if (!anonId) return;
  _synced = true;

  const rows = audits.map((audit) => {
    const statusLeaks: string[] = [];
    if (audit.fullReport?.fullContent) {
      for (const leak of audit.fullReport.fullContent.biggestStatusLeaks || []) {
        statusLeaks.push(leak.title);
      }
    } else if (audit.fullReport?.leaks) {
      for (const leak of audit.fullReport.leaks) {
        statusLeaks.push(leak.title);
      }
    }

    return {
      id: audit.id,
      anonymous_id: anonId,
      created_at: audit.createdAt,
      free_score: audit.freeScore ?? null,
      report_status: audit.reportStatus,
      unlock_status: audit.unlockStatus,
      goal: audit.goal ?? null,
      budget_range: audit.budgetRange ?? null,
    archetype: audit.fullReport?.fullContent?.category ?? audit.fullReport?.freeResult?.category ?? null,
      photo_issues: statusLeaks.length > 0 ? statusLeaks : null,
    };
  });

  try {
    await supabase.from("audits").upsert(rows, { onConflict: "id" });
  } catch {
    // silent
  }
}
