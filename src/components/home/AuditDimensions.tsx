"use client";

import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";

const DIMENSIONS = [
  { name: "Lighting", icon: "💡", desc: "How light falls on your face — even, directional, or harsh.", issue: "Flat overhead lighting removes dimension and reads as low-effort.", fix: "Face a window at 45°. Natural side light is the single biggest upgrade." },
  { name: "Clarity", icon: "🔍", desc: "Sharpness, focus, and image resolution.", issue: "Motion blur or soft focus makes you look like an afterthought.", fix: "Use the rear camera, clean the lens, hold steady or use a timer." },
  { name: "Composition", icon: "📐", desc: "Framing, headroom, and subject placement.", issue: "Cut off at the shoulders or too much headroom looks accidental.", fix: "Center yourself, eyes at the top-third line, chest-up framing." },
  { name: "Background", icon: "🏠", desc: "What's behind you and what it signals.", issue: "Cluttered rooms, messy desks, or busy streets distract from you.", fix: "Stand in front of a plain wall, open doorway, or clean outdoor space." },
  { name: "Colour Harmony", icon: "🎨", desc: "How your outfit colours interact with your skin tone.", issue: "Washed-out or clashing colours reduce visual impact.", fix: "Wear colours that contrast your skin — dark on light, light on dark." },
  { name: "Style", icon: "👔", desc: "Clothing choices and grooming signals.", issue: "Wrinkled, ill-fitting, or overly casual clothes lower perceived effort.", fix: "Solid colours, well-fitted basics, and clean grooming go a long way." },
  { name: "Consistency", icon: "📊", desc: "How well your overall presentation holds together.", issue: "Mixing formal top with casual background sends mixed signals.", fix: "Align outfit, background, and expression to one clear message." },
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
                <p className="mb-3 text-xs text-gray-500">{d.desc}</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-red-400 font-medium">Common issue: </span>
                    <span className="text-gray-400">{d.issue}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-medium">Quick fix: </span>
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
