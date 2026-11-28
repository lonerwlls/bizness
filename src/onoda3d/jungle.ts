// Проба 10 с: «Онода» в стиле cartoon-3d-short (3D-мир с контуром, светом, размытием) + наш аниме-персонаж.
// Один мир: остров с джунглями (поляна), вокруг море, к берегу идёт лодка. Камера непрерывная:
// сквозь листву к старому Оноде → вспышка → взлёт над кронами → полёт над морем к лодке → молодой Онода прыгает в воду.
import * as THREE from "three";
import { Batch, V, lam, boxGeo } from "../videos/bridge/build";
import { rep, ctex, planksHD, waterNear, waterFar, cloudHD } from "../videos/bridge/paint";
import { LIGHTS, LOOK } from "../videos/bridge/lights";
import { TONE, LFB, untone } from "../videos/bridge/shade";
import { NOINK } from "../videos/bridge/ink";
import { Pool, Fx } from "../videos/bridge/cast";
import { Pen, fxSplash } from "../videos/bridge/toon";
import { AnimeCard } from "./cards";
import { ONODA, ONODA_OLD, SOLDIERS } from "../onoda/looks";
import { VOICE } from "../onoda/voice_ru";

export const FPS = 30, LEAD = 0.25, TOTAL = 300;
export const WF = (i: number) => Math.round((VOICE.words[i].t + LEAD) * FPS);
type V3 = [number, number, number];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ключевые слова
export const T_TURN = WF(5), T_PUSH = WF(7), T_FLASH = WF(10), T_LT = WF(16), T_JUMP = WF(19);

// ---------- места ----------
const OLD_AT: V3 = [0, 0, -6];                 // старый Онода на поляне
const boatZ = (f: number) => 84 - 0.1 * Math.max(0, f - T_FLASH);   // лодка идёт к берегу (-z)

// ---------- камера: ключи (кадр, позиция, точка взгляда, fov, крен) ----------
type Key = { f: number; pos: V3; look: V3; fov: number; roll?: number };
const KEYS = (f: number): Key[] => {
  const bz = boatZ(f);
  return [
    { f: 0, pos: [0.9, 5.2, 5.0], look: [0, 1.6, -6], fov: 52, roll: 0.06 },
    { f: 46, pos: [0.35, 1.55, -0.6], look: [0, 1.45, -6], fov: 40, roll: 0.02 },
    { f: T_PUSH - 2, pos: [0.28, 1.58, -1.4], look: [0, 1.5, -6], fov: 38, roll: 0.02 },
    { f: T_PUSH + 10, pos: [0.08, 1.62, -4.3], look: [0, 1.6, -6], fov: 30, roll: 0.04 },
    { f: T_FLASH - 2, pos: [0.06, 1.63, -4.45], look: [0, 1.61, -6], fov: 29, roll: 0.045 },
    { f: T_FLASH + 4, pos: [0.0, 3.5, -3.5], look: [0, 12, 10], fov: 46, roll: 0 },
    { f: T_FLASH + 26, pos: [3, 14, 30], look: [0, 2, bz], fov: 44, roll: -0.03 },
    { f: T_FLASH + 52, pos: [7, 6, bz - 22], look: [0, 1.5, bz], fov: 40, roll: -0.03 },
    { f: T_LT - 14, pos: [6, 3.6, bz - 12], look: [0, 1.4, bz], fov: 38, roll: -0.02 },
    { f: T_LT + 4, pos: [2.2, 2.3, bz - 6.5], look: [0, 1.9, bz - 2.6], fov: 32, roll: 0.03 },
    { f: T_JUMP - 2, pos: [1.9, 2.25, bz - 6.0], look: [0, 1.8, bz - 2.8], fov: 32, roll: 0.03 },
    { f: T_JUMP + 14, pos: [3.0, 1.6, bz - 8.5], look: [0, 0.6, bz - 4.6], fov: 38, roll: 0.0 },
    { f: TOTAL, pos: [3.4, 1.7, bz - 9.6], look: [0, 0.5, bz - 5.2], fov: 38, roll: 0.0 },
  ];
};
// быстрый наезд-удар (переворот знака каждый кадр, затухание 7 к)
const KICKS = [T_TURN, T_PUSH + 2, T_JUMP + 6];
const kick = (f: number) => { for (const k of KICKS) { const d = f - k; if (d >= 0 && d < 7) return (d % 2 ? -1 : 1) * 0.05 * (1 - d / 7); } return 0; };
export const camAt = (f: number) => {
  const K = KEYS(f);
  let a = K[0], b = K[K.length - 1];
  for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f <= K[i + 1].f) { a = K[i]; b = K[i + 1]; break; }
  const u = glide((f - a.f) / Math.max(1, b.f - a.f));
  return { pos: lerp3(a.pos, b.pos, u), look: lerp3(a.look, b.look, u), fov: lerp(a.fov, b.fov, u), roll: lerp(a.roll ?? 0, b.roll ?? 0, u) + kick(f) };
};
/** размытие дальнего плана (px при 1080): крупные — сильно, полёт — резко */
export const dofAt = (f: number) => {
  if (f < 40) return 6;
  if (f < T_FLASH) return f > T_PUSH ? 15 : 11;
  if (f < T_LT - 14) return 0;
  return 12;
};
export const flashAt = (f: number) => (f >= T_FLASH - 1 && f < T_FLASH + 6 ? [0.4, 1, 0.85, 0.6, 0.35, 0.15, 0.05][f - T_FLASH + 1] : 0);

