// «Как самолёт весом 400 тонн держится в воздухе?» — 11-секундная проба в стиле cartoon-3d-short.
// Один three.js-мир: аэропорт (перрон, полоса, терминал, вышка, ангары, лес), широкофюзеляжный лайнер из
// своих форм (фюзеляж-«лофт» с нарисованной ливреей, стреловидные крылья с профилем, 4 двигателя, шасси),
// облака на высоте. Наш герой — плоская карточка (bodyFront), потоки воздуха — нарисованные Fx-карточки.
import * as THREE from "three";
import { Batch, V, lam, boxGeo } from "../bridge/build";
import { rep, ctex, grassHD, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, Outfit, Expr, FrontOpts, INK } from "../bridge/toon";
import { LIGHTS, LOOK } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { VOICE_ENV } from "./voice";

export const FPS = 30;
export const TOTAL = 345;
export type V3 = [number, number, number];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const ease = (u: number) => { const x = clamp01(u); return x * x * (3 - 2 * x); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- the airliner (plane space: nose +z, ground y = 0, gear down) ----------------
const FY = 6.4, FR = 3.2, ZT = -34, ZN = 34; // fuselage centre height, radius, tail .. nose
const fus = (z: number): [number, number] => { // [radius, centre y]
  if (z > 25) { const k = (z - 25) / (ZN - 25); return [FR * Math.sqrt(Math.max(0, 1 - k ** 2.2)), FY - 0.9 * k * k]; }
  if (z < -16) { const k = (-16 - z) / (-16 - ZT); const r = FR * (1 - 0.8 * k ** 1.25); return [r, FY + (FR - r) * 0.85]; }
  return [FR, FY];
};
const fuselageGeo = () => {
  const NA = 64, NZ = 110, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= NZ; j++) {
    const z = ZT + ((ZN - ZT) * j) / NZ, [r, yc] = fus(z);
    for (let i = 0; i <= NA; i++) {
      const th = (i / NA) * Math.PI * 2;
      pos.push(r * Math.sin(th), yc + r * Math.cos(th), z); uv.push(j / NZ, 1 - i / NA);
    }
  }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NA; i++) {
    const a = j * (NA + 1) + i, b = a + 1, c = a + NA + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
// livery: canvas x = along the body (tail -> nose), canvas y = angle around (top at 0, +x side at 1/4, belly 1/2)
const LW = 4096, LH = 1024;
const liveryTex = () => ctex("planeLivery", LW, LH, (g, r) => {
  const X = (z: number) => ((z - ZT) / (ZN - ZT)) * LW, Y = (th: number) => (th / (Math.PI * 2)) * LH;
  g.fillStyle = "#f7f6f2"; g.fillRect(0, 0, LW, LH);
  // belly light grey
  g.fillStyle = "#d9dde4"; g.fillRect(0, Y(Math.PI - 0.85), LW, Y(1.7));
  for (const s of [1, -1]) {
    const side = (th: number) => (s > 0 ? th : Math.PI * 2 - th);
    // orange cheatline + thin navy line under it
    const y0 = Y(side(Math.PI / 2 + 0.04)), y1 = Y(side(Math.PI / 2 + 0.24));
    g.fillStyle = "#f27a2a"; g.fillRect(X(-14), Math.min(y0, y1), X(27) - X(-14), Math.abs(y1 - y0));
    const y2 = Y(side(Math.PI / 2 + 0.28)), y3 = Y(side(Math.PI / 2 + 0.33));
    g.fillStyle = "#2c3552"; g.fillRect(X(-14), Math.min(y2, y3), X(25.5) - X(-14), Math.abs(y3 - y2));
    // passenger windows
    const wy = Y(side(Math.PI / 2 - 0.3));
    for (let z = -15; z < 24; z += 0.55) {
      if ([16.5, 2.2, -10.5].some((d) => Math.abs(z - d) < 1.0)) continue;
      g.fillStyle = "#2a3550"; const w = 0.24 * (LW / 68), h = 0.36 * (LW / 68);
      g.beginPath(); g.roundRect(X(z) - w / 2, wy - h / 2, w, h, w / 2); g.fill();
    }
    // doors
    for (const d of [24.2, 16.5, 2.2, -10.5]) {
      const w = 1.1 * (LW / 68), h = Math.abs(Y(side(Math.PI / 2 - 0.62)) - Y(side(Math.PI / 2 + 0.02)));
      g.strokeStyle = "rgba(40,45,60,0.55)"; g.lineWidth = 5;
      g.beginPath(); g.roundRect(X(d) - w / 2, Math.min(Y(side(Math.PI / 2 - 0.62)), Y(side(Math.PI / 2 + 0.02))), w, h, 10); g.stroke();
    }
    // cockpit windshield
    g.fillStyle = "#1f2a44";
    const c0 = side(0.42), c1 = side(1.0);
    g.beginPath(); g.moveTo(X(29.8), Y(c0)); g.lineTo(X(31.1), Y(c0)); g.lineTo(X(30.9), Y(c1)); g.lineTo(X(29.4), Y(c1)); g.closePath(); g.fill();
  }
  g.fillStyle = "#1f2a44"; g.fillRect(X(30.2), Y(Math.PI * 2 - 0.4), X(31.2) - X(30.2), Y(0.8)); g.fillRect(X(30.2), 0, X(31.2) - X(30.2), Y(0.4));
  // panel seams (dark tints)
  for (let z = -30; z < 30; z += 3.6) { g.fillStyle = "rgba(60,70,90,0.12)"; g.fillRect(X(z), 0, 3, LH); }
  for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? "rgba(120,130,150,0.05)" : "rgba(255,255,255,0.06)"; g.fillRect(r() * LW, r() * LH, 30 + r() * 120, 3); }
});
type Sec = { o: V3; chord: number; th: number };
/** loft of airfoil sections (LE point o, chord toward -z); thickness along y (wing) or x (fin); uv = (chord s, span) */
const loft = (secs: Sec[], axis: "y" | "x") => {
  const N = 14, prof: [number, number][] = [];
  const tt = (s: number) => 5 * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s * s + 0.2843 * s ** 3 - 0.1036 * s ** 4);
  for (let i = N; i >= 0; i--) { const s = (1 - Math.cos((Math.PI * i) / N)) / 2; prof.push([s, tt(s) * 0.5 + (axis === "y" ? 0.12 * Math.sin(Math.PI * s) * 0.5 : 0)]); }
  for (let i = 1; i <= N; i++) { const s = (1 - Math.cos((Math.PI * i) / N)) / 2; prof.push([s, -tt(s) * 0.5 + (axis === "y" ? 0.06 * Math.sin(Math.PI * s) * 0.5 : 0)]); }
  const P = prof.length, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  secs.forEach((S, j) => {
    for (const [s, t] of prof) {
      const z = S.o[2] - s * S.chord, d = t * S.th * 6;
      pos.push(S.o[0] + (axis === "x" ? d : 0), S.o[1] + (axis === "y" ? d : 0), z); uv.push(s, j / (secs.length - 1));
    }
  });
  for (let j = 0; j < secs.length - 1; j++) for (let i = 0; i < P - 1; i++) {
    const a = j * P + i, b = a + 1, c = a + P, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  // tip cap
  const base = (secs.length - 1) * P;
  for (let i = 1; i < P / 2; i++) idx.push(base + i, base + P - 1 - i, base + i + 1);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
const mirrorX = (g: THREE.BufferGeometry) => {
  const m = g.clone(); m.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
  const ix = m.index!; for (let i = 0; i < ix.count; i += 3) { const a = ix.getX(i + 1); ix.setX(i + 1, ix.getX(i + 2)); ix.setX(i + 2, a); }
  m.computeVertexNormals(); return m;
};
// wing planform
const W_ROOT = { x: 2.6, zLE: 4, chord: 14, y: 4.5 }, W_TIP = { x: 32, zLE: -15, chord: 3.8, y: 7.1 };
export const wingAt = (x: number) => { const k = (Math.abs(x) - W_ROOT.x) / (W_TIP.x - W_ROOT.x); return { zLE: lerp(W_ROOT.zLE, W_TIP.zLE, k), chord: lerp(W_ROOT.chord, W_TIP.chord, k), y: lerp(W_ROOT.y, W_TIP.y, k) }; };
const wingTex = () => ctex("wingPanels", 512, 512, (g, r) => {
  g.fillStyle = "#e4e7ee"; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = "rgba(70,80,100,0.16)"; g.fillRect(x, 0, 2, 512); }
  g.fillStyle = "rgba(70,80,100,0.22)"; g.fillRect(360, 0, 3, 512); g.fillRect(140, 0, 3, 512);
  for (let i = 0; i < 60; i++) { g.fillStyle = "rgba(255,255,255,0.1)"; g.fillRect(r() * 512, r() * 512, 40, 2); }
  g.fillStyle = "#c9ced8"; g.fillRect(400, 0, 112, 512); // flaps / ailerons band at the trailing edge
  g.fillStyle = "rgba(60,70,90,0.35)"; g.fillRect(400, 0, 3, 512);
});
const finTex = () => ctex("finLogo", 512, 512, (g) => {
  g.fillStyle = "#2c3552"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#f27a2a"; g.fillRect(0, 0, 512, 70);
  // our own simple mark: white ring with an orange wing swoosh
  g.strokeStyle = "#f7f6f2"; g.lineWidth = 26; g.beginPath(); g.arc(240, 270, 78, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#f27a2a"; g.beginPath(); g.moveTo(170, 300); g.quadraticCurveTo(250, 220, 330, 230); g.quadraticCurveTo(260, 260, 190, 320); g.closePath(); g.fill();
});
const tyreTex = () => ctex("tyre", 256, 64, (g) => { g.fillStyle = "#26262c"; g.fillRect(0, 0, 256, 64); g.fillStyle = "#3a3a42"; for (let x = 0; x < 256; x += 16) g.fillRect(x, 0, 5, 64); });

const buildPlane = (root: THREE.Object3D, gear: THREE.Object3D) => {
  const b = new Batch(), gb = new Batch();
  const body = lam("planeBody", () => ({ map: liveryTex() }));
  const wing = lam("planeWing", () => ({ map: wingTex() }));
  const white = lam("planeWhite", () => ({ color: "#f3f2ee" })), grey = lam("planeGrey", () => ({ color: "#9aa1ad" }));
  const dark = lam("planeDark", () => ({ color: "#2b2e38" })), orange = lam("planeOrange", () => ({ color: "#f27a2a" }));
  const fin = lam("planeFin", () => ({ map: finTex() }));
  const metal = lam("gearMetal", () => ({ color: "#b9bec8" })), tyre = lam("tyre", () => ({ map: tyreTex() }));
  b.add(fuselageGeo(), body);
  // wings (with a small kink fairing at the root) + winglets
  const wsecs = (s: number): Sec[] => [0, 0.35, 1].map((k) => {
    const x = lerp(W_ROOT.x, W_TIP.x, k), w = wingAt(x);
    return { o: [s * x, w.y, w.zLE], chord: w.chord, th: lerp(1.5, 0.45, k) / 6 / 0.6 } as Sec;
  });
  const wR = loft(wsecs(1), "y");
  b.add(wR, wing); b.add(mirrorX(wR), wing);
  for (const s of [-1, 1]) {
    const t = wingAt(W_TIP.x);
    const wl = loft([{ o: [s * W_TIP.x, t.y, t.zLE - 0.2], chord: 3.4, th: 0.12 }, { o: [s * (W_TIP.x + 0.6), t.y + 3.4, t.zLE - 2.6], chord: 1.4, th: 0.06 }], "x");
    b.add(s > 0 ? wl : wl, orange);
    // wing-root belly fairing
    const fr = new THREE.SphereGeometry(1, 20, 12); fr.scale(3.4, 1.4, 9);
    b.add(fr, white, new THREE.Matrix4().makeTranslation(0, FY - FR + 0.9, -2));
  }
  // horizontal tail + fin
  const hR = loft([{ o: [1.0, fus(-27)[1] + 0.2, -25], chord: 7, th: 0.12 }, { o: [11, fus(-27)[1] + 1.4, -32.5], chord: 2.6, th: 0.05 }], "y");
  b.add(hR, wing); b.add(mirrorX(hR), wing);
  const fy0 = fus(-26)[1] + fus(-26)[0] - 0.3;
  b.add(loft([{ o: [0, fy0, -20.5], chord: 12.5, th: 0.16 }, { o: [0, fy0 + 11.5, -31.5], chord: 4.4, th: 0.07 }], "x"), fin);
  // engines: nacelle lathe (axis z), dark intake, spinner, pylon
  const prof: THREE.Vector2[] = [[1.15, 3.0], [1.45, 2.6], [1.55, 1.6], [1.5, 0], [1.3, -1.8], [0.9, -2.8], [0.55, -3.3]].map(([r, z]) => new THREE.Vector2(r, z));
  const nac = new THREE.LatheGeometry(prof, 28).rotateX(Math.PI / 2);
  // rotateX(+90deg) maps lathe y -> z: profile z values become -z; flip so the intake faces +z
  nac.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, -1)); { const ix = nac.index!; for (let i = 0; i < ix.count; i += 3) { const a = ix.getX(i + 1); ix.setX(i + 1, ix.getX(i + 2)); ix.setX(i + 2, a); } } nac.computeVertexNormals();
  for (const x of [-21, -11, 11, 21]) {
    const w = wingAt(x), cz = w.zLE + 2.2, cy = w.y - 2.1;
    b.add(nac, white, new THREE.Matrix4().makeTranslation(x, cy, cz));
    b.add(new THREE.TorusGeometry(1.3, 0.16, 8, 28), orange, new THREE.Matrix4().makeTranslation(x, cy, cz + 2.98));
    b.add(new THREE.CircleGeometry(1.18, 28), dark, new THREE.Matrix4().makeTranslation(x, cy, cz + 2.7));
    b.add(new THREE.ConeGeometry(0.42, 0.9, 16).rotateX(Math.PI / 2), grey, new THREE.Matrix4().makeTranslation(x, cy, cz + 3.0));
    b.add(new THREE.CylinderGeometry(0.62, 0.3, 1.2, 16).rotateX(Math.PI / 2), grey, new THREE.Matrix4().makeTranslation(x, cy, cz - 3.6));
    b.add(boxGeo(V(x - 0.22, cy + 1.2, cz - 2.6), V(x + 0.22, w.y + 0.1, cz + 1.4)), white);
  }
  // landing gear (its own group: retracted in flight)
  const wheel = new THREE.CylinderGeometry(0.62, 0.62, 0.5, 20).rotateZ(Math.PI / 2);
  const hub = new THREE.CylinderGeometry(0.3, 0.3, 0.52, 12).rotateZ(Math.PI / 2);
  for (const x of [-5.4, -2.0, 2.0, 5.4]) {
    const top = Math.abs(x) > 3 ? wingAt(x).y - 0.6 : FY - FR + 0.4, zc = -5.2;
    gb.add(new THREE.CylinderGeometry(0.2, 0.2, top - 0.9, 10), metal, new THREE.Matrix4().makeTranslation(x, (top + 0.9) / 2, zc));
    gb.add(boxGeo(V(x - 0.14, 0.55, zc - 1.0), V(x + 0.14, 0.8, zc + 1.0)), metal);
    for (const dz of [-0.8, 0.8]) for (const dx of [-0.36, 0.36]) {
      gb.add(wheel, tyre, new THREE.Matrix4().makeTranslation(x + dx, 0.62, zc + dz));
      gb.add(hub, metal, new THREE.Matrix4().makeTranslation(x + dx * 1.01, 0.62, zc + dz));
    }
  }
  gb.add(new THREE.CylinderGeometry(0.16, 0.16, FY - FR - 0.4, 10), metal, new THREE.Matrix4().makeTranslation(0, (FY - FR + 0.6) / 2, 25.2));
  for (const dx of [-0.3, 0.3]) { gb.add(wheel.clone().scale(0.85, 0.85, 0.85), tyre, new THREE.Matrix4().makeTranslation(dx, 0.53, 25.2)); }
  b.build(root); gb.build(gear);
};

