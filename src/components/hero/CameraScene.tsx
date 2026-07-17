"use client";

import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer, Sparkles, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const MODEL_URL = "/hero-assets/antique-camera.glb";

// The hero object: a real modelled antique camera (CC0, Khronos glTF sample),
// centred and auto-scaled from its own bounding box so we don't hard-code a
// scale, lit by a procedural studio environment for genuine reflections, and
// eased toward the cursor so it feels touchable rather than on rails.
function CameraModel() {
  const { scene } = useGLTF(MODEL_URL);
  const outer = useRef<THREE.Group>(null);
  const cursor = useRef({ x: 0, y: 0 });

  const { fitScale, center } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const c = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(c);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { fitScale: 3.1 / maxDim, center: c };
  }, [scene]);

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
    const g = outer.current;
    if (!g) return;
    g.rotation.y += 0.0035; // slow turntable
    const targetX = cursor.current.y * 0.25 + Math.sin(t * 0.4) * 0.05;
    g.rotation.x += (targetX - g.rotation.x) * 0.04;
  });

  return (
    <group ref={outer} scale={fitScale}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);

interface CameraSceneProps {
  dense?: boolean;
}

export default function CameraScene({ dense = true }: CameraSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 34 }}
      dpr={[1, dense ? 1.75 : 1.2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.5} />
      <pointLight color="#a78bfa" position={[4, 3, 5]} intensity={80} decay={2} />
      <pointLight color="#60a5fa" position={[-3, -1, 4]} intensity={55} decay={2} />

      <Suspense fallback={null}>
        <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
          <CameraModel />
        </Float>

        {dense && (
          <Sparkles count={45} scale={[8, 6, 5]} size={1.5} speed={0.2} color="#c4b5fd" opacity={0.45} />
        )}

        {/* Procedural studio lighting → real reflections on the brass/leather,
            no external HDR, so it stays inside the same-origin CSP. */}
        <Environment resolution={256}>
          <Lightformer intensity={2.4} color="#ffffff" position={[2, 4, 3]} scale={[4, 4, 1]} />
          <Lightformer intensity={1.8} color="#a78bfa" position={[-4, 1, 3]} scale={[5, 5, 1]} />
          <Lightformer intensity={1.4} color="#60a5fa" position={[3, -2, 2]} scale={[6, 3, 1]} />
        </Environment>
      </Suspense>

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.6} mipmapBlur radius={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
