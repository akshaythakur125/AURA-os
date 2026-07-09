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
          "glass-card rounded-2xl p-6",
          hover && "card-3d cursor-pointer transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(147,51,234,0.2)]",
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
        tiltRef.current.style.transition = "transform 500ms cubic-bezier(0.23, 1, 0.32, 1)";
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    if (tiltRef.current) {
      tiltRef.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      tiltRef.current.style.transition = "transform 500ms cubic-bezier(0.23, 1, 0.32, 1)";
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
          "glass-card rounded-2xl p-6 cursor-pointer",
          "transition-shadow duration-500 hover:shadow-[0_20px_60px_-15px_rgba(147,51,234,0.2)]",
          className
        )}
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
