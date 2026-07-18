"use client";

import { useState } from "react";
import type { LookCategory } from "@/lib/shop/catalogTypes";
import { resolveShopImage } from "@/lib/shop/shopImage";

interface Props {
  category: LookCategory;
  title: string;
  /** the look's own keywords — used to pick the most accurate photo */
  keywords?: string[];
  className?: string;
}

// Neutral on-theme placeholder shown if a remote photo fails to load.
const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='#efe8db'/><circle cx='200' cy='150' r='46' fill='none' stroke='#c9bfae' stroke-width='6'/><circle cx='200' cy='150' r='10' fill='#E14434'/></svg>`,
  );

export function ShopCategoryImage({ category, title, keywords = [], className = "" }: Props) {
  const photo = resolveShopImage(category, title, keywords);
  const [src, setSrc] = useState(photo.url);

  return (
    <div className={`relative h-44 overflow-hidden rounded-xl ${className}`}>
      <img
        src={src}
        alt={photo.alt}
        onError={() => { if (src !== FALLBACK) setSrc(FALLBACK); }}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3">
        <span className="rounded-lg bg-black/50 px-2.5 py-1 text-[10px] font-medium text-[#1c1917]/90 backdrop-blur-sm">
          {title}
        </span>
      </div>
    </div>
  );
}
