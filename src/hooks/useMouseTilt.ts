"use client";

import { useRef, useCallback } from "react";

interface TiltOptions {
  maxTilt?: number;
  scale?: number;
  speed?: number;
  springBack?: boolean;
}

export function useMouseTilt(options: TiltOptions = {}) {
  const { maxTilt = 8, scale = 1.025, speed = 500, springBack = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const currentTilt = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      cancelAnimationFrame(frameRef.current);

      frameRef.current = requestAnimationFrame(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * maxTilt * -1;
        const tiltY = (x - 0.5) * maxTilt;

        currentTilt.current = { x: tiltX, y: tiltY };

        ref.current.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`;
        ref.current.style.transition = "transform 120ms cubic-bezier(0.22, 1.2, 0.36, 1)";
      });
    },
    [maxTilt, scale]
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    if (ref.current) {
      // Spring-back: overshoot slightly then settle
      ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      ref.current.style.transition = springBack
        ? "transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)"
        : `transform ${speed}ms cubic-bezier(0.22, 1, 0.3, 1)`;
    }
  }, [springBack, speed]);

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}
