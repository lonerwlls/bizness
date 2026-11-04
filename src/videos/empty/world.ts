// "What if humans disappeared for 100 years": several sets in one three.js scene, 3 km apart so the camera's far
// plane never sees two at once: a New York avenue (overgrows by level 0..3, river + steel truss bridge at its end,
// a parking lot), a subway station that floods, a power plant, a Chernobyl-like empty town with a Ferris wheel and
// animals, and the Moon. Every cut is keyed to a word of the narration (voice.ts).
import * as THREE from "three";
import { Batch, V, lam, boxGeo, prop } from "../bridge/build";
import { rep, ctex, rng, cobbleHD, stoneHD, grassHD, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, Outfit, Expr, FrontOpts, INK, fxContact, fxPuff } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { makeKit } from "../bridge/kitgen";
import { quadSide, dogSit, Kind } from "./animals";
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
export const TOTAL = Math.ceil((VOICE.dur + 1.3) * FPS);
const T = (w: string, n = 1) => wt(w, n) - 0.07;

// ---------------- light presets ----------------
type Look = "day" | "golden" | "dusk" | "night" | "rain" | "under" | "moon";
const P = (base: "day" | "golden", l: Partial<LightPreset>, k: Partial<WorldLook>) => ({ L: { ...LIGHTS[base], ...l }, K: { ...LOOK[base], ...k } });
const PRESETS: Record<Look, { L: LightPreset; K: WorldLook }> = {
  day: P("day", {}, {}),
  golden: P("golden", {}, {}),
  dusk: P("golden", { lit: [0.9, 0.55, 0.45], shade: [0.1, 0.1, 0.24], lift: [0.03, 0.04, 0.12], fog: "#5a4a78", charTint: [0.8, 0.7, 0.8] },
    { sky: { c: ["#e58a6a", "#a8607a", "#5a4a86", "#2e2f62", "#1a1d44"], e: [0, 4, 10, 20, 40] }, sat: 1.0 }),
  night: P("golden", { lit: [0.32, 0.4, 0.75], shade: [0.07, 0.08, 0.18], lift: [0.02, 0.03, 0.09], fog: "#1c2448", sunCol: "#9fb4ff", charTint: [0.55, 0.62, 0.9], blob: [0.8, 0.8, 0.9], actorShadow: false },
    { sky: { c: ["#2a3566", "#1f2856", "#161d45", "#10153a", "#0a0e2c"], e: [0, 4, 10, 20, 40] }, sat: 0.9 }),
  rain: P("day", { lit: [0.95, 0.98, 1.05], shade: [0.3, 0.32, 0.38], lift: [0.06, 0.07, 0.1], fog: "#8f99a8", sunI: 1.4, charTint: [0.85, 0.88, 0.95] },
    { sky: { c: ["#9aa4b2", "#8e98a8", "#7f8a9c", "#737e92", "#66718a"], e: [0, 4, 10, 20, 40] }, sat: 0.85 }),
  under: P("golden", { lit: [0.95, 0.85, 0.65], shade: [0.2, 0.22, 0.3], lift: [0.05, 0.06, 0.1], fog: "#1a2a30", charTint: [0.9, 0.85, 0.75] },
    { sky: { c: ["#1a2a30", "#16242a", "#121e24", "#0e181e", "#0a1216"], e: [0, 4, 10, 20, 40] }, sat: 1.0 }),
  moon: P("day", { lit: [1.7, 1.7, 1.75], shade: [0.04, 0.04, 0.06], lift: [0.0, 0.0, 0.02], fog: "#000000", sunCol: "#ffffff", charTint: [1, 1, 1], lambert: 0.6 },
    { sky: { c: ["#000000", "#000000", "#020208", "#000000", "#000000"], e: [0, 4, 10, 20, 40] }, sat: 0.4 }),
};
const SUN_OF: Record<Look, [number, number]> = { day: [75, 48], golden: [10, 9], dusk: [8, 4], night: [60, 30], rain: [75, 60], under: [80, 70], moon: [100, 12] };

// ---------------- sets ----------------
export const WALK = 0.15;
const ROAD = 6, SIDE = 9.5;                 // avenue: road |x| < 6, sidewalks to 9.5, building fronts at 9.5
const RIVER0 = 64, RIVER1 = 112;            // river across the avenue's end, truss bridge over it
const LOT: [number, number, number, number] = [SIDE, 42, -10, 22]; // parking lot (x0, x1, z0, z1) on the right
const STOOP: V3 = [-9.5, WALK, -20];        // the dog's door (z set to the brownstone's centre in buildCity)
const SUBWAY_ENT: V3 = [7.8, WALK, -36];
const SUB: V3 = [-3000, 0, 0];              // subway station origin
const PLANT: V3 = [3000, 0, 0];             // power plant origin
const CHER: V3 = [6000, 0, 0];              // empty town origin
const MOON: V3 = [-6000, 0, 0];             // the Moon origin
const WHEEL: V3 = [0, 0, -125];             // Ferris wheel at the end of the empty town's road
const at = (o: V3, p: V3): V3 => [o[0] + p[0], o[1] + p[1], o[2] + p[2]];

