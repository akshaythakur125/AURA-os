"use client";

import { useRef, useCallback, type ReactNode } from "react";

interface GlassCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function GlassCard({ icon, title, description, className = "" }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      ref.current.style.transform =
        `perspective(800px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) scale3d(1.02,1.02,1.02)`;
    });
  }, []);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (ref.current) {
      ref.current.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)";
      ref.current.style.transition = "transform 600ms cubic-bezier(0.34,1.56,0.64,1)";
    }
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`glass-card group relative overflow-hidden rounded-2xl p-8 transition-[border-color] duration-300 hover:border-white/[0.1] ${className}`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/[0.04] to-blue-500/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] text-rose-400 transition-colors duration-300 group-hover:bg-rose-500/10">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-400">{description}</p>
      </div>
    </div>
  );
}
