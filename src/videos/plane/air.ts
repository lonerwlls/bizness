// «Как самолёт весом 400 тонн держится в воздухе?» — шортс ~55 с в стиле cartoon-3d-short.
// Один three.js-мир: аэропорт (перрон, полоса, терминал, вышка, ангары, лес), широкофюзеляжный лайнер из
// своих форм (фюзеляж-«лофт» с нарисованной ливреей, стреловидные крылья с профилем, 4 двигателя, шасси),
// облака на высоте. Наш герой — плоская карточка (bodyFront), потоки воздуха — нарисованные Fx-карточки.
import * as THREE from "three";
import { Batch, V, lam, boxGeo } from "../bridge/build";
import { rep, ctex, grassHD, cloudHD, CLOUD_GOLD } from "../bridge/paint";
import { Pen, bodyFront, Outfit, Expr, FrontOpts, fxPuff, fxBurst } from "../bridge/toon";
import { LIGHTS, LOOK } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";

export const FPS = 30;
export const TOTAL = 1635;
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
  for (let i = 0; i < (P - 1) / 2 - 1; i++) { const a = base + i, b = base + i + 1, c = base + P - 2 - i, d = base + P - 1 - i; idx.push(a, b, c, a, c, d, a, c, b, a, d, c); }
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

export type PlaneParts = { fans: THREE.Mesh[]; flaps: THREE.Object3D[] };
const fanTex = () => ctex("fanBlades", 256, 256, (g) => {
  g.fillStyle = "#2b2e38"; g.fillRect(0, 0, 256, 256);
  g.translate(128, 128);
  for (let k = 0; k < 18; k++) { g.rotate((Math.PI * 2) / 18); g.fillStyle = k % 2 ? "#6c7380" : "#5a616e"; g.beginPath(); g.moveTo(14, -4); g.quadraticCurveTo(70, -22, 126, -10); g.lineTo(126, 6); g.quadraticCurveTo(70, 0, 14, 6); g.closePath(); g.fill(); }
  g.setTransform(1, 0, 0, 1, 0, 0);
});
/** wing top surface height at span x, chord fraction s (same profile as loft()) */
export const wingTop = (x: number, s: number) => {
  const k = (Math.abs(x) - 2.6) / (32 - 2.6), w = wingAt(x), th = lerp(1.5, 0.45, k) / 6 / 0.6;
  const tt = 5 * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s * s + 0.2843 * s ** 3 - 0.1036 * s ** 4);
  return w.y + (tt * 0.5 + 0.06 * Math.sin(Math.PI * s)) * th * 6;
};
const buildPlane = (root: THREE.Object3D, gear: THREE.Object3D): PlaneParts => {
  const parts: PlaneParts = { fans: [], flaps: [] };
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
    const fan = new THREE.Mesh(new THREE.CircleGeometry(1.16, 28), lam("fanM", () => ({ map: fanTex() })));
    fan.position.set(x, cy, cz + 2.72); fan.castShadow = false; fan.receiveShadow = true; root.add(fan); parts.fans.push(fan);
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
  // trailing-edge flaps (extend back and down on take-off); pivot at the hinge line, hidden when stowed
  for (const sx of [-1, 1]) {
    const x0 = 4, x1 = 17, w0 = wingAt(x0), w1 = wingAt(x1), te0 = w0.zLE - w0.chord, te1 = w1.zLE - w1.chord;
    const hinge = V(sx * (x0 + x1) / 2, (w0.y + w1.y) / 2, (te0 + te1) / 2 + 2.2);
    const g = loft([{ o: [x0, w0.y - hinge.y, te0 + 2.2 - hinge.z], chord: 3.0, th: 0.05 }, { o: [x1, w1.y - hinge.y, te1 + 2.2 - hinge.z], chord: 2.2, th: 0.04 }], "y");
    const geo = sx < 0 ? mirrorX(g) : g; geo.translate(-hinge.x + (sx < 0 ? 0 : 0), 0, 0);
    if (sx < 0) geo.translate(0, 0, 0);
    const piv = new THREE.Group(); piv.position.copy(hinge);
    const m = new THREE.Mesh(geo, lam("flapM", () => ({ color: "#a9b0bd" }))); m.castShadow = true; m.receiveShadow = true;
    piv.add(m); piv.visible = false; root.add(piv); parts.flaps.push(piv);
  }
  return parts;
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
  // the grass always loses the depth test to the apron/runway lying on it (no green flicker on far shots)
  grass.polygonOffset = true; grass.polygonOffsetFactor = 6; grass.polygonOffsetUnits = 6;
  const ground = new THREE.PlaneGeometry(9000, 9000, 180, 180).rotateX(-Math.PI / 2); // small cells: huge triangles get dropped near the lens
  b.add(ground, grass, new THREE.Matrix4().makeTranslation(0, 0, 2500));
  // runway (60 m wide, z -500 .. 4300), threshold piano keys
  const rw = new THREE.PlaneGeometry(60, 4800, 6, 480).rotateX(-Math.PI / 2);
  const asph = lam("runway", () => ({ map: rep(asphaltTex(), 1, 20) }));
  b.add(rw, asph, new THREE.Matrix4().makeTranslation(RX, 0.07, 1900));
  const paint = lam("rwPaint", () => ({ color: "#f1efe8" }));
  for (let k = 0; k < 8; k++) for (const s of [-1, 1]) {
    const x = RX + s * (5 + k * 3.2);
    b.add(new THREE.PlaneGeometry(1.8, 40).rotateX(-Math.PI / 2), paint, new THREE.Matrix4().makeTranslation(x, 0.12, -460));
  }
  // apron + taxiway
  const apron = lam("apron", () => ({ map: rep(apronTex(), 12, 14) }));
  b.add(new THREE.PlaneGeometry(260, 300, 26, 30).rotateX(-Math.PI / 2), apron, new THREE.Matrix4().makeTranslation(-40, 0.02, 10));
  b.add(new THREE.PlaneGeometry(70, 30, 7, 3).rotateX(-Math.PI / 2), apron, new THREE.Matrix4().makeTranslation(RX - 55, 0.02, -60));
  const yellow = lam("taxiLine", () => ({ color: "#f2c230" }));
  b.add(new THREE.PlaneGeometry(0.5, 280, 1, 28).rotateX(-Math.PI / 2), yellow, new THREE.Matrix4().makeTranslation(0, 0.08, 10));
  b.add(new THREE.PlaneGeometry(150, 0.5, 15, 1).rotateX(-Math.PI / 2), yellow, new THREE.Matrix4().makeTranslation(70, 0.08, -60));
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

// ---------------- our own small car (real size: 4.0 x 1.76 m), open windows ----------------
const buildCar = () => {
  const g = new THREE.Group(), b = new Batch();
  const paintM = lam("carMint", () => ({ color: "#5fc8b0" })), darkM = lam("carDark", () => ({ color: "#2b2e38" })), greyM = lam("carGrey", () => ({ color: "#c9ccd2" }));
  const lampM = lam("carLamp", () => ({ color: "#fff2b0", emissive: "#ffd060", emissiveIntensity: 0.3 })), seatM = lam("carSeat", () => ({ color: "#3b3f52" }));
  b.add(boxGeo(V(-0.88, 0.3, -2.0), V(0.88, 0.84, 2.0)), paintM);              // body
  b.add(boxGeo(V(-0.9, 0.22, 1.95), V(0.9, 0.42, 2.12)), greyM);               // bumpers
  b.add(boxGeo(V(-0.9, 0.22, -2.12), V(0.9, 0.42, -1.95)), greyM);
  for (const sx of [-1, 1]) {
    b.add(boxGeo(V(sx * 0.62 - 0.14, 0.62, 2.0), V(sx * 0.62 + 0.14, 0.74, 2.03)), lampM);
    for (const z of [0.78, -0.95]) b.add(boxGeo(V(sx * 0.86 - 0.05, 0.84, z - 0.05), V(sx * 0.86 + 0.05, 1.38, z + 0.05)), paintM); // pillars
    for (const z of [1.3, -1.3]) {
      b.add(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 18).rotateZ(Math.PI / 2), darkM, new THREE.Matrix4().makeTranslation(sx * 0.8, 0.32, z));
      b.add(new THREE.CylinderGeometry(0.16, 0.16, 0.26, 12).rotateZ(Math.PI / 2), greyM, new THREE.Matrix4().makeTranslation(sx * 0.8, 0.32, z));
    }
  }
  b.add(boxGeo(V(-0.9, 1.34, -1.0), V(0.9, 1.44, 0.85)), paintM);              // roof
  b.add(boxGeo(V(-0.8, 0.84, 0.6), V(0.8, 0.98, 0.78)), darkM);                // dashboard
  for (const sx of [-1, 1]) b.add(boxGeo(V(sx * 0.42 - 0.24, 0.5, -0.45), V(sx * 0.42 + 0.24, 1.15, -0.3)), seatM); // seat backs
  b.build(g);
  return g;
};

