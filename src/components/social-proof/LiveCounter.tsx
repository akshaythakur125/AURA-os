"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function LiveCounter({ value, label, prefix = "", suffix = "", className = "" }: Props) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div className={`text-center ${className}`}>
      <div className="text-2xl font-bold text-[#1C1917] sm:text-3xl">
        {prefix}<span ref={ref}>{display.toLocaleString()}</span>{suffix}
      </div>
      <div className="mt-1 text-xs text-[#857b6e]">{label}</div>
    </div>
  );
}
