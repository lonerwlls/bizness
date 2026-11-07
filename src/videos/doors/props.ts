// Our own 3D props for "What if every door led to another universe", in the kitgen / swap style: simple solids,
// two-tone lit lam() materials, painted canvas textures, real-world size, standing on y = 0 unless noted.
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex, beamHD } from "../bridge/paint";
import { NOINK } from "../bridge/ink";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r0: number, r1: number, h: number, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
export const add = (g: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number], r: [number, number, number] = [0, 0, 0]) => {
  const x = new THREE.Mesh(geo, m); x.position.set(...p); x.rotation.set(...r); x.castShadow = true; x.receiveShadow = true; g.add(x); return x;
};
const M = {
  wood: () => lam("swWood", () => ({ map: beamHD() })),
  woodD: () => lam("swWoodD", () => ({ color: "#6e4a30" })),
  white: () => lam("swWhite", () => ({ color: "#f4f1ea" })),
  steel: () => lam("swSteel", () => ({ color: "#b8bcc6" })),
  brass: () => lam("dBrass", () => ({ color: "#d8b04a" })),
};

// ---------------- doors ----------------
export const DOOR_W = 0.9, DOOR_H = 2.05;
/** a door in a wall at z = 0: frame trim (both faces) + a panel hinged on its left edge (x = -DOOR_W / 2) that opens
 *  into the room (toward -z) as `open` goes 0 -> 1. Returns the group and a setter. */
