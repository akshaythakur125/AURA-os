"use client";

import Image from "next/image";
import type { WardrobeCategory } from "@/types/commerce";

interface Props {
  imageUrl?: string;
  category: WardrobeCategory | string;
  title: string;
  colorTag?: string;
  size?: "sm" | "md" | "lg";
}

// Garment fill colors derived from the product's first color tag. These tint
// the SVG illustration so a "white shirt" and a "navy shirt" render as
// visually different products even without real photos.
const COLOR_FILLS: Record<string, { fill: string; stroke: string }> = {
  white: { fill: "#f4f3ef", stroke: "#c9c7c0" },
  "off-white": { fill: "#efece2", stroke: "#c9c4b4" },
  cream: { fill: "#efe6d2", stroke: "#cfc2a4" },
  black: { fill: "#26262e", stroke: "#4b4b57" },
  charcoal: { fill: "#3a3d45", stroke: "#5c606b" },
  grey: { fill: "#9aa0ab", stroke: "#767c88" },
  gray: { fill: "#9aa0ab", stroke: "#767c88" },
  navy: { fill: "#24385c", stroke: "#3f5988" },
  blue: { fill: "#3f74c9", stroke: "#2e5aa3" },
  "light-blue": { fill: "#8db8e8", stroke: "#6a99cf" },
  denim: { fill: "#33507a", stroke: "#4a6b9b" },
  dark: { fill: "#2b2d38", stroke: "#4d5060" },
  beige: { fill: "#d9c7a4", stroke: "#b8a37c" },
  tan: { fill: "#c9a97e", stroke: "#a8875c" },
  khaki: { fill: "#b0a276", stroke: "#8e8158" },
  olive: { fill: "#6f7a4c", stroke: "#565f38" },
  green: { fill: "#3f7d55", stroke: "#2f5f40" },
  brown: { fill: "#7c5a3a", stroke: "#5f452c" },
  maroon: { fill: "#7b2d3b", stroke: "#5c202c" },
  red: { fill: "#c04338", stroke: "#983228" },
  pink: { fill: "#e8a8bf", stroke: "#c8879f" },
  yellow: { fill: "#e0bd54", stroke: "#bd9c3c" },
  mustard: { fill: "#cda43c", stroke: "#a8862c" },
  orange: { fill: "#dd7b3d", stroke: "#b8602a" },
  lavender: { fill: "#b3a3dd", stroke: "#9183bd" },
  purple: { fill: "#7a5cb8", stroke: "#5f4696" },
  silver: { fill: "#c4c9d2", stroke: "#9aa0ac" },
  gold: { fill: "#d4af5a", stroke: "#b08f40" },
  neutral: { fill: "#cfc9bb", stroke: "#aba494" },
};

const DEFAULT_COLOR = { fill: "#8fa3bd", stroke: "#6e83a0" };

function colorFor(colorTag?: string) {
  if (!colorTag) return DEFAULT_COLOR;
  const key = colorTag.toLowerCase().trim();
  return COLOR_FILLS[key] || DEFAULT_COLOR;
}

// Tile background gradients per category family — keeps categories visually
// grouped (all footwear tiles feel related, all top-wear tiles feel related).
const CATEGORY_BG: Record<string, string> = {
  tshirt: "from-sky-500/25 to-blue-600/15",
  shirt: "from-slate-400/25 to-slate-600/15",
  overshirt: "from-amber-500/25 to-orange-600/15",
  jacket: "from-orange-500/25 to-rose-600/15",
  hoodie: "from-fuchsia-500/25 to-purple-600/15",
  kurta: "from-rose-500/25 to-pink-600/15",
  jeans: "from-indigo-500/25 to-indigo-700/15",
  trousers: "from-stone-400/25 to-stone-600/15",
  chinos: "from-amber-400/25 to-amber-600/15",
  sneakers: "from-emerald-500/25 to-teal-600/15",
  formal_shoes: "from-neutral-500/25 to-neutral-700/15",
  watch: "from-yellow-500/25 to-orange-600/15",
  belt: "from-amber-600/25 to-yellow-700/15",
  sunglasses: "from-zinc-500/25 to-zinc-700/15",
  perfume: "from-purple-500/25 to-fuchsia-600/15",
  grooming: "from-cyan-500/25 to-sky-600/15",
  jewellery: "from-yellow-400/25 to-amber-600/15",
  wallet: "from-amber-700/25 to-orange-800/15",
  background_item: "from-slate-500/25 to-slate-700/15",
  photo_accessory: "from-purple-600/25 to-indigo-700/15",
};

