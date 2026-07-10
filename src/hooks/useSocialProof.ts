"use client";

import { useState, useEffect } from "react";
import { getSocialProofAsync, type SocialProofData } from "@/lib/social-proof/getSocialProof";

export function useSocialProof(): SocialProofData & { loading: boolean } {
  const [data, setData] = useState<SocialProofData>({
    checksToday: 0,
    totalChecks: 0,
    unlocksToday: 0,
    averageScore: null,
    percentile: () => 50,
    loading: true,
  } as SocialProofData & { loading: boolean });

  useEffect(() => {
    let cancelled = false;
    getSocialProofAsync().then((result) => {
      if (!cancelled) setData({ ...result, loading: false } as SocialProofData & { loading: boolean });
    });
    return () => { cancelled = true; };
  }, []);

  return data as SocialProofData & { loading: boolean };
}
