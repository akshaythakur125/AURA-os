"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";

// ponytail: CSS 3D sculpture — same approach as AuraCore homepage component
// Maps dimension scores to ring radii, confidence to opacity, null to dimmed

type AssessmentStatus = "assessed" | "not-assessable" | "insufficient-quality";

type SignalDimension = {
  id: string;
  label: string;
  score: number | null;
  confidence: number;
  assessmentStatus: AssessmentStatus;
  strongestFinding?: string;
  priorityFinding?: string;
};

type SignalSculptureProps = {
  dimensions: SignalDimension[];
  overallScore: number | null;
  overallConfidence: number;
  selectedDimensionId?: string;
  interactive?: boolean;
  compact?: boolean;
  onDimensionSelect?: (id: string) => void;
};

function scoreToRadius(score: number | null, base: number, range: number, status: AssessmentStatus): number {
  if (status !== "assessed" || score === null) return base * 0.4; // shrunk for non-assessable
  return base + (score / 100) * range;
}

function confidenceToOpacity(confidence: number): number {
  return 0.3 + (confidence / 100) * 0.7; // range 0.3 to 1.0
}

function getScoreColor(score: number | null, status: AssessmentStatus): string {
  if (status !== "assessed" || score === null) return "#4b5563"; // gray for non-assessable
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#a78bfa";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

const STATUS_LABELS: Record<AssessmentStatus, string> = {
  assessed: "",
  "not-assessable": "Not assessable",
  "insufficient-quality": "Insufficient quality",
};

export function SignalSculpture({
  dimensions,
  overallScore,
  overallConfidence,
  selectedDimensionId,
  interactive = true,
  compact = false,
  onDimensionSelect,
}: SignalSculptureProps) {
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
        setRotation((r) => r + dt * 6);
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
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  }, [interactive]);

  const size = compact ? 200 : 320;
  const center = size / 2;

  const rings = useMemo(() => {
    return dimensions.map((dim, i) => {
      const angle = (i / dimensions.length) * 360;
      const baseRadius = compact ? 45 : 70;
      const range = compact ? 25 : 40;
      const r = scoreToRadius(dim.score, baseRadius, range, dim.assessmentStatus);
      const color = getScoreColor(dim.score, dim.assessmentStatus);
      const opacity = confidenceToOpacity(dim.confidence);
      const isSelected = selectedDimensionId === dim.id;
      const isHovered = hovered === dim.id;
      return { ...dim, angle, r, color, opacity, isSelected, isHovered };
    });
  }, [dimensions, hovered, selectedDimensionId, compact]);

  const tiltX = mousePos.y * -6;
  const tiltY = mousePos.x * 6;

  // Overall score ring
  const overallRadius = overallScore !== null ? scoreToRadius(overallScore, compact ? 30 : 45, compact ? 10 : 15, "assessed") : compact ? 15 : 20;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      role="img"
      aria-label={`Signal sculpture: overall score ${overallScore ?? "not available"} out of 100, ${dimensions.length} dimensions assessed`}
      className={`relative ${compact ? "w-[200px] h-[200px]" : "w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]"}`}
      style={{ perspective: "800px" }}
    >
      {/* Ambient glow — color based on overall score */}
      <div
        className="absolute rounded-full blur-3xl transition-opacity duration-700"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          left: center - size * 0.35,
          top: center - size * 0.35,
          background: `radial-gradient(circle, ${getScoreColor(overallScore, "assessed")}30, transparent)`,
          opacity: hovered ? 0.3 : 0.12,
        }}
      />

      {/* 3D scene */}
      <div
        className="absolute inset-0 transition-transform duration-200"
        style={{
          transformStyle: "preserve-3d" as React.CSSProperties["transformStyle"],
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        }}
      >
        {/* Central core — overall score */}
        <div
          className="absolute rounded-full transition-all duration-300"
          style={{
            width: overallRadius * 2,
            height: overallRadius * 2,
            left: center - overallRadius,
            top: center - overallRadius,
            background: `radial-gradient(circle at 35% 35%, ${getScoreColor(overallScore, "assessed")}, ${getScoreColor(overallScore, "assessed")}80)`,
            boxShadow: `0 0 ${compact ? 15 : 30}px ${getScoreColor(overallScore, "assessed")}40`,
            opacity: overallScore !== null ? 1 : 0.3,
          }}
        />

        {/* Dimension rings */}
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
              border: `${ring.isSelected ? 3 : 2}px solid ${ring.color}`,
              boxShadow: ring.isSelected || ring.isHovered
                ? `0 0 12px ${ring.color}80, inset 0 0 8px ${ring.color}20`
                : `0 0 3px ${ring.color}20`,
              transform: `rotateZ(${rotation + ring.angle}deg)`,
              transformStyle: "preserve-3d" as React.CSSProperties["transformStyle"],
              opacity: ring.opacity,
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
            aria-label={`${ring.label}: score ${ring.score ?? "not assessed"}, confidence ${ring.confidence}%`}
          >
            {/* Score dot */}
            <div
              className="absolute rounded-full transition-all duration-300"
              style={{
                width: ring.isSelected ? 8 : 5,
                height: ring.isSelected ? 8 : 5,
                background: ring.color,
                top: -2,
                left: "50%",
                transform: "translateX(-50%)",
                boxShadow: `0 0 ${ring.isSelected ? 8 : 3}px ${ring.color}`,
              }}
            />
          </div>
        ))}

        {/* Hover/selected tooltip */}
        {(hovered || selectedDimensionId) && (() => {
          const activeId = hovered || selectedDimensionId;
          const dim = dimensions.find((d) => d.id === activeId);
          if (!dim) return null;
          return (
            <div
              className="absolute z-10 pointer-events-none"
              style={{ left: center, top: center - (compact ? 60 : 90), transform: "translateX(-50%)" }}
            >
              <div className="rounded-xl border border-[#1c1917]/10 bg-black/85 backdrop-blur-sm px-4 py-2.5 text-center min-w-[140px]">
                <div className="text-xs font-semibold text-[#1C1917]">{dim.label}</div>
                <div className="mt-1 text-lg font-bold" style={{ color: getScoreColor(dim.score, dim.assessmentStatus) }}>
                  {dim.score !== null ? `${dim.score}/100` : STATUS_LABELS[dim.assessmentStatus]}
                </div>
                <div className="text-[10px] text-[#6f675e]">
                  Confidence: {dim.confidence >= 70 ? "High" : dim.confidence >= 40 ? "Moderate" : "Limited"}
                </div>
                {dim.strongestFinding && (
                  <div className="mt-1.5 text-[10px] text-emerald-400 max-w-[180px]">{dim.strongestFinding}</div>
                )}
                {dim.priorityFinding && (
                  <div className="mt-1 text-[10px] text-amber-400 max-w-[180px]">{dim.priorityFinding}</div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/** Accessible 2D fallback — radar chart style list */
export function SignalSculptureFallback({ dimensions }: { dimensions: SignalDimension[] }) {
  return (
    <div className="w-full max-w-sm space-y-2" role="list" aria-label="Dimension scores">
      {dimensions.map((d) => (
        <div key={d.id} className="flex items-center gap-3" role="listitem">
          <span className="w-28 text-xs text-[#6f675e]">{d.label}</span>
          <div className="flex-1 h-2 rounded-full bg-[#1c1917]/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: d.score !== null ? `${d.score}%` : "10%",
                background: getScoreColor(d.score, d.assessmentStatus),
                opacity: confidenceToOpacity(d.confidence),
              }}
            />
          </div>
          <span className="text-xs font-medium w-16 text-right" style={{ color: getScoreColor(d.score, d.assessmentStatus) }}>
            {d.score !== null ? `${d.score}/100` : STATUS_LABELS[d.assessmentStatus]}
          </span>
        </div>
      ))}
    </div>
  );
}