// ---------------- a wing-section teaching model on the apron ----------------
const FOIL = { x0: -41.5, x1: -38.5, y: 3.2, zLE: 74, chord: 8, th: 0.37 };
const foilT = (s: number) => 5 * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s * s + 0.2843 * s ** 3 - 0.1036 * s ** 4);
const foilTop = (s: number) => FOIL.y + (foilT(s) * 0.5 + 0.06 * Math.sin(Math.PI * s)) * FOIL.th * 6;
const foilBot = (s: number) => FOIL.y + (-foilT(s) * 0.5 + 0.03 * Math.sin(Math.PI * s)) * FOIL.th * 6;
const buildFoil = () => {
  const g = new THREE.Group(), b = new Batch();
  const m = lam("foilM", () => ({ map: wingTex(), side: THREE.DoubleSide }));
  b.add(loft([{ o: [FOIL.x1, FOIL.y, FOIL.zLE], chord: FOIL.chord, th: FOIL.th }, { o: [FOIL.x0, FOIL.y, FOIL.zLE], chord: FOIL.chord, th: FOIL.th }], "y"), m);
  b.build(g);
  const sb = new Batch(), post = lam("foilPost", () => ({ color: "#3d5f8f" }));
  for (const z of [71.8, 68.2]) sb.add(boxGeo(V(-40.2, 0, z - 0.15), V(-39.8, FOIL.y - 0.1, z + 0.15)), post);
  sb.add(boxGeo(V(-41.2, 0, 66.8), V(-38.8, 0.25, 73.2)), post);
  const stand = new THREE.Group(); sb.build(stand);
  return { model: g, stand };
};

// ---------------- shots ----------------
type Light = "day" | "golden";
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Space = "world" | "plane" | "chase" | "follow" | "car";
type Pose = { p: V3; pitch: number; gear: boolean; bank: number };
type ShotDef = { id: number; a: number; b: number; space: Space; light?: Light; cam: (u: number, f: number) => Cam; cInf: number;
  plane?: (u: number, f: number) => Pose; flaps?: (u: number) => number; fan?: (u: number) => number };
const PARK: Pose = { p: [0, 0, 0], pitch: 0, gear: true, bank: 0 };
const T = (f: number) => f / FPS;
const cruise = (a: number) => (_u: number, f: number): Pose => ({ p: [RX, 320 + 0.6 * Math.sin(T(f) * 2.2), 2600 + 82 * (T(f) - a / FPS)], pitch: 0.07, gear: false, bank: 0.01 * Math.sin(T(f) * 1.3) });
const GOLD0 = 1155;
const gold = (f: number, dy = 0): Pose => {
  const g = Math.max(0, f - 1346) / FPS, climb = Math.max(0, f - 1418) / FPS;
  return { p: [0, 380 - 9 * g + 14 * climb * climb + dy, 6000 + 120 * T(f - GOLD0)], pitch: f > 1346 && f < 1418 ? -0.04 : f >= 1418 ? 0.12 : 0.03, gear: false, bank: 0.008 * Math.sin(T(f)) };
};
export const HERO_AT: V3 = [-8.5, 0, 15];
export const HERO_WING: V3 = [-12.2, 0, 4.4];
export const HERO_FIELD: V3 = [RX - 56.2, 0, 333.4];
export const HERO_FOIL: V3 = [-46, 0, 73.6];
export const ROAD_X = RX + 75;
const carZ = (f: number) => 100 + 15 * T(f - 309);
const hw = { x: -12.5, s: 0.25 };          // hero standing on the left wing
export const SQ = { x: -17, s: 0.42 };     // the painted square metre
const wingPt = (x: number, s: number): V3 => { const w = wingAt(x); return [x, wingTop(x, s), w.zLE - s * w.chord]; };
const ENG_L = (() => { const w = wingAt(-11); return { x: -11, y: w.y - 2.1, z: w.zLE + 2.2 }; })();
const spin = (v: number) => () => v;

