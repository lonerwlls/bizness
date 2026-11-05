// "What if the Moon started getting closer to Earth": a seaside town at night (street, promenade, beach, a bench,
// a clock tower), the hero's bedroom (a separate set), and the Moon itself, which grows night after night, floods
// the beach, lights the night, cracks, breaks apart and turns into rings across the sky. Cuts follow the narration.
import * as THREE from "three";
import { Batch, V, lam, boxGeo, prop, house } from "../bridge/build";
import { rep, ctex, rng, stoneHD, planksHD, grassHD, cobbleHD } from "../bridge/paint";
import { Pen, bodyFront, Outfit, Expr, FrontOpts, fxContact, HOLD_DY } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx, SU } from "../bridge/cast";
import { makeKit } from "../bridge/kitgen";
import * as SP from "../swap/props";
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

// ---------------- the Moon by time ----------------
/** apparent size factor (1 = today's Moon) */
const moonK = (t: number) => {
  let k = 3.2;
  k = lerp(k, 5.0, smooth((t - T("pull")) / 2.0));
  k = lerp(k, 6.5, smooth((t - T("rule", 2)) / 2.0));
  k = lerp(k, 13, smooth((t - T("and", 5)) / 3.0));
  return k;
};
const CRACK0 = () => T("about", 3), BREAK0 = () => T("tears"), RINGS0 = () => T("rings") - 0.3;
/** how bright the night is (0 = today's full moon night, 1 = very bright) */
const nightGlow = (t: number) => clamp01((moonK(t) - 3.2) / 5) * (t < BREAK0() + 1 ? 1 : 0.6);
/** sea level: calm (sand dry) until the tides go wild, then over the beach and lapping the promenade */
const seaY = (t: number) => lerp(-0.35, 0.08, smooth((t - T("eight")) / 2.2)) + (t > T("eight") ? 0.05 * Math.sin(t * 1.3) : 0);

// ---------------- light ----------------
type Look = "night" | "room";
const PR = (l: Partial<LightPreset>, k: Partial<WorldLook>) => ({ L: { ...LIGHTS.day, ...l }, K: { ...LOOK.day, ...k } });
const NIGHT = PR({ lit: [0.75, 0.85, 1.15], shade: [0.16, 0.19, 0.32], lift: [0.03, 0.05, 0.11], fog: "#22305c", sunCol: "#dce6ff", sunI: 2.3, charTint: [0.8, 0.86, 1.0], hemiI: 0.4 },
  { sky: { c: ["#34467e", "#283a72", "#1e2c62", "#16224f", "#0e173c"], e: [0, 4, 10, 20, 40] }, sat: 0.95 });
const BRIGHT_SKY = ["#5a78b0", "#4c6aa6", "#3e5c98", "#304c86", "#223a6e"];
const RING_SKY = ["#6a6aa8", "#5a5c9e", "#4a5090", "#3a4280", "#2a3268"];
const SUN_OF: Record<Look, [number, number]> = { night: [20, 28], room: [30, 30] };

// ---------------- layout ----------------
export const WALK = 0.12;
const PROM0 = 22, PROM1 = 26, SAND1 = 58;          // promenade z 22..26, beach to z 58, sea beyond
const DOOR: V3 = [-9.6, WALK, 8];
const BENCH: V3 = [4.35, WALK, -4];
const TOWER: V3 = [0, 0, -72];
const ROOM: V3 = [3000, 0, 0];
const BED: V3 = [ROOM[0] - 1.2, 0, -1.9];
const MOON_DIR = new THREE.Vector3(0.12, 0.34, 1).normalize();   // over the sea

