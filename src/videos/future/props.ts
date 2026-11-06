// Our own 3D props for "What if your phone predicted your future", in the kitgen / swap style: simple solids,
// two-tone lit lam() materials, painted canvas textures, real-world size, standing on y = 0 unless noted.
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex, beamHD } from "../bridge/paint";

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
  dark: () => lam("fuDark", () => ({ color: "#2a2c36" })),
  red: () => lam("swRed", () => ({ color: "#c83a32" })),
};

// ---------------- the phone with a live lock screen ----------------
export type Screen = { key: string; msg?: string; big?: string; note?: string; time?: string; check?: boolean };
const SW = 360, SH = 740;
const wrap = (g: CanvasRenderingContext2D, s: string, x: number, y: number, maxW: number, lh: number) => {
  let line = "", yy = y;
  for (const w of s.split(" ")) { if (line && g.measureText(line + w).width > maxW) { g.fillText(line.trim(), x, yy); yy += lh; line = ""; } line += w + " "; }
  g.fillText(line.trim(), x, yy); return yy;
};
const drawScreen = (g: CanvasRenderingContext2D, s: Screen) => {
  const gr = g.createLinearGradient(0, 0, 0, SH); gr.addColorStop(0, "#3a2a7a"); gr.addColorStop(1, "#1a6a9a");
  g.fillStyle = gr; g.fillRect(0, 0, SW, SH);
  if (s.key === "off") { g.fillStyle = "#101218"; g.fillRect(0, 0, SW, SH); return; }
  g.fillStyle = "#ffffff"; g.textAlign = "center"; g.font = `700 92px "DejaVu Sans", sans-serif`; g.fillText(s.time ?? "7:00", SW / 2, 130);
  if (!s.msg) return;
  // notification card
  const y0 = 190;
  g.fillStyle = "rgba(250,248,255,0.95)"; g.beginPath(); g.roundRect(16, y0, SW - 32, s.check ? 340 : 300, 30); g.fill();
  // app icon: a little crystal ball
  g.fillStyle = "#7b5ac9"; g.beginPath(); g.arc(58, y0 + 46, 24, 0, 7); g.fill();
  g.fillStyle = "#d8c8ff"; g.beginPath(); g.arc(51, y0 + 39, 7, 0, 7); g.fill();
  g.fillStyle = "#f0b030"; g.fillRect(40, y0 + 66, 36, 8);
  g.textAlign = "left"; g.fillStyle = "#6a5a9a"; g.font = `700 24px "DejaVu Sans", sans-serif`; g.fillText("FUTURE  ·  now", 94, y0 + 54);
  g.fillStyle = "#1a1830"; g.font = `800 38px "DejaVu Sans", sans-serif`;
  const yl = wrap(g, s.msg, 36, y0 + 124, SW - 72, 46);
  if (s.check) { g.fillStyle = "#3f9a5a"; g.font = `800 30px "DejaVu Sans", sans-serif`; g.fillText("✓ came true", 36, yl + 48); }
  if (s.big) {
    g.textAlign = "center"; g.fillStyle = "#ffd84a"; g.font = `900 190px "DejaVu Sans", sans-serif`;
    g.strokeStyle = "#241726"; g.lineWidth = 14; g.strokeText(s.big, SW / 2, 690); g.fillText(s.big, SW / 2, 690);
  }
  if (s.note) { g.textAlign = "center"; g.fillStyle = "#ffffff"; g.font = `800 34px "DejaVu Sans", sans-serif`; g.fillText(s.note, SW / 2, 560); }
};
export class Phone {
  root = new THREE.Group();
  private cv = document.createElement("canvas");
  private tex: THREE.CanvasTexture;
  private cur = "";
  private glow: THREE.MeshBasicMaterial;
  constructor() {
    this.cv.width = SW; this.cv.height = SH;
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
    add(this.root, box(0.075, 0.155, 0.009), M.dark(), [0, 0, 0]);
    this.glow = new THREE.MeshBasicMaterial({ map: this.tex, color: new THREE.Color(1.1, 1.1, 1.1) });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.142), this.glow); s.position.z = 0.0048; this.root.add(s);
    add(this.root, box(0.016, 0.004, 0.002), lam("fuCam", () => ({ color: "#14161e" })), [0, 0.072, 0.0052]);
  }
  show(s: Screen) {
    const k = JSON.stringify(s);
    if (k === this.cur) return; this.cur = k;
    drawScreen(this.cv.getContext("2d")!, s); this.tex.needsUpdate = true;
    this.glow.color.setScalar(s.key === "off" ? 1 : 1.1);
  }
}

