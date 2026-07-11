"use client";

import { useState, useEffect, useCallback } from "react";

// ponytail: localStorage-backed saved products — no backend needed

const STORAGE_KEY = "aura_saved_products";

export type SavedProduct = {
  id: string;
  title: string;
  category: string;
  priceLabel: string;
  savedAt: number;
};

function readSaved(): SavedProduct[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeSaved(items: SavedProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full — silently fail
  }
}

export function useSavedProducts() {
  const [saved, setSaved] = useState<SavedProduct[]>([]);

  useEffect(() => {
    setSaved(readSaved());
  }, []);

  const isSaved = useCallback(
    (id: string) => saved.some((s) => s.id === id),
    [saved]
  );

  const toggleSave = useCallback(
    (product: Omit<SavedProduct, "savedAt">) => {
      setSaved((prev) => {
        const exists = prev.some((s) => s.id === product.id);
        const next = exists
          ? prev.filter((s) => s.id !== product.id)
          : [...prev, { ...product, savedAt: Date.now() }];
        writeSaved(next);
        return next;
      });
    },
    []
  );

  const clearAll = useCallback(() => {
    setSaved([]);
    writeSaved([]);
  }, []);

  return { saved, isSaved, toggleSave, clearAll };
}
