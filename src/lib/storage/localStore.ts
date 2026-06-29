import type { StorageData, StorageKey, StorageListener } from "./types";
import { DEFAULT_STORAGE } from "./types";

const STORAGE_KEY = "auracheck-data";

let listeners: StorageListener[] = [];

function read(): StorageData {
  if (typeof window === "undefined") return { ...DEFAULT_STORAGE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STORAGE };
    return JSON.parse(raw) as StorageData;
  } catch {
    return { ...DEFAULT_STORAGE };
  }
}

function write(data: StorageData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    listeners.forEach((fn) => fn(data));
  } catch {
    console.warn("Failed to write to localStorage");
  }
}

export function getData(): StorageData {
  return read();
}

export function updateData(key: StorageKey, value: unknown): void {
  const data = read();
  (data as unknown as Record<string, unknown>)[key] = value;
  write(data);
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  write({ ...DEFAULT_STORAGE });
}

export function subscribe(listener: StorageListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((fn) => fn !== listener);
  };
}
