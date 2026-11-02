// Общий набор для 3D-роликов в стиле low-poly (как src/lowpoly/lowpoly.tsx):
// небо, свет, улица, дома, деревья, машины, комната, люди (MASCOT и соседи), собака, камера, походка.
// Углы конечностей: 0° = вниз, + = вперёд (как в Rig). Человек смотрит в +z своей системы координат.
import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { D, ik, stepFoot } from "../characters/Rig";

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export type V3 = [number, number, number];
export type Limb = [number, number];
export const WALK_Y = 0.121; // верх тротуара
export const Mat: React.FC<{ c: string; flat?: boolean; r?: number; e?: string; ei?: number }> = ({ c, flat = true, r = 0.85, e, ei = 0 }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={0} flatShading={flat} emissive={e ?? "#000000"} emissiveIntensity={ei} />
);

// ---------- небо и свет ----------
export type Mood = { top: string; mid: string; low: string; fog: string; sun: string; sunI: number; sunDir: V3; hemiTop: string; hemiBot: string; hemiI: number; cloud: string };
export const MOODS: Record<string, Mood> = {
  morning: { top: "#6a8ac8", mid: "#b8c0dc", low: "#f6dab4", fog: "#d8d4d8", sun: "#ffe2b8", sunI: 3.0, sunDir: [-24, 10, -20], hemiTop: "#c0c8f0", hemiBot: "#6a7a4a", hemiI: 0.75, cloud: "#f0e0d8" },
  day: { top: "#5a8ad8", mid: "#a8c8ec", low: "#e8eef4", fog: "#d0dceb", sun: "#fff4e0", sunI: 3.2, sunDir: [-14, 22, -10], hemiTop: "#c8d8ff", hemiBot: "#6a7a4a", hemiI: 0.85, cloud: "#ffffff" },
  sunset: { top: "#5e6494", mid: "#b49ab8", low: "#f2c8a0", fog: "#d8b8b0", sun: "#ffd6a0", sunI: 3.2, sunDir: [-24, 8, -26], hemiTop: "#b8b0e0", hemiBot: "#6a7a4a", hemiI: 0.6, cloud: "#e8c8b0" },
  night: { top: "#0a1028", mid: "#18203e", low: "#2a2a4e", fog: "#1a1e34", sun: "#9ab0ff", sunI: 0.6, sunDir: [-10, 20, -14], hemiTop: "#3a4a8a", hemiBot: "#1a1a2a", hemiI: 0.35, cloud: "#3a3a5a" },
  gray: { top: "#7a8090", mid: "#9aa0ac", low: "#b8b8bc", fog: "#a8acb4", sun: "#e8e4e0", sunI: 1.6, sunDir: [-14, 22, -10], hemiTop: "#b0b4c0", hemiBot: "#5a6050", hemiI: 0.9, cloud: "#c8c8cc" },
};
export const SkyDome: React.FC<{ m: Mood }> = ({ m }) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(m.top) }, mid: { value: new THREE.Color(m.mid) }, low: { value: new THREE.Color(m.low) } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vP; void main(){ float h = clamp(vP.y*2.2, 0.0, 1.0); vec3 c = mix(low, mid, smoothstep(0.0,0.35,h)); c = mix(c, top, smoothstep(0.35,1.0,h)); gl_FragColor = vec4(c,1.0); }",
  }), [m.top, m.mid, m.low]);
  return <mesh material={mat}><sphereGeometry args={[480, 32, 16]} /></mesh>;
};
export const Cloud: React.FC<{ p: V3; s: number; c: string }> = ({ p, s, c }) => (
  <group position={p} scale={[s * 1.6, s * 0.55, s]}>
    {[[0, 0, 0, 1], [1.1, -0.15, 0.2, 0.8], [-1.1, -0.2, -0.1, 0.75], [0.4, 0.45, 0, 0.7], [-0.5, 0.35, 0.2, 0.6]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]}><icosahedronGeometry args={[r, 1]} /><meshStandardMaterial color={c} emissive="#6a4a5a" emissiveIntensity={0.2} flatShading roughness={1} fog={false} /></mesh>
    ))}
  </group>
);
// небо + облака + туман + свет, солнце «едет» за точкой фокуса
export const World: React.FC<{ m: Mood; focus: V3; stars?: boolean }> = ({ m, focus, stars }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(focus[0] + 2, 0, focus[2] + 2);
  const [dx, dy, dz] = m.sunDir;
  return (
    <>
      <fog attach="fog" args={[m.fog, 25, 170]} />
      <SkyDome m={m} />
      {stars ? Array.from({ length: 120 }, (_, i) => <mesh key={i} position={[Math.cos(i * 2.4) * 300 * (0.3 + rnd(i) * 0.7), 60 + rnd(i + 5) * 200, -100 - rnd(i + 9) * 250]}><sphereGeometry args={[0.6 + rnd(i) * 0.6, 4, 4]} /><meshBasicMaterial color="#ffffff" fog={false} /></mesh>) : null}
      {[[-60, 70, -220, 18], [30, 85, -260, 22], [110, 60, -200, 14], [-140, 90, -300, 26], [60, 110, -150, 12]].map(([x, y, z, s], i) => <Cloud key={i} p={[x, y, z]} s={s} c={m.cloud} />)}
      <hemisphereLight args={[m.hemiTop, m.hemiBot, m.hemiI]} />
      <ambientLight intensity={0.15} color="#ffe0d0" />
      <primitive object={target} />
      <directionalLight position={[focus[0] + dx, dy, focus[2] + dz]} target={target} intensity={m.sunI} color={m.sun} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-camera-near={1} shadow-camera-far={90} shadow-bias={-0.0006} shadow-normalBias={0.02} />
    </>
  );
};

