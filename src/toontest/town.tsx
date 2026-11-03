// Подробный 3D-фон «городская улица»: процедурные текстуры (доски, кирпич, вагонка, черепица, грунт),
// витрины с тёплым светом, вывески, навесы, тротуар-настил, фонари со свечением, столбы с проводами,
// бочки, ящики, холмы. Пост-обработка: свечение (bloom) + тон-маппинг. Персонажи рисуются поверх в 2D.
import { useFrame, useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

type V3 = [number, number, number];

// ---------- текстуры ----------
const TEX = new Map<string, THREE.CanvasTexture>();
const mk = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void) => {
  const hit = TEX.get(key); if (hit) return hit;
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!; let seed = key.length * 97 + key.charCodeAt(0);
  const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  draw(g, r);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  TEX.set(key, t); return t;
};
const shade = (hex: string, k: number) => { const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return "#" + c.getHexString(); };
const grain = (g: CanvasRenderingContext2D, r: () => number, x: number, y: number, w: number, h: number, col: string, n: number, vertical: boolean) => {
  g.strokeStyle = col; g.lineWidth = 1.2;
  for (let i = 0; i < n; i++) {
    g.globalAlpha = 0.15 + r() * 0.25; g.beginPath();
    if (vertical) { const xx = x + r() * w; g.moveTo(xx, y); g.bezierCurveTo(xx + (r() - 0.5) * 8, y + h * 0.3, xx + (r() - 0.5) * 8, y + h * 0.7, xx + (r() - 0.5) * 6, y + h); }
    else { const yy = y + r() * h; g.moveTo(x, yy); g.bezierCurveTo(x + w * 0.3, yy + (r() - 0.5) * 6, x + w * 0.7, yy + (r() - 0.5) * 6, x + w, yy + (r() - 0.5) * 4); }
    g.stroke();
  }
  g.globalAlpha = 1;
};
export const planks = (base: string, vertical = false, n = 8) => mk(`pl${base}${vertical}${n}`, 512, 512, (g, r) => {
  const s = 512 / n;
  for (let i = 0; i < n; i++) {
    const c = shade(base, (r() - 0.5) * 0.12);
    g.fillStyle = c; if (vertical) g.fillRect(i * s, 0, s, 512); else g.fillRect(0, i * s, 512, s);
    if (vertical) grain(g, r, i * s, 0, s, 512, shade(base, -0.18), 14, true); else grain(g, r, 0, i * s, 512, s, shade(base, -0.18), 14, false);
    g.fillStyle = shade(base, -0.3);
    if (vertical) g.fillRect(i * s, 0, 3, 512); else g.fillRect(0, i * s, 512, 3);
    g.fillStyle = shade(base, 0.12); if (vertical) g.fillRect(i * s + 3, 0, 2, 512); else g.fillRect(0, i * s + 3, 512, 2);
    // стыки и гвозди
    const cut = r() * 512;
    g.fillStyle = shade(base, -0.28);
    if (vertical) g.fillRect(i * s, cut, s, 3); else g.fillRect(cut, i * s, 3, s);
    g.fillStyle = "#2a2220";
    for (const k of [0.25, 0.75]) { if (vertical) { g.fillRect(i * s + s * k, cut + 8, 3, 3); } else { g.fillRect(cut + 8, i * s + s * k, 3, 3); } }
  }
});
export const bricks = (base: string) => mk(`br${base}`, 512, 512, (g, r) => {
  g.fillStyle = "#cdbca4"; g.fillRect(0, 0, 512, 512);
  const bh = 32, bw = 85;
  for (let row = 0; row < 16; row++) for (let col = -1; col < 7; col++) {
    const x = col * bw + (row % 2 ? bw / 2 : 0), y = row * bh;
    g.fillStyle = shade(base, (r() - 0.5) * 0.14); g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
    g.fillStyle = shade(base, 0.08); g.fillRect(x + 3, y + 3, bw - 6, 4);
    g.fillStyle = shade(base, -0.12); g.fillRect(x + 3, y + bh - 7, bw - 6, 4);
  }
});
export const siding = (base: string) => mk(`sd${base}`, 512, 512, (g, r) => {
  const n = 12, s = 512 / n;
  for (let i = 0; i < n; i++) {
    const grd = g.createLinearGradient(0, i * s, 0, i * s + s);
    grd.addColorStop(0, shade(base, 0.06)); grd.addColorStop(0.85, shade(base, -0.02)); grd.addColorStop(1, shade(base, -0.22));
    g.fillStyle = grd; g.fillRect(0, i * s, 512, s);
    grain(g, r, 0, i * s, 512, s, shade(base, -0.1), 6, false);
  }
  // облупившаяся краска
  for (let i = 0; i < 26; i++) { g.fillStyle = shade(base, -0.15); g.globalAlpha = 0.35; g.beginPath(); g.ellipse(r() * 512, r() * 512, 4 + r() * 12, 2 + r() * 4, 0, 0, Math.PI * 2); g.fill(); }
  g.globalAlpha = 1;
});
export const shingles = (base: string) => mk(`sh${base}`, 512, 512, (g, r) => {
  g.fillStyle = shade(base, -0.2); g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 16; row++) for (let col = -1; col < 11; col++) {
    const x = col * 52 + (row % 2 ? 26 : 0), y = row * 32;
    g.fillStyle = shade(base, (r() - 0.5) * 0.12); g.fillRect(x + 2, y, 48, 30);
    g.fillStyle = shade(base, -0.16); g.fillRect(x + 2, y + 26, 48, 4);
  }
});
export const dirt = () => mk("dirt", 1024, 1024, (g, r) => {
  g.fillStyle = "#c89a62"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() > 0.5 ? "#b5844e" : "#d8ae78"; g.globalAlpha = 0.25 + r() * 0.35; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 5, 2 + r() * 4); }
  g.globalAlpha = 0.25; g.fillStyle = "#9a6a3c";
  for (const x of [330, 400, 620, 690]) g.fillRect(x, 0, 36, 1024);
  for (let i = 0; i < 160; i++) { g.globalAlpha = 0.5; g.fillStyle = "#8a7a6a"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 3 + r() * 6, 2 + r() * 4, r() * 3, 0, Math.PI * 2); g.fill(); }
  g.globalAlpha = 1;
});
export const grass = () => mk("grass", 512, 512, (g, r) => {
  g.fillStyle = "#6aa83a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5000; i++) { g.fillStyle = r() > 0.5 ? "#5a9630" : "#88c44c"; g.globalAlpha = 0.5; g.fillRect(r() * 512, r() * 512, 2, 4 + r() * 6); }
  g.globalAlpha = 1;
});
const signTex = (text: string, bg: string, fg: string, sub?: string) => mk(`sg${text}${bg}`, 1024, 256, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = shade(bg, -0.25); g.lineWidth = 18; g.strokeRect(9, 9, 1006, 238);
  g.strokeStyle = fg; g.lineWidth = 5; g.strokeRect(30, 30, 964, 196);
  g.fillStyle = fg; g.textAlign = "center"; g.font = "bold 116px DejaVu Serif, serif"; g.fillText(text, 512, sub ? 145 : 170);
  if (sub) { g.font = "bold 44px DejaVu Sans, sans-serif"; g.fillText(sub, 512, 205); }
});
const awningTex = (a: string, b: string) => mk(`aw${a}${b}`, 512, 256, (g) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 64, 0, 64, 256); }
  g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(0, 220, 512, 36);
});
const rep = (t: THREE.Texture, x: number, y: number) => { const c = t.clone(); c.repeat.set(x, y); c.needsUpdate = true; return c; };