// ---------- нарисованные текстуры ----------
const leafTex = (key: string, col: string, dark: string) => ctex(key, 512, 256, (g, r) => {
  g.clearRect(0, 0, 512, 256);
  g.fillStyle = col; g.strokeStyle = "#0b0a0c"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(8, 128);
  g.bezierCurveTo(120, 10, 380, 18, 504, 128); g.bezierCurveTo(380, 238, 120, 246, 8, 128); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = dark; g.beginPath(); g.moveTo(8, 128); g.bezierCurveTo(120, 128, 380, 140, 504, 128); g.bezierCurveTo(380, 238, 120, 246, 8, 128); g.fill();
  g.strokeStyle = "rgba(20,40,20,0.8)"; g.lineWidth = 5; g.beginPath(); g.moveTo(10, 128); g.lineTo(500, 128); g.stroke();
  g.lineWidth = 3;
  for (let i = 1; i < 9; i++) { const x = 30 + i * 52; g.beginPath(); g.moveTo(x, 128); g.lineTo(x + 40, 60 + r() * 10); g.moveTo(x, 128); g.lineTo(x + 40, 196 - r() * 10); g.stroke(); }
  // прорези как у банана
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 5; i++) { const x = 120 + i * 70 + r() * 20; g.fillRect(x, i % 2 ? 20 : 170, 6, 66); }
  g.globalCompositeOperation = "source-over";
});
const frondTex = () => ctex("palmFrond", 1024, 256, (g, r) => {
  g.clearRect(0, 0, 1024, 256);
  g.strokeStyle = "#5a4a20"; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 128); g.lineTo(1020, 128); g.stroke();
  for (let i = 0; i < 46; i++) {
    const x = 20 + i * 21, L = 118 * Math.sin(Math.PI * Math.min(1, (i + 4) / 50)) + 10;
    for (const s of [-1, 1]) {
      g.fillStyle = i % 3 ? "#3f9a4a" : "#2f8040"; g.strokeStyle = "#0b0a0c"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x, 128); g.quadraticCurveTo(x + 22, 128 + s * L * 0.6, x + 34 + r() * 6, 128 + s * L); g.quadraticCurveTo(x + 14, 128 + s * L * 0.5, x + 10, 128); g.closePath(); g.fill(); g.stroke();
    }
  }
});
const barkTex = () => ctex("palmBark", 256, 512, (g, r) => {
  g.fillStyle = "#8a6a46"; g.fillRect(0, 0, 256, 512);
  for (let y = 0; y < 512; y += 22) {
    g.fillStyle = "rgba(40,25,15,0.65)"; g.fillRect(0, y, 256, 5);
    g.fillStyle = "rgba(255,230,190,0.18)"; g.fillRect(0, y + 6, 256, 4);
    for (let k = 0; k < 4; k++) { g.fillStyle = "rgba(60,40,20,0.25)"; g.fillRect(r() * 256, y + 8 + r() * 10, 30 + r() * 40, 2); }
  }
});
const floorTex = () => ctex("jungleFloor", 1024, 1024, (g, r) => {
  g.fillStyle = "#5a4a2e"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 1600; i++) {
    const x = r() * 1024, y = r() * 1024, s = 6 + r() * 18;
    g.fillStyle = ["#6a5a34", "#4a3e26", "#7a6a3c", "#3f6a30", "#4f7a36", "#8a6a3a"][Math.floor(r() * 6)];
    g.beginPath(); g.ellipse(x, y, s, s * 0.45, r() * 3.14, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 260; i++) { g.strokeStyle = "rgba(60,100,40,0.8)"; g.lineWidth = 3; const x = r() * 1024, y = r() * 1024; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 10, y - 14 - r() * 14); g.stroke(); }
});
const canopyTex = () => ctex("canopy", 512, 512, (g, r) => {
  g.fillStyle = "#2a6a34"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 420; i++) {
    const x = r() * 512, y = r() * 512, s = 10 + r() * 26;
    g.fillStyle = ["#3a8a44", "#1f5a2c", "#4a9a4c", "#2f7a3a"][Math.floor(r() * 4)];
    g.beginPath(); g.ellipse(x, y, s, s * 0.6, r() * 3.14, 0, Math.PI * 2); g.fill();
  }
});
const shaftTex = () => ctex("shaft", 64, 256, (g) => {
  const gx = g.createLinearGradient(0, 0, 64, 0); gx.addColorStop(0, "rgba(255,255,255,0)"); gx.addColorStop(0.5, "rgba(255,255,255,1)"); gx.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gx; g.fillRect(0, 0, 64, 256);
  g.globalCompositeOperation = "destination-in";
  const gy = g.createLinearGradient(0, 0, 0, 256); gy.addColorStop(0, "rgba(0,0,0,0.2)"); gy.addColorStop(0.3, "rgba(0,0,0,1)"); gy.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gy; g.fillRect(0, 0, 64, 256);
});
const sandTex = () => ctex("sandIsl", 512, 512, (g, r) => {
  g.fillStyle = "#e8cf98"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? "rgba(190,160,110,0.35)" : "rgba(255,245,220,0.35)"; g.fillRect(r() * 512, r() * 512, 3, 3); }
});

