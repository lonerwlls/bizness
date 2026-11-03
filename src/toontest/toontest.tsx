// Проба нового стиля «мультяшное 3D»: заливка ступенями + контур, рисованные лица с эмоциями и речью,
// сочный цвет (тёплый свет / синие тени), смена ракурса каждые ~1.3 с с перетеканием, эффекты.
import { ThreeCanvas } from "@remotion/three";
import { useFrame } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import { OutlineEffect } from "three/examples/jsm/effects/OutlineEffect.js";
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, ip } from "../characters/kit";
import { CamRig, Human, HIP, Limb, Look3D, Pose3D, MASCOT3D, MOODS, Mat, Mood, NPCS, STAND3D, Street, TOON, V3, WALK_Y, World, lerp, rnd, walkPose } from "../lowpoly/kit3d";

TOON.on = true;
export const TOONTEST_FRAMES = 300;

// ---------- контур (обводка) всего, что не прозрачное и не огромное ----------
const Ink: React.FC = () => {
  useFrame((st) => {
    const fx = (st as unknown as { __fx?: OutlineEffect }).__fx ?? new OutlineEffect(st.gl, { defaultThickness: 0.013, defaultColor: [0.08, 0.05, 0.1], defaultAlpha: 1 });
    (st as unknown as { __fx?: OutlineEffect }).__fx = fx;
    st.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.Material;
      if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
      const big = (m.geometry.boundingSphere?.radius ?? 0) > 25;
      if (big || mat.transparent || (mat as THREE.MeshBasicMaterial).isMeshBasicMaterial || (mat as THREE.ShaderMaterial).isShaderMaterial) mat.userData.outlineParameters = { visible: false };
    });
    fx.render(st.scene, st.camera);
  }, 1);
  return null;
};
const Canvas3D: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }} camera={{ fov: 42, near: 0.05, far: 1000 }}><Ink />{children}</ThreeCanvas>;
};

