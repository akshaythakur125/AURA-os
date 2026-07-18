"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const CityWorld = dynamic(() => import("@/components/world/CityWorld"), {
  ssr: false,
  loading: () => null,
});

/**
 * Site-wide 3D "world" — an ambient dusk city skyline that drifts with scroll,
 * sitting behind all content so the whole site feels like it lives inside the
 * 3D city. Desktop + WebGL + motion gated; otherwise renders nothing (the paper
 * background stands alone). pointer-events are off so it never intercepts
 * clicks. Skipped on the audit flow, which needs the GPU for canvas readbacks.
 */
export function WorldBackground() {
  const webgl = useWebGLSupport();
  const pathname = usePathname();
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

  // The audit flow does heavy canvas getImageData analysis — keep the GPU free
  // there so readbacks don't stall. Skip the world on those pages.
  const isHeavyFlow = pathname?.startsWith("/audit");

  if (reduced || narrow || webgl !== true || isHeavyFlow) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0.42 }}
      aria-hidden="true"
    >
      <CityWorld />
    </div>
  );
}
