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

// Per-category emoji + gradient placeholder. Used when the catalog row has no
// image URL (the static MVP catalog doesn't ship product photos). Keeps every
// result card visually anchored so the search doesn't read as a wall of text.
const CATEGORY_META: Record<string, { emoji: string; gradient: string }> = {
  tshirt: { emoji: "👕", gradient: "from-sky-400/40 to-blue-500/30" },
  shirt: { emoji: "👔", gradient: "from-slate-400/40 to-slate-600/30" },
  overshirt: { emoji: "🧥", gradient: "from-amber-400/40 to-orange-500/30" },
  jeans: { emoji: "👖", gradient: "from-indigo-400/40 to-indigo-600/30" },
  trousers: { emoji: "👖", gradient: "from-stone-400/40 to-stone-600/30" },
  chinos: { emoji: "👖", gradient: "from-amber-300/40 to-amber-500/30" },
  sneakers: { emoji: "👟", gradient: "from-emerald-400/40 to-teal-500/30" },
  formal_shoes: { emoji: "🥾", gradient: "from-neutral-500/40 to-neutral-700/30" },
  watch: { emoji: "⌚", gradient: "from-yellow-400/40 to-orange-500/30" },
  belt: { emoji: "🎗️", gradient: "from-amber-500/40 to-yellow-600/30" },
  sunglasses: { emoji: "🕶️", gradient: "from-zinc-400/40 to-zinc-700/30" },
  jacket: { emoji: "🧥", gradient: "from-orange-400/40 to-rose-500/30" },
  hoodie: { emoji: "🧢", gradient: "from-fuchsia-400/40 to-purple-500/30" },
  kurta: { emoji: "🥻", gradient: "from-rose-400/40 to-pink-500/30" },
  perfume: { emoji: "🧴", gradient: "from-purple-400/40 to-fuchsia-500/30" },
  grooming: { emoji: "🪒", gradient: "from-cyan-400/40 to-sky-500/30" },
  background_item: { emoji: "🖼️", gradient: "from-slate-500/40 to-slate-700/30" },
  photo_accessory: { emoji: "📸", gradient: "from-purple-500/40 to-indigo-600/30" },
  jewellery: { emoji: "💍", gradient: "from-yellow-300/40 to-amber-500/30" },
  wallet: { emoji: "👛", gradient: "from-amber-600/40 to-orange-700/30" },
};

const SIZE_META = {
  sm: { box: "h-14 w-14", emoji: "text-2xl", radius: "rounded-xl" },
  md: { box: "h-20 w-20 sm:h-24 sm:w-24", emoji: "text-4xl", radius: "rounded-2xl" },
  lg: { box: "h-32 w-32", emoji: "text-5xl", radius: "rounded-2xl" },
} as const;

export function ProductThumb({ imageUrl, category, title, colorTag, size = "md" }: Props) {
  const meta = CATEGORY_META[category as string] || {
    emoji: "🛍️",
    gradient: "from-sky-400/40 to-purple-500/30",
  };
  const s = SIZE_META[size];

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
      className={`${s.box} shrink-0 overflow-hidden ${s.radius} border border-white/10 bg-gradient-to-br ${meta.gradient} relative`}
      aria-label={`${category} placeholder`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={s.emoji} aria-hidden>
          {meta.emoji}
        </span>
      </div>
      {colorTag && (
        <div className="absolute bottom-1 left-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide text-white/80">
          {colorTag}
        </div>
      )}
    </div>
  );
}
