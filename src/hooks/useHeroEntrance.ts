"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

interface EntranceRefs {
  badge: RefObject<HTMLElement | null>;
  heading: RefObject<HTMLElement | null>;
  paragraph: RefObject<HTMLElement | null>;
  ctaWrap: RefObject<HTMLElement | null>;
  mockup: RefObject<HTMLElement | null>;
  socialProof: RefObject<HTMLElement | null>;
}

// The mockup settles into this off-axis pose instead of flat-on, so the
// 3D read is a permanent trait of the page — visible in a screenshot taken
// seconds or weeks after load, not just during the one-time intro tumble.
const REST_ROTATE_Y = -18;
const REST_ROTATE_X = 6;

/**
 * Runs immediately on mount — no scroll, no hover. The phone mockup tumbles
 * in from real 3D space (rotateY/rotateX/z) rather than just fading, so the
 * "3D" is visible in the first frame instead of hidden behind interaction.
 * Falls back to a plain opacity reveal under prefers-reduced-motion.
 */
export function useHeroEntrance(refs: EntranceRefs) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const els = [
      refs.badge.current,
      refs.heading.current,
      refs.paragraph.current,
      refs.ctaWrap.current,
      refs.mockup.current,
      refs.socialProof.current,
    ];
    if (els.some((el) => !el)) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.set(els, { opacity: 1, clearProps: "transform" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(refs.mockup.current, {
        transformPerspective: 900,
        transformOrigin: "center center",
      });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.fromTo(
        refs.badge.current,
        { opacity: 0, y: -18, rotateX: -50 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.7 },
        0
      )
        .fromTo(
          refs.heading.current,
          { opacity: 0, y: 46, rotateX: -30, scale: 0.95 },
          { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.95 },
          0.12
        )
        .fromTo(
          refs.paragraph.current,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.32
        )
        .fromTo(
          refs.ctaWrap.current,
          { opacity: 0, y: 22, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.8)" },
          0.44
        )
        .fromTo(
          refs.mockup.current,
          { opacity: 0, rotateY: -60, rotateX: 24, z: -280, scale: 0.7 },
          {
            opacity: 1,
            rotateY: REST_ROTATE_Y,
            rotateX: REST_ROTATE_X,
            z: 0,
            scale: 1,
            duration: 1.6,
            ease: "expo.out",
          },
          0.28
        )
        .fromTo(
          refs.socialProof.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6 },
          1.4
        );

      // subtle idle drift around the resting showcase angle, so the phone
      // keeps reading as a 3D object in space rather than a static image
      if (refs.mockup.current) {
        gsap.to(refs.mockup.current, {
          rotateY: REST_ROTATE_Y + 5,
          rotateX: REST_ROTATE_X - 3,
          duration: 4.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 2,
        });
      }
    });

    return () => ctx.revert();
  }, [refs]);
}
