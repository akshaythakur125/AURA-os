"use client";

import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";

const ITEMS = [
  {
    q: "What is analysed?",
    a: "Visual presentation signals: lighting quality, image sharpness, composition framing, background complexity, colour balance, clothing style, and overall visual consistency.",
  },
  {
    q: "Where does processing happen?",
    a: "Entirely in your browser. Your photo is never uploaded to our servers for the free analysis. All measurements run locally using JavaScript and Canvas.",
  },
  {
    q: "What can this system infer?",
    a: "Technical image qualities — brightness, contrast, sharpness, colour distribution, and spatial composition. It cannot read emotions, judge personality, or make subjective beauty assessments.",
  },
  {
    q: "How does scoring work?",
    a: "Each dimension is scored 0–100 against evidence-based guidelines for effective profile photography. Scores reflect technical image qualities, not personal worth.",
  },
  {
    q: "Is my photo stored?",
    a: "No. Free scans are processed in-memory and never leave your device. If you choose to save results, metadata (not the image) is stored in your browser's local storage.",
  },
];

export function PrivacyMethodology() {
  return (
    <section className="py-20 sm:py-28 bg-[#0a0a12]">
      <Container>
        <FadeInView>
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Privacy & methodology</h2>
            <p className="mt-3 text-sm text-gray-500">What we measure, how we measure it, and what we do with your data.</p>
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