// ---------------- airport ----------------
export const RX = 150; // runway centre line x (the parked plane stands on the apron at x = 0)
const asphaltTex = () => ctex("runwayHD", 512, 2048, (g, r) => {
  // one 60 m x 240 m tile of the runway: 8.5 px/m across, 8.5 px/m along
  g.fillStyle = "#4a4d55"; g.fillRect(0, 0, 512, 2048);
  for (let i = 0; i < 1800; i++) { const c = r() < 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"; g.fillStyle = c; g.fillRect(r() * 512, r() * 2048, 3 + r() * 14, 2 + r() * 4); }
  for (let i = 0; i < 18; i++) { g.fillStyle = "rgba(25,25,30,0.18)"; g.fillRect(200 + r() * 112, r() * 2048, 18 + r() * 30, 80 + r() * 300); } // tyre marks
  g.fillStyle = "#f1efe8";
  g.fillRect(14, 0, 8, 2048); g.fillRect(490, 0, 8, 2048);                   // edge lines
  for (let y = 0; y < 2048; y += 512) g.fillRect(252, y, 8, 256);           // centre dashes 30 m
  g.fillStyle = "rgba(255,255,255,0.0)";
});
const apronTex = () => ctex("apronHD", 1024, 1024, (g, r) => {
  g.fillStyle = "#b7b6b0"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2500; i++) { g.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"; g.fillRect(r() * 1024, r() * 1024, 3 + r() * 10, 2 + r() * 3); }
  g.fillStyle = "rgba(70,70,75,0.35)"; for (let k = 0; k <= 1024; k += 128) { g.fillRect(k, 0, 3, 1024); g.fillRect(0, k, 1024, 3); } // slab joints (dark tint)
});
const glassTex = () => ctex("terminalGlass", 1024, 256, (g) => {
  g.fillStyle = "#8fb6dc"; g.fillRect(0, 0, 1024, 256);
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(30,60,110,0.3)");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 256);
  g.fillStyle = "#e8e6e0"; for (let x = 0; x < 1024; x += 64) g.fillRect(x, 0, 8, 256); g.fillRect(0, 120, 1024, 8);
});
const hangarTex = () => ctex("hangarRib", 512, 256, (g) => {
  g.fillStyle = "#d6d2c8"; g.fillRect(0, 0, 512, 256);
  for (let x = 0; x < 512; x += 16) { g.fillStyle = "rgba(60,60,70,0.18)"; g.fillRect(x, 0, 4, 256); }
});

const buildAirport = (R: THREE.Object3D) => {
  const b = new Batch();
  const grass = lam("airGrass", () => ({ map: rep(grassHD(), 160, 160) }));
  const ground = new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2);
  b.add(ground, grass, new THREE.Matrix4().makeTranslation(0, 0, 2500));
  // runway (60 m wide, z -500 .. 4300), threshold piano keys
  const rw = new THREE.PlaneGeometry(60, 4800).rotateX(-Math.PI / 2);
  const asph = lam("runway", () => ({ map: rep(asphaltTex(), 1, 20) }));
  b.add(rw, asph, new THREE.Matrix4().makeTranslation(RX, 0.03, 1900));
  const paint = lam("rwPaint", () => ({ color: "#f1efe8" }));
  for (let k = 0; k < 8; k++) for (const s of [-1, 1]) {
    const x = RX + s * (5 + k * 3.2);
    b.add(new THREE.PlaneGeometry(1.8, 40).rotateX(-Math.PI / 2), paint, new THREE.Matrix4().makeTranslation(x, 0.05, -460));
  }
  // apron + taxiway
  const apron = lam("apron", () => ({ map: rep(apronTex(), 12, 14) }));
  b.add(new THREE.PlaneGeometry(260, 300).rotateX(-Math.PI / 2), apron, new THREE.Matrix4().makeTranslation(-40, 0.02, 10));
  b.add(new THREE.PlaneGeometry(70, 30).rotateX(-Math.PI / 2), apron, new THREE.Matrix4().makeTranslation(RX - 55, 0.02, -60));
  const yellow = lam("taxiLine", () => ({ color: "#f2c230" }));
  b.add(new THREE.PlaneGeometry(0.5, 280).rotateX(-Math.PI / 2), yellow, new THREE.Matrix4().makeTranslation(0, 0.04, 10));
  b.add(new THREE.PlaneGeometry(150, 0.5).rotateX(-Math.PI / 2), yellow, new THREE.Matrix4().makeTranslation(70, 0.04, -60));
  // runway edge lights
  const lampM = lam("rwLamp", () => ({ color: "#ffe9a8", emissive: "#ffd060", emissiveIntensity: 0.6 }));
  for (let z = -480; z < 1600; z += 30) for (const s of [-1, 1]) b.add(boxGeo(V(RX + s * 31.5 - 0.2, 0, z - 0.2), V(RX + s * 31.5 + 0.2, 0.45, z + 0.2)), lampM);
  // terminal (long glass box) behind the apron + jet bridges
  const wall = lam("termWall", () => ({ color: "#e8d9bd" })), glass = lam("termGlass", () => ({ map: glassTex() }));
  const roofM = lam("termRoof", () => ({ color: "#8d96a6" }));
  b.add(boxGeo(V(-175, 0, -120), V(-120, 4, 140)), wall);
  const gl = new THREE.PlaneGeometry(260, 11).rotateY(Math.PI / 2);
  b.add(gl, glass, new THREE.Matrix4().makeTranslation(-119.9, 9.5, 10));
  b.add(boxGeo(V(-175, 4, -120), V(-120.2, 15, 140)), wall);
  const rf = new THREE.CylinderGeometry(40, 40, 262, 24, 1, false, -0.6, 1.2).rotateZ(Math.PI / 2).rotateY(Math.PI / 2);
  rf.scale(1, 0.25, 1);
  b.add(rf, roofM, new THREE.Matrix4().makeTranslation(-147, 5.5, 10));
  for (const z of [-60, 70]) b.add(boxGeo(V(-120, 4.5, z - 1.6), V(-60, 7.8, z + 1.6)), wall);
  // control tower
  const tw = lam("towerC", () => ({ color: "#e9e6de" }));
  b.add(new THREE.CylinderGeometry(3.2, 4.2, 42, 20), tw, new THREE.Matrix4().makeTranslation(-150, 21, 190));
  b.add(new THREE.CylinderGeometry(8, 5.5, 6, 12), lam("towerGlass", () => ({ color: "#5d87b8" })), new THREE.Matrix4().makeTranslation(-150, 45, 190));
  b.add(new THREE.CylinderGeometry(8.6, 8.6, 1.4, 12), tw, new THREE.Matrix4().makeTranslation(-150, 48.6, 190));
  b.add(new THREE.CylinderGeometry(0.15, 0.15, 6, 6), lam("towerAnt", () => ({ color: "#d44a3a" })), new THREE.Matrix4().makeTranslation(-150, 52, 190));
  // hangars across the runway
  const hang = lam("hangar", () => ({ map: hangarTex() })), door = lam("hangarDoor", () => ({ color: "#3d5f8f" }));
  for (const [z, w] of [[-200, 80], [-80, 70]] as [number, number][]) {
    // arched hangar, axis along x, closed half-disc ends; the door faces the runway
    const h = new THREE.CylinderGeometry(w / 2, w / 2, 60, 28, 1, false, -Math.PI / 2, Math.PI).rotateX(-Math.PI / 2);
    h.scale(1, 0.55, 1); h.rotateY(Math.PI / 2);
    b.add(h, hang, new THREE.Matrix4().makeTranslation(RX + 150, 0, z));
    const dh = w * 0.5 * 0.55 * 0.62;
    b.add(new THREE.PlaneGeometry(w * 0.62, dh).rotateY(-Math.PI / 2), door, new THREE.Matrix4().makeTranslation(RX + 150 - 30.15, dh / 2, z));
  }
  // fuel truck + stairs near the parked plane (real size props)
  const truckR = lam("truckRed", () => ({ color: "#d8443a" })), truckW = lam("truckWhite", () => ({ color: "#f0eee8" })), tyreM = lam("tyre2", () => ({ color: "#26262c" }));
  b.add(boxGeo(V(-44, 0.6, -34), V(-41.6, 3.2, -26)), truckW);
  b.add(boxGeo(V(-44, 0.6, -25.8), V(-41.6, 3.0, -23.5)), truckR);
  for (const z of [-32.5, -28, -24.6]) for (const x of [-44.05, -41.55]) b.add(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 14).rotateZ(Math.PI / 2), tyreM, new THREE.Matrix4().makeTranslation(x, 0.55, z));
  // trees: faceted cones + round crowns along the far edges
  const leafA = lam("leafA", () => ({ color: "#4f9a44" })), leafB = lam("leafB", () => ({ color: "#6bb04c" })), trunk = lam("trunk", () => ({ color: "#7a4f33" }));
  let seed = 3; const rr = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const tree = (x: number, z: number, s: number) => {
    b.add(new THREE.CylinderGeometry(0.35 * s, 0.45 * s, 2.4 * s, 6), trunk, new THREE.Matrix4().makeTranslation(x, 1.2 * s, z));
    if (rr() < 0.5) b.add(new THREE.ConeGeometry(2.4 * s, 6.5 * s, 7), leafA, new THREE.Matrix4().makeTranslation(x, 5.3 * s, z));
    else b.add(new THREE.IcosahedronGeometry(2.6 * s, 0), leafB, new THREE.Matrix4().makeTranslation(x, 4.4 * s, z));
  };
  for (let i = 0; i < 260; i++) {
    const side = i % 3, z = -520 + rr() * 5000;
    const x = side === 0 ? RX + 210 + rr() * 260 : side === 1 ? -200 - rr() * 260 : RX - 75 - rr() * 20;
    if (side === 2 && (z < 300 || rr() < 0.6)) continue;
    tree(x, z, 1.6 + rr() * 1.4);
  }
  // distant hills
  const hill = lam("hillC", () => ({ color: "#7fb062" }));
  for (const [x, z, r, h] of [[-700, 900, 420, 90], [900, 1400, 520, 120], [-500, -700, 380, 70], [700, -500, 400, 80], [100, 3800, 700, 150]] as [number, number, number, number][]) {
    const g = new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(r, h, r * 0.8);
    b.add(g, hill, new THREE.Matrix4().makeTranslation(x, 0, z));
  }
  b.build(R);
  // windsock by the runway (cone on a pole)
  const ws = new Batch();
  ws.add(new THREE.CylinderGeometry(0.08, 0.08, 6, 8), lam("sockPole", () => ({ color: "#d9d9de" })), new THREE.Matrix4().makeTranslation(RX - 45, 3, 40));
  for (let k = 0; k < 4; k++) {
    const c = new THREE.CylinderGeometry(0.55 - k * 0.09, 0.64 - k * 0.09, 0.9, 14, 1, true).rotateZ(Math.PI / 2);
    ws.add(c, lam(k % 2 ? "sockW" : "sockO", () => ({ color: k % 2 ? "#f4f1ea" : "#f27a2a", side: THREE.DoubleSide })), new THREE.Matrix4().makeTranslation(RX - 45 - 0.5 - k * 0.9, 5.7, 40));
  }
  ws.build(R);
};