// ---------- рисованное лицо ----------
type Expr = "neutral" | "smirk" | "laugh" | "shock" | "grin" | "talk";
const FACE_CACHE = new Map<string, THREE.CanvasTexture>();
const PH0 = Math.PI / 2 - 0.9, PHL = 1.8, TH0 = Math.PI / 2 - 0.6, THL = 1.6, N = 512;
const px = (h: number, v: number): [number, number] => [((h + 0.9) / PHL) * N, ((v + 0.6) / THL) * N];
const faceTex = (expr: Expr, open: number, blink: boolean, sweat: boolean) => {
  const key = `${expr}|${Math.round(open * 5)}|${blink}|${sweat}`;
  const hit = FACE_CACHE.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas"); cv.width = cv.height = N;
  const g = cv.getContext("2d")!;
  const INK = "#1a1014";
  g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = 12;
  const [lx, ey] = px(-0.36, 0.04), [rx] = px(0.36, 0.04);
  // глаза
  for (const [x, s] of [[lx, -1], [rx, 1]] as [number, number][]) {
    if (blink || expr === "laugh") {
      g.beginPath();
      if (expr === "laugh") g.arc(x, ey + 20, 36, Math.PI * 1.1, Math.PI * 1.9); else { g.moveTo(x - 32, ey); g.lineTo(x + 32, ey); }
      g.stroke();
    } else if (expr === "shock") {
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x, ey, 46, 54, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = INK; g.beginPath(); g.arc(x, ey + 6, 15, 0, Math.PI * 2); g.fill();
    } else {
      g.fillStyle = INK; g.beginPath(); g.ellipse(x, ey, 27, 40, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x + 9, ey - 14, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = INK;
      if (expr === "smirk") { // полуопущенные веки
        g.fillStyle = "#00000000"; g.save(); g.globalCompositeOperation = "destination-out"; g.fillRect(x - 40, ey - 50, 80, 42); g.restore();
        g.beginPath(); g.moveTo(x - 36, ey - 8); g.lineTo(x + 36, ey - 8); g.stroke();
      }
    }
    // брови
    const by = ey - (expr === "shock" ? 86 : 66);
    const tilt = expr === "smirk" ? (s < 0 ? -14 : 8) : expr === "shock" ? -6 * s : expr === "laugh" ? 6 * s : expr === "grin" ? 10 * s : 0;
    g.lineWidth = 15; g.beginPath(); g.moveTo(x - 34, by + tilt * (s < 0 ? 1 : -1)); g.lineTo(x + 34, by - tilt * (s < 0 ? 1 : -1)); g.stroke(); g.lineWidth = 12;
  }
  // рот
  const [mx, my] = px(0, 0.56);
  g.fillStyle = "#4a1418";
  if (expr === "laugh" || expr === "grin") {
    const w = expr === "laugh" ? 80 : 88, h = expr === "laugh" ? 70 + open * 20 : 50;
    g.beginPath(); g.moveTo(mx - w, my - 16); g.quadraticCurveTo(mx, my - 22, mx + w, my - 16); g.quadraticCurveTo(mx + w * 0.8, my - 16 + h * 1.4, mx, my - 16 + h); g.quadraticCurveTo(mx - w * 0.8, my - 16 + h * 1.4, mx - w, my - 16); g.closePath(); g.fill();
    g.fillStyle = "#ffffff"; g.fillRect(mx - w * 0.8, my - 16, w * 1.6, 13);
    if (expr === "laugh") { g.fillStyle = "#e0606e"; g.beginPath(); g.ellipse(mx, my + h * 0.55, w * 0.45, h * 0.28, 0, 0, Math.PI * 2); g.fill(); }
    g.beginPath(); g.moveTo(mx - w, my - 16); g.quadraticCurveTo(mx, my - 22, mx + w, my - 16); g.quadraticCurveTo(mx + w * 0.8, my - 16 + h * 1.4, mx, my - 16 + h); g.quadraticCurveTo(mx - w * 0.8, my - 16 + h * 1.4, mx - w, my - 16); g.closePath(); g.stroke();
  } else if (expr === "shock") {
    g.beginPath(); g.ellipse(mx, my + 6, 30, 40 + open * 12, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  } else if (expr === "smirk") {
    g.beginPath(); g.moveTo(mx - 52, my + 4); g.quadraticCurveTo(mx + 12, my + 16, mx + 60, my - 24); g.stroke();
  } else if (expr === "talk" && open > 0.08) {
    g.beginPath(); g.ellipse(mx, my, 44, 8 + open * 34, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  } else {
    g.beginPath(); g.moveTo(mx - 40, my); g.quadraticCurveTo(mx, my + 10, mx + 40, my); g.stroke();
  }
  if (sweat) {
    const [sx, sy] = px(0.62, -0.25);
    g.fillStyle = "#7ac8ff"; g.strokeStyle = "#2a5a8a"; g.lineWidth = 5;
    g.beginPath(); g.moveTo(sx, sy - 40); g.quadraticCurveTo(sx + 26, sy + 2, sx, sy + 14); g.quadraticCurveTo(sx - 26, sy + 2, sx, sy - 40); g.fill(); g.stroke();
  }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  FACE_CACHE.set(key, tex);
  return tex;
};
const Face: React.FC<{ expr: Expr; open?: number; f: number; sweat?: boolean }> = ({ expr, open = 0, f, sweat = false }) => {
  const tex = faceTex(expr, open, f % 70 < 3 && expr !== "laugh", sweat);
  return <mesh><sphereGeometry args={[0.1515, 32, 24, PH0, PHL, TH0, THL]} /><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} /></mesh>;
};
// «речь»: рот открывается по слогам
const talk = (g: number, seed = 0) => Math.max(0, Math.sin(g * 0.85 + seed) * 0.6 + Math.sin(g * 2.1 + seed * 2) * 0.4);

// ---------- свет и эффекты ----------
const GOLD: Mood = { ...MOODS.sunset, top: "#3a58b8", mid: "#a08ad8", low: "#ffc27a", fog: "#e8b8a0", sun: "#ffcf8a", sunI: 3.8, sunDir: [-22, 7, 16], hemiTop: "#7a8ef0", hemiBot: "#8a6a48", hemiI: 0.75, cloud: "#fff2ea" };
const Rays: React.FC<{ p: V3; n?: number; rot?: number; o?: number }> = ({ p, n = 5, rot = 0.6, o = 0.12 }) => (
  <group position={p} rotation={[0, 0, rot]}>
    {Array.from({ length: n }, (_, i) => (
      <mesh key={i} position={[(i - n / 2) * 0.9, 0, -i * 0.3]}><planeGeometry args={[0.25 + rnd(i) * 0.5, 30]} /><meshBasicMaterial color="#ffe0a0" transparent opacity={o * (0.5 + rnd(i + 4))} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} /></mesh>
    ))}
  </group>
);
const Dust: React.FC<{ p: V3; t: number; n?: number; size?: number; seed?: number }> = ({ p, t, n = 14, size = 1, seed = 0 }) => (
  <group position={p}>
    {Array.from({ length: n }, (_, i) => {
      const a = rnd(i + seed) * Math.PI * 2, k = Math.min(1, t / (20 + rnd(i + 3) * 20));
      const r = (0.3 + rnd(i + 7) * 0.7) * size * (0.4 + k);
      return <mesh key={i} position={[Math.cos(a) * size * k * 1.2, r * 0.6 + k * 0.4 * size, Math.sin(a) * size * k * 0.8]} scale={r}><icosahedronGeometry args={[1, 1]} /><meshBasicMaterial color="#f2dcb4" transparent opacity={0.42 * (1 - k * 0.5)} depthWrite={false} /></mesh>;
    })}
  </group>
);
const Coin: React.FC<{ a: V3; b: V3; t: number }> = ({ a, b, t }) => {
  if (t < 0 || t > 1) return null;
  const x = lerp(a[0], b[0], t), z = lerp(a[2], b[2], t), y = lerp(a[1], b[1], t) + Math.sin(t * Math.PI) * 0.7;
  return <mesh position={[x, y, z]} rotation={[t * 14, t * 9, 0]}><cylinderGeometry args={[0.035, 0.035, 0.008, 14]} /><meshToonMaterial color="#ffc832" emissive="#a06a00" emissiveIntensity={0.4} /></mesh>;
};

// ---------- декорации: лимонадный ларёк ----------
const signTex = (() => { let t: THREE.CanvasTexture | null = null; return () => {
  if (t) return t;
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 192; const g = cv.getContext("2d")!;
  g.fillStyle = "#fff4d6"; g.fillRect(0, 0, 512, 192); g.strokeStyle = "#1a1014"; g.lineWidth = 12; g.strokeRect(6, 6, 500, 180);
  g.fillStyle = "#e0402a"; g.font = "bold 78px DejaVu Sans, sans-serif"; g.textAlign = "center"; g.fillText("LEMONADE", 256, 100);
  g.fillStyle = "#1a1014"; g.font = "bold 54px DejaVu Sans, sans-serif"; g.fillText("5¢", 256, 165);
  t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}; })();
const OZ = -4; // ларёк между деревьями
const STAND: V3 = [1.0, WALK_Y, OZ];
const JUG: V3 = [STAND[0], STAND[1] + 0.99, STAND[2] + 0.25];
const Stand: React.FC<{ coins?: number }> = ({ coins = 0 }) => (
  <group position={STAND} rotation={[0, -Math.PI / 2, 0]}>
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[1.3, 0.8, 0.6]} /><Mat c="#c8844a" /></mesh>
    <mesh position={[0, 0.82, 0]} castShadow><boxGeometry args={[1.4, 0.05, 0.7]} /><Mat c="#a8683a" /></mesh>
    <mesh position={[0, 0.45, 0.305]}><planeGeometry args={[1.0, 0.38]} /><meshBasicMaterial map={signTex()} toneMapped={false} /></mesh>
    {[-0.62, 0.62].map((x) => <mesh key={x} position={[x, 1.3, -0.25]} castShadow><cylinderGeometry args={[0.03, 0.03, 1.0, 8]} /><Mat c="#f4ead8" /></mesh>)}
    {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[-0.6 + i * 0.2, 1.82, -0.05]} rotation={[0.35, 0, 0]} castShadow><boxGeometry args={[0.2, 0.04, 0.8]} /><Mat c={i % 2 ? "#ffffff" : "#ff8a3a"} /></mesh>)}
    <group position={[0.25, 0.85, 0]}>
      <mesh position={[0, 0.14, 0]} castShadow><cylinderGeometry args={[0.1, 0.12, 0.28, 14]} /><meshToonMaterial color="#ffe34a" transparent opacity={0.85} /></mesh>
      <mesh position={[0.13, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.06, 0.015, 6, 12, Math.PI]} /><Mat c="#ffe34a" /></mesh>
      {[0, 1, 2].map((i) => <mesh key={i} position={[-0.05 + Math.cos(i * 2.1) * 0.06, 0.2, Math.sin(i * 2.1) * 0.06]}><sphereGeometry args={[0.035, 10, 8]} /><Mat c="#ffd21a" /></mesh>)}
    </group>
    {[-0.15, -0.35].map((x, i) => <mesh key={i} position={[x, 0.91, 0.1]} castShadow><cylinderGeometry args={[0.04, 0.032, 0.11, 10]} /><Mat c="#f8f8f0" /></mesh>)}
    <group position={[-0.5, 0.85, 0.05]}>
      <mesh position={[0, 0.08, 0]} castShadow><cylinderGeometry args={[0.08, 0.08, 0.16, 14]} /><meshToonMaterial color="#c8e8ff" transparent opacity={0.6} /></mesh>
      {Array.from({ length: Math.min(coins, 12) }, (_, i) => <mesh key={i} position={[(rnd(i) - 0.5) * 0.08, 0.01 + i * 0.011, (rnd(i + 2) - 0.5) * 0.08]}><cylinderGeometry args={[0.035, 0.035, 0.008, 12]} /><meshToonMaterial color="#ffc832" /></mesh>)}
    </group>
  </group>
);
const NMID: V3 = [3.85, 1.4, OZ + 1.05], NDIR = [-0.84, -0.55];
const nCam = (d: number, y = 1.45): V3 => [NMID[0] + NDIR[0] * d, y, NMID[2] + NDIR[1] * d];
const HERO_P: V3 = [STAND[0] + 0.6, WALK_Y, STAND[2]];
const HERO_R = -Math.PI / 2;
const NEIGH: [V3, number, Look3D][] = [[[3.5, 0.03, OZ + 1.4], -2.3, NPCS[1]], [[4.2, 0.03, OZ + 0.7], -2.0, NPCS[3]]];
const RUN_LOOKS = [NPCS[0], NPCS[2], NPCS[4], NPCS[1], NPCS[3], NPCS[0], NPCS[2], NPCS[4], NPCS[1]];
const Runners: React.FC<{ z0: number; g: number; speed?: number }> = ({ z0, g, speed = 0.11 }) => (
  <>
    {RUN_LOOKS.map((lk, i) => {
      const d = g * speed + rnd(i) * 0.6, z = z0 + d - (i % 3) * 1.1 - Math.floor(i / 3) * 1.3;
      const pose = { ...walkPose(d + i, 1.7, 0.17, HIP - 0.04, 95), lean: 14, headPitch: -8 };
      return <Human key={i} p={[-1.0 - (i % 3) * 0.75 - rnd(i + 1) * 0.3, 0.0, z]} rotY={0} look={lk} pose={pose} f={g + i * 7} face={<Face expr={i % 2 ? "grin" : "talk"} open={talk(g, i)} f={g + i * 9} />} />;
    })}
  </>
);
const Base: React.FC<{ focus: V3 }> = ({ focus }) => (<><World m={GOLD} focus={focus} /><Street /></>);
const Hero: React.FC<{ g: number; expr: Expr; talkOn?: boolean; pose?: object }> = ({ g, expr, talkOn, pose }) => (
  <Human p={HERO_P} rotY={HERO_R} look={MASCOT3D} pose={{ ...STAND3D, armL: [30, 80], armR: [30, 80], headPitch: -4, ...pose }} f={g} face={<Face expr={talkOn ? "talk" : expr} open={talkOn ? talk(g) : 0.5} f={g} />} />
);
const Neighbors: React.FC<{ g: number; expr: Expr; sweat?: boolean }> = ({ g, expr, sweat }) => (
  <>{NEIGH.map(([p, r, lk], i) => {
    const laugh = expr === "laugh";
    const pose: Pose3D = laugh ? { ...STAND3D, lean: 10 + Math.abs(Math.sin(g * 0.5 + i)) * 12, armL: [40, 120] as Limb, armR: [20 + Math.abs(Math.sin(g * 0.5)) * 30, 90] as Limb, headPitch: -18 } : { ...STAND3D, lean: -10, armL: [25, 70] as Limb, armR: [25, 70] as Limb, spread: [0.55, 0.55] as [number, number], headPitch: -6 };
    return <Human key={i} p={[p[0], p[1] + (laugh ? Math.abs(Math.sin(g * 0.5 + i)) * 0.03 : 0), p[2]]} rotY={r} look={lk} pose={pose} f={g + i * 11} face={<Face expr={expr} open={laugh ? Math.abs(Math.sin(g * 0.5 + i)) : 0.5} f={g + i * 13} sweat={sweat} />} />;
  })}</>
);

