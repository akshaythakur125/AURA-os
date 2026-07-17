"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const AuraOrbScene = dynamic(() => import("@/components/hero/AuraOrbScene"), {
  ssr: false,
  loading: () => null,
});

// 2D blurred-circle fallback for reduced-motion, no-WebGL, and the brief
// window before support is detected — never leaves the hero with nothing.
function FallbackGlow() {
  return (
    <>
      <GlowOrb color="rgba(251, 113, 133, 0.22)" size={700} className="top-[-15%] left-[5%]" delay={0} />
      <GlowOrb color="rgba(225, 29, 72, 0.15)" size={550} className="top-[15%] right-[0%]" delay={600} />
      <GlowOrb color="rgba(37, 99, 235, 0.1)" size={450} className="bottom-[5%] left-[25%]" delay={1200} />
    </>
  );
}

export function AuraBackground() {
  const webglSupported = useWebGLSupport();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionMq.matches);
    const motionListener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionMq.addEventListener("change", motionListener);

    const widthMq = window.matchMedia("(max-width: 640px)");
    setIsNarrow(widthMq.matches);
    const widthListener = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    widthMq.addEventListener("change", widthListener);

    return () => {
      motionMq.removeEventListener("change", motionListener);
      widthMq.removeEventListener("change", widthListener);
    };
  }, []);

  const showWebGL = !reducedMotion && webglSupported === true;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {!showWebGL && <FallbackGlow />}
      {showWebGL && <AuraOrbScene dense={!isNarrow} />}
    </div>
  );
}