// ---------- камера ----------
export const CamRig: React.FC<{ pos: V3; look: V3; fov?: number; shake?: number; f?: number }> = ({ pos, look, fov = 42, shake = 0, f = 0 }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const sx = shake ? (rnd(f) - 0.5) * shake : 0, sy = shake ? (rnd(f + 3) - 0.5) * shake : 0;
  cam.position.set(pos[0] + sx, pos[1] + sy, pos[2]);
  cam.lookAt(look[0], look[1], look[2]);
  cam.fov = fov;
  cam.near = 0.05;
  cam.updateProjectionMatrix();
  return null;
};

// ---------- улица ----------
export const HOUSE_COLS = ["#ece4b8", "#9eaec8", "#c8b4d4", "#b8cca8", "#e8c4a8", "#a8c4c8"];
export const ROOF_COLS = ["#2e3a2a", "#3a3a4e", "#5a4a3a", "#2a3a4a"];
export const House: React.FC<{ z: number; i: number; lit?: boolean }> = ({ z, i, lit }) => {
  const w = 5.5 + rnd(i) * 1.5, h = 3 + (i % 3 === 0 ? 2.6 : 0), d = 6;
  const c = HOUSE_COLS[i % HOUSE_COLS.length], roof = ROOF_COLS[i % ROOF_COLS.length];
  const win = lit && rnd(i + 11) > 0.4 ? "#ffd27a" : "#4a4a58";
  return (
    <group position={[11 + rnd(i + 3) * 1.5, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[d, h, w]} /><Mat c={c} /></mesh>
      <mesh position={[0, h + 1.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[1.25, 1.25, w + 0.6, 3]} /><Mat c={roof} /></mesh>
      <mesh position={[-d / 2 - 0.02, 1.1, -w * 0.18]}><boxGeometry args={[0.06, 1.8, 0.9]} /><Mat c={["#3a2a5a", "#4a3a2a", "#2a3a5a"][i % 3]} /></mesh>
      {[-0.32, 0.25].map((k, j) => (
        <group key={j} position={[-d / 2 - 0.03, h > 4 ? 3.6 : 1.7, w * k]}>
          <mesh><boxGeometry args={[0.06, 1.0, 1.0]} /><Mat c="#f4eedc" /></mesh>
          <mesh position={[-0.02, 0, 0]}><boxGeometry args={[0.06, 0.8, 0.8]} /><Mat c={win} e={lit ? win : undefined} ei={lit ? 0.8 : 0} /></mesh>
        </group>
      ))}
      <mesh position={[-d / 2 - 0.8, 0.08, -w * 0.18]} receiveShadow castShadow><boxGeometry args={[1.4, 0.16, 1.6]} /><Mat c="#e2d6b8" /></mesh>
      <mesh position={[-d / 2 - 3.2, 0.02, -w * 0.18]} receiveShadow><boxGeometry args={[5, 0.04, 1.1]} /><Mat c="#d8ccb0" /></mesh>
    </group>
  );
};
export const Tree: React.FC<{ p: V3; i: number; s?: number }> = ({ p, i, s = 1 }) => {
  const k = (0.9 + rnd(i + 7) * 0.35) * s;
  return (
    <group position={p} scale={k}>
      <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[0.13, 0.18, 2.8, 6]} /><Mat c="#5a3a24" /></mesh>
      {[[0, 3.2, 0, 1.25], [0.7, 2.9, 0.3, 0.9], [-0.6, 2.95, -0.2, 0.95], [0.1, 3.8, 0.2, 0.85], [-0.2, 3.0, 0.75, 0.8]].map(([x, y, z, r], j) => (
        <mesh key={j} position={[x, y, z]} castShadow><icosahedronGeometry args={[r, 1]} /><Mat c={j % 2 ? "#3f7a3a" : "#4f8f44"} /></mesh>
      ))}
    </group>
  );
};
export const Lamp: React.FC<{ z: number; on?: boolean }> = ({ z, on }) => (
  <group position={[0.75, 0, z]}>
    <mesh position={[0, 2.6, 0]} castShadow><cylinderGeometry args={[0.05, 0.06, 5.2, 6]} /><Mat c="#2a2a30" /></mesh>
    <mesh position={[-0.35, 5.2, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 0.8, 6]} /><Mat c="#2a2a30" /></mesh>
    <mesh position={[-0.7, 5.12, 0]}><boxGeometry args={[0.3, 0.1, 0.18]} /><Mat c={on ? "#ffe2a0" : "#3a3a40"} e={on ? "#ffd27a" : undefined} ei={on ? 1.5 : 0} /></mesh>
    {on ? <pointLight position={[-0.7, 4.9, 0]} intensity={6} distance={9} color="#ffd8a0" /> : null}
  </group>
);
export const Street: React.FC<{ lit?: boolean; lamps?: boolean; extras?: React.ReactNode }> = ({ lit, lamps, extras }) => {
  const len = 420;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0, -len / 2 + 60]} receiveShadow><planeGeometry args={[8, len]} /><Mat c="#4a464e" /></mesh>
      {Array.from({ length: 70 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.01, 60 - i * 6]}><planeGeometry args={[0.12, 3]} /><meshStandardMaterial color="#e8c24a" /></mesh>)}
      <mesh position={[0.1, 0.07, -len / 2 + 60]} receiveShadow castShadow><boxGeometry args={[0.2, 0.14, len]} /><Mat c="#c8baa0" /></mesh>
      <mesh position={[1.3, 0.06, -len / 2 + 60]} receiveShadow><boxGeometry args={[2.2, 0.12, len]} /><Mat c="#cfc2a6" /></mesh>
      {Array.from({ length: 140 }, (_, i) => <mesh key={"j" + i} position={[1.3, 0.121, 60 - i * 3]}><boxGeometry args={[2.2, 0.005, 0.03]} /><Mat c="#b8ab90" /></mesh>)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, 0.03, -len / 2 + 60]} receiveShadow><planeGeometry args={[30, len]} /><Mat c="#6f9a4a" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.1, 0.06, -len / 2 + 60]} receiveShadow><planeGeometry args={[0.3, len]} /><Mat c="#c8baa0" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-30, -0.01, -len / 2 + 60]} receiveShadow><planeGeometry args={[44, len]} /><Mat c="#5f8a44" /></mesh>
      {Array.from({ length: 32 }, (_, i) => <House key={i} z={44 - i * 13} i={i} lit={lit} />)}
      {Array.from({ length: 36 }, (_, i) => <Tree key={i} p={[3.6 + rnd(i) * 0.6, 0, 36 - i * 11.5]} i={i} />)}
      {Array.from({ length: 18 }, (_, i) => <Lamp key={i} z={28 - i * 23} on={lamps} />)}
      {Array.from({ length: 16 }, (_, i) => (
        <group key={"l" + i} position={[-19, 0, -20 - i * 16]}>
          <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[6, 4, 7]} /><Mat c={HOUSE_COLS[(i + 2) % 6]} /></mesh>
          <mesh position={[0, 5.0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[1.4, 1.4, 7.4, 3]} /><Mat c={ROOF_COLS[i % 4]} /></mesh>
        </group>
      ))}
      {extras}
    </group>
  );
};

