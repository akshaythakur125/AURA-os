"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ponytail: CSS 3D transforms — 150KB lighter than Three.js, same visual impact

export type AuraDimension = {
  id: string;
  label: string;
  score: number;
  color: string;
};

type AuraCoreProps = {
  dimensions: AuraDimension[];
  interactive?: boolean;
  loading?: boolean;
  compact?: boolean;
  onDimensionSelect?: (id: string) => void;
};

function scoreToRadius(score: number, base: number, range: number): number {
  return base + (score / 100) * range;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#E14434";
  if (score >= 60) return "#D9663C";
  if (score >= 40) return "#E9A23B";
  return "#8A8175";
}

export function AuraCore({
  dimensions,
  interactive = true,
  loading = false,
  compact = false,
  onDimensionSelect,
}: AuraCoreProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const isPaused = useRef(false);

  useEffect(() => {
    let last = performance.now();
    const animate = (now: number) => {
      if (!isPaused.current) {
        const dt = (now - last) / 1000;
        setRotation((r) => r + dt * 8);
      }
      last = now;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const onVis = () => { isPaused.current = document.hidden; };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, [interactive]);

  const size = compact ? 200 : 320;
  const center = size / 2;

  const rings = useMemo(() => {
    return dimensions.map((dim, i) => {
      const angle = (i / dimensions.length) * 360;
      const baseRadius = compact ? 45 : 70;
      const range = compact ? 25 : 40;
      const r = scoreToRadius(dim.score, baseRadius, range);
      const thickness = compact ? 2 : 3;
      const color = dim.color || getScoreColor(dim.score);
      const isHovered = hovered === dim.id;
      return { ...dim, angle, r, thickness, color, isHovered };
    });
  }, [dimensions, hovered, compact]);

  const tiltX = mousePos.y * -8;
  const tiltY = mousePos.x * 8;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      role="img"
      aria-label={`Aura visualization: ${dimensions.map((d) => `${d.label} ${d.score} out of 100`).join(", ")}`}
      className={`relative ${compact ? "w-[200px] h-[200px]" : "w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]"}`}
      style={{ perspective: "800px" }}
    >
      <div
        className="absolute rounded-full blur-3xl opacity-20 transition-opacity duration-700"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          left: center - size * 0.4,
          top: center - size * 0.4,
          background: `radial-gradient(circle, ${dimensions[0]?.color || "#E14434"}40, transparent)`,
          opacity: hovered ? 0.35 : 0.15,
        }}
      />

      <div
        className="absolute inset-0 transition-transform duration-200"
        style={{
          transformStyle: "preserve-3d" as React.CSSProperties["transformStyle"],
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: compact ? 30 : 50,
            height: compact ? 30 : 50,
            left: center - (compact ? 15 : 25),
            top: center - (compact ? 15 : 25),
            background: "radial-gradient(circle at 35% 35%, #ef6a4f, #E14434, #1c1917)",
            boxShadow: `0 0 ${compact ? 20 : 40}px rgba(225, 68, 52,0.4), inset 0 -2px 6px rgba(0,0,0,0.3)`,
          }}
        />

        {rings.map((ring) => (
          <div
            key={ring.id}
            className="absolute cursor-pointer transition-all duration-300"
            style={{
              width: ring.r * 2,
              height: ring.r * 2,
              left: center - ring.r,
              top: center - ring.r,
              borderRadius: "50%",
              border: `${ring.thickness}px solid ${ring.isHovered ? ring.color : ring.color + "60"}`,
              boxShadow: ring.isHovered
                ? `0 0 12px ${ring.color}80, inset 0 0 12px ${ring.color}20`
                : `0 0 4px ${ring.color}20`,
              transform: `rotateZ(${rotation + ring.angle}deg)`,
              transformStyle: "preserve-3d" as React.CSSProperties["transformStyle"],
              opacity: loading ? 0.3 : 1,
            }}
            onMouseEnter={() => interactive && setHovered(ring.id)}
            onMouseLeave={() => interactive && setHovered(null)}
            onClick={() => interactive && onDimensionSelect?.(ring.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onDimensionSelect?.(ring.id);
              }
            }}
            tabIndex={interactive ? 0 : -1}
            role="button"
            aria-label={`${ring.label}: ${ring.score} out of 100`}
          >
            <div
              className="absolute rounded-full transition-all duration-300"
              style={{
                width: ring.isHovered ? 8 : 5,
                height: ring.isHovered ? 8 : 5,
                background: ring.color,
                top: -2,
                left: "50%",
                transform: "translateX(-50%)",
                boxShadow: `0 0 ${ring.isHovered ? 8 : 3}px ${ring.color}`,
              }}
            />
          </div>
        ))}

        {hovered && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{ left: center, top: center - (compact ? 55 : 80), transform: "translateX(-50%)" }}
          >
            <div className="rounded-lg border border-white/10 bg-black/80 backdrop-blur-sm px-3 py-1.5 text-center">
              <div className="text-[11px] font-medium text-white">{dimensions.find((d) => d.id === hovered)?.label}</div>
              <div className="text-[10px] text-gray-400">{hovered && dimensions.find((d) => d.id === hovered)?.score}/100</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AuraCoreFallback({ dimensions }: { dimensions: AuraDimension[] }) {
  return (
    <div className="w-full max-w-xs space-y-2">
      {dimensions.map((d) => (
        <div key={d.id} className="flex items-center gap-3">
          <span className="w-20 text-xs text-gray-400">{d.label}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.color || getScoreColor(d.score) }} />
          </div>
          <span className="text-xs font-medium text-white w-8 text-right">{d.score}</span>
        </div>
      ))}
    </div>
  );
}