// ---------------- bedroom ----------------
const quiltTex = () => ctex("quiltBlue", 512, 512, (g) => {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? "#3f7ac0" : "#6aa0dc"; g.fillRect(x * 64, y * 64, 64, 64); }
  g.strokeStyle = "rgba(20,40,90,0.4)"; g.lineWidth = 3; for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(k * 64, 0); g.lineTo(k * 64, 512); g.moveTo(0, k * 64); g.lineTo(512, k * 64); g.stroke(); }
});
/** bed 1.0 x 2.0 m, headboard at -z, mattress top at y = 0.5 */
export const bed = () => {
  const g = new THREE.Group();
  add(g, box(1.1, 0.3, 2.1), M.wood(), [0, 0.2, 0]);
  for (const [x, z] of [[-0.5, -1.0], [0.5, -1.0], [-0.5, 1.0], [0.5, 1.0]]) add(g, box(0.08, 0.1, 0.08), M.woodD(), [x, 0.05, z]);
  add(g, box(1.0, 0.15, 2.0), M.white(), [0, 0.425, 0]);
  add(g, box(1.16, 1.0, 0.08), M.wood(), [0, 0.5, -1.06]);
  add(g, box(0.7, 0.06, 0.38), lam("swPillow", () => ({ color: "#fbf8f0" })), [0, 0.53, -0.78]);
  return g;
};
/** the quilt over a sleeper: covers z0..z1 (bed coords), hangs over the sides */
export const quilt = (z0: number, z1: number) => {
  const g = new THREE.Group(), m = lam("fuQuilt", () => ({ map: quiltTex() }));
  add(g, box(1.06, 0.05, z1 - z0), m, [0, 0.62, (z0 + z1) / 2]);
  for (const s of [-1, 1]) add(g, box(0.04, 0.25, z1 - z0), m, [s * 0.53, 0.5, (z0 + z1) / 2]);
  return g;
};
export const nightstand = () => {
  const g = new THREE.Group();
  add(g, box(0.5, 0.55, 0.42), M.wood(), [0, 0.275, 0]);
  add(g, box(0.4, 0.14, 0.02), M.woodD(), [0, 0.38, 0.215]);
  return g;
};
const clockTex = () => ctex("alarmFace7", 256, 256, (g) => {
  const c = 128; g.fillStyle = "#c83a32"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#fbf5e4"; g.strokeStyle = "#241726"; g.lineWidth = 10; g.beginPath(); g.arc(c, c, 110, 0, 7); g.fill(); g.stroke();
  g.lineCap = "round"; for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; g.lineWidth = 7; g.beginPath(); g.moveTo(c + 82 * Math.sin(a), c - 82 * Math.cos(a)); g.lineTo(c + 98 * Math.sin(a), c - 98 * Math.cos(a)); g.stroke(); }
  g.lineWidth = 12; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 55 * Math.sin((7 * Math.PI) / 6 * 1.714), c - 55 * Math.cos((7 * Math.PI) / 6 * 1.714)); g.stroke();
  g.lineWidth = 8; g.beginPath(); g.moveTo(c, c); g.lineTo(c - 8, c - 88); g.stroke();
});
/** twin-bell alarm clock showing 6:59, face toward +z */
export const alarmClock = () => {
  const g = new THREE.Group(), red = M.red();
  add(g, cyl(0.07, 0.07, 0.05, 24), red, [0, 0.09, 0], [Math.PI / 2, 0, 0]);
  add(g, new THREE.CircleGeometry(0.062, 24), lam("fuAlarmFace", () => ({ map: clockTex() })), [0, 0.09, 0.0255]);
  for (const s of [-1, 1]) { add(g, new THREE.SphereGeometry(0.035, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.steel(), [s * 0.045, 0.155, 0], [0, 0, -s * 0.5]); add(g, cyl(0.006, 0.006, 0.05, 6), M.steel(), [s * 0.05, 0.025, 0.01], [0, 0, s * 0.4]); }
  return g;
};
/** a door frame (opening 0.9 x 2.0 m) in a wall segment, the wall along x, opening centred on x = 0 */
export const doorWall = (len: number, h: number, wallMat: THREE.Material) => {
  const g = new THREE.Group(), half = len / 2, ow = 0.45, oh = 2.0;
  add(g, box(half - ow, h, 0.12), wallMat, [-(ow + (half - ow) / 2), h / 2, 0]);
  add(g, box(half - ow, h, 0.12), wallMat, [ow + (half - ow) / 2, h / 2, 0]);
  add(g, box(2 * ow, h - oh, 0.12), wallMat, [0, oh + (h - oh) / 2, 0]);
  const trim = M.woodD();
  add(g, box(0.08, oh, 0.16), trim, [-ow - 0.04, oh / 2, 0]); add(g, box(0.08, oh, 0.16), trim, [ow + 0.04, oh / 2, 0]);
  add(g, box(2 * ow + 0.16, 0.08, 0.16), trim, [0, oh + 0.04, 0]);
  return g;
};

// ---------------- kitchen ----------------
/** counter run 2.4 m along x (back toward -z), stove in the middle with a pan of eggs; top at 0.9 */
export const kitchen = () => {
  const g = new THREE.Group(), cab = lam("fuCab", () => ({ color: "#7ab8a8" })), top = lam("fuTop", () => ({ color: "#efe8da" }));
  add(g, box(2.4, 0.86, 0.6), cab, [0, 0.43, 0]);
  add(g, box(2.46, 0.04, 0.64), top, [0, 0.88, 0.01]);
  for (let k = 0; k < 4; k++) { add(g, box(0.54, 0.7, 0.02), lam("fuCabD", () => ({ color: "#6aa898" })), [-0.9 + k * 0.6, 0.45, 0.305]); add(g, box(0.12, 0.02, 0.02), M.steel(), [-0.9 + k * 0.6, 0.72, 0.32]); }
  add(g, box(0.6, 0.02, 0.5), lam("fuHob", () => ({ color: "#26262c" })), [0, 0.91, 0]);
  for (const [x, z] of [[-0.14, -0.1], [0.14, -0.1], [-0.14, 0.12], [0.14, 0.12]]) add(g, cyl(0.08, 0.08, 0.006, 20), lam("fuRing", () => ({ color: "#4a4a54" })), [x, 0.923, z]);
  // pan with two fried eggs
  add(g, cyl(0.13, 0.11, 0.05, 24), M.dark(), [0.14, 0.95, 0.12]);
  add(g, box(0.22, 0.02, 0.03), M.dark(), [0.38, 0.965, 0.12]);
  for (const dx of [-0.04, 0.05]) { add(g, cyl(0.045, 0.045, 0.01, 16), M.white(), [0.14 + dx, 0.978, 0.12]); add(g, new THREE.SphereGeometry(0.018, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam("fuYolk", () => ({ color: "#f4b020" })), [0.14 + dx, 0.982, 0.12]); }
  // upper cabinets and a hood
  add(g, box(2.4, 0.7, 0.35), cab, [0, 1.95, -0.12]);
  add(g, box(0.7, 0.25, 0.5), M.steel(), [0, 1.5, -0.05]);
  return g;
};

// ---------------- living room ----------------
/** three-seat sofa facing +z, seat top at 0.45, 2.1 m wide */
export const SEAT = 0.45;
export const sofa = () => {
  const g = new THREE.Group(), c = lam("fuSofa", () => ({ color: "#d8604a" })), d = lam("fuSofaD", () => ({ color: "#b84a3a" }));
  add(g, box(2.1, 0.3, 0.8), d, [0, 0.2, 0]);
  for (const x of [-0.66, 0, 0.66]) add(g, box(0.64, 0.12, 0.72), c, [x, 0.4, 0.03]);
  add(g, box(2.1, 0.55, 0.22), d, [0, 0.7, -0.3]);
  for (const x of [-0.66, 0, 0.66]) add(g, box(0.62, 0.42, 0.12), c, [x, 0.72, -0.15]);
  for (const s of [-1, 1]) add(g, box(0.18, 0.62, 0.8), d, [s * 1.14, 0.31, 0]);
  for (const s of [-1, 1]) add(g, cyl(0.03, 0.025, 0.06, 8), M.woodD(), [s * 1.0, 0.03, 0.3]);
  return g;
};
const tvTex = () => ctex("tvMovie", 512, 300, (g) => {
  // a mystery movie: a mansion on a hill at night, one lit window, the moon, a small dog on the lawn
  const gr = g.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, "#1a1a4a"); gr.addColorStop(1, "#4a3a7a"); g.fillStyle = gr; g.fillRect(0, 0, 512, 300);
  g.fillStyle = "#f4f0d0"; g.beginPath(); g.arc(410, 70, 34, 0, 7); g.fill();
  g.fillStyle = "#14122a"; g.beginPath(); g.moveTo(0, 300); g.quadraticCurveTo(256, 180, 512, 300); g.fill();
  g.fillRect(150, 110, 200, 110); g.beginPath(); g.moveTo(140, 112); g.lineTo(250, 50); g.lineTo(360, 112); g.fill(); g.fillRect(300, 60, 26, 50);
  g.fillStyle = "#ffd060"; g.fillRect(232, 140, 28, 36);
  g.fillStyle = "#14122a"; g.beginPath(); g.ellipse(110, 250, 30, 14, 0, 0, 7); g.fill(); g.beginPath(); g.arc(140, 236, 12, 0, 7); g.fill(); g.fillRect(88, 256, 6, 18); g.fillRect(124, 256, 6, 18);
  g.fillStyle = "#ff4a4a"; g.beginPath(); g.arc(144, 234, 3, 0, 7); g.fill();
});
/** TV (1.3 x 0.76 screen) on a low cabinet, screen toward +z; returns the screen material for the glow */
export const tv = () => {
  const g = new THREE.Group();
  add(g, box(1.6, 0.5, 0.45), M.wood(), [0, 0.25, 0]);
  add(g, box(1.4, 0.84, 0.06), M.dark(), [0, 1.0, -0.05]);
  add(g, box(0.3, 0.04, 0.2), M.dark(), [0, 0.52, -0.05]); add(g, box(0.06, 0.1, 0.04), M.dark(), [0, 0.58, -0.05]);
  const scr = new THREE.MeshBasicMaterial({ map: tvTex(), color: new THREE.Color(1.3, 1.3, 1.3), polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.76), scr); s.position.set(0, 1.0, -0.01);
  return { g, s, scr };
};
export const coffeeTable = () => {
  const g = new THREE.Group();
  add(g, box(1.0, 0.05, 0.6), M.wood(), [0, 0.42, 0]);
  for (const [x, z] of [[-0.44, -0.24], [0.44, -0.24], [-0.44, 0.24], [0.44, 0.24]]) add(g, box(0.05, 0.4, 0.05), M.woodD(), [x, 0.2, z]);
  return g;
};
/** birthday cake with candles (flames are glowing), sits on y = 0 */
export const cake = () => {
  const g = new THREE.Group();
  add(g, cyl(0.2, 0.2, 0.015, 28), M.white(), [0, 0.008, 0]);
  add(g, cyl(0.16, 0.16, 0.1, 28), lam("fuCakeP", () => ({ color: "#f2a0b8" })), [0, 0.065, 0]);
  add(g, cyl(0.163, 0.163, 0.02, 28), M.white(), [0, 0.11, 0]);
  add(g, cyl(0.11, 0.11, 0.07, 24), lam("fuCakeP", () => ({ color: "#f2a0b8" })), [0, 0.155, 0]);
  add(g, cyl(0.113, 0.113, 0.015, 24), M.white(), [0, 0.19, 0]);
  const fl = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.6) });
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2, x = 0.06 * Math.cos(a), z = 0.06 * Math.sin(a);
    add(g, cyl(0.006, 0.006, 0.06, 8), lam("fuCandle" + (k % 3), () => ({ color: ["#5aa0e8", "#f4c430", "#7ac06a"][k % 3] })), [x, 0.23, z]);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), fl); f.scale.set(1, 1.8, 1); f.position.set(x, 0.272, z); g.add(f);
  }
  return g;
};
/** a red kid's bike with a big bow on the handlebar, along x (front wheel at +x), wheels touch y = 0 */
export const bike = () => {
  const g = new THREE.Group(), red = lam("fuBike", () => ({ color: "#e0402e" })), tyre = lam("fuTyre", () => ({ color: "#22222a" }));
  for (const x of [-0.42, 0.42]) {
    add(g, new THREE.TorusGeometry(0.27, 0.03, 8, 28), tyre, [x, 0.3, 0]);
    add(g, cyl(0.03, 0.03, 0.06, 10), M.steel(), [x, 0.3, 0], [Math.PI / 2, 0, 0]);
    for (let k = 0; k < 6; k++) add(g, cyl(0.004, 0.004, 0.5, 4), M.steel(), [x, 0.3, 0], [0, 0, (k * Math.PI) / 6]);
  }
  const bar = (a: [number, number], b: [number, number], r = 0.022) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    add(g, cyl(r, r, L, 10), red, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0], [0, 0, Math.atan2(dx, dy) * -1]);
  };
  bar([-0.42, 0.3], [-0.08, 0.3]); bar([-0.08, 0.3], [-0.16, 0.66]); bar([-0.16, 0.6], [0.3, 0.62]); bar([-0.08, 0.3], [0.3, 0.6]); bar([-0.42, 0.3], [-0.16, 0.6]);
  bar([0.3, 0.62], [0.42, 0.3]); bar([0.3, 0.62], [0.27, 0.8], 0.018);
  add(g, box(0.05, 0.03, 0.46), M.dark(), [0.27, 0.81, 0]);
  add(g, box(0.22, 0.05, 0.1), M.dark(), [-0.17, 0.69, 0]);
  add(g, cyl(0.06, 0.06, 0.03, 16), M.dark(), [-0.08, 0.3, 0.04], [Math.PI / 2, 0, 0]);
  // the bow
  const bow = lam("fuBow", () => ({ color: "#f4c430" }));
  for (const s of [-1, 1]) { const l = add(g, new THREE.TorusGeometry(0.07, 0.022, 8, 18), bow, [0.27, 0.9, s * 0.07], [0, Math.PI / 2, s * 0.5]); l.scale.set(1, 0.7, 1); }
  add(g, new THREE.SphereGeometry(0.03, 10, 8), bow, [0.27, 0.9, 0]);
  for (const s of [-1, 1]) add(g, box(0.03, 0.14, 0.04), bow, [0.27, 0.8, s * 0.05], [s * 0.4, 0, 0]);
  return g;
};

