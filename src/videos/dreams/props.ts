// Our own 3D props for "What if your dreams were memories", in the kitgen / swap style: simple solids, two-tone lit
// lam() materials, painted canvas textures, real-world size, standing on y = 0 unless noted.
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex, beamHD } from "../bridge/paint";
import { Pen, bodyFront, Outfit } from "../bridge/toon";

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
  brass: () => lam("dBrass", () => ({ color: "#d8b04a" })),
};

// ---------------- the house with the red door ----------------
const sidingTex = () => ctex("oldSiding", 512, 512, (g, r) => {
  g.fillStyle = "#c8c0b0"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 32) { g.fillStyle = "rgba(90,80,70,0.35)"; g.fillRect(0, y, 512, 4); g.fillStyle = "rgba(255,255,255,0.15)"; g.fillRect(0, y + 4, 512, 3); }
  for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(80,70,60,0.12)"; g.fillRect(r() * 512, r() * 512, 4 + r() * 10, 2); }
});
const boardedTex = () => ctex("dustyWindow", 256, 320, (g) => {
  g.fillStyle = "#3a4048"; g.fillRect(0, 0, 256, 320);
  g.fillStyle = "rgba(200,210,220,0.25)"; g.fillRect(20, 20, 216, 280);
  g.fillStyle = "#e8e0d0"; g.fillRect(0, 0, 256, 14); g.fillRect(0, 306, 256, 14); g.fillRect(0, 0, 14, 320); g.fillRect(242, 0, 14, 320); g.fillRect(121, 0, 14, 320); g.fillRect(0, 153, 256, 14);
});
/** an old two-storey house, front wall at z = 0 with a door hole (0.9 x 2.05) at x = 0, extends toward -z;
 *  w wide, d deep, walls h high, pitched roof along x. Interior is hollow (a hallway inside). */
