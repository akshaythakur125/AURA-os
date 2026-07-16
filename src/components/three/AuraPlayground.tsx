"use client";

/**
 * AuraPlayground — a fully interactive, "tactile" WebGL playground.
 *
 * Each of the 11 status archetypes becomes a glowing orb floating inside an
 * invisible bounded box. You can:
 *   • hover  → orb lifts + label brightens
 *   • drag   → grab the orb and fling it (velocity is imparted on release)
 *   • click  → open that archetype's card (vibe + leak + level-up)
 * Orbs collide with each other and bounce off the walls with damping. Hand-rolled
 * physics (no physics dep), bloom-lit for that premium WebGL glow.
 */

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

export type AuraOrb = {
  name: string;
  icon: string;
  color: string;
  desc: string;   // the vibe
  issue: string;  // where it leaks status
  fix: string;    // the level-up move
};

/** The 11 status archetypes (from lib/aura-engine/archetypes.ts). */
export const ARCHETYPES: AuraOrb[] = [
  { name: "Clean Basic", icon: "🧼", color: "#60a5fa", desc: "Tidy, safe, low-risk.", issue: "Reads as reliable but forgettable — nothing signals status.", fix: "Add one intentional signal: better fit, a cleaner background, warmer light." },
  { name: "Urban Aspirational", icon: "🏙️", color: "#f59e0b", desc: "Reaching for the next tier.", issue: "The ambition shows more than the arrival — effort is visible.", fix: "Trade three loud signals for one quiet, well-made one." },
  { name: "Premium Minimalist", icon: "🖤", color: "#cbd5e1", desc: "Quiet, expensive restraint.", issue: "Can tip into cold or unapproachable.", fix: "Keep the restraint, add one warm human cue — a relaxed expression." },
  { name: "Loud Flex", icon: "📢", color: "#ef4444", desc: "Status turned up to 11.", issue: "Overt logos and props read as insecurity, not wealth.", fix: "Remove the two loudest items. Let one detail do the talking." },
  { name: "Soft Luxury", icon: "🤍", color: "#f9a8d4", desc: "Understated, textured, calm.", issue: "Subtle signals get lost in a busy frame.", fix: "Simplify the background so the texture and fit read clearly." },
  { name: "Creator Vibe", icon: "🎬", color: "#ec4899", desc: "Content-forward, expressive.", issue: "Energy is great; grooming and lighting often lag behind.", fix: "Lock the lighting and framing — personality already lands." },
  { name: "College Casual", icon: "🎒", color: "#34d399", desc: "Young, relaxed, low-budget.", issue: "Casual can slide into low-effort fast.", fix: "One fitted solid-colour top + side light = instant upgrade, ₹0." },
  { name: "Corporate Sharp", icon: "💼", color: "#2563eb", desc: "Formal, competent, precise.", issue: "Can read stiff or generic in social contexts.", fix: "Loosen one layer and soften the expression for warmth." },
  { name: "Try-Hard Signal", icon: "😅", color: "#f97316", desc: "Effort you can feel.", issue: "Visible effort undercuts the status you're signalling.", fix: "Subtract, don't add. The most confident look is the calmest one." },
  { name: "Mismatched Flex", icon: "🎭", color: "#a78bfa", desc: "Signals pulling in different directions.", issue: "A formal top over a messy room sends a confused message.", fix: "Align outfit, background and expression to one clear story." },
  { name: "Low-Clarity Potential", icon: "🌫️", color: "#22d3ee", desc: "The person is hiding behind the pixels.", issue: "Poor light and focus mask everything else.", fix: "Fix lighting and clarity first — the cheapest, highest-impact wins." },
];

type Body = {
  dim: AuraOrb;
  color: THREE.Color;
  radius: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
  mesh: THREE.Group | null;
};

/* Bounds of the play box (half-extents) */
const BOX = new THREE.Vector3(6.2, 3.5, 2.4);
const RESTITUTION = 0.72;
const DAMPING = 0.992;

