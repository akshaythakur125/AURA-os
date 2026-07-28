"use client";

import Link from "next/link";
import { searchLink } from "@/lib/shop/searchLink";
import { trackEvent, EVENTS } from "@/lib/analytics/events";

/**
 * A compact, tasteful "shop the fix" nudge for the lightweight tools
 * (post-or-not, fit-check, which-one, retake-coach). Static — no per-frame
 * metric churn — with affiliate-tagged retailer links so every tool becomes a
 * commission touchpoint, plus a route into the fully-open /shop. Honest: the
 * gear picks are the evergreen top upgrades for any photo; the style variant
 * points at camera-ready looks.
 */
type Variant = "gear" | "style";

const GEAR = [
  { label: "Ring light for phone", q: "ring light for phone with tripod stand", emoji: "💡" },
  { label: "Phone tripod + remote", q: "mobile phone tripod stand with bluetooth remote", emoji: "📷" },
];
const STYLE = [
  { label: "Plain solid tee", q: "plain solid fit t shirt", emoji: "👕" },
  { label: "Clean white sneakers", q: "minimal white sneakers", emoji: "👟" },
];

export function ShopNudge({
  variant = "gear",
  title,
  blurb,
}: {
  variant?: Variant;
  title?: string;
  blurb?: string;
}) {
  const items = variant === "style" ? STYLE : GEAR;
  const heading = title ?? (variant === "style" ? "Shop a camera-ready look" : "Gear that fixes this");
  const sub = blurb ?? (variant === "style"
    ? "Solid, well-fitted basics photograph cleaner than anything logo-heavy."
    : "The two upgrades that improve every photo you take — buy once, reuse forever.");

  return (
    <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm">🛍️</span>
        <h3 className="text-sm font-semibold text-[#1C1917]">{heading}</h3>
      </div>
      <p className="mb-3 text-xs text-[#857b6e]">{sub}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        {items.map((it) => (
          <a
            key={it.q}
            href={searchLink(it.q, "amazon")}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => trackEvent(EVENTS.SHOP_LINK_CLICKED, { retailer: "amazon", lookCategory: variant })}
            className="flex flex-1 items-center gap-2 rounded-xl border border-[#1c1917]/[0.08] bg-[#fbf8f2]/70 px-3 py-2.5 text-xs font-medium text-[#1C1917] transition-colors hover:border-[#E14434]/40"
          >
            <span className="text-base">{it.emoji}</span>
            <span className="flex-1">{it.label}</span>
            <span className="font-semibold text-[#E14434]">Shop →</span>
          </a>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Link href="/shop" className="text-[11px] font-semibold text-[#4a443d] hover:text-[#1C1917]">
          Browse all looks →
        </Link>
        <span className="text-[10px] text-[#9c9184]">Affiliate links · no extra cost</span>
      </div>
    </div>
  );
}
