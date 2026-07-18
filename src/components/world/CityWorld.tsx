"use client";

import { useEffect, useRef } from "react";
import CityScene from "@/components/world/CityScene";

/**
 * Ambient city behind every page — a calm, high skyline that drifts as you
 * scroll, so the whole site feels like it lives inside the 3D city. Carries its
 * own bone scrims (a soft radial over the centre where content sits, plus top
 * and bottom fades) so text stays readable on top. Gating + opacity live in
 * WorldBackground.
 */
export default function CityWorld({ lite = false }: { lite?: boolean }) {
  const drive = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      // progress across the WHOLE page — scrolling is one continuous flight
      // deeper into the city, banking between sections
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      drive.current = Math.min(1, window.scrollY / max);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="absolute inset-0">
      <CityScene drive={drive} ambient lite={lite} />
      {/* keep page content readable: soft overall veil, a brighter centre where
          content sits, and top & bottom fades to bone */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,236,225,0.72)_0%,rgba(242,236,225,0.5)_38%,rgba(242,236,225,0.28)_70%,rgba(242,236,225,0.2)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,#F2ECE1,transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,#F2ECE1,transparent)]" />
    </div>
  );
}