// ---------------- cast ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; look: Look; cInf: number; cam: (u: number, f: number) => Cam };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
/** look toward the Moon from p (a point far along MOON_DIR) */
const toMoon = (p: V3, d = 60): V3 => [p[0] + MOON_DIR.x * d, p[1] + MOON_DIR.y * d, p[2] + MOON_DIR.z * d];
const S: ShotDef[] = [];
export const SHOTS = S;
const shot = (a: number, look: Look, cInf: number, cam: (u: number, f: number) => Cam) => S.push({ a, look, cInf, cam });
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  // midnight: you step outside
  shot(0, "night", 0, mv([0.5, 1.2, -14], [0.4, 1.4, -11], toMoon([0, 1.2, -14]), toMoon([0, 1.4, -11]), 46, 0, true));
  shot(E("you", 1), "night", 8, mv([-1.6, 1.5, 11.5], [-1.8, 1.5, 11.0], [-6.5, 1.2, 8], [-6.5, 1.2, 8], 42, 0.02));
  shot(E("moon", 1), "night", 0, mv([-6.6, 0.7, 5.6], [-6.6, 0.75, 5.4], toMoon([-6.6, 0.9, 5.6], 40), toMoon([-6.6, 0.9, 5.6], 40), 50, -0.04));
  shot(E("not"), "night", 0, mv([0, 1.5, 0], [0, 1.5, 0.5], toMoon([0, 1.5, 0], 400), toMoon([0, 1.5, 0.5], 400), 14));
  shot(E("a", 2), "night", 12, mv([-5.3, 1.5, 10.4], [-5.35, 1.5, 10.2], [-6.5, 1.5, 8], [-6.5, 1.52, 8], 36, 0.03));
  shot(E("tonight"), "night", 0, mv([10, 24, -40], [8, 20, -30], toMoon([0, 4, 10], 80), toMoon([0, 4, 12], 80), 46, 0, true));
  shot(E("and", 2), "night", 6, mv([2.5, 1.5, 20.5], [2.2, 1.5, 21.0], toMoon([0, 1.4, 26], 40), toMoon([0, 1.5, 26], 40), 46, 0.02));
  // rule one: tides
  shot(E("rule", 1), "night", 0, mv([6, 3.2, 20], [5, 3.0, 22], [0, 0, 44], [0, 0.2, 46], 46, 0, true));
  shot(E("right"), "night", 0, mv([1.0, 1.0, 30], [1.0, 1.1, 31], toMoon([1, 1.0, 30], 300), toMoon([1, 1.1, 31], 300), 22, 0.02));
  shot(E("every", 1), "night", 0, mv([-6, 0.6, 27], [-5.5, 0.7, 27.5], toMoon([-6, 0.6, 27], 300), toMoon([-5.5, 0.7, 27.5], 300), 30, -0.02));
  shot(E("pull"), "night", 0, mv([0, 4, 16], [0, 3.5, 18], toMoon([0, 2, 40], 60), toMoon([0, 2, 40], 60), 44, 0, true));
  shot(E("eight"), "night", 0, mv([-5, 2.3, 23.2], [-4.6, 2.3, 23.5], [2, 0.2, 38], [2, 0.3, 38], 44, -0.03));
  shot(E("your", 1), "night", 0, mv([7, 4.5, 18], [5.5, 4.0, 19], [0, 0, 40], [0, 0, 40], 46, 0, true));
  shot(E("twice"), "night", 9, mv([1.2, 1.1, 22.0], [1.0, 1.1, 22.3], [-0.8, 0.9, 25.0], [-0.8, 0.9, 25.0], 42, 0.03));
  // rule two: bright nights
  shot(E("rule", 2), "night", 0, mv([0.4, 1.0, -30], [0.4, 1.4, -26], toMoon([0, 2, -20], 60), toMoon([0, 2.5, -20], 60), 50, 0, true));
  shot(E("at", 1), "night", 0, mv([0, 1.5, 0], [0, 1.5, 0.5], toMoon([0, 1.5, 0], 400), toMoon([0, 1.5, 0.5], 400), 22));
  shot(E("shines"), "night", 0, mv([-12, 20, -50], [-10, 16, -42], [0, 0, -10], [0, 0, -8], 46, 0.02, true));
  shot(E("you", 3), "night", 10, mv([1.6, 1.4, -1.8], [1.8, 1.4, -2.2], [BENCH[0], 1.0, BENCH[2]], [BENCH[0], 1.0, BENCH[2]], 40, 0.03));
  shot(E("you", 4), "room", 8, mv([BED[0] + 0.1, 3.4, BED[2] + 0.7], [BED[0] + 0.08, 3.1, BED[2] + 0.55], [BED[0], 0.57, BED[2]], [BED[0], 0.57, BED[2]], 50, 0.02));
  // rule three: shorter days
  shot(E("rule", 3), "night", 0, mv([3, 1.4, -48], [2.4, 1.8, -52], [0, 14, -72], [0, 15, -72], 46, 0, true));
  shot(E("four", 3), "night", 0, mv([0.4, 15.5, -60], [0.35, 15.6, -61], [0, 15.5, -68.8], [0, 15.5, -68.8], 30));
  shot(E("day", 2), "night", 9, mv([2.2, 1.4, -61.5], [2.0, 1.4, -61.8], [0.6, 1.4, -64.5], [0.6, 1.5, -64.5], 40, -0.03));
  shot(E("weekend"), "night", 12, mv([1.4, 1.5, -62.6], [1.35, 1.5, -62.8], [0.6, 1.45, -64.5], [0.6, 1.45, -64.5], 34, 0.03));
  // the last rule: the Moon breaks
  shot(E("and", 5), "night", 0, mv([0, 1.2, -10], [0, 1.5, -6], toMoon([0, 1.2, -10], 60), toMoon([0, 1.5, -6], 60), 50, 0, true));
  shot(E("line"), "night", 8, mv([-1.0, 1.0, 23.0], [-1.1, 1.0, 22.7], [-0.8, 1.9, 24.6], [-0.8, 1.95, 24.6], 40, 0.02));
  shot(E("about", 3), "night", 0, mv([0, 1.5, 0], [0, 1.5, 0.4], toMoon([0, 1.5, 0], 400), toMoon([0, 1.5, 0.4], 400), 40));
  shot(E("gravity"), "night", 0, mv([8, 30, -30], [6, 26, -22], toMoon([0, 4, 10], 80), toMoon([0, 4, 12], 80), 50, 0, true));
  shot(E("tears"), "night", 0, mv([0, 1.5, 0], [0, 1.5, 0.2], toMoon([0, 1.5, 0], 400), toMoon([0, 1.5, 0.2], 400), 50, 0.02));
  shot(E("rings"), "night", 0, mv([2, 2.5, 10], [1, 3, 14], [0, 60, 120], [0, 70, 120], 56, 0, true));
  // you step outside one more time
  shot(E("so", 2), "night", 8, mv([-1.6, 1.5, 11.5], [-1.8, 1.5, 11.0], [-6.5, 1.2, 8], [-6.5, 1.2, 8], 42, 0.02));
  shot(E("midnight", 3), "night", 0, mv([4, 6, -30], [3, 9, -24], [0, 40, 60], [0, 50, 60], 58, 0, true));
  shot(E("whole"), "night", 6, mv([-3.7, 0.5, 9.3], [-3.75, 0.45, 9.1], [-4.4, 3.0, 15], [-4.4, 3.3, 15], 50, 0.03));
};
let built = false;
const ensure = () => { if (!built) { built = true; build(); S.sort((a, b) => a.a - b.a); } };
export const shotIdx = (f: number) => { ensure(); let i = 0; while (i + 1 < S.length && f >= S[i + 1].a) i++; return i; };
const shotEnd = (i: number) => (i + 1 < S.length ? S[i + 1].a : TOTAL);
export const camAt = (i: number, f: number): Cam => {
  ensure();
  const s = S[i], b = shotEnd(i), u = clamp01((f - s.a) / Math.max(1, b - s.a)), c = s.cam(u, f);
  const k = 0.0025 * Math.max(0, f - s.a);
  return { ...c, pos: lerp3(c.pos, c.look, Math.min(0.2, k * 0.35)) };
};
export const dofAt = (f: number) => { ensure(); return { cInf: S[shotIdx(f)].cInf }; };

