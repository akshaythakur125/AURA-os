"use client";

import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * Cinematic dusk city — a low-poly skyline of dark ink towers with glowing
 * vermilion/amber windows, receding into warm haze. The city drifts toward the
 * camera so you feel like you're flying down an endless avenue. Deliberately in
 * the darkroom palette (bone haze, ink towers, vermilion glow) — not a generic
 * neon night city.
 *
 * `drive` (0..1, from scroll) pushes the flight faster/deeper so scrolling the
 * page reads as travelling through the city.
 */

const HAZE = "#e7dcc8"; // warm bone haze the towers fade into
const Iance = 240; // building count

// Procedural window texture: a dark facade speckled with lit windows in
// vermilion / warm amber / cream. Shared by every tower as an emissive map.
function makeWindowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0e0b0a";
  ctx.fillRect(0, 0, c.width, c.height);
  const cols = 5;
  const rows = 14;
  const gx = c.width / cols;
  const gy = c.height / rows;
  const lights = ["#E14434", "#ff8a4c", "#ffb066", "#f4e7cf"];
  let seed = 987654321;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (rand() > 0.42) {
        ctx.fillStyle = lights[Math.floor(rand() * lights.length)];
        ctx.globalAlpha = 0.55 + rand() * 0.45;
        ctx.fillRect(x * gx + gx * 0.2, y * gy + gy * 0.2, gx * 0.6, gy * 0.55);
      }
    }
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type Tower = { x: number; z: number; w: number; d: number; h: number; rot: number };

function makeTowers(): Tower[] {
  let seed = 20260718;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const towers: Tower[] = [];
  const DEPTH = 220;
  for (let i = 0; i < Iance; i++) {
    // avenue gap around x=0; towers on both flanks, denser far out
    const side = rand() > 0.5 ? 1 : -1;
    const lane = 4 + rand() * 30;
    towers.push({
      x: side * lane + (rand() - 0.5) * 3,
      z: -rand() * DEPTH,
      w: 1.6 + rand() * 3.2,
      d: 1.6 + rand() * 3.2,
      h: 4 + rand() * rand() * 34,
      rot: (rand() - 0.5) * 0.3,
    });
  }
  return towers;
}

function City({ drive }: { drive: React.MutableRefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.InstancedMesh>(null);
  const towers = useMemo(makeTowers, []);
  const windowTex = useMemo(makeWindowTexture, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offset = useRef(0);
  const DEPTH = 220;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    // base cinematic drift + scroll-driven acceleration
    const speed = 6 + drive.current * 34;
    offset.current += speed * dt;

    const im = mesh.current;
    const gm = glow.current;
    if (!im || !gm) return;
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      // wrap z so towers stream endlessly toward the camera
      let z = ((t.z + offset.current) % DEPTH);
      if (z > 8) z -= DEPTH; // keep just behind the camera-plane
      dummy.position.set(t.x, t.h / 2 - 2, z);
      dummy.rotation.set(0, t.rot, 0);
      dummy.scale.set(t.w, t.h, t.d);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
      // glow shell slightly larger, same transform
      dummy.scale.set(t.w * 1.008, t.h * 1.002, t.d * 1.008);
      dummy.updateMatrix();
      gm.setMatrixAt(i, dummy.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
    gm.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* solid tower bodies */}
      <instancedMesh ref={mesh} args={[undefined, undefined, towers.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#171310" roughness={0.82} metalness={0.35} />
      </instancedMesh>
      {/* emissive window shell */}
      <instancedMesh ref={glow} args={[undefined, undefined, towers.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#0e0b0a"
          emissive="#ff6a3c"
          emissiveIntensity={1.5}
          emissiveMap={windowTex}
          roughness={1}
          metalness={0}
        />
      </instancedMesh>
    </group>
  );
}

function Rig({ drive }: { drive: React.MutableRefObject<number> }) {
  const { camera } = useThree();
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
    // low, slightly banking dolly down the avenue
    const targetX = cursor.current.x * 1.6 + Math.sin(t * 0.18) * 0.8;
    const targetY = 2.2 - cursor.current.y * 0.8 + Math.sin(t * 0.24) * 0.25 + drive.current * 1.5;
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.position.z = 9;
    camera.lookAt(cursor.current.x * 2, 3 + drive.current * 2, -40);
  });
  return null;
}

export default function CityScene({ drive }: { drive: React.MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 2.2, 9], fov: 60, near: 0.1, far: 300 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.Fog(HAZE, 26, 150);
      }}
    >
      {/* warm dusk key + cool fill */}
      <ambientLight intensity={0.5} color="#f3e6cf" />
      <directionalLight position={[12, 20, 6]} intensity={1.1} color="#ffd9a8" />
      <directionalLight position={[-14, 8, -10]} intensity={0.5} color="#E14434" />
      {/* ground haze plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -60]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#1a1512" roughness={1} metalness={0} />
      </mesh>
      <City drive={drive} />
      <Rig drive={drive} />
      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={1.15} luminanceThreshold={0.35} luminanceSmoothing={0.85} mipmapBlur radius={0.75} />
        <Vignette eskil={false} offset={0.28} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}
