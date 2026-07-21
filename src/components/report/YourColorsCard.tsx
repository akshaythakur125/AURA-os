"use client";

import Link from "next/link";
import { Scene3DAccent } from "@/components/hero/Scene3DAccent";
import { swatchHex, swatchTextColor } from "@/lib/shop/colorSwatch";

interface ColorPalette {
  name: string;
  colors: string[];
  avoid: string[];
  reasoning: string;
}

interface Props {
  palette?: ColorPalette;
  undertone?: { undertone: string; skinDepth: string };
}

function Swatch({ name }: { name: string }) {
  const hex = swatchHex(name);
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-12 w-12 rounded-xl border border-black/10 shadow-sm sm:h-14 sm:w-14"
        style={{ background: hex }}
        title={name}
      >
        <span className="sr-only">{name}</span>
      </div>
      <span className="max-w-[64px] text-center text-[9px] leading-tight text-[#6f675e]">{name}</span>
    </div>
  );
}

const UNDERTONE_COPY: Record<string, string> = {
  warm: "Golden, peachy warmth — earthy and warm colors light you up.",
  cool: "Rosy, blue-based coolness — jewel tones and cool neutrals flatter you most.",
  neutral: "Balanced undertone — you can pull off most colors; muted tones read most natural.",
};

export function YourColorsCard({ palette, undertone }: Props) {
  if (!palette) return null;
  const tone = undertone?.undertone || "neutral";
  const depth = undertone?.skinDepth;

  return (
    <div className="rounded-2xl border border-[#1c1917]/[0.08] bg-gradient-to-b from-[#1c1917]/[0.03] to-transparent p-5 sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <div className="shrink-0">
          <Scene3DAccent size={92} shape="boba" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#1C1917]">Your Colors</h3>
          <p className="mt-1 text-xs text-[#6f675e]">
            <span className="font-medium capitalize text-[#B23A25]">{tone} undertone</span>
            {depth ? <span className="capitalize"> · {depth} depth</span> : null}
            {" — "}
            {UNDERTONE_COPY[tone] || UNDERTONE_COPY.neutral}
          </p>
        </div>
      </div>

      {/* Best colors */}
      <div className="mb-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#857b6e]">
          ✓ Wear these — {palette.name}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {palette.colors.map((c, i) => (
            <Swatch key={c + i} name={c} />
          ))}
        </div>
      </div>

      {/* Avoid */}
      {palette.avoid?.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#857b6e]">✕ Go easy on</p>
          <div className="flex flex-wrap gap-2">
            {palette.avoid.map((c, i) => {
              const hex = swatchHex(c);
              return (
                <span
                  key={c + i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#1c1917]/10 px-2.5 py-1 text-[11px]"
                  style={{ color: "#857b6e" }}
                >
                  <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: hex, opacity: 0.6 }} />
                  <span className="line-through decoration-[#E14434]/50">{c}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Reasoning + CTA */}
      <div className="rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-3.5">
        <p className="text-[11px] leading-relaxed text-[#6f675e]">{palette.reasoning}</p>
      </div>
      <Link
        href="/shop"
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E14434] to-[#c0341f] px-4 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
      >
        Shop your palette →
      </Link>
    </div>
  );
}