// ---------------- painted textures ----------------
const skyTex = (key: string, wm: number, hm: number, wall: string, glass: string) => {
  const PX = Math.min(40, 2048 / Math.max(wm, hm)), W = Math.round(wm * PX), H = Math.round(hm * PX);
  return ctex("sky_" + key, W, H, (g, r) => {
    g.fillStyle = wall; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) { g.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.06)" : "rgba(60,40,30,0.06)"; g.fillRect(r() * W, r() * H, PX * (1 + r() * 4), PX * (1 + r() * 4)); }
    const fl = 3.2 * PX, cw = 2.2 * PX;
    for (let y = H - fl * 1.3; y > PX; y -= fl) for (let x = cw * 0.35; x < W - cw * 0.5; x += cw) {
      g.fillStyle = glass; g.fillRect(x, y, cw * 0.6, fl * 0.55);
      g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(x, y, cw * 0.18, fl * 0.55);
      g.fillStyle = "rgba(20,20,30,0.5)"; g.fillRect(x, y + fl * 0.55, cw * 0.6, PX * 0.12);
    }
    g.fillStyle = "rgba(30,30,40,0.55)"; g.fillRect(W * 0.35, H - fl * 1.0, W * 0.3, fl * 0.95); // entrance
  });
};
const litTex = (key: string, wm: number, hm: number, seed: number) => {
  const PX = Math.min(24, 1024 / Math.max(wm, hm)), W = Math.round(wm * PX), H = Math.round(hm * PX), r = rng(seed);
  return ctex("lit_" + key, W, H, (g) => {
    g.clearRect(0, 0, W, H);
    const fl = 3.2 * PX, cw = 2.2 * PX;
    for (let y = H - fl * 1.3; y > PX; y -= fl) for (let x = cw * 0.35; x < W - cw * 0.5; x += cw) {
      if (r() < 0.45) continue;
      g.fillStyle = r() < 0.7 ? "#ffd27a" : "#fff0c0"; g.fillRect(x, y, cw * 0.6, fl * 0.55);
    }
  });
};
const crackTex = () => ctex("cracks", 512, 2048, (g, r) => {
  g.clearRect(0, 0, 512, 2048);
  for (let i = 0; i < 26; i++) {
    let x = r() * 512, y = r() * 2048;
    g.strokeStyle = "rgba(25,20,20,0.85)"; g.lineWidth = 3 + r() * 5; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 9; k++) { x += (r() - 0.5) * 60; y += 20 + r() * 40; g.lineTo(x, y); }
    g.stroke();
    g.strokeStyle = "rgba(90,160,60,0.9)"; g.lineWidth = 6; g.stroke();
  }
});
const vineTex = (seed: number) => ctex("vines" + seed, 256, 1024, (g, r) => {
  g.clearRect(0, 0, 256, 1024);
  for (let i = 0; i < 9; i++) {
    let x = r() * 256, y = 1024;
    const top = 1024 - (300 + r() * 724);
    while (y > top) {
      const s = 14 + r() * 22;
      g.fillStyle = ["#3f8f3c", "#4c9a37", "#5aa83c", "#2f7a34"][Math.floor(r() * 4)];
      g.beginPath(); g.ellipse(x, y, s, s * 0.8, r() * 3, 0, 7); g.fill();
      g.strokeStyle = "rgba(20,40,20,0.6)"; g.lineWidth = 2; g.stroke();
      x += (r() - 0.5) * 30; y -= 10 + r() * 14;
    }
  }
});
const riverTex = () => ctex("riverEmpty", 1024, 1024, (g, r) => {
  g.fillStyle = "#3a7fa8"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 200; i++) { const x = r() * 1024, y = r() * 1024, w = 30 + r() * 70; g.strokeStyle = r() < 0.6 ? "rgba(255,255,255,0.4)" : "rgba(10,50,90,0.3)"; g.lineWidth = 4 + r() * 3; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 6, x + w, y); g.stroke(); }
});
const tileTex = () => ctex("subTile", 512, 512, (g, r) => {
  g.fillStyle = "#e9e4d4"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 32) for (let x = 0; x < 512; x += 64) { g.fillStyle = r() < 0.5 ? "#efeadb" : "#e2dccb"; g.fillRect(x + 2, y + 2, 60, 28); }
  g.fillStyle = "#3f7a5a"; g.fillRect(0, 380, 512, 40);
});
const signTex = (key: string, text: string, bg: string, fg: string, w = 1024, h = 256, font = 150) => ctex(key, w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#241726"; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${font}px "DejaVu Sans", Arial, sans-serif`;
  g.fillText(text, w / 2, h / 2);
});
const moonTex = () => ctex("moonGround", 1024, 1024, (g, r) => {
  g.fillStyle = "#a7a7aa"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 3000; i++) { g.fillStyle = r() < 0.5 ? "rgba(70,70,75,0.25)" : "rgba(220,220,225,0.25)"; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 4, 2 + r() * 4); }
  for (let i = 0; i < 40; i++) { const x = r() * 1024, y = r() * 1024, rr = 6 + r() * 30; g.strokeStyle = "rgba(60,60,66,0.5)"; g.lineWidth = 3; g.beginPath(); g.arc(x, y, rr, 0, 7); g.stroke(); g.fillStyle = "rgba(80,80,86,0.25)"; g.fill(); }
});
const earthTex = () => ctex("earth", 512, 512, (g) => {
  g.clearRect(0, 0, 512, 512);
  g.fillStyle = "#2f6fd0"; g.beginPath(); g.arc(256, 256, 240, 0, 7); g.fill();
  g.fillStyle = "#4fa04a";
  for (const [x, y, a, b, rot] of [[190, 200, 80, 120, 0.4], [330, 300, 70, 90, -0.3], [300, 150, 40, 30, 0]] as const) { g.beginPath(); g.ellipse(x, y, a, b, rot, 0, 7); g.fill(); }
  g.fillStyle = "rgba(255,255,255,0.75)";
  for (const [x, y, a, b] of [[200, 120, 90, 18], [320, 380, 110, 16], [160, 330, 60, 14]] as const) { g.beginPath(); g.ellipse(x, y, a, b, 0.2, 0, 7); g.fill(); }
  // night side shading
  const gr = g.createLinearGradient(100, 0, 512, 0); gr.addColorStop(0, "rgba(0,0,20,0)"); gr.addColorStop(1, "rgba(0,0,20,0.75)");
  g.fillStyle = gr; g.beginPath(); g.arc(256, 256, 240, 0, 7); g.fill();
  g.strokeStyle = "#241726"; g.lineWidth = 10; g.beginPath(); g.arc(256, 256, 240, 0, 7); g.stroke();
});
const starTex = () => ctex("stars", 1024, 1024, (g, r) => {
  g.clearRect(0, 0, 1024, 1024);
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(255,255,255,${0.4 + r() * 0.6})`; const s = r() < 0.9 ? 2 : 4; g.fillRect(r() * 1024, r() * 1024, s, s); }
});
const flagTex = () => ctex("usFlag", 380, 200, (g) => {
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#c8323a"; g.fillRect(0, (i * 200) / 13, 380, 200 / 13 + 1); }
  g.fillStyle = "#2b3a7a"; g.fillRect(0, 0, 160, 108);
  g.fillStyle = "#ffffff"; for (let y = 10; y < 100; y += 18) for (let x = 12; x < 155; x += 26) g.fillRect(x, y, 6, 6);
});
const footTex = () => ctex("bootprints", 256, 1024, (g) => {
  g.clearRect(0, 0, 256, 1024);
  for (let i = 0; i < 9; i++) {
    const y = 980 - i * 110, x = i % 2 ? 160 : 96;
    g.fillStyle = "rgba(55,55,60,0.85)"; g.beginPath(); g.ellipse(x, y, 26, 46, 0, 0, 7); g.fill();
    g.strokeStyle = "rgba(150,150,155,0.9)"; g.lineWidth = 3;
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(x - 20, y + k * 12); g.lineTo(x + 20, y + k * 12); g.stroke(); }
  }
});
const unlit = (map: THREE.Texture) => new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide });

// ---------------- growth levels (city ages: 0 now, 1 five years, 2 fifty, 3 a hundred) ----------------
class Growth {
  g = [new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group()];
  set(lvl: number) { this.g.forEach((x, k) => (x.visible = k > 0 && k <= lvl)); }
}

// ---------------- the city ----------------
type Lit = { mesh: THREE.Mesh; z: number };
const buildCity = (root: THREE.Object3D, gr: Growth, lits: Lit[], bridgeMat: THREE.MeshLambertMaterial[]) => {
  const kit = makeKit(), b = new Batch(), r = rng(5);
  const walkM = lam("walkT", () => ({ map: stoneHD("walkHD", ["#e6dccb", "#ddd2bf", "#ece3d4", "#d6cab6"], "#b0a390") }));
  const asphalt = lam("asphalt", () => ({ map: rep(cobbleHD(), 3, 40) }));
  b.add(new THREE.PlaneGeometry(1200, 600).rotateX(-Math.PI / 2).translate(0, -0.03, RIVER0 - 300), lam("grassT", () => ({ map: rep(grassHD(), 200, 100) })));
  b.add(new THREE.PlaneGeometry(1200, 400).rotateX(-Math.PI / 2).translate(0, -0.03, RIVER1 + 200), lam("grassT", () => ({})));
  b.add(new THREE.PlaneGeometry(ROAD * 2, 260).rotateX(-Math.PI / 2).translate(0, 0, RIVER0 - 130), asphalt);
  for (const s of [-1, 1]) b.add(boxGeo(V(s < 0 ? -SIDE : ROAD, -0.1, -200), V(s < 0 ? -ROAD : SIDE, WALK, RIVER0), 2), walkM);
  // crosswalk stripes
  for (let i = -5; i <= 5; i++) b.add(boxGeo(V(i * 1.0 - 0.35, 0, -30), V(i * 1.0 + 0.35, 0.02, -27)), lam("zebra", () => ({ color: "#f2efe6" })));
  // buildings: tall blocks with flat roofs, cornices, some water tanks; a brownstone with a stoop for the dog
  const walls = ["#c97a5a", "#d8c7a8", "#b8b2a8", "#9a6a52", "#e0d2b8", "#8f8a86"], glass = ["#5f7fa8", "#4f6f98", "#6a88b0"];
  let n = 0;
  for (const s of [-1, 1]) {
    let z = RIVER0 - 4;
    while (z > -200) {
      const w = 10 + Math.floor(r() * 3) * 3, d = 16, zc = z - w / 2;
      const inLot = s > 0 && zc > LOT[2] - w / 2 && zc < LOT[3] + w / 2;
      const brown = s < 0 && Math.abs(zc - STOOP[2]) < w / 2 + 0.1;
      if (!inLot) {
        const h = brown ? 13 : 18 + Math.floor(r() * 6) * 5, x0 = s * SIDE, xc = s * (SIDE + d / 2);
        const wall = brown ? "#8a4a36" : walls[n % walls.length];
        const mf = lam(`bf${n}`, () => ({ map: skyTex(`f${n}`, w, h, wall, glass[n % 3]) }));
        const ms = lam(`bs${n % 6}_${h}`, () => ({ map: skyTex(`s${n % 6}_${h}`, d, h, wall, glass[n % 3]) }));
        const geo = new THREE.BoxGeometry(d, h, w).translate(xc, h / 2, zc);
        // box faces: +x, -x, +y, -y, +z, -z: front = toward the street
        const front = new THREE.PlaneGeometry(w, h).rotateY(s < 0 ? Math.PI / 2 : -Math.PI / 2).translate(x0 - s * 0.0, h / 2, zc);
        b.add(geo, ms);
        b.add(front.translate(-s * 0.02, 0, 0), mf);
        b.add(boxGeo(V(xc - d / 2 - 0.3, h, zc - w / 2 - 0.3), V(xc + d / 2 + 0.3, h + 0.6, zc + w / 2 + 0.3)), lam("cornice", () => ({ color: "#efe6d2" })));
        if (!brown && n % 3 === 0) { // rooftop water tank
          const tx = xc + s * 2, tz = zc;
          for (const [dx, dz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) b.add(boxGeo(V(tx + dx - 0.08, h + 0.6, tz + dz - 0.08), V(tx + dx + 0.08, h + 2.2, tz + dz + 0.08)), lam("tankLeg", () => ({ color: "#3a3030" })));
          b.add(new THREE.CylinderGeometry(1.3, 1.3, 2.4, 14).translate(tx, h + 3.4, tz), lam("tankWood", () => ({ color: "#8a5a3a" })));
          b.add(new THREE.ConeGeometry(1.45, 1.0, 14).translate(tx, h + 5.1, tz), lam("tankRoof", () => ({ color: "#4a3a30" })));
        }
        if (brown) { // stoop: four steps up to the door (left side of the avenue, the street is +x)
          STOOP[2] = zc;
          for (let k = 0; k < 4; k++) b.add(boxGeo(V(x0, WALK, zc - 1.2), V(x0 + 2.2 - k * 0.5, WALK + 0.25 * (k + 1), zc + 1.2)), lam("stoopS", () => ({ color: "#7a4a3a" })));
          b.add(boxGeo(V(x0 - 0.05, WALK + 1.0, zc - 0.7), V(x0 + 0.02, WALK + 3.4, zc + 0.7)), lam("stoopDoor", () => ({ color: "#3a2418" })));
        }
        // night window lights on the street face
        const lm = new THREE.MeshBasicMaterial({ map: litTex(`l${n}`, w, h, n + 3), transparent: true, depthWrite: false, color: new THREE.Color(2.2, 2.0, 1.6), opacity: 0 });
        const lp = new THREE.Mesh(new THREE.PlaneGeometry(w, h).rotateY(s < 0 ? Math.PI / 2 : -Math.PI / 2).translate(x0 - s * 0.06, h / 2, zc), lm);
        lp.layers.set(NOINK); lp.visible = false; root.add(lp); lits.push({ mesh: lp, z: zc });
        // vines (fifty years) and green roofs (a hundred)
        const vm = new THREE.MeshLambertMaterial({ map: vineTex(n % 4), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
        const vines = new THREE.Mesh(new THREE.PlaneGeometry(w, Math.min(h, 22)).rotateY(s < 0 ? Math.PI / 2 : -Math.PI / 2).translate(x0 - s * 0.1, Math.min(h, 22) / 2, zc), vm);
        gr.g[2].add(vines);
        const roofG = new THREE.Mesh(new THREE.BoxGeometry(d - 0.4, 0.5, w - 0.4).translate(xc, h + 0.7, zc), lam("roofGreen", () => ({ map: rep(grassHD(), 4, 4) })));
        gr.g[3].add(roofG);
        n++;
      }
      z -= w + 0.3;
    }
  }
  // subway entrance: railings, globe lamps, stairs going down
  const [ex, , ez] = SUBWAY_ENT;
  for (const dz of [-1.6, 1.6]) b.add(boxGeo(V(ex - 1.3, WALK, ez + dz - 0.05), V(ex + 1.3, WALK + 1.0, ez + dz + 0.05)), lam("subRail", () => ({ color: "#2f5f3a" })));
  b.add(boxGeo(V(ex - 1.3, WALK, ez - 1.6), V(ex - 1.2, WALK + 1.0, ez + 1.6)), lam("subRail", () => ({})));
  for (let k = 0; k < 6; k++) b.add(boxGeo(V(ex - 1.2 + k * 0.42, -0.25 * k, ez - 1.5), V(ex + 1.3, WALK - 0.25 * k, ez + 1.5)), lam("subStep", () => ({ color: "#9a948a" })));
  for (const dz of [-1.6, 1.6]) {
    b.add(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8).translate(ex + 1.3, WALK + 1.1, ez + dz), lam("subRail", () => ({})));
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10).translate(ex + 1.3, WALK + 2.35, ez + dz), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.6, 0.8) }));
    root.add(gl);
  }
  root.add(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.6).rotateY(-Math.PI / 2).translate(ex + 1.36, WALK + 1.35, ez), unlit(signTex("subwaySign", "SUBWAY", "#1f3a2a", "#ffffff", 1024, 240, 150))));
  // cars: yellow taxis on the avenue, parked cars in the lot
  const car = (x: number, z: number, col: string, yaw = 0, rust = 0) => {
    const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z);
    const body = lam("car" + col, () => ({ color: col })), dark = lam("carGlass", () => ({ color: "#3a4a60" })), tyre = lam("tyre", () => ({ color: "#222226" }));
    b.add(boxGeo(V(-0.9, 0.35, -2.1), V(0.9, 1.05, 2.1)), body, m);
    b.add(boxGeo(V(-0.8, 1.05, -1.1), V(0.8, 1.6, 1.0)), dark, m);
    b.add(boxGeo(V(-0.82, 1.55, -1.05), V(0.82, 1.65, 0.95)), body, m);
    for (const [dx, dz] of [[-0.9, -1.3], [0.9, -1.3], [-0.9, 1.3], [0.9, 1.3]]) b.add(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12).rotateZ(Math.PI / 2).translate(dx, 0.35, dz), tyre, m);
    void rust;
  };
  for (const [x, z] of [[-3, -12], [3, -48], [-3, -70], [3, 8], [-3, 30]]) car(x, z, "#f2c230");
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) car(LOT[0] + 6 + i * 6.5, LOT[2] + 5 + j * 10, ["#c8403a", "#3f6fb5", "#e8e4dc", "#3a8a5a", "#8a8a96"][(i + j) % 5], 0);
  b.add(new THREE.PlaneGeometry(LOT[1] - LOT[0], LOT[3] - LOT[2]).rotateX(-Math.PI / 2).translate((LOT[0] + LOT[1]) / 2, 0.02, (LOT[2] + LOT[3]) / 2), lam("lotAsph", () => ({ color: "#5a5a60" })));
  for (let i = 0; i < 5; i++) b.add(boxGeo(V(LOT[0] + 3 + i * 6.5, 0.03, LOT[2] + 1), V(LOT[0] + 3.15 + i * 6.5, 0.04, LOT[3] - 1)), lam("zebra", () => ({})));
  // street lamps
  for (let z = 50; z > -150; z -= 14) for (const s of [-1, 1]) prop(b, kit, "lantern", s * (ROAD + 0.6), WALK, z + (s > 0 ? 7 : 0), 4.2);
  // river, quay walls, the steel truss bridge carrying the avenue
  b.add(boxGeo(V(-600, -4, RIVER0 - 1), V(600, 0, RIVER0)), lam("quay", () => ({ map: stoneHD("quayHD") })));
  b.add(boxGeo(V(-600, -4, RIVER1), V(600, 0, RIVER1 + 1)), lam("quay", () => ({})));
  b.add(new THREE.PlaneGeometry(1200, RIVER1 - RIVER0).rotateX(-Math.PI / 2).translate(0, -3, (RIVER0 + RIVER1) / 2), lam("riverT", () => ({ map: rep(riverTex(), 60, 3) })));
  b.add(boxGeo(V(-ROAD, -0.6, RIVER0 - 1), V(ROAD, 0.0, RIVER1 + 1)), asphalt);
  root.add(...(() => {
    const steel = new THREE.MeshLambertMaterial({ color: "#6f8aa8" });
    bridgeMat.push(steel);
    const bb = new THREE.Group(), len = RIVER1 - RIVER0 + 2, z0 = RIVER0 - 1, H = 7, panels = 8, pw = len / panels;
    const beam = (a: THREE.Vector3, c: THREE.Vector3, rr = 0.18) => {
      const g = new THREE.BoxGeometry(rr * 2, a.distanceTo(c), rr * 2);
      g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(c).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), c.clone().sub(a).normalize()), V(1, 1, 1)));
      const m = new THREE.Mesh(g, steel); m.castShadow = true; m.receiveShadow = true; bb.add(m);
    };
    for (const s of [-1, 1]) {
      const x = s * (ROAD + 0.3);
      beam(V(x, 0, z0), V(x, 0, z0 + len), 0.25);
      beam(V(x, H, z0 + pw), V(x, H, z0 + len - pw), 0.25);
      for (let i = 0; i <= panels; i++) {
        const z = z0 + i * pw;
        if (i > 0 && i < panels) beam(V(x, 0, z), V(x, H, z));
        if (i < panels) beam(V(x, i < panels / 2 ? 0 : H, z), V(x, i < panels / 2 ? H : 0, z + pw));
      }
    }
    for (let i = 1; i < panels; i++) beam(V(-ROAD - 0.3, H, z0 + i * pw), V(ROAD + 0.3, H, z0 + i * pw), 0.15);
    return [bb];
  })());
  // ---- growth ----
  // level 1: cracks with grass in the road and sidewalks, tufts
  const cr = new THREE.Mesh(new THREE.PlaneGeometry(ROAD * 2, 200).rotateX(-Math.PI / 2).translate(0, 0.03, RIVER0 - 100), new THREE.MeshLambertMaterial({ map: rep(crackTex(), 1, 6), transparent: true, alphaTest: 0.3 }));
  cr.receiveShadow = true; gr.g[1].add(cr);
  const g1 = new Batch(), g2 = new Batch(), g3 = new Batch();
  for (let i = 0; i < 160; i++) prop(g1, kit, i % 3 ? "grass_large" : "grass", (r() - 0.5) * 2 * (SIDE - 0.5), 0, RIVER0 - 2 - r() * 180, 0.4 + r() * 0.5);
  for (let i = 0; i < 30; i++) prop(g1, kit, "plant_bush", (r() - 0.5) * 2 * ROAD, 0, RIVER0 - 3 - r() * 180, 0.8 + r() * 0.6);
  // level 2: young trees in the road and the lot, bushes everywhere
  for (let i = 0; i < 40; i++) prop(g2, kit, i % 2 ? "tree_default" : "tree_oak", (r() - 0.5) * 2 * (SIDE - 1), 0, RIVER0 - 4 - r() * 180, 3 + r() * 3);
  for (let i = 0; i < 14; i++) prop(g2, kit, "tree_oak", LOT[0] + 3 + (i % 5) * 6.5 + 2.6, 0, LOT[2] + 2 + Math.floor(i / 5) * 10, 4 + r() * 3);
  for (let i = 0; i < 60; i++) prop(g2, kit, "plant_bushLarge", (r() - 0.5) * 2 * (SIDE - 0.5), 0, RIVER0 - 2 - r() * 180, 1 + r() * 0.8);
  // level 3: a forest down the avenue
  for (let i = 0; i < 90; i++) prop(g3, kit, ["tree_oak", "tree_default", "tree_fat", "tree_cone"][i % 4], (r() - 0.5) * 2 * (SIDE - 0.5), 0, RIVER0 - 2 - r() * 190, 7 + r() * 7);
  for (let i = 0; i < 50; i++) prop(g3, kit, "tree_default", LOT[0] + r() * (LOT[1] - LOT[0]), 0, LOT[2] + r() * (LOT[3] - LOT[2]), 8 + r() * 6);
  g1.build(gr.g[1]); g2.build(gr.g[2]); g3.build(gr.g[3]);
  for (const x of gr.g) root.add(x);
  // trees on the far bank and hills
  for (let i = 0; i < 40; i++) prop(b, kit, i % 3 ? "tree_default" : "tree_cone", (r() - 0.5) * 300, 0, RIVER1 + 6 + r() * 60, 8 + r() * 5);
  b.build(root);
};

// ---------------- subway station ----------------
const buildSubway = (root: THREE.Object3D, pumpParts: THREE.Object3D[], water: THREE.Mesh) => {
  const b = new Batch(), o = SUB, tile = lam("subTileM", () => ({ map: rep(tileTex(), 6, 1) }));
  const B = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, m: THREE.Material) => b.add(boxGeo(V(o[0] + x0, y0, z0), V(o[0] + x1, y1, z1)), m);
  B(-12, -2, -40, 12, -1.4, 40, lam("trackBed", () => ({ color: "#4a4440" })));        // track bed
  B(2, -2, -40, 9, 0.0, 40, lam("platform", () => ({ map: stoneHD("platHD", ["#bdb6aa", "#b3ac9f", "#c6bfb2", "#aaa396"], "#8a8478") })));
  B(2, 0.0, -40, 2.4, 0.02, 40, lam("yEdge", () => ({ color: "#e8c030" })));
  B(9, -2, -40, 9.4, 6, 40, tile); B(-12.4, -2, -40, -12, 6, 40, tile);                // walls
  for (const x of [-4.2, -2.8]) B(x - 0.06, -1.4, -40, x + 0.06, -1.25, 40, lam("rail", () => ({ color: "#9a9aa2" })));
  for (let z = -38; z < 40; z += 1.2) B(-5, -1.42, z, -2, -1.32, z + 0.4, lam("tie", () => ({ color: "#5a4030" })));
  for (let z = -35; z <= 35; z += 7) { B(3.2, 0, z - 0.25, 3.7, 6, z + 0.25, lam("pillar", () => ({ color: "#2f5f3a" }))); B(-0.25, -1.4, z - 0.25, 0.25, 6, z + 0.25, lam("pillar", () => ({}))); }
  B(-12.4, 5.6, -40, 9.4, 6.2, 40, lam("ceiling", () => ({ color: "#5a5a5a" })));
  // ceiling lamps (emissive strips)
  for (let z = -36; z <= 36; z += 6) for (const x of [-6, 5.5]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 2.4).translate(o[0] + x, 5.5, z), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.1, 1.8) }));
    root.add(m);
  }
  root.add(new THREE.Mesh(new THREE.PlaneGeometry(4, 0.8).rotateY(-Math.PI / 2).translate(o[0] + 8.98, 3.2, -6), unlit(signTex("st42", "42 ST", "#1f1f24", "#ffffff", 1024, 220, 150))));
  root.add(new THREE.Mesh(new THREE.PlaneGeometry(4, 0.8).rotateY(-Math.PI / 2).translate(o[0] + 8.98, 3.2, 14), unlit(signTex("st42", "42 ST", "#1f1f24", "#ffffff", 1024, 220, 150))));
  // pump room at the platform end: three big pumps with pipes up the wall
  for (let k = 0; k < 3; k++) {
    const g = new THREE.Group(), x = 5.5, z = 26 + k * 3.6;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 1.8, 18).translate(0, 0.9, 0), lam("pumpG", () => ({ color: "#3f8a5a" })));
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.2, 16).rotateZ(Math.PI / 2).translate(0, 2.1, 0), lam("pumpM", () => ({ color: "#2f4a6a" })));
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.0, 12).translate(0.9, 3.4, 0), lam("pipe", () => ({ color: "#8a8a90" })));
    for (const m of [body, motor, pipe]) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
    const lampOn = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8).translate(-0.6, 1.4, 0.75), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 2.2, 0.6) }));
    lampOn.name = "lamp"; g.add(lampOn);
    g.position.set(o[0] + x, 0, z); root.add(g); pumpParts.push(g);
  }
  b.build(root);
  water.position.set(o[0], -1.6, 0); root.add(water);
};

// ---------------- power plant ----------------
const buildPlant = (root: THREE.Object3D) => {
  const b = new Batch(), o = PLANT, kit = makeKit();
  b.add(new THREE.PlaneGeometry(1200, 1200).rotateX(-Math.PI / 2).translate(o[0], -0.02, 0), lam("grassT", () => ({})));
  b.add(new THREE.PlaneGeometry(10, 400).rotateX(-Math.PI / 2).translate(o[0], 0.01, -150), lam("lotAsph", () => ({})));
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) { const y = (i / 16) * 34, x = 11 - 6 * Math.sin((i / 16) * Math.PI * 0.85) + (i / 16) * 1.5; pts.push(new THREE.Vector2(x, y)); }
  const tower = new THREE.LatheGeometry(pts, 36);
  for (const [x, z] of [[-18, 30], [8, 38]]) b.add(tower.clone().translate(o[0] + x, 0, z), lam("coolT", () => ({ color: "#d9d4c8", side: THREE.DoubleSide })));
  b.add(boxGeo(V(o[0] - 10, 0, 6), V(o[0] + 14, 14, 20)), lam("plantHall", () => ({ map: skyTex("plant", 24, 14, "#c9c2b4", "#5f7fa8") })));
  b.add(new THREE.CylinderGeometry(1.4, 1.8, 45, 16).translate(o[0] + 18, 22.5, 12), lam("stack", () => ({ color: "#d8d4cc" })));
  for (let k = 0; k < 4; k++) b.add(new THREE.CylinderGeometry(1.45, 1.45, 1.6, 16).translate(o[0] + 18, 30 + k * 4, 12), lam("stackRed", () => ({ color: "#c8403a" })));
  for (let i = 0; i < 14; i++) b.add(boxGeo(V(o[0] - 40 + i * 6, 0, -2), V(o[0] - 39.9 + i * 6, 2.4, -1.9)), lam("fence", () => ({ color: "#6a6a72" })));
  b.add(boxGeo(V(o[0] - 40, 2.2, -2.02), V(o[0] + 44, 2.3, -1.9)), lam("fence", () => ({})));
  // pylons with wires toward the city
  for (let i = 0; i < 6; i++) {
    const z = -20 - i * 40, x = o[0] - 30;
    for (const dx of [-2, 2]) b.add(boxGeo(V(x + dx - 0.15, 0, z - 0.15), V(x + dx + 0.15, 22, z + 0.15)), lam("pylon", () => ({ color: "#7a7a84" })));
    b.add(boxGeo(V(x - 6, 20, z - 0.15), V(x + 6, 20.4, z + 0.15)), lam("pylon", () => ({})));
  }
  for (let i = 0; i < 30; i++) prop(b, kit, "tree_default", o[0] - 120 + (i * 37) % 240, 0, 70 + (i * 13) % 60, 8 + (i % 4));
  b.build(root);
};

// ---------------- the empty town (Chernobyl, 1986) ----------------
const buildCher = (root: THREE.Object3D, wheel: THREE.Group) => {
  const b = new Batch(), o = CHER, kit = makeKit(), r = rng(9);
  b.add(new THREE.PlaneGeometry(1200, 1200).rotateX(-Math.PI / 2).translate(o[0], -0.02, 0), lam("grassT", () => ({})));
  b.add(new THREE.PlaneGeometry(14, 200).rotateX(-Math.PI / 2).translate(o[0], 0.01, -40), lam("lotAsph", () => ({})));
  b.add(new THREE.PlaneGeometry(14, 200).rotateX(-Math.PI / 2).translate(o[0], 0.03, -40), new THREE.MeshLambertMaterial({ map: rep(crackTex(), 1, 6), transparent: true, alphaTest: 0.3 }));
  // panel blocks
  for (let i = 0; i < 8; i++) {
    const s = i % 2 ? 1 : -1, z = -10 - Math.floor(i / 2) * 32, h = 15 + (i % 3) * 6, w = 26;
    b.add(boxGeo(V(o[0] + s * 14 - (s > 0 ? 0 : 12), 0, z - w / 2), V(o[0] + s * 14 + (s > 0 ? 12 : 0), h, z + w / 2)), lam(`panel${h}`, () => ({ map: skyTex(`panel${h}`, 26, h, "#cfc8b8", "#3c4450") })));
  }
  // Ferris wheel (yellow) with gondolas
  const yel = lam("wheelY", () => ({ color: "#e8c030" })), red = lam("gondR", () => ({ color: "#c8403a" }));
  const R = 11;
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.25, 8, 48), yel), new THREE.Mesh(new THREE.TorusGeometry(R, 0.25, 8, 48).translate(0, 0, 1.2), yel));
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, sp = new THREE.Mesh(new THREE.BoxGeometry(0.15, R, 0.15).translate(0, R / 2, 0.6), yel);
    sp.rotation.z = a; wheel.add(sp);
    const gd = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, 1.2).translate(R * Math.sin(-a), R * Math.cos(-a) - 0.9, 0.6), red);
    wheel.add(gd);
  }
  wheel.traverse((m) => { const mm = m as THREE.Mesh; if (mm.isMesh) { mm.castShadow = true; mm.receiveShadow = true; } });
  wheel.position.set(o[0] + WHEEL[0], R + 1.5, WHEEL[2]); root.add(wheel);
  for (const s of [-1, 1]) b.add(new THREE.CylinderGeometry(0.25, 0.4, R + 1.5, 8).rotateZ(s * 0.2).translate(o[0] + WHEEL[0] + s * 1.2, (R + 1.5) / 2, WHEEL[2] + 0.6), yel);
  // the forest taking it back
  for (let i = 0; i < 120; i++) {
    const x = o[0] + (r() - 0.5) * 140, z = 10 - r() * 140;
    if (Math.abs(x - o[0]) < 5 || Math.hypot(x - o[0] - WHEEL[0], z - WHEEL[2]) < 15) continue;
    prop(b, kit, ["tree_default", "tree_oak", "tree_cone", "tree_fat"][i % 4], x, 0, z, 5 + r() * 8);
  }
  for (let i = 0; i < 80; i++) prop(b, kit, i % 2 ? "grass_large" : "plant_bush", o[0] + (r() - 0.5) * 14, 0, 20 - r() * 150, 0.5 + r());
  b.build(root);
};

// ---------------- the Moon ----------------
const buildMoon = (root: THREE.Object3D, earth: THREE.Sprite) => {
  const b = new Batch(), o = MOON, r = rng(3);
  const ground = lam("moonG", () => ({ map: rep(moonTex(), 30, 30) }));
  const geo = new THREE.PlaneGeometry(1200, 1200, 120, 120).rotateX(-Math.PI / 2);
  const pp = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), z = pp.getZ(i), d = Math.hypot(x, z); pp.setY(i, d < 30 ? 0 : 0.4 * Math.sin(x * 0.05) * Math.cos(z * 0.04) + 0.02 * (d - 30)); }
  geo.computeVertexNormals();
  b.add(geo.translate(o[0], 0, 0), ground);
  for (let i = 0; i < 26; i++) {
    const x = o[0] + (r() - 0.5) * 200, z = -20 - r() * 180, rr = 2 + r() * 9;
    b.add(new THREE.TorusGeometry(rr, rr * 0.18, 6, 32).rotateX(Math.PI / 2).scale(1, 0.5, 1).translate(x, 0.05, z), lam("crater", () => ({ color: "#8f8f94" })));
  }
  for (let i = 0; i < 40; i++) b.add(new THREE.DodecahedronGeometry(0.2 + r() * 0.8, 0).translate(o[0] + (r() - 0.5) * 120, 0.1, 20 - r() * 120), lam("rock", () => ({ color: "#8a8a90" })));
  // descent stage: gold box, legs, foot pads
  const gold = lam("lmGold", () => ({ color: "#d8a83a" })), grey = lam("lmGrey", () => ({ color: "#b8b8c0" }));
  const lx = o[0] - 3, lz = -9;
  b.add(boxGeo(V(lx - 1.7, 1.2, lz - 1.7), V(lx + 1.7, 2.8, lz + 1.7)), gold);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    b.add(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8).rotateZ(-dx * 0.5).rotateX(dz * 0.5).translate(lx + dx * 2.1, 1.2, lz + dz * 2.1), grey);
    b.add(new THREE.CylinderGeometry(0.45, 0.5, 0.15, 14).translate(lx + dx * 2.7, 0.08, lz + dz * 2.7), grey);
  }
  // flag
  b.add(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8).translate(o[0] + 2.6, 1.3, -6.5), grey);
  b.add(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8).rotateZ(Math.PI / 2).translate(o[0] + 3.3, 2.55, -6.5), grey);
  root.add(new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.75).translate(o[0] + 3.3, 2.15, -6.5), new THREE.MeshLambertMaterial({ map: flagTex(), side: THREE.DoubleSide })));
  // boot-print trails
  const fm = new THREE.MeshLambertMaterial({ map: footTex(), transparent: true, alphaTest: 0.2, depthWrite: false });
  for (const [x, z, rot, len] of [[0, -2, 0.2, 7], [1.6, -4, -0.5, 6], [-1.2, 0.5, 0.9, 5], [3.5, -1, 0.1, 6], [0.8, 3, -0.2, 5]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8, len).rotateX(-Math.PI / 2).rotateY(rot).translate(o[0] + x, 0.02, z), fm);
    m.receiveShadow = true; root.add(m);
  }
  b.build(root);
  const stars = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), new THREE.MeshBasicMaterial({ map: rep(starTex(), 6, 3), side: THREE.BackSide, transparent: true, depthWrite: false, fog: false }));
  stars.name = "stars"; stars.layers.set(NOINK); stars.renderOrder = -0.5; stars.visible = false; root.add(stars);
  earth.layers.set(NOINK); earth.visible = false; root.add(earth);
};

// ---------------- the cast at the start ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const FOLK: Outfit[] = [
  { jacket: "#3f9a5a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#3a2418", skin: HEAD },
  { jacket: "#c25a7a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#d8a040", skin: HEAD, dress: "#d9a441" },
  { jacket: "#7b5ac9", pants: "#2e3a5a", boots: INK, hat: "cap", cap: "#e2453c", skin: HEAD },
  { jacket: "#d84a3a", pants: "#3b3f52", boots: INK, hat: "tophat", skin: HEAD, moustache: "#4a3020", build: "stout" },
  { jacket: "#2f8a9a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#5a8fc2" },
  { jacket: "#5d7a3a", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#b0b0b8", skin: HEAD, build: "stout" },
  { jacket: "#f0b030", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#3f8a4a", skin: HEAD, build: "kid" },
];
const HERO_AT: V3 = [2.0, 0, -29];
const PEOPLE: { p: V3; o: Outfit; phase: number; dir: number }[] = [
  { p: [-1.2, 0, -30.5], o: FOLK[0], phase: 0.1, dir: 1 }, { p: [4.0, 0, -28.4], o: FOLK[1], phase: 0.5, dir: -1 }, { p: [7.4, WALK, -33], o: FOLK[2], phase: 0.3, dir: 1 },
  { p: [-7.8, WALK, -26], o: FOLK[3], phase: 0.7, dir: -1 }, { p: [-3.6, 0, -28.9], o: FOLK[4], phase: 0.9, dir: 1 }, { p: [8.0, WALK, -24], o: FOLK[5], phase: 0.2, dir: -1 },
  { p: [0.6, 0, -33.5], o: FOLK[6], phase: 0.6, dir: 1 },
];

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; look: Look; lvl: number; cInf: number; cam: (u: number, f: number) => Cam };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
const mvAt = (o: V3, p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => mv(at(o, p0), at(o, p1), at(o, l0), at(o, l1), fov, roll, ease);
const S: ShotDef[] = [];
export const SHOTS = S;
const shot = (a: number, look: Look, lvl: number, cInf: number, cam: (u: number, f: number) => Cam) => S.push({ a, look, lvl, cInf, cam });
const head = (p: V3, dy = 1.45): V3 => [p[0], p[1] + dy, p[2]];
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  // everyone vanishes
  shot(0, "day", 0, 10, mv([3.6, 1.6, -24.6], [3.3, 1.6, -25.2], head(HERO_AT, 1.3), head(HERO_AT, 1.35), 40, 0.02));
  shot(E("vanished"), "day", 0, 0, mv([-2.5, 4.5, -18], [-2.2, 4.8, -17], [2, 0.8, -32], [2, 0.8, -32], 42, 0, true));
  shot(E("new"), "day", 0, 0, mv([0, 1.0, -64], [0, 1.3, -58], [0, 9, 10], [0, 10, 10], 50, 0, true));
  shot(E("subway"), "day", 0, 6, mv([2.2, 2.4, -29.5], [2.6, 2.3, -30.2], [8.0, 0.2, -36], [8.0, 0.0, -36], 44, 0.03));
  shot(E("underwater"), "under", 0, 0, mvAt(SUB, [7.5, 1.6, -18], [7.2, 1.7, -14], [-2, 0.5, 10], [-2, 0.6, 12], 46, 0, true));
  // the pumps
  shot(E("down"), "under", 0, 0, mvAt(SUB, [7.8, 1.7, -30], [7.6, 1.7, -26], [0, 0.8, 10], [0, 0.8, 12], 46, 0, true));
  shot(E("pumps"), "under", 0, 8, mvAt(SUB, [0.6, 2.4, 17.5], [0.9, 2.4, 18.5], [5.5, 1.4, 29.5], [5.5, 1.4, 29.5], 44, -0.03));
  shot(E("millions"), "under", 0, 0, mvAt(SUB, [-2.0, 1.0, 2.5], [-2.2, 1.0, 3.5], [-11.6, 1.0, 12], [-11.6, 1.0, 12.5], 46, 0.04));
  shot(E("water"), "under", 0, 10, mvAt(SUB, [-5.6, 1.5, 6.4], [-5.9, 1.5, 6.8], [-11.5, 1.2, 10.5], [-11.5, 1.2, 10.5], 44, -0.03));
  shot(E("nobody"), "under", 0, 12, mvAt(SUB, [1.0, 2.2, 19.0], [1.2, 2.2, 19.4], [5.5, 1.3, 27], [5.5, 1.3, 27], 40, 0.02));
  shot(E("stop"), "under", 0, 0, mvAt(SUB, [6.5, 2.8, -4], [6.3, 3.0, -2], [-3, -1.2, 18], [-3, -1.0, 18], 44, -0.03, true));
  // power plants, lights out
  shot(E("within"), "golden", 0, 0, mvAt(PLANT, [30, 4, -40], [26, 5, -34], [-2, 14, 24], [-2, 15, 24], 46, 0, true));
  shot(E("people"), "dusk", 0, 0, mvAt(PLANT, [-34, 2.0, -34], [-31, 2.4, -31], [8, 14, 24], [8, 15, 24], 44, 0.03));
  shot(E("and", 1), "dusk", 0, 0, mv([0, 60, -150], [0, 52, -132], [0, 0, 0], [0, 0, 10], 46, 0, true));
  shot(E("city", 1), "night", 0, 0, mv([0, 48, 40], [0, 46, 30], [0, 4, -90], [0, 4, -100], 44, 0.03, true));
  // the dog
  shot(E("your"), "day", 0, 12, mv([-5.6, 1.7, STOOP[2] + 2.6], [-5.8, 1.7, STOOP[2] + 2.3], [STOOP[0] + 0.45, 1.6, STOOP[2]], [STOOP[0] + 0.45, 1.6, STOOP[2]], 38, 0.03));
  shot(E("whole"), "night", 0, 10, mv([-5.0, 2.2, STOOP[2] - 2.8], [-5.2, 2.2, STOOP[2] - 2.5], [STOOP[0] + 0.45, 1.5, STOOP[2]], [STOOP[0] + 0.45, 1.5, STOOP[2]], 40, -0.03));
  shot(E("then", 1), "golden", 0, 11, mv([-6.6, 1.5, STOOP[2] + 1.8], [-6.7, 1.5, STOOP[2] + 1.6], [STOOP[0] + 0.45, 1.65, STOOP[2]], [STOOP[0] + 0.45, 1.65, STOOP[2]], 36, 0.02));
  shot(E("own"), "golden", 0, 6, (u, f) => { const d = dogAt(f / FPS).p; return { pos: [d[0] + 3.0, 1.0, d[2] - 2.6], look: [d[0], 0.55, d[2]], fov: 42, roll: 0 }; });
  // five years
  shot(E("in", 2), "day", 1, 0, mv([0.5, 1.4, -90], [0.4, 1.6, -82], [0, 2, 0], [0, 2.5, 0], 46, 0, true));
  shot(E("splits"), "day", 1, 10, mv([1.0, 0.35, -40], [0.8, 0.4, -38.5], [0.2, 0.1, -34], [0.2, 0.1, -34], 46, 0.04));
  shot(E("rain"), "rain", 1, 0, mv([-3, 34, -78], [-2, 32, -72], [16, 20, -44], [16, 20, -42], 44, 0, true));
  shot(E("sound"), "rain", 1, 0, mv([-2, 1.6, 40], [-1.6, 1.8, 36], [0, 6, -20], [0, 7, -20], 46, -0.03));
  // Chernobyl
  shot(E("chernobyl"), "golden", 0, 0, mvAt(CHER, [5, 2.5, -78], [4, 3.0, -86], [0, 11, -125], [0, 11.5, -125], 44, 0, true));
  shot(E("emptied"), "golden", 0, 0, mvAt(CHER, [2, 1.6, 22], [1.6, 1.8, 16], [0, 4, -60], [0, 5, -60], 44, 0.03));
  shot(E("today"), "day", 0, 6, mvAt(CHER, [3.2, 1.1, -5.5], [3.0, 1.1, -6.0], [0, 0.6, -12], [0, 0.6, -12.5], 42, 0));
  shot(E("bears"), "day", 0, 10, mvAt(CHER, [-6, 1.2, -16], [-6.2, 1.2, -16.8], [0, 0.9, -22], [0, 0.9, -22], 40, -0.03));
  shot(E("horses"), "golden", 0, 0, mvAt(CHER, [-3.5, 1.5, -26], [-4, 1.6, -27], [-14, 1.4, -36], [-14, 1.5, -36], 40, 0.02, true));
  // fifty years
  shot(E("in", 4), "day", 2, 0, mv([0, 3.0, -100], [0, 3.6, -92], [0, 4, 0], [0, 4.5, 0], 46, 0, true));
  shot(E("parking"), "day", 2, 0, mv([LOT[0] - 2, 6, LOT[2] - 6], [LOT[0] - 1, 6.5, LOT[2] - 4], [LOT[0] + 18, 0.5, LOT[2] + 14], [LOT[0] + 18, 0.6, LOT[2] + 15], 46, 0.03, true));
  shot(E("steel"), "day", 2, 0, mv([-34, 2, RIVER0 - 8], [-30, 3, RIVER0 - 4], [0, 3, (RIVER0 + RIVER1) / 2], [0, 3.5, (RIVER0 + RIVER1) / 2], 44, 0, true));
  shot(E("rust"), "day", 2, 9, mv([4.2, 2.0, RIVER0 + 8], [4.4, 2.2, RIVER0 + 9], [6.3, 4, RIVER0 + 14], [6.3, 4.2, RIVER0 + 14], 40, -0.04));
  shot(E("paint"), "day", 2, 0, mv([16, -2.4, RIVER0 + 4], [18, -2.2, RIVER0 + 10], [0, 3, (RIVER0 + RIVER1) / 2], [0, 3, (RIVER0 + RIVER1) / 2], 44, 0.03));
  // a hundred years
  shot(E("in", 5), "day", 3, 0, mv([20, 70, -170], [16, 60, -150], [0, 0, -40], [0, 0, -30], 46, 0, true));
  shot(E("forest"), "day", 3, 6, mv([0.5, 1.6, -60], [0.4, 1.7, -54], [0, 4, -20], [0, 4.5, -20], 46, 0.02));
  shot(E("buildings"), "day", 3, 0, mv([3, 1.4, -30], [3.2, 1.4, -31], [9.5, 22, -40], [9.5, 24, -40], 54, -0.05));
  shot(E("almost"), "golden", 3, 0, mv([0, 120, -40], [0, 105, -36], [0, 0, -40], [0, 0, -39], 46, 0, true));
  shot(E("swallowed"), "golden", 3, 0, mv([-22, 72, -150], [-16, 64, -130], [0, 0, -40], [0, 0, -30], 44, 0, true));
  // the Moon
  shot(E("but"), "moon", 0, 0, mvAt(MOON, [9, 3.0, 9], [7, 2.6, 7], [-2, 2, -10], [-2, 2.4, -10], 44, 0, true));
  shot(E("boot"), "moon", 0, 10, mvAt(MOON, [0.8, 1.1, 2.6], [0.6, 0.9, 1.8], [0.1, 0, -1.5], [0.1, 0, -2.0], 42, 0.03));
  shot(E("exactly"), "moon", 0, 0, mvAt(MOON, [1.4, 0.5, 5], [1.4, 2.4, 9], [-1, 1.6, -12], [-1, 9, -40], 46, 0, true));
};
let built = false;
const ensure = () => { if (!built) { built = true; build(); S.sort((a, b) => a.a - b.a); } };
export const shotIdx = (f: number) => { ensure(); let i = 0; while (i + 1 < S.length && f >= S[i + 1].a) i++; return i; };
const shotEnd = (i: number) => (i + 1 < S.length ? S[i + 1].a : TOTAL);
const KICKS = () => [wf("vanished"), wf("stop"), wf("splits")];
const kick = (f: number) => { for (const k of KICKS()) { const d = f - k; if (d >= 0 && d < 7) return (d % 2 ? -1 : 1) * 0.045 * (1 - d / 7); } return 0; };
export const camAt = (i: number, f: number): Cam => {
  ensure();
  const s = S[i], b = shotEnd(i), u = clamp01((f - s.a) / Math.max(1, b - s.a)), c = s.cam(u, f);
  const k = 0.0025 * Math.max(0, f - s.a);
  return { ...c, pos: lerp3(c.pos, c.look, Math.min(0.2, k * 0.35)), roll: c.roll + kick(f) };
};
export const dofAt = (f: number) => { ensure(); return { cInf: S[shotIdx(f)].cInf }; };
export const lookAt = (f: number): Look => { ensure(); return S[shotIdx(f)].look; };

// ---------------- the story by time ----------------
/** dog: sits by the door, then trots off down the sidewalk */
function dogAt(t: number): { p: V3; walking: boolean } {
  const z0 = STOOP[2], go = T("own") - 0.5;
  if (t < go) return { p: [STOOP[0] + 0.45, WALK + 1.0, z0], walking: false }; // on the top step, by the door
  return { p: [STOOP[0] + 3.0, WALK, z0 - 1.6 - (t - go) * 1.6], walking: true };
}
/** subway water level (y): normal pumping, then rising after the pumps stop; "underwater" flash-forward is flooded */
const waterY = (t: number, i: number) => {
  if (S[i] && S[i].a === wf("underwater")) return 1.2;
  if (t < T("stop")) return -1.55;
  return -1.55 + Math.min(1.3, (t - T("stop")) * 0.9);
};

// ---------------- the world ----------------
export class EmptyWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private animals: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#b8d0ec", 70, 700);
  private clouds: THREE.Mesh[] = [];
  private sunCache = new Map<number, THREE.Vector3>();
  private growth = new Growth();
  private lits: Lit[] = [];
  private bridgeMat: THREE.MeshLambertMaterial[] = [];
  private pumps: THREE.Object3D[] = [];
  private water: THREE.Mesh;
  private wheel = new THREE.Group();
  private earth: THREE.Sprite;
  private stars!: THREE.Object3D;

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
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cm[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.layers.set(NOINK); this.clouds.push(m); R.add(m);
    }
    buildCity(R, this.growth, this.lits, this.bridgeMat);
    this.water = new THREE.Mesh(new THREE.PlaneGeometry(21.4, 80).rotateX(-Math.PI / 2).translate(-1.5, 0, 0), new THREE.MeshLambertMaterial({ map: rep(riverTex(), 4, 12), transparent: true, opacity: 0.88, color: "#9fd0d8" }));
    buildSubway(R, this.pumps, this.water);
    buildPlant(R);
    buildCher(R, this.wheel);
    this.earth = new THREE.Sprite(new THREE.SpriteMaterial({ map: earthTex(), fog: false, depthWrite: false }));
    buildMoon(R, this.earth);
    this.stars = R.getObjectByName("stars")!;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private animal(i: number, w: number, h: number) {
    while (this.animals.length <= i) this.animals.push(new Actor(this.root, new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0)));
    const a = this.animals[i]; a.mesh.scale.set(w, h, 1); return a;
  }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  private shotSun(i: number) {
    let v = this.sunCache.get(i);
    if (v) return v;
    const s = S[i], b = shotEnd(i), [azD, elD] = SUN_OF[s.look];
    let fx = 0, fz = 0;
    for (let f = s.a; f < b; f += 3) { const c = camAt(i, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(azD), el = THREE.MathUtils.degToRad(elD);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(i, v);
    return v;
  }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const i = shotIdx(f), s = S[i], t = f / FPS, { L, K } = PRESETS[s.look];
    const c = camAt(i, f), pos = V(...c.pos), look = V(...c.look);
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const sunDir = this.shotSun(i), dist = pos.distanceTo(look);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = s.look === "moon" ? 0.1 : L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 9, 14, 60);
    this.sun.position.copy(look).addScaledVector(sunDir, 220); this.sun.target.position.copy(look);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.sun.castShadow = s.look !== "under";
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, k) => untone(h, su["c" + k].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color);
    const fogFar = s.look === "moon" ? 1400 : s.look === "under" ? 90 : s.look === "rain" ? 260 : s.look === "night" ? 500 : 700;
    this.fog.near = fogFar * 0.08; this.fog.far = fogFar;
    scene.fog = this.fog; scene.background = null;
    const cloudy = s.look === "day" || s.look === "golden" || s.look === "rain";
    this.clouds.forEach((m, k) => {
      const a = (k / 12) * Math.PI * 2 + 0.3, d = 560 + (k % 3) * 70, w = 140 + (k % 4) * 34;
      m.visible = cloudy; m.position.set(cam.position.x + Math.cos(a) * d, 60 + (k % 4) * 34, cam.position.z + Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
    });
    this.stars.visible = s.look === "moon"; this.stars.position.copy(cam.position);
    this.earth.visible = s.look === "moon";
    if (this.earth.visible) { this.earth.position.set(MOON[0] - 60, 70, -260); this.earth.scale.setScalar(42); }
    // city state
    this.growth.set(s.lvl);
    const rust = s.lvl >= 2 ? 1 : 0;
    for (const m of this.bridgeMat) m.color.set(rust ? "#9a5230" : "#6f8aa8");
    const lightsOn = s.look === "dusk" || s.look === "night";
    const outT = T("out", 2);
    for (const l of this.lits) {
      const off = outT + 0.25 + clamp01((40 - l.z) / 240) * 1.6; // the blackout runs down the avenue
      const on = lightsOn && (t < off);
      l.mesh.visible = on; (l.mesh.material as THREE.MeshBasicMaterial).opacity = on ? 1 : 0;
    }
    // subway pumps + water
    const running = t < T("stop");
    this.pumps.forEach((g, k) => {
      g.position.y = running ? 0.02 * Math.sin(t * 60 + k) : 0;
      const lamp = g.getObjectByName("lamp") as THREE.Mesh;
      (lamp.material as THREE.MeshBasicMaterial).color.setRGB(running ? 0.4 : 2.2, running ? 2.2 : 0.3, running ? 0.6 : 0.3);
    });
    this.water.position.y = waterY(t, i);
    // Ferris wheel stands still (rusted)
    this.wheel.rotation.z = 0.12;

    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const k = (f + seed * 37) % 64; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
    let ai = 0, an = 0, fi = 0;
    const used: Actor[] = [], fused: Fx[] = [];
    const addFx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, atp: THREE.Vector3, w: number, h: number, soft = false, op = 1) => {
      const ef = this.fx(fi++);
      ef.r = this.pool.req(key, cw, ch, 1, draw); ef.use(soft); ef.soft.opacity = op;
      ef.mesh.visible = true; ef.mesh.position.copy(atp); ef.mesh.quaternion.copy(cam.quaternion); ef.mesh.scale.set(w, h, 1);
      fused.push(ef);
      return ef;
    };
    const ground = (p: V3, w = 0.55) => {
      const ef = addFx("blob|contact|#3a3460", 128, 128, (pp) => fxContact(pp, "#3a3460"), V(p[0], p[1] + 0.02, p[2]), w, w * 0.7);
      ef.mesh.rotation.set(-Math.PI / 2, 0, 0);
    };
    const person = (key: string, p: V3, o: Outfit, fo: FrontOpts, seed: number) => {
      const w = V(...p), d = cam.position.distanceTo(w);
      if (d > 120) return;
      const [cw, ch, k] = d < 3.2 ? [1800, 3000, 3.0] : d < 7 ? [1080, 1800, 1.8] : d < 18 ? [480, 800, 0.8] : [240, 400, 0.4];
      const f2: FrontOpts = { ...fo, light: L2D, seed };
      if (f2.blink === undefined) f2.blink = lid(seed);
      const a = this.actor(ai++);
      a.r = this.pool.req(`${key}|F|${JSON.stringify(f2, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, k, (pen) => bodyFront(pen, o, f2));
      a.mesh.visible = true; a.mesh.position.copy(w);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - w.x, cam.position.z - w.z), 0);
      a.mesh.scale.set(1, 1, 1); a.mesh.castShadow = false;
      used.push(a); ground(p);
    };
    const beast = (key: string, p: V3, kind: Kind | "dogsit", w: number, draw: (pen: Pen) => void, dir: V3 = [1, 0, 0]) => {
      const wp = V(...p), d = cam.position.distanceTo(wp);
      if (d > 120) return;
      const sit = kind === "dogsit", h = sit ? w * (700 / 600) : w * 0.6, k = d < 4 ? 1.6 : d < 10 ? 1 : 0.5;
      const a = this.animal(an++, w, h);
      a.r = this.pool.req(key, Math.round((sit ? 600 : 1000) * k), Math.round((sit ? 700 : 600) * k), k, draw);
      a.mesh.visible = true; a.mesh.position.copy(wp);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - wp.x, cam.position.z - wp.z), 0);
      const mirror = !sit && dir[0] * right.x + dir[2] * right.z < 0;
      a.mesh.scale.set(mirror ? -w : w, h, 1); a.mesh.castShadow = false;
      used.push(a); ground(p, w * 0.6);
    };
    // people, until they vanish
    const gone = T("vanished") + 0.1;
    if (t < gone) {
      person("hero", HERO_AT, HERO, { mode: "stroll", phase: t * 1.1, expr: "grin" }, 4);
      PEOPLE.forEach((q, k) => person("p" + k, [q.p[0], q.p[1], q.p[2] + q.dir * t * 1.0], q.o, { mode: "stroll", phase: t * 1.1 + q.phase, expr: k % 2 ? "smile" : "neutral" }, 10 + k));
    } else if (t < gone + 0.5 && s.lvl === 0 && i <= 1) {
      const k = Math.round(((t - gone) / 0.5) * 6) / 6;
      for (const p of [HERO_AT, ...PEOPLE.map((q) => [q.p[0], q.p[1], q.p[2] + q.dir * gone] as V3)]) addFx(`puff|${k}`, 300, 300, (pp) => fxPuff(pp, k), V(p[0], p[1] + 1.0, p[2]), 1.8, 1.8, true);
    }
    // the dog (city, level 0)
    if (S[i].lvl === 0 && Math.abs(cam.position.x) < 500) {
      const dg = dogAt(t);
      const week = t >= T("whole") - 0.1 && t < T("then") - 0.1;
      if (!dg.walking) beast(`dogsit|${week ? 1 : 0}|${t >= T("then") ? 1 : 0}|${Math.round(Math.sin(t * 9) * 2)}`, dg.p, "dogsit", 0.75,
        (pen) => dogSit(pen, t >= T("then") ? -0.8 : 0, t >= T("then") ? 0.2 : 0.8, week, t < T("whole") ? Math.sin(t * 9) * 0.3 : 0));
      else { const ph = Math.round((t * 2.2) % 1 * 12) / 12; beast(`dog|${ph}`, dg.p, "dog", 0.9, (pen) => quadSide(pen, "dog", ph, 1), [0, 0, -1]); }
    }
    // Chernobyl animals
    if (Math.abs(cam.position.x - CHER[0]) < 500) {
      const st = (k: number, sp: number) => Math.round(((t * sp + k * 0.31) % 1) * 12) / 12;
      for (let k = 0; k < 3; k++) { const z = -10 - k * 2.2, x = -9 + ((t - T("today") + 2) * 2.4 + k * 1.3) % 22; beast(`wolf|${st(k, 2.2)}`, at(CHER, [x, 0, z]), "wolf", 1.5, (pen) => quadSide(pen, "wolf", st(k, 2.2), 1), [1, 0, 0]); }
      beast(`bear|${st(5, 1.2)}`, at(CHER, [-1.5 + (t - T("bears")) * 0.9, 0, -22]), "bear", 2.1, (pen) => quadSide(pen, "bear", st(5, 1.2), 0.8), [1, 0, 0]);
      for (let k = 0; k < 3; k++) { const x = -18 + k * 3.2 + (t - T("horses")) * 1.4; beast(`horse|${st(k + 7, 1.4)}|${k === 1 ? 1 : 0}`, at(CHER, [x, 0, -36 + k * 1.5]), "horse", 2.6, (pen) => quadSide(pen, "horse", st(k + 7, 1.4), 0.9, k === 1 ? 0.6 : 0), [1, 0, 0]); }
    }
    // rain streaks
    if (s.look === "rain") {
      const fw = V(0, 0, 0); cam.getWorldDirection(fw);
      for (let k = 0; k < 90; k++) {
        const rr = rng(k * 7 + Math.floor(t * 12))();
        const q = pos.clone().addScaledVector(fw, 3 + (k % 8) * 2).addScaledVector(right, ((k * 0.37) % 1 - 0.5) * 6).add(V(0, (rr - 0.5) * 6, 0));
        addFx("rain", 32, 256, (pp) => { pp.g.fillStyle = "rgba(225,235,255,0.85)"; pp.g.fillRect(10, 0, 12, 256); }, q, 0.06, 1.2, true, 0.8);
      }
    }
    // water jets in the subway while the pumps work
    if (s.look === "under" && t < T("stop")) for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) {
      // water pouring from cracks in the tunnel wall
      const ph = ((t * 2.2 + k * 0.3 + j * 0.33) % 1);
      addFx("jet", 128, 512, (pp) => { const g = pp.g, gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "rgba(200,240,255,0.95)"); gr.addColorStop(1, "rgba(120,200,240,0.2)"); g.fillStyle = gr; g.beginPath(); g.moveTo(40, 0); g.lineTo(88, 0); g.lineTo(110, 512); g.lineTo(18, 512); g.fill(); }, V(...at(SUB, [-11.5, 2.6 - ph * 3.6, 6 + k * 4.5])), 0.45, 1.4, true, 0.9 * (1 - ph * 0.5));
    }
    for (let k = ai; k < this.actors.length; k++) this.actors[k].mesh.visible = false;
    for (let k = an; k < this.animals.length; k++) this.animals[k].mesh.visible = false;
    for (let k = fi; k < this.fxs.length; k++) this.fxs[k].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return look;
  }
}
// unused helpers kept for symmetry with other shorts
void [smooth, (e: Expr) => e];
