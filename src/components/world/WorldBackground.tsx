"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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
 * clicks. Shown on the audit flow too — analysis runs on a CPU-backed canvas.
 */
export function WorldBackground() {
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

  // Shown everywhere now, including the audit flow — the photo analysis uses a
  // CPU-backed canvas (willReadFrequently), so the city's WebGL no longer
  // stalls its readbacks. Mobile gets a lighter render.
  if (reduced || webgl !== true) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ opacity: 0.42 }}
      aria-hidden="true"
    >
      <CityWorld lite={narrow} />
    </div>
  );
}