export const oldHouse = (w = 7, d = 7, h = 5.2) => {
  const g = new THREE.Group(), s = lam("dSiding", () => ({ map: sidingTex() })), inner = lam("dInnerWall", () => ({ color: "#b8a888" })), trim = lam("dTrim", () => ({ color: "#f2ead8" }));
  const t = 0.15, hw = w / 2;
  // front wall around the door hole
  add(g, box(hw - 0.45, h, t), s, [-(0.45 + (hw - 0.45) / 2), h / 2, -t / 2]);
  add(g, box(hw - 0.45, h, t), s, [0.45 + (hw - 0.45) / 2, h / 2, -t / 2]);
  add(g, box(0.9, h - 2.05, t), s, [0, 2.05 + (h - 2.05) / 2, -t / 2]);
  add(g, box(t, h, d), s, [-hw + t / 2, h / 2, -d / 2]); add(g, box(t, h, d), s, [hw - t / 2, h / 2, -d / 2]);
  add(g, box(w, h, t), s, [0, h / 2, -d + t / 2]);
  // inner skin (darker, dusty) a little inside the shell
  for (const [ww, hh, x, y, z, ry] of [[d - 0.3, h, -hw + t + 0.01, h / 2, -d / 2, Math.PI / 2], [d - 0.3, h, hw - t - 0.01, h / 2, -d / 2, -Math.PI / 2], [w - 0.3, h, 0, h / 2, -d + t + 0.01, 0]] as number[][]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh), inner); p.position.set(x, y, z); p.rotation.y = ry; p.receiveShadow = true; g.add(p);
  }
  // floor + ceiling of the hallway
  add(g, box(w - 0.3, 0.05, d - 0.3), lam("dOldFloor", () => ({ color: "#8a6a48" })), [0, 0.025, -d / 2]);
  add(g, box(w - 0.3, 0.1, d - 0.3), lam("dCeil", () => ({ color: "#d8d0c0" })), [0, 3.2, -d / 2]);
  // roof
  const roof = lam("dRoofOld", () => ({ color: "#5a3a3a" })), rh = 2.4, sl = Math.hypot(d / 2 + 0.4, rh);
  for (const s2 of [-1, 1]) { const r = add(g, box(w + 0.6, 0.15, sl), roof, [0, h + rh / 2, -d / 2 + s2 * (d / 4 + 0.1)]); r.rotation.x = s2 * Math.atan2(rh, d / 2 + 0.4); }
  const gable = new THREE.Shape(); gable.moveTo(-d / 2, 0); gable.lineTo(d / 2, 0); gable.lineTo(0, rh); gable.closePath();
  for (const s2 of [-1, 1]) { const ge = new THREE.ExtrudeGeometry(gable, { depth: t, bevelEnabled: false }); ge.rotateY(Math.PI / 2); add(g, ge, s, [s2 * hw - t / 2, h, -d / 2]); }
  // windows, steps, porch light
  for (const [x, y] of [[-2.2, 1.6], [2.2, 1.6], [-2.2, 4.0], [0, 4.0], [2.2, 4.0]] as number[][]) {
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), lam("dOldWin", () => ({ map: boardedTex() }))); wm.position.set(x, y, 0.01); g.add(wm);
    add(g, box(1.05, 0.08, 0.12), trim, [x, y - 0.6, 0.04]);
  }
  add(g, box(1.6, 0.16, 0.9), lam("dStep", () => ({ color: "#9a9a98" })), [0, 0.08, 0.45]);
  add(g, box(1.06, 0.1, 0.15), trim, [0, 2.12, 0.02]);
  return g;
};
/** terracotta flowerpot with a little plant (~40 cm) */
export const flowerpot = () => {
  const g = new THREE.Group();
  add(g, cyl(0.16, 0.12, 0.28, 18), lam("dPot2", () => ({ color: "#c86a3a" })), [0, 0.14, 0]);
  add(g, cyl(0.175, 0.175, 0.04, 18), lam("dPotRim", () => ({ color: "#b85a2e" })), [0, 0.28, 0]);
  add(g, cyl(0.15, 0.15, 0.02, 18), lam("dSoil", () => ({ color: "#4a3020" })), [0, 0.28, 0]);
  for (let k = 0; k < 6; k++) add(g, new THREE.SphereGeometry(0.07, 10, 8), lam("dGeranium" + (k % 2), () => ({ color: k % 2 ? "#4f9a3c" : "#e8402e" })), [0.07 * Math.cos(k), 0.35 + 0.03 * (k % 3), 0.07 * Math.sin(k)]);
  return g;
};
/** an old brass key lying flat, 9 cm, along x */
export const key = () => {
  const g = new THREE.Group(), b = M.brass();
  add(g, new THREE.TorusGeometry(0.018, 0.006, 8, 16), b, [-0.035, 0.006, 0], [Math.PI / 2, 0, 0]);
  add(g, box(0.06, 0.008, 0.01), b, [0.01, 0.006, 0]);
  add(g, box(0.008, 0.008, 0.02), b, [0.032, 0.006, 0.012]); add(g, box(0.008, 0.008, 0.015), b, [0.02, 0.006, 0.01]);
  return g;
};

