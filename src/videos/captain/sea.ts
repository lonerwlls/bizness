// "Imagine you're a sea captain": 10 s style test on the cartoon-3d-short look (skill templates in ../bridge).
// One three.js world: open sea (river shader re-used, drifting toward -z as the ship sails +z), a two-masted ship
// built from two-tone painted parts, islands, clouds, sun; flat cartoon cast as lit cards on the deck.
import * as THREE from "three";
import { Batch, V, lam, boxGeo } from "../bridge/build";
import { rep, ctex, planksHD, beamHD, waterNear, waterFar, cloudHD, grassHD, stoneHD } from "../bridge/paint";
import { Pen, bodyFront, Outfit, Expr, FrontOpts, INK } from "../bridge/toon";
import { LIGHTS, LOOK } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";

export const FPS = 30;
export const TOTAL = 300;
export type V3 = [number, number, number];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- ship geometry (ship space: bow toward +z, waterline y = 0, deck y = DECK) ----------------
export const DECK = 1.9;
const Z0 = -8.5, Z1 = 9.5; // stern .. bow
/** half-width of the deck at z */
const halfW = (z: number) => {
  if (z >= 2) return 2.7 * Math.sqrt(Math.max(0, 1 - ((z - 2) / (Z1 - 2)) ** 2.2));
  return 2.7 - 0.5 * ((2 - z) / (2 - Z0)) ** 2;
};
/** hull cross-section: from deck edge down to the keel, as [x factor, y] */
const SECTION: [number, number][] = [[1.0, DECK + 0.65], [1.0, DECK], [0.97, 1.2], [0.86, 0.35], [0.62, -0.45], [0.3, -0.95], [0.0, -1.1]];
const hullGeo = (yMin: number, yMax: number) => {
  const pos: number[] = [], uv: number[] = [];
  const NZ = 40;
  for (let i = 0; i < NZ; i++) {
    const za = Z0 + ((Z1 - Z0) * i) / NZ, zb = Z0 + ((Z1 - Z0) * (i + 1)) / NZ;
    for (let k = 0; k < SECTION.length - 1; k++) {
      const [fa, ya] = SECTION[k], [fb, yb] = SECTION[k + 1];
      if (Math.max(ya, yb) <= yMin || Math.min(ya, yb) >= yMax) continue;
      const cy = (y: number) => Math.min(yMax, Math.max(yMin, y));
      const y0 = cy(ya), y1 = cy(yb);
      const fa2 = fa + ((fb - fa) * (ya - y0)) / (ya - yb || 1), fb2 = fa + ((fb - fa) * (ya - y1)) / (ya - yb || 1);
      for (const s of [-1, 1]) {
        const A = [s * halfW(za) * fa2, y0, za], B = [s * halfW(zb) * fa2, y0, zb], C = [s * halfW(zb) * fb2, y1, zb], D = [s * halfW(za) * fb2, y1, za];
        const quad = s > 0 ? [A, D, C, A, C, B] : [A, B, C, A, C, D];
        for (const q of quad) pos.push(...q);
        const u0 = za / 2, u1 = zb / 2, v0 = y0 / 2, v1 = y1 / 2;
        const uvs = s > 0 ? [[u0, v0], [u0, v1], [u1, v1], [u0, v0], [u1, v1], [u1, v0]] : [[u0, v0], [u1, v0], [u1, v1], [u0, v0], [u1, v1], [u0, v1]];
        for (const t of uvs) uv.push(...t);
      }
    }
  }
  // stern transom
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
};
const deckGeo = () => {
  const sh = new THREE.Shape(), N = 40;
  for (let i = 0; i <= N; i++) { const z = Z0 + ((Z1 - Z0) * i) / N; if (i) sh.lineTo(halfW(z), z); else sh.moveTo(halfW(z), z); }
  for (let i = N; i >= 0; i--) { const z = Z0 + ((Z1 - Z0) * i) / N; sh.lineTo(-halfW(z), z); }
  const g = new THREE.ShapeGeometry(sh);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getY(i); p.setXYZ(i, x, DECK, z); uv.setXY(i, x / 4, z / 4); n.setXYZ(i, 0, 1, 0); }
  const idx = g.index!; // (x, y) -> (x, z) is a mirror: flip the winding so the deck faces up
  for (let i = 0; i < idx.count; i += 3) { const a = idx.getX(i + 1); idx.setX(i + 1, idx.getX(i + 2)); idx.setX(i + 2, a); }
  return g;
};
const beamBetween = (a: THREE.Vector3, b: THREE.Vector3, r: number, n = 8) => {
  const g = new THREE.CylinderGeometry(r, r, a.distanceTo(b), n);
  g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1)));
  return g;
};
/** billowing sail between two yards: width w, height h, bulge toward +z */
const sailGeo = (w: number, h: number, bulge: number) => {
  const g = new THREE.PlaneGeometry(w, h, 12, 10);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (w / 2), y = p.getY(i) / (h / 2);
    p.setZ(i, bulge * (1 - x * x) * (1 - 0.6 * y * y) - 0.1 * (1 - y));
    p.setX(i, p.getX(i) * (1 - 0.12 * (1 - y) / 2));
  }
  g.computeVertexNormals();
  return g;
};
const sailTex = () => ctex("sailHD", 512, 512, (g, r) => {
  g.fillStyle = "#f4ecd8"; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = "rgba(150,120,80,0.18)"; g.fillRect(x, 0, 3, 512); }
  for (let i = 0; i < 400; i++) { g.fillStyle = r() < 0.5 ? "rgba(180,160,120,0.08)" : "rgba(255,255,255,0.08)"; g.fillRect(r() * 512, r() * 512, 8 + r() * 30, 2); }
  g.fillStyle = "rgba(120,90,60,0.35)"; g.fillRect(0, 0, 512, 10); g.fillRect(0, 502, 512, 10);
});
const hullTex = () => ctex("hullHD", 1024, 512, (g, r) => {
  const rows = 10, h = 512 / rows;
  for (let i = 0; i < rows; i++) {
    const c = 120 + r() * 18;
    g.fillStyle = `rgb(${c + 18},${c * 0.62},${c * 0.38})`; g.fillRect(0, i * h, 1024, h);
    g.fillStyle = "rgba(40,20,10,0.55)"; g.fillRect(0, i * h, 1024, 3);
    for (let k = 0; k < 3; k++) { const x = r() * 1024; g.fillRect(x, i * h, 3, h); }
    for (let k = 0; k < 14; k++) { g.fillStyle = "rgba(70,40,20,0.18)"; g.fillRect(r() * 1024, i * h + r() * h, 40 + r() * 120, 2); }
  }
});
const flagTex = () => ctex("flagCaptain", 256, 160, (g) => {
  g.fillStyle = "#c83a32"; g.fillRect(0, 0, 256, 160);
  g.fillStyle = "#f6efe0"; g.fillRect(0, 60, 256, 40); g.fillRect(100, 0, 40, 160);
});

