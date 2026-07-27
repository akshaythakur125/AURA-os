"use client";

import { useState } from "react";
import type { LookCategory } from "@/lib/shop/catalogTypes";
import { resolveShopImage, emojiForCategory } from "@/lib/shop/shopImage";

interface Props {
  category: LookCategory;
  title: string;
  /** the look's own keywords — used to pick the most accurate photo */
  keywords?: string[];
  className?: string;
}

export function ShopCategoryImage({ category, title, keywords = [], className = "" }: Props) {
  const photo = resolveShopImage(category, title, keywords);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative h-44 overflow-hidden rounded-xl bg-gradient-to-br from-[#efe8db] to-[#e2d6c0] ${className}`}>
      {/* Always-visible emoji base — the photo covers it when it loads, so the
          tile is never a blank box even if the CDN image fails. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-5xl" role="img" aria-label={category}>{emojiForCategory(category)}</span>
      </div>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt={photo.alt}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3">
        <span className="rounded-lg bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">
          {title}
        </span>
      </div>
    </div>
  );
}
