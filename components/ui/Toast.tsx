"use client";

import { useState, useCallback } from "react";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = String(++toastId);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const ToastContainer = (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-slide-up rounded-xl border px-4 py-2.5 text-sm shadow-lg backdrop-blur-sm ${
            t.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/20 text-emerald-300"
              : t.type === "error"
                ? "border-red-500/20 bg-red-500/20 text-red-300"
                : "border-purple-500/20 bg-purple-500/20 text-purple-300"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );

  return { show, ToastContainer };
}