// ---------------- the cast ----------------
// our hero (orange jacket, white sneakers) playing the captain: captain's cap instead of the beanie
const CAPTAIN: Outfit = { jacket: "#f27a2a", pants: "#26304a", boots: "#f4f1ea", hat: "captain", buttons: "#e8c45a" };
const SAILOR_A: Outfit = { jacket: "#e8eef6", pants: "#2e4a8a", boots: INK, hat: "cap", cap: "#2e4a8a", belt: "#2e4a8a" };
const SAILOR_B: Outfit = { jacket: "#d84a3a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#3a2418" };
const LOOKOUT: Outfit = { jacket: "#f0b030", pants: "#3b5b9a", boots: INK, hat: "cap", cap: "#d8443a", build: "kid" };

// ---------------- shots and cameras ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { id: number; a: number; b: number; cam: (u: number, f: number) => Cam; cInf: number };
// ship-space anchors (converted to world each frame through the ship transform)
const WHEEL: V3 = [0, DECK, -6.2], CAPT: V3 = [0, DECK, -6.9], CREW1: V3 = [-0.55, DECK, 4.2], CREW2: V3 = [0.6, DECK, 4.6];
export const SHOTS: ShotDef[] = [
  // 1 aerial glide over the sea to the ship
  { id: 1, a: 0, b: 52, cInf: 0, cam: (u) => ({ pos: lerp3([34, 22, 40], [20, 11, 24], glide(u)), look: lerp3([0, 3, 4], [0, 4, 0], u), fov: 40, roll: 0 }) },
  // 2 captain at the wheel, proud; push-in
  { id: 2, a: 52, b: 98, cInf: 12, cam: (u) => ({ pos: lerp3([2.9, DECK + 1.9, -4.4], [2.3, DECK + 1.85, -5.0], u), look: [0, DECK + 1.5, -6.9], fov: 34, roll: 0.04 }) },
  // 3 low angle up the full sails, roll
  { id: 3, a: 98, b: 142, cInf: 0, cam: (u) => ({ pos: lerp3([-4.4, DECK + 0.9, -4], [-4.2, DECK + 1.0, -2.5], u), look: [0.2, DECK + 8.5, 2.5], fov: 50, roll: lerp(-0.02, -0.08, u) }) },
  // 4 crew cheering
  { id: 4, a: 142, b: 188, cInf: 10, cam: (u) => ({ pos: lerp3([1.2, DECK + 1.6, 9.8], [1.0, DECK + 1.55, 9.0], u), look: [0, DECK + 1.15, 4.4], fov: 34, roll: 0 }) },
  // 5 bow cutting the waves, camera low over the water
  { id: 5, a: 188, b: 232, cInf: 0, cam: (u) => ({ pos: lerp3([6.5, 0.9, 15.5], [5.2, 1.1, 14.0], u), look: [0, 1.6, 7.5], fov: 46, roll: 0.03 }) },
  // 6 lookout in the crow's nest points ahead, shocked
  { id: 6, a: 232, b: 266, cInf: 9, cam: (u) => ({ pos: lerp3([3.2, DECK + 10.2, -0.6], [2.7, DECK + 10.15, -0.2], u), look: [0.42, DECK + 9.9, 1.35], fov: 36, roll: -0.05 }) },
  // 7 captain close-up, the smile drops; fast punch-in
  { id: 7, a: 266, b: TOTAL, cInf: 14, cam: (u) => ({ pos: lerp3([2.2, DECK + 1.85, -5.6], [1.4, DECK + 1.8, -6.1], glide(u * 1.4)), look: [0, DECK + 1.72, -6.9], fov: 30, roll: 0.05 }) },
];
export const XFADE: Record<number, number> = { 2: 6 };
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};
/** impact kicks: flip sign every frame, decaying over 7 f */
const KICKS = [266];
const kick = (f: number) => {
  for (const k of KICKS) { const d = f - k; if (d >= 0 && d < 7) return (d % 2 ? -1 : 1) * 0.06 * (1 - d / 7); }
  return 0;
};
export const camAt = (id: number, f: number): Cam => {
  const s = SHOTS[id - 1], u = clamp01((f - s.a) / Math.max(1, s.b - s.a));
  const c = s.cam(u, f);
  // creeping push-in toward the look point on every hold (0.25 %/f)
  const k = 0.0025 * Math.max(0, f - s.a);
  return { ...c, pos: lerp3(c.pos, c.look, Math.min(0.25, k * 0.4)), roll: c.roll + kick(f) };
};
export const dofAt = (f: number) => ({ cInf: shotAt(f).cInf });