// ---------- машина ----------
export const Car3D: React.FC<{ p: V3; rotY?: number; c: string; hazard?: boolean; f?: number; wheel?: number }> = ({ p, rotY = 0, c, hazard, f = 0, wheel = 0 }) => {
  const on = hazard && Math.floor(f / 12) % 2 === 0;
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow><boxGeometry args={[1.8, 0.55, 4.0]} /><Mat c={c} /></mesh>
      <mesh position={[0, 0.98, -0.2]} castShadow><boxGeometry args={[1.6, 0.48, 2.1]} /><Mat c={c} /></mesh>
      <mesh position={[0, 0.98, -0.2]}><boxGeometry args={[1.62, 0.36, 1.9]} /><Mat c="#2a3040" r={0.3} /></mesh>
      {[[-0.92, 1.3], [0.92, 1.3], [-0.92, -1.3], [0.92, -1.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.32, z]} rotation={[wheel, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.32, 0.32, 0.22, 10]} /><Mat c="#1b1b22" /></mesh>
      ))}
      {[-0.6, 0.6].map((x) => <mesh key={"h" + x} position={[x, 0.6, 2.01]}><boxGeometry args={[0.36, 0.14, 0.02]} /><Mat c="#fff4d0" e="#fff4d0" ei={0.4} /></mesh>)}
      {[-0.65, 0.65].map((x) => <mesh key={"t" + x} position={[x, 0.6, -2.01]}><boxGeometry args={[0.3, 0.14, 0.02]} /><Mat c={on ? "#ffb030" : "#8a2a2a"} e={on ? "#ffb030" : undefined} ei={on ? 2 : 0} /></mesh>)}
    </group>
  );
};

