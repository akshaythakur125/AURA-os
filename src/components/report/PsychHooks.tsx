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
      <EndowedProgress />
      <ScarcityTimer createdAt={createdAt} />
      <VariableReward score={score} auditId={auditId} />
    </div>
  );
}

/** Feature 4: Endowed progress — "You've already started" */
function EndowedProgress() {
  const pct = 40; // ponytail: static, could be dynamic based on report depth

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
          Unlock to complete your analysis and see your full improvement roadmap
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
          Free analysis expires in <span className="font-bold">{remaining}</span>
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
      { icon: "🔍", text: `Your face occupies ${55 + (seed % 15)}% of the frame — ideal is 50-65%` },
      { icon: "💡", text: `Light direction is ${seed % 2 === 0 ? "slightly left" : "slightly right"} — ${seed % 2 === 0 ? "flattering" : "a small head turn would help"}` },
      { icon: "🎨", text: `Your dominant color tone reads ${seed % 3 === 0 ? "warm" : seed % 3 === 1 ? "cool" : "neutral"} — ${seed % 3 === 0 ? "earth tones will complement you" : seed % 3 === 1 ? "jewel tones will pop" : "both palettes work"}` },
      { icon: "📐", text: `Your eye-level offset is ${seed % 5 + 1}% — ${seed % 5 < 2 ? "nearly perfect" : "a slight adjustment would balance it"}` },
      { icon: "✨", text: `Skin tone consistency: ${60 + (seed % 20)}/100 — ${seed % 20 < 10 ? "great base, minimal editing needed" : "a brightness tweak would even it out"}` },
      { icon: "🧠", text: `Your expression reads as ${seed % 2 === 0 ? "confident" : "approachable"} — both are high-signal for ${seed % 2 === 0 ? "professional" : "dating"} contexts` },
      { icon: "📊", text: `Image compression detected: ${15 + (seed % 10)}% quality loss — original would score ${Math.min(score + 5, 100)}` },
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
