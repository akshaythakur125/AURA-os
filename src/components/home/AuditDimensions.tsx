"use client";

import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";

const DIMENSIONS = [
  { name: "Lighting", icon: "💡", issue: "Flat overhead light reads as low-effort.", fix: "Face a window at 45°." },
  { name: "Clarity", icon: "🔍", issue: "Blur makes you an afterthought.", fix: "Rear camera, clean lens, hold steady." },
  { name: "Composition", icon: "📐", issue: "Odd cropping looks accidental.", fix: "Chest-up, eyes on the top third." },
  { name: "Background", icon: "🏠", issue: "Clutter distracts from you.", fix: "Plain wall or clean outdoor space." },
  { name: "Colour Harmony", icon: "🎨", issue: "Clashing colours kill impact.", fix: "Contrast your skin — dark on light." },
  { name: "Style", icon: "👔", issue: "Ill-fitting clothes lower effort.", fix: "Fitted, solid colours, clean grooming." },
  { name: "Consistency", icon: "📊", issue: "Mixed signals confuse.", fix: "One clear message, head to toe." },
];

export function AuditDimensions() {
  return (
    <section className="py-20 sm:py-28 bg-[#0c0c18]">
      <Container>
        <FadeInView>
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">What the audit examines</h2>
            <p className="mt-3 text-sm text-gray-500">Seven dimensions that shape first impressions.</p>
          </div>
        </FadeInView>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DIMENSIONS.map((d, i) => (
            <FadeInView key={d.name} delay={i * 60}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg">{d.icon}</span>
                  <h3 className="text-sm font-semibold text-white">{d.name}</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-red-400 font-medium">Leak: </span>
                    <span className="text-gray-400">{d.issue}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-medium">Fix: </span>
                    <span className="text-gray-400">{d.fix}</span>
                  </div>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>
      </Container>
    </section>
  );
}
