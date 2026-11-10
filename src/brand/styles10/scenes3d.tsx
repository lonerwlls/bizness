// Две объёмные техники: «пластилин» (стоп-моушн из глины) и гибрид «плоский герой в 3D-мире».
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { CamRig, Car3D, MOODS, Street, World } from "../../lowpoly/kit3d";
import { Bean, BeanDefs, HERO2D } from "../../toontest/bean";

// ---------- пластилин ----------
let BUMP: THREE.CanvasTexture | null = null;
const clayBump = () => {
  if (BUMP) return BUMP;
  const cv = document.createElement("canvas"); cv.width = cv.height = 512;
  const g = cv.getContext("2d")!; g.fillStyle = "#808080"; g.fillRect(0, 0, 512, 512);
  let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 260; i++) { // отпечатки пальцев и вмятины
    const x = r() * 512, y = r() * 512, rr = 16 + r() * 34;
    for (let k = 0; k < 5; k++) { g.strokeStyle = `rgba(${k % 2 ? 255 : 0},${k % 2 ? 255 : 0},${k % 2 ? 255 : 0},0.06)`; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, rr - k * 3, (rr - k * 3) * 0.7, r() * 3, 0, Math.PI * 2); g.stroke(); }
  }
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 0 : 255},0,0,0.05)`; g.fillRect(r() * 512, r() * 512, 2, 2); }
  BUMP = new THREE.CanvasTexture(cv); BUMP.wrapS = BUMP.wrapT = THREE.RepeatWrapping;
  return BUMP;
};
const Clay: React.FC<{ c: string }> = ({ c }) => <meshStandardMaterial color={c} roughness={0.78} metalness={0} bumpMap={clayBump()} bumpScale={1.4} />;
const ClayHero: React.FC = () => (
  <group position={[0, 0, 0]} rotation={[0, -0.35, 0]}>
    {[-1, 1].map((s) => (
      <group key={s}>
        <mesh position={[s * 0.09, 0.25, 0]} castShadow><capsuleGeometry args={[0.045, 0.32, 8, 16]} /><Clay c="#2a2d40" /></mesh>
        <mesh position={[s * 0.1, 0.04, 0.04]} scale={[1, 0.6, 1.5]} castShadow><sphereGeometry args={[0.08, 20, 16]} /><Clay c="#f6f2ea" /></mesh>
      </group>
    ))}
    <mesh position={[0, 0.66, -0.17]} scale={[1, 1, 0.55]} castShadow><capsuleGeometry args={[0.17, 0.18, 8, 16]} /><Clay c="#f4c430" /></mesh>
    <mesh position={[0, 0.66, 0]} scale={[1, 1, 0.8]} castShadow><capsuleGeometry args={[0.2, 0.3, 10, 20]} /><Clay c="#f27a2a" /></mesh>
    <mesh position={[-0.27, 0.62, 0.02]} rotation={[0, 0, -0.25]} castShadow><capsuleGeometry args={[0.04, 0.3, 8, 12]} /><Clay c="#2a2d40" /></mesh>
    <mesh position={[0.3, 0.9, 0.02]} rotation={[0, 0, 2.6]} castShadow><capsuleGeometry args={[0.04, 0.3, 8, 12]} /><Clay c="#2a2d40" /></mesh>
    {[[-0.33, 0.45], [0.38, 1.06]].map(([x, y], i) => <mesh key={i} position={[x, y, 0.03]} castShadow><sphereGeometry args={[0.055, 16, 12]} /><Clay c="#2a2d40" /></mesh>)}
    <group position={[0, 1.18, 0]}>
      <mesh scale={[1, 0.94, 0.94]} castShadow><sphereGeometry args={[0.3, 32, 24]} /><Clay c="#f7f3ea" /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.1, 0.0, 0.27]} scale={[1, 1.4, 0.6]}><sphereGeometry args={[0.03, 12, 10]} /><Clay c="#151318" /></mesh>)}
      <mesh position={[0, -0.1, 0.27]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.07, 0.015, 8, 16, Math.PI]} /><Clay c="#5a1620" /></mesh>
      <mesh position={[0, 0.06, 0]} castShadow><sphereGeometry args={[0.305, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><Clay c="#2c3552" /></mesh>
      <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.3, 0.055, 12, 32]} /><Clay c="#2c3552" /></mesh>
      <mesh position={[0, 0.41, 0]} castShadow><sphereGeometry args={[0.08, 20, 16]} /><Clay c="#f4f2ec" /></mesh>
    </group>
  </group>
);
const Mushroom: React.FC<{ p: [number, number, number]; s?: number; c?: string }> = ({ p, s = 1, c = "#d8443a" }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.18, 0]} castShadow><cylinderGeometry args={[0.07, 0.09, 0.36, 16]} /><Clay c="#f4ead6" /></mesh>
    <mesh position={[0, 0.38, 0]} scale={[1, 0.6, 1]} castShadow><sphereGeometry args={[0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2 + 0.3]} /><Clay c={c} /></mesh>
    {[0, 1, 2, 3].map((i) => <mesh key={i} position={[Math.cos(i * 1.7) * 0.13, 0.48, Math.sin(i * 1.7) * 0.13]}><sphereGeometry args={[0.03, 10, 8]} /><Clay c="#ffffff" /></mesh>)}
  </group>
);
const ClayGround: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(12, 12, 90, 90); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, 0.05 * Math.sin(x * 2.1) * Math.cos(z * 1.7) + (z < -2 ? (-2 - z) * 0.35 * (0.6 + 0.4 * Math.sin(x * 0.9)) : 0)); }
    g.computeVertexNormals(); return g;
  }, []);
  return <mesh geometry={geo} receiveShadow><Clay c="#7cbf5a" /></mesh>;
};
const ClayCam: React.FC = () => { const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera; cam.position.set(0.6, 1.5, 3.4); cam.lookAt(-0.1, 0.75, 0); cam.fov = 34; cam.updateProjectionMatrix(); return null; };
export const Claymation: React.FC = () => (
  <AbsoluteFill style={{ background: "#9fd4f0" }}>
    <ThreeCanvas width={1920} height={1080} shadows gl={{ antialias: true }} camera={{ fov: 34 }}>
      <ClayCam />
      <color attach="background" args={["#a8d8f0"]} />
      <hemisphereLight args={["#fff4e6", "#7a6a50", 0.7]} />
      <directionalLight position={[3, 5, 3]} intensity={2.4} color="#fff0dc" castShadow shadow-mapSize={[2048, 2048]} shadow-radius={6} />
      <directionalLight position={[-3, 2, 2]} intensity={0.6} color="#bcd4ff" />
      <ClayGround />
      {/* картонный задник с солнцем и облаками, как в студии стоп-моушн */}
      <mesh position={[1.6, 2.2, -3.5]}><sphereGeometry args={[0.45, 24, 16]} /><meshStandardMaterial color="#ffd23c" emissive="#ffb030" emissiveIntensity={0.5} bumpMap={clayBump()} bumpScale={1} /></mesh>
      {[[-1.8, 2.3, -3.4, 1], [0.2, 2.6, -3.6, 0.8]].map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]} scale={s}>{[[0, 0, 0.35], [0.35, -0.05, 0.28], [-0.35, -0.06, 0.26]].map(([a, b, r], k) => <mesh key={k} position={[a, b, 0]} scale={[1, 0.8, 0.5]}><sphereGeometry args={[r, 20, 14]} /><Clay c="#ffffff" /></mesh>)}</group>
      ))}
      <ClayHero />
      <Mushroom p={[-0.9, 0, 0.2]} s={1.3} /><Mushroom p={[-1.25, 0, -0.3]} s={0.9} c="#f2a03a" /><Mushroom p={[0.85, 0, -0.4]} s={1.0} c="#8a5ad8" />
      {/* почтовый ящик */}
      <group position={[0.75, 0, 0.35]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.03, 0.035, 0.6, 12]} /><Clay c="#7a5236" /></mesh>
        <mesh position={[0, 0.68, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[0.12, 0.2, 8, 16]} /><Clay c="#3a7ad8" /></mesh>
        <mesh position={[0.12, 0.8, 0]} castShadow><boxGeometry args={[0.02, 0.16, 0.05]} /><Clay c="#d8443a" /></mesh>
      </group>
    </ThreeCanvas>
  </AbsoluteFill>
);

// ---------- гибрид: плоский рисованный герой в 3D-мире ----------
export const Hybrid: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ filter: "blur(1.5px) saturate(1.15)" }}>
      <ThreeCanvas width={1920} height={1080} shadows gl={{ antialias: true }} camera={{ fov: 40 }}>
        <CamRig pos={[-0.6, 1.0, 6.4]} look={[-1.2, 1.4, -8]} fov={46} />
        <World m={MOODS.morning} focus={[0, 0, -4]} />
        <Street lamps />
        <Car3D p={[-1.6, 0, -5]} rotY={0} c="#f2c230" f={0} />
        <Car3D p={[-3.0, 0, -14]} rotY={Math.PI} c="#3a7ad8" f={0} />
        {/* остановка */}
        <group position={[1.9, 0.12, 2.4]}>
          <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.04, 0.04, 2.4, 10]} /><meshStandardMaterial color="#5a6270" /></mesh>
          <mesh position={[0, 2.3, 0.05]} castShadow><boxGeometry args={[0.5, 0.36, 0.04]} /><meshStandardMaterial color="#2e8a5a" /></mesh>
          <mesh position={[0.9, 0.5, -0.3]} castShadow><boxGeometry args={[1.4, 0.08, 0.4]} /><meshStandardMaterial color="#c8a070" /></mesh>
          <mesh position={[0.9, 1.3, -0.5]} castShadow><boxGeometry args={[1.6, 1.8, 0.05]} /><meshStandardMaterial color="#bfe6ff" transparent opacity={0.5} /></mesh>
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <BeanDefs />
      <Bean x={1180} y={1010} s={1.25} look={HERO2D} expr="smirk" f={10} pose={{ armL: [10, 6], armR: [40, 120], tilt: -4 }} />
    </svg>
  </AbsoluteFill>
);
