"use client";

const comparisons = [
  {
    before: {
      src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      alt: "Before — weak visual signal",
      label: "Before",
      issues: ["Harsh overhead lighting", "Cluttered background", "Distracting elements"],
    },
    after: {
      src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
      alt: "After — upgraded visual signal",
      label: "After",
      wins: ["Natural window light", "Clean neutral backdrop", "Subject takes focus"],
    },
    delta: "improved",
  },
];

export function ImageShowcase() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {comparisons.map((c, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="grid sm:grid-cols-2">
            {/* Before */}
            <div className="group relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
              <img
                src={c.before.src}
                alt={c.before.alt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Glass overlay label */}
              <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                {c.before.label}
              </div>
              <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] bg-black/60 p-4 backdrop-blur-md">
                <ul className="space-y-1">
                  {c.before.issues.map((issue, j) => (
                    <li key={j} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <span className="text-red-400">—</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* After */}
            <div className="group relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
              <img
                src={c.after.src}
                alt={c.after.alt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                {c.after.label}
              </div>
              <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] bg-black/60 p-4 backdrop-blur-md">
                <ul className="space-y-1">
                  {c.after.wins.map((win, j) => (
                    <li key={j} className="flex items-center gap-1.5 text-[11px] text-gray-300">
                      <span className="text-emerald-400">+</span>
                      {win}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Score delta bar */}
          <div className="flex items-center justify-between border-t border-white/[0.04] bg-white/[0.02] px-5 py-3">
            <span className="text-xs font-medium text-gray-400">Typical score improvement</span>
            <span className="text-sm font-bold text-emerald-400">{c.delta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