export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 31, space: "world", cInf: 0, cam: (u) => ({ pos: lerp3([-78, 46, 92], [-58, 30, 70], glide(u)), look: lerp3([0, 3, 2], [-2, 4, 4], u), fov: 38, roll: 0 }) },
  { id: 2, a: 31, b: 50, space: "world", cInf: 5, cam: (u) => ({ pos: lerp3([-15.5, 0.9, 27], [-14.8, 1.0, 26], u), look: [-4, 7.5, 4], fov: 52, roll: lerp(0.03, 0.06, u) }) },
  { id: 3, a: 50, b: 89, space: "world", cInf: 14, cam: (u) => ({ pos: lerp3([-11.8, 1.55, 21.2], [-11.2, 1.5, 20.2], u), look: [-8.5, 1.3, 15], fov: 32, roll: 0 }) },
  { id: 4, a: 89, b: 124, space: "world", cInf: 8, cam: (u) => ({ pos: lerp3([-9.6, 0.9, 10.5], [-10.0, 0.95, 9.8], u), look: lerp3([-15.4, 4.4, -0.5], [-15.9, 4.8, -1], u), fov: 56, roll: -0.03 }) },
  { id: 5, a: 124, b: 160, space: "world", cInf: 0, plane: (_u, f) => ({ p: [RX, 0, 187 + 72 * T(f - 124)], pitch: 0, gear: true, bank: 0 }), fan: spin(0.7),
    cam: (_u, f) => ({ pos: [RX - 40, 1.4, 255], look: [RX, 5.5, 187 + 72 * T(f - 124) + 6], fov: 42, roll: 0.02 }) },
  { id: 6, a: 160, b: 193, space: "plane", cInf: 0, fan: spin(0.7), flaps: () => 0.6,
    plane: (_u, f) => { const k = clamp01((f - 163) / 28); return { p: [RX, 7 * ease(k) ** 1.5, 300 + 76 * T(f - 160)], pitch: 0.16 * ease(k * 1.4), gear: true, bank: 0 }; },
    cam: (u) => ({ pos: lerp3([-62, 14, -32], [-60, 15, -30], u), look: [-8, 6, 10], fov: 44, roll: lerp(0.0, -0.06, u) }) },
  { id: 7, a: 193, b: 215, space: "plane", cInf: 0, plane: cruise(193), fan: spin(0.7), cam: (u) => ({ pos: lerp3([-80, 4, -2], [-76, 3.6, -4], u), look: [-10, 4, -4], fov: 44, roll: 0 }) },
  { id: 8, a: 215, b: 240, space: "plane", cInf: 0, plane: cruise(215), fan: spin(0.7), cam: (u) => ({ pos: lerp3([-46, -10, -48], [-44, -8, -44], u), look: [-16, 3, -6], fov: 48, roll: 0.05 }) },
  { id: 9, a: 240, b: 263, space: "world", cInf: 0, fan: spin(0.7), plane: (_u, f) => { const k = (f - 240) / 23; return { p: [RX, 34 + 14 * k, 340 + 80 * k], pitch: 0.2, gear: false, bank: 0 }; },
    cam: (u) => ({ pos: lerp3([RX - 60, 1.0, 330], [RX - 59.4, 0.95, 330.5], u), look: [RX - 44.4, 6.2, 342.5], fov: 52, roll: 0.04 }) },
  { id: 10, a: 263, b: 309, space: "chase", cInf: 0, fan: spin(0.7),
    plane: (_u, f) => { const k = (f - 263) / FPS, surge = f < 287 ? 0 : 12.8 * Math.max(0, k - 0.8) ** 1.6; return { p: [0, 520 + surge, 0], pitch: 0.12 + 0.05 * clamp01((f - 287) / 20), gear: false, bank: 0 }; },
    cam: (u) => ({ pos: lerp3([-26, -10, 22], [-27, -8.5, 19], u), look: [-10, 3, -2], fov: 52, roll: -0.06 }) },
  // ---- the hand out of the car window ----
  { id: 11, a: 309, b: 345, space: "world", cInf: 0, cam: (u, f) => ({ pos: [ROAD_X - 5.6, 1.45, carZ(f) + lerp(3.4, 1.6, u)], look: [ROAD_X, 1.05, carZ(f) - 0.3], fov: 44, roll: 0 }) },
  { id: 12, a: 345, b: 390, space: "car", cInf: 10, cam: (u) => ({ pos: lerp3([-2.6, 1.5, 3.3], [-2.45, 1.48, 3.0], u), look: [-0.85, 1.15, -0.1], fov: 42, roll: 0.02 }) },
  { id: 13, a: 390, b: 434, space: "car", cInf: 10, cam: (u) => ({ pos: lerp3([-3.0, 1.3, 2.7], [-2.8, 1.32, 2.4], u), look: [-0.95, 1.25, -0.1], fov: 42, roll: -0.03 }) },
  // ---- the wing does the same, only huge ----
  { id: 14, a: 434, b: 474, space: "plane", cInf: 0, plane: cruise(434), fan: spin(0.7), cam: (u) => ({ pos: lerp3([-60, 6, -4], [-56, 5.6, -5], u), look: [-14, 5, -6], fov: 44, roll: 0 }) },
  { id: 15, a: 474, b: 507, space: "world", cInf: 0, cam: (u) => ({ pos: lerp3([-41, 1.0, 1], [-40, 1.05, -0.5], u), look: [-14, 6, -7], fov: 54, roll: 0.03 }) },
  // ---- the wing-section model ----
  { id: 16, a: 507, b: 555, space: "world", cInf: 9, cam: (u) => ({ pos: lerp3([-55, 2.3, 73], [-53.5, 2.4, 72.4], u), look: [-40, 3.0, 71], fov: 46, roll: 0 }) },
  { id: 17, a: 555, b: 605, space: "world", cInf: 6, cam: (u) => ({ pos: lerp3([-52, 3.6, 70.5], [-51, 3.6, 70.2], u), look: [-40, 3.5, 70], fov: 44, roll: 0 }) },
  { id: 18, a: 605, b: 648, space: "world", cInf: 6, cam: (u) => ({ pos: lerp3([-51, 4.9, 70.6], [-50.4, 4.9, 70.3], u), look: [-40, 4.4, 70], fov: 42, roll: 0.02 }) },
  { id: 19, a: 648, b: 680, space: "world", cInf: 6, cam: (u) => ({ pos: lerp3([-51, 2.0, 70.6], [-50.4, 2.1, 70.3], u), look: [-40, 2.6, 70], fov: 42, roll: -0.02 }) },
  { id: 20, a: 680, b: 735, space: "world", cInf: 8, cam: (u) => ({ pos: lerp3([-56, 2.6, 74], [-54.5, 2.7, 73.4], u), look: [-40, 3.4, 71], fov: 46, roll: 0 }) },
  // ---- flaps on take-off ----
  { id: 21, a: 735, b: 789, space: "plane", cInf: 0, fan: spin(0.7), flaps: () => 0,
    plane: (_u, f) => ({ p: [RX, 0, 600 + 60 * T(f - 735)], pitch: 0, gear: true, bank: 0 }),
    cam: (u) => ({ pos: lerp3([-32, 17, -42], [-30, 16, -39], u), look: [-12, 5, -10], fov: 46, roll: 0.03 }) },
  { id: 22, a: 789, b: 821, space: "plane", cInf: 0, fan: spin(0.7), flaps: (u) => ease(u * 1.3),
    plane: (_u, f) => ({ p: [RX, 0, 600 + 60 * T(f - 735)], pitch: 0, gear: true, bank: 0 }),
    cam: (u) => ({ pos: lerp3([-25, 9.5, -25], [-24, 9.2, -24], u), look: [-10, 4.5, -12.5], fov: 42, roll: -0.03 }) },
  { id: 23, a: 821, b: 848, space: "plane", cInf: 0, fan: spin(0.7), flaps: () => 1,
    plane: (u, f) => ({ p: [RX, 6 * ease(u) ** 1.4, 600 + 70 * T(f - 735)], pitch: 0.14 * ease(u * 1.3), gear: true, bank: 0 }),
    cam: (u) => ({ pos: lerp3([-46, 3, -8], [-44, 2.6, -7], u), look: [-6, 6, 2], fov: 44, roll: 0 }) },
  // ---- 750 kg per square metre: a car on the wing ----
  { id: 24, a: 848, b: 905, space: "world", cInf: 0, cam: (u) => ({ pos: lerp3([-24, 12.5, 6], [-23.4, 12.1, 5.2], u), look: [-15.4, 5.8, -6], fov: 54, roll: 0 }) },
  { id: 25, a: 905, b: 978, space: "world", cInf: 0, cam: (u) => ({ pos: lerp3([-29, 11, 7], [-28, 10.6, 6], u), look: [-16, 6.4, -6], fov: 46, roll: 0.02 }) },
  { id: 26, a: 978, b: 1014, space: "world", cInf: 0, cam: (u) => ({ pos: lerp3([-6, 64, 46], [-5, 58, 40], u), look: [0, 5, -6], fov: 44, roll: 0 }) },
  { id: 27, a: 1014, b: 1047, space: "world", cInf: 9, cam: (u) => ({ pos: lerp3([-8.4, 8.0, 1.8], [-8.8, 7.9, 1.2], u), look: [-12.5, 6.7, -5], fov: 40, roll: 0 }) },
  // ---- engines only push forward ----
  { id: 28, a: 1047, b: 1105, space: "world", cInf: 10, fan: spin(0.25), cam: (u) => ({ pos: lerp3([-5.0, 1.7, ENG_L.z + 12], [-5.4, 1.75, ENG_L.z + 11], u), look: [-9.6, 2.6, ENG_L.z + 1], fov: 46, roll: 0 }) },
  { id: 29, a: 1105, b: 1155, space: "plane", cInf: 0, plane: cruise(1105), fan: spin(0.7), cam: (u) => ({ pos: lerp3([-52, 2, -6], [-49, 2.2, -7], u), look: [-12, 3.8, -6], fov: 44, roll: 0 }) },
  // ---- 1982: volcanic ash, all four engines out ----
  { id: 30, a: 1155, b: 1214, space: "follow", light: "golden", cInf: 0, plane: (_u, f) => gold(f), fan: spin(0.7), cam: (u) => ({ pos: lerp3([-120, 10, 40], [-105, 8, 20], u), look: [0, 6, 6], fov: 40, roll: 0 }) },
  { id: 31, a: 1214, b: 1256, space: "follow", light: "golden", cInf: 0, plane: (_u, f) => gold(f), fan: spin(0.7), cam: (u) => ({ pos: lerp3([-30, 18, -70], [-26, 16, -62], u), look: [0, 20, 200], fov: 46, roll: 0.03 }) },
  { id: 32, a: 1256, b: 1291, space: "plane", light: "golden", cInf: 0, plane: (_u, f) => gold(f), fan: spin(0.7), cam: (u) => ({ pos: lerp3([-44, 7, 26], [-41, 7.5, 23], u), look: [-10, 5, 0], fov: 46, roll: -0.04 }) },
  { id: 33, a: 1291, b: 1313, space: "plane", light: "golden", cInf: 0, plane: (_u, f) => gold(f), fan: (u) => 0.7 * (1 - ease(u * 1.6)), cam: (u) => ({ pos: lerp3([-15.5, 1.6, 10], [-15, 1.7, 9], u), look: [-11, 3.0, 0], fov: 42, roll: 0.03 }) },
  { id: 34, a: 1313, b: 1346, space: "follow", light: "golden", cInf: 0, plane: (_u, f) => gold(f), fan: spin(0.03), cam: (u) => ({ pos: lerp3([-70, 2, 34], [-64, 3, 28], u), look: [0, 4, -2], fov: 44, roll: 0 }) },
  { id: 35, a: 1346, b: 1378, space: "follow", light: "golden", cInf: 0, plane: (_u, f) => gold(f), fan: spin(0.03), cam: (u) => ({ pos: lerp3([-150, 20, -40], [-140, 16, -30], u), look: [0, 2, 20], fov: 36, roll: 0.02 }) },
  { id: 36, a: 1378, b: 1410, space: "follow", light: "golden", cInf: 0, plane: (_u, f) => gold(f), fan: spin(0.03), cam: (u) => ({ pos: lerp3([30, -30, 120], [26, -26, 110], u), look: [0, 6, 0], fov: 42, roll: -0.05 }) },
  { id: 37, a: 1410, b: 1440, space: "plane", light: "golden", cInf: 0, plane: (_u, f) => gold(f), fan: (u) => 0.7 * ease((u - 0.25) * 2), cam: (u) => ({ pos: lerp3([-26, 2, 22], [-24, 2.2, 20], u), look: [-14, 3.6, 2], fov: 44, roll: 0.03 }) },
  { id: 38, a: 1440, b: 1456, space: "follow", light: "golden", cInf: 0, plane: (_u, f) => gold(f), fan: spin(0.7), cam: (u) => ({ pos: lerp3([-60, -14, -70], [-58, -16, -66], u), look: [0, 10, 30], fov: 46, roll: 0.04 }) },
  // ---- outro ----
  { id: 39, a: 1456, b: 1520, space: "world", cInf: 0, fan: spin(0.7), plane: (_u, f) => { const k = (f - 1456) / 64; return { p: [RX, 40 + 16 * k, 290 + 110 * k], pitch: 0.18, gear: false, bank: 0 }; },
    cam: (u) => ({ pos: lerp3([RX - 60, 1.0, 330], [RX - 59.2, 0.95, 330.6], u), look: [RX - 44.4, 6.4, 342.5], fov: 52, roll: 0.03 }) },
  { id: 40, a: 1520, b: TOTAL, space: "world", cInf: 10, fan: spin(0.7), plane: (_u, f) => { const k = (f - 1456) / 64; return { p: [RX, 40 + 16 * k, 290 + 110 * k], pitch: 0.18, gear: false, bank: 0 }; },
    cam: (u) => ({ pos: lerp3([RX - 59.0, 1.6, 329.0], [RX - 58.4, 1.6, 329.6], u), look: [RX - 56.2, 1.5, 333.4], fov: 40, roll: 0 }) },
];
export const XFADE: Record<number, number> = {};
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const lightAt = (f: number): Light => shotAt(f).light ?? "day";
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];
const KICKS = [31, 287, 399, 702, 925, 1291, 1418];
const kick = (f: number) => {
  for (const k of KICKS) { const d = f - k; if (d >= 0 && d < 7) return (Math.floor(d) % 2 ? -1 : 1) * 0.05 * (1 - d / 7); }
  return 0;
};
export const camAt = (id: number, f: number): Cam => {
  const s = SHOTS[id - 1], u = clamp01((f - s.a) / Math.max(1, s.b - s.a));
  const c = s.cam(u, f);
  const k = 0.0025 * Math.max(0, f - s.a);
  return { ...c, pos: lerp3(c.pos, c.look, Math.min(0.2, k * 0.4)), roll: c.roll + kick(f) };
};
export const dofAt = (f: number) => ({ cInf: shotAt(f).cInf });
export const planePose = (id: number, f: number): Pose => {
  const s = SHOTS[id - 1];
  return s.plane ? s.plane(clamp01((f - s.a) / Math.max(1, s.b - s.a)), f) : PARK;
};

