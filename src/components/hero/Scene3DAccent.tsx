"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const LensScene = dynamic(() => import("@/components/hero/LensScene"), {
  ssr: false,
  loading: () => null,
});
const ModelScene = dynamic(() => import("@/components/hero/ModelScene"), {
  ssr: false,
  loading: () => null,
});
const GenZScene = dynamic(() => import("@/components/hero/GenZScene"), {
  ssr: false,
  loading: () => null,
});

type GenZShape = "sunglasses" | "headphones" | "boba" | "phone" | "gamepad" | "cap";

// Named 3D models bundled in /public/hero-assets. Each tuned for its shape.
const MODELS: Record<string, { url: string; spin: number; fill: number }> = {
  camera: { url: "/hero-assets/antique-camera.glb", spin: 0.0035, fill: 3.1 },
  fish: { url: "/hero-assets/fish.glb", spin: 0.005, fill: 4.2 },
  boombox: { url: "/hero-assets/boombox.glb", spin: 0.006, fill: 3.4 },
  fox: { url: "/hero-assets/fox.glb", spin: 0.004, fill: 4.0 },
};

interface Scene3DAccentProps {
  /** square box size in px (desktop) */
  size?: number;
  className?: string;
  /** optional named glTF model */
  model?: keyof typeof MODELS;
  /** optional procedural GenZ object (sunglasses / headphones / boba) */
  shape?: GenZShape;
}

/**
 * Reusable 3D accent for page headers. Renders a real modelled glTF object (if
 * `model` is given) or the procedural camera-lens, on a capable desktop; under
 * reduced-motion / no-WebGL / narrow screens it falls back to a flat CSS ring
 * so the slot is never empty.
 */
export function Scene3DAccent({ size = 220, className = "", model, shape }: Scene3DAccentProps) {
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
  const cfg = model ? MODELS[model] : null;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {show3D ? (
        shape ? (
          <GenZScene shape={shape} dense={!narrow} />
        ) : cfg ? (
          <ModelScene url={cfg.url} spin={cfg.spin} fill={cfg.fill} dense={!narrow} />
        ) : (
          <LensScene dense={!narrow} />
        )
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
