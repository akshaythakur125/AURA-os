"use client";

import { useState, useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  requireTypedConfirm?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  requireTypedConfirm,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [typedText, setTypedText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onCancel();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  if (!open) return null;

  const canConfirm = requireTypedConfirm ? typedText === requireTypedConfirm : true;
  const colorClass = variant === "danger" ? "border-red-500/30" : variant === "warning" ? "border-amber-500/30" : "border-white/10";
  const btnClass = variant === "danger" ? "bg-red-500/20 text-red-300 hover:bg-red-500/30" : variant === "warning" ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30" : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div
        className={`mx-4 w-full max-w-md rounded-2xl border ${colorClass} bg-black p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
        <p className="mb-4 text-sm text-gray-400">{message}</p>
        {requireTypedConfirm && (
          <div className="mb-4">
            <p className="mb-1.5 text-xs text-gray-500">
              Type <span className="font-mono text-red-400">{requireTypedConfirm}</span> to confirm:
            </p>
            <input
              ref={inputRef}
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
              placeholder={`Type "${requireTypedConfirm}"`}
            />
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${btnClass} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
