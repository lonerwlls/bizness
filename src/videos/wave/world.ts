// "Don't wave": a town at the edge of a foggy gorge, a stone bridge, and an identical town on the other side
// (the same build turned 180 degrees about the bridge middle). Flat cartoon cast as lit cards; every cut,
// reaction and fog change is keyed to a word of the narration (voice.ts).
import * as THREE from "three";
import { Batch, V, lam, boxGeo, house, prop } from "../bridge/build";
import { rep, ctex, cobbleHD, stoneHD, grassHD, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, Outfit, Expr, FrontOpts, INK, fxBurst, fxContact } from "../bridge/toon";
import { LIGHTS, LOOK } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { makeKit } from "../bridge/kitgen";
import { VOICE } from "./voice";

export const FPS = 30;
export type V3 = [number, number, number];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- narration timing ----------------
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9-]/g, "");
export const wt = (w: string, n = 1) => {
  let k = 0;
  for (const x of VOICE.words) if (norm(x.w) === norm(w) && ++k === n) return x.t;
  throw new Error(`word not found: ${w} #${n}`);
};
export const wf = (w: string, n = 1) => Math.max(0, Math.round(wt(w, n) * FPS) - 2);
export const TOTAL = Math.ceil((VOICE.dur + 1.2) * FPS);
const T = (w: string, n = 1) => wt(w, n) - 0.07;

// ---------------- layout ----------------
// town A (Leo's) lies at z < -2, the gorge runs z -2 .. 28, town B is town A turned 180 deg about (0, MID)
export const WALK = 0.15;
const SIDE_IN = 4, SIDE_OUT = 7.2;
const BANK = -2, MID = 13;
const DECK = 0.15;
/** the other side: the same spot in the twin town */
const mir = (p: V3): V3 => [-p[0], p[1], 2 * MID - p[2]];
const LEO0: V3 = [0.8, 0, -5.2];
const TOWER: V3 = [-11.5, 0, -11];          // clock tower base centre, faces +z (bridge) and +x (street)
const CLOCK_Y = 13.5;
const CLOCK_F: V3 = [TOWER[0], CLOCK_Y, TOWER[2] + 2.53];
const BAKERY_Z = -13.5;
const MAILBOX: V3 = [5.5, WALK, -4.8];
const SIGN: V3 = [3.0, 0, -3.0];
const MEET_L: V3 = [0.42, DECK, MID], MEET_R: V3 = [-0.42, DECK, MID]; // face to face across the deck

// ---------------- cast ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const FOLK: Outfit[] = [
  { jacket: "#3f9a5a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#3a2418", skin: HEAD },
  { jacket: "#c25a7a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#d8a040", skin: HEAD, dress: "#d9a441" },
  { jacket: "#7b5ac9", pants: "#2e3a5a", boots: INK, hat: "cap", cap: "#e2453c", skin: HEAD },
  { jacket: "#d84a3a", pants: "#3b3f52", boots: INK, hat: "tophat", skin: HEAD, moustache: "#4a3020", build: "stout" },
  { jacket: "#f0b030", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#3f8a4a", skin: HEAD, build: "kid" },
  { jacket: "#2f8a9a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#5a8fc2" },
  { jacket: "#f4f1ea", pants: "#5a6a8a", boots: INK, hat: "chef", skin: HEAD, buttons: "#c8c2b4", build: "stout" },
  { jacket: "#5d7a3a", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#b0b0b8", skin: HEAD, build: "stout" },
];
const CROWD: { p: V3; o: Outfit }[] = [
  { p: [-1.8, 0, -5.4], o: FOLK[0] }, { p: [2.6, 0, -6.4], o: FOLK[1] }, { p: [-0.6, 0, -7.4], o: FOLK[2] },
  { p: [3.3, 0, -8.6], o: FOLK[3] }, { p: [-3.0, 0, -8.2], o: FOLK[4] }, { p: [1.2, 0, -9.2], o: FOLK[5] },
  { p: [-2.0, 0, -10.6], o: FOLK[6] }, { p: [2.2, 0, -11.2], o: FOLK[7] },
];

// ---------------- clocks ----------------
/** minutes past 7 shown by each clock */
const clockMin = (side: "A" | "B", t: number) => (side === "B" ? 1 : t >= T("now") ? 2 : 0);
const drawClock = (g: CanvasRenderingContext2D, min: number) => {
  const c = 256;
  g.clearRect(0, 0, 512, 512);
  g.fillStyle = "#d9c9a0"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#fbf5e4"; g.strokeStyle = "#241726"; g.lineWidth = 22;
  g.beginPath(); g.arc(c, c, 220, 0, 7); g.fill(); g.stroke();
  g.lineCap = "round";
  for (let i = 0; i < 60; i++) {
    const a = (i * Math.PI) / 30, big = i % 5 === 0;
    g.lineWidth = big ? 14 : 5; g.beginPath();
    g.moveTo(c + (big ? 160 : 182) * Math.sin(a), c - (big ? 160 : 182) * Math.cos(a)); g.lineTo(c + 196 * Math.sin(a), c - 196 * Math.cos(a)); g.stroke();
  }
  const ha = ((7 + min / 60) * Math.PI) / 6, ma = (min * Math.PI) / 30;
  g.lineWidth = 22; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 110 * Math.sin(ha), c - 110 * Math.cos(ha)); g.stroke();
  g.lineWidth = 14; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 175 * Math.sin(ma), c - 175 * Math.cos(ma)); g.stroke();
  g.fillStyle = "#241726"; g.beginPath(); g.arc(c, c, 20, 0, 7); g.fill();
};
class Clock {
  cv = document.createElement("canvas"); tex: THREE.CanvasTexture; mat: THREE.MeshBasicMaterial; min = -1;
  constructor() { this.cv.width = this.cv.height = 512; this.tex = new THREE.CanvasTexture(this.cv); this.tex.colorSpace = THREE.SRGBColorSpace; this.mat = new THREE.MeshBasicMaterial({ map: this.tex }); this.set(0); }
  set(m: number) { if (m === this.min) return; this.min = m; drawClock(this.cv.getContext("2d")!, m); this.tex.needsUpdate = true; }
}

