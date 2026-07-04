"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { getProductById } from "@/config/products";

interface LeakFixProductCardProps {
  productId: string;
  compact?: boolean;
}

export function LeakFixProductCard({ productId, compact }: LeakFixProductCardProps) {
  const product = getProductById(productId);
  if (!product || product.price === 0) return null;

  const handleClick = () => {
    trackEvent("affiliate_clicked", { productId, storeKey: "amazon", price: String(product.price) });
  };

  if (compact) {
    return (
      <a
        href={product.affiliateUrl === "#" ? undefined : product.affiliateUrl}
        target={product.affiliateUrl !== "#" ? "_blank" : undefined}
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-purple-500/30 transition-colors"
      >
        <span className="text-xs text-gray-300 truncate">{product.title}</span>
        <span className="text-xs font-semibold text-purple-400 shrink-0">{product.priceLabel}</span>
      </a>
    );
  }

  return (
    <a
      href={product.affiliateUrl === "#" ? undefined : product.affiliateUrl}
      target={product.affiliateUrl !== "#" ? "_blank" : undefined}
      rel="noopener noreferrer"
      onClick={handleClick}
      className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-purple-500/30 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-white">{product.title}</h4>
        <span className="text-sm font-bold text-purple-400">{product.priceLabel}</span>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{product.whyItWorks}</p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[10px] text-gray-500 bg-white/5 rounded-full px-2 py-0.5">
          {product.category.replace(/_/g, " ")}
        </span>
        <span className="text-[10px] text-emerald-400">
          Fixes: {product.statusLeakTags.map(t => t).join(", ")}
        </span>
      </div>
    </a>
  );
}