// ---------------- the hero by time ----------------
type HeroPose = { p: V3; fo: FrontOpts; lie?: boolean; book?: boolean; sit?: boolean };
function heroAt(t: number): HeroPose | null {
  const outside = (k: number): V3 => [lerp(DOOR[0], -6.5, smooth(k)), WALK, DOOR[2]];
  if (t < T("tonight")) {
    let expr: Expr = "neutral", headTilt = 0;
    if (t >= T("moon", 1)) { expr = "nervous"; headTilt = -8; }
    if (t >= T("a", 2)) { expr = "shock"; headTilt = -8; }
    const walking = t < T("moon", 1) - 0.2;
    return { p: outside((t - T("you", 1)) / 1.2), fo: walking ? { mode: "stroll", phase: t * 1.1, expr: "neutral" } : { mode: "stand", expr, headTilt, look: 0.3 } };
  }
  if (t < T("rule", 2)) {
    if (t >= T("twice")) return { p: [-0.8, WALK, 24.6], fo: { mode: "stand", expr: "pained", look: 0.4 } };
    return { p: [-0.8, WALK, 24.0], fo: { mode: "stand", expr: "shock", headTilt: -6 } };
  }
  if (t < T("rule", 3)) {
    if (t < T("you", 3)) return null;
    if (t < T("you", 4)) return { p: [BENCH[0] - 0.1, WALK + 0.42, BENCH[2]], fo: { mode: "sit", expr: "smile", prop: "hold2" }, book: true, sit: true };
    return { p: [BED[0], 0.575, BED[2] - 0.7 + 2.07], fo: { mode: "stand", expr: "dazed" }, lie: true };
  }
  if (t < T("and", 5)) {
    const expr: Expr = t >= T("weekend") ? "pained" : t >= T("day", 2) ? "nervous" : "neutral";
    return { p: [0.6, 0, -64.5], fo: { mode: "stand", expr, headTilt: t >= T("day", 2) && t < T("weekend") ? -8 : 0 } };
  }
  if (t < T("so", 2)) return { p: [-0.8, WALK, 24.6], fo: { mode: "stand", expr: t >= T("tears") ? "shock" : "nervous", headTilt: -9, look: 0.3 } };
  let expr: Expr = "neutral", headTilt = -8;
  if (t >= T("whole")) { expr = "grin"; headTilt = -10; }
  if (t >= T("whole") - 0.1) return { p: [-4.2, WALK, 12], fo: { mode: "stand", expr, headTilt, look: 0.3 } };
  const walking = t < T("midnight", 3) - 0.2;
  return { p: outside((t - T("so", 2)) / 1.2), fo: walking ? { mode: "stroll", phase: t * 1.1, expr: "neutral" } : { mode: "stand", expr, headTilt, look: 0.3 } };
}

