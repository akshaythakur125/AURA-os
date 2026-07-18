"use client";

import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";

const DIMENSIONS = [
  { name: "Lighting", icon: "💡", tag: "soft light hits different" },
  { name: "Clarity", icon: "🔍", tag: "sharp, not blurry" },
  { name: "Framing", icon: "📐", tag: "framed, not cropped" },
  { name: "Background", icon: "🏠", tag: "clean beats cluttered" },
  { name: "Colour", icon: "🎨", tag: "colours that pop" },
  { name: "Style", icon: "👕", tag: "fit over labels" },
  { name: "Vibe", icon: "✨", tag: "one clear energy" },
];

export function AuditDimensions() {
  return (
    <section className="py-20 sm:py-28 bg-[#F2ECE1]/55">
      <Container>
        <FadeInView>
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-[#1C1917] sm:text-4xl">
              7 signals. <span className="text-[#E14434]">2 minutes.</span>
            </h2>
            <p className="mt-3 text-sm text-[#857b6e]">Everything we scan in your photo — no fluff.</p>
          </div>
        </FadeInView>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DIMENSIONS.map((d, i) => (
            <FadeInView key={d.name} delay={i * 50}>
              <div className="group flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-[#1c1917]/10 bg-[#fbf8f2] px-4 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#E14434]/40 hover:shadow-[0_12px_28px_-12px_rgba(28,25,23,0.18)]">
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{d.icon}</span>
                <span className="text-sm font-bold text-[#1C1917]">{d.name}</span>
                <span className="text-[11px] leading-tight text-[#857b6e]">{d.tag}</span>
              </div>
            </FadeInView>
          ))}
          <FadeInView delay={DIMENSIONS.length * 50}>
            <div className="flex h-full flex-col items-center justify-center gap-1 rounded-2xl bg-[#E14434] px-4 py-6 text-center text-white transition-transform duration-300 hover:-translate-y-1">
              <span className="text-2xl font-bold leading-none">100</span>
              <span className="text-[11px] font-medium uppercase tracking-wide opacity-90">your score</span>
            </div>
          </FadeInView>
        </div>
      </Container>
    </section>
  );
}
