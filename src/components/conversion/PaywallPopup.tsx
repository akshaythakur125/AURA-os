"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";

interface PaywallPopupProps {
  open: boolean;
  onClose: () => void;
  auditId: string;
  trigger?: string; // what they tried to unlock
}

const FEATURES = [
  { icon: "📊", text: "Full score breakdown — lighting, grooming, expression, and more" },
  { icon: "🔍", text: "All status leaks with exact fixes" },
  { icon: "✨", text: "Celebrity style match + shop the look" },
  { icon: "🗺️", text: "Personalized improvement roadmap — step by step" },
  { icon: "💰", text: "Budget upgrade plan — what to buy and where" },
  { icon: "📍", text: "Nearby salons, gyms, and studios" },
  { icon: "🎨", text: "Color palette recommendations for your skin tone" },
  { icon: "📈", text: "Before vs after improvement preview" },
  { icon: "🎴", text: "Shareable score card — download & share on Instagram" },
  { icon: "🛍️", text: "Personalized product picks — styled for your skin & budget" },
];

export function PaywallPopup({ open, onClose, auditId, trigger }: PaywallPopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <FadeInView>
        <div
          className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0a0a1a] p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white text-lg">
            ✕
          </button>

          {/* Header */}
          <div className="mb-5 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-amber-500 text-xl">
              🔓
            </div>
            <h2 className="text-xl font-bold text-white">Unlock Your Full Report</h2>
            {trigger && (
              <p className="mt-1 text-xs text-gray-500">You tried to view: {trigger}</p>
            )}
          </div>

          {/* What you get */}
          <div className="mb-5 space-y-2.5">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-sm">{f.icon}</span>
                <span className="text-xs text-gray-300">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
            <div className="text-3xl font-bold text-white">₹25</div>
            <div className="text-[11px] text-gray-500">One-time payment · No subscription · Yours forever</div>
          </div>

          {/* CTA */}
          <Link href={`/unlock?auditId=${auditId}&product=aura_report`} className="block">
            <Button size="lg" className="w-full text-base font-bold">
              Unlock Now — ₹25
            </Button>
          </Link>

          <p className="mt-3 text-center text-[10px] text-gray-600">
            Secure payment via Razorpay · Instant access
          </p>
        </div>
      </FadeInView>
    </div>
  );
}
