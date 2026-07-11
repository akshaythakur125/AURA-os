"use client";

// Illustrative examples of the kind of finding a report surfaces —
// not attributed to specific individuals. See AGENTS.md: never present
// stock photos or specific names/scores as if they were real customers.
const EXAMPLE_FINDINGS = [
  {
    quote: "A lighting fix like switching from overhead fluorescent to window light is a common first move — it alone can meaningfully shift a score.",
    context: "Lighting leak",
    scoreDelta: "improved",
  },
  {
    quote: "Background clutter quietly undercuts even a strong outfit. Cleaning up what's visible behind you is often the highest-leverage free fix.",
    context: "Background leak",
    scoreDelta: "improved",
  },
  {
    quote: "Color consistency across an Instagram grid is a signal people notice without being able to name it. Matching tones tends to read as more intentional.",
    context: "Color signal leak",
    scoreDelta: "improved",
  },
];

export function Testimonials() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {EXAMPLE_FINDINGS.map((f, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-3 inline-flex items-center rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-[10px] font-medium text-purple-300">
            {f.context}
          </div>
          <p className="mb-4 text-sm leading-relaxed text-gray-300">
            {f.quote}
          </p>
          <div className="text-xs font-bold text-emerald-400">{f.scoreDelta}</div>
          <div className="text-[9px] text-gray-600">typical score impact</div>
        </div>
      ))}
    </div>
  );
}