// ---------------- street ----------------
/** a pink chewing-gum splat; strand = 0..1 stretches a string up to a lifted sole */
export const gum = () => {
  const g = new THREE.Group(), pink = lam("fuGum", () => ({ color: "#f27aa8" }));
  const b = add(g, new THREE.SphereGeometry(0.05, 14, 8), pink, [0, 0.008, 0]); b.scale.set(1.2, 0.18, 0.9);
  const s = add(g, cyl(0.008, 0.014, 1, 8), pink, [0, 0.5, 0]); s.name = "strand";
  return g;
};

// ---------------- classroom ----------------
const boardTex = () => ctex("popQuiz", 1024, 420, (g, r) => {
  g.fillStyle = "#2e5a46"; g.fillRect(0, 0, 1024, 420);
  for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(255,255,255,0.04)"; g.fillRect(r() * 1024, r() * 420, 30, 4); }
  g.fillStyle = "#f4f4ec"; g.font = `700 104px "DejaVu Sans", sans-serif`; g.textAlign = "left"; g.fillText("POP QUIZ!", 60, 125);
  g.font = `600 46px "DejaVu Sans", sans-serif`;
  ["1.  7 x 8 = ?", "2.  Capital of Peru?", "3.  What is H\u2082O?", "4.  A    B    C    D"].forEach((s, k) => g.fillText(s, 90, 195 + k * 56));
  g.strokeStyle = "#8a6a44"; g.lineWidth = 24; g.strokeRect(0, 0, 1024, 420);
});
export const blackboard = () => {
  const g = new THREE.Group();
  add(g, box(3.2, 1.3, 0.04), lam("fuBoard", () => ({ map: boardTex() })), [0, 1.55, 0]);
  add(g, box(3.0, 0.04, 0.1), M.woodD(), [0, 0.88, 0.05]);
  return g;
};
/** school desk (top 0.72) with a chair behind it (seat 0.45 at z + 0.45); the pupil faces -z */
export const deskChair = () => {
  const g = new THREE.Group(), top = lam("fuDesk", () => ({ color: "#e0c08a" })), frame = lam("fuDeskF", () => ({ color: "#4a6a9a" }));
  add(g, box(0.7, 0.04, 0.48), top, [0, 0.72, 0]);
  for (const [x, z] of [[-0.31, -0.2], [0.31, -0.2], [-0.31, 0.2], [0.31, 0.2]]) add(g, box(0.035, 0.7, 0.035), frame, [x, 0.35, z]);
  add(g, box(0.62, 0.3, 0.02), frame, [0, 0.52, -0.2]);
  add(g, box(0.2, 0.012, 0.28), M.white(), [0.08, 0.746, 0.02], [0, 0.2, 0]);
  add(g, box(0.42, 0.03, 0.4), top, [0, SEAT - 0.015, 0.5]);
  for (const [x, z] of [[-0.18, 0.33], [0.18, 0.33], [-0.18, 0.67], [0.18, 0.67]]) add(g, box(0.03, SEAT - 0.03, 0.03), frame, [x, (SEAT - 0.03) / 2, z]);
  add(g, box(0.42, 0.3, 0.03), top, [0, SEAT + 0.32, 0.7]);
  for (const x of [-0.18, 0.18]) add(g, box(0.03, 0.34, 0.03), frame, [x, SEAT + 0.15, 0.7]);
  return g;
};
export const teacherDesk = () => {
  const g = new THREE.Group();
  add(g, box(1.3, 0.05, 0.65), M.wood(), [0, 0.75, 0]);
  add(g, box(1.26, 0.6, 0.04), M.woodD(), [0, 0.42, 0.3]);
  for (const s of [-1, 1]) add(g, box(0.05, 0.73, 0.6), M.woodD(), [s * 0.62, 0.365, 0]);
  add(g, box(0.25, 0.08, 0.32), lam("fuBooks", () => ({ color: "#3f6fb5" })), [-0.3, 0.815, 0]);
  add(g, new THREE.SphereGeometry(0.06, 14, 10), lam("fuApple", () => ({ color: "#d8302a" })), [0.35, 0.83, 0.05]);
  return g;
};