// ---------------- the cast ----------------
/** our hero: orange jacket, yellow backpack, dark beanie with a pompom, white head, white sneakers */
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", cuff: "#f0f2f6", pack: "#f4c430", skin: "#f8f6f0" };
void INK;

// ---------------- shots and cameras ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Space = "world" | "plane";
type ShotDef = { id: number; a: number; b: number; space: Space; cam: (u: number, f: number) => Cam; cInf: number };
export const HERO_AT: V3 = [-8.5, 0, 15];   // beside the parked plane, ahead of the left wing
export const HERO_WING: V3 = [-12.2, 0, 4.4]; // under the left wing, between the engines
export const HERO_FIELD: V3 = [RX - 56.2, 0, 333.4]; // on the grass by the runway, watching the climb-out
export const SHOTS: ShotDef[] = [
  // 1 «Как самолёт весом» — high glide down to the parked giant
  { id: 1, a: 0, b: 34, space: "world", cInf: 0, cam: (u) => ({ pos: lerp3([-78, 46, 92], [-58, 30, 70], glide(u)), look: lerp3([0, 3, 2], [-2, 4, 4], u), fov: 38, roll: 0 }) },
  // 2 «четыреста тонн» — worm's-eye: tiny hero beside the gear, the belly towers overhead
  { id: 2, a: 34, b: 70, space: "world", cInf: 5, cam: (u) => ({ pos: lerp3([-15.5, 0.9, 27], [-14.6, 1.0, 25.6], u), look: [-4, 7.5, 4], fov: 52, roll: lerp(0.03, 0.06, u) }) },
  // 3 «вообще держится в воздухе?» — hero close-up, puzzled
  { id: 3, a: 70, b: 109, space: "world", cInf: 14, cam: (u) => ({ pos: lerp3([-11.8, 1.55, 21.2], [-11.2, 1.5, 20.2], u), look: [-8.5, 1.3, 15], fov: 32, roll: 0 }) },
  // 4 «Всё дело в крыле» — hero points at the huge wing above him
  { id: 4, a: 109, b: 143, space: "world", cInf: 8, cam: (u) => ({ pos: lerp3([-9.6, 0.9, 10.5], [-10.0, 0.95, 9.8], u), look: lerp3([-15.4, 4.4, -0.5], [-15.9, 4.8, -1], u), fov: 56, roll: -0.03 }) },
  // 5 «На скорости почти триста…» — low by the runway, the plane thunders past
  { id: 5, a: 143, b: 178, space: "world", cInf: 0, cam: (_u, f) => ({ pos: [RX - 40, 1.4, 255], look: [RX, 5.5, planePose(5, f).p[2] + 6], fov: 42, roll: 0.02 }) },
  // 6 «…километров в час» — riding the wingtip as the nose lifts, ground falling away
  { id: 6, a: 178, b: 212, space: "plane", cInf: 0, cam: (u) => ({ pos: lerp3([-62, 14, -32], [-60, 15, -30], u), look: [-8, 6, 10], fov: 44, roll: lerp(0.0, -0.06, u) }) },
  // 7 «оно отбрасывает воздух» — side view in flight: streamlines bend down behind the wing
  { id: 7, a: 212, b: 240, space: "plane", cInf: 0, cam: (u) => ({ pos: lerp3([-80, 4, -2], [-76, 3.6, -4], u), look: [-10, 4, -4], fov: 44, roll: 0 }) },
  // 8 «вниз» — from behind and below: air pours down off the wing
  { id: 8, a: 240, b: 267, space: "plane", cInf: 0, cam: (u) => ({ pos: lerp3([-46, -10, -48], [-44, -8, -44], u), look: [-16, 3, -6], fov: 48, roll: 0.05 }) },
  // 9 «А воздух в ответ» — hero on the grass grins as the plane climbs overhead
  { id: 9, a: 267, b: 300, space: "world", cInf: 0, cam: (u) => ({ pos: lerp3([RX - 60, 1.0, 330], [RX - 59.4, 0.95, 330.5], u), look: [RX - 44.4, 6.2, 342.5], fov: 52, roll: 0.04 }) },
  // 10 «толкает крыло вверх» — under the wing, air shoves it up; the plane surges skyward
  { id: 10, a: 300, b: TOTAL, space: "world", cInf: 0, cam: (u) => ({ pos: lerp3([-26, -10, 22], [-27, -8.5, 19], u), look: [-10, 3, -2], fov: 52, roll: -0.06 }) },
];
export const XFADE: Record<number, number> = {};
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];
const KICKS = [34, 306];
const kick = (f: number) => {
  for (const k of KICKS) { const d = f - k; if (d >= 0 && d < 7) return (d % 2 ? -1 : 1) * 0.05 * (1 - d / 7); }
  return 0;
};
export const camAt = (id: number, f: number): Cam => {
  const s = SHOTS[id - 1], u = clamp01((f - s.a) / Math.max(1, s.b - s.a));
  const c = s.cam(u, f);
  const k = 0.0025 * Math.max(0, f - s.a);
  return { ...c, pos: lerp3(c.pos, c.look, Math.min(0.2, k * 0.4)), roll: c.roll + kick(f) };
};
export const dofAt = (f: number) => ({ cInf: shotAt(f).cInf });

