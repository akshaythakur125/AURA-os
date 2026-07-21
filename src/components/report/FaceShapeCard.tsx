"use client";

import { useState } from "react";
import Link from "next/link";
import { Scene3DAccent } from "@/components/hero/Scene3DAccent";

type Shape = "oval" | "round" | "square" | "oblong" | "heart" | "diamond";

const SHAPES: { id: Shape; label: string; hint: string }[] = [
  { id: "oval", label: "Oval", hint: "Balanced, slightly longer than wide" },
  { id: "round", label: "Round", hint: "Soft, equal width & length, full cheeks" },
  { id: "square", label: "Square", hint: "Strong, wide jaw, angular" },
  { id: "oblong", label: "Oblong", hint: "Long, narrow, tall forehead" },
  { id: "heart", label: "Heart", hint: "Wide forehead, narrow chin" },
  { id: "diamond", label: "Diamond", hint: "Wide cheekbones, narrow forehead & chin" },
];

const RECS: Record<Shape, { goal: string; haircuts: string[]; glasses: string[]; beard: string[]; avoid: string }> = {
  oval: {
    goal: "You've got the most versatile shape — keep proportions balanced.",
    haircuts: ["Textured crop", "Side part", "Quiff", "Medium length"],
    glasses: ["Rectangular", "Square", "Wayfarer"],
    beard: ["Light–medium stubble", "Balanced short beard"],
    avoid: "Avoid adding too much height on top — it lengthens the face.",
  },
  round: {
    goal: "Add height and angles to lengthen and define.",
    haircuts: ["Pompadour", "High fade", "Quiff with volume", "Short sides, height on top"],
    glasses: ["Rectangular", "Angular", "Wayfarer"],
    beard: ["Fuller on the chin", "Short on the sides"],
    avoid: "Avoid round frames and buzz cuts — they emphasize roundness.",
  },
  square: {
    goal: "Soften the strong jaw, or lean into it — both read well.",
    haircuts: ["Textured crop", "Side part", "Medium swept back"],
    glasses: ["Round", "Oval", "Rimless"],
    beard: ["Rounded short beard", "Trimmed boxed beard"],
    avoid: "Avoid very boxy frames — they can over-square the face.",
  },
  oblong: {
    goal: "Reduce length and add width for balance.",
    haircuts: ["Fringe / forward styles", "Medium sides", "Low fade"],
    glasses: ["Wide / oversized", "Decorative temples"],
    beard: ["Fuller on the sides", "Keep chin trimmed"],
    avoid: "Avoid tall styles and long goatees — they add length.",
  },
  heart: {
    goal: "Balance a wider forehead with a narrower chin.",
    haircuts: ["Medium length", "Side-swept fringe", "Textured, not too voluminous"],
    glasses: ["Bottom-heavy", "Round", "Light rimless"],
    beard: ["Fuller beard to add chin width"],
    avoid: "Avoid heavy volume up top — it widens the forehead.",
  },
  diamond: {
    goal: "Soften prominent cheekbones and add forehead width.",
    haircuts: ["Fringe", "Longer on top", "Textured"],
    glasses: ["Oval", "Rimless", "Soft cat-eye"],
    beard: ["Fuller chin", "Light cheek line"],
    avoid: "Avoid slicked-back styles that expose the cheekbones fully.",
  },
};

function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full border border-[#1c1917]/10 bg-[#1c1917]/[0.03] px-2.5 py-1 text-[11px] text-[#4a443d]">{i}</span>
      ))}
    </div>
  );
}

export function FaceShapeCard({ initial = "oval" }: { initial?: Shape }) {
  const [shape, setShape] = useState<Shape>(initial);
  const r = RECS[shape];

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      <div className="mb-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <div className="shrink-0"><Scene3DAccent size={92} shape="model" /></div>
        <div>
          <h3 className="text-base font-bold text-[#1C1917]">Face-Shape Studio</h3>
          <p className="mt-1 text-xs text-[#6f675e]">
            Tap the shape closest to yours — mirror check: look at your jaw, cheekbones, and forehead width — and
            we&apos;ll tailor your haircut, glasses, and beard.
          </p>
        </div>
      </div>

      {/* Shape selector */}
      <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {SHAPES.map((s) => (
          <button
            key={s.id}
            onClick={() => setShape(s.id)}
            title={s.hint}
            className={`rounded-xl border px-2 py-2.5 text-center transition-all ${shape === s.id ? "border-[#E14434]/50 bg-[#E14434]/[0.08]" : "border-[#1c1917]/10 bg-[#1c1917]/[0.02] hover:border-[#1c1917]/20"}`}
          >
            <span className={`text-xs font-semibold ${shape === s.id ? "text-[#B23A25]" : "text-[#1C1917]"}`}>{s.label}</span>
          </button>
        ))}
      </div>
      <p className="mb-4 rounded-xl border border-[#E14434]/15 bg-[#E14434]/[0.05] p-3 text-xs text-[#4a443d]">{r.goal}</p>

      {/* Recommendations */}
      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#857b6e]">💇 Haircuts</p>
          <Pills items={r.haircuts} />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#857b6e]">👓 Glasses frames</p>
          <Pills items={r.glasses} />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#857b6e]">🧔 Beard / facial hair</p>
          <Pills items={r.beard} />
        </div>
      </div>
      <p className="mt-3 text-[11px] text-[#9c9184]">✕ {r.avoid}</p>
      <Link href="/shop?category=sunglasses" className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[#1c1917]/12 px-4 py-2 text-xs font-semibold text-[#4a443d] transition-colors hover:border-[#E14434]/40 hover:text-[#1C1917]">
        Shop frames that fit →
      </Link>
    </div>
  );
}