// ---------- человек ----------
export type Look3D = { jacket: string; jacket2: string; limb: string; shoe: string; skin: string; hat?: { c: string; c2: string } | null; hair?: string; pack?: string | null; legs?: string };
export const MASCOT3D: Look3D = { jacket: "#ee7a36", jacket2: "#c8602a", limb: "#1d1d26", shoe: "#f2f2ee", skin: "#f0c49c", hat: { c: "#2f3d63", c2: "#eef1f6" }, pack: "#f2c84c" };
export const NPCS: Look3D[] = [
  { jacket: "#5f8fb5", jacket2: "#4a7090", limb: "#2a2a34", shoe: "#22222a", skin: "#e0b48c", hair: "#3a2a20", pack: null },
  { jacket: "#8a5aa0", jacket2: "#6a4280", limb: "#2a2a34", shoe: "#f2f2ee", skin: "#f0c8a4", hair: "#b8702a", pack: null },
  { jacket: "#4f9a6a", jacket2: "#3a7a52", limb: "#26262e", shoe: "#22222a", skin: "#c89670", hair: "#1a1a1e", pack: null },
  { jacket: "#d8c050", jacket2: "#b8a03a", limb: "#2a2a34", shoe: "#3a2a20", skin: "#e8c09c", hair: "#5a3a24", pack: null },
  { jacket: "#c84a4a", jacket2: "#a03a3a", limb: "#22222a", shoe: "#f2f2ee", skin: "#d8a884", hair: "#2a1a14", pack: null },
];
// Майя: соседка, слепая с рождения — жёлтая куртка, тёмные очки, белая трость
export const MAYA3D: Look3D = { jacket: "#e8c44a", jacket2: "#c8a43a", limb: "#2a2a3a", shoe: "#5a3a5a", skin: "#c8946c", hair: "#1e1414", pack: null };
export const L1 = 0.4, L2 = 0.4, A1 = 0.26, A2 = 0.26, HIP = 0.82;

