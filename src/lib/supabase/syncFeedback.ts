import { getSupabaseClient } from "@/lib/supabase/client";
import { getAnonymousId } from "@/lib/storage/anonymousId";
import type { FeedbackRecord } from "@/lib/storage/feedbackStore";

/**
 * Push a real review/feedback to Supabase so the owner can collect genuine
 * testimonials over time. Best-effort and silent — the app already writes
 * other tables from the client with the anon key (see syncReferrals).
 *
 * Requires a `feedback` table in Supabase:
 *   create table feedback (
 *     id            uuid primary key default gen_random_uuid(),
 *     anonymous_id  text,
 *     audit_id      text,
 *     product_type  text,
 *     rating        int  check (rating between 1 and 5),
 *     comment       text,
 *     feature_consent boolean default false,
 *     created_at    timestamptz default now()
 *   );
 *   alter table feedback enable row level security;
 *   create policy "anon can insert feedback" on feedback
 *     for insert to anon with check (true);
 */
export async function pushFeedbackToSupabase(record: FeedbackRecord): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from("feedback").insert({
      anonymous_id: getAnonymousId() || null,
      audit_id: record.auditId,
      product_type: record.productType,
      rating: record.rating,
      comment: record.comment || null,
      feature_consent: record.featureConsent,
    });
  } catch {
    // silent — feedback is still saved locally
  }
}
