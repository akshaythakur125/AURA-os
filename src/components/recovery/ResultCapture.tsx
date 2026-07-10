"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Audit } from "@/types/audit";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

interface Props {
  audit: Audit;
}

export function ResultCapture({ audit }: Props) {
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const heroLeak = useMemo(() => {
    const leaks = audit.fullReport?.fullContent?.biggestStatusLeaks;
    if (leaks && leaks.length > 0) return leaks[0].title;
    return audit.fullReport?.freeResult?.statusLeaks?.[0]?.title || null;
  }, [audit]);

  const score = audit.freeScore;

  function handleSubmit() {
    if (!value.trim()) return;
    setSubmitted(true);
    trackEvent(EVENTS.RECOVERY_EMAIL_CAPTURED, { channel, auditId: audit.id });
  }

  if (submitted) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white">Result saved</p>
          <p className="mt-1 text-xs text-gray-400">
            {channel === "email" ? (
              <>We&apos;ll send your score ({score}/100) and {heroLeak || "your biggest leak"} to <span className="text-white">{value}</span></>
            ) : (
              <>We&apos;ll send your score ({score}/100) and {heroLeak || "your biggest leak"} to WhatsApp</>
            )}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500/20 bg-purple-500/5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
          <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">Don&apos;t lose this</h3>
        <p className="mt-1 text-xs text-gray-400">
          Save your score {score !== null && <span className="text-white">({score}/100)</span>}
          {heroLeak && <> and &ldquo;{heroLeak}&rdquo; finding</>} so you can pick up where you left off.
        </p>

        {/* Channel toggle */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setChannel("email")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              channel === "email" ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setChannel("whatsapp")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              channel === "whatsapp" ? "bg-emerald-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            WhatsApp
          </button>
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <input
            type={channel === "email" ? "email" : "tel"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={channel === "email" ? "your@email.com" : "+91 98765 43210"}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <Button size="sm" onClick={handleSubmit} disabled={!value.trim()}>
            Save
          </Button>
        </div>

        <p className="mt-2 text-[10px] text-gray-600">
          We&apos;ll send your result once — no spam, no marketing.
        </p>
      </div>
    </Card>
  );
}
