"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// A procedural camera-lens / aperture: concentric metal rings around a glowing
// glass core. All primitives — no model to load — so it's cheap enough to reuse
// as a 3D accent on many pages. Editorial palette: ink metal, one vermilion ring.
function Lens() {
  const group = useRef<THREE.Group>(null);
  const cursor = useRef({ x: 0, y: 0 });

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
    const g = group.current;
    if (!g) return;
    g.rotation.z += 0.0016;
    const tx = cursor.current.y * 0.4 + Math.sin(t * 0.3) * 0.08 - 0.35;
    const ty = cursor.current.x * 0.5 + Math.cos(t * 0.23) * 0.08;
    g.rotation.x += (tx - g.rotation.x) * 0.04;
    g.rotation.y += (ty - g.rotation.y) * 0.04;
  });

  const inkMetal = { color: "#2a2724", roughness: 0.25, metalness: 0.9 } as const;

  return (
    <group ref={group} rotation={[-0.35, 0, 0]}>
      {/* barrel rings */}
      <mesh>
        <torusGeometry args={[1.35, 0.12, 24, 96]} />
        <meshStandardMaterial {...inkMetal} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <torusGeometry args={[1.08, 0.09, 24, 96]} />
        <meshStandardMaterial {...inkMetal} />
      </mesh>
      {/* vermilion accent ring */}
      <mesh position={[0, 0, 0.22]}>
        <torusGeometry args={[0.82, 0.055, 20, 80]} />
        <meshStandardMaterial color="#E14434" roughness={0.3} metalness={0.5} emissive="#E14434" emissiveIntensity={0.25} />
      </mesh>
      {/* aperture blades hint — thin inner ring */}
      <mesh position={[0, 0, 0.28]}>
        <torusGeometry args={[0.58, 0.03, 16, 64]} />
        <meshStandardMaterial {...inkMetal} />
      </mesh>
      {/* glass core */}
      <mesh position={[0, 0, 0.24]}>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshStandardMaterial color="#1c1917" roughness={0.05} metalness={0.6} envMapIntensity={1.8} />
      </mesh>
      {/* specular glint that drives the bloom */}
      <mesh position={[0.16, 0.18, 0.62]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#fff3e6" toneMapped={false} />
      </mesh>
    </group>
  );
}

interface LensSceneProps {
  dense?: boolean;
}

export default function LensScene({ dense = true }: LensSceneProps) {
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
          <Lens />
        </Float>
        <ContactShadows position={[0, -1.9, 0]} opacity={0.28} scale={7} blur={2.6} far={3.5} color="#2a1c14" />
        <Environment resolution={192}>
          <Lightformer intensity={3} color="#ffffff" position={[2, 3, 3]} scale={[4, 4, 1]} />
          <Lightformer intensity={2} color="#fff2e0" position={[-4, 1, 3]} scale={[5, 5, 1]} />
          <Lightformer intensity={1.4} color="#ffe6c8" position={[2, -3, 2]} scale={[5, 3, 1]} />
        </Environment>
      </Suspense>

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.35} luminanceThreshold={0.75} luminanceSmoothing={0.7} mipmapBlur radius={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