// ---------- материалы ----------
const Std: React.FC<{ map?: THREE.Texture; c?: string; r?: number; e?: string; ei?: number }> = ({ map, c = "#ffffff", r = 0.85, e, ei = 0 }) =>
  <meshStandardMaterial map={map} color={c} roughness={r} metalness={0} emissive={e ?? "#000000"} emissiveIntensity={ei} />;

// ---------- постройки ----------
const WIN_GLOW = "#ffb860";
const Window: React.FC<{ p: V3; w: number; h: number; lit?: boolean; frame?: string }> = ({ p, w, h, lit, frame = "#f4ecd8" }) => (
  <group position={p}>
    <mesh position={[0, 0, -0.02]}><planeGeometry args={[w, h]} /><meshStandardMaterial color={lit ? "#ffcf8a" : "#33405a"} emissive={lit ? WIN_GLOW : "#0a1020"} emissiveIntensity={lit ? 1.6 : 0.4} roughness={0.2} /></mesh>
    {[[0, h / 2, w + 0.12, 0.08], [0, -h / 2, w + 0.2, 0.1], [0, 0, w, 0.04]].map(([x, y, ww, hh], i) => <mesh key={i} position={[x, y, 0.03]} castShadow><boxGeometry args={[ww, hh, 0.08]} /><Std c={frame} r={0.7} /></mesh>)}
    {[-w / 2, 0, w / 2].map((x, i) => <mesh key={"v" + i} position={[x, 0, 0.03]} castShadow><boxGeometry args={[i === 1 ? 0.04 : 0.08, h, 0.08]} /><Std c={frame} r={0.7} /></mesh>)}
  </group>
);
type Shop = { w: number; h: number; wall: "planks" | "bricks" | "siding"; col: string; trim: string; sign: string; signBg: string; signFg: string; sub?: string; awn?: [string, string]; lit?: boolean };
const Storefront: React.FC<{ p: V3; rotY: number; s: Shop; i: number }> = ({ p, rotY, s, i }) => {
  const wallT = s.wall === "bricks" ? bricks(s.col) : s.wall === "siding" ? siding(s.col) : planks(s.col, true, 10);
  const map = rep(wallT, s.w / 2.4, s.h / 2.4);
  const d = 6;
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <mesh position={[0, s.h / 2, -d / 2]} castShadow receiveShadow><boxGeometry args={[s.w, s.h, d]} /><Std map={map} /></mesh>
      {/* фальш-фасад и карниз */}
      <mesh position={[0, s.h + 0.35, -0.1]} castShadow><boxGeometry args={[s.w, 0.7, 0.2]} /><Std map={rep(wallT, s.w / 2.4, 0.3)} /></mesh>
      <mesh position={[0, s.h + 0.74, 0.0]} castShadow><boxGeometry args={[s.w + 0.25, 0.14, 0.42]} /><Std c={s.trim} /></mesh>
      <mesh position={[0, s.h - 0.05, 0.05]} castShadow><boxGeometry args={[s.w + 0.1, 0.12, 0.3]} /><Std c={s.trim} /></mesh>
      {Array.from({ length: Math.floor(s.w / 0.6) }, (_, k) => <mesh key={k} position={[-s.w / 2 + 0.3 + k * 0.6, s.h - 0.17, 0.12]}><boxGeometry args={[0.12, 0.12, 0.16]} /><Std c={s.trim} /></mesh>)}
      {/* вывеска */}
      <mesh position={[0, s.h * 0.62 + 0.55, 0.06]} castShadow><boxGeometry args={[Math.min(s.w - 0.4, 4.2), 1.0, 0.1]} /><Std c={s.signBg} /></mesh>
      <mesh position={[0, s.h * 0.62 + 0.55, 0.115]}><planeGeometry args={[Math.min(s.w - 0.4, 4.2) - 0.06, 0.94]} /><meshStandardMaterial map={signTex(s.sign, s.signBg, s.signFg, s.sub)} roughness={0.6} /></mesh>
      {/* второй этаж: окна */}
      {[-1, 1].map((k) => <Window key={k} p={[k * s.w * 0.25, s.h * 0.62 + 1.8, 0.05]} w={0.85} h={1.05} lit={s.lit && (i + k) % 2 === 0} frame={s.trim} />)}
      {/* витрина и дверь */}
      <Window p={[-s.w * 0.22, 1.35, 0.05]} w={s.w * 0.32} h={1.6} lit frame={s.trim} />
      <Window p={[s.w * 0.27, 1.35, 0.05]} w={s.w * 0.22} h={1.6} lit={i % 2 === 0} frame={s.trim} />
      <mesh position={[s.w * 0.04, 1.15, 0.03]} castShadow><boxGeometry args={[0.85, 2.1, 0.1]} /><Std map={rep(planks("#6a3a22", true, 4), 1, 1)} /></mesh>
      <mesh position={[s.w * 0.04 + 0.3, 1.1, 0.1]}><sphereGeometry args={[0.04, 8, 6]} /><Std c="#e8c060" r={0.3} /></mesh>
      {/* навес */}
      {s.awn ? (
        <mesh position={[0, 2.55, 0.75]} rotation={[0.38, 0, 0]} castShadow receiveShadow><boxGeometry args={[s.w - 0.2, 0.05, 1.6]} /><meshStandardMaterial map={awningTex(s.awn[0], s.awn[1])} roughness={0.9} /></mesh>
      ) : (
        <group>
          <mesh position={[0, 2.85, 1.3]} rotation={[0.12, 0, 0]} castShadow receiveShadow><boxGeometry args={[s.w, 0.1, 2.7]} /><Std map={rep(shingles("#6a4a3a"), s.w / 2, 1)} /></mesh>
          {[-s.w / 2 + 0.15, s.w / 2 - 0.15].map((x) => <mesh key={x} position={[x, 1.4, 2.5]} castShadow><boxGeometry args={[0.16, 2.8, 0.16]} /><Std map={rep(planks(s.trim, true, 2), 0.2, 1)} /></mesh>)}
        </group>
      )}
    </group>
  );
};
export const SHOPS: Shop[] = [
  { w: 6.2, h: 4.6, wall: "planks", col: "#c86a4a", trim: "#f2e6cc", sign: "GENERAL STORE", signBg: "#1e3a5a", signFg: "#f4d27a", awn: ["#e04a3a", "#f8efe0"], lit: true },
  { w: 5.0, h: 5.4, wall: "bricks", col: "#b0563a", trim: "#efe2c6", sign: "BANK", signBg: "#24442e", signFg: "#f4e2b0", sub: "EST. 1889", lit: true },
  { w: 5.6, h: 4.2, wall: "siding", col: "#5f8fbf", trim: "#f6efe0", sign: "BARBER", signBg: "#f4ecd6", signFg: "#c0302a", awn: ["#2e5aa0", "#f6efe0"] },
  { w: 6.6, h: 4.8, wall: "siding", col: "#e8c060", trim: "#6a3a22", sign: "SALOON", signBg: "#5a2a1a", signFg: "#f8d890", lit: true },
  { w: 5.2, h: 4.4, wall: "planks", col: "#8abf9a", trim: "#f2e6cc", sign: "BAKERY", signBg: "#f8efe0", signFg: "#c0503a", awn: ["#f08a3a", "#fff4e0"] },
  { w: 5.8, h: 5.0, wall: "bricks", col: "#9a4a3a", trim: "#efe2c6", sign: "HOTEL", signBg: "#2a2a3a", signFg: "#f4d27a", lit: true },
];

