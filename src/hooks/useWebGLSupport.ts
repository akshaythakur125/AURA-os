"use client";

import { useEffect, useState } from "react";

/**
 * Feature-detects real WebGL availability (not just browser sniffing).
 * Returns null while unknown (first render, SSR-safe), then true/false.
 */
export function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
