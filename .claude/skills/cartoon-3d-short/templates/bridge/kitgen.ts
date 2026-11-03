// Our own procedural replacements for the Kenney CC0 props (no downloads needed).
// Same names as the Kenney kit; each model stands on y = 0, faces +z, roughly real-world size (prop() rescales it
// to the requested height anyway). Materials are shared and named "kg_*" so the Batch merges them per material
// and toLambert() keeps their colour (names not in RECOLOR).
import * as THREE from "three";

type Kit = Record<string, THREE.Object3D>;
const MATS = new Map<string, THREE.MeshStandardMaterial>();
const mat = (name: string, color: string, side: THREE.Side = THREE.FrontSide) => {
  let m = MATS.get(name);
  if (!m) { m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, side }); m.name = "kg_" + name; MATS.set(name, m); }
  return m;
};
const WOOD = () => mat("wood", "#a8724a"), WOOD_D = () => mat("woodDark", "#6e4a30"), IRON = () => mat("iron", "#3a3a42");
const CLOTH_W = () => mat("clothWhite", "#f4eedf", THREE.DoubleSide);

const mesh = (g: THREE.Group, geo: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number], r: [number, number, number] = [0, 0, 0], s: [number, number, number] = [1, 1, 1]) => {
  const x = new THREE.Mesh(geo, m);
  x.position.set(...p); x.rotation.set(...r); x.scale.set(...s);
  g.add(x); return x;
};
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r0: number, r1: number, h: number, n = 10) => new THREE.CylinderGeometry(r0, r1, h, n);

// ---------- lantern: street lamp post with a hanging lamp ----------
const lantern = () => {
  const g = new THREE.Group();
  mesh(g, cyl(0.12, 0.16, 0.3), IRON(), [0, 0.15, 0]);
  mesh(g, cyl(0.05, 0.07, 2.5), IRON(), [0, 1.45, 0]);
  mesh(g, box(0.5, 0.05, 0.05), IRON(), [0.2, 2.62, 0]);
  mesh(g, cyl(0.02, 0.02, 0.12), IRON(), [0.42, 2.54, 0]);
  mesh(g, cyl(0.06, 0.16, 0.12, 6), IRON(), [0.42, 2.44, 0]);
  mesh(g, cyl(0.12, 0.09, 0.26, 6), mat("lampGlass", "#ffe2a0"), [0.42, 2.25, 0]);
  mesh(g, cyl(0.1, 0.1, 0.03, 6), IRON(), [0.42, 2.11, 0]);
  mesh(g, new THREE.SphereGeometry(0.035, 8, 6), IRON(), [0, 2.76, 0]);
  return g;
};

// ---------- cart: two-wheeled wooden hand cart ----------
const wheel = (g: THREE.Group, x: number, r: number) => {
  mesh(g, new THREE.TorusGeometry(r, 0.045, 6, 18), WOOD_D(), [x, r, 0], [0, Math.PI / 2, 0]);
  mesh(g, cyl(0.07, 0.07, 0.12, 8), IRON(), [x, r, 0], [0, 0, Math.PI / 2]);
  for (let k = 0; k < 6; k++) mesh(g, box(0.035, r * 2 - 0.05, 0.035), WOOD_D(), [x, r, 0], [k * Math.PI / 6, 0, 0]);
};
const cart = () => {
  const g = new THREE.Group();
  mesh(g, box(1.1, 0.08, 1.6), WOOD(), [0, 0.72, 0]);
  for (const s of [-1, 1]) mesh(g, box(0.05, 0.32, 1.6), WOOD(), [s * 0.53, 0.92, 0]);
  mesh(g, box(1.1, 0.32, 0.05), WOOD(), [0, 0.92, -0.78]);
  mesh(g, box(1.1, 0.32, 0.05), WOOD(), [0, 0.92, 0.78]);
  for (const s of [-1, 1]) mesh(g, box(0.06, 0.06, 1.3), WOOD_D(), [s * 0.4, 0.66, 1.3], [0.12, 0, 0]);
  mesh(g, box(0.9, 0.05, 0.05), WOOD_D(), [0, 0.58, 1.92]);
  mesh(g, cyl(0.04, 0.04, 1.4, 8), IRON(), [0, 0.42, 0], [0, 0, Math.PI / 2]);
  for (const s of [-1, 1]) wheel(g, s * 0.66, 0.42);
  mesh(g, box(0.06, 0.6, 0.06), WOOD_D(), [0, 0.3, 0.95]);
  // load: sacks and a crate
  for (const [x, z, c] of [[-0.25, -0.3, "#d8c08a"], [0.2, -0.25, "#cdb27a"], [-0.1, 0.25, "#e0cc98"]] as [number, number, string][])
    mesh(g, new THREE.SphereGeometry(0.24, 10, 8), mat("sack" + c, c), [x, 0.95, z], [0, 0, 0], [1, 0.75, 1.2]);
  mesh(g, box(0.35, 0.3, 0.35), WOOD(), [0.28, 0.92, 0.35], [0, 0.3, 0]);
  return g;
};

