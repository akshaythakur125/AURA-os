"use client";

import { useEffect } from "react";
import { getAudits } from "@/lib/storage/auditStore";
import { syncAllLocalAuditsToSupabase } from "@/lib/supabase/syncAudits";
import { getAnonymousId } from "@/lib/storage/anonymousId";

export function AuditSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const anonId = getAnonymousId();
    if (!anonId) return;
    const audits = getAudits();
    if (audits.length > 0) {
      syncAllLocalAuditsToSupabase(audits).catch(() => {});
    }
  }, []);

  return <>{children}</>;
}