// ---------- геометрия ----------
const beamBetween = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, n = 10) => {
  const g = new THREE.CylinderGeometry(r1, r0, a.distanceTo(b), n, 1, true);
  g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1)));
  return g;
};
/** изогнутая полоса-лист длиной L, шириной W, с провисанием; направлена вдоль +x */
const stripGeo = (L: number, W: number, droop: number, segs = 14) => {
  const g = new THREE.PlaneGeometry(L, W, segs, 2);
  g.translate(L / 2, 0, 0);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / L, z = p.getZ(i) / (W / 2);
    p.setY(i, -droop * x * x + 0.12 * W * (1 - z * z) * Math.sin(Math.PI * x));
  }
  g.computeVertexNormals();
  return g;
};
const M = (pos: THREE.Vector3, yaw: number, pitch = 0, roll = 0, s = 1) =>
  new THREE.Matrix4().compose(pos, new THREE.Quaternion().setFromEuler(new THREE.Euler(roll, yaw, pitch, "YZX")), V(s, s, s));

export class JungleWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private fxs: Fx[] = [];
  private sun = new THREE.DirectionalLight("#ffab5e", 5);
  private hemi = new THREE.HemisphereLight("#d8b0b8", "#8a6a60", 0.5);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#efb489", 30, 300);
  private WU: Record<string, THREE.IUniform>;
  private clouds: THREE.Mesh[] = [];
  private shafts: THREE.Mesh[] = [];
  private boat = new THREE.Group();
  private old: AnimeCard; private young: AnimeCard; private mates: AnimeCard[];
  private fronts: THREE.Group = new THREE.Group();

  constructor() {
    const R = this.root;
    // ---- небо ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    const cm = [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.2, d = 560 + (i % 3) * 70;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cm[i % 4], transparent: true, depthWrite: false, fog: false }));
      const w = 150 + (i % 4) * 40; m.position.set(Math.cos(a) * d, 50 + (i % 4) * 30, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK); this.clouds.push(m); R.add(m);
    }
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.sun, this.sun.target, this.hemi);

    // ---- море (шейдер воды из скилла) ----
    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 16; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wTime: { value: 0 },
    };
    const waterM = new THREE.MeshLambertMaterial({ color: 0xffffff });
    waterM.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vWP; uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade; uniform sampler2D wNearTex, wFarTex; uniform float wTime;`)
        .replace("#include <map_fragment>", `
  vec3 wV = vWP - cameraPosition; float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0)); float wf = 1.0 - smoothstep(0.0, 0.42, wDep);
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(0.3 * wTime, -0.6 * wTime);
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6); wc = mix(wc, wCrest, mk.r * 0.75); wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf));
  diffuseColor.rgb = wc;`)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "seaOnoda";
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(2600, 2600).rotateX(-Math.PI / 2), waterM);
    sea.position.y = -0.6; sea.receiveShadow = false; R.add(sea);

    // ---- остров: песок, земля джунглей ----
    const b = new Batch();
    const sand = lam("sandIsl", () => ({ map: rep(sandTex(), 18, 18) }));
    const floor = lam("jFloor", () => ({ map: rep(floorTex(), 10, 10) }));
    b.add(new THREE.CylinderGeometry(58, 66, 1.0, 64), sand, new THREE.Matrix4().makeTranslation(0, -0.55, 0));
    b.add(new THREE.CylinderGeometry(48, 56, 0.6, 64), floor, new THREE.Matrix4().makeTranslation(0, -0.3, 0));
    // ---- пальмы ----
    const bark = lam("palmBark", () => ({ map: barkTex() }));
    const frond = lam("palmFrond", () => ({ map: frondTex(), alphaTest: 0.5, side: THREE.DoubleSide }));
    const palm = (x: number, z: number, h: number, lx: number, lz: number, seed: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(V(x + lx * u * u * h, u * h, z + lz * u * u * h)); }
      for (let i = 0; i < 8; i++) b.add(beamBetween(pts[i], pts[i + 1], 0.3 - i * 0.02, 0.28 - i * 0.02), bark);
      const top = pts[8];
      for (let k = 0; k < 9; k++) {
        const yaw = (k / 9) * Math.PI * 2 + seed, L = 3.6 + ((k * 7 + seed * 3) % 5) * 0.25;
        b.add(stripGeo(L, 1.2, 1.6 + (k % 3) * 0.4), frond, M(top, yaw, 0.35 - (k % 2) * 0.25));
      }
      b.add(new THREE.SphereGeometry(0.42, 10, 8), lam("coco", () => ({ color: "#6a4a2a" })), new THREE.Matrix4().makeTranslation(top.x, top.y - 0.3, top.z));
    };
    let s = 3;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    // кольцо пальм вокруг поляны и по всему острову
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2, d = 9 + rnd() * 40;
      const x = Math.cos(a) * d, z = Math.sin(a) * d - 4;
      if (Math.abs(x) < 4 && z > -12 && z < 6) continue;              // не закрывать поляну и проход камеры
      palm(x, z, 7 + rnd() * 6, (rnd() - 0.5) * 0.25, (rnd() - 0.5) * 0.25, rnd() * 6);
    }
    // ---- кроны-массивы (дальний «лес») ----
    const can = lam("canopy", () => ({ map: rep(canopyTex(), 2, 2) }));
    for (let i = 0; i < 170; i++) {
      const a = rnd() * Math.PI * 2, d = 14 + rnd() * 32;
      const x = Math.cos(a) * d, z = Math.sin(a) * d - 4;
      if (z > 2 && Math.abs(x) < 10) continue;
      const g = new THREE.IcosahedronGeometry(1, 1); g.scale(3 + rnd() * 3, 2 + rnd() * 2, 3 + rnd() * 3);
      b.add(g, can, new THREE.Matrix4().makeTranslation(x, 5 + rnd() * 6, z));
      if (d > 40 && z > 20) continue;
      b.add(beamBetween(V(x, 0, z), V(x, 5, z), 0.35, 0.3), bark);
    }
    // ---- подлесок: банановые листья вокруг поляны ----
    const leafA = lam("leafA", () => ({ map: leafTex("leafA", "#4aa04c", "#2f7a3a"), alphaTest: 0.5, side: THREE.DoubleSide }));
    const leafB = lam("leafB", () => ({ map: leafTex("leafB", "#5ab050", "#3a8a3e"), alphaTest: 0.5, side: THREE.DoubleSide }));
    const leafGeo = (L: number) => { const g = new THREE.PlaneGeometry(L, L * 0.5, 8, 2); g.translate(L / 2, 0, 0); const p = g.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { const x = p.getX(i) / L; p.setZ(i, -0.25 * L * x * x); } g.computeVertexNormals(); return g; };
    const clump = (x: number, z: number, n: number, L: number, y = 0) => {
      for (let k = 0; k < n; k++) {
        const yaw = (k / n) * Math.PI * 2 + rnd(), ll = L * (0.7 + rnd() * 0.5);
        b.add(leafGeo(ll), k % 2 ? leafA : leafB, M(V(x, y + 0.2 + rnd() * 0.5, z), yaw, 0.5 + rnd() * 0.6, (rnd() - 0.5) * 0.6));
      }
    };
    for (let i = 0; i < 46; i++) {
      const a = rnd() * Math.PI * 2, d = 4 + rnd() * 9;
      const x = Math.cos(a) * d, z = Math.sin(a) * d - 6;
      if (z > -2 && Math.abs(x) < 3) continue;
      clump(x, z, 6, 1.6 + rnd() * 1.2);
    }
    // лианы
    const vine = lam("vine", () => ({ color: "#3a6a2a" }));
    for (let i = 0; i < 12; i++) { const x = -6 + rnd() * 12, z = -14 + rnd() * 8; b.add(beamBetween(V(x, 9, z), V(x + (rnd() - 0.5), 2 + rnd() * 3, z), 0.04, 0.03, 6), vine); }
    // камни
    const rock = lam("rockJ", () => ({ color: "#8a8478" }));
    for (let i = 0; i < 8; i++) { const g = new THREE.DodecahedronGeometry(0.4 + rnd() * 0.4, 0); g.scale(1, 0.6, 1); const x = (rnd() < 0.5 ? -1 : 1) * (2.5 + rnd() * 3); b.add(g, rock, new THREE.Matrix4().makeTranslation(x, 0.1, -12 + rnd() * 5)); }
    b.build(R);

    // ---- листва перед объективом (камера пролетает сквозь неё) ----
    const fb = new Batch();
    for (let k = 0; k < 9; k++) fb.add(leafGeo(2.4), k % 2 ? leafA : leafB, M(V(0.9 + (k % 3 - 1) * 0.9, 4.6 + Math.floor(k / 3) * 0.5, 3.2 - (k % 2) * 0.6), Math.PI * 0.5 + k * 0.7, -0.3 + (k % 3) * 0.3, 0.3));
    for (let k = 0; k < 6; k++) fb.add(leafGeo(1.8), leafA, M(V(-1.2 + k * 0.5, 0.4, -2.0 - (k % 2)), -1.2 + k * 0.5, 0.5));
    fb.build(this.fronts); R.add(this.fronts);

    // ---- лучи света в джунглях ----
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2 + (i % 3) * 0.6, 22), new THREE.MeshBasicMaterial({ map: shaftTex(), color: new THREE.Color(1.0, 0.78, 0.5), transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }));
      m.position.set(-4 + i * 1.7, 7, -9 + (i % 2) * 2); m.rotation.set(0, 0.3, -0.45); m.layers.set(NOINK); this.shafts.push(m); R.add(m);
    }

    // ---- лодка ----
    const bb = new Batch();
    const hull = new THREE.Shape();
    hull.moveTo(-3.4, 0.9); hull.lineTo(2.9, 0.9); hull.quadraticCurveTo(3.7, 1.2, 3.9, 1.35); hull.quadraticCurveTo(3.4, 0.2, 2.6, -0.1); hull.lineTo(-3.2, -0.1); hull.lineTo(-3.4, 0.9);
    const hg = new THREE.ExtrudeGeometry(hull, { depth: 2.0, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2 });
    hg.translate(0, 0, -1.0); hg.rotateY(Math.PI / 2);         // нос (+x в профиле) смотрит в -z
    bb.add(hg, lam("boatHull", () => ({ color: "#7a5032" })));
    bb.add(boxGeo(V(-0.85, 0.9, -3.0), V(0.85, 0.96, 3.2)), lam("boatDeck", () => ({ map: rep(planksHD(), 0.6, 1.8) })));
    for (const sx of [-1, 1]) bb.add(boxGeo(V(sx > 0 ? 0.95 : -1.12, 0.9, -3.0), V(sx > 0 ? 1.12 : -0.95, 1.25, 3.3)), lam("boatRail", () => ({ color: "#5a3a22" })));
    for (const z of [-1.6, 0.2, 1.8]) bb.add(boxGeo(V(-1.0, 1.15, z - 0.15), V(1.0, 1.28, z + 0.15)), lam("boatBench", () => ({ color: "#a8784a" })));
    bb.build(this.boat);
    R.add(this.boat);

    // ---- персонажи ----
    this.old = new AnimeCard(R);
    this.young = new AnimeCard(R);
    this.mates = [0, 1, 2].map(() => new AnimeCard(R));
  }

  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, L = LIGHTS.golden, K = LOOK.golden;
    const past = f >= T_FLASH; // 1944 — рассвет над морем
    // камера
    const c = camAt(f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(V(...c.look)); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1600; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    // солнце: относительно направления кадра, заморожено на часть ролика (контровой закат в джунглях / рассвет над морем)
    const fwd = past ? V(0, 0, 1) : V(0, 0, -1);
    const az = THREE.MathUtils.degToRad(past ? 40 : 35), el = THREE.MathUtils.degToRad(past ? 16 : 24);
    const hx = fwd.x * Math.cos(az) - fwd.z * Math.sin(az), hz = fwd.z * Math.cos(az) + fwd.x * Math.sin(az);
    const sunDir = V(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    const focus = past ? V(0, 1, boatZ(f) - 3) : V(...OLD_AT);
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    const Rr = past ? 30 : 22;
    this.sun.position.copy(focus).addScaledVector(sunDir, 200); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 450; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    if (past) { TONE.uLitCol.value.set(1.55, 1.12, 0.78); TONE.uShadeCol.value.set(0.42, 0.4, 0.55); TONE.uShadeLift.value.set(0.04, 0.04, 0.08); }
    else { TONE.uLitCol.value.set(1.6, 1.05, 0.6); TONE.uShadeCol.value.set(0.36, 0.42, 0.36); TONE.uShadeLift.value.set(0.03, 0.05, 0.04); TONE.uTerm.value = 0.25; }
    // небо, туман
    const su = this.skyMat.uniforms;
    const skyC = past ? ["#f6c8a8", "#eab0a0", "#d0a0b0", "#8a90c8", "#4a6ab0"] : K.sky.c;
    skyC.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((d) => THREE.MathUtils.degToRad(d)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(past ? "#f2c4a0" : "#d89a70", this.fog.color); this.fog.near = past ? 60 : 12; this.fog.far = past ? 700 : 70;
    scene.fog = this.fog; scene.background = null;
    for (const m of this.clouds) m.lookAt(cam.position.x, m.position.y, cam.position.z);
    const W = this.WU, wc = K.water;
    untone(past ? "#2a6a9a" : wc.near, W.wNearC.value); untone(past ? "#4a7ab0" : wc.mid, W.wMidC.value); untone(past ? "#e8b8a0" : wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t;
    for (const m of this.shafts) { m.visible = !past; (m.material as THREE.MeshBasicMaterial).opacity = 0.35 + 0.1 * Math.sin(t * 2 + m.position.x); m.lookAt(cam.position.x, m.position.y, cam.position.z); m.rotateZ(-0.45); }
    this.fronts.visible = f < 60;
    // лодка
    const bz = boatZ(f);
    this.boat.position.set(0, -0.95 + 0.08 * Math.sin(t * 2.2), bz);
    this.boat.rotation.set(0.02 * Math.sin(t * 1.7), 0, 0.03 * Math.sin(t * 1.3));
    this.boat.visible = past;

    // ---- персонажи (наш аниме-стиль) ----
    const tint: [number, number, number] = past ? [1.0, 0.93, 0.86] : [1.0, 0.86, 0.74];
    const d = (p: THREE.Vector3) => cam.position.distanceTo(p);
    const px = (p: THREE.Vector3) => Math.round(THREE.MathUtils.clamp(2600 / Math.max(0.5, d(p)), 260, 1500));
    // старый Онода на поляне
    const oldP = V(...OLD_AT);
    if (!past) {
      const turn = clamp01((f - T_TURN + 4) / 8);
      this.old.draw({ id: "old", look: ONODA_OLD, t: f, cap: true, rifle: true, pose: "rifle", legs: { ph: 0, mode: "stand" }, expr: f >= T_TURN ? "determined" : "stern", side: 0.8 * (1 - turn), gaze: [0.9 * (1 - turn), 0], rim: "#ffcf90" }, px(oldP), tint);
      this.old.place(oldP, cam);
    } else this.old.mesh.visible = false;
    // молодой Онода на носу лодки и солдаты
    if (past) {
      this.boat.updateMatrixWorld(true);
      const deckY = this.boat.position.y + 0.96;
      const jumpU = clamp01((f - T_JUMP) / 14);
      const yp = V(0, deckY + Math.sin(jumpU * Math.PI) * 0.6 - (jumpU > 0.6 ? (jumpU - 0.6) * 4.0 : 0), bz - 2.6 - jumpU * 2.4);
      this.young.draw({ id: "young", look: ONODA, t: f, cap: true, legs: { ph: f, mode: jumpU > 0 && jumpU < 1 ? "run" : "stand" }, pose: jumpU > 0 ? "run" : "down", phase: f, expr: "determined", gaze: [0, 0], rim: "#ffe0b8" }, px(yp), tint);
      this.young.place(yp, cam);
      this.young.mesh.visible = jumpU < 0.98;
      [[-0.5, -0.2], [0.55, 0.6], [-0.3, 1.6]].forEach(([x, z], i) => {
        const p = V(x, deckY, bz + z);
        this.mates[i].draw({ id: "m" + i, look: SOLDIERS[i], t: f + i * 9, cap: true, legs: { ph: 0, mode: "stand" }, expr: "stern", gaze: [0, 0.1], rim: "#ffe0b8" }, px(p), tint);
        this.mates[i].place(p, cam, 0.96);
      });
    } else { this.young.mesh.visible = false; this.mates.forEach((m) => (m.mesh.visible = false)); }

    // ---- эффекты: всплеск при прыжке ----
    let fi = 0;
    const st = f - (T_JUMP + 10);
    if (past && st >= 0 && st < 24) {
      const e2 = this.fx(fi++);
      const k = Math.round((st / 24) * 12) / 12;
      e2.r = this.pool.req(`splash|${k}`, 800, 800, 1, (p: Pen) => fxSplash(p, k));
      e2.use(false); e2.mesh.visible = true;
      e2.mesh.position.set(0, -0.35, bz - 5.0); e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.scale.set(2.6, 2.6, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (let i = 0; i < fi; i++) this.fxs[i].bind();
    return past ? V(0, 1.8, bz - 2.6) : V(OLD_AT[0], 1.55, OLD_AT[2]);
  }
}
