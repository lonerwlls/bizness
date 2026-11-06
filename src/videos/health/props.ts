// Our own 3D props for "What if everyone had a health bar", in the kitgen / swap style: simple solids, two-tone lit
// lam() materials, painted canvas textures, real-world size, standing on y = 0 unless noted. Shared furniture (bed,
// kitchen, sofa, desks) comes from ../future/props. The health bars and the floating numbers are screen-facing
// labels (the power itself), drawn on canvases.
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex, beamHD } from "../bridge/paint";
import { NOINK } from "../bridge/ink";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r0: number, r1: number, h: number, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
const add = (g: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number], r: [number, number, number] = [0, 0, 0]) => {
  const x = new THREE.Mesh(geo, m); x.position.set(...p); x.rotation.set(...r); x.castShadow = true; x.receiveShadow = true; g.add(x); return x;
};
const M = {
  wood: () => lam("swWood", () => ({ map: beamHD() })),
  woodD: () => lam("swWoodD", () => ({ color: "#6e4a30" })),
  white: () => lam("swWhite", () => ({ color: "#f4f1ea" })),
  steel: () => lam("swSteel", () => ({ color: "#b8bcc6" })),
};

// ---------------- the health bar ----------------
const BW = 512, BH = 120;
const barCol = (v: number, gold: boolean) => (gold ? ["#ffd23a", "#fff1a0"] : v > 60 ? ["#3fc25a", "#9af0a8"] : v > 30 ? ["#f2c230", "#fde88a"] : ["#e8402e", "#ff9a8a"]);
export class HealthBar {
  root: THREE.Mesh;
  private cv = document.createElement("canvas");
  private tex: THREE.CanvasTexture;
  private mat: THREE.MeshBasicMaterial;
  private cur = "";
  constructor() {
    this.cv.width = BW; this.cv.height = BH;
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthWrite: false, fog: false });
    this.root = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62 * BH / BW), this.mat);
    this.root.layers.set(NOINK); this.root.renderOrder = 5;
  }
  /** v = 0..100; gold = the golden, glowing bar */
  draw(v: number, gold = false) {
    const k = `${Math.round(v)}|${gold}`;
    if (k === this.cur) return; this.cur = k;
    const g = this.cv.getContext("2d")!, [c0, c1] = barCol(v, gold);
    g.clearRect(0, 0, BW, BH);
    g.fillStyle = "#241726"; g.beginPath(); g.roundRect(6, 22, BW - 12, BH - 34, 26); g.fill();
    g.fillStyle = "#4a3a4e"; g.beginPath(); g.roundRect(18, 34, BW - 36, BH - 58, 16); g.fill();
    const w = Math.max(0, Math.min(1, v / 100)) * (BW - 36);
    if (w > 2) {
      const gr = g.createLinearGradient(0, 34, 0, BH - 24); gr.addColorStop(0, c1); gr.addColorStop(0.45, c0); gr.addColorStop(1, c0);
      g.fillStyle = gr; g.beginPath(); g.roundRect(18, 34, w, BH - 58, 16); g.fill();
      g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.roundRect(26, 38, Math.max(0, w - 16), 10, 5); g.fill();
    }
    g.font = `900 52px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 10; g.strokeStyle = "#241726"; g.strokeText(`${Math.round(v)}%`, BW / 2, 64); g.fillStyle = "#ffffff"; g.fillText(`${Math.round(v)}%`, BW / 2, 64);
    this.tex.needsUpdate = true;
    this.mat.color.setScalar(gold ? 1.5 : 1.0);
  }
}
/** a floating "+10" / "-5" that rises and fades */
export class Pop {
  root: THREE.Mesh;
  private mat: THREE.MeshBasicMaterial;
  constructor(text: string) {
    const good = text.startsWith("+");
    const t = ctex("pop" + text, 256, 140, (g) => {
      g.font = `900 110px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
      g.lineWidth = 18; g.strokeStyle = "#241726"; g.strokeText(text, 128, 74); g.fillStyle = good ? "#5ae070" : "#ff4a3a"; g.fillText(text, 128, 74);
    });
    this.mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false, fog: false });
    this.root = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34 * 140 / 256), this.mat);
    this.root.layers.set(NOINK); this.root.renderOrder = 6; this.root.visible = false;
  }
  /** k = 0..1 through the pop's life */
  set(k: number) { this.mat.opacity = k < 0.15 ? k / 0.15 : k > 0.7 ? Math.max(0, (1 - k) / 0.3) : 1; }
}

// ---------------- kitchen ----------------
/** coffee mug (8 cm), handle toward +x */
export const mug = (col = "#f4f1ea") => {
  const g = new THREE.Group(), m = lam("hMug" + col, () => ({ color: col }));
  add(g, cyl(0.04, 0.036, 0.095, 18), m, [0, 0.0475, 0]);
  add(g, cyl(0.034, 0.034, 0.004, 18), lam("hCoffee", () => ({ color: "#4a2a18" })), [0, 0.088, 0]);
  const h = add(g, new THREE.TorusGeometry(0.025, 0.008, 6, 14, Math.PI), m, [0.04, 0.05, 0], [0, 0, -Math.PI / 2]); h.castShadow = false;
  return g;
};
/** kitchen table 1.2 x 0.8, top at 0.76 */
export const table = () => {
  const g = new THREE.Group();
  add(g, box(1.2, 0.05, 0.8), M.wood(), [0, 0.735, 0]);
  for (const [x, z] of [[-0.54, -0.34], [0.54, -0.34], [-0.54, 0.34], [0.54, 0.34]]) add(g, box(0.06, 0.71, 0.06), M.woodD(), [x, 0.355, z]);
  return g;
};
/** chair, seat 0.45, back toward -z */
export const chair = () => {
  const g = new THREE.Group(), w = M.wood(), d = M.woodD();
  add(g, box(0.44, 0.04, 0.42), w, [0, 0.43, 0]);
  for (const [x, z] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) add(g, box(0.04, 0.41, 0.04), d, [x, 0.205, z]);
  add(g, box(0.44, 0.4, 0.04), w, [0, 0.7, -0.2]);
  return g;
};