const Leg: React.FC<{ x: number; a: Limb; c: string; shoe: string }> = ({ x, a, c, shoe }) => (
  <group position={[x, 0, 0]} rotation={[-a[0] * D, 0, 0]}>
    <mesh position={[0, -L1 / 2, 0]} castShadow><capsuleGeometry args={[0.032, L1, 4, 8]} /><Mat c={c} flat={false} r={0.6} /></mesh>
    <group position={[0, -L1, 0]} rotation={[-(a[1] - a[0]) * D, 0, 0]}>
      <mesh position={[0, -L2 / 2, 0]} castShadow><capsuleGeometry args={[0.03, L2, 4, 8]} /><Mat c={c} flat={false} r={0.6} /></mesh>
      <mesh position={[0, -L2 - 0.02, 0.05]} rotation={[a[1] * D, 0, 0]} castShadow><boxGeometry args={[0.1, 0.07, 0.2]} /><Mat c={shoe} /></mesh>
    </group>
  </group>
);
const Arm: React.FC<{ x: number; a: Limb; side: number; spread: number; c: string; c2: string; children?: React.ReactNode }> = ({ x, a, side, spread, c, c2, children }) => (
  <group position={[x, 0, 0]} rotation={[-a[0] * D, 0, side * spread]}>
    <mesh position={[0, -A1 / 2, 0]} castShadow><capsuleGeometry args={[0.03, A1, 4, 8]} /><Mat c={c} flat={false} /></mesh>
    <group position={[0, -A1, 0]} rotation={[-(a[1] - a[0]) * D, 0, 0]}>
      <mesh position={[0, -A2 / 2, 0]} castShadow><capsuleGeometry args={[0.026, A2, 4, 8]} /><Mat c={c2} flat={false} r={0.6} /></mesh>
      <group position={[0, -A2 - 0.03, 0]}>
        <mesh castShadow><sphereGeometry args={[0.045, 10, 8]} /><Mat c={c2} flat={false} /></mesh>
        {children}
      </group>
    </group>
  </group>
);
export type Pose3D = { legL: Limb; legR: Limb; armL: Limb; armR: Limb; hip?: number; bob?: number; lean?: number; headYaw?: number; headPitch?: number; spread?: [number, number] };
export const Human: React.FC<{ p: V3; rotY?: number; pose: Pose3D; look?: Look3D; eyes?: number; f: number; handR?: React.ReactNode; handL?: React.ReactNode; glasses?: boolean; scale?: number; mouth?: "flat" | "o" | "smile" }> = ({ p, rotY = 0, pose, look = MASCOT3D, eyes = 1, f, handR, handL, glasses, scale = 1, mouth = "flat" }) => {
  const blink = f % 80 < 3 ? 0.15 : 1;
  const hip = pose.hip ?? HIP;
  const sp = pose.spread ?? [0.12, 0.12];
  return (
    <group position={[p[0], p[1] + (pose.bob ?? 0), p[2]]} rotation={[0, rotY, 0]} scale={scale}>
      <group position={[0, hip, 0]}>
        <Leg x={-0.07} a={pose.legL} c={look.legs ?? look.limb} shoe={look.shoe} />
        <Leg x={0.07} a={pose.legR} c={look.legs ?? look.limb} shoe={look.shoe} />
        <group rotation={[(pose.lean ?? 4) * D, 0, 0]}>
          <mesh position={[0, 0.2, 0]} castShadow><capsuleGeometry args={[0.13, 0.22, 6, 12]} /><Mat c={look.jacket} flat={false} r={0.7} /></mesh>
          <mesh position={[0, 0.2, 0.118]}><boxGeometry args={[0.015, 0.3, 0.02]} /><Mat c={look.jacket2} /></mesh>
          {look.pack ? <mesh position={[0, 0.22, -0.16]} castShadow><boxGeometry args={[0.22, 0.27, 0.1]} /><Mat c={look.pack} r={0.7} /></mesh> : null}
          <group position={[0, 0.4, 0]}>
            <Arm x={-0.15} a={pose.armL} side={-1} spread={sp[0]} c={look.jacket} c2={look.limb}>{handL}</Arm>
            <Arm x={0.15} a={pose.armR} side={1} spread={sp[1]} c={look.jacket} c2={look.limb}>{handR}</Arm>
          </group>
          <group position={[0, 0.62, 0]} rotation={[(pose.headPitch ?? 0) * D, (pose.headYaw ?? 0) * D, 0]}>
            <mesh castShadow><sphereGeometry args={[0.15, 24, 18]} /><Mat c={look.skin} flat={false} r={0.6} /></mesh>
            {look.hat ? (
              <>
                <mesh position={[0, 0.03, 0]} castShadow><sphereGeometry args={[0.158, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><Mat c={look.hat.c} flat={false} r={0.95} /></mesh>
                <mesh position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.155, 0.025, 8, 24]} /><Mat c="#26324f" flat={false} r={0.95} /></mesh>
                <mesh position={[0, 0.19, 0]} castShadow><sphereGeometry args={[0.042, 12, 10]} /><Mat c={look.hat.c2} flat={false} r={1} /></mesh>
              </>
            ) : look.hair ? (
              <mesh position={[0, 0.02, -0.01]} castShadow><sphereGeometry args={[0.156, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.2]} /><Mat c={look.hair} flat={false} r={0.9} /></mesh>
            ) : null}
            <mesh position={[0, -0.035, 0.145]} scale={[0.8, 1, 0.9]}><sphereGeometry args={[0.022, 10, 8]} /><Mat c={look.skin} flat={false} r={0.5} /></mesh>
            {mouth === "o" ? <mesh position={[0, -0.085, 0.132]} scale={[1, 1.2, 0.5]}><sphereGeometry args={[0.022, 10, 8]} /><Mat c="#5a1a1a" flat={false} /></mesh>
              : <mesh position={[0, -0.085, 0.135]} rotation={[0, 0, mouth === "smile" ? Math.PI : 0]} scale={[1, mouth === "smile" ? 1 : 0.35, 1]}><torusGeometry args={[0.03, 0.007, 6, 12, mouth === "smile" ? Math.PI : Math.PI * 2]} /><Mat c="#5a1a1a" flat={false} /></mesh>}
            {eyes > 0.01 && !glasses ? [-1, 1].map((s) => <mesh key={s} position={[s * 0.05, -0.005, 0.138]} scale={[eyes, 1.3 * blink * eyes, 0.5]}><sphereGeometry args={[0.018, 10, 8]} /><Mat c="#14141c" flat={false} r={0.3} /></mesh>) : null}
            {glasses ? (
              <group position={[0, 0, 0.14]}>
                {[-1, 1].map((s) => <mesh key={s} position={[s * 0.055, 0, 0]}><boxGeometry args={[0.08, 0.05, 0.02]} /><Mat c="#111116" r={0.2} /></mesh>)}
                <mesh><boxGeometry args={[0.04, 0.012, 0.02]} /><Mat c="#111116" /></mesh>
              </group>
            ) : null}
          </group>
        </group>
      </group>
    </group>
  );
};
// походка: dist — пройденный путь (м), S — длина двойного шага
export const walkPose = (dist: number, S = 0.95, lift = 0.09, hip = HIP, armK = 70): Pose3D => {
  const fl = stepFoot(dist, S, 0, () => 0, lift), fr = stepFoot(dist, S, 0.5, () => 0, lift);
  const bob = Math.abs(Math.cos((dist / S) * Math.PI * 2)) * 0.02;
  const leg = (foot: [number, number]): Limb => {
    const r = ik([0, 0], [(foot[0] - dist) * 100, (hip + bob - 0.055 + foot[1]) * 100], L1 * 100, L2 * 100, 1);
    return [r[0], r[1]];
  };
  const swL = (fr[0] - dist) / S, swR = (fl[0] - dist) / S;
  return { legL: leg(fl), legR: leg(fr), armL: [swL * armK, swL * armK + 35], armR: [swR * armK, swR * armK + 35], bob, hip };
};
export const STAND3D: Pose3D = { legL: [0, 0], legR: [0, 0], armL: [4, 12], armR: [4, 12] };
// стоять, но ступни на земле при опущенном тазе (присел/колени согнуты)
export const crouch = (h: number): Pose3D => {
  const down = h - 0.055;
  const leg = (fx: number): Limb => { const r = ik([0, 0], [fx * 100, down * 100], L1 * 100, L2 * 100, 1); return [r[0], r[1]]; };
  return { legL: leg(0.05), legR: leg(0.08), armL: [10, 30], armR: [10, 30], hip: h, lean: 18 };
};
export const KNEEL: Pose3D = { legL: [80, 0], legR: [15, -90], armL: [10, 20], armR: [10, 20], hip: 0.47, lean: 6 };
export const SIT: Pose3D = { legL: [86, 6], legR: [84, 2], armL: [20, 70], armR: [20, 70], hip: 0.47, lean: -4 }; // сидеть на сиденье высотой 0.42, ступни на полу

