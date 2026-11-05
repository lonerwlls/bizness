// Our own 3D props for "What if you swapped bodies every day", in the kitgen / letters style: simple solids,
// two-tone lit lam() materials, painted canvas textures, real-world size, standing on y = 0 unless noted.
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex, beamHD } from "../bridge/paint";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r0: number, r1: number, h: number, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
const add = (g: THREE.Group, geo: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number], r: [number, number, number] = [0, 0, 0]) => {
  const x = new THREE.Mesh(geo, m); x.position.set(...p); x.rotation.set(...r); x.castShadow = true; x.receiveShadow = true; g.add(x); return x;
};
const M = {
  wood: () => lam("swWood", () => ({ map: beamHD() })),
  woodD: () => lam("swWoodD", () => ({ color: "#6e4a30" })),
  white: () => lam("swWhite", () => ({ color: "#f4f1ea" })),
  skin: () => lam("swRubber", () => ({ color: "#f2c6a6" })),
  navy: () => lam("swNavy", () => ({ color: "#2c3552" })),
  pom: () => lam("swPom", () => ({ color: "#f0f2f6" })),
  green: () => lam("swGreen", () => ({ color: "#4f9a3c" })),
  greenL: () => lam("swGreenL", () => ({ color: "#6cb848" })),
  steel: () => lam("swSteel", () => ({ color: "#b8bcc6" })),
  red: () => lam("swRed", () => ({ color: "#c83a32" })),
};
const quiltTex = () => ctex("quilt", 512, 512, (g) => {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? "#f08a3a" : "#f6b860"; g.fillRect(x * 64, y * 64, 64, 64); }
  g.strokeStyle = "rgba(120,60,20,0.45)"; g.lineWidth = 3; for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(k * 64, 0); g.lineTo(k * 64, 512); g.moveTo(0, k * 64); g.lineTo(512, k * 64); g.stroke(); }
});
/** bed 1.0 x 2.0 m, headboard at -z, mattress top at y = 0.5 */
export const BED_LEN = 2.0, MATTRESS_Y = 0.5;
export const bed = () => {
  const g = new THREE.Group();
  add(g, box(1.1, 0.3, 2.1), M.wood(), [0, 0.2, 0]);
  for (const [x, z] of [[-0.5, -1.0], [0.5, -1.0], [-0.5, 1.0], [0.5, 1.0]]) add(g, box(0.08, 0.1, 0.08), M.woodD(), [x, 0.05, z]);
  add(g, box(1.0, 0.15, 2.0), M.white(), [0, 0.425, 0]);
  add(g, box(1.16, 1.0, 0.08), M.wood(), [0, 0.5, -1.06]);
  add(g, box(0.7, 0.06, 0.38), lam("swPillow", () => ({ color: "#fbf8f0" })), [0, 0.53, -0.78]);
  return g;
};
/** the quilt, laid over a sleeper: covers z0..z1 (bed coords), 4 cm thick, hangs over the sides */
export const quilt = (z0: number, z1: number) => {
  const g = new THREE.Group();
  add(g, box(1.06, 0.05, z1 - z0), lam("swQuilt", () => ({ map: quiltTex() })), [0, 0.62, (z0 + z1) / 2]);
  for (const s of [-1, 1]) add(g, box(0.04, 0.25, z1 - z0), lam("swQuilt", () => ({ map: quiltTex() })), [s * 0.53, 0.5, (z0 + z1) / 2]);
  return g;
};
export const nightstand = () => {
  const g = new THREE.Group();
  add(g, box(0.5, 0.55, 0.42), M.wood(), [0, 0.275, 0]);
  add(g, box(0.4, 0.14, 0.02), M.woodD(), [0, 0.38, 0.215]);
  return g;
};
const clockTex = () => ctex("alarmFace", 256, 256, (g) => {
  const c = 128; g.fillStyle = "#c83a32"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#fbf5e4"; g.strokeStyle = "#241726"; g.lineWidth = 10; g.beginPath(); g.arc(c, c, 110, 0, 7); g.fill(); g.stroke();
  g.lineCap = "round"; for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; g.lineWidth = 7; g.beginPath(); g.moveTo(c + 82 * Math.sin(a), c - 82 * Math.cos(a)); g.lineTo(c + 98 * Math.sin(a), c - 98 * Math.cos(a)); g.stroke(); }
  g.lineWidth = 12; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 55 * Math.sin((7 * Math.PI) / 6), c - 55 * Math.cos((7 * Math.PI) / 6)); g.stroke();
  g.lineWidth = 8; g.beginPath(); g.moveTo(c, c); g.lineTo(c, c - 88); g.stroke();
});
/** twin-bell alarm clock showing 7:00, face toward +z, ~16 cm tall */
export const alarmClock = () => {
  const g = new THREE.Group(), red = M.red();
  add(g, cyl(0.07, 0.07, 0.05, 24), red, [0, 0.09, 0], [Math.PI / 2, 0, 0]);
  add(g, new THREE.CircleGeometry(0.062, 24), lam("swAlarmFace", () => ({ map: clockTex() })), [0, 0.09, 0.0255]);
  for (const s of [-1, 1]) { add(g, new THREE.SphereGeometry(0.035, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.steel(), [s * 0.045, 0.155, 0], [0, 0, -s * 0.5]); add(g, cyl(0.006, 0.006, 0.05, 6), M.steel(), [s * 0.05, 0.025, 0.01], [0, 0, s * 0.4]); }
  return g;
};
/** kitchen table 1.2 x 0.8, top at 0.76 */
export const table = () => {
  const g = new THREE.Group();
  add(g, box(1.2, 0.05, 0.8), M.wood(), [0, 0.735, 0]);
  for (const [x, z] of [[-0.54, -0.34], [0.54, -0.34], [-0.54, 0.34], [0.54, 0.34]]) add(g, box(0.06, 0.71, 0.06), M.woodD(), [x, 0.355, z]);
  return g;
};
/** plate with broccoli florets and a fork, sitting on y = 0 (put it on a table top) */
export const broccoliPlate = () => {
  const g = new THREE.Group();
  add(g, cyl(0.13, 0.11, 0.02, 28), M.white(), [0, 0.01, 0]);
  const flor = (x: number, z: number, s: number) => {
    add(g, cyl(0.012 * s, 0.018 * s, 0.05 * s, 8), M.greenL(), [x, 0.03 + 0.025 * s, z]);
    for (const [dx, dy, dz, r] of [[0, 0.07, 0, 0.032], [0.025, 0.062, 0.012, 0.026], [-0.024, 0.062, -0.01, 0.026], [0.006, 0.06, -0.026, 0.024], [-0.01, 0.062, 0.026, 0.024]]) add(g, new THREE.IcosahedronGeometry(r * s, 1), M.green(), [x + dx * s, 0.02 + dy * s, z + dz * s]);
  };
  flor(-0.03, 0.01, 1); flor(0.05, -0.02, 0.9); flor(0.0, -0.06, 0.8);
  add(g, box(0.012, 0.004, 0.18), M.steel(), [0.17, 0.004, 0.0]);
  add(g, box(0.03, 0.004, 0.04), M.steel(), [0.17, 0.004, -0.1]);
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
/** wash basin on a cabinet + mirror frame (the glass is a portal handled by the world), mirror centre y = 1.55 */
export const sinkMirror = () => {
  const g = new THREE.Group();
  add(g, box(0.7, 0.8, 0.45), M.white(), [0, 0.4, 0.22]);
  add(g, cyl(0.2, 0.16, 0.08, 24), lam("swBasin", () => ({ color: "#e8eef4" })), [0, 0.84, 0.24]);
  add(g, cyl(0.015, 0.015, 0.14, 8), M.steel(), [0, 0.92, 0.04]);
  for (const [w, h, x, y] of [[0.74, 0.06, 0, 1.92], [0.74, 0.06, 0, 1.18], [0.06, 0.8, -0.34, 1.55], [0.06, 0.8, 0.34, 1.55]] as [number, number, number, number][]) add(g, box(w, h, 0.05), lam("swMirrorFrame", () => ({ color: "#c8a868" })), [x, y, 0.025]);
  return g;
};
/** the hero's beanie on a coat hook (navy, ribbed cuff, white pompom) */
export const beanieOnHook = () => {
  const g = new THREE.Group();
  add(g, cyl(0.012, 0.012, 0.08, 8), M.woodD(), [0, 0, 0.04], [Math.PI / 2, 0, 0]);
  const hat = new THREE.Group();
  add(hat, new THREE.SphereGeometry(0.12, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.navy(), [0, 0, 0]);
  add(hat, cyl(0.125, 0.125, 0.06, 20), lam("swNavyCuff", () => ({ color: "#232a44" })), [0, -0.01, 0]);
  add(hat, new THREE.SphereGeometry(0.04, 12, 8), M.pom(), [0, 0.13, 0]);
  hat.position.set(0, -0.06, 0.12); hat.rotation.x = 0.4; g.add(hat);
  return g;
};
/** dog kennel, door toward +z */
export const kennel = () => {
  const g = new THREE.Group(), wood = M.wood();
  add(g, box(0.9, 0.7, 1.0), wood, [0, 0.35, 0]);
  const sh = new THREE.Shape(); sh.moveTo(-0.55, 0); sh.lineTo(0.55, 0); sh.lineTo(0, 0.42); sh.closePath();
  const roof = new THREE.ExtrudeGeometry(sh, { depth: 1.1, bevelEnabled: false }); roof.translate(0, 0, -0.55);
  add(g, roof, M.red(), [0, 0.7, 0]);
  add(g, box(0.4, 0.45, 0.02), lam("swDoorDark", () => ({ color: "#2a1c14" })), [0, 0.23, 0.505]);
  add(g, cyl(0.12, 0.1, 0.06, 20), M.steel(), [0.6, 0.03, 0.5]);
  return g;
};
/** lab bench with a divider screen (the real hand hides behind it) and the rubber hand on the near side */
export const labBench = () => {
  const g = new THREE.Group();
  add(g, box(1.6, 0.05, 0.8), M.white(), [0, 0.88, 0]);
  for (const [x, z] of [[-0.75, -0.35], [0.75, -0.35], [-0.75, 0.35], [0.75, 0.35]]) add(g, box(0.05, 0.86, 0.05), M.steel(), [x, 0.43, z]);
  add(g, box(0.02, 0.45, 0.6), lam("swScreen", () => ({ color: "#5a7aa8" })), [0.1, 1.13, 0]);
  return g;
};
/** a rubber hand, palm down, fingers toward +x, ~19 cm long */
export const rubberHand = () => {
  const g = new THREE.Group(), sk = M.skin();
  const palm = add(g, new THREE.SphereGeometry(0.06, 16, 10), sk, [0, 0.02, 0]); palm.scale.set(1.0, 0.35, 0.85);
  for (let i = 0; i < 4; i++) {                                                     // four spread fingers with knuckles
    const z = -0.036 + i * 0.024, len = [0.07, 0.085, 0.08, 0.06][i], a = (i - 1.5) * 0.12;
    add(g, new THREE.SphereGeometry(0.012, 8, 6), sk, [0.052, 0.022, z]);
    add(g, cyl(0.0095, 0.011, len, 10), sk, [0.052 + len / 2 * Math.cos(a), 0.02, z + len / 2 * Math.sin(a)], [0, -a, Math.PI / 2]);
  }
  add(g, cyl(0.011, 0.012, 0.06, 10), sk, [0.01, 0.02, 0.07], [0, 0.9, Math.PI / 2]);         // thumb, pointing out
  add(g, cyl(0.032, 0.036, 0.07, 14), sk, [-0.085, 0.022, 0], [0, 0, Math.PI / 2]);          // wrist
  add(g, cyl(0.04, 0.04, 0.03, 16), lam("swCuff", () => ({ color: "#5a7aa8" })), [-0.13, 0.024, 0], [0, 0, Math.PI / 2]);
  return g;
};
/** paintbrush, bristles toward -y */
export const brush = () => {
  const g = new THREE.Group();
  add(g, cyl(0.007, 0.007, 0.18, 8), M.red(), [0, 0.1, 0]);
  add(g, cyl(0.009, 0.009, 0.025, 8), M.steel(), [0, 0.0, 0]);
  add(g, cyl(0.009, 0.004, 0.035, 8), lam("swBristle", () => ({ color: "#d8c49a" })), [0, -0.03, 0]);
  return g;
};
