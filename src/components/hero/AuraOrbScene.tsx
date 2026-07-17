"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Summed sine waves at irrational-ish frequency ratios read as organic
// drift rather than a single loop the eye can predict within a few seconds.
function AuraOrb() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    group.rotation.x = Math.sin(t * 0.13) * 0.22 + Math.sin(t * 0.31) * 0.08;
    group.rotation.y = t * 0.08 + Math.sin(t * 0.07) * 0.3;
    group.rotation.z = Math.sin(t * 0.19) * 0.06;

    const baseX = 1.5;
    const baseY = -1.7;
    const targetX = baseX + state.pointer.x * 0.3;
    const targetY = baseY + state.pointer.y * 0.18;
    group.position.x = THREE.MathUtils.lerp(group.position.x, targetX, 0.02);
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.02);
  });

  return (
    <group ref={groupRef} position={[1.5, -1.7, 0]}>
      <mesh scale={0.85}>
        <icosahedronGeometry args={[1, 16]} />
        <MeshDistortMaterial
          color="#fb7185"
          emissive="#e11d48"
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.2}
          distort={0.32}
          speed={1.3}
          transparent
          opacity={0.62}
        />
      </mesh>
    </group>
  );
}

function CameraRig() {
  useFrame((state) => {
    const targetX = state.pointer.x * 0.3;
    const targetY = state.pointer.y * 0.18;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.025);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.025);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

interface AuraOrbSceneProps {
  dense?: boolean;
}

export default function AuraOrbScene({ dense = true }: AuraOrbSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 30 }}
      dpr={[1, dense ? 1.75 : 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.5} />
      <pointLight color="#fb7185" position={[4, 2, 5]} intensity={110} decay={2} />
      <pointLight color="#3b82f6" position={[-2, -2, 4]} intensity={75} decay={2} />
      <pointLight color="#60a5fa" position={[0, -4, -2]} intensity={55} decay={2} />
      <Suspense fallback={null}>
        <AuraOrb />
        {dense && (
          <Sparkles
            count={50}
            scale={[7, 6, 4]}
            size={1.8}
            speed={0.2}
            color="#fda4af"
            opacity={0.4}
          />
        )}
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}
