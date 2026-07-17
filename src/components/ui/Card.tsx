"use client";

import { useRef, useCallback, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  tilt?: boolean;
  onClick?: () => void;
}

const CardInner = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, hover, onClick }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "glass-card rounded-2xl p-6 transition-all duration-500",
          hover && "card-3d cursor-pointer hover:border-[#1c1917]/10",
          onClick && "cursor-pointer",
          className
        )}
      >
        {children}
      </div>
    );
  }
);
CardInner.displayName = "CardInner";

export function Card({ children, className, hover = false, tilt = false, onClick }: CardProps) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tiltRef.current) return;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        if (!tiltRef.current) return;
        const rect = tiltRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (y - 0.5) * -6;
        const tiltY = (x - 0.5) * 6;
        tiltRef.current.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.015, 1.015, 1.015)`;
        tiltRef.current.style.transition = "transform 120ms cubic-bezier(0.22, 1.2, 0.36, 1)";
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    if (tiltRef.current) {
      // Spring-back: overshoot then settle
      tiltRef.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      tiltRef.current.style.transition = "transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)";
    }
  }, []);

  if (tilt) {
    return (
      <div
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={cn(
          "glass-card rounded-2xl p-6 cursor-pointer transition-all",
          "hover:border-[#1c1917]/10"
        )}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: "0 2px 4px rgba(28,25,23,0.06), 0 12px 32px rgba(28,25,23,0.1), 0 28px 56px -16px rgba(28,25,23,0.12)",
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <CardInner
      className={className}
      hover={hover}
      tilt={tilt}
      onClick={onClick}
    >
      {children}
    </CardInner>
  );
}
