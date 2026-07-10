"use client";

import { FadeInView } from "@/components/ui/FadeInView";

const RECENT_SCORES = [
  { name: "Ananya", city: "Mumbai", score: 82, time: "2 min ago" },
  { name: "Rohan", city: "Delhi", score: 74, time: "8 min ago" },
  { name: "Priya", city: "Bangalore", score: 71, time: "15 min ago" },
  { name: "Arjun", city: "Pune", score: 68, time: "22 min ago" },
  { name: "Sneha", city: "Chennai", score: 76, time: "31 min ago" },
  { name: "Kabir", city: "Hyderabad", score: 79, time: "38 min ago" },
];

function ScorePill({ s }: { s: typeof RECENT_SCORES[0] }) {
  const tier = s.score >= 75 ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
    : s.score >= 60 ? "text-amber-400 border-amber-500/20 bg-amber-500/5"
    : "text-gray-400 border-white/[0.04] bg-white/[0.02]";
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${tier}`}>
      <span className="font-medium text-white">{s.name}</span>
      <span className="text-gray-600">·</span>
      <span>{s.city}</span>
      <span className="ml-1 font-bold">{s.score}</span>
      <span className="text-gray-600">·</span>
      <span className="text-gray-500">{s.time}</span>
    </div>
  );
}

export function RecentScores() {
  return (
    <FadeInView>
      <div className="py-8">
        <div className="mb-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Recent Aura Checks</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {RECENT_SCORES.map((s) => (
            <ScorePill key={s.name + s.city} s={s} />
          ))}
        </div>
      </div>
    </FadeInView>
  );
}