export const door = (col: string, opts: { window?: boolean; sign?: THREE.Texture } = {}) => {
  const g = new THREE.Group(), trim = lam("dTrim", () => ({ color: "#f2ead8" }));
  add(g, box(0.08, DOOR_H + 0.04, 0.2), trim, [-DOOR_W / 2 - 0.04, (DOOR_H + 0.04) / 2, -0.06]);
  add(g, box(0.08, DOOR_H + 0.04, 0.2), trim, [DOOR_W / 2 + 0.04, (DOOR_H + 0.04) / 2, -0.06]);
  add(g, box(DOOR_W + 0.16, 0.08, 0.2), trim, [0, DOOR_H + 0.04, -0.06]);
  add(g, box(DOOR_W + 0.2, 0.012, 0.16), trim, [0, 0.006, -0.06]);
  const hinge = new THREE.Group(); hinge.position.set(-DOOR_W / 2, 0, -0.06); g.add(hinge);
  const pm = lam("dPanel" + col, () => ({ color: col }));
  add(hinge, box(DOOR_W - 0.02, DOOR_H - 0.02, 0.045), pm, [DOOR_W / 2, DOOR_H / 2, 0]);
  const inset = lam("dInset" + col, () => ({ color: new THREE.Color(col).multiplyScalar(0.86).getStyle() }));
  for (const s of [-1, 1]) {
    if (opts.window) { add(hinge, box(0.5, 0.5, 0.05), lam("dGlass", () => ({ color: "#bcd8ec" })), [DOOR_W / 2, 1.55, 0]); add(hinge, box(0.56, 0.7, 0.03), inset, [DOOR_W / 2, 0.6, s * 0.02]); }
    else { add(hinge, box(0.62, 0.7, 0.03), inset, [DOOR_W / 2, 1.45, s * 0.02]); add(hinge, box(0.62, 0.8, 0.03), inset, [DOOR_W / 2, 0.55, s * 0.02]); }
    add(hinge, new THREE.SphereGeometry(0.03, 12, 8), M.brass(), [DOOR_W - 0.1, 1.0, s * 0.05]);
  }
  if (opts.sign) add(hinge, box(0.42, 0.14, 0.006), lam("dSign" + opts.sign.uuid, () => ({ map: opts.sign })), [DOOR_W / 2, 1.62, -0.028]);
  return { g, set: (open: number) => { hinge.rotation.y = 1.65 * Math.max(0, Math.min(1, open)); } };
};
export const signTex = (key: string, text: string, bg: string, fg = "#ffffff") => ctex("sign_" + key, 384, 128, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 384, 128); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(10, 10, 364, 108);
  g.fillStyle = fg; g.font = `800 64px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 192, 68);
});

/** fridge 0.7 x 1.8 x 0.6, back against z = 0, front at z = -0.6; the back is open (a portal); door hinged on the left */
export const fridge = () => {
  const g = new THREE.Group(), w = lam("dFridge", () => ({ color: "#eef2f4" })), inn = lam("dFridgeIn", () => ({ color: "#f8fbfc" }));
  add(g, box(0.06, 1.8, 0.6), w, [-0.32, 0.9, -0.3]); add(g, box(0.06, 1.8, 0.6), w, [0.32, 0.9, -0.3]);
  add(g, box(0.7, 0.2, 0.6), w, [0, 0.1, -0.3]); add(g, box(0.7, 0.16, 0.6), w, [0, 1.72, -0.3]);
  add(g, box(0.58, 0.02, 0.5), inn, [0, 0.2, -0.33]);
  const hinge = new THREE.Group(); hinge.position.set(-0.35, 0, -0.6); g.add(hinge);
  add(hinge, box(0.7, 1.78, 0.06), w, [0.35, 0.9, -0.03]);
  add(hinge, box(0.03, 0.5, 0.04), M.steel(), [0.62, 1.15, -0.08]);
  add(hinge, box(0.6, 0.012, 0.012), lam("dFridgeLine", () => ({ color: "#c8d0d6" })), [0.35, 1.25, -0.062]);
  for (const [x, y, c] of [[0.2, 1.5, "#e8402e"], [0.45, 1.45, "#3f9a5a"], [0.3, 1.38, "#f4c430"]] as [number, number, string][]) add(hinge, box(0.06, 0.06, 0.01), lam("dMag" + c, () => ({ color: c })), [x, y, -0.065]);
  const light = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.1), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.8, 1.7) })); light.position.set(0, 1.62, -0.35); g.add(light);
  return { g, set: (open: number) => { hinge.rotation.y = 1.9 * Math.max(0, Math.min(1, open)); } };
};

// ---------------- home bits ----------------
export const coatRack = () => {
  const g = new THREE.Group();
  add(g, cyl(0.025, 0.025, 1.75, 8), M.woodD(), [0, 0.875, 0]);
  add(g, cyl(0.2, 0.22, 0.04, 16), M.woodD(), [0, 0.02, 0]);
  for (const [a, c] of [[0, "#3f6fb5"], [2.1, "#c25a7a"]] as [number, string][]) { const k = add(g, new THREE.CapsuleGeometry(0.12, 0.55, 4, 10), lam("dCoat" + c, () => ({ color: c })), [0.13 * Math.cos(a), 1.3, 0.13 * Math.sin(a)]); k.scale.set(1, 1, 0.5); }
  return g;
};
export const mat = (col = "#8a5a3a") => { const g = new THREE.Group(); add(g, box(0.9, 0.012, 0.55), lam("dMat" + col, () => ({ color: col })), [0, 0.006, 0]); return g; };
export const console_ = () => {
  const g = new THREE.Group();
  add(g, box(0.9, 0.04, 0.35), M.wood(), [0, 0.8, 0]);
  for (const x of [-0.42, 0.42]) for (const z of [-0.15, 0.15]) add(g, box(0.04, 0.78, 0.04), M.woodD(), [x, 0.39, z]);
  add(g, cyl(0.08, 0.06, 0.16, 12), lam("dPot", () => ({ color: "#c86a3a" })), [0.25, 0.9, 0]);
  for (let k = 0; k < 5; k++) add(g, new THREE.SphereGeometry(0.07, 10, 8), lam("dLeaf", () => ({ color: "#4f9a3c" })), [0.25 + 0.05 * Math.cos(k * 1.3), 1.05 + 0.03 * (k % 2), 0.05 * Math.sin(k * 1.3)]);
  return g;
};
export const shoes = () => {
  const g = new THREE.Group();
  for (const [x, c] of [[-0.2, "#e8402e"], [0.05, "#f4f1ea"], [0.3, "#3f6fb5"]] as [number, string][]) for (const s of [-1, 1]) add(g, new THREE.CapsuleGeometry(0.04, 0.16, 4, 8), lam("dShoe" + c, () => ({ color: c })), [x + s * 0.05, 0.04, 0], [Math.PI / 2, 0, 0]);
  return g;
};
/** frying pan with a handle toward +x, sitting on y = 0 */
export const pan = () => {
  const g = new THREE.Group(), d = lam("dPan", () => ({ color: "#2a2c36" }));
  add(g, cyl(0.13, 0.11, 0.04, 24), d, [0, 0.02, 0]);
  add(g, box(0.22, 0.02, 0.035), d, [0.23, 0.04, 0]);
  return g;
};
export const pancake = () => { const g = new THREE.Group(); add(g, cyl(0.085, 0.085, 0.016, 20), lam("dPancake", () => ({ color: "#e0a050" })), [0, 0.008, 0]); return g; };
/** a plate with a stack of pancakes, butter and syrup, sitting on y = 0 */
export const pancakeStack = () => {
  const g = new THREE.Group(), pc = lam("dPancake", () => ({ color: "#e0a050" })), ed = lam("dPancakeEdge", () => ({ color: "#c8843a" }));
  add(g, cyl(0.13, 0.11, 0.02, 28), M.white(), [0, 0.01, 0]);
  for (let k = 0; k < 6; k++) add(g, cyl(0.09, 0.09, 0.018, 22), k % 2 ? pc : ed, [0.004 * Math.sin(k * 2), 0.03 + k * 0.019, 0.004 * Math.cos(k * 2)]);
  add(g, cyl(0.082, 0.09, 0.008, 22), lam("dSyrup", () => ({ color: "#a8501a" })), [0, 0.142, 0]);
  add(g, box(0.04, 0.025, 0.04), lam("dButter", () => ({ color: "#fbe48a" })), [0, 0.158, 0]);
  return g;
};
/** sunscreen bottle (19 cm), orange with a yellow cap */
export const sunscreen = () => {
  const g = new THREE.Group();
  const b = add(g, cyl(0.035, 0.035, 0.15, 16), lam("dSunscreen", () => ({ map: ctex("sunscreenLbl", 128, 128, (c) => { c.fillStyle = "#f27a2a"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#ffffff"; c.beginPath(); c.arc(64, 54, 26, 0, 7); c.fill(); c.fillStyle = "#f4c430"; c.beginPath(); c.arc(64, 54, 18, 0, 7); c.fill(); c.fillStyle = "#ffffff"; c.font = `800 22px "DejaVu Sans", sans-serif`; c.textAlign = "center"; c.fillText("SPF 50", 64, 108); }) })), [0, 0.075, 0]);
  b.scale.set(1, 1, 0.6);
  add(g, cyl(0.022, 0.03, 0.04, 12), lam("dCap", () => ({ color: "#f4c430" })), [0, 0.17, 0]);
  return g;
};

// ---------------- beach ----------------
export const sandTex = () => ctex("sandRipple", 512, 512, (g, r) => {
  g.fillStyle = "#f2d9a0"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1600; i++) { g.fillStyle = r() < 0.5 ? "rgba(200,160,100,0.25)" : "rgba(255,245,215,0.35)"; g.fillRect(r() * 512, r() * 512, 3, 3); }
  g.strokeStyle = "rgba(200,160,100,0.22)"; g.lineWidth = 3; for (let y = 10; y < 512; y += 26) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + 6 * Math.sin(x / 40 + y)); g.stroke(); }
});
export const seaTex = () => ctex("seaWaves", 512, 512, (g, r) => {
  g.fillStyle = "#2aa8c8"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) { const x = r() * 512, y = r() * 512, w = 20 + r() * 40; g.strokeStyle = r() < 0.5 ? "rgba(255,255,255,0.55)" : "rgba(20,110,160,0.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 6, x + w, y); g.stroke(); }
});
/** a palm tree, ~5 m: a leaning ringed trunk and a crown of drooping fronds with coconuts */
export const palm = (lean = 0.2, seed = 1) => {
  const g = new THREE.Group(), tr = lam("dPalmTrunk", () => ({ color: "#a8784a" })), rg = lam("dPalmRing", () => ({ color: "#8a5e38" })), lf = lam("dPalmLeaf", () => ({ color: "#3f9a3c" })), lf2 = lam("dPalmLeaf2", () => ({ color: "#5ab848" }));
  let x = 0, y = 0;
  for (let k = 0; k < 9; k++) { const nx = x + lean * 0.12 * (1 + k * 0.15), ny = y + 0.55; add(g, cyl(0.13 - k * 0.006, 0.15 - k * 0.006, 0.58, 10), k % 2 ? tr : rg, [(x + nx) / 2, (y + ny) / 2, 0], [0, 0, -Math.atan2(nx - x, 0.55)]); x = nx; y = ny; }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + seed, fr = new THREE.Group(); fr.position.set(x, y, 0); fr.rotation.set(0, a, 0); g.add(fr);
    for (let j = 0; j < 4; j++) add(fr, box(0.42, 0.03, 0.28 - j * 0.04), k % 2 ? lf : lf2, [0.25 + j * 0.38, -0.05 - j * j * 0.07, 0], [0, 0, -0.15 - j * 0.22]);
  }
  for (let k = 0; k < 3; k++) add(g, new THREE.SphereGeometry(0.09, 10, 8), lam("dCoco", () => ({ color: "#6a4422" })), [x + 0.1 * Math.cos(k * 2), y - 0.15, 0.1 * Math.sin(k * 2)]);
  return g;
};
export const umbrella = () => {
  const g = new THREE.Group();
  add(g, cyl(0.02, 0.02, 2.2, 8), M.white(), [0, 1.1, 0]);
  for (let k = 0; k < 8; k++) { const c = add(g, new THREE.ConeGeometry(1.1, 0.4, 3, 1, true, (k / 8) * Math.PI * 2, Math.PI / 4), lam("dUmb" + (k % 2), () => ({ color: k % 2 ? "#f4f1ea" : "#e8402e", side: THREE.DoubleSide })), [0, 2.2, 0]); c.castShadow = true; }
  return g;
};
export const lounger = () => {
  const g = new THREE.Group(), w = M.wood(), cl = lam("dTowel", () => ({ color: "#3f8ab5" }));
  add(g, box(0.6, 0.06, 1.3), w, [0, 0.3, 0.1]); add(g, box(0.6, 0.06, 0.6), w, [0, 0.5, -0.75], [-0.7, 0, 0]);
  for (const x of [-0.26, 0.26]) for (const z of [-0.45, 0.65]) add(g, box(0.04, 0.3, 0.04), w, [x, 0.15, z]);
  add(g, box(0.5, 0.015, 1.2), cl, [0, 0.34, 0.1]);
  return g;
};
/** a seagull, ~0.6 m wingspan; flap(t) beats the wings; faces +x */
export class Gull {
  root = new THREE.Group();
  private wings: THREE.Group[] = [];
  constructor() {
    const w = lam("dGullW", () => ({ color: "#f8f8f6" })), gr = lam("dGullG", () => ({ color: "#a8b0bc" })), k = lam("dGullK", () => ({ color: "#2a2c36" }));
    const b = add(this.root, new THREE.SphereGeometry(0.08, 14, 10), w, [0, 0, 0]); b.scale.set(1.9, 0.9, 0.9);
    add(this.root, new THREE.SphereGeometry(0.055, 12, 8), w, [0.15, 0.04, 0]);
    add(this.root, new THREE.ConeGeometry(0.014, 0.07, 8), lam("dBeak", () => ({ color: "#f4b020" })), [0.22, 0.035, 0], [0, 0, -Math.PI / 2]);
    for (const s of [-1, 1]) add(this.root, new THREE.SphereGeometry(0.009, 6, 4), k, [0.18, 0.06, s * 0.035]);
    add(this.root, box(0.12, 0.012, 0.08), gr, [-0.17, 0.0, 0]);
    for (const s of [-1, 1]) {
      const wg = new THREE.Group(); wg.position.set(0.0, 0.03, s * 0.05); this.root.add(wg); this.wings.push(wg);
      add(wg, box(0.14, 0.012, 0.18), gr, [0, 0, s * 0.09]); add(wg, box(0.1, 0.012, 0.14), k, [-0.02, 0, s * 0.24]);
    }
  }
  flap(t: number) { const a = 0.6 * Math.sin(t * 9); this.wings.forEach((w, i) => (w.rotation.x = (i ? -1 : 1) * a)); }
}

// ---------------- mountain ----------------
export const snowTex = () => ctex("snowFlat", 512, 512, (g, r) => {
  g.fillStyle = "#f4f7fb"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? "rgba(190,205,230,0.35)" : "rgba(255,255,255,0.7)"; g.fillRect(r() * 512, r() * 512, 4, 2); }
});
/** a rocky peak with a snow cap, height h */
export const peak = (h: number, r: number) => {
  const g = new THREE.Group();
  add(g, new THREE.ConeGeometry(r, h, 7), lam("dRock", () => ({ color: "#8a8fa8" })), [0, h / 2, 0]);
  add(g, new THREE.ConeGeometry(r * 0.48, h * 0.48, 7), lam("dSnowCap", () => ({ color: "#f6f9fc" })), [0, h * 0.76 + 0.02, 0]);
  return g;
};
/** a snowy pine, ~h m */
export const pine = (h = 3) => {
  const g = new THREE.Group(), gr = lam("dPine", () => ({ color: "#2f6a4a" })), sn = lam("dSnowCap", () => ({ color: "#f6f9fc" }));
  add(g, cyl(0.08, 0.1, h * 0.25, 8), M.woodD(), [0, h * 0.12, 0]);
  for (let k = 0; k < 3; k++) { const y = h * (0.3 + k * 0.22), r = h * (0.32 - k * 0.08); add(g, new THREE.ConeGeometry(r, h * 0.36, 9), gr, [0, y, 0]); add(g, new THREE.ConeGeometry(r * 0.55, h * 0.14, 9), sn, [0, y + h * 0.12, 0]); }
  return g;
};

// ---------------- desert ----------------
export const duneTex = () => ctex("duneSand", 512, 512, (g, r) => {
  g.fillStyle = "#e8b870"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(190,120,60,0.3)"; g.lineWidth = 4; for (let y = 6; y < 512; y += 18) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + 5 * Math.sin(x / 50 + y * 0.3)); g.stroke(); }
  for (let i = 0; i < 900; i++) { g.fillStyle = "rgba(255,230,180,0.3)"; g.fillRect(r() * 512, r() * 512, 2, 2); }
});
export const cactus = (h = 2.2) => {
  const g = new THREE.Group(), c = lam("dCactus", () => ({ color: "#4f9a5a" }));
  add(g, new THREE.CapsuleGeometry(0.16, h - 0.3, 4, 12), c, [0, h / 2, 0]);
  for (const [s, y, l] of [[-1, h * 0.45, 0.5], [1, h * 0.6, 0.4]] as number[][]) {
    add(g, new THREE.CapsuleGeometry(0.1, 0.25, 4, 10), c, [s * 0.25, y, 0], [0, 0, Math.PI / 2]);
    add(g, new THREE.CapsuleGeometry(0.1, l, 4, 10), c, [s * 0.38, y + l / 2, 0]);
  }
  return g;
};
export const mesa = (w: number, h: number, d: number) => {
  const g = new THREE.Group();
  add(g, box(w, h, d), lam("dMesa", () => ({ color: "#c8703a" })), [0, h / 2, 0]);
  add(g, box(w * 0.9, h * 0.08, d * 0.9), lam("dMesaTop", () => ({ color: "#a8582e" })), [0, h * 0.96, 0]);
  add(g, box(w * 1.05, h * 0.15, d * 1.05), lam("dMesaBase", () => ({ color: "#d88a4a" })), [0, h * 0.07, 0]);
  return g;
};
export const rock = (s = 0.5) => { const g = new THREE.Group(); const m = add(g, new THREE.DodecahedronGeometry(s, 0), lam("dRock2", () => ({ color: "#b88a6a" })), [0, s * 0.5, 0]); m.scale.set(1.2, 0.7, 1); return g; };

// ---------------- library ----------------
const booksTex = () => ctex("bookshelf", 512, 512, (g, r) => {
  g.fillStyle = "#6e4a30"; g.fillRect(0, 0, 512, 512);
  const cols = ["#c83a32", "#3f6fb5", "#3f9a5a", "#f4c430", "#7b5ac9", "#e86a5a", "#2f8a9a", "#f2ead8"];
  for (let row = 0; row < 4; row++) {
    const y0 = row * 128 + 14; let x = 6;
    while (x < 500) { const w = 14 + r() * 18, h = 80 + r() * 30; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, y0 + 106 - h, w, h); g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x + 3, y0 + 112 - h, w - 6, 4); x += w + 2; }
    g.fillStyle = "#4a3020"; g.fillRect(0, y0 + 106, 512, 14);
  }
});
/** a tall bookshelf 2.0 x 2.4 x 0.4, books facing +z */
export const bookshelf = () => {
  const g = new THREE.Group();
  add(g, box(2.0, 2.4, 0.4), M.woodD(), [0, 1.2, 0]);
  add(g, box(1.9, 2.25, 0.01), lam("dBooks", () => ({ map: booksTex() })), [0, 1.2, 0.205]);
  return g;
};
export const readingTable = () => {
  const g = new THREE.Group();
  add(g, box(1.8, 0.05, 0.9), M.wood(), [0, 0.75, 0]);
  for (const x of [-0.8, 0.8]) for (const z of [-0.38, 0.38]) add(g, box(0.06, 0.73, 0.06), M.woodD(), [x, 0.365, z]);
  for (const x of [-0.5, 0.5]) {
    add(g, cyl(0.07, 0.08, 0.03, 12), M.brass(), [x, 0.79, 0]); add(g, cyl(0.01, 0.01, 0.3, 6), M.brass(), [x, 0.94, 0]);
    add(g, new THREE.ConeGeometry(0.12, 0.12, 14, 1, true), lam("dLampShade", () => ({ color: "#3f9a5a", side: THREE.DoubleSide })), [x, 1.1, 0]);
  }
  add(g, box(0.22, 0.04, 0.3), lam("dBookOpen", () => ({ color: "#f4f1ea" })), [0, 0.795, 0.1]);
  return g;
};

// ---------------- school ----------------
export const lockerTex = () => ctex("lockers", 512, 512, (g) => {
  const cols = ["#3f6fb5", "#3a66a8"];
  for (let i = 0; i < 4; i++) {
    g.fillStyle = cols[i % 2]; g.fillRect(i * 128, 0, 128, 512);
    g.fillStyle = "rgba(20,30,60,0.55)"; for (let k = 0; k < 6; k++) g.fillRect(i * 128 + 34, 40 + k * 14, 60, 6);
    g.fillStyle = "#c8ccd4"; g.fillRect(i * 128 + 98, 230, 10, 50);
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(i * 128 + 6, 0, 6, 512);
    g.fillStyle = "#1e2a44"; g.fillRect(i * 128, 0, 4, 512);
  }
  g.fillStyle = "#1e2a44"; g.fillRect(0, 0, 512, 6); g.fillRect(0, 506, 512, 6);
});
/** a hanging banner (w x 0.6 m) with two strings, text facing +z */
export const banner = (key: string, text: string, w = 3) => {
  const g = new THREE.Group();
  add(g, box(w, 0.6, 0.01), lam("dBanner" + key, () => ({ map: ctex("banner_" + key, 1024, 205, (c) => { c.fillStyle = "#e8402e"; c.fillRect(0, 0, 1024, 205); c.fillStyle = "#ffffff"; c.font = `800 96px "DejaVu Sans", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, 512, 108, 960); }) })), [0, 0, 0]);
  for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) add(g, cyl(0.004, 0.004, 0.6, 4), M.steel(), [x, 0.6, 0]);
  return g;
};
/** a party balloon on a string (centre ~h m up) */
export const balloon = (col: string, h = 2.3) => {
  const g = new THREE.Group();
  const b = add(g, new THREE.SphereGeometry(0.16, 16, 12), lam("dBalloon" + col, () => ({ color: col })), [0, h, 0]); b.scale.set(1, 1.2, 1);
  add(g, cyl(0.003, 0.003, h - 0.2, 4), lam("dString", () => ({ color: "#f4f1ea" })), [0, (h - 0.2) / 2, 0]);
  return g;
};
export const discoBall = () => {
  const g = new THREE.Group();
  add(g, new THREE.IcosahedronGeometry(0.22, 1), lam("dDisco", () => ({ map: ctex("disco", 128, 128, (c) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x * 7 + y * 3) % 5 ? "#c8d0e0" : "#ffffff"; c.fillRect(x * 16, y * 16, 15, 15); } }) })), [0, 0, 0]);
  add(g, cyl(0.004, 0.004, 0.6, 4), M.steel(), [0, 0.5, 0]);
  return g;
};
export const partyHat = (col: string) => { const g = new THREE.Group(); add(g, new THREE.ConeGeometry(0.08, 0.22, 14), lam("dPHat" + col, () => ({ color: col })), [0, 0.11, 0]); return g; };
/** a snowflake (instanced, unlit) */
export const flakes = (n: number) => {
  const m = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.02, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.3, 1.35), fog: false }), n);
  m.layers.set(NOINK); m.frustumCulled = false;
  return m;
};