// Inline SVG garment silhouettes (viewBox 0 0 64 64). Inline SVG cannot fail
// to load — no network request — which is what guarantees a visual on every
// card in every environment.
function GarmentIllustration({ category, colorTag }: { category: string; colorTag?: string }) {
  const c = colorFor(colorTag);
  const common = { fill: c.fill, stroke: c.stroke, strokeWidth: 1.5, strokeLinejoin: "round" as const };

  switch (category) {
    case "tshirt":
      return (
        <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]">
          <path {...common} d="M24 12 L32 16 L40 12 L52 20 L47 30 L43 27 L43 52 L21 52 L21 27 L17 30 L12 20 Z" />
          <path fill="none" stroke={c.stroke} strokeWidth={1.5} d="M24 12 Q32 20 40 12" />
        </svg>
      );
    case "shirt":
      return (
        <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]">
          <path {...common} d="M24 11 L32 18 L40 11 L52 19 L47 30 L43 27 L43 53 L21 53 L21 27 L17 30 L12 19 Z" />
          <path fill="none" stroke={c.stroke} strokeWidth={1.5} d="M24 11 L32 21 L40 11" />
          <path fill="none" stroke={c.stroke} strokeWidth={1.2} strokeDasharray="1.5 3.5" d="M32 22 L32 52" />
        </svg>
      );
    case "overshirt":
    case "jacket":
      return (
        <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]">
          <path {...common} d="M23 11 L31 15 L31 53 L20 53 L20 28 L15 31 L10 20 Z" />
          <path {...common} d="M41 11 L33 15 L33 53 L44 53 L44 28 L49 31 L54 20 Z" />
          <path fill="none" stroke={c.stroke} strokeWidth={1.2} d="M20 40 L26 40 M38 40 L44 40" />
        </svg>
      );
    case "hoodie":
      return (
        <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]">
          <path {...common} d="M22 16 Q32 6 42 16 L52 23 L47 33 L43 30 L43 53 L21 53 L21 30 L17 33 L12 23 Z" />
          <path fill="none" stroke={c.stroke} strokeWidth={1.5} d="M25 16 Q32 24 39 16" />
          <path fill="none" stroke={c.stroke} strokeWidth={1.2} d="M26 44 L26 52 M38 44 L38 52" />
        </svg>
      );
    case "kurta":
      return (
        <svg viewBox="0 0 64 64" className="h-[74%] w-[74%]">
          <path {...common} d="M25 9 L32 13 L39 9 L50 16 L46 26 L42 23 L42 56 L22 56 L22 23 L18 26 L14 16 Z" />
          <path fill="none" stroke={c.stroke} strokeWidth={1.2} d="M32 14 L32 30" />
          <path fill="none" stroke={c.stroke} strokeWidth={1.2} d="M22 48 L26 48 M38 48 L42 48" />
        </svg>
      );
    case "jeans":
    case "trousers":
    case "chinos":
      return (
        <svg viewBox="0 0 64 64" className="h-[72%] w-[72%]">
          <path {...common} d="M22 10 L42 10 L44 54 L35 54 L32 26 L29 54 L20 54 Z" />
          <path fill="none" stroke={c.stroke} strokeWidth={1.2} d="M22 15 L42 15" />
        </svg>
      );
    case "sneakers":
      return (
        <svg viewBox="0 0 64 64" className="h-[64%] w-[64%]">
          <path {...common} d="M10 40 Q10 32 18 30 L26 22 Q28 20 30 22 L38 30 Q48 32 54 38 L54 44 L10 44 Z" />
          <rect x="10" y="44" width="44" height="5" rx="2.5" fill={c.stroke} />
          <path fill="none" stroke={c.stroke} strokeWidth={1.3} d="M28 24 L24 30 M32 26 L28 33" />
        </svg>
      );
    case "formal_shoes":
      return (
        <svg viewBox="0 0 64 64" className="h-[62%] w-[62%]">
          <path {...common} d="M12 42 Q12 30 22 28 L30 28 Q34 28 38 32 Q46 38 54 40 L54 46 L12 46 Z" />
          <path fill="none" stroke={c.stroke} strokeWidth={1.3} d="M30 28 Q32 34 28 38" />
        </svg>
      );
    case "watch":
      return (
        <svg viewBox="0 0 64 64" className="h-[64%] w-[64%]">
          <rect x="26" y="6" width="12" height="14" rx="3" {...common} />
          <rect x="26" y="44" width="12" height="14" rx="3" {...common} />
          <circle cx="32" cy="32" r="14" {...common} />
          <circle cx="32" cy="32" r="10" fill="none" stroke={c.stroke} strokeWidth={1.2} />
          <path fill="none" stroke={c.stroke} strokeWidth={1.5} strokeLinecap="round" d="M32 32 L32 26 M32 32 L36 34" />
        </svg>
      );
    case "belt":
      return (
        <svg viewBox="0 0 64 64" className="h-[62%] w-[62%]">
          <rect x="6" y="27" width="52" height="10" rx="3" {...common} />
          <rect x="28" y="24" width="12" height="16" rx="2" fill="none" stroke={c.stroke} strokeWidth={2} />
          <path fill="none" stroke={c.stroke} strokeWidth={1.5} d="M34 27 L34 37" />
        </svg>
      );
    case "sunglasses":
      return (
        <svg viewBox="0 0 64 64" className="h-[58%] w-[58%]">
          <path fill="none" stroke={c.stroke} strokeWidth={2} d="M6 26 L58 26" />
          <path {...common} d="M10 26 h16 v6 a8 8 0 0 1 -16 0 Z" />
          <path {...common} d="M38 26 h16 v6 a8 8 0 0 1 -16 0 Z" />
          <path fill="none" stroke={c.stroke} strokeWidth={2} d="M26 28 Q32 24 38 28" />
        </svg>
      );
    case "perfume":
    case "grooming":
      return (
        <svg viewBox="0 0 64 64" className="h-[64%] w-[64%]">
          <rect x="27" y="8" width="10" height="8" rx="2" fill={c.stroke} />
          <rect x="18" y="18" width="28" height="38" rx="7" {...common} />
          <rect x="24" y="28" width="16" height="12" rx="2" fill="none" stroke={c.stroke} strokeWidth={1.2} />
        </svg>
      );
    case "jewellery":
      return (
        <svg viewBox="0 0 64 64" className="h-[60%] w-[60%]">
          <path fill="none" stroke={c.stroke} strokeWidth={2} d="M14 12 Q32 34 50 12" />
          <circle cx="32" cy="36" r="9" {...common} />
          <circle cx="32" cy="36" r="4" fill="none" stroke={c.stroke} strokeWidth={1.3} />
        </svg>
      );
    case "wallet":
      return (
        <svg viewBox="0 0 64 64" className="h-[60%] w-[60%]">
          <rect x="10" y="18" width="44" height="30" rx="6" {...common} />
          <path fill="none" stroke={c.stroke} strokeWidth={1.5} d="M10 28 L54 28" />
          <circle cx="46" cy="38" r="3.5" fill={c.stroke} />
        </svg>
      );
    case "photo_accessory":
      return (
        <svg viewBox="0 0 64 64" className="h-[60%] w-[60%]">
          <rect x="8" y="20" width="48" height="32" rx="6" {...common} />
          <rect x="24" y="14" width="16" height="8" rx="3" fill={c.stroke} />
          <circle cx="32" cy="36" r="10" fill="none" stroke={c.stroke} strokeWidth={2} />
          <circle cx="32" cy="36" r="5" fill={c.stroke} />
        </svg>
      );
    case "background_item":
      return (
        <svg viewBox="0 0 64 64" className="h-[60%] w-[60%]">
          <rect x="10" y="10" width="44" height="44" rx="4" fill="none" stroke={c.stroke} strokeWidth={2.5} />
          <rect x="17" y="17" width="30" height="30" rx="2" {...common} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className="h-[60%] w-[60%]">
          <path {...common} d="M14 22 L50 22 L46 54 L18 54 Z" />
          <path fill="none" stroke={c.stroke} strokeWidth={2} d="M24 22 v-4 a8 8 0 0 1 16 0 v4" />
        </svg>
      );
  }
}

const SIZE_META = {
  sm: { box: "h-14 w-14", radius: "rounded-xl" },
  md: { box: "h-20 w-20 sm:h-24 sm:w-24", radius: "rounded-2xl" },
  lg: { box: "h-32 w-32", radius: "rounded-2xl" },
} as const;

export function ProductThumb({ imageUrl, category, title, colorTag, size = "md" }: Props) {
  const s = SIZE_META[size];
  const bg = CATEGORY_BG[category as string] || "from-sky-500/25 to-purple-600/15";

  if (imageUrl) {
    return (
      <div className={`${s.box} shrink-0 overflow-hidden ${s.radius} border border-white/10 bg-white/5`}>
        <Image
          src={imageUrl}
          alt={title}
          width={200}
          height={200}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${s.box} shrink-0 overflow-hidden ${s.radius} border border-white/10 bg-gradient-to-br ${bg} relative`}
      aria-label={`${String(category).replace(/_/g, " ")} illustration`}
      title={title}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <GarmentIllustration category={category as string} colorTag={colorTag} />
      </div>
      {colorTag && (
        <div className="absolute bottom-1 left-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide text-white/85">
          {colorTag}
        </div>
      )}
    </div>
  );
}