// ---------------- painted textures ----------------
const moonTex = () => ctex("moonFace", 1024, 512, (g, r) => {
  g.fillStyle = "#e6e2d6"; g.fillRect(0, 0, 1024, 512);
  for (const [x, y, rr] of [[300, 180, 120], [520, 260, 90], [700, 150, 70], [420, 360, 80], [820, 320, 100], [160, 330, 60]] as const) { g.fillStyle = "rgba(150,150,160,0.55)"; g.beginPath(); g.ellipse(x, y, rr * 1.4, rr, 0, 0, 7); g.fill(); } // maria
  for (let i = 0; i < 160; i++) { const x = r() * 1024, y = r() * 512, rr = 4 + r() * 22; g.strokeStyle = "rgba(110,110,120,0.5)"; g.lineWidth = 2 + rr * 0.12; g.beginPath(); g.ellipse(x, y, rr * 1.3, rr, 0, 0, 7); g.stroke(); g.fillStyle = "rgba(255,255,255,0.15)"; g.fill(); }
});
const crackTex = () => ctex("moonCracks", 1024, 512, (g, r) => {
  g.clearRect(0, 0, 1024, 512);
  g.strokeStyle = "rgba(255,170,80,1)"; g.lineCap = "round";
  for (let i = 0; i < 26; i++) {
    let x = r() * 1024, y = r() * 512; g.lineWidth = 3 + r() * 6; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 90; y += (r() - 0.5) * 60; g.lineTo(x, y); }
    g.stroke();
  }
});
const ringTex = () => ctex("ringBands", 1024, 64, (g, r) => {
  g.clearRect(0, 0, 1024, 64);
  for (let x = 0; x < 1024; x += 2) {
    const v = 0.35 + 0.65 * Math.abs(Math.sin(x * 0.035) * Math.sin(x * 0.011 + 1)) * (0.7 + 0.3 * r());
    const gap = (x > 600 && x < 640) || (x > 860 && x < 875);
    const band = Math.floor(x / 90) % 3, col = ["255,236,196", "246,200,120", "236,170,160"][band];
    g.fillStyle = `rgba(${col},${gap ? 0.04 : 0.45 + 0.55 * v})`; g.fillRect(x, 0, 2, 64);
  }
});
const starTex = () => ctex("starsMoon", 1024, 1024, (g, r) => {
  g.clearRect(0, 0, 1024, 1024);
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.6})`; const s = r() < 0.9 ? 2 : 4; g.fillRect(r() * 1024, r() * 1024, s, s); }
});
const sandTex = () => ctex("sandMoon", 1024, 1024, (g, r) => {
  g.fillStyle = "#e6cf98"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? "rgba(190,150,90,0.25)" : "rgba(255,245,215,0.35)"; g.fillRect(r() * 1024, r() * 1024, 3 + r() * 5, 2 + r() * 3); }
});
const seaTex = () => ctex("seaMoon", 1024, 1024, (g, r) => {
  g.fillStyle = "#2a6a9a"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) { const x = r() * 1024, y = r() * 1024, w = 20 + r() * 60; g.strokeStyle = r() < 0.7 ? "rgba(220,240,255,0.5)" : "rgba(10,40,80,0.35)"; g.lineWidth = 4 + r() * 4; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 8, x + w, y); g.stroke(); }
});
const stripeTex = (key: string, a: string, b: string, n = 10) => ctex(key, 512, 256, (g) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect((i * 512) / n, 0, 512 / n + 1, 256); } });
const drawClock = (g: CanvasRenderingContext2D, hAng: number, mAng: number) => {
  const c = 256; g.clearRect(0, 0, 512, 512);
  g.fillStyle = "#d9c9a0"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#fbf5e4"; g.strokeStyle = "#241726"; g.lineWidth = 22; g.beginPath(); g.arc(c, c, 220, 0, 7); g.fill(); g.stroke();
  g.lineCap = "round"; for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; g.lineWidth = 14; g.beginPath(); g.moveTo(c + 165 * Math.sin(a), c - 165 * Math.cos(a)); g.lineTo(c + 196 * Math.sin(a), c - 196 * Math.cos(a)); g.stroke(); }
  g.lineWidth = 22; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 110 * Math.sin(hAng), c - 110 * Math.cos(hAng)); g.stroke();
  g.lineWidth = 14; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 175 * Math.sin(mAng), c - 175 * Math.cos(mAng)); g.stroke();
  g.fillStyle = "#241726"; g.beginPath(); g.arc(c, c, 20, 0, 7); g.fill();
};
/** a paperback, centred, facing +z (held between the hands) */
const book = () => {
  const g = new THREE.Group();
  const cover = lam("bookCover", () => ({ color: "#3f6fb5" })), pages = lam("bookPages", () => ({ color: "#f8f2e0" }));
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.21, 0.012), cover); m.position.set(s * 0.078, 0, 0.0); m.rotation.y = -s * 0.35; g.add(m); const p = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.19, 0.01), pages); p.position.set(s * 0.072, 0, 0.012); p.rotation.y = -s * 0.35; g.add(p); }
  g.traverse((m) => { const mm = m as THREE.Mesh; if (mm.isMesh) { mm.castShadow = true; mm.receiveShadow = true; } });
  return g;
};

// ---------------- the world ----------------
export class MoonWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#22305c", 60, 600);
  private sunCache = new Map<number, THREE.Vector3>();
  private stars: THREE.Mesh;
  private moon = new THREE.Group();
  private moonBall: THREE.Mesh; private moonCracks: THREE.Mesh; private chunks: { m: THREE.Mesh; d: THREE.Vector3; s: number }[] = [];
  private rings: THREE.Mesh;
  private sea: THREE.Mesh;
  private boats: THREE.Group[] = [];
  private clockCv = document.createElement("canvas"); private clockTex: THREE.CanvasTexture;
  private book = book();
  private quilt = SP.quilt(-0.05, 1.0);

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
    this.stars = new THREE.Mesh(new THREE.SphereGeometry(1050, 32, 16), new THREE.MeshBasicMaterial({ map: rep(starTex(), 6, 3), side: THREE.BackSide, transparent: true, depthWrite: false, fog: false }));
    this.stars.layers.set(NOINK); this.stars.renderOrder = -0.6; R.add(this.stars);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    // the Moon: a lit ball (bright, blooms), its cracks, and the chunks it breaks into
    const mm = new THREE.MeshBasicMaterial({ map: moonTex(), color: new THREE.Color(1.35, 1.32, 1.25), fog: false });
    this.moonBall = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), mm); this.moon.add(this.moonBall);
    this.moonCracks = new THREE.Mesh(new THREE.SphereGeometry(1.004, 48, 32), new THREE.MeshBasicMaterial({ map: crackTex(), transparent: true, color: new THREE.Color(2.2, 1.4, 0.7), fog: false, opacity: 0 }));
    this.moon.add(this.moonCracks);
    const r = rng(7);
    for (let i = 0; i < 70; i++) {
      const d = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), s = 0.12 + r() * 0.22;
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), mm); m.visible = false; this.moon.add(m);
      this.chunks.push({ m, d, s });
    }
    R.add(this.moon);
    // the rings: a huge banded ring around the Earth, seen from below as an arch across the sky
    const rg = new THREE.RingGeometry(285, 335, 180, 1);
    const pos = rg.attributes.position as THREE.BufferAttribute, uv = rg.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) { const rr = Math.hypot(pos.getX(i), pos.getY(i)); uv.setXY(i, (rr - 285) / 50, 0.5); }
    this.rings = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ map: ringTex(), transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, color: new THREE.Color(1.7, 1.6, 1.45), opacity: 0 }));
    this.rings.layers.set(NOINK); this.rings.renderOrder = -0.4; R.add(this.rings);
    this.clockCv.width = this.clockCv.height = 512; this.clockTex = new THREE.CanvasTexture(this.clockCv); this.clockTex.colorSpace = THREE.SRGBColorSpace;
    this.buildTown(R); this.buildRoom(R);
    this.sea = new THREE.Mesh(new THREE.PlaneGeometry(2400, 1200).rotateX(-Math.PI / 2).translate(0, 0, PROM1 + 600), lam("seaMoonM", () => ({ map: rep(seaTex(), 120, 60) })));
    this.sea.receiveShadow = true; R.add(this.sea);
    R.add(this.book); this.book.visible = false;
    this.quilt.position.set(BED[0], 0, BED[2]); this.quilt.visible = false; R.add(this.quilt);
  }

  private place(b: Batch, g: THREE.Object3D, p: V3, ry = 0) { g.position.set(...p); g.rotation.y = ry; g.updateMatrixWorld(true); b.addObject(g, new THREE.Matrix4()); }

  private buildTown(R: THREE.Object3D) {
    const b = new Batch(), kit = makeKit(), r = rng(5);
    const walk = lam("walkT", () => ({ map: stoneHD("walkHD", ["#e6dccb", "#ddd2bf", "#ece3d4", "#d6cab6"], "#b0a390") }));
    b.add(new THREE.PlaneGeometry(800, 400).rotateX(-Math.PI / 2).translate(0, -0.02, PROM0 - 200), lam("grassT", () => ({ map: rep(grassHD(), 160, 80) })));
    b.add(new THREE.PlaneGeometry(6, 100).rotateX(-Math.PI / 2).translate(0, 0, PROM0 - 50), lam("roadT", () => ({ map: rep(cobbleHD(), 2, 25) })));
    for (const s of [-1, 1]) b.add(boxGeo(V(s < 0 ? -5 : 3, -0.1, -80), V(s < 0 ? -3 : 5, WALK, PROM0), 2), walk);
    // houses both sides, the hero's door at z = 8 on the left
    for (const s of [-1, 1]) for (let k = 0; k < 7; k++) {
      const zc = 14 - k * 11;
      house(b, s * 14, zc, s < 0 ? Math.PI / 2 : -Math.PI / 2, 9, 8, [7, 8.4, 7.6][k % 3], (k * 2 + (s > 0 ? 1 : 0)) % 8, 0);
    }
    for (let z = 18; z > -64; z -= 12) for (const s of [-1, 1]) prop(b, kit, "lantern", s * 3.3, WALK, z + (s > 0 ? 6 : 0), 3.4);
    prop(b, kit, "stall-bench", BENCH[0] + 0.3, WALK, BENCH[2], 0.9, -Math.PI / 2);
    for (const [x, z] of [[4.4, 10], [-4.4, -14], [4.4, -26], [-4.4, -40]]) prop(b, kit, "tree_oak", x, WALK, z, 5);
    // promenade, railing with a gap at the steps, beach (sand) with umbrellas and deck chairs
    b.add(boxGeo(V(-60, -0.1, PROM0), V(60, WALK, PROM1)), walk);
    for (const s of [-1, 1]) b.add(boxGeo(V(s < 0 ? -60 : 1.2, WALK, PROM1 - 0.15), V(s < 0 ? -1.2 : 60, WALK + 0.9, PROM1)), lam("railW", () => ({ color: "#f2ead8" })));
    for (let k = 0; k < 4; k++) b.add(boxGeo(V(-1.2, WALK - 0.03 * (k + 1) * 3, PROM1 + k * 0.35), V(1.2, WALK - 0.03 * k * 3, PROM1 + (k + 1) * 0.35)), walk);
    b.add(new THREE.PlaneGeometry(400, SAND1 - PROM1).rotateX(-Math.PI / 2).translate(0, -0.25, (PROM1 + SAND1) / 2), lam("sandMoonM", () => ({ map: rep(sandTex(), 40, 4) })));
    const pole = lam("poleW", () => ({ color: "#f4f1ea" }));
    [[-7, 36, "#e2453c"], [5, 40, "#3f6fb5"], [-14, 44, "#f4c430"], [12, 34, "#3f9a5a"], [-2, 48, "#e85a8a"]].forEach(([x, z, c], i) => {
      b.add(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8).translate(x as number, 0.95, z as number), pole);
      b.add(new THREE.ConeGeometry(1.5, 0.6, 12, 1, true).translate(x as number, 2.25, z as number), lam("umbM" + i, () => ({ map: stripeTex("umbT" + c, c as string, "#fbf6ea", 12), side: THREE.DoubleSide })));
      b.add(boxGeo(V((x as number) + 0.6, -0.25, (z as number) + 0.6), V((x as number) + 1.3, 0.1, (z as number) + 2.2)), lam("chairM" + i, () => ({ map: stripeTex("chT" + c, c as string, "#ffffff", 6) })));
    });
    // the clock tower on the square
    const [tx, , tz] = TOWER, tw = 3;
    b.add(boxGeo(V(tx - tw, 0, tz - tw), V(tx + tw, 21, tz + tw), 3), lam("towerStoneM", () => ({ map: stoneHD("towerHDm", ["#d6c6a8", "#ccbc9e", "#e0d0b2", "#c4b496"], "#9a8a70") })));
    b.add(new THREE.ConeGeometry(4.6, 7, 4, 1).rotateY(Math.PI / 4).translate(tx, 24.5, tz), lam("towerRoofM", () => ({ color: "#3f6fb5" })));
    b.add(boxGeo(V(tx - 0.9, 0, tz + tw), V(tx + 0.9, 3.0, tz + tw + 0.12)), lam("towerDoorM", () => ({ color: "#5a3a24" })));
    b.add(new THREE.PlaneGeometry(4.6, 4.6).translate(tx, 15.5, tz + tw + 0.06), lam("clockFaceM", () => ({ map: this.clockTex })));
    for (let i = 0; i < 30; i++) prop(b, kit, i % 3 ? "tree_default" : "tree_cone", (i % 2 ? 1 : -1) * (24 + r() * 20), 0, 16 - i * 4, 8 + (i % 4));
    b.build(R);
    // boats (float on the sea, drift in with the flood)
    for (let k = 0; k < 3; k++) {
      const g = new THREE.Group(), hull = lam("boatHull" + k, () => ({ color: ["#d8352a", "#3f6fb5", "#f4f1ea"][k] }));
      const h = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 3.2), hull); h.position.y = 0.15; g.add(h);
      const bow = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.0, 4, 1).rotateX(Math.PI / 2).rotateZ(Math.PI / 4), hull); bow.scale.set(1, 0.45, 1); bow.position.set(0, 0.15, 2.1); g.add(bow);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 3.0, 8), lam("boatMast", () => ({ color: "#6e4a30" }))); mast.position.y = 1.6; g.add(mast);
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.0), lam("boatSail", () => ({ color: "#fbf6ea", side: THREE.DoubleSide }))); sail.position.set(0, 1.9, -0.6); sail.rotation.y = Math.PI / 2; g.add(sail);
      g.traverse((m) => { const q = m as THREE.Mesh; if (q.isMesh) { q.castShadow = true; q.receiveShadow = true; } });
      R.add(g); this.boats.push(g);
    }
  }

  private buildRoom(R: THREE.Object3D) {
    const b = new Batch(), o = ROOM;
    b.add(boxGeo(V(o[0] - 4, -0.2, -4), V(o[0] + 4, 0, 4)), lam("swFloorM", () => ({ map: rep(planksHD(), 2, 2) })));
    const wall = lam("roomWallM", () => ({ color: "#5a6a98" }));
    b.add(boxGeo(V(o[0] - 4, 0, -4.2), V(o[0] + 4, 3, -4)), wall); b.add(boxGeo(V(o[0] - 4.2, 0, -4.2), V(o[0] - 4, 3, 4)), wall);
    this.place(b, SP.bed(), BED);
    this.place(b, SP.nightstand(), [BED[0] - 1.0, 0, BED[2] - 0.7]);
    b.build(R);
    // the window full of a giant Moon (moonlight floods the room)
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.6), new THREE.MeshBasicMaterial({ map: ctex("moonWindow", 256, 300, (g) => {
      g.fillStyle = "#1e2c62"; g.fillRect(0, 0, 256, 300);
      g.fillStyle = "#f2eee2"; g.beginPath(); g.arc(150, 120, 110, 0, 7); g.fill();
      g.fillStyle = "rgba(150,150,160,0.5)"; g.beginPath(); g.ellipse(120, 100, 40, 30, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(180, 160, 30, 20, 0, 0, 7); g.fill();
      g.fillStyle = "#3a2a24"; g.fillRect(0, 0, 256, 14); g.fillRect(0, 286, 256, 14); g.fillRect(0, 0, 14, 300); g.fillRect(242, 0, 14, 300); g.fillRect(121, 0, 14, 300); g.fillRect(0, 143, 256, 14);
    }), color: new THREE.Color(1.3, 1.3, 1.3) }));
    win.position.set(o[0] + 0.6, 1.7, -3.98); R.add(win);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
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
    const i = shotIdx(f), s = S[i], t = f / FPS, { L, K } = NIGHT;
    const c = camAt(i, f), pos = V(...c.pos), look = V(...c.look);
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = THREE.MathUtils.clamp(pos.distanceTo(look) * 0.1, 0.05, 0.3); cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    // moonlight: the light comes from the Moon (over the sea) in the town, brighter as it grows
    const glow = nightGlow(t), ringsK = smooth((t - RINGS0()) / 2.0);
    const sunDir = s.look === "room" ? this.shotSun(i) : MOON_DIR.clone().setY(Math.max(0.3, MOON_DIR.y)).normalize();
    const lit = L.lit.map((v) => v * (1 + 0.55 * glow + 0.35 * ringsK)) as [number, number, number];
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI * (1 + glow);
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI * (1 + 0.6 * glow);
    const dist = pos.distanceTo(look), Rr = THREE.MathUtils.clamp(Math.min(dist, 30) * 1.15 + 6, 8, 45);
    const fc = dist > 60 ? pos.clone().addScaledVector(look.clone().sub(pos).normalize(), 20) : look;
    this.sun.position.copy(fc).addScaledVector(sunDir, 220); this.sun.target.position.copy(fc);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.sun.castShadow = s.look === "night";
    TONE.uLitCol.value.set(...lit); TONE.uShadeCol.value.set(...L.shade.map((v) => v * (1 + 0.6 * glow)) as [number, number, number]); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint.map((v) => Math.min(1.05, v * (1 + 0.25 * glow))) as [number, number, number]); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, k) => untone(new THREE.Color(h).lerp(new THREE.Color(BRIGHT_SKY[k]), glow * 0.8).lerp(new THREE.Color(RING_SKY[k]), ringsK * 0.7), su["c" + k].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position); this.stars.position.copy(cam.position);
    (this.stars.material as THREE.MeshBasicMaterial).opacity = 1 - 0.7 * glow;
    untone(new THREE.Color(L.fog).lerp(new THREE.Color("#4a5c90"), glow * 0.6), this.fog.color);
    const far = s.look === "room" ? 80 : 520;
    this.fog.near = far * 0.1; this.fog.far = far;
    scene.fog = this.fog; scene.background = null;
    // the Moon: far along MOON_DIR, size by moonK; cracks, chunks flying apart, gone
    const D = 800, k = moonK(t), rad = D * Math.tan(THREE.MathUtils.degToRad(0.8 * k)); // drawn ~3x larger than true scale so the change reads on a phone
    this.moon.position.copy(cam.position).addScaledVector(MOON_DIR, D);
    this.moon.lookAt(cam.position);
    const crack = smooth((t - CRACK0()) / 1.5), brk = clamp01((t - BREAK0()) / 2.2), gone = t > BREAK0() + 2.4;
    this.moonBall.visible = brk <= 0; this.moonBall.scale.setScalar(rad);
    this.moonCracks.visible = brk <= 0 && crack > 0; this.moonCracks.scale.setScalar(rad); (this.moonCracks.material as THREE.MeshBasicMaterial).opacity = crack;
    this.moonBall.rotation.y = 0.4;
    for (const ch of this.chunks) {
      ch.m.visible = brk > 0 && !gone;
      if (!ch.m.visible) continue;
      const spread = rad * (0.6 + 3.5 * brk * brk);
      const flat = ch.d.clone(); flat.z *= 1 - 0.85 * brk; flat.normalize();
      ch.m.position.copy(flat).multiplyScalar(spread * (0.5 + 0.5 * Math.abs(ch.d.y)));
      ch.m.scale.setScalar(rad * ch.s * (1 - 0.5 * brk)); ch.m.rotation.set(t * ch.s * 3, t * ch.s * 2, 0);
    }
    // the rings: an arch across the sky, fading in
    this.rings.visible = ringsK > 0.01;
    if (this.rings.visible) {
      // a vertical-ish ring 420 m out over the sea, centre far below the horizon: its top shows as an arch
      this.rings.position.set(cam.position.x - 30, cam.position.y - 150, cam.position.z + 380);
      this.rings.rotation.set(-0.32, 0.12, 0.08);
      (this.rings.material as THREE.MeshBasicMaterial).opacity = ringsK;
    }
    // the sea and the drifting boats
    const sy = seaY(t);
    this.sea.position.y = sy;
    this.boats.forEach((g, n) => {
      const inK = smooth((t - T("eight") - 0.3) / 2.5), bz = lerp(70 + n * 6, 30 + n * 4.5, inK), bx = [-8, 3, 12][n];
      g.position.set(bx, sy, bz); g.rotation.set(0.04 * Math.sin(t * 1.4 + n), 0.3 * n - 0.3, 0.05 * Math.sin(t * 1.1 + n));
    });
    // the clock tower: normal, then the hands race (shorter days)
    const race = clamp01((t - T("four", 3)) / 6), base = 11.97;
    const hours = base + race * race * 40 + (t - T("four", 3) > 0 ? (t - T("four", 3)) * 3 : 0);
    drawClock(this.clockCv.getContext("2d")!, (hours * Math.PI) / 6, ((hours % 1) * Math.PI * 2)); this.clockTex.needsUpdate = true;

    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const q = (f + seed * 37) % 64; return q < 4 ? [0.5, 1, 1, 0.5][q] : 0; };
    let ai = 0, fi = 0;
    const used: Actor[] = [], fused: Fx[] = [];
    const addFx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, atp: THREE.Vector3, w: number, h: number) => {
      const ef = this.fx(fi++);
      ef.r = this.pool.req(key, cw, ch, 1, draw); ef.use(false);
      ef.mesh.visible = true; ef.mesh.position.copy(atp); ef.mesh.quaternion.copy(cam.quaternion); ef.mesh.scale.set(w, h, 1);
      fused.push(ef); return ef;
    };
    const ground = (p: V3, w = 0.55) => {
      const ef = addFx("blob|contact|#2a2850", 128, 128, (pp) => fxContact(pp, "#2a2850"), V(p[0], p[1] + 0.02, p[2]), w, w * 0.7);
      ef.mesh.rotation.set(-Math.PI / 2, 0, 0);
    };
    this.book.visible = false; this.quilt.visible = false;
    const h = heroAt(t);
    if (h) {
      const w = V(...h.p), d = cam.position.distanceTo(w);
      const [cw, ch, kk] = d < 3.2 ? [1800, 3000, 3.0] : d < 7 ? [1080, 1800, 1.8] : d < 18 ? [480, 800, 0.8] : [240, 400, 0.4];
      const f2: FrontOpts = { ...h.fo, light: L2D, seed: 4 };
      if (f2.blink === undefined) f2.blink = lid(4);
      const a = this.actor(ai++);
      a.r = this.pool.req(`hero|${JSON.stringify(f2, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, kk, (pen) => bodyFront(pen, HERO, f2));
      a.mesh.visible = true; a.mesh.position.copy(w); a.mesh.castShadow = false;
      if (h.lie) { a.mesh.rotation.set(-Math.PI / 2, 0, 0); this.quilt.visible = true; }
      else { const yaw = Math.atan2(cam.position.x - w.x, cam.position.z - w.z); a.mesh.rotation.set(0, yaw, 0); if (!h.sit) ground(h.p); }
      a.mesh.scale.set(1, 1, 1);
      used.push(a);
      if (h.book) {
        // book between the hands: the sitting pose puts the chin lower (torso bottom 0.2 HH above the soles)
        const HH = 2 * 118 * 0.94, chin = (975 - 0.2 * HH) - 1.1 * HH, hy = (975 - (chin + HOLD_DY * HH)) * SU;
        const yaw = Math.atan2(cam.position.x - w.x, cam.position.z - w.z), n = V(Math.sin(yaw), 0, Math.cos(yaw));
        this.book.visible = true; this.book.position.copy(w).add(V(0, hy, 0)).addScaledVector(n, 0.07); this.book.rotation.set(-0.35, yaw, 0, "YXZ");
      }
    }
    for (let q = ai; q < this.actors.length; q++) this.actors[q].mesh.visible = false;
    for (let q = fi; q < this.fxs.length; q++) this.fxs[q].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return look;
  }
}
