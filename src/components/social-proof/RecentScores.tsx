"use client";

import { FadeInView } from "@/components/ui/FadeInView";

// ponytail: sample results, not real user data
const SAMPLE_SCORES = [
  { label: "Dating profile", score: 82 },
  { label: "Instagram grid", score: 74 },
  { label: "LinkedIn headshot", score: 71 },
  { label: "College profile", score: 68 },
  { label: "Festival photo", score: 76 },
  { label: "Travel photo", score: 79 },
];

export function RecentScores() {
  return (
    <FadeInView>
      <div className="py-8">
        <div className="mb-4 text-center">
          <p className="text-xs text-[#857b6e] uppercase tracking-wider">Sample Score Ranges</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {SAMPLE_SCORES.map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-full border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] px-3 py-1.5 text-xs">
              <span className="text-[#6f675e]">{s.label}</span>
              <span className="font-bold text-[#1C1917]">{s.score}</span>
            </div>
          ))}
        </div>
      </div>
    </FadeInView>
  );
}