// ---------------- the attic ----------------
/** wooden chest 0.8 x 0.45 x 0.5 with a hinged lid and a 3-dial combination lock on the front (+z) */
export const chest = () => {
  const g = new THREE.Group(), w = lam("dChestW", () => ({ color: "#8a5a34" })), band = lam("dChestBand", () => ({ color: "#4a4a52" }));
  // a hollow box: bottom + four walls, so what lies inside can be seen once the lid is up
  add(g, box(0.8, 0.04, 0.5), w, [0, 0.02, 0]);
  add(g, box(0.8, 0.42, 0.04), w, [0, 0.21, 0.23]); add(g, box(0.8, 0.42, 0.04), w, [0, 0.21, -0.23]);
  add(g, box(0.04, 0.42, 0.5), w, [-0.38, 0.21, 0]); add(g, box(0.04, 0.42, 0.5), w, [0.38, 0.21, 0]);
  add(g, box(0.72, 0.2, 0.42), lam("dChestIn", () => ({ color: "#5a3a22" })), [0, 0.1, 0]);
  for (const x of [-0.3, 0.3]) for (const z of [-0.25, 0.25]) add(g, box(0.05, 0.43, 0.02), band, [x, 0.21, z]);
  const lid = new THREE.Group(); lid.position.set(0, 0.42, -0.25); g.add(lid);
  add(lid, box(0.82, 0.08, 0.52), w, [0, 0.04, 0.25]);
  for (const x of [-0.3, 0.3]) add(lid, box(0.05, 0.085, 0.53), band, [x, 0.04, 0.25]);
  add(g, box(0.86, 0.02, 0.56), lam("dDust", () => ({ color: "#d8d0c0" })), [0, 0.001, 0]);
  // the lock: a steel body with three dials whose digits we redraw
  const lock = new THREE.Group(); lock.position.set(0, 0.33, 0.26); g.add(lock);
  add(lock, box(0.16, 0.1, 0.03), M.steel(), [0, 0, 0]);
  const shackle = add(lock, new THREE.TorusGeometry(0.035, 0.008, 6, 14, Math.PI), M.steel(), [0, 0.05, 0]);
  const cv = document.createElement("canvas"); cv.width = 192; cv.height = 64;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.045), new THREE.MeshBasicMaterial({ map: tex })); face.position.set(0, -0.005, 0.016); lock.add(face);
  let cur = "";
  const setDigits = (d: string, open: boolean) => {
    if (d + open !== cur) {
      cur = d + open; const c = cv.getContext("2d")!;
      c.fillStyle = "#2a2c36"; c.fillRect(0, 0, 192, 64);
      for (let k = 0; k < 3; k++) { c.fillStyle = "#e8e4dc"; c.fillRect(8 + k * 62, 6, 52, 52); c.fillStyle = "#1a1830"; c.font = `900 46px "DejaVu Sans", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(d[k] ?? "0", 34 + k * 62, 34); }
      tex.needsUpdate = true;
    }
    shackle.position.y = open ? 0.075 : 0.05;
  };
  setDigits("000", false);
  return { g, lid, lock, setDigits, open: (k: number) => { lid.rotation.x = -1.7 * Math.max(0, Math.min(1, k)); } };
};
/** a cardboard box with a taped lid */
export const cardboard = (w = 0.6, h = 0.45, d = 0.45) => {
  const g = new THREE.Group();
  add(g, box(w, h, d), lam("dCardboard", () => ({ color: "#c8a070" })), [0, h / 2, 0]);
  add(g, box(w * 1.01, 0.012, 0.08), lam("dTape", () => ({ color: "#d8c49a" })), [0, h + 0.006, 0]);
  return g;
};
/** furniture under a dust sheet: a lumpy white shape */
export const sheeted = () => {
  const g = new THREE.Group(), s = lam("dSheet", () => ({ color: "#ece6dc" }));
  add(g, box(0.9, 0.9, 0.7), s, [0, 0.45, 0]);
  const top = add(g, new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), s, [0, 0.9, 0]); top.scale.set(0.95, 0.35, 0.75);
  return g;
};
export const roundWindow = () => {
  const g = new THREE.Group();
  add(g, new THREE.TorusGeometry(0.42, 0.05, 8, 28), lam("dTrim", () => ({ color: "#f2ead8" })), [0, 0, 0]);
  const gl = new THREE.Mesh(new THREE.CircleGeometry(0.4, 28), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.25) })); gl.position.z = -0.01; g.add(gl);
  add(g, box(0.8, 0.04, 0.04), lam("dTrim", () => ({ color: "#f2ead8" })), [0, 0, 0.01]); add(g, box(0.04, 0.8, 0.04), lam("dTrim", () => ({ color: "#f2ead8" })), [0, 0, 0.01]);
  return g;
};

// ---------------- paper things ----------------
/** the old photo: a sepia snapshot of a kid who looks exactly like the hero; back says "Grandpa, 1965" */
export const photo = (hero: Outfit) => {
  const front = ctex("grandpaPhoto", 300, 360, (g) => {
    g.fillStyle = "#f2ead6"; g.fillRect(0, 0, 300, 360);
    const gr = g.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, "#c8b090"); gr.addColorStop(1, "#8a7050"); g.fillStyle = gr; g.fillRect(16, 16, 268, 268);
    g.fillStyle = "#6a5038"; g.fillRect(16, 230, 268, 54);
    const sub = document.createElement("canvas"); sub.width = 600; sub.height = 1000;
    bodyFront(new Pen(sub.getContext("2d")!), hero, { mode: "stand", expr: "grin", seed: 4 });
    g.save(); g.filter = "sepia(0.85) contrast(1.05)"; g.drawImage(sub, 60, 30, 180, 300); g.restore();
    g.fillStyle = "rgba(120,90,50,0.18)"; g.fillRect(16, 16, 268, 268);
    g.fillStyle = "#3a3028"; g.font = `italic 600 26px "DejaVu Serif", serif`; g.textAlign = "center"; g.fillText("summer", 150, 325);
  });
  const back = ctex("grandpaPhotoBack", 300, 360, (g) => {
    g.fillStyle = "#efe6d0"; g.fillRect(0, 0, 300, 360);
    g.strokeStyle = "rgba(160,140,110,0.4)"; g.lineWidth = 2; for (let y = 60; y < 340; y += 40) { g.beginPath(); g.moveTo(20, y); g.lineTo(280, y); g.stroke(); }
    g.fillStyle = "#2a3a7a"; g.font = `italic 700 44px "DejaVu Serif", serif`; g.textAlign = "center"; g.fillText("Grandpa,", 150, 160); g.fillText("1965", 150, 220);
  });
  const g = new THREE.Group();
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.12), lam("dPhotoF", () => ({ map: front }))); f.position.z = 0.0012; g.add(f);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.12), lam("dPhotoB", () => ({ map: back }))); b.rotation.y = Math.PI; b.position.z = -0.0012; g.add(b);
  add(g, box(0.1, 0.12, 0.002), lam("dPhotoEdge", () => ({ color: "#efe6d0" })), [0, 0, 0]);
  return g;
};
/** an old folded map with an island and a red X, facing +z */
export const map = () => {
  const t = ctex("islandMap", 512, 384, (g, r) => {
    g.fillStyle = "#e8d8a8"; g.fillRect(0, 0, 512, 384);
    for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(150,110,60,0.12)"; g.fillRect(r() * 512, r() * 384, 6, 6); }
    g.fillStyle = "#9cc8d8"; g.fillRect(24, 24, 464, 336);
    g.fillStyle = "#e8c878"; g.beginPath(); g.ellipse(250, 200, 120, 80, 0.3, 0, 7); g.fill();
    g.fillStyle = "#6aa84a"; g.beginPath(); g.ellipse(240, 190, 70, 40, 0.3, 0, 7); g.fill();
    g.strokeStyle = "#c8302a"; g.lineWidth = 10; g.beginPath(); g.moveTo(300, 210); g.lineTo(330, 240); g.moveTo(330, 210); g.lineTo(300, 240); g.stroke();
    g.setLineDash([10, 10]); g.lineWidth = 4; g.strokeStyle = "#7a4a2a"; g.beginPath(); g.moveTo(60, 340); g.quadraticCurveTo(150, 260, 300, 225); g.stroke(); g.setLineDash([]);
    g.strokeStyle = "rgba(120,90,50,0.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(256, 0); g.lineTo(256, 384); g.moveTo(0, 192); g.lineTo(512, 192); g.stroke();
    g.fillStyle = "#3a2a1a"; g.font = `700 22px "DejaVu Serif", serif`; g.fillText("N", 460, 70);
  });
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.225), lam("dMapM", () => ({ map: t, side: THREE.DoubleSide }))); m.position.z = 0.001; g.add(m);
  return g;
};
/** a yellow sticky note with "7 2 4" on it, lying flat */
export const sticky = () => {
  const t = ctex("sticky724", 256, 256, (g) => {
    g.fillStyle = "#f8e060"; g.fillRect(0, 0, 256, 256); g.fillStyle = "rgba(0,0,0,0.06)"; g.fillRect(0, 0, 256, 40);
    g.fillStyle = "#1a2a6a"; g.font = `700 92px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("7 2 4", 128, 140);
  });
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.076, 0.076), lam("dStickyM", () => ({ map: t, polygonOffset: true, polygonOffsetFactor: -2 }))); m.rotation.x = -Math.PI / 2; m.position.y = 0.002; g.add(m);
  return g;
};
export const pen = () => { const g = new THREE.Group(); add(g, cyl(0.005, 0.005, 0.14, 8), lam("dPen", () => ({ color: "#2a5ab8" })), [0, 0.005, 0], [0, 0, Math.PI / 2]); return g; };
/** bedside lamp (warm glowing shade), ~45 cm */
export const bedLamp = () => {
  const g = new THREE.Group();
  add(g, cyl(0.07, 0.08, 0.03, 14), M.woodD(), [0, 0.015, 0]); add(g, cyl(0.012, 0.012, 0.28, 8), M.brass(), [0, 0.16, 0]);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.14, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 1.4, 0.9), side: THREE.DoubleSide })); sh.position.y = 0.34; g.add(sh);
  return g;
};
