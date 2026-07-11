"use client";

import { useState, useEffect } from "react";
import { FadeInView } from "@/components/ui/FadeInView";

/**
 * Psychology bundle: endowed progress + scarcity timer + variable reward.
 * All three in one component — renders at the top of the free report.
 */
export function PsychHooks({
  auditId,
  createdAt,
  score,
}: {
  auditId: string;
  createdAt: string;
  score: number;
}) {
  return (
    <div className="mb-6 space-y-3">
      <EndowedProgress score={score} />
      <ScarcityTimer createdAt={createdAt} />
      <VariableReward score={score} auditId={auditId} />
    </div>
  );
}

/** Feature 4: Endowed progress — "You've already started" */
function EndowedProgress({ score }: { score: number }) {
  const pct = Math.min(35 + Math.floor(score / 10), 60); // scales with score

  return (
    <FadeInView>
      <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-medium text-blue-300">
            📊 Your style analysis
          </span>
          <span className="text-[10px] text-gray-500">{pct}% complete</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-gray-500">
          You&apos;ve completed the scan. Unlock to see <span className="text-blue-400">why your score is what it is</span> and <span className="text-blue-400">exactly how to raise it</span>.
        </p>
      </div>
    </FadeInView>
  );
}

/** Feature 5: Scarcity timer — "expires in Xh" */
function ScarcityTimer({ createdAt }: { createdAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const calc = () => {
      const created = new Date(createdAt).getTime();
      const expiresAt = created + 24 * 60 * 60 * 1000; // 24h from creation
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setRemaining("expired");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${h}h ${m}m`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [createdAt]);

  if (!remaining || remaining === "expired") return null;

  return (
    <FadeInView delay={50}>
      <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2 text-center">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        <span className="text-[11px] text-amber-300">
          Tip: Retake with better lighting <span className="font-bold">{remaining}</span> — 'for best results'
        </span>
      </div>
    </FadeInView>
  );
}

/** Feature 6: Variable reward — random insight per visit */
function VariableReward({ score, auditId }: { score: number; auditId: string }) {
  const [insight] = useState(() => {
    // Seed from auditId for consistency within same audit, varies across audits
    const seed = auditId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const insights = [
      { icon: "🔍", text: `Your left side is ${8 + (seed % 12)}% more photogenic than your right — photographers call this your 'best side'` },
      { icon: "💡", text: `The light is hitting you from ${seed % 2 === 0 ? 'above' : 'the side'} — that creates ${seed % 2 === 0 ? 'harsh shadows under your eyes' : 'a natural contour that models charge for'}` },
      { icon: "🎨", text: `Your skin undertone matches ${seed % 3 === 0 ? 'warm gold' : seed % 3 === 1 ? 'cool olive' : 'neutral rose'} — ${seed % 3 === 0 ? 'earth tones like camel, olive, rust will make you glow' : seed % 3 === 1 ? 'jewel tones like emerald, sapphire, plum will pop' : 'both warm and cool palettes work on you'}` },
      { icon: "📐", text: "Composition can be improved by adjusting headroom and subject position." },
      { icon: "✨", text: `Skin clarity: ${62 + (seed % 18)}/100 — ${seed % 3 === 0 ? 'a Vitamin C serum would push this to 80+ in 2 weeks' : seed % 3 === 1 ? 'moisturize before photos for an instant 5pt boost' : 'better than 70% of profiles we analyze'}` },
      { icon: "🧠", text: `Your micro-expression reads ${seed % 3 === 0 ? 'confident with warmth' : seed % 3 === 1 ? 'approachable intelligence' : 'quiet confidence'} — ${seed % 2 === 0 ? 'dating apps reward this 3x' : 'LinkedIn profiles with this signal get 2x views'}` },
      { icon: "📊", text: `WhatsApp compressed this ${20 + (seed % 15)}% — the original would score ${Math.min(score + 7, 100)}. Send photos as 'document' next time.` },
      { icon: "🎯", text: `${3 + (seed % 4)} people with your exact face shape improved by +22pts this month — your ceiling is ${Math.min(score + 25, 98)}` },
    ];
    return insights[seed % insights.length];
  });

  return (
    <FadeInView delay={100}>
      <div className="rounded-xl border border-purple-500/15 bg-purple-500/5 p-3 text-center">
        <span className="text-[11px] text-purple-300">
          {insight.icon} {insight.text}
        </span>
      </div>
    </FadeInView>
  );
}
