"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const CityScene = dynamic(() => import("@/components/world/CityScene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Full-bleed cinematic city behind the homepage hero. Scroll drives the flight
 * (drive 0..1 over the first viewport) so the page opens by flying down an
 * avenue. Desktop + WebGL + motion gated; otherwise a static ink-gradient
 * skyline stands in so the hero is never bare.
 */
export function CityHero() {
  const webgl = useWebGLSupport();
  const [reduced, setReduced] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const drive = useRef(0);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const onM = (e: MediaQueryListEvent) => setReduced(e.matches);
    m.addEventListener("change", onM);
    const w = window.matchMedia("(max-width: 767px)");
    setNarrow(w.matches);
    const onW = (e: MediaQueryListEvent) => setNarrow(e.matches);
    w.addEventListener("change", onW);
    const onScroll = () => {
      drive.current = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      m.removeEventListener("change", onM);
      w.removeEventListener("change", onW);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Show on mobile too (GenZ is mobile-first) — just render lighter there.
  const show3D = !reduced && webgl === true;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {show3D ? (
        <CityScene drive={drive} lite={narrow} />
      ) : (
        // Static skyline fallback — layered ink silhouettes on a warm dusk sky
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f3e7d2_0%,#ecdcc2_45%,#e2cdb0_100%)]">
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2 opacity-90"
            style={{
              backgroundImage:
                "linear-gradient(90deg,#171310 0 8%,transparent 8% 12%,#1c1714 12% 18%,transparent 18% 22%,#141110 22% 32%,transparent 32% 35%,#1c1714 35% 44%,transparent 44% 48%,#171310 48% 60%,transparent 60% 64%,#1c1714 64% 74%,transparent 74% 78%,#141110 78% 90%,transparent 90% 100%)",
              maskImage: "linear-gradient(180deg,transparent,#000 40%)",
              WebkitMaskImage: "linear-gradient(180deg,transparent,#000 40%)",
            }}
          />
        </div>
      )}
      {/* Legibility scrim: bone from the left (where hero copy sits) fading to
          reveal the city on the right; plus a soft bottom fade into the page. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#F2ECE1_0%,rgba(242,236,225,0.86)_30%,rgba(242,236,225,0.35)_55%,rgba(242,236,225,0)_78%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,#F2ECE1)]" />
    </div>
  );
}
