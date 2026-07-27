"use client";

import { useState } from "react";

/**
 * A product thumbnail that ALWAYS shows something relevant. It tries the real
 * photo (a live product image, or a category photo) and, if that fails to load
 * or none is given, falls back to a self-contained emoji tile — CSS + emoji,
 * no network, so it can never render blank.
 */
export function ProductThumb({
  imageUrl,
  emoji,
  label,
  className = "h-14 w-14",
}: {
  imageUrl?: string | null;
  emoji: string;
  label?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#efe8db] to-[#e2d6c0] ${className}`}>
      {/* Always-visible emoji base — the real photo covers it when it loads. */}
      <span className="absolute inset-0 flex items-center justify-center text-2xl leading-none" role="img" aria-label={label || "product"}>{emoji}</span>
      {Boolean(imageUrl) && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl as string}
          alt={label || ""}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
}
