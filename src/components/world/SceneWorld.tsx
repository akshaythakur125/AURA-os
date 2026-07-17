"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A persistent field of floating photographic objects — lens rings, aperture
// rings, film-frame planes — drifting in depth. Fog (paper-coloured) fades far
// objects into the cream so it reads as a real space, not a flat pattern. The
// whole field parallaxes with scroll so the page feels like travelling through
// a 3D world. Deliberately low-contrast so content stays readable on top.

type Item = {
  kind: "ring" | "thinring" | "frame" | "grain";
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  vermilion: boolean;
  spin: number;
  drift: number;
};

function makeItems(): Item[] {
  // deterministic pseudo-random so SSR/CSR agree and layout is stable
  let seed = 20260717;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const kinds: Item["kind"][] = ["ring", "thinring", "frame", "ring", "grain", "thinring", "frame"];
  const items: Item[] = [];
  for (let i = 0; i < 22; i++) {
    const z = -18 + rand() * 20; // depth spread
    items.push({
      kind: kinds[Math.floor(rand() * kinds.length)],
      pos: [(rand() - 0.5) * 20, (rand() - 0.5) * 26, z],
      rot: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
      scale: 0.5 + rand() * 1.8,
      vermilion: rand() > 0.82,
      spin: (rand() - 0.5) * 0.4,
      drift: 0.2 + rand() * 0.5,
    });
  }
  return items;
}

function Field() {
  const group = useRef<THREE.Group>(null);
  const items = useMemo(makeItems, []);
  const scroll = useRef(0);
  const target = useRef(0);
  const cursor = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      target.current = window.scrollY / max;
    };
    const onMove = (e: MouseEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      cursor.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    scroll.current += (target.current - scroll.current) * 0.06;
    // travel through the field as you scroll (objects flow past)
    g.position.y = scroll.current * 34 - 4;
    g.position.z = scroll.current * 6;
    // gentle cursor parallax
    g.rotation.x += (cursor.current.y * 0.05 - g.rotation.x) * 0.03;
    g.rotation.y += (cursor.current.x * 0.05 - g.rotation.y) * 0.03;

    const t = state.clock.getElapsedTime();
    g.children.forEach((child, i) => {
      const it = items[i];
      if (!it) return;
      child.rotation.z += it.spin * delta;
      child.rotation.x += it.spin * 0.4 * delta;
      child.position.y = it.pos[1] + Math.sin(t * it.drift + i) * 0.6;
    });
  });

  return (
    <group ref={group}>
      {items.map((it, i) => {
        const color = it.vermilion ? "#E14434" : "#2a2622";
        const mat = (
          <meshStandardMaterial
            color={color}
            roughness={0.4}
            metalness={0.6}
            transparent
            opacity={0.9}
          />
        );
        return (
          <mesh key={i} position={it.pos} rotation={it.rot} scale={it.scale}>
            {it.kind === "ring" && <torusGeometry args={[0.9, 0.12, 16, 48]} />}
            {it.kind === "thinring" && <torusGeometry args={[1.1, 0.04, 12, 48]} />}
            {it.kind === "frame" && <torusGeometry args={[0.9, 0.08, 4, 4]} />}
            {it.kind === "grain" && <icosahedronGeometry args={[0.18, 0]} />}
            {mat}
          </mesh>
        );
      })}
    </group>
  );
}

export default function SceneWorld() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 1.4]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      frameloop="always"
    >
      {/* paper-coloured fog fades distant objects into the cream = real depth */}
      <fog attach="fog" args={["#efe8db", 7, 22]} />
      <ambientLight intensity={0.75} />
      <pointLight color="#fff2e0" position={[6, 8, 6]} intensity={70} decay={2} />
      <pointLight color="#ffe6c8" position={[-6, -4, 4]} intensity={40} decay={2} />
      <Field />
    </Canvas>
  );
}