/** plane pose in the world per shot: position of the plane-space origin, nose-up pitch (rad), gear down? */
type Pose = { p: V3; pitch: number; gear: boolean; bank: number };
const T5 = 143 / FPS;
export const planePose = (id: number, f: number): Pose => {
  const t = f / FPS;
  if (id <= 4) return { p: [0, 0, 0], pitch: 0, gear: true, bank: 0 };
  if (id === 5) return { p: [RX, 0, 187 + 72 * (t - T5)], pitch: 0, gear: true, bank: 0 };
  if (id === 6) { const k = clamp01((f - 182) / 28); return { p: [RX, 7 * ease(k) ** 1.5, 300 + 76 * (t - 178 / FPS)], pitch: 0.16 * ease(k * 1.4), gear: true, bank: 0 }; }
  if (id === 7 || id === 8) return { p: [RX, 320 + 0.6 * Math.sin(t * 2.2), 2600 + 82 * (t - 212 / FPS)], pitch: 0.07, gear: false, bank: 0.01 * Math.sin(t * 1.3) };
  if (id === 9) { const k = (f - 267) / 33; return { p: [RX, 34 + 14 * k, 340 + 80 * k], pitch: 0.2, gear: false, bank: 0 }; }
  // 10: the lift wins — the plane surges up past the camera
  const k = (f - 300) / FPS, surge = f < 306 ? 0 : 3.2 * (k - 0.2) ** 1.6 * 4;
  return { p: [0, 520 + surge, 0], pitch: 0.12 + 0.05 * clamp01((f - 306) / 20), gear: false, bank: 0 };
};

