// Our own 3D props for "What if you met your exact copy", in the kitgen / swap style: simple solids, two-tone lit
// lam() materials, painted canvas textures, real-world size, standing on y = 0 unless noted. Shared furniture comes
// from ../future/props and ../health/props. The thought / speech bubbles are comic labels drawn on canvases.
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

// ---------------- comic bubbles ----------------
/** a thought cloud ("think") or a speech bubble ("say") with big text, facing the lens */
export const bubble = (kind: "think" | "say", text: string) => {
  const t = ctex(`bubble_${kind}_${text}`, 320, 260, (g) => {
    g.lineWidth = 12; g.strokeStyle = "#241726"; g.fillStyle = "#ffffff";
    if (kind === "think") {
      g.beginPath(); for (const [x, y, r] of [[110, 100, 62], [180, 80, 66], [230, 120, 56], [90, 150, 50], [160, 155, 62], [220, 165, 46]]) { g.moveTo(x + r, y); g.arc(x, y, r, 0, 7); } g.stroke(); g.fill();
      for (const [x, y, r] of [[90, 225, 16], [62, 248, 9]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.fill(); }
    } else {
      g.beginPath(); g.roundRect(26, 26, 268, 170, 60); g.moveTo(90, 190); g.lineTo(70, 248); g.lineTo(140, 194); g.stroke(); g.fill();
      g.beginPath(); g.roundRect(26, 26, 268, 170, 60); g.fill();
    }
    g.fillStyle = "#241726"; g.font = `900 120px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 162, 122);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42 * 260 / 320), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false, fog: false }));
  m.layers.set(NOINK); m.renderOrder = 6; m.visible = false;
  return m;
};

// ---------------- kitchen ----------------
/** a cereal bowl with milk and cereal rings, 15 cm, sitting on y = 0 */
export const cereal = () => {
  const g = new THREE.Group();
  add(g, cyl(0.075, 0.045, 0.06, 24), lam("cBowl", () => ({ color: "#5a8fc2" })), [0, 0.03, 0]);
  add(g, cyl(0.069, 0.069, 0.004, 24), M.white(), [0, 0.056, 0]);
  for (let k = 0; k < 12; k++) { const a = k * 2.4, r = 0.015 + (k % 4) * 0.012; add(g, new THREE.TorusGeometry(0.008, 0.004, 5, 10), lam("cRing" + (k % 3), () => ({ color: ["#f4b030", "#e86a5a", "#f4d26a"][k % 3] })), [r * Math.cos(a), 0.06, r * Math.sin(a)], [Math.PI / 2, 0, 0]); }
  add(g, box(0.012, 0.005, 0.13), M.steel(), [0.03, 0.08, 0.02], [0.5, 0.4, 0]);
  return g;
};
/** an open pizza box with crumbs (the last slice is separate), sitting on y = 0 */
export const pizzaBox = () => {
  const g = new THREE.Group(), card = lam("cPizzaBox", () => ({ color: "#d8c49a" }));
  add(g, box(0.42, 0.01, 0.42), card, [0, 0.005, 0]);
  for (const [w, d, x, z] of [[0.42, 0.01, 0, 0.205], [0.42, 0.01, 0, -0.205], [0.01, 0.42, 0.205, 0], [0.01, 0.42, -0.205, 0]] as number[][]) add(g, box(w, 0.04, d), card, [x, 0.02, z]);
  for (let k = 0; k < 7; k++) add(g, new THREE.SphereGeometry(0.006, 6, 4), lam("cCrumb", () => ({ color: "#c8803a" })), [-0.12 + k * 0.04, 0.012, (k % 3 - 1) * 0.08]);
  return g;
};
const sliceTex = () => ctex("pizzaSlice", 256, 256, (g, r) => {
  g.fillStyle = "#f2c64a"; g.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 7; k++) { g.fillStyle = "#c8302a"; g.beginPath(); g.arc(40 + r() * 170, 40 + r() * 170, 18, 0, 7); g.fill(); }
});
/** one slice of pizza, tip toward +x, 22 cm long, lying flat */
export const slice = () => {
  const g = new THREE.Group(), sh = new THREE.Shape();
  sh.moveTo(-0.11, -0.07); sh.lineTo(0.11, 0); sh.lineTo(-0.11, 0.07); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
  add(g, geo, lam("cSlice", () => ({ map: sliceTex() })), [0, 0, 0]);
  add(g, cyl(0.016, 0.016, 0.15, 10), lam("cCrust", () => ({ color: "#c8803a" })), [-0.11, 0.008, 0], [Math.PI / 2, 0, 0]);
  return g;
};
/** a school notebook lying open with a pencil, sitting on y = 0 */
export const notebook = () => {
  const g = new THREE.Group();
  add(g, box(0.3, 0.012, 0.21), lam("cNoteCover", () => ({ color: "#3f6fb5" })), [0, 0.006, 0]);
  add(g, box(0.29, 0.004, 0.2), lam("cNotePage", () => ({ map: ctex("notePage", 256, 180, (c) => { c.fillStyle = "#fbfaf4"; c.fillRect(0, 0, 256, 180); c.strokeStyle = "#9cc0e8"; c.lineWidth = 3; for (let y = 20; y < 180; y += 18) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } c.strokeStyle = "#2a3a8a"; c.lineWidth = 4; for (let y = 38; y < 120; y += 18) { c.beginPath(); c.moveTo(20, y - 4); c.lineTo(100 + (y % 50), y - 4); c.stroke(); } c.fillStyle = "#c8c8c8"; c.fillRect(126, 0, 4, 180); }) })), [0, 0.014, 0]);
  add(g, cyl(0.004, 0.004, 0.16, 6), lam("cPencil", () => ({ color: "#f4c430" })), [0.05, 0.022, 0.03], [0, 0.6, Math.PI / 2]);
  return g;
};

// ---------------- stairs and socks ----------------
/** a straight staircase rising toward +z: n steps 0.19 m high, 0.27 m deep, 1.0 m wide, with a handrail on +x */
export const stairs = (n = 10) => {
  const g = new THREE.Group(), tread = M.wood(), riser = lam("cRiser", () => ({ color: "#f2ead8" }));
  for (let k = 0; k < n; k++) {
    add(g, box(1.0, 0.19 * (k + 1), 0.27), riser, [0, 0.095 * (k + 1), 0.27 * k + 0.135]);
    add(g, box(1.04, 0.03, 0.29), tread, [0, 0.19 * (k + 1) + 0.015, 0.27 * k + 0.135]);
    if (k % 2 === 0) add(g, box(0.03, 0.9, 0.03), M.woodD(), [0.5, 0.19 * (k + 1) + 0.45, 0.27 * k + 0.135]);
  }
  const L = Math.hypot(0.27 * n, 0.19 * n), rail = add(g, box(0.05, 0.05, L), M.woodD(), [0.5, 0.19 * n / 2 + 0.95, 0.27 * n / 2]);
  rail.rotation.x = -Math.atan2(0.19, 0.27);
  return g;
};
/** a crumpled sock lying on a step, ~22 cm */
export const sock = (col: string) => {
  const g = new THREE.Group(), m = lam("cSock" + col, () => ({ color: col }));
  const a = add(g, new THREE.CapsuleGeometry(0.035, 0.12, 4, 10), m, [0, 0.03, 0], [0, 0, Math.PI / 2]); a.scale.set(1, 1, 0.6);
  const b = add(g, new THREE.CapsuleGeometry(0.035, 0.05, 4, 10), m, [0.09, 0.03, 0.04], [Math.PI / 2, 0, 0]); b.scale.set(1, 1, 0.6);
  add(g, cyl(0.036, 0.036, 0.03, 12), lam("cSockBand", () => ({ color: "#f4f1ea" })), [-0.09, 0.03, 0], [0, 0, Math.PI / 2]);
  return g;
};

// ---------------- gym ----------------
const ballTex = () => ctex("basketball", 256, 128, (g) => {
  g.fillStyle = "#e8742a"; g.fillRect(0, 0, 256, 128); g.strokeStyle = "#241726"; g.lineWidth = 5;
  for (const x of [0, 64, 128, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke(); }
  g.beginPath(); g.moveTo(0, 64); g.lineTo(256, 64); g.stroke();
});
export const ball = () => { const g = new THREE.Group(); add(g, new THREE.SphereGeometry(0.12, 24, 16), lam("cBall", () => ({ map: ballTex() })), [0, 0, 0]); return g; };
/** basketball hoop on a pole: rim at 3.05 m, backboard toward -z */
export const hoop = () => {
  const g = new THREE.Group(), blue = lam("cPole", () => ({ color: "#2e4a7a" }));
  add(g, cyl(0.07, 0.08, 3.6, 12), blue, [0, 1.8, 0]);
  add(g, box(0.1, 0.1, 0.9), blue, [0, 3.3, -0.45]);
  add(g, box(1.8, 1.05, 0.05), lam("cBoard", () => ({ map: ctex("backboard", 256, 150, (c) => { c.fillStyle = "#f4f4f8"; c.fillRect(0, 0, 256, 150); c.strokeStyle = "#e8402e"; c.lineWidth = 10; c.strokeRect(6, 6, 244, 138); c.strokeRect(88, 70, 80, 60); }) })), [0, 3.35, -0.92]);
  add(g, new THREE.TorusGeometry(0.23, 0.015, 8, 28), lam("cRim", () => ({ color: "#e8402e" })), [0, 3.05, -1.2], [Math.PI / 2, 0, 0]);
  return g;
};
const courtTex = () => ctex("gymCourt", 1024, 1024, (g, r) => {
  for (let x = 0; x < 1024; x += 32) { g.fillStyle = (x / 32) % 2 ? "#e0b070" : "#d8a864"; g.fillRect(x, 0, 32, 1024); }
  for (let i = 0; i < 600; i++) { g.fillStyle = "rgba(120,70,20,0.12)"; g.fillRect(r() * 1024, r() * 1024, 2, 30); }
  g.strokeStyle = "#f4f4f8"; g.lineWidth = 10; g.strokeRect(40, 40, 944, 944);
  g.beginPath(); g.moveTo(40, 512); g.lineTo(984, 512); g.stroke(); g.beginPath(); g.arc(512, 512, 110, 0, 7); g.stroke();
  g.strokeStyle = "#e8402e"; for (const y of [40, 984]) { g.beginPath(); g.arc(512, y, 260, 0, 7); g.stroke(); g.strokeRect(392, y === 40 ? 40 : 784, 240, 200); }
});
export const court = () => {
  const g = new THREE.Group();
  add(g, new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), lam("cCourt", () => ({ map: courtTex() })), [0, 0.001, 0]);
  return g;
};
/** wooden bleachers, three rows rising toward +z */
export const bleachers = (w = 8) => {
  const g = new THREE.Group(), m = M.wood();
  for (let k = 0; k < 3; k++) add(g, box(w, 0.4 * (k + 1), 0.6), m, [0, 0.2 * (k + 1), 0.6 * k]);
  return g;
};

// ---------------- classroom ----------------
const detentionTex = () => ctex("detentionBoard", 1024, 420, (g, r) => {
  g.fillStyle = "#2e5a46"; g.fillRect(0, 0, 1024, 420);
  for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(255,255,255,0.04)"; g.fillRect(r() * 1024, r() * 420, 30, 4); }
  g.fillStyle = "#f4f4ec"; g.textAlign = "center"; g.font = `800 120px "DejaVu Sans", sans-serif`; g.fillText("DETENTION", 512, 190);
  g.font = `600 52px "DejaVu Sans", sans-serif`; g.fillText("3:00 - 4:00   No talking", 512, 300);
  g.strokeStyle = "#8a6a44"; g.lineWidth = 24; g.strokeRect(0, 0, 1024, 420);
});
export const blackboard = () => {
  const g = new THREE.Group();
  add(g, box(3.2, 1.3, 0.04), lam("cDetBoard", () => ({ map: detentionTex() })), [0, 1.55, 0]);
  add(g, box(3.0, 0.04, 0.1), M.woodD(), [0, 0.88, 0.05]);
  return g;
};