// ---------------- effect drawings ----------------
const flowDraw = (ph: number) => (p: Pen) => {
  // 1400 x 520 canvas = 70 m (z: +38 at the right .. -32 at the left) x 26 m (y: +17 top .. -9 bottom), 20 px / m
  const X = (z: number) => (z + 32) * 20, Y = (y: number) => (17 - y) * 20;
  p.ol = 3;
  const down = (z: number) => ease((6 - z) / 34);
  for (const [y0, dd] of [[15.5, 3.5], [12, 5.5], [1.8, 7], [-1.6, 6], [-5.5, 4.5]] as [number, number][]) {
    const pts: [number, number][] = [];
    for (let z = 38; z >= -32; z -= 1) pts.push([X(z), Y(y0 - dd * down(z) + (y0 > 6 ? 1.2 * Math.exp(-(((z + 4) / 9) ** 2)) : -0.8 * Math.exp(-(((z + 4) / 9) ** 2))))]);
    arrowsAlong(p, pts, ph, 10, 4, 6);
  }
};
/** dashes with arrow heads travelling along a polyline (from its first point to its last) */
const arrowsAlong = (p: Pen, pts: [number, number][], ph: number, n: number, len: number, w: number) => {
  const N = pts.length;
  for (let s = -1; s < n + 1; s++) {
    const i0 = Math.floor(((s + (ph % 1)) / n) * N), seg = pts.slice(Math.max(0, i0), Math.min(N, i0 + len));
    if (seg.length < 2) continue;
    p.line(seg, "#ffffff", w);
    if (seg.length === len) {
      const [bx, by] = seg[seg.length - 1], [ax, ay] = seg[seg.length - 2], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, k = w * 1.7;
      p.line([[bx - ux * k - uy * k, by - uy * k + ux * k], [bx, by], [bx - ux * k + uy * k, by - uy * k - ux * k]], "#ffffff", w);
    }
  }
};
const vline = (ph: number, seed: number, up: boolean) => (p: Pen) => {
  // 200 x 800 canvas: a wavy wind line falling (up = false) or rising (up = true) with a chevron at its head
  p.ol = 3;
  const pts: [number, number][] = [], y0 = up ? 900 - ((ph + seed * 0.29) % 1) * 1100 : ((ph + seed * 0.37) % 1) * 1100 - 500;
  for (let y = y0; up ? y > y0 - 420 : y < y0 + 420; y += up ? -20 : 20) if (y > 0 && y < 800) pts.push([100 + 24 * Math.sin(y / 65 + seed), y]);
  if (pts.length > 1) p.line(pts, "#ffffff", 10);
  if (pts.length > 3) { const [x, y] = pts[pts.length - 1], d = up ? 30 : -26; p.line([[x - 24, y + d], [x, y], [x + 24, y + d]], "#ffffff", 10); }
};
const ARM_COL = "#8b4828";
const armDraw = (deg: number) => (p: Pen) => {
  // 600 x 420 canvas: shoulder at the right edge (inside the window), straight arm to an open palm on the left
  p.ol = 5;
  const a = (deg * Math.PI) / 180, S: [number, number] = [600, 330], L = 380;
  const H: [number, number] = [S[0] - Math.cos(a) * L, S[1] - Math.sin(a) * L];
  p.line([S, [(S[0] + H[0]) / 2, (S[1] + H[1]) / 2 - 4], H], ARM_COL, 26);
  p.ell(H[0] - Math.cos(a) * 36, H[1] - Math.sin(a) * 36, 58, 24, "#f8f6f0", 8, 0, 360, deg);
  p.line([[H[0] - Math.cos(a) * 30 + Math.sin(a) * 22, H[1] - Math.sin(a) * 30 - Math.cos(a) * 22], [H[0] - Math.cos(a) * 10 + Math.sin(a) * 40, H[1] - Math.sin(a) * 10 - Math.cos(a) * 40]], "#f8f6f0", 16); // thumb
};
const windDraw = (ph: number) => (p: Pen) => {
  // 900 x 300: horizontal gusts rushing right -> left past the hand
  p.ol = 3;
  for (const [y, k] of [[60, 0], [150, 0.4], [240, 0.75]] as [number, number][]) {
    const pts: [number, number][] = [];
    for (let x = 900; x >= 0; x -= 30) pts.push([x, y + 10 * Math.sin(x / 90 + k * 5)]);
    arrowsAlong(p, pts, ph + k, 3, 6, 7);
  }
};
/** the wing-section card: 1600 x 800 px = 20 m (z 61 .. 81) x 10 m (y -1.6 .. 8.4), 80 px / m */
const FX0 = 61, FY1 = 8.4, FPX = 80;
const fX = (z: number) => (z - FX0) * FPX, fY = (y: number) => (FY1 - y) * FPX;
const sOf = (z: number) => clamp01((FOIL.zLE - z) / FOIL.chord);
const foilFlow = (ph: number) => (p: Pen) => {
  p.ol = 3;
  for (const [dy, top, fk] of [[0.4, 1, 1], [1.05, 1, 0.7], [1.8, 1, 0.4], [-0.4, 0, 1], [-1.0, 0, 0.65], [-1.7, 0, 0.35]] as [number, number, number][]) {
    const pts: [number, number][] = [];
    for (let z = 81; z >= 61; z -= 0.25) {
      const s = sOf(z), inside = z <= FOIL.zLE && z >= FOIL.zLE - FOIL.chord;
      const bump = inside ? (top ? foilTop(s) : foilBot(s)) - FOIL.y : 0;
      const wake = z < FOIL.zLE - FOIL.chord ? -0.5 * ease((FOIL.zLE - FOIL.chord - z) / 5) : 0;
      pts.push([fX(z), fY(FOIL.y + dy + bump * fk + wake)]);
    }
    arrowsAlong(p, pts, ph * (top ? 2.1 : 1.0), top ? 9 : 7, top ? 12 : 8, 7);
  }
};
const foilMolecules = (ph: number, arrows: number, seed = 0) => (p: Pen) => {
  p.ol = 3;
  let s = 11 + seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  // above: few particles, racing back (low pressure)
  for (let i = 0; i < 13; i++) {
    const z = 81 - ((r() * 20 + ph * 9) % 20), lift = 0.35 + r() * 2.4, sz = sOf(z);
    const y = (z <= FOIL.zLE && z >= FOIL.zLE - FOIL.chord ? foilTop(sz) : FOIL.y + 0.2) + lift;
    p.ell(fX(z), fY(y), 13, 13, "#ffffff", 4);
    p.line([[fX(z) + 18, fY(y)], [fX(z) + 60, fY(y)]], "#ffffff", 4, false);
  }
  // below: crowded, slow, jostling particles (high pressure)
  for (let i = 0; i < 46; i++) {
    const z = 81 - ((r() * 20 + ph * 3) % 20), sz = sOf(z), drop = 0.3 + r() * 2.2;
    const y = (z <= FOIL.zLE && z >= FOIL.zLE - FOIL.chord ? foilBot(sz) : FOIL.y - 0.2) - drop + 0.08 * Math.sin(ph * 40 + i);
    p.ell(fX(z) + 4 * Math.sin(ph * 31 + i * 2), fY(y), 13, 13, "#ffd0a0", 4);
  }
  // pushing-up arrows under the wing
  for (let i = 0; i < 5; i++) if (arrows > 0) {
    const z = FOIL.zLE - FOIL.chord * (0.15 + 0.17 * i), y0 = foilBot(sOf(z)) - 2.8 + 0.7 * ((ph * 2 + i * 0.3) % 1), L = 1.6 * arrows;
    p.line([[fX(z), fY(y0)], [fX(z), fY(y0 + L)]], "#ffffff", 14);
    p.line([[fX(z) - 26, fY(y0 + L) + 30], [fX(z), fY(y0 + L)], [fX(z) + 26, fY(y0 + L) + 30]], "#ffffff", 14);
  }
};
const smokeDraw = (t: number, dark: boolean) => (p: Pen) => {
  p.ol = 4;
  const col = dark ? "#55505a" : "#e8e6e2";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4, d = 30 + 80 * t, r = (40 + 16 * (i % 2)) * (0.6 + 0.6 * t);
    p.ell(150 + Math.cos(a) * d, 150 + Math.sin(a) * d * 0.7, r, r * 0.9, col, 5);
  }
  p.ell(150, 150, 60 * (0.7 + 0.5 * t), 52 * (0.7 + 0.5 * t), col, 5);
};
const exhaustDraw = (ph: number) => (p: Pen) => {
  // 1000 x 200 canvas: hot exhaust lines blasting toward the left (backward)
  p.ol = 3;
  for (const [y, k] of [[50, 0], [100, 0.33], [150, 0.66]] as [number, number][]) {
    const pts: [number, number][] = [];
    for (let x = 1000; x >= 0; x -= 25) pts.push([x, y + 12 * Math.sin(x / 60 + ph * 20 + k * 6) * (1 - x / 1000)]);
    arrowsAlong(p, pts, ph * 2.5 + k, 4, 7, 8);
  }
};
export const fwdArrow = (t: number) => (p: Pen) => {
  // 600 x 300: a fat forward (right-pointing) arrow
  p.ol = 5;
  const L = 520 * ease(t * 2);
  p.poly([[40, 120], [40 + L - 90, 120], [40 + L - 90, 70], [40 + L, 150], [40 + L - 90, 230], [40 + L - 90, 180], [40, 180]], "#ffffff", 10);
};

