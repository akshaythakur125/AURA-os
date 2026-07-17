"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const LensScene = dynamic(() => import("@/components/hero/LensScene"), {
  ssr: false,
  loading: () => null,
});

interface Scene3DAccentProps {
  /** square box size in px (desktop) */
  size?: number;
  className?: string;
}

/**
 * Reusable 3D accent (procedural camera-lens) for page headers. Renders the
 * WebGL lens on a capable desktop; under reduced-motion / no-WebGL / narrow
 * screens it falls back to a flat CSS lens ring so the slot is never empty.
 */
export function Scene3DAccent({ size = 220, className = "" }: Scene3DAccentProps) {
  const webgl = useWebGLSupport();
  const [reduced, setReduced] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const onM = (e: MediaQueryListEvent) => setReduced(e.matches);
    m.addEventListener("change", onM);
    const w = window.matchMedia("(max-width: 767px)");
    setNarrow(w.matches);
    const onW = (e: MediaQueryListEvent) => setNarrow(e.matches);
    w.addEventListener("change", onW);
    return () => {
      m.removeEventListener("change", onM);
      w.removeEventListener("change", onW);
    };
  }, []);

  const show3D = !reduced && webgl === true && !narrow;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {show3D ? (
        <LensScene dense={!narrow} />
      ) : (
        // Flat fallback: concentric ink rings with a vermilion accent
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ width: size * 0.8, height: size * 0.8 }}>
            <div className="absolute inset-0 rounded-full border-[6px] border-[#1c1917]/25" />
            <div className="absolute inset-[14%] rounded-full border-[5px] border-[#1c1917]/20" />
            <div className="absolute inset-[28%] rounded-full border-[4px] border-[#E14434]/60" />
            <div className="absolute inset-[44%] rounded-full bg-[#1c1917]/80" />
          </div>
        </div>
      )}
    </div>
  );
}