function buildBodies(dims: AuraOrb[]): Body[] {
  return dims.map((dim) => ({
    dim,
    color: new THREE.Color(dim.color),
    radius: 0.54,
    pos: new THREE.Vector3(
      (Math.random() * 2 - 1) * (BOX.x - 1),
      (Math.random() * 2 - 1) * (BOX.y - 1),
      (Math.random() * 2 - 1) * (BOX.z - 0.5),
    ),
    vel: new THREE.Vector3(
      (Math.random() - 0.5) * 1.6,
      (Math.random() - 0.5) * 1.2,
      (Math.random() - 0.5) * 0.8,
    ),
    spin: new THREE.Vector3(Math.random() * 0.6, Math.random() * 0.6, Math.random() * 0.6),
    mesh: null,
  }));
}

function Playground({ onSelect }: { onSelect: (d: AuraOrb) => void }) {
  const { camera, gl } = useThree();
  const bodies = useMemo(() => buildBodies(ARCHETYPES), []);

  const [hovered, setHovered] = useState<number | null>(null);
  const grabbed = useRef<number | null>(null);
  const grabPlane = useRef(new THREE.Plane());
  const dragTarget = useRef(new THREE.Vector3());
  const lastDrag = useRef(new THREE.Vector3());
  const pointerNDC = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const downInfo = useRef<{ t: number; x: number; y: number; idx: number } | null>(null);

  const toNDC = (clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    pointerNDC.current.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (grabbed.current === null) return;
      toNDC(e.clientX, e.clientY);
      raycaster.current.setFromCamera(pointerNDC.current, camera);
      const hit = raycaster.current.ray.intersectPlane(grabPlane.current, new THREE.Vector3());
      if (hit) {
        lastDrag.current.copy(dragTarget.current);
        dragTarget.current.copy(hit);
      }
    };
    const onUp = (e: PointerEvent) => {
      const g = grabbed.current;
      if (g !== null) {
        const b = bodies[g];
        b.vel.copy(dragTarget.current).sub(lastDrag.current).multiplyScalar(42);
        b.vel.clampLength(0, 26);
        grabbed.current = null;
        gl.domElement.style.cursor = "grab";
      }
      const d = downInfo.current;
      if (d && Date.now() - d.t < 260) {
        const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y);
        if (moved < 6 && d.idx >= 0) onSelect(bodies[d.idx].dim);
      }
      downInfo.current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [bodies, camera, gl, onSelect]);

  const onOrbDown = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    grabbed.current = i;
    const b = bodies[i];
    const n = new THREE.Vector3();
    camera.getWorldDirection(n);
    grabPlane.current.setFromNormalAndCoplanarPoint(n, b.pos);
    dragTarget.current.copy(b.pos);
    lastDrag.current.copy(b.pos);
    b.vel.set(0, 0, 0);
    downInfo.current = { t: Date.now(), x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, idx: i };
    gl.domElement.style.cursor = "grabbing";
  };

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const g = grabbed.current;

    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      if (i === g) {
        b.pos.lerp(dragTarget.current, 0.35);
      } else {
        b.vel.y += Math.sin(performance.now() * 0.0003 + i) * 0.0015;
        b.vel.multiplyScalar(DAMPING);
        b.pos.addScaledVector(b.vel, dt);
      }
      (["x", "y", "z"] as const).forEach((ax) => {
        const lim = BOX[ax] - b.radius;
        if (b.pos[ax] > lim) { b.pos[ax] = lim; if (i !== g) b.vel[ax] = -Math.abs(b.vel[ax]) * RESTITUTION; }
        if (b.pos[ax] < -lim) { b.pos[ax] = -lim; if (i !== g) b.vel[ax] = Math.abs(b.vel[ax]) * RESTITUTION; }
      });
    }

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], c = bodies[j];
        const delta = a.pos.clone().sub(c.pos);
        const dist = delta.length() || 0.0001;
        const min = a.radius + c.radius;
        if (dist < min) {
          const n = delta.multiplyScalar(1 / dist);
          const overlap = (min - dist) / 2;
          a.pos.addScaledVector(n, overlap);
          c.pos.addScaledVector(n, -overlap);
          if (i !== g && j !== g) {
            const va = a.vel.dot(n), vc = c.vel.dot(n);
            const diff = vc - va;
            a.vel.addScaledVector(n, diff * RESTITUTION);
            c.vel.addScaledVector(n, -diff * RESTITUTION);
          }
        }
      }
    }

    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      if (!b.mesh) continue;
      b.mesh.position.copy(b.pos);
      b.mesh.rotation.x += b.spin.x * dt;
      b.mesh.rotation.y += b.spin.y * dt;
      const target = i === hovered || i === g ? 1.16 : 1;
      const s = b.mesh.scale.x + (target - b.mesh.scale.x) * 0.15;
      b.mesh.scale.setScalar(s);
    }
  });

  return (
    <>
      {bodies.map((b, i) => (
        <group
          key={b.dim.name}
          ref={(el) => { b.mesh = el; }}
          onPointerDown={onOrbDown(i)}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(i); if (grabbed.current === null) gl.domElement.style.cursor = "grab"; }}
          onPointerOut={() => { setHovered((h) => (h === i ? null : h)); if (grabbed.current === null) gl.domElement.style.cursor = "auto"; }}
        >
          <mesh>
            <sphereGeometry args={[b.radius, 32, 32]} />
            <meshPhysicalMaterial
              color={b.color}
              emissive={b.color}
              emissiveIntensity={i === hovered ? 0.9 : 0.45}
              roughness={0.12}
              metalness={0.35}
              clearcoat={1}
              clearcoatRoughness={0.15}
              transmission={0.35}
              thickness={0.8}
              transparent
              opacity={0.94}
            />
          </mesh>
          <mesh scale={0.55}>
            <icosahedronGeometry args={[b.radius, 0]} />
            <meshBasicMaterial color={b.color} toneMapped={false} />
          </mesh>

          <Html center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ textAlign: "center", transform: "translateY(-2px)", userSelect: "none" }}>
              <div style={{ fontSize: 26, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.6))" }}>{b.dim.icon}</div>
              <div
                style={{
                  marginTop: 2, fontSize: 11, fontWeight: 700, color: "#faf5ff",
                  whiteSpace: "nowrap", padding: "2px 8px", borderRadius: 999,
                  background: "rgba(10,10,26,.6)", border: `1px solid ${b.dim.color}66`,
                  backdropFilter: "blur(4px)", opacity: i === hovered ? 1 : 0.82, transition: "opacity .2s",
                }}
              >
                {b.dim.name}
              </div>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