// ---------------- world ----------------
export class AirWorld {
  root = new THREE.Group();
  plane = new THREE.Group();
  inner = new THREE.Group();
  gear = new THREE.Group();
  parts: PlaneParts;
  car = new THREE.Group();
  carProto: THREE.Group;
  wingCars: THREE.Group[] = [];
  foil: THREE.Group; foilStand: THREE.Group;
  square = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private clouds: THREE.Mesh[] = [];
  private nearClouds: THREE.Mesh[] = [];
  private seaClouds: THREE.Mesh[] = [];
  private ash: THREE.Mesh[] = [];
  private cloudMats: Record<Light, THREE.MeshBasicMaterial[]>;
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
    const mk = (pal: typeof CLOUD_GOLD, k: number) => new THREE.MeshBasicMaterial({ map: cloudHD(k, pal), color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false });
    this.cloudMats = { day: [0, 1, 2, 3].map((k) => mk(LOOK.day.cloud, k)), golden: [0, 1, 2, 3].map((k) => mk(CLOUD_GOLD, k)) };
    const ASH = { lit: "#8a7c80", mid: "#5f5660", shade: "#3c3540" };
    const ashMats = [0, 1, 2, 3].map((k) => { const m = mk(ASH, k); m.color.setRGB(1, 1, 1); return m; });
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.cloudMats.day[i % 4]);
      const w = 150 + (i % 4) * 34; m.scale.set(w, w / 2, 1); m.userData = { a: (i / 12) * Math.PI * 2 + 0.3, d: 600 + (i % 3) * 70, h: 60 + (i % 4) * 30, k: i % 4 };
      m.layers.set(NOINK); this.clouds.push(m); R.add(m);
    }
    let s = 7; const rr = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 90; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.cloudMats.day[i % 4]);
      const w = 40 + rr() * 70; m.scale.set(w, w / 2, 1);
      const side = rr() < 0.5 ? -1 : 1;
      m.position.set(RX + side * (40 + rr() * 220), 250 + rr() * 140, 2400 + rr() * 2900);
      if (i > 65) m.position.set((rr() - 0.5) * 400, 420 + rr() * 200, (rr() - 0.5) * 400 - 60);
      m.layers.set(NOINK); this.nearClouds.push(m); R.add(m);
    }
    // golden: a sea of clouds below the cruising plane, and the volcanic ash cloud ahead
    for (let i = 0; i < 150; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.cloudMats.golden[i % 4]);
      const w = 90 + rr() * 140; m.scale.set(w, w / 2, 1);
      m.position.set((rr() - 0.5) * 1100, 220 + rr() * 90, 5500 + rr() * 2400);
      m.layers.set(NOINK); this.seaClouds.push(m); R.add(m);
    }
    for (let i = 0; i < 60; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), ashMats[i % 4]);
      const w = 70 + rr() * 110; m.scale.set(w, w * 0.6, 1);
      m.position.set((rr() - 0.5) * 360, 330 + rr() * 160, 6450 + rr() * 480);
      m.layers.set(NOINK); this.ash.push(m); R.add(m);
    }
    buildAirport(R);
    // service road beyond the runway (the car drives here)
    const rb = new Batch();
    rb.add(new THREE.PlaneGeometry(8, 2400, 1, 240).rotateX(-Math.PI / 2), lam("roadM", () => ({ map: rep(apronTex(), 1, 60), color: "#8a8c94" })), new THREE.Matrix4().makeTranslation(ROAD_X, 0.07, 700));
    rb.add(new THREE.PlaneGeometry(0.25, 2400, 1, 240).rotateX(-Math.PI / 2), lam("roadLine", () => ({ color: "#f1efe8" })), new THREE.Matrix4().makeTranslation(ROAD_X, 0.11, 700));
    rb.build(R);
    this.parts = buildPlane(this.inner, this.gear);
    this.inner.add(this.gear);
    this.inner.position.set(0, 0, 5.2);
    this.plane.add(this.inner);
    R.add(this.plane);
    this.carProto = buildCar();
    this.car.add(this.carProto); R.add(this.car);
    // cars parked on the wings (shots 25-27), one prop instance per spot
    const spots: [number, number][] = [[SQ.x, SQ.s]];
    for (const sx of [-1, 1]) for (const x of [6.5, 11, 15.5, 20, 24.5]) for (const sc of [0.3, 0.68]) if (!(sx < 0 && (Math.abs(-x - SQ.x) < 2.5 || Math.abs(-x - hw.x) < 3.5))) spots.push([sx * x, sc]);
    for (const [x, sc] of spots) {
      const g = buildCar(); const w = wingAt(x);
      const zf = w.zLE - (sc - 0.16) * w.chord, zb = w.zLE - (sc + 0.16) * w.chord;
      const yf = wingTop(x, sc - 1.3 / w.chord), yb = wingTop(x, sc + 1.3 / w.chord);
      g.position.set(x, (yf + yb) / 2 - 0.0, (zf + zb) / 2 - 0.0);
      g.rotation.set(-Math.atan2(yf - yb, 2.6), 0, -Math.sign(x) * 0.088, "YXZ");
      g.scale.setScalar(0.9);
      g.userData.y0 = g.position.y;
      this.inner.add(g); this.wingCars.push(g);
    }
    // the painted square metre on the left wing
    const sq = new Batch(), om = lam("sqOrange", () => ({ color: "#f27a2a", emissive: "#f27a2a", emissiveIntensity: 0.15 }));
    const [qx, qy, qz] = wingPt(SQ.x, SQ.s);
    for (const [a, b] of [[V(-0.5, 0, -0.5), V(0.5, 0.04, -0.38)], [V(-0.5, 0, 0.38), V(0.5, 0.04, 0.5)], [V(-0.5, 0, -0.5), V(-0.38, 0.04, 0.5)], [V(0.38, 0, -0.5), V(0.5, 0.04, 0.5)]]) sq.add(boxGeo(a, b), om);
    sq.build(this.square, false);
    this.square.position.set(qx, qy + 0.02, qz); this.square.rotation.z = 0.088; this.inner.add(this.square);
    const fl = buildFoil(); this.foil = fl.model; this.foilStand = fl.stand; R.add(this.foil, this.foilStand);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  private shotSun(id: number) {
    let v = this.sunCache.get(id);
    if (v) return v;
    const s = SHOTS[id - 1], L = LIGHTS[s.light ?? "day"];
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) { const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const gold = s.light === "golden";
    const az = THREE.MathUtils.degToRad(gold ? 40 : L.az), el = THREE.MathUtils.degToRad(gold ? 14 : [8, 10, 36].includes(id) ? 62 : L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private posePlane(id: number, f: number) {
    const S = SHOTS[id - 1], u = clamp01((f - S.a) / Math.max(1, S.b - S.a)), P = planePose(id, f);
    this.plane.position.set(P.p[0], P.p[1], P.p[2] - 5.2);
    this.plane.rotation.set(-P.pitch, 0, P.bank);
    this.gear.visible = P.gear;
    const e = S.flaps ? S.flaps(u) : 0;
    for (const fl of this.parts.flaps) {
      fl.visible = e > 0.03;
      fl.userData.z0 ??= fl.position.z; fl.userData.y0 ??= fl.position.y;
      fl.position.z = fl.userData.z0 - 2.4 * e; fl.position.y = fl.userData.y0 - 0.35 * e; fl.rotation.x = -0.42 * e;
    }
    const sp = S.fan ? S.fan(u) : 0;
    this.parts.fans.forEach((fa, i) => { fa.rotation.z = -(fa.userData.a = (fa.userData.a ?? i) + sp); });
    this.plane.updateMatrixWorld(true);
  }
  private toWorld(p: V3) { return V(...p).applyMatrix4(this.inner.matrixWorld); }
  private carWorld(p: V3) { return V(...p).applyMatrix4(this.car.matrixWorld); }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, S = SHOTS[id - 1], light: Light = S.light ?? "day", L = LIGHTS[light], K = LOOK[light];
    const u = clamp01((f - S.a) / Math.max(1, S.b - S.a)); void u;
    this.posePlane(id, f);
    // car: drives along the service road (shots 11-13), dropped onto the wing square (25-27)
    const carShot = id >= 11 && id <= 13;
    this.car.visible = carShot;
    if (carShot) { this.car.position.set(ROAD_X, 0.02 * Math.sin(t * 23), carZ(f)); this.car.rotation.set(0.004 * Math.sin(t * 17), 0, 0); }
    this.car.updateMatrixWorld(true);
    const carsOn = id >= 25 && id <= 27;
    this.wingCars.forEach((g, i) => {
      g.visible = carsOn && (i === 0 || id >= 26);
      if (i === 0 && id === 25) { const k = clamp01((f - 905) / 20); g.position.y = g.userData.y0 + (k < 1 ? 14 * (1 - k * k) : 0.12 * Math.max(0, Math.sin((f - 925) * 0.9)) * Math.exp(-(f - 925) / 6)); }
      else g.position.y = g.userData.y0;
    });
    this.square.visible = id >= 24 && id <= 27;
    // teaching model: visible on the apron always; lifts in shot 20
    const lift = id === 20 ? 0.45 * ease((f - 690) / 22) + 0.05 * Math.sin(t * 9) * ease((f - 690) / 22) : 0;
    this.foil.position.y = lift;
    // camera
    const c = camAt(id, f);
    let pos: THREE.Vector3, look: THREE.Vector3;
    if (S.space === "plane") { pos = this.toWorld(c.pos); look = this.toWorld(c.look); }
    else if (S.space === "car") { pos = this.carWorld(c.pos); look = this.carWorld(c.look); }
    else if (S.space === "chase") { const base = planePose(id, S.a).p; pos = V(c.pos[0] + base[0], c.pos[1] + base[1], c.pos[2] + base[2]); look = this.toWorld(c.look); look.y = lerp(look.y, base[1] + 2, 0.6); }
    else if (S.space === "follow") { const b = planePose(id, f).p; pos = V(c.pos[0] + b[0], c.pos[1] + b[1], c.pos[2] + b[2]); look = V(c.look[0] + b[0], c.look[1] + b[1], c.look[2] + b[2]); }
    else { pos = V(...c.pos); look = V(...c.look); }
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look);
    if (S.space === "plane") { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, this.plane.rotation.z)); cam.quaternion.premultiply(q); }
    cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 3000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    // light rig
    const sunDir = this.shotSun(id), dist = pos.distanceTo(look);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const big = [1, 5, 6, 7, 8, 9, 10, 14, 21, 22, 23, 26, 29].includes(id) || light === "golden" || id === 39;
    const Rr = big ? 70 : THREE.MathUtils.clamp(dist * 1.2 + 14, 24, 60);
    const fc = big ? this.toWorld([0, 5, 0]) : look.clone();
    if (id === 9 || id === 39) fc.copy(V(RX - 30, 15, 355));
    if (carShot) fc.copy(this.carWorld([0, 1, 0]));
    this.sun.position.copy(fc).addScaledVector(sunDir, 300); this.sun.target.position.copy(fc);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 700; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    const skyC = light === "golden" ? ["#f3c497", "#efb592", "#d79c98", "#a58aa8", "#6c74a4"] : K.sky.c;
    skyC.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(light === "golden" ? "#efc2a0" : L.fog, this.fog.color);
    const high = cam.position.y > 150;
    this.fog.near = high ? 150 : 80; this.fog.far = high ? (light === "golden" ? 1500 : 1300) : 900;
    scene.fog = this.fog; scene.background = null;
    for (const m of this.clouds) {
      m.material = this.cloudMats[light][m.userData.k];
      m.position.set(cam.position.x + Math.cos(m.userData.a) * m.userData.d, (high ? cam.position.y - 40 : 0) + m.userData.h, cam.position.z + Math.sin(m.userData.a) * m.userData.d);
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
    }
    for (const m of this.nearClouds) { m.visible = high && light === "day"; if (m.visible) m.lookAt(cam.position); }
    for (const m of this.seaClouds) { m.visible = light === "golden"; if (m.visible) m.lookAt(cam.position); }
    for (const m of this.ash) { m.visible = id >= 31 && id <= 34; if (m.visible) m.lookAt(cam.position); }
    // ---- cast: our hero ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const k = Math.floor(f + seed * 37) % 70; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
    // the narration is a voice-over: the hero never lip-syncs it (user's rule)
    const talk = false;
    const used: Actor[] = [];
    let ai = 0;
    const people: { p: THREE.Vector3; fo: FrontOpts; flip?: boolean; scale?: number; yaw?: number }[] = [];
    const say = (rest: Expr): Expr => (talk ? "talk" : rest);
    let carArm = -1;
    if (id >= 2 && id <= 4) {
      const expr: Expr = id === 2 ? "shock" : id === 3 ? (talk ? "talk" : "nervous") : say("smile");
      people.push({ p: V(...(id === 4 ? HERO_WING : HERO_AT)), fo: { mode: "stand", expr, blink: id === 2 ? 0 : lid(1), seed: 4, look: id === 4 ? 1 : 0, headTilt: id === 3 ? -6 : 0, wave: id === 4 ? 1 : id === 3 ? 0.15 + 0.1 * Math.sin(t * 5) : undefined, facing: id === 4 ? 1 : 0 } });
    }
    if (id === 1) people.push({ p: V(...HERO_AT), fo: { mode: "stand", expr: "smile", seed: 4 } });
    if (id === 9 || id === 39) people.push({ p: V(...HERO_FIELD), fo: { mode: "stand", expr: talk ? "laugh" : "grin", blink: lid(2), seed: 4, wave: 0.8 + 0.2 * Math.sin(t * 9), look: 1, headTilt: 5 } });
    if (id === 40) people.push({ p: V(...HERO_FIELD), fo: { mode: "stand", expr: talk ? "talk" : "grin", blink: lid(2), seed: 4, wave: 0.5 + 0.5 * Math.sin(t * 8), headTilt: 3 * Math.sin(t * 3) } });
    if (carShot) {
      const r = id === 13 ? 32 * ease((f - 396) / 8) : 0;
      people.push({ p: this.carWorld([-0.5, 0.32, -0.1]), scale: 0.8, fo: { mode: "sit", expr: id === 13 ? (f > 398 ? "laugh" : "shock") : say("grin"), blink: lid(3), seed: 4, headTilt: id === 13 ? 4 : 0 } });
      carArm = r;
    }
    if (id === 15) people.push({ p: V(-33, 0, -1.6), fo: { mode: "stand", expr: "shock", blink: lid(1), seed: 4, wave: 1, look: 1 } });
    if (id === 16 || id === 20) people.push({ p: V(...HERO_FOIL), flip: true, fo: { mode: "stand", expr: id === 20 ? (f > 702 ? "grin" : "shock") : say("smile"), blink: lid(1), seed: 4, wave: id === 16 ? 0.9 : 1, look: 1, facing: 1 } });
    if (id === 24 || id === 25 || id === 27) {
      const [x, y, z] = wingPt(hw.x, hw.s);
      const ex: Expr = id === 25 ? (f < 925 ? "shock" : f < 945 ? "dazed" : "laugh") : id === 27 ? "laugh" : say("smile");
      people.push({ p: this.toWorld([x, y, z]), fo: { mode: "stand", expr: ex, blink: lid(1), seed: 4, wave: id === 24 ? 0.6 : id === 27 ? 0.7 + 0.3 * Math.sin(t * 8) : undefined, look: id === 24 ? -1 : 0 } });
    }
    if (id === 28) people.push({ p: V(-6.9, 0, ENG_L.z + 4.2), fo: { mode: "stand", expr: talk ? "talk" : "stern", blink: lid(2), seed: 4, headTilt: 7 * Math.sin(t * 7), look: -1 } });
    for (const pp of people) {
      const w = pp.p, d = cam.position.distanceTo(w);
      const [cw, ch, k] = d < 4 ? [1800, 3000, 3.0] : d < 9 ? [1080, 1800, 1.8] : d < 20 ? [600, 1000, 1.0] : [300, 500, 0.5];
      const fo: FrontOpts = { ...pp.fo, light: L2D };
      const a = this.actor(ai++);
      a.r = this.pool.req(`hero|${JSON.stringify(fo, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, k, (pen) => bodyFront(pen, HERO, fo));
      a.mesh.visible = true; a.mesh.position.copy(w);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - w.x, cam.position.z - w.z), 0);
      const sc0 = pp.scale ?? 1; a.mesh.scale.set(pp.flip ? -sc0 : sc0, sc0, sc0); a.mesh.castShadow = false;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- effects ----
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
    const side = pq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)));
    if (id === 7 || id === 14) addFx(`flow|${ph}`, 1400, 520, flowDraw(ph * 1.5), this.toWorld([-36, 4, 3]), 70, 26, side);
    if (id === 8) for (let i = 0; i < 12; i++) {
      const x = -8 - i * 1.9, wa = wingAt(x), z = wa.zLE - wa.chord - 1.5 - (i % 3) * 1.2;
      addFx(`fall|${i}|${ph}`, 200, 800, vline(ph * 1.2, i, false), this.toWorld([x, wa.y - 7, z]), 2.6, 10.4, null);
    }
    if (id === 10) for (let i = 0; i < 8; i++) {
      const x = -6 - i * 3, wa = wingAt(x), z = wa.zLE - wa.chord * (0.3 + 0.12 * (i % 3));
      addFx(`push|${i}|${ph}`, 200, 800, vline(ph * 1.4, i, true), this.toWorld([x, wa.y - 6, z]), 2.4, 9.6, null);
    }
    if (carArm >= 0 && id !== 11) {
      const at = this.carWorld([-0.98, 1.02, -0.05]);
      addFx(`arm|${Math.round(carArm)}`, 600, 420, armDraw(carArm), at.addScaledVector(right, -0.22).add(V(0, 0.07, 0)), 0.66, 0.462, null);
    }
    if (id === 12 || id === 13) addFx(`wind|${ph}`, 900, 300, windDraw(ph * 2), this.carWorld([-1.3, 1.62, -1.2]), 2.4, 0.8, null);
    const foilQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0));
    const foilAt = V(-41.9, 3.4 + lift, 71);
    if (id === 17) addFx(`foilflow|${ph}`, 1600, 800, foilFlow(ph), foilAt, 20, 10, foilQ);
    if (id >= 18 && id <= 20) addFx(`mol|${ph}|${id === 20 ? 1 : 0}`, 1600, 800, foilMolecules(ph, id === 20 ? ease((f - 684) / 16) : 0), foilAt, 20, 10, foilQ);
    if (id === 29) {
      for (const x of [-21, -11]) { const w = wingAt(x); addFx(`exh|${x}|${ph}`, 1000, 200, exhaustDraw(ph + x * 0.1), this.toWorld([-24, w.y - 2.1, w.zLE + 2.2 - 3.6 - 12.5]), 25, 5, side); }
    }
    if (id === 32) for (let i = 0; i < 6; i++) {
      const x = [-21, -11, 11, 21, -16, -6][i], w = wingAt(x), k = ((f * 0.21 + i * 0.37) % 1);
      addFx(`spark|${Math.round(k * 10)}`, 500, 500, (p) => fxBurst(p, k, "#fff3b0", 8, 30, 200), this.toWorld([x, w.y - (i < 4 ? 2.1 : -0.3), w.zLE + (i < 4 ? 5.4 : 0.2)]), 2.6, 2.6, null);
    }
    if (id >= 33 && id <= 35) {
      const st = id === 33 ? Math.max(0, f - 1294) : 30 + f - 1313;
      for (const x of id === 33 ? [-11, -21] : [-21, -11, 11, 21]) {
        const w = wingAt(x), k = ((st / 24 + x * 0.013) % 1 + 1) % 1;
        if (st > 0) addFx(`smoke|${Math.round(k * 12)}`, 300, 300, smokeDraw(k, true), this.toWorld([x, w.y - 2.1 + k * 0.8, w.zLE + 2.2 - 4 - 10 * k]), 3 + 4 * k, 3 + 4 * k, null);
      }
    }
    if (id === 37) for (const x of [-21, -11]) {
      const k = clamp01((f - 1416) / 14), w = wingAt(x);
      if (k > 0 && k < 1) addFx(`relight|${Math.round(k * 12)}`, 500, 500, (p) => fxBurst(p, k, "#ffb85a", 10, 40, 230), this.toWorld([x, w.y - 2.1, w.zLE + 2.2 - 4.2]), 4.5, 4.5, null);
      if (f > 1424) addFx(`exh2|${x}|${ph}`, 1000, 200, exhaustDraw(ph), this.toWorld([x - 1.8, w.y - 2.1, w.zLE + 2.2 - 3.6 - 9]), 18, 3.6, side);
    }
    if (id === 25 && f >= 925 && f < 940) { const k = (f - 925) / 15; addFx(`dust|${Math.round(k * 10)}`, 300, 300, (p) => fxPuff(p, k), this.toWorld(wingPt(SQ.x, SQ.s)).add(V(0, 0.5, 0)), 5, 5, null); }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    // focus target for the lens blur
    if (people.length && ![1, 15].includes(id)) return people[0].p.clone().add(V(0, 1.1, 0));
    if (id >= 16 && id <= 20) return V(-41.5, 3.4, 71);
    if (S.space === "plane" || S.space === "chase" || S.space === "follow") return this.toWorld([-12, 5, -4]);
    return look;
  }
}