// ---------- реквизит ----------
const Barrel: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow><cylinderGeometry args={[0.32, 0.32, 0.9, 16]} /><Std map={rep(planks("#9a6034", true, 12), 1, 1)} /></mesh>
    {[0.15, 0.75].map((y) => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.335, 0.335, 0.06, 16]} /><Std c="#3a3a40" r={0.5} /></mesh>)}
  </group>
);
const Crate: React.FC<{ p: V3; s?: number; r?: number }> = ({ p, s = 0.6, r = 0 }) => (
  <mesh position={[p[0], p[1] + s / 2, p[2]]} rotation={[0, r, 0]} castShadow receiveShadow><boxGeometry args={[s, s, s]} /><Std map={rep(planks("#c09050", false, 5), 1, 1)} /></mesh>
);
const Lamp: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <mesh position={[0, 1.8, 0]} castShadow><cylinderGeometry args={[0.06, 0.09, 3.6, 10]} /><Std c="#24242c" r={0.4} /></mesh>
    <mesh position={[0, 3.7, 0]} castShadow><cylinderGeometry args={[0.2, 0.12, 0.35, 8]} /><Std c="#24242c" r={0.4} /></mesh>
    <mesh position={[0, 3.5, 0]}><sphereGeometry args={[0.15, 12, 10]} /><meshStandardMaterial color="#fff0c0" emissive="#ffc060" emissiveIntensity={4} /></mesh>
    <pointLight position={[0, 3.4, 0]} color="#ffbe70" intensity={4} distance={7} decay={1.6} />
  </group>
);
const Pole: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <mesh position={[0, 4, 0]} castShadow><cylinderGeometry args={[0.1, 0.13, 8, 8]} /><Std map={rep(planks("#7a5a3a", true, 3), 0.3, 2)} /></mesh>
    <mesh position={[0, 7.4, 0]} castShadow><boxGeometry args={[2.2, 0.12, 0.12]} /><Std c="#6a4a2a" /></mesh>
  </group>
);
const Wire: React.FC<{ a: V3; b: V3; sag?: number }> = ({ a, b, sag = 0.6 }) => {
  const geo = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), M = A.clone().add(B).multiplyScalar(0.5); M.y -= sag;
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(A, M, B), 20, 0.012, 4, false);
  }, [a.join(), b.join(), sag]);
  return <mesh geometry={geo}><meshBasicMaterial color="#20202a" /></mesh>;
};
const Hill: React.FC<{ p: V3; s: V3; c: string }> = ({ p, s, c }) => <mesh position={p} scale={s}><sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><Std c={c} r={1} /></mesh>;
const TreeR: React.FC<{ p: V3; s?: number; i: number }> = ({ p, s = 1, i }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.14, 0.22, 2.4, 8]} /><Std c="#6a4a32" /></mesh>
    {[[0, 3.0, 0, 1.3], [0.7, 2.6, 0.2, 0.9], [-0.6, 2.7, -0.2, 0.95], [0.1, 3.7, 0.1, 0.85]].map(([x, y, z, r], k) => <mesh key={k} position={[x, y, z]} castShadow><icosahedronGeometry args={[r, 2]} /><Std c={["#5aa040", "#6cb44a", "#4a8e36"][(i + k) % 3]} r={0.9} /></mesh>)}
  </group>
);