// ---------------- air streams (effect cards) ----------------
const flowDraw = (ph: number) => (p: Pen) => {
  // 1400 x 520 canvas = 70 m (z: +38 at the right .. -32 at the left) x 26 m (y: +17 top .. -9 bottom), 20 px / m
  const X = (z: number) => (38 - z) * 20, Y = (y: number) => (17 - y) * 20;
  p.ol = 3;
  const down = (z: number) => ease((6 - z) / 34); // bends down behind the wing
  for (const [y0, dd] of [[15.5, 3.5], [12, 5.5], [1.8, 7], [-1.6, 6], [-5.5, 4.5]] as [number, number][]) {
    const pts: [number, number][] = [];
    for (let z = 38; z >= -32; z -= 1) pts.push([X(z), Y(y0 - dd * down(z) + (y0 > 6 ? 1.2 * Math.exp(-(((z + 4) / 9) ** 2)) : -0.8 * Math.exp(-(((z + 4) / 9) ** 2))))]);
    // dashes travelling right -> left (air rushing past toward the tail)
    const N = pts.length;
    for (let s = -1; s < 11; s++) {
      const i0 = Math.floor(((s + (ph % 1)) / 10) * N), i1 = i0 + 4;
      const seg = pts.slice(Math.max(0, i0), Math.min(N, i1));
      if (seg.length > 1) p.line(seg, "#ffffff", 6);
      if (seg.length === 4) { const [ax, ay] = seg[0], [bx, by] = seg[1], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1;
        p.line([[ax + (dx * 0 - dy) / l * 9 + dx / l * 10, ay + (dy * 0 + dx) / l * 9 + dy / l * 10], [ax, ay], [ax + dy / l * 9 + dx / l * 10, ay - dx / l * 9 + dy / l * 10]], "#ffffff", 6); }
    }
  }
};
const fallDraw = (ph: number, seed: number) => (p: Pen) => {
  // 200 x 800 canvas: a wavy wind line falling down
  p.ol = 3;
  const pts: [number, number][] = [];
  const y0 = ((ph + seed * 0.37) % 1) * 1100 - 500;
  for (let y = y0; y < y0 + 420; y += 20) if (y > 0 && y < 800) pts.push([100 + 26 * Math.sin(y / 70 + seed), y]);
  if (pts.length > 1) p.line(pts, "#ffffff", 9);
  if (pts.length > 3) { const [x, y] = pts[pts.length - 1]; p.line([[x - 22, y - 26], [x, y], [x + 22, y - 26]], "#ffffff", 9); }
};
const pushDraw = (ph: number, seed: number) => (p: Pen) => {
  // 200 x 800 canvas: a wind line rising, chevron on top (air shoving the wing up)
  p.ol = 3;
  const pts: [number, number][] = [];
  const y0 = 800 - ((ph + seed * 0.29) % 1) * 1100 + 100;
  for (let y = y0; y > y0 - 420; y -= 20) if (y > 0 && y < 800) pts.push([100 + 22 * Math.sin(y / 60 + seed), y]);
  if (pts.length > 1) p.line(pts, "#ffffff", 10);
  if (pts.length > 3) { const [x, y] = pts[pts.length - 1]; p.line([[x - 26, y + 30], [x, y], [x + 26, y + 30]], "#ffffff", 10); }
};

