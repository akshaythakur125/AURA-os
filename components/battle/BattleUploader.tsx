"use client";

import { useState, useRef, useCallback } from "react";

interface BattleUploaderProps {
  side: "left" | "right";
  label: string;
  onImage: (dataUrl: string) => void;
  disabled?: boolean;
}

export function BattleUploader({ side, label, onImage, disabled }: BattleUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [onImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  return (
    <div
      className={`relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
        dragging
          ? "border-purple-400 bg-purple-500/10"
          : preview
          ? "border-emerald-500/30 bg-white/[0.02]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        <>
          <img src={preview} alt={label} className="h-full w-full rounded-xl object-cover" />
          <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/60 px-3 py-1.5 text-center text-xs text-white">
            {label}
          </div>
        </>
      ) : (
        <>
          <svg className="mb-2 h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-[10px] text-gray-600">Drag & drop or tap to upload</p>
        </>
      )}
    </div>
  );
}
