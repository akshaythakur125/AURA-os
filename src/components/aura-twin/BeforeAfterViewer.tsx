"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ponytail: before/after drag slider — pure CSS, no dependencies

type BeforeAfterProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  width?: number;
  height?: number;
};

export function BeforeAfterViewer({
  beforeSrc,
  afterSrc,
  beforeLabel = "Original",
  afterLabel = "Simulated improvement",
  width = 400,
  height = 300,
}: BeforeAfterProps) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      updatePos(x);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updatePos]);

  return (
    <div className="relative select-none" style={{ width, height }}>
      {/* After image (full) */}
      <img src={afterSrc} alt={afterLabel} className="absolute inset-0 h-full w-full object-cover rounded-xl" />

      {/* Before image (clipped) */}
      <div className="absolute inset-0 overflow-hidden rounded-xl" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={beforeSrc} alt={beforeLabel} className="h-full w-full object-cover" />
      </div>

      {/* Divider line */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/80" style={{ left: `${pos}%` }}>
        {/* Drag handle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 border-white bg-black/50 backdrop-blur-sm flex items-center justify-center cursor-ew-resize"
          onMouseDown={() => { dragging.current = true; }}
          onTouchStart={() => { dragging.current = true; }}
          role="slider"
          aria-label="Compare before and after"
          aria-valuenow={Math.round(pos)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          }}
        >
          <span className="text-[#1C1917] text-xs">⇔</span>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-1 text-[10px] text-[#1C1917]">{beforeLabel}</div>
      <div className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[10px] text-[#1C1917]">{afterLabel}</div>
    </div>
  );
}