function CameraParallax() {
  const target = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  useFrame(({ camera }) => {
    camera.position.x += (target.current.x * 1.1 - camera.position.x) * 0.03;
    camera.position.y += (target.current.y * 0.7 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Cage() {
  const geo = useMemo(() => new THREE.BoxGeometry(BOX.x * 2, BOX.y * 2, BOX.z * 2), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  return (
    <lineSegments>
      <primitive object={edges} attach="geometry" />
      <lineBasicMaterial color="#a78bfa" transparent opacity={0.16} />
    </lineSegments>
  );
}

export default function AuraPlayground({ onSelect }: { onSelect: (d: AuraOrb) => void }) {
  const [dpr, setDpr] = useState(1);
  const [enableFx, setEnableFx] = useState(true);

  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio || 1, 1.75));
    if (window.innerWidth < 768) setEnableFx(false);
  }, []);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 11], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#0a0a1a"]} />
      <fog attach="fog" args={["#0a0a1a", 12, 26]} />

      <ambientLight intensity={0.55} color="#ede9fe" />
      <pointLight position={[8, 6, 8]} intensity={180} color="#a78bfa" />
      <pointLight position={[-8, -5, 4]} intensity={120} color="#2563eb" />
      <pointLight position={[0, 0, 10]} intensity={70} color="#ec4899" />
      <directionalLight position={[0, 8, 6]} intensity={0.8} />

      <Cage />
      <Playground onSelect={onSelect} />
      <CameraParallax />

      {enableFx && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.95} luminanceThreshold={0.35} luminanceSmoothing={0.25} radius={0.72} />
          <Vignette eskil={false} offset={0.25} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
