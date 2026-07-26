"use client";

import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";

const ITEMS = [
  {
    q: "Does my photo leave my phone?",
    a: "No. The scan runs entirely in your browser — your photo is never uploaded to us.",
  },
  {
    q: "What gets scored?",
    a: "Real visual signals: lighting, sharpness, framing, background, colour, styling and vibe. Each scored 0–100.",
  },
  {
    q: "Is this just AI guessing?",
    a: "No. Scores are measured from the actual pixels and face geometry — not vibes, not personality reads.",
  },
  {
    q: "Do you save anything?",
    a: "Free scans are processed in-memory and gone when you leave. Nothing about the image is stored on our servers.",
  },
];

export function PrivacyMethodology() {
  return (
    <section className="py-20 sm:py-28 bg-[#ECE4D6]/55">
      <Container>
        <FadeInView>
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-[#1C1917] sm:text-3xl">Private by default</h2>
            <p className="mt-3 text-sm text-[#857b6e]">Your pic stays on your phone. Here&apos;s the honest breakdown.</p>
          </div>
        </FadeInView>

        <div className="mx-auto max-w-2xl space-y-4">
          {ITEMS.map((item, i) => (
            <FadeInView key={item.q} delay={i * 80}>
              <details className="group rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02]">
                <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-medium text-[#1C1917] list-none">
                  {item.q}
                  <span className="text-[#9c9184] group-open:rotate-45 transition-transform duration-200 text-lg">+</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-[#6f675e] leading-relaxed">
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
