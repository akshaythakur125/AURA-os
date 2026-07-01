"use client";

import type { BuyTiming } from "@/lib/commerce/deals/bestTimeToBuy";

interface Props {
  timing: BuyTiming;
  label: string;
  className?: string;
}

const STYLES: Record<BuyTiming, string> = {
  buy_now: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  wait: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  verify_first: "bg-red-500/15 text-red-400 border-red-500/20",
  not_enough_data: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

const ICONS: Record<BuyTiming, string> = {
  buy_now: "✓",
  wait: "⏳",
  verify_first: "⚠",
  not_enough_data: "?",
};

export function BestTimeToBuyBadge({ timing, label, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STYLES[timing] || STYLES.not_enough_data} ${className}`}
      title={label}
    >
      <span>{ICONS[timing]}</span>
      <span>{label}</span>
    </span>
  );
}