// ---------------- cafeteria ----------------
/** long table (2.6 x 0.8, top 0.74) with a bench on each long side (seat 0.45, 0.62 m out) */
export const cafeTable = () => {
  const g = new THREE.Group(), top = lam("hCafeTop", () => ({ color: "#e8e0d0" })), leg = lam("hCafeLeg", () => ({ color: "#5a6a8a" })), bench = lam("hBench", () => ({ color: "#3f8ab5" }));
  add(g, box(2.6, 0.04, 0.8), top, [0, 0.72, 0]);
  for (const x of [-1.1, 1.1]) add(g, box(0.06, 0.7, 0.5), leg, [x, 0.35, 0]);
  for (const s of [-1, 1]) {
    add(g, box(2.6, 0.04, 0.3), bench, [0, 0.43, s * 0.62]);
    for (const x of [-1.1, 1.1]) add(g, box(0.05, 0.41, 0.2), leg, [x, 0.205, s * 0.62]);
  }
  return g;
};
/** lunch tray with a plate, an apple and a carton of milk, sitting on y = 0 */
export const tray = (col = "#e86a5a") => {
  const g = new THREE.Group();
  add(g, box(0.42, 0.015, 0.3), lam("hTray" + col, () => ({ color: col })), [0, 0.008, 0]);
  add(g, cyl(0.1, 0.09, 0.02, 24), M.white(), [-0.07, 0.025, 0]);
  add(g, new THREE.SphereGeometry(0.035, 12, 8), lam("hPeas", () => ({ color: "#6cb848" })), [-0.09, 0.04, 0.02]);
  add(g, box(0.06, 0.1, 0.06), M.white(), [0.14, 0.065, -0.07]);
  add(g, new THREE.SphereGeometry(0.035, 14, 10), lam("hApple", () => ({ color: "#d8302a" })), [0.13, 0.05, 0.07]);
  return g;
};
/** red carton of fries (9 cm wide), sitting on y = 0 */
export const fries = () => {
  const g = new THREE.Group(), red = lam("hFryBox", () => ({ color: "#d8302a" })), gold = lam("hFry", () => ({ color: "#f4c430" }));
  add(g, cyl(0.05, 0.035, 0.1, 4), red, [0, 0.05, 0], [0, Math.PI / 4, 0]);
  for (let k = 0; k < 9; k++) { const x = (k % 3 - 1) * 0.018, z = (Math.floor(k / 3) - 1) * 0.014; add(g, box(0.01, 0.09 + (k % 4) * 0.01, 0.01), gold, [x, 0.12 + (k % 2) * 0.008, z], [((k % 3) - 1) * 0.15, 0, ((k * 7) % 5 - 2) * 0.06]); }
  return g;
};
/** serving counter 3 m long with a glass sneeze guard, front toward +z */
export const counter = () => {
  const g = new THREE.Group();
  add(g, box(3.0, 0.9, 0.7), lam("hCounter", () => ({ color: "#7ab8a8" })), [0, 0.45, 0]);
  add(g, box(3.04, 0.04, 0.74), M.steel(), [0, 0.92, 0]);
  for (let k = 0; k < 4; k++) add(g, box(0.6, 0.06, 0.4), lam("hFood" + k, () => ({ color: ["#f4c430", "#c86a3a", "#6cb848", "#f2a0b8"][k] })), [-1.05 + k * 0.7, 0.96, -0.05]);
  add(g, box(3.0, 0.02, 0.3), lam("hGlass", () => ({ color: "#cfe6f2" })), [0, 1.35, 0.1], [0.5, 0, 0]);
  return g;
};
const boardTex = () => ctex("mondayBoard", 1024, 420, (g, r) => {
  g.fillStyle = "#2e5a46"; g.fillRect(0, 0, 1024, 420);
  for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(255,255,255,0.04)"; g.fillRect(r() * 1024, r() * 420, 30, 4); }
  g.fillStyle = "#f4f4ec"; g.textAlign = "left"; g.font = `700 92px "DejaVu Sans", sans-serif`; g.fillText("Monday", 60, 120);
  g.font = `600 46px "DejaVu Sans", sans-serif`;
  ["Lesson 12: Fractions", "1/2 + 1/4 = ?", "Homework: p. 47"].forEach((s, k) => g.fillText(s, 80, 210 + k * 64));
  g.strokeStyle = "#8a6a44"; g.lineWidth = 24; g.strokeRect(0, 0, 1024, 420);
});
export const blackboard = () => {
  const g = new THREE.Group();
  add(g, box(3.2, 1.3, 0.04), lam("hBoard", () => ({ map: boardTex() })), [0, 1.55, 0]);
  add(g, box(3.0, 0.04, 0.1), M.woodD(), [0, 0.88, 0.05]);
  return g;
};
