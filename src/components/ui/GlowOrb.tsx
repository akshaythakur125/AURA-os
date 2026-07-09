"use client";

import { useEffect, useRef, useState } from "react";

interface GlowOrbProps {
  color?: string;
  size?: number;
  className?: string;
  delay?: number;
}

export function GlowOrb({
  color = "rgba(147, 51, 234, 0.15)",
  size = 300,
  className = "",
  delay = 0,
}: GlowOrbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute rounded-full transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"} ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(60px)",
        animation: `float-slow ${8 + delay / 1000}s ease-in-out infinite`,
        animationDelay: `${delay}ms`,
      }}
    />
  );
}