// ---------- market stall with striped awning and goods ----------
const stall = (col: string) => () => {
  const g = new THREE.Group();
  const C = mat("stall" + col, col, THREE.DoubleSide);
  mesh(g, box(2.4, 0.9, 0.9), WOOD(), [0, 0.45, 0.2]);
  mesh(g, box(2.5, 0.06, 1.0), WOOD_D(), [0, 0.93, 0.2]);
  mesh(g, box(2.3, 0.5, 0.02), C, [0, 0.5, 0.66]);
  for (const x of [-1.15, 1.15]) for (const z of [-0.4, 0.65]) mesh(g, box(0.08, 2.4, 0.08), WOOD_D(), [x, 1.2, z]);
  for (let i = 0; i < 8; i++) mesh(g, box(0.32, 0.04, 1.5), i % 2 ? CLOTH_W() : C, [-1.12 + i * 0.32, 2.42, 0.3], [0.22, 0, 0]);
  for (let i = 0; i < 8; i++) mesh(g, box(0.32, 0.22, 0.02), i % 2 ? CLOTH_W() : C, [-1.12 + i * 0.32, 2.15, 1.04]);
  mesh(g, box(2.4, 1.2, 0.04), C, [0, 1.75, -0.42]);
  // goods: fruit baskets and jars
  const fruit = ["#e0402a", "#f2a020", "#8ac83a", "#f4d03a"];
  for (let b = 0; b < 4; b++) {
    const x = -0.85 + b * 0.57;
    mesh(g, cyl(0.22, 0.17, 0.14, 12), mat("basket", "#c89458"), [x, 1.03, 0.25]);
    for (let k = 0; k < 7; k++) mesh(g, new THREE.SphereGeometry(0.07, 8, 6), mat("fruit" + b, fruit[b]), [x + Math.cos(k * 2.4) * 0.11 * (k % 3 ? 1 : 0.3), 1.13 + (k > 4 ? 0.06 : 0), 0.25 + Math.sin(k * 2.4) * 0.11 * (k % 3 ? 1 : 0.3)]);
  }
  for (let k = 0; k < 3; k++) mesh(g, box(0.4, 0.3, 0.4), WOOD(), [-0.8 + k * 0.5, 0.15, 1.0 + (k % 2) * 0.1], [0, k * 0.4, 0]);
  return g;
};

// ---------- bench ----------
const bench = () => {
  const g = new THREE.Group();
  for (let k = 0; k < 3; k++) mesh(g, box(1.6, 0.05, 0.13), WOOD(), [0, 0.45, -0.15 + k * 0.15]);
  for (let k = 0; k < 2; k++) mesh(g, box(1.6, 0.11, 0.04), WOOD(), [0, 0.68 + k * 0.17, -0.27], [-0.18, 0, 0]);
  for (const x of [-0.7, 0.7]) {
    mesh(g, box(0.06, 0.45, 0.06), IRON(), [x, 0.22, 0.12]);
    mesh(g, box(0.06, 0.9, 0.06), IRON(), [x, 0.45, -0.24], [-0.18, 0, 0]);
    mesh(g, box(0.06, 0.05, 0.5), IRON(), [x, 0.42, -0.05]);
    mesh(g, box(0.06, 0.04, 0.4), IRON(), [x, 0.62, 0.0]);
  }
  return g;
};