// ---------- собака-напарник (Бадди) ----------
export const Dog3D: React.FC<{ p: V3; rotY?: number; f: number; walk?: number; sit?: boolean; bark?: number; wag?: number; headTilt?: number; color?: string }> = ({ p, rotY = 0, f, walk = 0, sit, bark = 0, wag = 0.5, headTilt = 0, color = "#c08a52" }) => {
  const C2 = "#8a5a32";
  const ph = walk * 9;
  const legA = (k: number) => (sit ? 0 : Math.sin(ph + k) * 32 * Math.min(1, walk > 0 ? 1 : 0));
  const tail = Math.sin(f / (wag > 0.6 ? 1.8 : 4)) * 0.6 * wag;
  const bob = sit ? 0 : Math.abs(Math.sin(ph)) * 0.02;
  return (
    <group position={[p[0], p[1] + bob, p[2]]} rotation={[0, rotY, 0]}>
      <group rotation={[sit ? -0.45 : 0, 0, 0]} position={[0, sit ? -0.06 : 0, 0]}>
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><capsuleGeometry args={[0.13, 0.38, 6, 12]} /><Mat c={color} flat={false} /></mesh>
        <group position={[0, 0.48, -0.32]} rotation={[0.9 + tail * 0.2, tail, 0]}>
          <mesh position={[0, 0.14, 0]} castShadow><capsuleGeometry args={[0.025, 0.24, 4, 8]} /><Mat c={color} flat={false} /></mesh>
        </group>
        {[[-0.08, 0.2, 0], [0.08, 0.2, Math.PI], [-0.08, -0.2, Math.PI], [0.08, -0.2, 0]].map(([x, z, k], i) => (
          <group key={i} position={[x, 0.36, z]} rotation={[(-legA(k) * D) * (sit && z < 0 ? 0 : 1), 0, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow><capsuleGeometry args={[0.035, 0.28, 4, 8]} /><Mat c={i % 2 ? C2 : color} flat={false} /></mesh>
          </group>
        ))}
      </group>
      <group position={[0, sit ? 0.66 : 0.6, sit ? 0.22 : 0.3]} rotation={[-0.1, 0, headTilt * D]}>
        <mesh castShadow><sphereGeometry args={[0.14, 16, 12]} /><Mat c={color} flat={false} /></mesh>
        <mesh position={[0, -0.03, 0.14]} castShadow><boxGeometry args={[0.12, 0.1, 0.16]} /><Mat c={color} /></mesh>
        <mesh position={[0, -0.0, 0.225]}><sphereGeometry args={[0.03, 8, 8]} /><Mat c="#141418" flat={false} /></mesh>
        <mesh position={[0, -0.09 - bark * 0.04, 0.15]} rotation={[bark * 0.4, 0, 0]}><boxGeometry args={[0.1, 0.03, 0.12]} /><Mat c={bark > 0.1 ? "#7a2a2a" : color} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[s * 0.05, 0.04, 0.12]}><sphereGeometry args={[0.02, 8, 8]} /><Mat c="#141418" flat={false} r={0.3} /></mesh>)}
        {[-1, 1].map((s) => <mesh key={"e" + s} position={[s * 0.12, 0.02, -0.02]} rotation={[0, 0, s * (0.5 + Math.sin(f / 6) * 0.05 * walk)]}><boxGeometry args={[0.05, 0.16, 0.08]} /><Mat c={C2} /></mesh>)}
      </group>
      <mesh position={[0, 0.5, 0.2]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.1, 0.015, 6, 16]} /><Mat c="#e0524a" /></mesh>
    </group>
  );
};

