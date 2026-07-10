"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

interface MagneticOptions {
  strength?: number;
}

/**
 * Cursor-following magnetic pull, clamped so the element never leaves
 * its hit box. Intended for exactly one focal CTA per screen — applying
 * this to more than one or two elements reads as noisy, not premium.
 * No-ops entirely under prefers-reduced-motion.
 */
export function useMagneticHover(ref: RefObject<HTMLElement | null>, options: MagneticOptions = {}) {
  const { strength = 0.35 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return; // touch devices: skip

    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "elastic.out(1, 0.4)" });

    function handleMouseMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      xTo(relX * strength);
      yTo(relY * strength);
    }

    function handleMouseLeave() {
      xTo(0);
      yTo(0);
    }

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref, strength]);
}