// ---------------- painted bits ----------------
const signTex = (key: string, text: string, bg: string, fg: string, w = 1024, h = 256, font = 150) => ctex(key, w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#241726"; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${font}px "DejaVu Sans", Arial, sans-serif`;
  const lines = text.split("\n");
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * font * 1.05));
});
const waveSignTex = () => ctex("dontWave", 512, 400, (g) => {
  g.fillStyle = "#fff6e0"; g.fillRect(0, 0, 512, 400);
  g.strokeStyle = "#241726"; g.lineWidth = 18; g.strokeRect(9, 9, 494, 382);
  // a hand in a red "no" ring
  const cx = 256, cy = 150;
  g.fillStyle = "#f8f6f0"; g.lineWidth = 9;
  g.beginPath(); g.ellipse(cx, cy + 20, 42, 50, 0, 0, 7); g.fill(); g.stroke();
  for (let i = 0; i < 4; i++) { const x = cx - 33 + i * 22; g.beginPath(); g.ellipse(x, cy - 38, 10, 30, 0, 0, 7); g.fill(); g.stroke(); }
  g.beginPath(); g.ellipse(cx + 48, cy + 8, 10, 26, -0.7, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = "#d8352a"; g.lineWidth = 20;
  g.beginPath(); g.arc(cx, cy, 98, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(cx - 69, cy - 69); g.lineTo(cx + 69, cy + 69); g.stroke();
  g.fillStyle = "#241726"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 72px "DejaVu Sans", Arial, sans-serif`;
  g.fillText("DON'T WAVE", 256, 332);
});
const unlit = (map: THREE.Texture) => new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide });
const stripeTex = (key: string, a: string, b: string, n = 8) => ctex(key, 512, 256, (g) => {
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect((i * 512) / n, 0, 512 / n + 1, 256); }
});
const riverTex = () => ctex("riverWave", 1024, 1024, (g, r) => {
  g.fillStyle = "#3a8fb0"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 200; i++) {
    const x = r() * 1024, y = r() * 1024, w = 30 + r() * 70;
    g.strokeStyle = r() < 0.6 ? "rgba(255,255,255,0.4)" : "rgba(10,50,90,0.3)"; g.lineWidth = 4 + r() * 3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 6, x + w, y); g.stroke();
  }
});
const fogBlob = (p: Pen) => {
  const g = p.g, gr = g.createRadialGradient(256, 128, 10, 256, 128, 250);
  gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.55, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.save(); g.scale(1, 0.5); g.translate(0, 128); g.fillStyle = gr; g.fillRect(0, -128, 512, 512); g.restore();
};

// ---------------- one town (local coords = town A) ----------------
const buildTown = (grp: THREE.Group, clock: Clock, withSign: boolean) => {
  const kit = makeKit(), b = new Batch();
  const walkM = lam("walkT", () => ({ map: stoneHD("walkHD", ["#e6dccb", "#ddd2bf", "#ece3d4", "#d6cab6"], "#b0a390") }));
  const stoneM = lam("bridgeStone", () => ({ map: stoneHD("bridgeHD", ["#cfc3ad", "#c4b8a2", "#d8ccb6", "#bcb09a"], "#8f8472") }));
  // ground up to the gorge edge, road, sidewalks
  b.add(new THREE.PlaneGeometry(800, 400).rotateX(-Math.PI / 2).translate(0, -0.02, BANK - 200), lam("grassT", () => ({ map: rep(grassHD(), 160, 80) })));
  b.add(new THREE.PlaneGeometry(8, 100).rotateX(-Math.PI / 2).translate(0, 0, BANK - 50), lam("roadT", () => ({ map: rep(cobbleHD(), 2, 25) })));
  for (const s of [-1, 1]) {
    b.add(boxGeo(V(s < 0 ? -SIDE_OUT : SIDE_IN, -0.1, -100), V(s < 0 ? -SIDE_IN : SIDE_OUT, WALK, BANK), 2), walkM);
    b.add(boxGeo(V(s < 0 ? -SIDE_IN - 0.18 : SIDE_IN, -0.1, -100), V(s < 0 ? -SIDE_IN : SIDE_IN + 0.18, WALK + 0.02, BANK)), lam("kerb", () => ({ color: "#bdb4a6" })));
  }
  // gorge wall below the town edge, river (to the middle; the twin covers the rest)
  b.add(boxGeo(V(-300, -6, BANK - 3), V(300, -0.02, BANK), 6), lam("cliffT", () => ({ map: stoneHD("cliffHD", ["#b9ab95", "#ad9f88", "#c4b6a0", "#a39580"], "#7f725f") })));
  b.add(new THREE.PlaneGeometry(600, MID - BANK).rotateX(-Math.PI / 2).translate(0, -5, (BANK + MID) / 2), lam("riverT", () => ({ map: rep(riverTex(), 60, 3) })));
  // railing along the gorge edge (leaving the bridge mouth open)
  for (const s of [-1, 1]) b.add(boxGeo(V(s < 0 ? -60 : 2.6, 0, BANK - 0.35), V(s < 0 ? -2.6 : 60, 0.9, BANK - 0.15)), lam("railW", () => ({ color: "#f2ead8" })));
  // bridge half: deck, parapets, a pier, lamps
  b.add(boxGeo(V(-2.4, -0.7, BANK - 0.5), V(2.4, DECK, MID), 2), stoneM);
  for (const s of [-1, 1]) b.add(boxGeo(V(s < 0 ? -2.4 : 2.1, DECK, BANK - 0.5), V(s < 0 ? -2.1 : 2.4, 1.0, MID), 2), stoneM);
  b.add(boxGeo(V(-2.2, -5.2, 4.2), V(2.2, -0.7, 5.8), 2), stoneM);
  for (const s of [-1, 1]) for (const z of [0.5, 8.5]) prop(b, kit, "lantern", s * 2.25, 1.0, z, 2.4);
  // houses
  for (const s of [-1, 1]) {
    let z = BANK - 2, k = s < 0 ? 0 : 3;
    while (z > -110) {
      const w = [7, 9, 8][k % 3], h = [7, 8.4, 9.8, 7][k % 4], zc = z - w / 2;
      const skip = (s < 0 && zc > -17 && zc < -4) || (s > 0 && Math.abs(zc - BAKERY_Z) < 6);
      if (!skip) house(b, s * (SIDE_OUT + 4), zc, s < 0 ? Math.PI / 2 : -Math.PI / 2, w, 8, h, Math.abs(Math.round(zc * 7)) % 8, 0);
      z -= w + 0.4; k++;
    }
  }
  // bakery + awning + sign
  house(b, SIDE_OUT + 4, BAKERY_Z, -Math.PI / 2, 9, 8, 8.4, 2, 0);
  b.add(new THREE.PlaneGeometry(1, 1).scale(7.0, 2.0, 1).rotateY(-Math.PI / 2).rotateZ(-0.55).translate(SIDE_OUT - 0.55, 3.25, BAKERY_Z), lam("awn", () => ({ map: stripeTex("awnT", "#e2453c", "#fbf6ea", 10), side: THREE.DoubleSide })));
  grp.add(new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.1).rotateY(-Math.PI / 2).translate(SIDE_OUT - 0.02, 4.6, BAKERY_Z), unlit(signTex("bakerySign", "BAKERY", "#fff3d8", "#c8503a"))));
  // clock tower: stone shaft, cornice, belfry, pyramid roof, two clock faces
  const [tx, , tz] = TOWER, tw = 2.5;
  b.add(boxGeo(V(tx - tw, 0, tz - tw), V(tx + tw, 16, tz + tw), 3), lam("towerT", () => ({ map: stoneHD("towerHD", ["#e6d6b8", "#dccbab", "#efe0c4", "#d4c2a2"], "#a8977a") })));
  b.add(boxGeo(V(tx - tw - 0.3, 15.6, tz - tw - 0.3), V(tx + tw + 0.3, 16.2, tz + tw + 0.3)), lam("towerTrim", () => ({ color: "#f3ead6" })));
  b.add(new THREE.ConeGeometry(4.0, 5.5, 4, 1).rotateY(Math.PI / 4).translate(tx, 18.95, tz), lam("towerRoof", () => ({ color: "#3f6fb5" })));
  for (const [dx, dz, ry] of [[0, tw + 0.03, 0], [tw + 0.03, 0, Math.PI / 2]] as [number, number, number][]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6).rotateY(ry).translate(tx + dx, CLOCK_Y, tz + dz), clock.mat);
    grp.add(m);
    b.add(boxGeo(V(tx + dx - (ry ? 0.1 : 2.0), CLOCK_Y - 2.0, tz + dz - (ry ? 2.0 : 0.1)), V(tx + dx - (ry ? 0.02 : -2.0), CLOCK_Y + 2.0, tz + dz - (ry ? -2.0 : 0.02))), lam("clockRim", () => ({ color: "#3a3550" })));
  }
  // door of the tower
  b.add(boxGeo(V(tx + tw, 0, tz - 0.8), V(tx + tw + 0.08, 2.6, tz + 0.8)), lam("tDoor", () => ({ color: "#5a3a26" })));
  // crooked mailbox (leaning ~13 deg)
  const lean = new THREE.Matrix4().makeRotationZ(0.23).premultiply(new THREE.Matrix4().makeTranslation(MAILBOX[0], MAILBOX[1], MAILBOX[2]));
  b.add(new THREE.CylinderGeometry(0.3, 0.3, 1.25, 18).translate(0, 0.62, 0), lam("postR", () => ({ color: "#d8352a" })), lean);
  b.add(new THREE.SphereGeometry(0.3, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 1.25, 0), lam("postR", () => ({})), lean);
  b.add(boxGeo(V(-0.18, 0.9, 0.27), V(0.18, 0.98, 0.31)), lam("postSlot", () => ({ color: "#241726" })), lean);
  // the sign (Leo's side only)
  if (withSign) {
    b.add(boxGeo(V(SIGN[0] - 0.05, 0, SIGN[2] - 0.05), V(SIGN[0] + 0.05, 1.0, SIGN[2] + 0.05)), lam("signPost", () => ({ color: "#5a3a26" })));
    grp.add(new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.59).rotateY(Math.PI).translate(SIGN[0], 1.25, SIGN[2] - 0.07), unlit(waveSignTex())));
    b.add(boxGeo(V(SIGN[0] - 0.4, 0.93, SIGN[2] - 0.05), V(SIGN[0] + 0.4, 1.57, SIGN[2] + 0.0)), lam("signBack", () => ({ color: "#5a3a26" })));
  }
  // street dressing
  for (let z = BANK - 6; z > -95; z -= 11) for (const s of [-1, 1]) {
    const lx = s * (SIDE_IN + 0.5), lz = z + (s > 0 ? 4 : 0);
    if (Math.hypot(lx - MAILBOX[0], lz - MAILBOX[2]) < 3 || lz > -4) continue;
    prop(b, kit, "lantern", lx, WALK, lz, 3.6);
  }
  for (const [x, z] of [[6.5, -24], [-6.6, -22], [6.5, -36], [-6.6, -44]]) prop(b, kit, "tree_oak", x, WALK, z, 5.2);
  prop(b, kit, "stall-bench", 6.6, WALK, -7.5, 0.9, -Math.PI / 2);
  for (let i = 0; i < 18; i++) { const s = i % 2 ? 1 : -1; prop(b, kit, ["flower_redA", "flower_yellowA", "flower_purpleA"][i % 3], s * (SIDE_OUT - 0.3), WALK, -18 - i * 4.4, 0.5); }
  for (let i = 0; i < 30; i++) { const s = i % 2 ? 1 : -1; prop(b, kit, i % 3 ? "tree_default" : "tree_cone", s * (24 + (i * 7) % 18), 0, -6 - i * 5, 8 + (i % 4)); }
  for (let i = 0; i < 12; i++) { const s = i % 2 ? 1 : -1; prop(b, kit, "tree_default", s * (22 + i * 6), 0, BANK - 4 - (i % 3) * 3, 7 + (i % 3)); }
  const hillM = lam("hillT", () => ({ map: rep(grassHD(), 30, 30) }));
  for (const [x, z, r, h] of [[-120, -160, 90, 40], [80, -220, 120, 55], [-40, -260, 100, 46], [160, -90, 70, 30]]) {
    const hill = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2); hill.scale(r, h, r * 0.7);
    b.add(hill, hillM, new THREE.Matrix4().makeTranslation(x, 0, z));
  }
  b.build(grp);
};

// ---------------- the story by time ----------------
type Pose = { p: V3; fo: FrontOpts; show?: boolean };
const leoAt = (t: number): Pose => {
  if (t < T("so")) {
    let expr: Expr = "neutral", look = 0, headTilt = 0;
    if (t >= T("leo")) { expr = "stern"; look = 0.6; }
    if (t >= T("weird")) expr = "nervous";
    if (t >= T("guy")) { expr = "stern"; look = 0.4; }
    if (t >= T("just", 2)) { expr = "shock"; headTilt = 9; look = 0; }
    return { p: LEO0, fo: { mode: "stand", expr, look, headTilt } };
  }
  if (t < T("waves", 3)) {
    const d = (t - T("so")) * 2.9;
    const z = LEO0[2] + d, x = lerp(LEO0[0], 0.3, smooth(d / 6));
    return { p: [x, z > BANK - 0.5 ? DECK : 0, z], fo: { mode: "stroll", phase: t * 1.25, expr: "nervous" } };
  }
  const zw = LEO0[2] + (T("waves", 3) - T("so")) * 2.9;
  if (t < T("in")) {
    const expr: Expr = t < T("freezes") ? "grin" : t < T("smiles") ? "nervous" : "smile";
    const wave = t < T("smiles") ? 0.5 + 0.5 * Math.sin(t * 11) : undefined;
    return { p: [0.3, DECK, zw], fo: { mode: "stand", expr, wave } };
  }
  let expr: Expr = "nervous";
  if (t >= T("grin")) expr = "grin";
  if (t >= T("lifts")) expr = "relief_open";
  if (t >= T("turns")) expr = "shock";
  if (t >= T("whole")) expr = "grin";
  if (t >= T("clock", 3)) expr = "laugh";
  return { p: MEET_L, fo: { mode: "stand", expr, wave: t >= T("whole") + 0.4 ? 0.5 + 0.5 * Math.sin(t * 7) : undefined } };
};
const twinAt = (t: number): Pose => {
  const home = mir(LEO0);
  const hard = 0.5 + 0.5 * Math.sin(t * 16);
  if (t < T("freezes")) {
    const waving = t >= T("every") - 0.2;
    return { p: home, fo: { mode: "stand", expr: waving ? "laugh" : "neutral", wave: waving ? hard : undefined } };
  }
  if (t < T("starts")) return { p: home, fo: { mode: "stand", expr: t < T("smiles") ? "shock" : "grin", wave: t < T("smiles") ? 1 : undefined } };
  if (t < T("in")) {
    const d = (t - T("starts")) * 2.9, z = home[2] - d;
    return { p: [lerp(home[0], -0.3, smooth(d / 5)), z < 2 * MID - BANK + 0.5 ? DECK : 0, z], fo: { mode: "stroll", phase: t * 1.25, expr: "grin" } };
  }
  let expr: Expr = "nervous";
  if (t >= T("grin")) expr = "grin";
  if (t >= T("lifts")) expr = "relief_open";
  if (t >= T("whole")) expr = "grin";
  return { p: MEET_R, fo: { mode: "stand", expr, wave: t >= T("whole") + 0.4 ? 0.5 + 0.5 * Math.cos(t * 7) : undefined } };
};
/** town A: stands still and stern every morning; frets when Leo walks out; waves at him once the fog lifts */
const crowdA = (k: number, t: number): FrontOpts => {
  if (t >= T("whole")) return { mode: "stand", expr: k % 2 ? "laugh" : "grin", wave: 0.5 + 0.5 * Math.sin(t * (8 + k) + k) };
  if (t >= T("so") && t < T("lifts")) return { mode: "stand", expr: k % 3 ? "shock" : "nervous", look: 0.3 };
  return { mode: "stand", expr: k % 3 === 1 ? "stern" : "neutral" };
};
/** town B: waves every morning at seven */
const crowdB = (k: number, t: number): FrontOpts => {
  if (t >= T("every") - 0.2 + k * 0.05) return { mode: "stand", expr: k % 2 ? "laugh" : "grin", wave: 0.5 + 0.5 * Math.sin(t * (8 + k) + k) };
  return { mode: "stand", expr: "neutral" };
};

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; fog: number; cInf: number; cam: (u: number, f: number) => Cam };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
/** the same move done in the twin town */
const mvB = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => mv(mir(p0), mir(p1), mir(l0), mir(l1), fov, roll, ease);
const head = (p: V3, dy = 1.45): V3 => [p[0], p[1] + dy, p[2]];
const S: ShotDef[] = [];
export const SHOTS = S;
const shot = (a: number, fog: number, cInf: number, cam: (u: number, f: number) => Cam) => S.push({ a, fog, cInf, cam });
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  const clockA = (dist: number, side: number): Cam["pos"] => [CLOCK_F[0] + side * dist * 0.45, CLOCK_Y - 1.6, CLOCK_F[2] + dist];
  // the bridge nobody crosses
  shot(0, 0.75, 0, mv([2.5, 19, -20], [1.5, 13, -12], [0, 0, 9], [0, 0, 11], 44, 0, true));
  shot(E("nobody", 1), 1, 0, mv([1.0, 1.0, -1.5], [0.9, 1.05, 1.0], [0, 1.2, 22], [0, 1.25, 22], 44));
  shot(E("broken"), 0.85, 0, mv([-15, -2.6, 2], [-14, -2.2, 4], [0, -1.6, 11], [0, -1.3, 12], 42, 0.03, true));
  shot(E("guards"), 0.9, 6, mv([4.6, 1.7, -10], [4.0, 1.7, -9], [1.2, 1.1, -2.5], [1.2, 1.1, -2.5], 42, -0.03));
  shot(E("little"), 0.9, 12, mv([2.4, 1.3, -5.6], [2.6, 1.3, -5.1], [SIGN[0], 1.25, SIGN[2]], [SIGN[0], 1.25, SIGN[2]], 38, 0.03));
  shot(E("don"), 0.9, 14, mv([2.9, 1.27, -4.9], [2.92, 1.27, -4.7], [SIGN[0], 1.25, SIGN[2]], [SIGN[0], 1.25, SIGN[2]], 40, -0.02));
  // through the fog: the twin town
  shot(E("through"), 1, 0, mv([0, 2.0, 0], [0, 2.2, 9], [0, 2.0, 30], [0, 2.2, 32], 42));
  shot(E("another"), 0.55, 0, mv([1.2, 1.7, 15], [0.8, 1.9, 18], [0, 3, 36], [0, 3.2, 36], 44, 0, true));
  shot(E("same", 1), 0.45, 8, mvB([1.5, 1.7, -7.5], [1.8, 1.75, -8.2], [8, 2.6, BAKERY_Z], [8, 2.7, BAKERY_Z], 44, 0.03));
  shot(E("same", 2), 0.45, 0, mvB([-6.5, 1.4, -1.5], [-6.8, 1.6, -2.2], [TOWER[0], 12, TOWER[2] + 2.5], [TOWER[0], 12.5, TOWER[2] + 2.5], 46, -0.04));
  shot(E("crooked"), 0.45, 10, mvB([2.2, 1.3, -1.2], [2.4, 1.3, -1.5], [MAILBOX[0], 0.8, MAILBOX[2]], [MAILBOX[0], 0.8, MAILBOX[2]], 40, 0.05));
  // every morning at seven
  shot(E("every", 1), 0.5, 0, mv(clockA(5.5, 1), clockA(5.0, 1), CLOCK_F, CLOCK_F, 36, 0.02));
  shot(E("people", 1), 0.55, 0, mv([0.6, 1.7, -3.2], [0.6, 1.7, -2.6], [0, 1.5, 32], [0, 1.5, 32], 20));
  shot(E("here"), 0.55, 0, mv([0.6, 1.8, 0.6], [0.5, 1.8, 0.0], [0.3, 1.2, -8], [0.3, 1.25, -8], 42, 0, true));
  shot(E("nobody", 3), 0.55, 10, mv([-0.4, 1.55, -3.3], [-0.5, 1.56, -3.6], head(CROWD[0].p, 1.4), head(CROWD[0].p, 1.42), 38, 0.03));
  // Leo notices
  shot(E("leo", 1), 0.55, 12, mv([2.5, 1.6, -2.6], [2.35, 1.6, -2.9], head(LEO0), head(LEO0), 38, -0.03));
  shot(E("weird"), 0.55, 13, mv([-0.4, 1.5, -3.4], [-0.5, 1.5, -3.6], head(LEO0), head(LEO0), 34, 0.04));
  shot(E("their"), 0.45, 0, mvB([CLOCK_F[0] - 2.2, CLOCK_Y - 1.6, CLOCK_F[2] + 5.4], [CLOCK_F[0] - 2.0, CLOCK_Y - 1.6, CLOCK_F[2] + 4.9], CLOCK_F, CLOCK_F, 36, -0.02));
  shot(E("exactly", 2), 0.5, 0, mv(clockA(4.6, -1), clockA(4.2, -1), CLOCK_F, CLOCK_F, 36, 0.03));
  shot(E("guy", 1), 0.55, 0, mv([0.5, 1.7, 15.5], [0.4, 1.7, 16.5], head(mir(LEO0), 1.3), head(mir(LEO0), 1.3), 26));
  shot(E("orange"), 0.4, 12, mv([0.6, 1.5, 28.4], [0.5, 1.5, 28.8], head(mir(LEO0), 1.15), head(mir(LEO0), 1.2), 38, -0.03));
  shot(E("just", 2), 0.55, 12, mv([2.0, 1.25, -3.0], [1.9, 1.25, -3.2], head(LEO0, 1.15), head(LEO0, 1.15), 38, 0.04));
  // Leo walks out and waves back
  shot(E("so"), 0.8, 6, (u, f) => { const h = leoAt(f / FPS).p; return { pos: [h[0] + 1.3, h[1] + 1.5, h[2] + 4.2], look: [h[0], h[1] + 1.2, h[2]], fov: 40, roll: 0 }; });
  shot(E("walks"), 0.85, 0, (u, f) => { const h = leoAt(f / FPS).p; return { pos: [h[0] - 1.6, h[1] + 3.4, h[2] + 6.0], look: [h[0], h[1] + 0.9, h[2]], fov: 40, roll: -0.03 }; });
  shot(E("waves", 3), 0.8, 11, (u, f) => { const h = leoAt(f / FPS).p; return { pos: [h[0] + 1.2, h[1] + 1.55, h[2] + 2.8 - 0.3 * u], look: [h[0], h[1] + 1.55, h[2]], fov: 38, roll: 0.03 }; });
  // the other guy
  const tw0 = mir(LEO0);
  shot(E("other", 2), 0.55, 12, mv([tw0[0] - 1.0, 1.55, tw0[2] - 2.6], [tw0[0] - 0.95, 1.55, tw0[2] - 2.4], head(tw0), head(tw0), 36, -0.03));
  shot(E("smiles"), 0.55, 13, mv([tw0[0] + 0.9, 1.5, tw0[2] - 2.1], [tw0[0] + 0.85, 1.5, tw0[2] - 1.95], head(tw0), head(tw0), 34, 0.04));
  shot(E("starts"), 0.6, 6, (u, f) => { const h = twinAt(f / FPS).p; return { pos: [h[0] - 1.2, h[1] + 1.5, h[2] - 4.2], look: [h[0], h[1] + 1.2, h[2]], fov: 40, roll: 0 }; });
  // face to face in the middle
  shot(E("in"), 0.65, 0, mv([0.4, 1.7, MID - 5.2], [0.3, 1.65, MID - 4.4], [0, 1.2, MID], [0, 1.2, MID], 44, 0, true));
  shot(E("same", 4), 0.65, 9, mv([0.15, 1.0, MID - 3.0], [0.15, 1.0, MID - 2.8], [0, 1.0, MID], [0, 1.0, MID], 48, 0.03));
  shot(E("same", 5), 0.65, 9, mv([-0.1, 2.0, MID + 3.0], [-0.1, 2.0, MID + 2.8], [0, 1.75, MID], [0, 1.75, MID], 48, -0.03));
  shot(E("same", 6), 0.65, 11, mv([0.1, 1.55, MID - 2.9], [0.1, 1.55, MID - 2.7], [0, 1.45, MID], [0, 1.47, MID], 48, 0.02));
  // the fog lifts
  shot(E("then", 2), 0.65, 0, mv([7, 1.8, 4], [12, 9, -2], [0, 1.5, MID], [0, 1.2, MID], 44, 0, true));
  shot(E("leo", 3), 0, 12, mv([1.5, 1.5, MID - 2.6], [1.45, 1.5, MID - 2.4], head(MEET_L), head(MEET_L), 38, 0.03));
  shot(E("whole"), 0, 0, mv([0.9, 2.0, MID - 2.0], [0.8, 2.1, MID - 3.0], [0, 1.4, -7], [0, 1.4, -7], 34, 0, true));
  shot(E("clock", 3), 0, 0, mv(clockA(5.0, 1), clockA(4.3, 1), CLOCK_F, CLOCK_F, 34, -0.02));
  shot(E("exactly", 3), 0, 0, mv([14, 6, MID + 6], [26, 22, MID + 14], [0, 1.0, MID - 2], [0, 0, MID - 4], 46, 0, true));
};
let built = false;
const ensure = () => { if (!built) { built = true; build(); S.sort((a, b) => a.a - b.a); } };
export const shotIdx = (f: number) => { ensure(); let i = 0; while (i + 1 < S.length && f >= S[i + 1].a) i++; return i; };
const shotEnd = (i: number) => (i + 1 < S.length ? S[i + 1].a : TOTAL);
const KICKS = () => [wf("waves", 3), wf("freezes"), wf("lifts"), wf("now")];
const kick = (f: number) => { for (const k of KICKS()) { const d = f - k; if (d >= 0 && d < 7) return (d % 2 ? -1 : 1) * 0.045 * (1 - d / 7); } return 0; };
export const camAt = (i: number, f: number): Cam => {
  ensure();
  const s = S[i], b = shotEnd(i), u = clamp01((f - s.a) / Math.max(1, b - s.a)), c = s.cam(u, f);
  const k = 0.0025 * Math.max(0, f - s.a);
  return { ...c, pos: lerp3(c.pos, c.look, Math.min(0.2, k * 0.35)), roll: c.roll + kick(f) };
};
export const dofAt = (f: number) => { ensure(); return { cInf: S[shotIdx(f)].cInf }; };
/** fog thickness 0..1: per shot, and it lifts on the word */
export const fogAt = (f: number) => {
  ensure();
  const t = f / FPS, base = S[shotIdx(f)].fog;
  return t >= T("lifts") - 0.2 ? base * (1 - smooth((t - T("lifts") + 0.2) / 1.4)) : base;
};

// ---------------- the world ----------------
const FOG_COL = "#d6dee9";
export class WaveWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog(FOG_COL, 60, 700);
  private clouds: THREE.Mesh[] = [];
  private sunCache = new Map<number, THREE.Vector3>();
  private clocks = { A: new Clock(), B: new Clock() };

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
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.3, d = 560 + (i % 3) * 70;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cm[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 140 + (i % 4) * 34;
      m.position.set(Math.cos(a) * d, 60 + (i % 4) * 34, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK); this.clouds.push(m); R.add(m);
    }
    const A = new THREE.Group(), B = new THREE.Group();
    buildTown(A, this.clocks.A, true);
    buildTown(B, this.clocks.B, false);
    B.position.set(0, 0, 2 * MID); B.rotation.y = Math.PI;
    R.add(A, B);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  private shotSun(i: number) {
    let v = this.sunCache.get(i);
    if (v) return v;
    const s = S[i], b = shotEnd(i);
    let fx = 0, fz = 0;
    for (let f = s.a; f < b; f += 3) { const c = camAt(i, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(70), el = THREE.MathUtils.degToRad(34);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(i, v);
    return v;
  }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const i = shotIdx(f), t = f / FPS, L = LIGHTS.day, K = LOOK.day, fk = fogAt(f);
    const c = camAt(i, f), pos = V(...c.pos), look = V(...c.look);
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    // light: soft morning sun, dimmer in the fog
    const sunDir = this.shotSun(i), dist = pos.distanceTo(look);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI * (1 - 0.35 * fk);
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 9, 14, 50);
    this.sun.position.copy(look).addScaledVector(sunDir, 220); this.sun.target.position.copy(look);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    const fogLift = (v: number) => lerp(v, 1, 0.35 * fk);
    TONE.uLitCol.value.set(...L.lit.map((v) => lerp(v, 1.15, 0.4 * fk)) as [number, number, number]);
    TONE.uShadeCol.value.set(...L.shade.map(fogLift) as [number, number, number]);
    TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms, fc = new THREE.Color(FOG_COL);
    K.sky.c.forEach((h, k) => untone(new THREE.Color(h).lerp(fc, 0.85 * fk), su["c" + k].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(new THREE.Color(L.fog).lerp(fc, fk), this.fog.color);
    const far = fk < 0.02 ? 700 : Math.min(700, 42 / Math.pow(fk, 1.3)); // thick by the bridge, clear once it lifts
    this.fog.near = far * 0.04; this.fog.far = far;
    scene.fog = this.fog; scene.background = null;
    this.clouds.forEach((m) => { m.lookAt(cam.position.x, m.position.y, cam.position.z); (m.material as THREE.MeshBasicMaterial).opacity = 1 - fk; });
    this.clocks.A.set(clockMin("A", t)); this.clocks.B.set(clockMin("B", t));

    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const k = (f + seed * 37) % 64; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
    let ai = 0, fi = 0;
    const used: Actor[] = [], fused: Fx[] = [];
    const addFx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, at: THREE.Vector3, w: number, h: number, soft = false, op = 1) => {
      const ef = this.fx(fi++);
      ef.r = this.pool.req(key, cw, ch, 1, draw); ef.use(soft);
      ef.soft.opacity = op;
      ef.mesh.visible = true; ef.mesh.position.copy(at); ef.mesh.quaternion.copy(cam.quaternion); ef.mesh.scale.set(w, h, 1);
      fused.push(ef);
      return ef;
    };
    const ground = (p: V3, w = 0.55) => {
      const ef = addFx("blob|contact|#3a3460", 128, 128, (pp) => fxContact(pp, "#3a3460"), V(p[0], p[1] + 0.02, p[2]), w, w * 0.7);
      ef.mesh.rotation.set(-Math.PI / 2, 0, 0);
    };
    const person = (key: string, p: V3, o: Outfit, fo: FrontOpts, seed: number, other?: V3) => {
      const w = V(...p), d = cam.position.distanceTo(w);
      if (d > 160) return;
      const [cw, ch, k] = d < 3.2 ? [1800, 3000, 3.0] : d < 7 ? [1080, 1800, 1.8] : d < 18 ? [480, 800, 0.8] : [240, 400, 0.4];
      const f2: FrontOpts = { ...fo, light: L2D, seed };
      if (f2.blink === undefined) f2.blink = lid(seed);
      if (other) { const s = (other[0] - p[0]) * right.x + (other[2] - p[2]) * right.z; f2.facing = s > 0 ? 1 : -1; f2.look = s > 0 ? 0.8 : -0.8; }
      const a = this.actor(ai++);
      a.r = this.pool.req(`${key}|F|${JSON.stringify(f2, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, k, (pen) => bodyFront(pen, o, f2));
      a.mesh.visible = true; a.mesh.position.copy(w);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - w.x, cam.position.z - w.z), 0);
      a.mesh.scale.set(1, 1, 1); a.mesh.castShadow = false;
      used.push(a);
      ground(p);
    };
    const leo = leoAt(t), twin = twinAt(t), met = t >= T("in"), gathered = t >= T("every") - 0.3; // before seven the streets are empty
    if (gathered) person("leo", leo.p, HERO, leo.fo, 4, met ? twin.p : undefined);
    if (gathered) person("twin", twin.p, HERO, twin.fo, 5, met ? leo.p : undefined);
    if (gathered) CROWD.forEach((c, k) => {
      person("a" + k, c.p, c.o, crowdA(k, t), 10 + k);
      person("b" + k, mir(c.p), c.o, crowdB(k, t), 10 + k);
    });
    // the wave back: a little burst at Leo's hand
    if (t >= T("waves", 3) && t < T("waves", 3) + 0.45) {
      const k = Math.round(((t - T("waves", 3)) / 0.45) * 8) / 8;
      addFx(`burst|${k}`, 500, 500, (p) => fxBurst(p, k, "#fff3b0"), V(leo.p[0] - 0.35, leo.p[1] + 1.75, leo.p[2]), 1.1, 1.1);
    }
    // fog banks over the gorge (off the bridge lane), drifting
    if (fk > 0.02) {
      for (let k = 0; k < 16; k++) {
        const sx = k % 2 ? 1 : -1, x = sx * (5 + (k * 7) % 16) + Math.sin(t * 0.2 + k) * 1.5, z = -1 + ((k * 5.3) % 28), y = -3 + (k % 4) * 1.4;
        addFx("fogblob", 512, 256, fogBlob, V(x, y, z), 14, 5, true, 0.6 * fk);
      }
      for (let k = 0; k < 6; k++) addFx("fogblob", 512, 256, fogBlob, V(-1 + (k % 3) * 1.0, -2.2 + (k % 2) * 0.6, 2 + k * 4.5), 9, 3, true, 0.55 * fk);
    }
    for (let k = ai; k < this.actors.length; k++) this.actors[k].mesh.visible = false;
    for (let k = fi; k < this.fxs.length; k++) this.fxs[k].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return look;
  }
}