// ---------- планы ----------
type ShotFC = React.FC<{ g: number }>;
const headOf = (p: V3, r: number, h = 1.5): V3 => [p[0] + Math.sin(r) * 0.02, p[1] + h, p[2] + Math.cos(r) * 0.02];
const HH = headOf(HERO_P, HERO_R);
// 1. общий план: наезд сверху на ларёк
const Sh1: ShotFC = ({ g }) => {
  const k = ip(g, [0, 50], [0, 1], Easing.out(Easing.cubic));
  return (<Canvas3D><CamRig pos={[lerp(-6, -2.6, k), lerp(6.5, 2.3, k), OZ + lerp(-7, -3.2, k)]} look={[1.3, 1.0, OZ + 0.2]} fov={44} /><Base focus={[1, 0, OZ]} /><Rays p={[-3, 6, -6]} rot={0.5} /><Stand /><Hero g={g} expr="smirk" /><Neighbors g={g} expr="neutral" /></Canvas3D>);
};
// 2. крупно: хитрая ухмылка, облёт
const Sh2: ShotFC = ({ g }) => {
  const a = -Math.PI / 2 - 0.3 + g * 0.006;
  return (<Canvas3D><CamRig pos={[HH[0] + Math.sin(a) * 0.75, HH[1] + 0.02, HH[2] + Math.cos(a) * 0.75]} look={[HH[0], HH[1] - 0.06, HH[2]]} fov={42} /><Base focus={[1, 0, OZ]} /><Stand /><Hero g={g} expr="smirk" pose={{ armR: [70, 150], headYaw: 15 }} /></Canvas3D>);
};
// 3. соседи хохочут
const Sh3: ShotFC = ({ g }) => (
  <Canvas3D><CamRig pos={nCam(lerp(3.2, 2.8, g / 45))} look={NMID} fov={44} /><Base focus={[4, 0, OZ + 1]} /><Stand /><Neighbors g={g} expr="laugh" /></Canvas3D>
);
// 4. кувшин и табличка, лучи
const Sh4: ShotFC = ({ g }) => (
  <Canvas3D><CamRig pos={[JUG[0] - lerp(1.35, 1.1, g / 30), JUG[1] + 0.2, JUG[2] - 0.45]} look={[JUG[0], JUG[1], JUG[2]]} fov={40} /><Base focus={[1, 0, OZ]} /><Rays p={[-1.5, 3, -2]} n={4} rot={0.7} o={0.16} /><Stand /><Hero g={g} expr="smirk" /></Canvas3D>
);
// 5. проводка камеры на конец улицы: пыль, бегуны
const Sh5: ShotFC = ({ g }) => {
  const yaw = ip(g, [0, 8], [-1.3, 0], Easing.out(Easing.cubic));
  const c: V3 = [0.6, 1.4, OZ + 2.0];
  return (<Canvas3D><CamRig pos={c} look={[c[0] - 1.6 + Math.sin(Math.PI + yaw) * 10, 1.1, c[2] + Math.cos(Math.PI + yaw) * 10]} fov={30} /><Base focus={[-2, 0, OZ - 20]} /><Dust p={[-2.2, 0, OZ - 21 + g * 0.05]} t={g + 30} n={22} size={1.8} /><Runners z0={OZ - 17} g={g} /><Stand /></Canvas3D>);
};
// 6. соседи в шоке
const Sh6: ShotFC = ({ g }) => {
  const k = ip(g, [0, 25], [0, 1], Easing.out(Easing.cubic));
  return (<Canvas3D><CamRig pos={nCam(lerp(3.4, 2.7, k), 1.5)} look={[NMID[0], 1.4, NMID[2]]} fov={lerp(46, 40, k)} shake={0.02} f={g} /><Base focus={[4, 0, OZ + 1]} /><Stand /><Neighbors g={g} expr="shock" sweat /></Canvas3D>);
};
// 7. бегуны пролетают мимо ларька, монеты летят в банку
const Sh7: ShotFC = ({ g }) => {
  const jar: V3 = [STAND[0] - 0.05, STAND[1] + 0.95, STAND[2] - 0.5];
  return (
    <Canvas3D><CamRig pos={[-0.1, 0.55, OZ + 3.6]} look={[0.1, 1.0, OZ - 2]} fov={50} shake={0.03} f={g} /><Base focus={[0, 0, OZ]} />
      <Dust p={[-2.4, 0, OZ - 9 + g * 0.12]} t={g + 10} n={16} size={1.3} seed={5} />
      <Runners z0={OZ - 7} g={g} speed={0.12} />
      <Stand coins={Math.floor(ip(g, [12, 45], [0, 12]))} /><Hero g={g} expr="grin" pose={{ armL: [100, 110], armR: [100, 110] }} />
      {Array.from({ length: 10 }, (_, i) => <Coin key={i} a={[-1.2 - rnd(i) * 1.2, 1.2, OZ - 1 + g * 0.12 - i * 0.5]} b={jar} t={(g - 4 - i * 3.5) / 14} />)}
    </Canvas3D>
  );
};
// 8. финал: довольная улыбка, наезд
const Sh8: ShotFC = ({ g }) => {
  const k = ip(g, [0, 45], [0, 1], Easing.out(Easing.cubic));
  return (<Canvas3D><CamRig pos={[HH[0] - lerp(1.3, 0.6, k), HH[1] - 0.05, HH[2] - lerp(0.5, 0.15, k)]} look={[HH[0], HH[1] - 0.05, HH[2]]} fov={40} /><Base focus={[1, 0, OZ]} /><Rays p={[-2, 4, -3]} rot={0.55} o={0.14} /><Stand coins={12} /><Hero g={g} expr="grin" pose={{ armR: [120, 140], headPitch: 4 }} /></Canvas3D>);
};

