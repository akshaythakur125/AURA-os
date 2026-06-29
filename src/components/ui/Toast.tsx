"use client";

import { useState, useCallback, createContext, useContext, useRef } from "react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastContextValue {
  toast: (message: string, type?: ToastItem["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
  }, []);

  const toast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    const timer = setTimeout(() => removeToast(id), 4000);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  const colorMap: Record<string, string> = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    error: "border-red-500/30 bg-red-500/10 text-red-300",
    info: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-xl animate-in slide-in-from-right ${colorMap[t.type] || colorMap.info}`}
          >
            <span>{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-2 opacity-60 hover:opacity-100">&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
