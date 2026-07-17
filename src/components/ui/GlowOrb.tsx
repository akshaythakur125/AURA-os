"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface GlowOrbProps {
  color?: string;
  size?: number;
  className?: string;
  delay?: number;
  parallax?: boolean;
}

export function GlowOrb({
  color = "rgba(225, 68, 52, 0.15)",
  size = 300,
  className = "",
  delay = 0,
  parallax = true,
}: GlowOrbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!parallax || !ref.current) return;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        if (!ref.current) return;
        const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
        const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;
        const driftX = xPercent * 20;
        const driftY = yPercent * 15;
        ref.current.style.transform = `translate(${driftX}px, ${driftY}px)`;
      });
    },
    [parallax]
  );

  useEffect(() => {
    if (!parallax) return;
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, [parallax, handleMouseMove]);

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
        transition: parallax
          ? "transform 400ms cubic-bezier(0.22, 1, 0.3, 1), opacity 1000ms ease"
          : "opacity 1000ms ease",
      }}
    />
  );
}
