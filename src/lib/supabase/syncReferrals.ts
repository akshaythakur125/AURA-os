import { getSupabaseClient } from "@/lib/supabase/client";
import { getAnonymousId } from "@/lib/storage/anonymousId";
import type { ReferralProfile } from "@/types/referral";

export async function syncReferralProfileToSupabase(profile: ReferralProfile): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const anonId = getAnonymousId();
  if (!anonId) return;

  try {
    await supabase.from("referrals").upsert(
      {
        anonymous_id: anonId,
        referral_code: profile.referralCode,
        referred_count: profile.totalClaimsLocal,
      },
      { onConflict: "anonymous_id" }
    );
  } catch {
    // silent
  }
}

export async function getReferralStatsFromSupabase(): Promise<{
  referredCount: number;
  exists: boolean;
} | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const anonId = getAnonymousId();
  if (!anonId) return null;

  try {
    const { data, error } = await supabase
      .from("referrals")
      .select("referred_count")
      .eq("anonymous_id", anonId)
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return { referredCount: data[0].referred_count, exists: true };
  } catch {
    return null;
  }
}

export async function redeemReferralCodeAsync(code: string): Promise<{
  success: boolean;
  newCount: number;
} | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.rpc("redeem_referral_code", {
      code,
    });
    if (error || !data) return null;
    const row = Array.isArray(data) ? data[0] : data;
    return { success: row.success, newCount: row.new_count };
  } catch {
    return null;
  }
}