// ---------- комната (вид изнутри; стена с окном — сзади, по -z) ----------
export const Room: React.FC<{ night?: boolean; f?: number; children?: React.ReactNode; dark?: number }> = ({ night, children, dark = 0 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[10, 10]} /><Mat c="#9a6a44" /></mesh>
    {Array.from({ length: 12 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-5 + i * 0.85, 0.002, 0]}><planeGeometry args={[0.02, 10]} /><Mat c="#7a5234" /></mesh>)}
    <mesh position={[0, 1.6, -3]} receiveShadow><boxGeometry args={[10, 3.2, 0.1]} /><Mat c={dark ? "#5a5070" : "#d8c4b0"} /></mesh>
    <mesh position={[-3.5, 1.6, 0]} receiveShadow><boxGeometry args={[0.1, 3.2, 10]} /><Mat c={dark ? "#4a4060" : "#ccb8a4"} /></mesh>
    {/* окно */}
    <mesh position={[0.6, 1.7, -2.94]}><boxGeometry args={[1.8, 1.3, 0.02]} /><meshBasicMaterial color={night ? "#1a2244" : "#cfe4f8"} /></mesh>
    {[[0.6, 1.05, 1.9, 0.08], [0.6, 2.35, 1.9, 0.08], [-0.3, 1.7, 0.08, 1.3], [1.5, 1.7, 0.08, 1.3], [0.6, 1.7, 0.06, 1.3]].map(([x, y, w, h], i) => <mesh key={i} position={[x, y, -2.92]}><boxGeometry args={[w, h, 0.05]} /><Mat c="#f2ece0" /></mesh>)}
    {/* диван, столик, ковёр, торшер */}
    <group position={[-1.2, 0, -1.9]}>
      <mesh position={[0, 0.21, 0]} castShadow receiveShadow><boxGeometry args={[2.2, 0.42, 0.9]} /><Mat c="#6a8ab8" /></mesh>
      <mesh position={[0, 0.65, -0.38]} castShadow><boxGeometry args={[2.2, 0.7, 0.16]} /><Mat c="#5a7aa8" /></mesh>
      {[-1.05, 1.05].map((x) => <mesh key={x} position={[x, 0.45, 0]} castShadow><boxGeometry args={[0.2, 0.4, 0.9]} /><Mat c="#3a5a88" /></mesh>)}
    </group>
    <mesh position={[-1.2, 0.01, -0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[1.2, 24]} /><Mat c="#c86a4a" /></mesh>
    <group position={[-0.2, 0, -0.35]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[1.0, 0.06, 0.55]} /><Mat c="#7a4a2a" /></mesh>
      {[[-0.45, -0.22], [0.45, -0.22], [-0.45, 0.22], [0.45, 0.22]].map(([x, z], i) => <mesh key={i} position={[x, 0.2, z]}><boxGeometry args={[0.05, 0.4, 0.05]} /><Mat c="#5a3420" /></mesh>)}
    </group>
    <group position={[1.9, 0, -2.4]}>
      <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.02, 0.02, 1.6, 6]} /><Mat c="#2a2a2a" /></mesh>
      <mesh position={[0, 1.65, 0]}><coneGeometry args={[0.22, 0.3, 12, 1, true]} /><Mat c="#f2d27a" e={night ? "#ffd27a" : undefined} ei={night ? 1 : 0} /></mesh>
      {night ? <pointLight position={[0, 1.5, 0]} intensity={5} distance={6} color="#ffd8a0" /> : null}
    </group>
    {children}
  </group>
);

