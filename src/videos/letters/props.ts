// Our own 3D props for "Letters from next year", built like kitgen.ts / the ship: simple solids, two-tone lit
// materials from lam() (same shading, ink outlines and palette as the town), painted canvas textures for paper,
// leather and wood. Every prop stands on y = 0 (or is centred, for hand-held ones) at real-world size.
import * as THREE from "three";
import { lam, boxGeo, V } from "../bridge/build";
import { ctex, rep, planksHD, beamHD } from "../bridge/paint";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r0: number, r1: number, h: number, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
const add = (g: THREE.Group, geo: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number], r: [number, number, number] = [0, 0, 0]) => {
  const x = new THREE.Mesh(geo, m); x.position.set(...p); x.rotation.set(...r); x.castShadow = true; x.receiveShadow = true; g.add(x); return x;
};

// ---------------- handwriting ----------------
/** the big loopy capital L every letter is signed with */
export const loopyL = (g: CanvasRenderingContext2D, x: number, y: number, s: number, col = "#2a2350") => {
  g.save(); g.strokeStyle = col; g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = s * 0.07;
  g.beginPath();
  g.moveTo(x + s * 0.55, y - s * 0.78);                                             // top loop start
  g.bezierCurveTo(x + s * 0.95, y - s * 1.05, x + s * 0.2, y - s * 1.2, x + s * 0.3, y - s * 0.75);
  g.bezierCurveTo(x + s * 0.38, y - s * 0.35, x + s * 0.2, y - s * 0.1, x - s * 0.05, y - s * 0.02); // stem down
  g.bezierCurveTo(x - s * 0.3, y + s * 0.05, x - s * 0.25, y - s * 0.28, x + s * 0.05, y - s * 0.12); // bottom loop
  g.bezierCurveTo(x + s * 0.4, y + s * 0.08, x + s * 0.8, y + s * 0.02, x + s * 1.05, y - s * 0.12); // tail
  g.stroke(); g.restore();
};
const HAND = `italic 600 FONTpx "DejaVu Serif", Georgia, serif`;
/** a letter page: cream paper, faint ruling, handwritten lines, the loopy L signature (blank = empty page) */
export const pageTex = (key: string, lines: string[], sign = true, blank = false) => ctex("page_" + key, 420, 560, (g, r) => {
  g.fillStyle = "#fbf4e2"; g.fillRect(0, 0, 420, 560);
  for (let i = 0; i < 400; i++) { g.fillStyle = r() < 0.5 ? "rgba(200,180,140,0.08)" : "rgba(255,255,255,0.15)"; g.fillRect(r() * 420, r() * 560, 3 + r() * 10, 2); }
  g.strokeStyle = "rgba(150,170,210,0.35)"; g.lineWidth = 2;
  for (let y = 120; y < 520; y += 44) { g.beginPath(); g.moveTo(30, y); g.lineTo(390, y); g.stroke(); }
  g.strokeStyle = "rgba(200,140,140,0.35)"; g.beginPath(); g.moveTo(52, 20); g.lineTo(52, 540); g.stroke();
  g.strokeStyle = "rgba(120,90,50,0.5)"; g.lineWidth = 6; g.strokeRect(3, 3, 414, 554);
  if (blank) return;
  g.fillStyle = "#2a2350"; g.textBaseline = "alphabetic";
  let y = 112;
  for (const l of lines) {
    const big = l.startsWith("!");
    const txt = big ? l.slice(1) : l;
    g.font = HAND.replace("FONT", String(big ? 44 : 34));
    // wrap
    const words = txt.split(" "); let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (g.measureText(t).width > 330 && line) { g.fillText(line, 60, y); y += 44; line = w; } else line = t;
    }
    g.fillText(line, 60, y); y += 44;
  }
  if (sign) loopyL(g, 300, 500, 90);
});
/** envelope face: kraft paper, address lines, stamp, red wax seal drawn on the back flap side */
const envTex = (key: string, name: string) => ctex("env_" + key, 440, 240, (g, r) => {
  g.fillStyle = "#efe2c2"; g.fillRect(0, 0, 440, 240);
  for (let i = 0; i < 200; i++) { g.fillStyle = "rgba(170,140,90,0.1)"; g.fillRect(r() * 440, r() * 240, 6, 2); }
  g.strokeStyle = "rgba(150,120,80,0.6)"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(220, 130); g.lineTo(440, 0); g.stroke();             // flap
  g.fillStyle = "#b8262e"; g.beginPath(); g.arc(220, 128, 26, 0, 7); g.fill();                  // wax seal
  g.strokeStyle = "#7a141a"; g.lineWidth = 3; g.beginPath(); g.arc(220, 128, 18, 0, 7); g.stroke();
  g.fillStyle = "#f4d0a0"; g.fillRect(360, 160, 60, 66); g.strokeStyle = "#c8403a"; g.strokeRect(364, 164, 52, 58); // stamp
  g.fillStyle = "#2a2350"; g.font = HAND.replace("FONT", "30"); g.fillText(name, 40, 205);
  g.strokeStyle = "rgba(120,90,50,0.6)"; g.lineWidth = 5; g.strokeRect(2, 2, 436, 236);
});