// ---------------- world ----------------
const lightOf = () => LIGHTS.day;
export class AirWorld {
  root = new THREE.Group();
  plane = new THREE.Group();   // pivot at the main gear
  inner = new THREE.Group();   // plane space
  gear = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private clouds: THREE.Mesh[] = [];
  private nearClouds: THREE.Mesh[] = [];
  private sunCache = new Map<number, THREE.Vector3>();

  constructor() {
    const R = this.root;
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
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    const cm = [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud));
    const cmat = (i: number) => new THREE.MeshBasicMaterial({ map: cm[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false });
    // far ring of clouds (follows the camera, like the sky)
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), cmat(i));
      const w = 150 + (i % 4) * 34; m.scale.set(w, w / 2, 1); m.userData.a = (i / 12) * Math.PI * 2 + 0.3; m.userData.d = 600 + (i % 3) * 70; m.userData.h = 60 + (i % 4) * 30;
      m.layers.set(NOINK); this.clouds.push(m); R.add(m);
    }
    // near clouds at cruise height, placed around the flight path (they stream past)
    let s = 7; const rr = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), cmat(i));
      const w = 40 + rr() * 70; m.scale.set(w, w / 2, 1);
      const side = rr() < 0.5 ? -1 : 1;
      m.position.set(RX + side * (40 + rr() * 220), 250 + rr() * 140, 2400 + rr() * 900);
      if (i > 45) m.position.set((rr() - 0.5) * 400, 420 + rr() * 200, (rr() - 0.5) * 400 - 60); // around shot 10
      m.layers.set(NOINK); this.nearClouds.push(m); R.add(m);
    }
    buildAirport(R);
    buildPlane(this.inner, this.gear);
    this.inner.add(this.gear);
    this.inner.position.set(0, 0, 5.2); // plane origin sits 5.2 m ahead of the pivot (main gear)
    this.plane.add(this.inner);
    R.add(this.plane);
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
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(id === 8 || id === 10 ? 62 : L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private posePlane(id: number, f: number) {
    const P = planePose(id, f);
    this.plane.position.set(P.p[0], P.p[1], P.p[2] - 5.2);
    this.plane.rotation.set(-P.pitch, 0, P.bank);
    this.gear.visible = P.gear;
    this.plane.updateMatrixWorld(true);
  }
  private toWorld(p: V3) { return V(...p).applyMatrix4(this.inner.matrixWorld); }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, L = lightOf(), K = LOOK.day;
    this.posePlane(id, f);
    const S = SHOTS[id - 1], c = camAt(id, f);
    let pos: THREE.Vector3, look: THREE.Vector3;
    if (S.space === "plane") { pos = this.toWorld(c.pos); look = this.toWorld(c.look); }
    else if (id === 10) { const base = planePose(10, 300).p; pos = V(c.pos[0] + base[0], c.pos[1] + base[1], c.pos[2] + base[2]); look = this.toWorld(c.look); look.y = lerp(look.y, base[1] + 2, 0.6); }
    else { pos = V(...c.pos); look = V(...c.look); }
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look);
    if (S.space === "plane") { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, this.plane.rotation.z)); cam.quaternion.premultiply(q); }
    cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 3000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    // light rig + two-tone uniforms
    const sunDir = this.shotSun(id), dist = pos.distanceTo(look);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const big = id === 1 || id >= 5;
    const Rr = big ? 70 : THREE.MathUtils.clamp(dist * 1.2 + 14, 24, 60);
    const fc = big ? this.toWorld([0, 5, 0]) : look;
    if (id === 9) fc.copy(V(RX - 30, 15, 355));
    this.sun.position.copy(fc).addScaledVector(sunDir, 300); this.sun.target.position.copy(fc);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 700; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color);
    const high = cam.position.y > 150;
    this.fog.near = high ? 150 : 80; this.fog.far = high ? 1300 : 900;
    scene.fog = this.fog; scene.background = null;
    for (const m of this.clouds) {
      m.position.set(cam.position.x + Math.cos(m.userData.a) * m.userData.d, (high ? cam.position.y - 40 : 0) + m.userData.h, cam.position.z + Math.sin(m.userData.a) * m.userData.d);
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
    }
    for (const m of this.nearClouds) { m.visible = high; m.lookAt(cam.position); }
    // ---- cast: our hero ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const k = (f + seed * 37) % 70; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
    const env = VOICE_ENV[Math.min(VOICE_ENV.length - 1, f)] ?? 0;
    const talk = env > 0.28 && (f >> 1) % 3 !== 0;
    const used: Actor[] = [];
    let ai = 0;
    const people: { p: V3; fo: FrontOpts; flip?: boolean }[] = [];
    if (id <= 4) {
      const expr: Expr = id === 2 ? "shock" : id === 3 ? (talk ? "talk" : "nervous") : talk ? "talk" : "smile";
      const tipR = V(...this.toWorld([-30, 6, -12]).toArray()).sub(cam.position).dot(right) < 0;
      people.push({ p: id === 4 ? HERO_WING : HERO_AT, fo: { mode: "stand", expr, blink: id === 2 ? 0 : lid(1), seed: 4, look: id === 4 ? 1 : 0, headTilt: id === 3 ? -6 : 0, wave: id === 4 ? 1 : id === 3 ? 0.15 + 0.1 * Math.sin(t * 5) : undefined, facing: id === 4 ? 1 : 0 }, flip: false }); void tipR;
    }
    if (id === 9) people.push({ p: HERO_FIELD, fo: { mode: "stand", expr: talk ? "laugh" : "grin", blink: lid(2), seed: 4, wave: 0.8 + 0.2 * Math.sin(t * 9), look: 1, headTilt: 5 } });
    for (const pp of people) {
      const w = V(...pp.p), d = cam.position.distanceTo(w);
      const [cw, ch, k] = d < 4 ? [1800, 3000, 3.0] : d < 9 ? [1080, 1800, 1.8] : d < 20 ? [600, 1000, 1.0] : [300, 500, 0.5];
      const fo: FrontOpts = { ...pp.fo, light: L2D };
      const a = this.actor(ai++);
      a.r = this.pool.req(`hero|${JSON.stringify(fo, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, k, (pen) => bodyFront(pen, HERO, fo));
      a.mesh.visible = true; a.mesh.position.copy(w);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - w.x, cam.position.z - w.z), 0);
      a.mesh.scale.set(pp.flip ? -1 : 1, 1, 1); a.mesh.castShadow = false;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- effects: air streams ----
    let fi = 0;
    const fused: Fx[] = [];
    const ph = Math.round(t * 1.6 * 15) / 15;
    const addFx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, at: THREE.Vector3, w: number, h: number, q: THREE.Quaternion | null, soft = false) => {
      const e = this.fx(fi++);
      e.r = this.pool.req(key, cw, ch, 1, draw); e.use(soft);
      e.mesh.visible = true; e.mesh.position.copy(at); e.mesh.quaternion.copy(q ?? cam.quaternion); e.mesh.scale.set(w, h, 1);
      fused.push(e);
    };
    const pq = new THREE.Quaternion(); this.inner.getWorldQuaternion(pq);
    if (id === 7) {
      // streamlines in the plane's side plane, just outside the left wingtip
      const q = pq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)));
      addFx(`flow|${ph}`, 1400, 520, flowDraw(ph * 1.5), this.toWorld([-36, 4, 3]), 70, 26, q);
    }
    if (id === 8) for (let i = 0; i < 12; i++) {
      const x = -8 - i * 1.9, wa = wingAt(x), z = wa.zLE - wa.chord - 1.5 - (i % 3) * 1.2;
      addFx(`fall|${i}|${ph}`, 200, 800, fallDraw(ph * 1.2, i), this.toWorld([x, wa.y - 7, z]), 2.6, 10.4, null);
    }
    if (id === 10 && f >= 300) for (let i = 0; i < 8; i++) {
      const x = -6 - i * 3, wa = wingAt(x), z = wa.zLE - wa.chord * (0.3 + 0.12 * (i % 3));
      addFx(`push|${i}|${ph}`, 200, 800, pushDraw(ph * 1.4, i), this.toWorld([x, wa.y - 6, z]), 2.4, 9.6, null);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return S.space === "plane" || id === 10 ? this.toWorld([-12, 5, -4]) : id <= 4 && id !== 1 ? V(...(id === 4 ? HERO_WING : HERO_AT)).add(V(0, 1.2, 0)) : look;
  }
}
