"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import type { StatusLeak } from "@/types";

interface BattleResultProps {
  leftScore: number;
  rightScore: number;
  leftLeaks: StatusLeak[];
  rightLeaks: StatusLeak[];
  leftLabel: string;
  rightLabel: string;
  onShare?: () => void;
}

function AnimatedScore({ score, delay }: { score: number; delay: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(score);
      return;
    }
    const timer = setTimeout(() => {
      const duration = 1200;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(score * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return <span className="tabular-nums">{display}</span>;
}

function getWinnerGap(left: number, right: number): number {
  return Math.abs(left - right);
}

export function BattleResult({ leftScore, rightScore, leftLeaks, rightLeaks, leftLabel, rightLabel, onShare }: BattleResultProps) {
  const leftWins = leftScore > rightScore;
  const rightWins = rightScore > leftScore;
  const tie = leftScore === rightScore;
  const gap = getWinnerGap(leftScore, rightScore);
  const totalLeaks = leftLeaks.length + rightLeaks.length;

  const winnerLeaks = leftWins ? leftLeaks : rightLeaks;
  const loserLeaks = leftWins ? rightLeaks : leftLeaks;

  const loserUniqueLeaks = loserLeaks.filter(
    (l) => !winnerLeaks.some((w) => w.title === l.title)
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Left Score */}
        <div className={`relative rounded-2xl border p-6 text-center transition-all ${
          leftWins ? "border-yellow-400/40 bg-yellow-400/5 shadow-[0_0_30px_rgba(250,204,21,0.08)]" : "border-white/10 bg-white/[0.02]"
        }`}>
          {leftWins && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="text-xl" role="img" aria-label="crown">👑</span>
            </div>
          )}
          <p className="mb-2 text-xs text-gray-500">{leftLabel}</p>
          <div className="text-5xl font-bold text-white">
            <AnimatedScore score={leftScore} delay={0} />
          </div>
          {leftWins && <Badge variant="premium" className="mt-2">Winner</Badge>}
          {tie && <Badge variant="default" className="mt-2">Tie</Badge>}
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-white/5 px-4 py-2 text-sm font-bold text-gray-500">VS</div>
        </div>

        {/* Right Score */}
        <div className={`relative rounded-2xl border p-6 text-center transition-all ${
          rightWins ? "border-yellow-400/40 bg-yellow-400/5 shadow-[0_0_30px_rgba(250,204,21,0.08)]" : "border-white/10 bg-white/[0.02]"
        }`}>
          {rightWins && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="text-xl" role="img" aria-label="crown">👑</span>
            </div>
          )}
          <p className="mb-2 text-xs text-gray-500">{rightLabel}</p>
          <div className="text-5xl font-bold text-white">
            <AnimatedScore score={rightScore} delay={200} />
          </div>
          {rightWins && <Badge variant="premium" className="mt-2">Winner</Badge>}
          {tie && <Badge variant="default" className="mt-2">Tie</Badge>}
        </div>
      </div>

      {!tie && (
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-4">
          <p className="mb-2 text-sm font-semibold text-red-300">
            Why {leftWins ? rightLabel : leftLabel} lost
          </p>
          <div className="flex flex-wrap gap-2">
            {loserUniqueLeaks.slice(0, 2).map((leak) => (
              <span key={leak.title} className="rounded-full bg-red-500/10 px-3 py-1 text-[11px] text-red-300">
                {leak.title}
              </span>
            ))}
            {loserUniqueLeaks.length === 0 && (
              <span className="text-xs text-gray-500">Close match — small margin</span>
            )}
          </div>
          <p className="mt-2 text-[10px] text-gray-600">
            {gap} point{gap !== 1 ? "s" : ""} behind · {totalLeaks} leaks analyzed
          </p>
        </div>
      )}

      {onShare && (
        <div className="text-center">
          <button
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-sm text-purple-300 transition-colors hover:bg-purple-500/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share this battle
          </button>
        </div>
      )}
    </div>
  );
}