// ---------------- hand-held paper ----------------
/** a letter page (21 x 28 cm, 3 mm card), centred on its middle, facing +z */
export const page = (key: string, lines: string[], opts: { sign?: boolean; blank?: boolean } = {}) => {
  const g = new THREE.Group();
  const m = lam("pageM_" + key, () => ({ map: pageTex(key, lines, opts.sign ?? true, opts.blank ?? false) }));
  add(g, box(0.21, 0.28, 0.003), m, [0, 0, 0]);
  return g;
};
/** an envelope (22 x 12 cm) with a wax seal; open = flap lifted and the page sticking out */
export const envelope = (key: string, name: string, open = false, inner?: THREE.Object3D) => {
  const g = new THREE.Group();
  const m = lam("envM_" + key, () => ({ map: envTex(key, name) }));
  add(g, box(0.22, 0.12, 0.006), m, [0, 0, 0]);
  if (!open) add(g, cyl(0.014, 0.014, 0.006, 14), lam("wax", () => ({ color: "#b8262e" })), [0, -0.01, 0.005], [Math.PI / 2, 0, 0]);
  else {
    const flap = new THREE.Shape(); flap.moveTo(-0.11, 0); flap.lineTo(0.11, 0); flap.lineTo(0, 0.07); flap.closePath();
    add(g, new THREE.ShapeGeometry(flap), lam("envFlap", () => ({ color: "#e6d6b0", side: THREE.DoubleSide })), [0, 0.06, -0.004], [-0.5, 0, 0]);
    if (inner) { inner.position.set(0, 0.07, -0.001); inner.scale.setScalar(0.92); g.add(inner); }
  }
  return g;
};
/** postman's leather satchel, centred on its middle */
export const satchel = () => {
  const g = new THREE.Group(), lea = lam("leather", () => ({ color: "#7a4a2a" })), dark = lam("leatherD", () => ({ color: "#5a3420" }));
  add(g, box(0.38, 0.28, 0.12), lea, [0, 0, 0]);
  add(g, box(0.39, 0.15, 0.13), dark, [0, 0.07, 0.003]);
  add(g, box(0.05, 0.04, 0.01), lam("brass", () => ({ color: "#d8a83a" })), [0, 0.0, 0.07]);
  for (const x of [-0.12, -0.02, 0.1]) add(g, box(0.09, 0.05, 0.004), lam("envMini", () => ({ color: "#efe2c2" })), [x, 0.165, -0.02], [0, 0, (x - 0.02) * 0.6]);
  return g;
};
/** a closed umbrella with a J handle, standing on its tip at y = 0 */
export const umbrella = () => {
  const g = new THREE.Group();
  add(g, cyl(0.012, 0.012, 0.95, 8), lam("iron", () => ({ color: "#3a3a42" })), [0, 0.5, 0]);
  add(g, cyl(0.06, 0.012, 0.62, 12), lam("umbRed", () => ({ color: "#c8323a" })), [0, 0.45, 0]);
  add(g, new THREE.TorusGeometry(0.05, 0.014, 8, 16, Math.PI), lam("woodD", () => ({ color: "#5a3a24" })), [0.05, 0.97, 0], [0, 0, Math.PI]);
  add(g, cyl(0.004, 0.004, 0.06, 6), lam("iron", () => ({ color: "#3a3a42" })), [0, 0.03, 0]);
  return g;
};

