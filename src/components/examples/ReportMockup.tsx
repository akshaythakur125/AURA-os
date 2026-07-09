"use client";

const BREAKDOWN_DATA = [
  { label: "Lighting", score: 42, color: "from-amber-500 to-orange-500" },
  { label: "Clarity", score: 74, color: "from-emerald-500 to-teal-500" },
  { label: "Composition", score: 61, color: "from-purple-500 to-pink-500" },
  { label: "Background", score: 85, color: "from-emerald-500 to-green-500" },
  { label: "Color Signal", score: 58, color: "from-blue-500 to-cyan-500" },
  { label: "Premium Signal", score: 33, color: "from-red-500 to-rose-500" },
];

const LEAKS = [
  { title: "Premium signal mismatch", severity: "high" as const, detail: "Premium items (watch, shoes) undermined by cluttered background" },
  { title: "Lighting quality", severity: "high" as const, detail: "Overhead fluorescent creates unflattering shadows" },
  { title: "Color inconsistency", severity: "medium" as const, detail: "Warm outfit in cool-toned setting reduces cohesion" },
];

export function ReportMockup() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Report header */}
      <div className="rounded-t-2xl border border-b-0 border-white/[0.06] bg-white/[0.03] px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
              <span className="text-xs font-bold text-white">A</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Full Aura Report</div>
              <div className="text-[10px] text-gray-500">Sample report — Urban Aspirational archetype</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">72</div>
            <div className="text-[10px] text-gray-500">/ 100</div>
          </div>
        </div>
      </div>

      {/* Visual breakdown */}
      <div className="border border-t-0 border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <div className="mb-3 text-xs font-medium text-white">Visual Breakdown</div>
        <div className="space-y-2.5">
          {BREAKDOWN_DATA.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-20 text-[10px] text-gray-500">{item.label}</div>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
              <div className="w-8 text-right text-[10px] text-gray-400">{item.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status leaks */}
      <div className="border border-t-0 border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <div className="mb-3 text-xs font-medium text-white">Status Leaks Detected</div>
        <div className="space-y-2">
          {LEAKS.map((leak, i) => (
            <div key={i} className={`rounded-lg border p-3 ${
              leak.severity === "high" ? "border-red-500/20 bg-red-500/5" : "border-amber-500/20 bg-amber-500/5"
            }`}>
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${
                  leak.severity === "high" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                }`}>
                  {leak.severity}
                </span>
                <span className="text-xs font-medium text-white">{leak.title}</span>
              </div>
              <p className="mt-1 text-[10px] text-gray-400">{leak.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade path */}
      <div className="rounded-b-2xl border border-t-0 border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <div className="mb-3 text-xs font-medium text-white">Budget Upgrade Path</div>
        <div className="flex items-center gap-2">
          {[
            { label: "Free", desc: "Re-angle lighting", color: "bg-emerald-500" },
            { label: "₹2K", desc: "Ring light", color: "bg-amber-500" },
            { label: "₹5K", desc: "Backdrop + outfit", color: "bg-purple-500" },
          ].map((tier, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full ${tier.color} opacity-60`} />
              <div className="mt-1.5 text-[10px] font-medium text-white">{tier.label}</div>
              <div className="text-[9px] text-gray-500">{tier.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
