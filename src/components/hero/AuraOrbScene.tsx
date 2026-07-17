"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  MeshDistortMaterial,
  Environment,
  Lightformer,
  Sparkles,
  Float,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// The centrepiece. A metallic distorted orb that actually reflects the
// procedural environment built from the Lightformers below (real reflections,
// not a flat texture), with a glowing core that drives the bloom pass.
// Organic drift comes from summed sines at unrelated frequencies so the eye
// can't clock it as a loop, plus a gentle "look toward the cursor" ease.
function AuraOrb() {
  const groupRef = useRef<THREE.Group>(null);
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
    const g = groupRef.current;
    if (!g) return;

    g.rotation.y += 0.0022;
    const targetX = cursor.current.y * 0.35 + Math.sin(t * 0.31) * 0.12;
    const targetZ = -cursor.current.x * 0.3;
    g.rotation.x += (targetX - g.rotation.x) * 0.03;
    g.rotation.z += (targetZ - g.rotation.z) * 0.03;
    g.position.y = Math.sin(t * 0.5) * 0.1;
  });

  return (
    <group ref={groupRef} position={[1.2, 0, -1.4]}>
      <mesh scale={0.62}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshDistortMaterial
          color="#7c3aed"
          roughness={0.12}
          metalness={0.95}
          envMapIntensity={1.6}
          distort={0.34}
          speed={1.4}
          emissive="#4c1d95"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* glowing core seen through the parting distortion — feeds the bloom */}
      <mesh scale={0.4}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#c4b5fd" toneMapped={false} />
      </mesh>
    </group>
  );
}

interface AuraOrbSceneProps {
  dense?: boolean;
}

export default function AuraOrbScene({ dense = true }: AuraOrbSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 34 }}
      dpr={[1, dense ? 1.75 : 1.2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.35} />
      <pointLight color="#a78bfa" position={[4, 2, 5]} intensity={90} decay={2} />
      <pointLight color="#60a5fa" position={[-2, -2, 4]} intensity={60} decay={2} />

      <Suspense fallback={null}>
        <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.4}>
          <AuraOrb />
        </Float>

        {dense && (
          <Sparkles
            count={60}
            scale={[9, 6, 5]}
            size={1.6}
            speed={0.22}
            color="#c4b5fd"
            opacity={0.5}
          />
        )}

        {/* Procedural studio environment — real reflections with no external
            HDR file, so it stays inside the site's same-origin CSP. */}
        <Environment resolution={256}>
          <Lightformer intensity={2.4} color="#a78bfa" position={[3, 2, 4]} scale={[6, 6, 1]} />
          <Lightformer intensity={1.8} color="#60a5fa" position={[-4, -1, 3]} scale={[5, 5, 1]} />
          <Lightformer intensity={1.4} color="#67e8f9" position={[0, -3, -3]} scale={[8, 3, 1]} />
          <Lightformer intensity={2.6} color="#ffffff" position={[2, 4, -2]} scale={[3, 3, 1]} />
        </Environment>
      </Suspense>

      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={0.75}
        />
      </EffectComposer>
    </Canvas>
  );
}