// ---------- где кисть / ошейник в мире (для поводка, трости) ----------
export const handWorld = (p: V3, rotY: number, pose: Pose3D, side: 1 | -1): THREE.Vector3 => {
  const a = side > 0 ? pose.armR : pose.armL, sp = (pose.spread ?? [0.12, 0.12])[side > 0 ? 1 : 0];
  const M = new THREE.Matrix4().makeTranslation(p[0], p[1] + (pose.bob ?? 0), p[2])
    .multiply(new THREE.Matrix4().makeRotationY(rotY))
    .multiply(new THREE.Matrix4().makeTranslation(0, pose.hip ?? HIP, 0))
    .multiply(new THREE.Matrix4().makeRotationX((pose.lean ?? 4) * D))
    .multiply(new THREE.Matrix4().makeTranslation(side * 0.15, 0.4, 0))
    .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-a[0] * D, 0, side * sp)))
    .multiply(new THREE.Matrix4().makeTranslation(0, -A1, 0))
    .multiply(new THREE.Matrix4().makeRotationX(-(a[1] - a[0]) * D))
    .multiply(new THREE.Matrix4().makeTranslation(0, -A2 - 0.03, 0));
  return new THREE.Vector3().applyMatrix4(M);
};
export const collarWorld = (p: V3, rotY: number, sit?: boolean): THREE.Vector3 =>
  new THREE.Vector3(0, sit ? 0.52 : 0.5, sit ? 0.14 : 0.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY).add(new THREE.Vector3(p[0], p[1], p[2]));
// палка между двумя точками
export const Stick: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; r?: number; c: string }> = ({ a, b, r = 0.012, c }) => {
  const d = b.clone().sub(a), len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return <mesh position={a.clone().add(b).multiplyScalar(0.5)} quaternion={q} castShadow><cylinderGeometry args={[r, r, len, 6]} /><Mat c={c} flat={false} /></mesh>;
};
// поводок с провисом
export const Leash: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; sag?: number; c?: string }> = ({ a, b, sag = 0.12, c = "#e0524a" }) => {
  const mid = a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, -sag, 0));
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 16, 0.009, 5, false), [a.x, a.y, a.z, b.x, b.y, b.z, mid.y]);
  return <mesh geometry={geo} castShadow><Mat c={c} flat={false} /></mesh>;
};
// белая трость: от кисти к кончику на земле
export const Cane: React.FC<{ hand: THREE.Vector3; tip: THREE.Vector3 }> = ({ hand, tip }) => {
  const red = tip.clone().lerp(hand, 0.22);
  return (
    <>
      <Stick a={hand} b={red} r={0.011} c="#f4f4f0" />
      <Stick a={red} b={tip} r={0.011} c="#d83a3a" />
    </>
  );
};
export const Radio3D: React.FC<{ p: V3; f: number; on?: boolean }> = ({ p, f, on = true }) => (
  <group position={p}>
    <mesh castShadow><boxGeometry args={[0.42, 0.24, 0.16]} /><Mat c="#8a5a3a" /></mesh>
    <mesh position={[-0.08, 0, 0.081]}><circleGeometry args={[0.08, 16]} /><Mat c="#3a2a20" /></mesh>
    <mesh position={[0.13, 0.04, 0.085]}><boxGeometry args={[0.1, 0.05, 0.01]} /><Mat c={on ? "#ffd27a" : "#3a3a30"} e={on ? "#ffb040" : undefined} ei={on ? 1 : 0} /></mesh>
    <mesh position={[0.15, 0.17, 0]} rotation={[0, 0, -0.4]}><cylinderGeometry args={[0.005, 0.005, 0.3, 4]} /><Mat c="#aab0b8" /></mesh>
    {on ? [0, 1, 2].map((k) => {
      const t = ((f / 40 + k / 3) % 1);
      return <mesh key={k} position={[-0.08, 0, 0.1]} scale={0.08 + t * 0.3}><torusGeometry args={[1, 0.04, 6, 24]} /><meshBasicMaterial color="#ffb040" transparent opacity={(1 - t) * 0.7} /></mesh>;
    }) : null}
  </group>
);
export const Fridge: React.FC<{ p: V3; on: boolean }> = ({ p, on }) => (
  <group position={p}>
    <mesh position={[0, 0.9, 0]} castShadow><boxGeometry args={[0.8, 1.8, 0.7]} /><Mat c="#e8ecf2" /></mesh>
    <mesh position={[0, 1.15, 0.351]}><boxGeometry args={[0.8, 0.02, 0.01]} /><Mat c="#aab0b8" /></mesh>
    <mesh position={[0.3, 1.3, 0.36]}><boxGeometry args={[0.04, 0.3, 0.03]} /><Mat c="#8a96b0" /></mesh>
    <mesh position={[-0.28, 1.65, 0.36]}><sphereGeometry args={[0.018, 8, 8]} /><Mat c={on ? "#3ad08a" : "#2a2a2a"} e={on ? "#3ad08a" : undefined} ei={on ? 2 : 0} /></mesh>
  </group>
);