// ---------- небо, свет, пост-обработка ----------
const Sky: React.FC = () => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "varying vec3 vP; void main(){ float h = clamp(vP.y, 0.0, 1.0); vec3 low = vec3(1.0,0.86,0.62); vec3 mid = vec3(0.55,0.75,0.98); vec3 top = vec3(0.22,0.45,0.9); vec3 c = mix(low, mid, smoothstep(0.0,0.18,h)); c = mix(c, top, smoothstep(0.18,0.8,h)); gl_FragColor = vec4(c,1.0); }",
  }), []);
  return <mesh material={mat}><sphereGeometry args={[400, 32, 16]} /></mesh>;
};
const Puff: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <group position={p} scale={s}>
    {[[0, 0, 0, 1], [1.2, -0.2, 0, 0.8], [-1.1, -0.25, 0, 0.75], [0.5, 0.5, 0, 0.75], [-0.4, 0.45, 0, 0.65]].map(([x, y, z, r], i) => <mesh key={i} position={[x, y, z]}><sphereGeometry args={[r, 16, 12]} /><meshStandardMaterial color="#ffffff" emissive="#fff4ea" emissiveIntensity={0.55} roughness={1} fog={false} /></mesh>)}
  </group>
);
export const Post: React.FC<{ bloom?: number }> = ({ bloom = 0.55 }) => {
  const { gl, scene, camera, size } = useThree();
  const comp = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(size.width / 2, size.height / 2), bloom, 0.55, 0.82));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera, size.width, size.height, bloom]);
  useFrame(() => comp.render(), 1);
  return null;
};