const SHOTS: [ShotFC, number, number][] = [[Sh1, 0, 50], [Sh2, 50, 40], [Sh3, 90, 40], [Sh4, 130, 30], [Sh5, 160, 32], [Sh6, 192, 30], [Sh7, 222, 45], [Sh8, 267, 33]];
const XF = 8; // перетекание между планами, кадров
const ShotSeq: React.FC<{ S: ShotFC; i: number }> = ({ S, i }) => {
  const f = useCurrentFrame(), pre = i === 0 ? 0 : XF;
  const g = f - pre;
  const blur = i === 4 ? ip(g, [-XF, 0, 6, 10], [0, 10, 6, 0]) : 0;
  return <AbsoluteFill style={{ opacity: i === 0 ? 1 : ip(f, [0, XF], [0, 1]), filter: blur ? `blur(${blur}px)` : undefined }}><S g={g} /></AbsoluteFill>;
};

export const ToonTest: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0b1020" }}>
      <AbsoluteFill style={{ filter: "saturate(1.32) contrast(1.07)" }}>
        {SHOTS.map(([S, from, len], i) => <Sequence key={i} from={Math.max(0, from - (i ? XF : 0))} durationInFrames={len + (i ? XF : 0)}><ShotSeq S={S} i={i} /></Sequence>)}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,196,120,0.35) 0%, rgba(255,170,120,0.12) 45%, rgba(40,60,190,0.32) 100%)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 240px 60px rgba(30,15,40,0.45)" }} />
      <Grain f={f} o={0.07} />
      <AbsoluteFill style={{ background: "#fff8ec", opacity: ip(f, [158, 161, 166], [0, 0.5, 0]) + ip(f, [286, 299], [0, 1]) }} />
      <Audio src={staticFile("toontest/sound.wav")} />
    </AbsoluteFill>
  );
};