// ---------- windmill ----------
const windmill = () => {
  const g = new THREE.Group();
  mesh(g, cyl(2.0, 3.0, 9, 8), mat("millWall", "#efe4cc"), [0, 4.5, 0]);
  mesh(g, cyl(3.15, 3.15, 0.3, 8), mat("millBase", "#9a8a78"), [0, 0.15, 0]);
  mesh(g, new THREE.ConeGeometry(2.5, 2.6, 8), mat("millRoof", "#7a3a2a"), [0, 10.3, 0]);
  mesh(g, box(1.0, 1.8, 0.2), WOOD_D(), [0, 0.95, 2.85], [0.1, 0, 0]);
  for (const [y, a] of [[4.2, 0], [6.6, 0.5], [6.6, -0.5]]) mesh(g, box(0.7, 0.8, 0.12), mat("millWin", "#3a4660"), [Math.sin(a) * 2.45, y, Math.cos(a) * 2.45], [0, a, 0]);
  const hub = new THREE.Group(); hub.position.set(0, 9.2, 2.7); hub.rotation.z = 0.35; g.add(hub);
  mesh(hub, cyl(0.25, 0.25, 0.9, 10), WOOD_D(), [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (let k = 0; k < 4; k++) {
    const arm = new THREE.Group(); arm.rotation.z = (k * Math.PI) / 2; hub.add(arm);
    mesh(arm, box(0.18, 6.5, 0.12), WOOD_D(), [0, 3.3, 0.45]);
    mesh(arm, box(1.1, 4.6, 0.04), mat("sail", "#f6f0e2", THREE.DoubleSide), [0.62, 3.9, 0.42]);
    for (let r = 0; r < 6; r++) mesh(arm, box(1.2, 0.05, 0.06), WOOD_D(), [0.62, 1.8 + r * 0.85, 0.46]);
  }
  return g;
};

// ---------- canoe ----------
const canoe = () => {
  const g = new THREE.Group();
  const hull = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  mesh(g, hull, mat("canoe", "#b0482e", THREE.DoubleSide), [0, 0.32, 0], [0, 0, 0], [0.42, 0.32, 2.0]);
  mesh(g, new THREE.TorusGeometry(1, 0.03, 6, 32), WOOD_D(), [0, 0.32, 0], [Math.PI / 2, 0, 0], [0.42, 2.0, 1]);
  for (const z of [-0.6, 0.6]) mesh(g, box(0.72, 0.04, 0.16), WOOD(), [0, 0.24, z]);
  mesh(g, box(0.06, 0.04, 1.4), WOOD(), [0.1, 0.33, 0.6], [0, 0.4, 0.3]);
  return g;
};

// ---------- water lily ----------
const lily = () => {
  const g = new THREE.Group();
  mesh(g, new THREE.CircleGeometry(0.5, 20, 0.35, Math.PI * 2 - 0.5), mat("lilyPad", "#4f9a3c", THREE.DoubleSide), [0, 0.02, 0], [-Math.PI / 2, 0, 0]);
  for (let k = 0; k < 6; k++) mesh(g, new THREE.SphereGeometry(0.07, 6, 4), mat("lilyPetal", "#f8d8e8"), [0.15 + Math.cos(k) * 0.06, 0.06, Math.sin(k) * 0.06], [0, 0, 0], [1, 0.5, 1.6]);
  mesh(g, new THREE.SphereGeometry(0.04, 6, 4), mat("lilyCore", "#f4c430"), [0.15, 0.09, 0]);
  return g;
};

// ---------- flowers and grass tufts ----------
const flower = (col: string) => () => {
  const g = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const x = (k - 1) * 0.12, h = 0.35 + k * 0.08;
    mesh(g, cyl(0.012, 0.016, h, 5), mat("stem", "#4a8a34"), [x, h / 2, (k % 2) * 0.08]);
    mesh(g, new THREE.SphereGeometry(0.06, 5, 3), mat("leaf", "#5aa040"), [x + 0.04, h * 0.35, (k % 2) * 0.08], [0, k, 0.6], [1.4, 0.3, 0.7]);
    for (let p = 0; p < 5; p++) mesh(g, new THREE.SphereGeometry(0.045, 6, 4), mat("petal" + col, col), [x + Math.cos((p / 5) * Math.PI * 2) * 0.05, h, (k % 2) * 0.08 + Math.sin((p / 5) * Math.PI * 2) * 0.05], [0, 0, 0], [1, 0.45, 1]);
    mesh(g, new THREE.SphereGeometry(0.03, 6, 4), mat("flowerCore", "#f4c430"), [x, h + 0.02, (k % 2) * 0.08]);
  }
  return g;
};
const grassTuft = (n: number, h: number) => () => {
  const g = new THREE.Group();
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2, r = 0.05 + (k % 3) * 0.05;
    mesh(g, new THREE.ConeGeometry(0.035, h * (0.7 + (k % 4) * 0.12), 4), mat("grassBlade", k % 2 ? "#5e9e3a" : "#79b84a"), [Math.cos(a) * r, h * 0.4, Math.sin(a) * r], [Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3]);
  }
  return g;
};

// ---------- banners (Bridge.tsx paints its own cloth, this is only the fallback pole) ----------
const banner = (col: string) => () => {
  const g = new THREE.Group();
  mesh(g, cyl(0.05, 0.06, 3.6, 8), WOOD_D(), [0, 1.8, 0]);
  mesh(g, box(1.0, 0.05, 0.05), WOOD_D(), [0, 3.4, 0.05]);
  mesh(g, box(0.9, 1.6, 0.02), mat("banner" + col, col, THREE.DoubleSide), [0, 2.55, 0.08]);
  return g;
};

/** Every Kenney name the bridge template asks for that is not vegetation (VEG draws trees/bushes/hedges itself). */
export const makeKit = (): Kit => ({
  lantern: lantern(), cart: cart(), "stall-red": stall("#d8443a")(), "stall-green": stall("#3f9a5a")(), "stall-bench": bench(),
  windmill: windmill(), canoe: canoe(), lily_large: lily(),
  flower_redA: flower("#e0402a")(), flower_yellowA: flower("#f4c430")(), flower_purpleA: flower("#9a5ad0")(),
  grass_large: grassTuft(14, 0.5)(), grass: grassTuft(9, 0.3)(),
  "banner-red": banner("#c83a32")(), "banner-green": banner("#3f8a4a")(),
});
