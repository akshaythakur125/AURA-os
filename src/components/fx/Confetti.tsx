"use client";

import { useEffect, useRef } from "react";

/**
 * Self-contained canvas confetti burst — no library, no assets. Fires once when
 * `fire` flips true, respects reduced-motion, and cleans itself up. A tasteful
 * celebration for the paid unlock, not a persistent effect.
 */
export function Confetti({ fire }: { fire: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!fire || startedRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    startedRef.current = true;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);

    const colors = ["#E14434", "#ff8a4c", "#34d399", "#f5b342", "#ffffff", "#B23A25"];
    const N = Math.min(160, Math.round(W / 6));
    const parts = Array.from({ length: N }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      return {
        x: W / 2 + (Math.random() - 0.5) * W * 0.3,
        y: H * 0.32,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        size: 5 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
        life: 1,
      };
    });

    const t0 = performance.now();
    const tick = (now: number) => {
      const elapsed = now - t0;
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of parts) {
        p.vy += 0.22; // gravity
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / 2600);
        if (p.life > 0 && p.y < H + 20) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }
      if (alive) rafRef.current = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [fire]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60]"
    />
  );
}
