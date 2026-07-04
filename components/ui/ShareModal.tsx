"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { generateShareCardBlob, type ShareCardRatio } from "@/lib/export/generateShareCard";
import { trackEvent } from "@/lib/storage/analyticsStore";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  score: number;
  category: string;
  strongestSignal: string;
  biggestLeak: string;
  onShareComplete?: () => void;
}

const PLATFORMS = [
  { key: "whatsapp", label: "WhatsApp", icon: "💬", color: "border-emerald-500/30 hover:bg-emerald-500/10" },
  { key: "instagram", label: "Instagram", icon: "📸", color: "border-purple-500/30 hover:bg-purple-500/10" },
  { key: "twitter", label: "Twitter/X", icon: "🐦", color: "border-sky-500/30 hover:bg-sky-500/10" },
  { key: "copy", label: "Copy Link", icon: "🔗", color: "border-gray-500/30 hover:bg-gray-500/10" },
  { key: "download", label: "Download", icon: "⬇️", color: "border-amber-500/30 hover:bg-amber-500/10" },
] as const;

const RATIOS: { key: ShareCardRatio; label: string; preview: string }[] = [
  { key: "square", label: "1:1 Post", preview: "w-16 h-16" },
  { key: "story", label: "Story", preview: "w-10 h-16" },
  { key: "wide", label: "Twitter", preview: "w-16 h-9" },
];

export function ShareModal({ open, onClose, score, category, strongestSignal, biggestLeak, onShareComplete }: ShareModalProps) {
  const [ratio, setRatio] = useState<ShareCardRatio>("square");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);
  const blobRef = useRef<Blob | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const shareUrl = `https://auracheck.vercel.app/?utm_source=share&utm_medium=organic&utm_campaign=aura_score`;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setShared(false);
    generateShareCardBlob({ score, category, strongestSignal, biggestLeak, ratio })
      .then((blob) => {
        blobRef.current = blob;
        if (blob) setPreviewUrl(URL.createObjectURL(blob));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, ratio, score, category, strongestSignal, biggestLeak]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const handleShare = async (platform: string) => {
    trackEvent("share_card_shared", { platform, score: String(score) });

    if (platform === "copy") {
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      onShareComplete?.();
      return;
    }

    if (platform === "download") {
      try {
        await generateShareCardPng_download({ score, category, strongestSignal, biggestLeak, ratio });
      } catch { /* fallback */ }
      setShared(true);
      onShareComplete?.();
      return;
    }

    const text = `My Aura Score: ${score}/100 — ${category}. Check yours free at auracheck.vercel.app`;

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`, "_blank");
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
    } else if (platform === "instagram") {
      if (blobRef.current) {
        try {
          const file = new File([blobRef.current], `aura-${score}.png`, { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: "My Aura Score", text });
          } else {
            await navigator.clipboard.writeText(text + " " + shareUrl);
          }
        } catch { /* fallback */ }
      } else {
        try {
          await navigator.share({ title: "My Aura Score", text: text + " " + shareUrl });
        } catch { /* cancelled */ }
      }
    }

    setShared(true);
    onShareComplete?.();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f15] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Share Your Aura Score</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>

        {/* Ratio selector */}
        <div className="mb-4 flex gap-2">
          {RATIOS.map((r) => (
            <button
              key={r.key}
              onClick={() => setRatio(r.key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all ${
                ratio === r.key
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-white/5 text-gray-400 border border-transparent hover:text-gray-300"
              }`}
            >
              <span className={`block rounded border border-current ${r.preview}`} />
              {r.label}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="mb-4 flex justify-center">
          {loading ? (
            <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-white/5">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Share preview" className="max-h-64 rounded-xl border border-white/10" />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-white/5 text-gray-500 text-sm">
              Generating preview...
            </div>
          )}
        </div>

        {shared && (
          <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-300">
            Shared a tip is unlocked! 🎉
          </div>
        )}

        {/* Platform buttons */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              onClick={() => handleShare(p.key)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition-all ${p.color}`}
            >
              <span className="text-lg">{p.icon}</span>
              <span className="text-gray-300">{p.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-gray-400 outline-none"
            onFocus={(e) => e.target.select()}
          />
          <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(shareUrl); setShared(true); onShareComplete?.(); }}>
            Copy
          </Button>
        </div>

        <p className="mt-3 text-center text-[10px] text-gray-600">
          Share to unlock a free tip. No sign-up needed for friends.
        </p>
      </div>
    </div>
  );
}

async function generateShareCardPng_download(sc: { score: number; category: string; strongestSignal: string; biggestLeak: string; ratio: ShareCardRatio }): Promise<void> {
  const { generateShareCardPng } = await import("@/lib/export/generateShareCard");
  return generateShareCardPng(sc);
}
