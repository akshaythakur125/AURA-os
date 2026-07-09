"use client";

import { useState, useEffect } from "react";
import { LiveCounter } from "./LiveCounter";
import { getSocialProof, type SocialProofData } from "@/lib/social-proof/getSocialProof";

interface Props {
  variant?: "hero" | "inline" | "compact";
  className?: string;
}

export function SocialProofBar({ variant = "inline", className = "" }: Props) {
  const [data, setData] = useState<SocialProofData | null>(null);

  useEffect(() => {
    setData(getSocialProof());
  }, []);

  if (!data || data.totalChecks === 0) return null;

  if (variant === "hero") {
    return (
      <div className={`flex items-center justify-center gap-6 sm:gap-10 ${className}`}>
        <LiveCounter value={data.totalChecks} label="checks completed" />
        <div className="h-8 w-px bg-white/10" />
        <LiveCounter value={data.checksToday} label="today" />
        {data.averageScore !== null && (
          <>
            <div className="h-8 w-px bg-white/10" />
            <LiveCounter value={data.averageScore} label="avg score" />
          </>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center justify-center gap-4 text-xs text-gray-500 ${className}`}>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {data.totalChecks.toLocaleString()} checks completed
        </span>
        {data.checksToday > 0 && (
          <span>{data.checksToday} today</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-6 sm:gap-8 ${className}`}>
      <LiveCounter value={data.totalChecks} label="total checks" />
      {data.checksToday > 0 && (
        <>
          <div className="h-6 w-px bg-white/10" />
          <LiveCounter value={data.checksToday} label="today" />
        </>
      )}
      {data.averageScore !== null && (
        <>
          <div className="h-6 w-px bg-white/10" />
          <LiveCounter value={data.averageScore} label="avg score" />
        </>
      )}
    </div>
  );
}