// ---------------- street props ----------------
const snowM = () => lam("snowCap", () => ({ color: "#f6f8fc" }));
/** rural mailbox on a wooden post, door facing +z, red flag on the right (up = mail inside) */
export const mailbox = (flagUp: boolean) => {
  const g = new THREE.Group(), wood = lam("postWood", () => ({ map: beamHD() })), body = lam("mailboxBody", () => ({ color: "#3f5f8a" }));
  add(g, box(0.09, 1.0, 0.09), wood, [0, 0.5, 0]);
  add(g, box(0.26, 0.04, 0.5), wood, [0, 1.02, 0]);
  add(g, box(0.22, 0.16, 0.46), body, [0, 1.12, 0]);
  add(g, cyl(0.11, 0.11, 0.46, 18, ), body, [0, 1.2, 0], [Math.PI / 2, 0, 0]);
  add(g, cyl(0.125, 0.125, 0.47, 18), snowM(), [0, 1.24, 0], [Math.PI / 2, 0, 0]).scale.set(1, 1, 0.55);
  add(g, box(0.2, 0.25, 0.01), lam("mailboxDoor", () => ({ color: "#35527a" })), [0, 1.14, 0.235]);
  add(g, box(0.02, 0.18, 0.02), lam("flagRed", () => ({ color: "#d8352a" })), [0.125, flagUp ? 1.3 : 1.16, 0.08], [0, 0, flagUp ? 0 : Math.PI / 2]);
  add(g, box(0.02, 0.07, 0.1), lam("flagRed", () => ({ color: "#d8352a" })), [0.125, flagUp ? 1.37 : 1.2, 0.04]);
  return g;
};
/** a small red hatchback with snow on the roof, nose toward +z */
export const redCar = () => {
  const g = new THREE.Group(), red = lam("carRed", () => ({ color: "#c8303a" })), glass = lam("carGlass", () => ({ color: "#4a5e78" })), tyre = lam("tyre", () => ({ color: "#222226" }));
  add(g, box(1.7, 0.6, 3.8), red, [0, 0.62, 0]);
  add(g, box(1.5, 0.55, 2.0), glass, [0, 1.18, -0.3]);
  add(g, box(1.56, 0.08, 2.04), red, [0, 1.48, -0.3]);
  add(g, box(1.52, 0.1, 1.95), snowM(), [0, 1.57, -0.3]);
  for (const [x, z] of [[-0.8, -1.25], [0.8, -1.25], [-0.8, 1.25], [0.8, 1.25]]) add(g, cyl(0.33, 0.33, 0.24, 16), tyre, [x, 0.33, z], [0, 0, Math.PI / 2]);
  for (const x of [-0.55, 0.55]) add(g, cyl(0.1, 0.1, 0.04, 12), lam("headlight", () => ({ color: "#fff3c0" })), [x, 0.72, 1.91], [Math.PI / 2, 0, 0]);
  return g;
};
/** a desk with a drawer, top at 0.76 m, facing +z */
export const desk = () => {
  const g = new THREE.Group(), wood = lam("deskWood", () => ({ map: beamHD() })), dark = lam("deskDark", () => ({ color: "#5a3a24" }));
  add(g, box(1.5, 0.06, 0.75), wood, [0, 0.73, 0]);
  for (const [x, z] of [[-0.68, -0.32], [0.68, -0.32], [-0.68, 0.32], [0.68, 0.32]]) add(g, box(0.07, 0.7, 0.07), dark, [x, 0.35, z]);
  add(g, box(0.6, 0.14, 0.6), wood, [0.35, 0.62, 0]);
  add(g, box(0.1, 0.03, 0.02), lam("brass", () => ({ color: "#d8a83a" })), [0.35, 0.62, 0.31]);
  return g;
};
export const chair = () => {
  const g = new THREE.Group(), wood = lam("deskDark", () => ({ color: "#5a3a24" }));
  add(g, box(0.45, 0.05, 0.45), wood, [0, 0.46, 0]);
  for (const [x, z] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) add(g, box(0.04, 0.46, 0.04), wood, [x, 0.23, z]);
  add(g, box(0.45, 0.5, 0.04), wood, [0, 0.73, -0.21]);
  return g;
};
/** green banker's desk lamp; the bulb glows (HDR, picked up by the bloom) */
export const deskLamp = () => {
  const g = new THREE.Group(), brass = lam("brass", () => ({ color: "#d8a83a" }));
  add(g, cyl(0.09, 0.1, 0.03, 20), brass, [0, 0.015, 0]);
  add(g, cyl(0.012, 0.012, 0.36, 8), brass, [0, 0.2, 0]);
  add(g, cyl(0.012, 0.012, 0.2, 8), brass, [0.06, 0.37, 0], [0, 0, -1.0]);
  const shade = add(g, cyl(0.04, 0.13, 0.12, 20, ), lam("lampShade", () => ({ color: "#2f7a4a", side: THREE.DoubleSide })), [0.14, 0.4, 0]);
  shade.rotation.z = -0.3;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.4, 2.2) }));
  bulb.position.set(0.15, 0.35, 0); g.add(bulb);
  return g;
};
/** fountain pen lying flat along x, plus an ink pot */
export const pen = () => {
  const g = new THREE.Group();
  add(g, cyl(0.007, 0.007, 0.14, 10), lam("penBody", () => ({ color: "#1f1f28" })), [0, 0.008, 0], [0, 0, Math.PI / 2]);
  add(g, new THREE.ConeGeometry(0.007, 0.03, 10), lam("goldNib", () => ({ color: "#e0b040" })), [0.085, 0.008, 0], [0, 0, -Math.PI / 2]);
  add(g, cyl(0.008, 0.008, 0.012, 10), lam("goldNib", () => ({ color: "#e0b040" })), [-0.04, 0.008, 0], [0, 0, Math.PI / 2]);
  return g;
};
export const inkPot = () => {
  const g = new THREE.Group();
  add(g, cyl(0.035, 0.04, 0.05, 14), lam("inkGlass", () => ({ color: "#2a3a5a" })), [0, 0.025, 0]);
  add(g, cyl(0.02, 0.02, 0.02, 12), lam("iron", () => ({ color: "#3a3a42" })), [0, 0.06, 0]);
  return g;
};
/** wall of pigeonholes, every cubby stacked with empty envelopes; w x h metres, front at z = 0 */
export const pigeonholes = (w: number, h: number, b: THREE.Group) => {
  const wood = lam("shelfWood", () => ({ map: rep(planksHD(), 1, 1) })), env = lam("envStack", () => ({ map: ctex("envStackT", 256, 64, (g, r) => {
    g.fillStyle = "#efe2c2"; g.fillRect(0, 0, 256, 64);
    for (let y = 0; y < 64; y += 4) { g.fillStyle = r() < 0.5 ? "rgba(150,120,80,0.35)" : "rgba(255,255,255,0.3)"; g.fillRect(0, y, 256, 1); }
  }) }));
  const cw = 0.3, ch = 0.22, d = 0.35, nx = Math.floor(w / cw), ny = Math.floor(h / ch);
  const geos: { g: THREE.BufferGeometry; m: THREE.Material }[] = [];
  for (let i = 0; i <= nx; i++) geos.push({ g: boxGeo(V(i * cw - 0.01, 0, -d), V(i * cw + 0.01, ny * ch, 0)), m: wood });
  for (let j = 0; j <= ny; j++) geos.push({ g: boxGeo(V(0, j * ch - 0.01, -d), V(nx * cw, j * ch + 0.01, 0)), m: wood });
  geos.push({ g: boxGeo(V(0, 0, -d - 0.02), V(nx * cw, ny * ch, -d)), m: wood });
  let s = 7;
  const rr = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const fill = 0.08 + rr() * 0.1;
    geos.push({ g: boxGeo(V(i * cw + 0.03, j * ch + 0.012, -d + 0.02), V(i * cw + cw - 0.03, j * ch + 0.012 + fill, -0.04)), m: env });
  }
  for (const q of geos) { const m = new THREE.Mesh(q.g, q.m); m.castShadow = true; m.receiveShadow = true; b.add(m); }
};
/** painted clock face (lit like the rest of the town) */
export const clockTex = (key: string, h: number, m: number) => ctex("clock_" + key, 512, 512, (g) => {
  const c = 256;
  g.fillStyle = "#d9c9a0"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#fbf5e4"; g.strokeStyle = "#241726"; g.lineWidth = 22; g.beginPath(); g.arc(c, c, 220, 0, 7); g.fill(); g.stroke();
  g.lineCap = "round";
  for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; g.lineWidth = 14; g.beginPath(); g.moveTo(c + 165 * Math.sin(a), c - 165 * Math.cos(a)); g.lineTo(c + 196 * Math.sin(a), c - 196 * Math.cos(a)); g.stroke(); }
  const ha = ((h + m / 60) * Math.PI) / 6, ma = (m * Math.PI) / 30;
  g.lineWidth = 22; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 110 * Math.sin(ha), c - 110 * Math.cos(ha)); g.stroke();
  g.lineWidth = 14; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 175 * Math.sin(ma), c - 175 * Math.cos(ma)); g.stroke();
  g.fillStyle = "#241726"; g.beginPath(); g.arc(c, c, 20, 0, 7); g.fill();
});
export const roofSnowTex = () => ctex("roofSnow", 512, 512, (g, r) => {
  g.fillStyle = "#f2f5fa"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 160; i++) { g.fillStyle = r() < 0.5 ? "rgba(170,190,225,0.25)" : "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(r() * 512, r() * 512, 10 + r() * 40, 4 + r() * 10, 0, 0, 7); g.fill(); }
  g.fillStyle = "rgba(140,160,200,0.35)"; g.fillRect(0, 480, 512, 32);
});
export const snowTex = () => ctex("snowGround", 1024, 1024, (g, r) => {
  g.fillStyle = "#eef2f8"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.6 ? "rgba(175,195,230,0.18)" : "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 8 + r() * 50, 3 + r() * 14, r() * 3, 0, 7); g.fill(); }
});
export const pathTex = () => ctex("snowPath", 512, 1024, (g, r) => {
  g.fillStyle = "#d9e0ec"; g.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 500; i++) { g.fillStyle = r() < 0.5 ? "rgba(150,165,195,0.22)" : "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(r() * 512, r() * 1024, 6 + r() * 30, 3 + r() * 8, r() * 3, 0, 7); g.fill(); }
  g.fillStyle = "rgba(255,255,255,0.8)"; g.fillRect(0, 0, 30, 1024); g.fillRect(482, 0, 30, 1024);
});
export const footTex = () => ctex("bootprintSnow", 128, 256, (g) => {
  g.clearRect(0, 0, 128, 256);
  g.fillStyle = "rgba(120,140,185,0.75)";
  g.beginPath(); g.ellipse(64, 80, 34, 60, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(64, 205, 28, 34, 0, 0, 7); g.fill();
});
export { planksHD };
