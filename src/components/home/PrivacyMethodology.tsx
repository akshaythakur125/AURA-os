"use client";

import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";

const ITEMS = [
  {
    q: "What is analysed?",
    a: "Lighting, sharpness, composition, background, colour, style, and consistency.",
  },
  {
    q: "Where does processing happen?",
    a: "In your browser. On the free scan, your photo never touches our servers.",
  },
  {
    q: "What can this system infer?",
    a: "Technical image qualities only. It can't read emotions, personality, or looks.",
  },
  {
    q: "How does scoring work?",
    a: "Each signal is scored 0–100 against proven photo guidelines — not personal worth.",
  },
  {
    q: "Is my photo stored?",
    a: "No. Free scans stay in memory. Saved results keep metadata only — never the image.",
  },
];

export function PrivacyMethodology() {
  return (
    <section className="py-20 sm:py-28 bg-[#0a0a12]">
      <Container>
        <FadeInView>
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Privacy & methodology</h2>
            <p className="mt-3 text-sm text-gray-500">What we measure — and what happens to your photo.</p>
          </div>
        </FadeInView>

        <div className="mx-auto max-w-2xl space-y-4">
          {ITEMS.map((item, i) => (
            <FadeInView key={item.q} delay={i * 80}>
              <details className="group rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-medium text-white list-none">
                  {item.q}
                  <span className="text-gray-600 group-open:rotate-45 transition-transform duration-200 text-lg">+</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
                  {item.a}
                </div>
              </details>
            </FadeInView>
          ))}
        </div>
      </Container>
    </section>
  );
}
