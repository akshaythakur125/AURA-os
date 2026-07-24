"use client";

// Illustrative examples of the kind of finding a report surfaces —
// not attributed to specific individuals. See AGENTS.md: never present
// stock photos or specific names/scores as if they were real customers.
const EXAMPLE_FINDINGS = [
  {
    quote: "Overhead light is the silent killer — it flattens your face, drops shadows under your eyes, and makes a good shot look 'off' without you knowing why. Swapping to soft window light at a 45° angle is often the single biggest free glow-up, and it's usually the first thing the report flags.",
    context: "Lighting leak",
    scoreDelta: "biggest free win",
  },
  {
    quote: "A messy background quietly pulls the eye off you — a stray bottle, a cluttered shelf, a busy wall. Even a killer outfit loses its impact when there's noise behind you. Clearing or simplifying what's visible is one of the highest-leverage free fixes, and it upgrades every photo you take in that spot.",
    context: "Background leak",
    scoreDelta: "highest-leverage fix",
  },
  {
    quote: "Colour consistency across a grid is something people feel but can't name — a feed where the tones agree reads as curated and intentional, while random colour jumps read as accidental. Locking a small palette and repeating it is what separates a profile that looks planned from one that looks thrown together.",
    context: "Colour signal leak",
    scoreDelta: "reads more intentional",
  },
];

export function Testimonials() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {EXAMPLE_FINDINGS.map((f, i) => (
        <div key={i} className="rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] p-5">
          <div className="mb-3 inline-flex items-center rounded-full border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-300">
            {f.context}
          </div>
          <p className="mb-4 text-sm leading-relaxed text-[#4a443d]">
            {f.quote}
          </p>
          <div className="text-xs font-bold text-emerald-400">{f.scoreDelta}</div>
          <div className="text-[9px] text-[#9c9184]">the takeaway</div>
        </div>
      ))}
    </div>
  );
}