// ---------------- world ----------------
const WATER_DECL = `#include <common>
varying vec3 vWP;
uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade;
uniform sampler2D wNearTex, wFarTex;
uniform float wTime;`;
const WATER_COL = `
  vec3 wV = vWP - cameraPosition;
  float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0));
  float wf = 1.0 - smoothstep(0.0, 0.42, wDep);
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(0.0, -4.2 * wTime);           // the ship sails +z: the sea drifts past toward -z
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6);
  wc = mix(wc, wCrest, mk.r * 0.75);
  wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf));
  diffuseColor.rgb = wc;`;
const discTex = () => ctex("sunDiscC", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const gullDraw = (flap: number) => (p: Pen) => {
  const c = 150, w = 120, up = 40 * flap;
  p.line([[c - w, c - up], [c - w * 0.45, c - 10 - up * 0.3], [c, c + 12]], "#ffffff", 16);
  p.line([[c, c + 12], [c + w * 0.45, c - 10 - up * 0.3], [c + w, c - up]], "#ffffff", 16);
};

const lightOf = () => LIGHTS.day;
export class SeaWorld {
  root = new THREE.Group();
  ship = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private WU: Record<string, THREE.IUniform>;
  private clouds: THREE.Mesh[] = [];
  private flag: THREE.Mesh;
  private sunCache = new Map<number, THREE.Vector3>();
  private sunDisc: THREE.Sprite;
  private foamMat!: THREE.MeshBasicMaterial;

  constructor() {
    const R = this.root;
    // ---- sky (5 stops by elevation, tone-map inverted) ----
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
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6, 5.2, 3.6), fog: false, depthWrite: false }));
    this.sunDisc.layers.set(NOINK); this.sunDisc.visible = false; R.add(this.sunDisc);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    const cm = [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud));
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + 0.3, d = 560 + (i % 3) * 70;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cm[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 140 + (i % 4) * 34;
      m.position.set(Math.cos(a) * d, 70 + (i % 4) * 34, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK); this.clouds.push(m); R.add(m);
    }
    // ---- sea ----
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
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", WATER_DECL).replace("#include <map_fragment>", WATER_COL)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "sea1";
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400).rotateX(-Math.PI / 2), waterM);
    sea.receiveShadow = true; R.add(sea);
    // ---- islands on the horizon ----
    const ib = new Batch();
    const grass = lam("grassHD", () => ({ map: rep(grassHD(), 30, 30) })), sand = lam("sandC", () => ({ color: "#ead39a" })), rock = lam("rockC", () => ({ map: stoneHD() }));
    for (const [x, z, r, h] of [[-160, 260, 60, 26], [-90, 300, 38, 16], [210, 330, 80, 34], [120, -280, 50, 18]] as [number, number, number, number][]) {
      const hill = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2); hill.scale(r, h, r * 0.7);
      ib.add(hill, grass, new THREE.Matrix4().makeTranslation(x, 0, z));
      const beach = new THREE.CylinderGeometry(r * 1.08, r * 1.12, 1.2, 32); beach.scale(1, 1, 0.7);
      ib.add(beach, sand, new THREE.Matrix4().makeTranslation(x, 0.2, z));
    }
    // lighthouse on the big island
    ib.add(new THREE.CylinderGeometry(2.2, 3.2, 22, 12), lam("lhWhite", () => ({ color: "#f4efe4" })), new THREE.Matrix4().makeTranslation(190, 40, 320));
    ib.add(new THREE.CylinderGeometry(2.3, 2.3, 4, 12), lam("lhRed", () => ({ color: "#c8403a" })), new THREE.Matrix4().makeTranslation(190, 44, 320));
    ib.add(new THREE.ConeGeometry(3, 3.5, 12), rock, new THREE.Matrix4().makeTranslation(190, 52.5, 320));
    ib.build(R);
    // ---- ship ----
    const sb = new Batch();
    const hullW = lam("hullHD", () => ({ map: hullTex() })), hullR = lam("hullRed", () => ({ color: "#7a2a22" })), hullB = lam("hullBand", () => ({ color: "#f0e6c8" }));
    const deck = lam("deckHD", () => ({ map: rep(planksHD(), 1, 1) })), wood = lam("beamC", () => ({ map: beamHD() })), dark = lam("woodDark", () => ({ color: "#5a3a26" }));
    const iron = lam("ironC", () => ({ color: "#33363e" })), rope = lam("rope", () => ({ color: "#c8a878" })), gold = lam("goldC", () => ({ color: "#e8c45a" }));
    sb.add(hullGeo(0.08, DECK + 0.65), hullW);
    sb.add(hullGeo(-1.2, 0.08), hullR);
    sb.add(hullGeo(DECK + 0.1, DECK + 0.25), hullB);
    sb.add(deckGeo(), deck);
    // stern transom + cabin
    sb.add(boxGeo(V(-2.2, DECK, Z0 - 0.05), V(2.2, DECK + 0.9, Z0 + 0.25)), wood);
    sb.add(boxGeo(V(-1.6, DECK, -8.2), V(1.6, DECK + 1.1, -7.4)), wood);
    for (const x of [-1, 0, 1]) sb.add(boxGeo(V(x * 1.0 - 0.25, DECK + 0.45, -7.42), V(x * 1.0 + 0.25, DECK + 0.85, -7.36)), lam("winC", () => ({ color: "#ffd080", emissive: "#ffb050", emissiveIntensity: 0.3 })));
    // rail on the bulwark top
    const N = 34;
    for (const s of [-1, 1]) for (let i = 0; i < N; i++) {
      const za = Z0 + ((Z1 - Z0) * i) / N, zb = Z0 + ((Z1 - Z0) * (i + 1)) / N;
      sb.add(beamBetween(V(s * halfW(za) * 0.98, DECK + 0.68, za), V(s * halfW(zb) * 0.98, DECK + 0.68, zb), 0.06, 6), dark);
      if (i % 2 === 0 && i > 0) sb.add(beamBetween(V(s * halfW(za) * 0.97, DECK + 0.65, za), V(s * halfW(za) * 0.97, DECK + 1.05, za), 0.04, 6), dark);
    }
    for (const s of [-1, 1]) for (let i = 2; i < N - 2; i += 2) {
      const za = Z0 + ((Z1 - Z0) * i) / N, zb = Z0 + ((Z1 - Z0) * (i + 2)) / N;
      sb.add(beamBetween(V(s * halfW(za) * 0.97, DECK + 1.05, za), V(s * halfW(zb) * 0.97, DECK + 1.05, zb), 0.045, 6), dark);
    }
    // cannons through the bulwark
    for (const s of [-1, 1]) for (const z of [-3.5, -1, 1.5, 4]) {
      const x = s * halfW(z);
      sb.add(beamBetween(V(x * 0.8, DECK + 0.45, z), V(x * 1.12, DECK + 0.45, z), 0.13, 10), iron);
      sb.add(boxGeo(V(x * 0.8 - 0.25, DECK, z - 0.3), V(x * 0.8 + 0.25, DECK + 0.3, z + 0.3)), wood);
    }
    // bowsprit + figurehead
    sb.add(beamBetween(V(0, DECK + 0.6, Z1 - 1), V(0, DECK + 2.0, Z1 + 4.2), 0.11), dark);
    sb.add(new THREE.SphereGeometry(0.28, 12, 10), gold, new THREE.Matrix4().makeTranslation(0, DECK + 0.4, Z1 - 0.05));
    // masts, yards, sails, crow's nest, rigging
    const sailM = lam("sail", () => ({ map: sailTex(), side: THREE.DoubleSide }));
    for (const [mz, mh] of [[1.0, 14.5], [-4.0, 12]] as [number, number][]) {
      sb.add(beamBetween(V(0, DECK, mz), V(0, DECK + mh, mz), 0.2, 12), wood);
      const yards: [number, number][] = mz > 0 ? [[3.6, 5.0], [7.3, 4.2], [10.6, 3.2]] : [[3.4, 4.2], [6.8, 3.5], [9.6, 2.6]];
      for (const [yh, yw] of yards) sb.add(beamBetween(V(-yw, DECK + yh, mz + 0.25), V(yw, DECK + yh, mz + 0.25), 0.09, 8), dark);
      for (let k = 0; k < yards.length - 1; k++) {
        const [y0, w0] = yards[k], [y1] = yards[k + 1];
        sb.add(sailGeo(w0 * 1.9, y1 - y0 - 0.15, 0.9), sailM, new THREE.Matrix4().makeTranslation(0, DECK + (y0 + y1) / 2, mz + 0.35));
      }
      const top = yards[yards.length - 1];
      sb.add(sailGeo(top[1] * 1.7, mh - top[0] - 0.8, 0.6), sailM, new THREE.Matrix4().makeTranslation(0, DECK + (top[0] + mh - 0.8) / 2 + 0.1, mz + 0.35));
      // shrouds down to the rails
      for (const s of [-1, 1]) for (const dz of [-1.0, 0, 1.0]) sb.add(beamBetween(V(0.1 * s, DECK + mh * 0.82, mz), V(s * halfW(mz + dz) * 0.98, DECK + 0.7, mz + dz), 0.025, 5), rope);
    }
    // crow's nest on the main mast
    sb.add(new THREE.CylinderGeometry(0.9, 0.75, 0.7, 14, 1, true), lam("nest", () => ({ map: beamHD(), side: THREE.DoubleSide })), new THREE.Matrix4().makeTranslation(0, DECK + 9.25, 1.0));
    sb.add(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 14), wood, new THREE.Matrix4().makeTranslation(0, DECK + 8.92, 1.0));
    // stays bow/stern
    sb.add(beamBetween(V(0, DECK + 14, 1.0), V(0, DECK + 2.0, Z1 + 4.1), 0.03, 5), rope);
    sb.add(beamBetween(V(0, DECK + 11.5, -4), V(0, DECK + 13.5, 1.0), 0.03, 5), rope);
    sb.add(beamBetween(V(0, DECK + 11.5, -4), V(0, DECK + 0.9, Z0 + 0.2), 0.03, 5), rope);
    // ship's wheel on a pedestal
    sb.add(boxGeo(V(-0.18, DECK, WHEEL[2] - 0.18), V(0.18, DECK + 0.75, WHEEL[2] + 0.18)), wood);
    const wc = V(0, DECK + 0.95, WHEEL[2] - 0.22);
    const rim = new THREE.TorusGeometry(0.48, 0.05, 8, 24); sb.add(rim, dark, new THREE.Matrix4().makeTranslation(wc.x, wc.y, wc.z));
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4, d = V(Math.cos(a), Math.sin(a), 0);
      sb.add(beamBetween(wc.clone(), wc.clone().addScaledVector(d, 0.68), 0.03, 6), dark);
      sb.add(new THREE.SphereGeometry(0.05, 8, 6), gold, new THREE.Matrix4().makeTranslation(wc.x + d.x * 0.7, wc.y + d.y * 0.7, wc.z));
    }
    // barrels, crates, coiled rope on deck
    for (const [x, z] of [[1.6, -2.4], [1.9, -1.8], [-1.8, 3.2]]) {
      const g = new THREE.CylinderGeometry(0.32, 0.3, 0.85, 14); sb.add(g, lam("barrelC", () => ({ map: beamHD() })), new THREE.Matrix4().makeTranslation(x, DECK + 0.43, z));
      sb.add(new THREE.TorusGeometry(0.31, 0.03, 6, 16).rotateX(Math.PI / 2), iron, new THREE.Matrix4().makeTranslation(x, DECK + 0.7, z));
    }
    sb.add(boxGeo(V(-2.0, DECK, -3.2), V(-1.4, DECK + 0.6, -2.6)), wood);
    sb.add(new THREE.TorusGeometry(0.3, 0.09, 8, 18).rotateX(Math.PI / 2), rope, new THREE.Matrix4().makeTranslation(-1.2, DECK + 0.09, 5.2));
    sb.build(this.ship);
    // flag at the main mast top (waves per frame)
    // foam: a white wake hugging the waterline + a V bow wave (unlit, no ink), drifting with the sea
    const foamT = ctex("foam", 1024, 128, (g, r) => {
      for (let i = 0; i < 260; i++) { const x = r() * 1024, y = 20 + r() * 88, rr = 6 + r() * 22; g.fillStyle = `rgba(255,255,255,${0.5 + r() * 0.5})`; g.beginPath(); g.ellipse(x, y, rr * 1.8, rr, 0, 0, Math.PI * 2); g.fill(); }
    });
    foamT.wrapS = THREE.RepeatWrapping;
    this.foamMat = new THREE.MeshBasicMaterial({ map: foamT, transparent: true, depthWrite: false, color: new THREE.Color(1.15, 1.15, 1.15), fog: false });
    for (const s of [-1, 1]) {
      const pts: number[] = [], uvs: number[] = [], NF = 30;
      for (let i = 0; i <= NF; i++) {
        const z = Z0 - 6 + ((Z1 + 0.5 - (Z0 - 6)) * i) / NF, w = z > Z0 ? halfW(Math.min(z, Z1)) * 0.86 : halfW(Z0) * 0.86 + (Z0 - z) * 0.35;
        const spread = 0.6 + (z > 6 ? (z - 6) * 0.35 : 0) + (z < Z0 ? (Z0 - z) * 0.3 : 0);
        pts.push(s * w, 0.03, z, s * (w + spread), 0.03, z - (z > 6 ? 0.6 : 0)); uvs.push(i / 6, 0, i / 6, 1);
      }
      const idx: number[] = [];
      for (let i = 0; i < NF; i++) { const a = i * 2; if (s > 0) idx.push(a, a + 1, a + 3, a, a + 3, a + 2); else idx.push(a, a + 3, a + 1, a, a + 2, a + 3); }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx);
      const m = new THREE.Mesh(g, this.foamMat); m.layers.set(NOINK); m.renderOrder = 2; m.material.side = THREE.DoubleSide; R.add(m);
    }
    this.flag = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.0, 12, 1), lam("flagC", () => ({ map: flagTex(), side: THREE.DoubleSide })));
    this.flag.position.set(0, DECK + 15.0, 1.0); this.flag.castShadow = true; this.ship.add(this.flag);
    R.add(this.ship);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  private shotSun(id: number) {
    let v = this.sunCache.get(id);
    if (v) return v;
    const s = SHOTS[id - 1], L = lightOf();
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) { const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(id === 3 ? 140 : L.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  /** ship transform at time t: gentle bob, roll and pitch */
  private poseShip(t: number) {
    this.ship.position.set(0, 0.12 * Math.sin(t * 1.6), 0);
    this.ship.rotation.set(0.018 * Math.sin(t * 1.1 + 0.5), 0, 0.03 * Math.sin(t * 0.9));
    this.ship.updateMatrixWorld(true);
  }
  private toWorld(p: V3) { return V(...p).applyMatrix4(this.ship.matrixWorld); }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, L = lightOf(), K = LOOK.day;
    this.poseShip(t);
    // camera in ship space for deck shots (it rides with the ship), world space for the aerial and the bow
    const c = camAt(id, f), shipCam = id !== 1 && id !== 5;
    const pos = shipCam ? this.toWorld(c.pos) : V(...c.pos), look = shipCam ? this.toWorld(c.look) : V(...c.look);
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    // light rig (camera-relative sun frozen per shot) + two-tone uniforms
    const sunDir = this.shotSun(id), dist = pos.distanceTo(look);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 9, 14, 40);
    const fc = id === 1 ? V(0, 3, 0) : look;
    this.sun.position.copy(fc).addScaledVector(sunDir, 220); this.sun.target.position.copy(fc);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // sky, fog, clouds, sea colours
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = 60; this.fog.far = 700;
    scene.fog = this.fog; scene.background = null;
    for (const m of this.clouds) m.lookAt(cam.position.x, m.position.y, cam.position.z);
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t;
    this.foamMat.map!.offset.x = -t * 0.7;
    // flag waves
    const fp = this.flag.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < fp.count; i++) { const u = (i % 13) / 12, y = i < 13 ? 0.5 : -0.5; fp.setXYZ(i, -0.85 - u * 1.7 + 1.7, y, 0.2 * u * Math.sin(t * 6 - u * 4)); }
    fp.needsUpdate = true;
    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const k = (f + seed * 37) % 64; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
    const people: { p: V3; o: Outfit; fo: FrontOpts; key: string }[] = [];
    const captExpr: Expr = id === 7 ? (f < 270 ? "grin" : "shock") : "grin";
    people.push({ p: CAPT, o: CAPTAIN, key: "capt", fo: { mode: "stand", expr: captExpr, blink: id === 7 && f >= 268 && f < 272 ? 1 : lid(1), seed: 3, wave: id === 2 ? 0.2 : undefined } });
    const cheer = 0.5 + 0.5 * Math.sin(t * 9);
    people.push({ p: CREW1, o: SAILOR_A, key: "s1", fo: { mode: "stand", expr: "laugh", blink: lid(2), seed: 5, wave: cheer, lift: 40 + 30 * cheer } });
    people.push({ p: CREW2, o: SAILOR_B, key: "s2", fo: { mode: "stand", expr: "laugh", blink: lid(3), seed: 2, wave: 1 - cheer, facing: -1 } });
    people.push({ p: [0.42, DECK + 8.96, 1.35], o: LOOKOUT, key: "lk", fo: { mode: "stand", expr: id === 6 && f > 240 ? "shock" : "neutral", blink: lid(4), seed: 6, wave: id === 6 && f > 238 ? 1 : undefined } });
    let ai = 0;
    const used: Actor[] = [];
    for (const pp of people) {
      const w = this.toWorld(pp.p), d = cam.position.distanceTo(w);
      const [cw, ch, k] = d < 4 ? [1800, 3000, 3.0] : d < 9 ? [1080, 1800, 1.8] : d < 20 ? [480, 800, 0.8] : [240, 400, 0.4];
      const fo: FrontOpts = { ...pp.fo, light: L2D };
      const a = this.actor(ai++);
      a.r = this.pool.req(`${pp.key}|${JSON.stringify(fo, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, k, (pen) => bodyFront(pen, pp.o, fo));
      a.mesh.visible = true; a.mesh.position.copy(w);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - w.x, cam.position.z - w.z), 0);
      a.mesh.scale.set(1, 1, 1); a.mesh.castShadow = false;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- effects: bow splashes, gulls ----
    let fi = 0;
    const fused: Fx[] = [];
    const addFx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, at: THREE.Vector3, w: number, h: number, soft = false) => {
      const e = this.fx(fi++);
      e.r = this.pool.req(key, cw, ch, 1, draw); e.use(soft);
      e.mesh.visible = true; e.mesh.position.copy(at); e.mesh.quaternion.copy(cam.quaternion); e.mesh.scale.set(w, h, 1);
      fused.push(e);
    };
    for (let g = 0; g < 4; g++) {
      const flap = Math.round((0.5 + 0.5 * Math.sin(t * 8 + g * 1.7)) * 4) / 4;
      const gp = V(-6 + g * 4 + 3 * Math.sin(t * 0.7 + g), 16 + g * 1.5 + Math.sin(t * 1.3 + g), 4 - g * 3 + t * 1.5);
      addFx(`gull|${flap}`, 300, 300, gullDraw(flap), gp, 1.4, 1.4);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return look;
  }
}
