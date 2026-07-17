"use client";

const COMPARISONS = [
  {
    title: "Lighting fix",
    before: { label: "Before", issues: ["Overhead fluorescent", "Harsh shadows", "Flat, washed-out skin"] },
    after: { label: "After", wins: ["Window light at 45°", "Soft, even skin tone", "Dimensional depth"] },
    scoreDelta: "improved",
  },
  {
    title: "Background fix",
    before: { label: "Before", issues: ["Cluttered room visible", "Distracting objects", "Low-effort signal"] },
    after: { label: "After", wins: ["Clean, neutral wall", "Subject pops forward", "Premium read"] },
    scoreDelta: "+12 points",
  },
];

export function LeakComparison() {
  return (
    <div className="space-y-4">
      {COMPARISONS.map((comp, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-[#1c1917]/10">
          <div className="flex items-center justify-between border-b border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] px-4 py-2">
            <span className="text-xs font-medium text-[#1C1917]">{comp.title}</span>
            <span className="text-[10px] font-medium text-emerald-400">{comp.scoreDelta}</span>
          </div>
          <div className="grid sm:grid-cols-2">
            {/* Before */}
            <div className="border-b border-[#1c1917]/[0.08] bg-red-500/[0.03] p-4 sm:border-b-0 sm:border-r sm:border-[#1c1917]/[0.08]">
              <div className="mb-2 text-[10px] font-medium text-red-400">{comp.before.label}</div>
              <ul className="space-y-1">
                {comp.before.issues.map((issue, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-[11px] text-[#6f675e]">
                    <span className="mt-0.5 text-red-400">-</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div className="bg-emerald-500/[0.03] p-4">
              <div className="mb-2 text-[10px] font-medium text-emerald-400">{comp.after.label}</div>
              <ul className="space-y-1">
                {comp.after.wins.map((win, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-[11px] text-[#4a443d]">
                    <span className="mt-0.5 text-emerald-400">+</span>
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
