"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";

export interface GoalOption {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  color: string;
}

interface GoalTiltCardProps {
  goal: GoalOption;
  selected: boolean;
  index: number;
  onSelect: () => void;
}

/**
 * Goal card with real cursor-driven 3D tilt. The inner layer tilts in a
 * perspective set on the button, and the emoji/text float forward on the
 * Z axis so the depth actually reads. No-ops the tilt under reduced motion.
 */
export function GoalTiltCard({ goal, selected, index, onSelect }: GoalTiltCardProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (reduced || !innerRef.current) return;
      const el = innerRef.current;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        el.style.transform = `rotateX(${(y - 0.5) * -16}deg) rotateY(${(x - 0.5) * 16}deg) translateZ(4px)`;
        el.style.transition = "transform 90ms cubic-bezier(0.22,1.2,0.36,1)";
      });
    },
    [reduced]
  );

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (!innerRef.current) return;
    innerRef.current.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
    innerRef.current.style.transition = "transform 520ms cubic-bezier(0.34,1.56,0.64,1)";
  }, []);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onSelect}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative flex flex-col items-center rounded-2xl border p-4 text-center [perspective:700px] transition-colors duration-200 ${
        selected
          ? "border-red-500/50 bg-red-500/10 ring-2 ring-red-500/30 shadow-lg shadow-red-500/10"
          : "border-[#1c1917]/10 bg-[#1c1917]/[0.02] hover:border-[#1c1917]/20 hover:bg-[#1c1917]/[0.03]"
      }`}
    >
      {selected && (
        <motion.div
          layoutId="goal-glow"
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      <div
        ref={innerRef}
        className="relative flex flex-col items-center gap-2 [transform-style:preserve-3d]"
        style={{ willChange: "transform" }}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${goal.color} text-lg shadow-lg`}
          style={{ transform: "translateZ(30px)" }}
        >
          {goal.emoji}
        </div>
        <div style={{ transform: "translateZ(14px)" }}>
          <div className="text-sm font-semibold text-[#1C1917]">{goal.label}</div>
          <div className="text-[11px] text-[#857b6e]">{goal.desc}</div>
        </div>
      </div>

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-500 shadow-md"
        >
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
