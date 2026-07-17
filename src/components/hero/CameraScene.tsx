"use client";

import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer, Float, ContactShadows } from "@react-three/drei";
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
      <ambientLight intensity={0.85} />
      <pointLight color="#fff4e6" position={[4, 5, 5]} intensity={110} decay={2} />
      <pointLight color="#ffe9d0" position={[-3, 1, 4]} intensity={60} decay={2} />

      <Suspense fallback={null}>
        <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
          <CameraModel />
        </Float>

        {/* Soft contact shadow grounds the camera like an editorial product shot */}
        <ContactShadows position={[0, -2.1, 0]} opacity={0.35} scale={9} blur={2.6} far={4} color="#2a1c14" />

        {/* Warm studio softboxes → bright, neutral reflections on the
            brass/leather. No external HDR — stays inside the same-origin CSP. */}
        <Environment resolution={256}>
          <Lightformer intensity={3} color="#ffffff" position={[2, 4, 3]} scale={[5, 5, 1]} />
          <Lightformer intensity={2.2} color="#fff2e0" position={[-4, 2, 3]} scale={[6, 6, 1]} />
          <Lightformer intensity={1.6} color="#ffe6c8" position={[3, -2, 2]} scale={[6, 3, 1]} />
        </Environment>
      </Suspense>

      {/* Just a whisper of bloom for the lens/metal glints — no haze on a light bg */}
      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.18} luminanceThreshold={0.8} luminanceSmoothing={0.7} mipmapBlur radius={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
