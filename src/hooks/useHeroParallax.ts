"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HeroParallaxRefs {
  section: RefObject<HTMLElement | null>;
  backLayer: RefObject<HTMLElement | null>;
  midLayer: RefObject<HTMLElement | null>;
  depthLayer: RefObject<HTMLElement | null>;
}

/**
 * Scroll-scrubbed depth: background drifts slowest, mid layer faster,
 * and the hero mockup recedes (scale down + rotateX + fade) as if the
 * layout is physically tilting away into the page. Bails out entirely
 * under prefers-reduced-motion — no partial-motion middle ground.
 */
export function useHeroParallax({ section, backLayer, midLayer, depthLayer }: HeroParallaxRefs) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!section.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (backLayer.current) {
        gsap.to(backLayer.current, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }

      if (midLayer.current) {
        gsap.to(midLayer.current, {
          yPercent: -22,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }

      if (depthLayer.current) {
        gsap.set(depthLayer.current, { transformPerspective: 1000, transformOrigin: "center top" });
        gsap.to(depthLayer.current, {
          yPercent: -8,
          scale: 0.88,
          rotateX: 10,
          opacity: 0.35,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }
    }, section.current ?? undefined);

    return () => ctx.revert();
  }, [section, backLayer, midLayer, depthLayer]);
}
