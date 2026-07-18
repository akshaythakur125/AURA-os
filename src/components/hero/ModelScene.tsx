"use client";

import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment, Lightformer, Float, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// A real modelled glTF object, auto-centred and auto-scaled from its own
// bounding box, lit by a procedural studio environment (real reflections),
// grounded with a contact shadow, and eased toward the cursor. Plays a
// looping animation clip when the model has one (e.g. the fox).
function Model({ url, spin, fill }: { url: string; spin: number; fill: number }) {
  const { scene, animations } = useGLTF(url);
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const cursor = useRef({ x: 0, y: 0 });
  // Use the scene directly (each model appears on one route) — cloning would
  // break skinned/animated meshes like the fox.
  const { actions, names } = useAnimations(animations, inner);

  const { fitScale, center } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const c = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(c);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { fitScale: fill / maxDim, center: c };
  }, [scene, fill]);

  useEffect(() => {
    if (names.length && actions[names[0]]) {
      actions[names[0]]!.reset().fadeIn(0.4).play();
    }
    const onMove = (e: MouseEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      cursor.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [actions, names]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const g = outer.current;
    if (!g) return;
    g.rotation.y += spin;
    const tx = cursor.current.y * 0.22 + Math.sin(t * 0.4) * 0.04;
    g.rotation.x += (tx - g.rotation.x) * 0.04;
  });

  return (
    <group ref={outer}>
      <group ref={inner} scale={fitScale}>
        <group position={[-center.x, -center.y, -center.z]}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

interface ModelSceneProps {
  url: string;
  dense?: boolean;
  spin?: number;
  fill?: number;
}

export default function ModelScene({ url, dense = true, spin = 0.003, fill = 3.1 }: ModelSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 34 }}
      dpr={[1, dense ? 1.7 : 1.2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.6} />
      <pointLight color="#fff4e6" position={[4, 5, 5]} intensity={95} decay={2} />
      <pointLight color="#ffe9d0" position={[-3, 1, 4]} intensity={50} decay={2} />

      <Suspense fallback={null}>
        <Float speed={1} rotationIntensity={0.15} floatIntensity={0.45}>
          <Model url={url} spin={spin} fill={fill} />
        </Float>
        <ContactShadows position={[0, -1.9, 0]} opacity={0.3} scale={8} blur={2.6} far={3.6} color="#2a1c14" />
        <Environment resolution={192}>
          <Lightformer intensity={3} color="#ffffff" position={[2, 3, 3]} scale={[4, 4, 1]} />
          <Lightformer intensity={2} color="#fff2e0" position={[-4, 1, 3]} scale={[5, 5, 1]} />
          <Lightformer intensity={1.4} color="#ffe6c8" position={[2, -3, 2]} scale={[5, 3, 1]} />
        </Environment>
      </Suspense>

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.28} luminanceThreshold={0.78} luminanceSmoothing={0.7} mipmapBlur radius={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