// ---------- улица целиком: ось улицы — Z, дорога x ∈ [-4, 4], настилы x ∈ ±[4, 6.5], фасады на x = ±6.5 ----------
export const Town: React.FC<{ sun?: V3 }> = ({ sun = [-30, 22, -40] }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(0, 0, -6);
  const rows: { p: V3; r: number; s: Shop; i: number }[] = [];
  for (const side of [-1, 1]) {
    let z = 12;
    for (let k = 0; k < 6; k++) {
      const s = SHOPS[(k + (side > 0 ? 3 : 0)) % SHOPS.length];
      rows.push({ p: [side * 6.5, 0.25, z - s.w / 2], r: side > 0 ? -Math.PI / 2 : Math.PI / 2, s, i: k + (side > 0 ? 10 : 0) });
      z -= s.w + 0.15;
    }
  }
  return (
    <>
      <fog attach="fog" args={["#f2d6b0", 30, 140]} />
      <Sky />
      {[[-40, 40, -160, 9], [30, 52, -190, 11], [90, 35, -150, 7], [-110, 60, -220, 13]].map(([x, y, z, s], i) => <Puff key={i} p={[x, y, z]} s={s} />)}
      <hemisphereLight args={["#bcd4ff", "#a07850", 0.75]} />
      <ambientLight intensity={0.12} />
      <primitive object={target} />
      <directionalLight position={sun} target={target} intensity={3.2} color="#ffe2b0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-camera-near={1} shadow-camera-far={120} shadow-bias={-0.0004} shadow-normalBias={0.03} shadow-radius={4} />
      {/* земля */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]} receiveShadow><planeGeometry args={[8, 90]} /><Std map={rep(dirt(), 1, 11)} r={1} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} rotation={[-Math.PI / 2, 0, 0]} position={[sd * 40, -0.01, -20]} receiveShadow><planeGeometry args={[70, 200]} /><Std map={rep(grass(), 20, 60)} r={1} /></mesh>)}
      {/* настилы */}
      {[-1, 1].map((sd) => (
        <group key={"b" + sd}>
          <mesh position={[sd * 5.25, 0.12, -20]} receiveShadow castShadow><boxGeometry args={[2.5, 0.25, 90]} /><Std map={rep(planks("#a8784a", false, 6), 1, 36)} /></mesh>
          {Array.from({ length: 16 }, (_, k) => <mesh key={k} position={[sd * 4.1, 0.75, 10 - k * 5]} castShadow><boxGeometry args={[0.12, 1.0, 0.12]} /><Std c="#7a5232" /></mesh>)}
          <mesh position={[sd * 4.1, 1.1, -27.5]} castShadow><boxGeometry args={[0.1, 0.1, 75]} /><Std c="#8a6038" /></mesh>
        </group>
      ))}
      {rows.map((r, k) => <Storefront key={k} p={r.p} rotY={r.r} s={r.s} i={r.i} />)}
      {/* реквизит */}
      {[[-5.6, 0.25, 6], [-5.2, 0.25, 5.4], [5.4, 0.25, -3], [-5.5, 0.25, -12], [5.6, 0.25, -16]].map((p, i) => <Barrel key={i} p={p as V3} />)}
      {[[5.5, 0.25, 4.8, 0.6, 0.3], [5.6, 0.85, 4.8, 0.45, 0.6], [-5.4, 0.25, -6, 0.7, 0.1], [5.3, 0.25, -9, 0.55, 0.4]].map(([x, y, z, s, r], i) => <Crate key={i} p={[x, y, z]} s={s} r={r} />)}
      {[[-4.3, 0.25, 2], [4.3, 0.25, -6], [-4.3, 0.25, -14], [4.3, 0.25, -22], [-4.3, 0.25, -30]].map((p, i) => <Lamp key={i} p={p as V3} />)}
      {[0, 1, 2, 3, 4].map((k) => <Pole key={k} p={[-3.8, 0, 8 - k * 14]} />)}
      {[0, 1, 2, 3].map((k) => [-0.9, 0.9].map((dx) => <Wire key={`${k}${dx}`} a={[-3.8 + dx, 7.4, 8 - k * 14]} b={[-3.8 + dx, 7.4, 8 - (k + 1) * 14]} />))}
      {[0, 1, 2].map((k) => <Wire key={"x" + k} a={[-3.8, 7.3, 8 - k * 14]} b={[6.5, 5.6, 2 - k * 14]} sag={0.9} />)}
      <Hill p={[-30, 0, -95]} s={[45, 16, 20]} c="#78b04a" />
      <Hill p={[25, 0, -110]} s={[50, 22, 25]} c="#5e9c3e" />
      <Hill p={[0, 0, -130]} s={[70, 12, 20]} c="#8abf5a" />
      {[[-14, -60], [-10, -70], [12, -64], [16, -75], [-20, -85], [6, -90]].map(([x, z], i) => <TreeR key={i} p={[x, 0, z]} s={1.4} i={i} />)}
    </>
  );
};
