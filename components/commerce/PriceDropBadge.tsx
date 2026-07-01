"use client";

interface Props {
  dropAmount: number;
  dropPercent: number;
  className?: string;
}

export function PriceDropBadge({ dropAmount, dropPercent, className = "" }: Props) {
  if (dropAmount <= 0) return null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ${className}`}>
      <span>↓</span>
      <span>₹{dropAmount} ({dropPercent}%)</span>
    </span>
  );
}

export function PriceUpBadge({ amount, percent, className = "" }: { amount: number; percent: number; className?: string }) {
  if (amount <= 0) return null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400 ${className}`}>
      <span>↑</span>
      <span>₹{amount} ({percent}%)</span>
    </span>
  );
}
