"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AuraCore, type AuraDimension } from "@/components/home/AuraCore";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const CameraScene = dynamic(() => import("@/components/hero/CameraScene"), {
  ssr: false,
  loading: () => null,
});

interface HeroModelProps {
  dimensions: AuraDimension[];
}

/**
 * The hero's centrepiece. On a capable desktop it renders the real modelled
 * camera (WebGL). Under reduced-motion, no WebGL, or the stacked mobile
 * layout it falls back to AuraCore's CSS ring visualization, which stands on
 * its own — so the hero always has a strong focal object, never a blank box.
 */
export function HeroModel({ dimensions }: HeroModelProps) {
  const webglSupported = useWebGLSupport();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionMq.matches);
    const onMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionMq.addEventListener("change", onMotion);

    // The model is tuned for the lg+ two-column layout; below that the layout
    // stacks and mobile GPUs struggle, so fall back to AuraCore there.
    const widthMq = window.matchMedia("(max-width: 1023px)");
    setIsNarrow(widthMq.matches);
    const onWidth = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    widthMq.addEventListener("change", onWidth);

    return () => {
      motionMq.removeEventListener("change", onMotion);
      widthMq.removeEventListener("change", onWidth);
    };
  }, []);

  const showModel = !reducedMotion && webglSupported === true && !isNarrow;

  if (!showModel) {
    return <AuraCore dimensions={dimensions} interactive />;
  }

  return (
    <div className="relative h-[420px] w-[420px] xl:h-[480px] xl:w-[480px]">
      <CameraScene dense />
    </div>
  );
}
