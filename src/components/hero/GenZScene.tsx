"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float, ContactShadows, RoundedBox } from "@react-three/drei";
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

const CREAM = { color: "#f3ede2", roughness: 0.35, metalness: 0.15, emissive: "#f3ede2", emissiveIntensity: 0.12 } as const;

function Heart({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} scale={0.42}>
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.12, 0]}>
          <sphereGeometry args={[0.28, 20, 20]} />
          <meshStandardMaterial {...CREAM} />
        </mesh>
      ))}
      <mesh position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.4, 0.4, 0.16]} />
        <meshStandardMaterial {...CREAM} />
      </mesh>
    </group>
  );
}

function Phone() {
  return (
    <group rotation={[0.12, -0.18, 0.05]} scale={1.05}>
      {/* body */}
      <RoundedBox args={[1.15, 2.15, 0.16]} radius={0.16} smoothness={4}>
        <meshStandardMaterial {...INK} />
      </RoundedBox>
      {/* glowing screen */}
      <RoundedBox args={[1.0, 1.9, 0.02]} radius={0.11} smoothness={4} position={[0, 0.02, 0.09]}>
        <meshStandardMaterial color="#E14434" roughness={0.2} metalness={0.3} emissive="#E14434" emissiveIntensity={0.4} />
      </RoundedBox>
      {/* heart on screen */}
      <Heart position={[0, 0.05, 0.12]} />
      {/* front camera dot */}
      <mesh position={[0, 0.9, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
        <meshStandardMaterial color="#0f0d0b" roughness={0.2} metalness={0.6} />
      </mesh>
    </group>
  );
}

function Gamepad() {
  return (
    <group rotation={[0.38, 0, 0]} scale={1.05}>
      {/* body */}
      <RoundedBox args={[1.95, 0.95, 0.5]} radius={0.3} smoothness={4}>
        <meshStandardMaterial {...INK} />
      </RoundedBox>
      {/* grips */}
      {[-0.78, 0.78].map((x) => (
        <mesh key={x} position={[x, -0.42, 0]} rotation={[0, 0, x > 0 ? -0.55 : 0.55]}>
          <capsuleGeometry args={[0.26, 0.5, 8, 16]} />
          <meshStandardMaterial {...INK} />
        </mesh>
      ))}
      {/* d-pad cross (left) */}
      <mesh position={[-0.52, 0.05, 0.27]}>
        <boxGeometry args={[0.42, 0.14, 0.08]} />
        <meshStandardMaterial {...CREAM} />
      </mesh>
      <mesh position={[-0.52, 0.05, 0.27]}>
        <boxGeometry args={[0.14, 0.42, 0.08]} />
        <meshStandardMaterial {...CREAM} />
      </mesh>
      {/* action buttons (right) */}
      {([[0.52, 0.28], [0.75, 0.05], [0.29, 0.05], [0.52, -0.18]] as [number, number][]).map((p, i) => (
        <mesh key={i} position={[p[0], p[1], 0.27]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.07, 20]} />
          <meshStandardMaterial {...VERM} />
        </mesh>
      ))}
    </group>
  );
}

const BILL = { color: "#3a332d", roughness: 0.32, metalness: 0.7 } as const;

function Cap() {
  return (
    <group rotation={[0.42, -0.3, 0]} scale={1.25}>
      {/* crown (flattened hemisphere) */}
      <mesh position={[0, -0.05, 0]} scale={[1, 0.82, 1]}>
        <sphereGeometry args={[0.72, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...INK} side={THREE.DoubleSide} />
      </mesh>
      {/* top button */}
      <mesh position={[0, 0.56, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial {...VERM} />
      </mesh>
      {/* bill (protruding front semicircle) */}
      <mesh position={[0, -0.14, 0.5]} rotation={[-0.12, 0, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.07, 40, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...BILL} side={THREE.DoubleSide} />
      </mesh>
      {/* front logo */}
      <mesh position={[0, 0.14, 0.68]} rotation={[0.15, 0, 0]}>
        <circleGeometry args={[0.11, 20]} />
        <meshStandardMaterial {...VERM} />
      </mesh>
    </group>
  );
}

const PLASTER = { color: "#e9e0d1", roughness: 0.5, metalness: 0.12 } as const;

/**
 * Style Icon — an editorial mannequin bust with a sculpted hairstyle and a
 * vermilion shade accent. Reads as a fashion "style icon" and ties the 3D
 * language to the grooming/style theme, without depicting a real person.
 */
function StyleIcon() {
  return (
    <group rotation={[0.04, -0.16, 0]} position={[0, -0.05, 0]} scale={1.02}>
      {/* shoulders / bust (ink) */}
      <mesh position={[0, -1.12, 0]} scale={[1.05, 0.72, 0.72]}>
        <sphereGeometry args={[1.0, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...INK} side={THREE.DoubleSide} />
      </mesh>
      {/* collar accent (vermilion neckline) */}
      <mesh position={[0, -0.6, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.055, 16, 40]} />
        <meshStandardMaterial {...VERM} />
      </mesh>
      {/* neck (plaster) */}
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.23, 0.3, 0.52, 32]} />
        <meshStandardMaterial {...PLASTER} />
      </mesh>
      {/* head — egg form */}
      <mesh position={[0, 0.34, 0]} scale={[0.82, 1, 0.9]}>
        <sphereGeometry args={[0.6, 40, 40]} />
        <meshStandardMaterial {...PLASTER} />
      </mesh>
      {/* jaw / chin taper */}
      <mesh position={[0, 0.0, 0.03]} scale={[0.58, 0.5, 0.58]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial {...PLASTER} />
      </mesh>
      {/* hair cap (ink shell over crown + back) */}
      <mesh position={[0, 0.48, -0.06]} scale={[0.98, 1.06, 1.02]}>
        <sphereGeometry args={[0.62, 40, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial {...INK} side={THREE.DoubleSide} />
      </mesh>
      {/* swept-over fringe (ink) */}
      <mesh position={[0.28, 0.52, 0.26]} rotation={[0.25, 0.35, -0.55]} scale={[0.52, 0.34, 0.42]}>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshStandardMaterial {...INK} />
      </mesh>
      {/* signature shades (vermilion bar + lenses) */}
      <mesh position={[0, 0.38, 0.5]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.74, 0.06, 0.05]} />
        <meshStandardMaterial {...VERM} />
      </mesh>
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.34, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 24]} />
          <meshStandardMaterial color="#2a2622" roughness={0.15} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

const SHAPES = { sunglasses: Sunglasses, headphones: Headphones, boba: BubbleTea, phone: Phone, gamepad: Gamepad, cap: Cap, model: StyleIcon };

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
