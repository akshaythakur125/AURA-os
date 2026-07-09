"use client";

import { useRef, useCallback } from "react";

interface TiltOptions {
  maxTilt?: number;
  scale?: number;
  speed?: number;
}

export function useMouseTilt(options: TiltOptions = {}) {
  const { maxTilt = 8, scale = 1.02, speed = 400 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

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

        ref.current.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`;
        ref.current.style.transition = `transform ${speed}ms cubic-bezier(0.23, 1, 0.32, 1)`;
      });
    },
    [maxTilt, scale, speed]
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    if (ref.current) {
      ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      ref.current.style.transition = `transform ${speed}ms cubic-bezier(0.23, 1, 0.32, 1)`;
    }
  }, [speed]);

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}
