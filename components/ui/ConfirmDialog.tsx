"use client";

import { useState, useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  requireTypedConfirm?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "default";
}

function DialogContent({
  title,
  message,
  confirmLabel,
  cancelLabel,
  requireTypedConfirm,
  onConfirm,
  onCancel,
  variant,
}: Omit<ConfirmDialogProps, "open">) {
  const [typedText, setTypedText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  const canConfirm = requireTypedConfirm ? typedText === requireTypedConfirm : true;

  return (
    <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl">
      <h3 className={`text-lg font-semibold ${variant === "danger" ? "text-red-400" : "text-white"}`}>
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-400">{message}</p>
      {requireTypedConfirm && (
        <input
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          placeholder={`Type "${requireTypedConfirm}" to confirm`}
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
        />
      )}
      <div className="mt-6 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-40 ${
            variant === "danger"
              ? "bg-red-600 hover:bg-red-500"
              : "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, ...contentProps } = props;

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && open) contentProps.onCancel();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <DialogContent key={String(open)} {...contentProps} />
    </div>
  );
}
