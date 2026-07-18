"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const INK = { color: "#2a2622", roughness: 0.28, metalness: 0.85 } as const;
const VERM = { color: "#E14434", roughness: 0.3, metalness: 0.4, emissive: "#E14434", emissiveIntensity: 0.2 } as const;

/* ---- Procedural GenZ objects, all primitives ---- */

function Sunglasses() {
  return (
    <group rotation={[0.08, 0, 0]}>
      {[-0.72, 0.72].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.55, 0.07, 16, 40]} />
            <meshStandardMaterial {...INK} />
          </mesh>
          <mesh position={[0, 0, -0.02]}>
            <circleGeometry args={[0.55, 40]} />
            <meshStandardMaterial color="#E14434" roughness={0.1} metalness={0.6} transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
      {/* bridge */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.42, 0.09, 0.09]} />
        <meshStandardMaterial {...INK} />
      </mesh>
      {/* temples */}
      {[-1.25, 1.25].map((x) => (
        <mesh key={x} position={[x, 0.08, -0.5]} rotation={[0, x > 0 ? -0.35 : 0.35, 0]}>
          <boxGeometry args={[0.08, 0.08, 1.1]} />
          <meshStandardMaterial {...INK} />
        </mesh>
      ))}
    </group>
  );
}

function Headphones() {
  return (
    <group>
      {/* headband arc */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.92, 0.11, 16, 48, Math.PI]} />
        <meshStandardMaterial {...INK} />
      </mesh>
      {/* ear cups */}
      {[-0.92, 0.92].map((x) => (
        <group key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.36, 0.36, 0.3, 40]} />
            <meshStandardMaterial {...INK} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 40]} />
            <meshStandardMaterial {...VERM} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BubbleTea() {
  return (
    <group rotation={[0.1, 0, 0]}>
      {/* cup (tapered, translucent) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.36, 1.25, 40, 1, true]} />
        <meshStandardMaterial color="#f3ede2" roughness={0.1} metalness={0.1} transparent opacity={0.32} side={THREE.DoubleSide} />
      </mesh>
      {/* drink fill */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.42, 0.36, 0.85, 40]} />
        <meshStandardMaterial color="#c98a5e" roughness={0.3} metalness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* boba pearls */}
      {[[-0.14, -0.5, 0.05], [0.12, -0.52, -0.08], [0, -0.55, 0.14], [-0.05, -0.5, -0.14], [0.18, -0.5, 0.1]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#1c1917" roughness={0.4} metalness={0.2} />
        </mesh>
      ))}
      {/* lid */}
      <mesh position={[0, 0.64, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.08, 40]} />
        <meshStandardMaterial {...INK} />
      </mesh>
      {/* straw */}
      <mesh position={[0.12, 0.55, 0]} rotation={[0, 0, -0.22]}>
        <cylinderGeometry args={[0.07, 0.07, 1.9, 16]} />
        <meshStandardMaterial {...VERM} />
      </mesh>
    </group>
  );
}

const SHAPES = { sunglasses: Sunglasses, headphones: Headphones, boba: BubbleTea };

function Spinner({ shape }: { shape: keyof typeof SHAPES }) {
  const g = useRef<THREE.Group>(null);
  const cursor = useRef({ x: 0, y: 0 });
  const Shape = SHAPES[shape];

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      cursor.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const el = g.current;
    if (!el) return;
    el.rotation.y += 0.006;
    const tx = cursor.current.y * 0.25 + Math.sin(t * 0.4) * 0.05;
    el.rotation.x += (tx - el.rotation.x) * 0.04;
  });

  return (
    <group ref={g} scale={1.15}>
      <Shape />
    </group>
  );
}

export default function GenZScene({ shape, dense = true }: { shape: keyof typeof SHAPES; dense?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 34 }}
      dpr={[1, dense ? 1.7 : 1.2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.7} />
      <pointLight color="#fff4e6" position={[4, 4, 5]} intensity={90} decay={2} />
      <pointLight color="#ffe9d0" position={[-3, -2, 4]} intensity={45} decay={2} />
      <Suspense fallback={null}>
        <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.5}>
          <Spinner shape={shape} />
        </Float>
        <ContactShadows position={[0, -1.7, 0]} opacity={0.28} scale={7} blur={2.6} far={3.4} color="#2a1c14" />
        <Environment resolution={192}>
          <Lightformer intensity={3} color="#ffffff" position={[2, 3, 3]} scale={[4, 4, 1]} />
          <Lightformer intensity={2} color="#fff2e0" position={[-4, 1, 3]} scale={[5, 5, 1]} />
          <Lightformer intensity={1.4} color="#ffe6c8" position={[2, -3, 2]} scale={[5, 3, 1]} />
        </Environment>
      </Suspense>
      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.3} luminanceThreshold={0.75} luminanceSmoothing={0.7} mipmapBlur radius={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
