// "What if everyone had a health bar": the hero's home (bedroom, kitchen with Dad and his coffee), a classroom with
// a very tired teacher, the school cafeteria (fries for a friend) and the hallway (the crush, the golden bar). Above
// every head floats a health bar (props.ts HealthBar); "+10" / "-5" pop up and fade. Every cut follows the narration.
import * as THREE from "three";
import { Batch, V, lam, boxGeo } from "../bridge/build";
import { rep, ctex, planksHD } from "../bridge/paint";
import { bodyFront, Outfit, Expr, FrontOpts, INK, fxContact, HOLD_DY } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx, SU } from "../bridge/cast";
import { cloudHD } from "../bridge/paint";
import * as P from "../future/props";
import * as H from "./props";
import { VOICE } from "./voice";

export const FPS = 30;
export type V3 = [number, number, number];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// ---------------- narration timing ----------------
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9-]/g, "");
export const wt = (w: string, n = 1) => {
  let k = 0;
  for (const x of VOICE.words) if (norm(x.w) === norm(w) && ++k === n) return x.t;
  throw new Error(`word not found: ${w} #${n}`);
};
export const wf = (w: string, n = 1) => Math.max(0, Math.round(wt(w, n) * FPS) - 2);
export const TOTAL = Math.ceil((VOICE.dur + 1.4) * FPS);
const T = (w: string, n = 1) => wt(w, n) - 0.07;

// ---------------- light ----------------
type Look = "home" | "school";
const PR = (l: Partial<LightPreset>, k: Partial<WorldLook>) => ({ L: { ...LIGHTS.day, ...l }, K: { ...LOOK.day, ...k } });
const PRESETS: Record<Look, { L: LightPreset; K: WorldLook }> = {
  home: PR({ lit: [1.55, 1.42, 1.25], shade: [0.36, 0.34, 0.42], lift: [0.07, 0.07, 0.11], fog: "#efe4d4", charTint: [1.0, 0.96, 0.92] }, {}),
  school: PR({ lit: [1.5, 1.44, 1.32], shade: [0.42, 0.42, 0.5], lift: [0.08, 0.08, 0.11], fog: "#e8e6e0", charTint: [1.0, 0.98, 0.95], hemiI: 0.6 }, {}),
};
const SUN_OF: Record<Look, [number, number]> = { home: [60, 50], school: [55, 55] };

// ---------------- layout ----------------
const BED: V3 = [-3.5, 0, -2.88];                  // bed centre; headboard toward -z (bed x -4.05 .. -2.95)
const STAND: V3 = [-4.5, 0, -3.6];
const BY_BED: V3 = [-2.4, 0, -1.4];
const STUB_Z = -2.4, STUB_X = -2.78;                // where his toe meets the side of the bed
const STOVE_MOM: V3 = [3.65, 0, -3.0];
const KTABLE: V3 = [1.5, 0, -1.9];                  // kitchen table; Dad sits behind it (toward -z) facing +z
const DAD_SEAT: V3 = [1.5, P.SEAT, -2.62];
const HERO_KITCHEN: V3 = [2.55, 0, -1.55];
const SOFA: V3 = [2.5, 0, 3.3];
const TV: V3 = [2.5, 0, 0.55];
const CTABLE: V3 = [2.5, 0, 2.2];
const CLASS: V3 = [3000, 0, 0];
const CAFE: V3 = [-3000, 0, 0];
const HALL: V3 = [6000, 0, 0];
const DESKS: V3[] = [];
for (const z of [-1.4, 0, 1.4]) for (const x of [-1.6, 0, 1.6]) DESKS.push(add3(CLASS, [x, 0, z]));
const HERO_DESK = 4;
const TEACHER: V3 = add3(CLASS, [0.35, 0, -3.3]);
const CAFE_HERO: V3 = add3(CAFE, [-0.35, P.SEAT, -0.62]);
const CAFE_FRIEND: V3 = add3(CAFE, [0.35, P.SEAT, -0.62]);
const HALL_HERO: V3 = add3(HALL, [1.6, 0, -2.0]);
const CRUSH: V3 = add3(HALL, [0.8, 0, -2.5]);

// ---------------- cast ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const MOM: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#e86a5a" };
const DAD: Outfit = { jacket: "#3f6fb5", pants: "#3a3e4a", boots: INK, hat: "hair", hair: "#3a2418", skin: HEAD, moustache: "#3a2418", build: "stout" };
const TEACH: Outfit = { jacket: "#5d7a3a", pants: "#3a3e4a", boots: INK, hat: "hair", hair: "#b0b0b8", skin: HEAD, moustache: "#9a9aa2", buttons: "#d8d8dc" };
const FRIEND: Outfit = { jacket: "#3fa08a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#6a3a1a", skin: HEAD };
const GIRL: Outfit = { jacket: "#f2a0b8", pants: "#3b3f52", boots: "#f4f1ea", hat: "hair", hair: "#3a2418", skin: HEAD, dress: "#e85a8a" };
const STUDENTS: Outfit[] = [
  { jacket: "#3f9a5a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#3a2418", skin: HEAD },
  { jacket: "#c25a7a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#d8a040", skin: HEAD, dress: "#d9a441" },
  { jacket: "#7b5ac9", pants: "#2e3a5a", boots: INK, hat: "cap", cap: "#e2453c", skin: HEAD },
  { jacket: "#2f8a9a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#5a8fc2" },
  { jacket: "#d84a3a", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#22180f", skin: HEAD },
  { jacket: "#f0b030", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#3f8a4a", skin: HEAD },
  { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#7a3a1a", skin: HEAD, dress: "#e85a8a" },
  { jacket: "#5d7a3a", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#b07a3a", skin: HEAD },
];
const HH = 2 * 118 * 0.94;
const handY = (o: Outfit, sit = false) => { const B = o.build === "stout" ? [1.15, 1.32] : [1.1, 1.4]; return ((sit ? 0.2 : B[1]) + B[0] - HOLD_DY) * HH * SU; };
/** top of the head above the card's base point (standing: sole; sitting: seat) */
const headTop = (o: Outfit, sit = false) => { const B = o.build === "stout" ? [1.15, 1.32] : [1.1, 1.4]; return ((sit ? 0.2 : B[1]) + B[0] + 1.0) * HH * SU + (o.hat === "beanie" ? 0.07 : 0.02); };
const MUG_DX = 30, FRY_DX = 32, OUT = 0.03;

// ---------------- the story by time ----------------
type Where = "bed" | "byBed" | "stub" | "kitchen" | "class" | "cafe" | "hall" | "bed2" | "byBed2";
const whereAt = (t: number): Where => {
  if (t < T("a", 1)) return "bed";
  if (t < T("rule", 1)) return "byBed";
  if (t < T("coffee")) return "stub";
  if (t < T("rule", 2)) return "kitchen";
  if (t < T("rule", 3)) return "class";
  if (t < T("and", 3)) return "cafe";
  if (t < T("monday", 3)) return "hall";
  if (t < T("full", 2)) return "bed2";
  return "byBed2";
};
const smoothTo = (t: number, steps: [number, number][], v0: number) => {
  let v = v0;
  for (const [at, to] of steps) { if (t < at) break; const k = clamp01((t - at) / 0.45); v = lerp(v, to, glide(k)); }
  return v;
};
/** health of each character by time */
const heroHP = (t: number) => {
  if (t >= T("monday", 3)) return smoothTo(t, [[T("toe", 2) + 0.05, 95]], 100);
  return smoothTo(t, [[T("toe", 1) + 0.05, 95], [T("plus", 1), 100], [T("rule", 2), 88], [T("rule", 3), 80], [T("fills"), 100]], 100);
};
const dadHP = (t: number) => smoothTo(t, [[T("drinks") + 0.05, 32], [T("drinks") + 0.4, 44], [T("four") + 0.15, 56], [T("four") + 0.55, 68]], 20);
const friendHP = (t: number) => smoothTo(t, [[T("plus", 2), 43]], 3);
type HeroPose = { p: V3; fo: FrontOpts; lie?: boolean; sit?: boolean; held?: "mug" | "fries" };
/** the hero walks to the side of the bed and stubs his toe at time tHit */
const stubWalk = (t: number, t0: number, tHit: number, x0: number, expr0: Expr): HeroPose => {
  if (t < t0) return { p: [x0, 0, STUB_Z], fo: { mode: "stand", expr: expr0, facing: -1, look: -0.5 } };
  if (t < tHit) { const k = (t - t0) / (tHit - t0); return { p: [lerp(x0, STUB_X, k), 0, STUB_Z], fo: { mode: "stroll", phase: t * 1.1, expr: expr0, facing: -1 } }; }
  const hop = t - tHit < 0.5 ? 0.04 * Math.abs(Math.sin((t - tHit) * 14)) : 0;
  return { p: [STUB_X + Math.min(0.12, (t - tHit) * 0.5), hop, STUB_Z], fo: { mode: "stand", expr: "pained", tilt: -6 } };
};
function heroAt(t: number): HeroPose {
  const w = whereAt(t);
  if (w === "bed" || w === "bed2") {
    const second = w === "bed2";
    const open = t >= (second ? T("eyes", 2) : T("eyes", 1)) - 0.15;
    return { p: [BED[0], 0.575, BED[2] - 0.7 + 1.78], fo: { mode: "stand", expr: open ? (second ? "grin" : "shock") : "smile_closed", blink: open ? undefined : 1, look: second ? 0 : -0.3 }, lie: true };
  }
  if (w === "byBed") return { p: BY_BED, fo: { mode: "stand", expr: t >= T("and", 2) ? "grin" : t >= T("full", 1) ? "relief_open" : "shock", look: t < T("full", 1) ? -0.3 : 0 } };
  if (w === "byBed2") return stubWalk(t, T("then") - 0.1, T("toe", 2), -2.2, "grin");
  if (w === "stub") return stubWalk(t, T("you", 3) - 1.0, T("toe", 1), -1.5, "smile");
  if (w === "kitchen") return { p: HERO_KITCHEN, fo: { mode: "stand", expr: t >= T("dad") ? "shock" : "grin", prop: "hold2", holdDx: MUG_DX, look: t >= T("dad") ? -0.6 : 0 }, held: "mug" };
  if (w === "class") {
    const d = DESKS[HERO_DESK];
    return { p: [d[0], P.SEAT, d[2] + 0.5], fo: { mode: "sit", expr: t >= T("on", 2) ? "nervous" : "neutral", look: t >= T("today") ? 0 : 0.2 }, sit: true };
  }
  if (w === "cafe") {
    const giving = t >= T("share") - 0.15 && t < T("plus", 2) - 0.1;
    return { p: CAFE_HERO, fo: { mode: "sit", expr: t >= T("plus", 2) ? "grin" : t >= T("his") ? "nervous" : "smile", look: 0.5, ...(giving ? { prop: "hold2" as const, holdDx: FRY_DX } : {}) }, sit: true, held: giving ? "fries" : undefined };
  }
  // hall: telling the joke, then the golden bar
  let expr: Expr = t >= T("your", 8) ? "grin" : "smile";
  if (t >= T("fills")) expr = "relief_open";
  return { p: HALL_HERO, fo: { mode: "stand", expr, facing: t < T("fills") ? -1 : 0, look: t < T("fills") ? -0.5 : 0 } };
}

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; look: Look; cInf: number; cam: (u: number, f: number) => Cam };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
const mvAt = (o: V3, p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => mv(add3(o, p0), add3(o, p1), add3(o, l0), add3(o, l1), fov, roll, ease);
const S: ShotDef[] = [];
export const SHOTS = S;
const shot = (a: number, look: Look, cInf: number, cam: (u: number, f: number) => Cam) => S.push({ a, look, cInf, cam });
const HEADBED: V3 = [BED[0], 0.6, BED[2] - 0.45];
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  const wake = (n: 1 | 2) => {
    shot(n === 1 ? 0 : E("monday", 3), "home", 6, mv([BED[0] - 0.3, 2.6, BED[2] + 0.4], [BED[0] - 0.28, 2.4, BED[2] + 0.3], [BED[0], 0.6, BED[2] - 0.3], [BED[0], 0.6, BED[2] - 0.3], 42, 0.02, true));
    shot(E("you", n === 1 ? 1 : 8), "home", 10, mv([BED[0] + 0.3, 1.6, BED[2] + 0.3], [BED[0] + 0.28, 1.5, BED[2] + 0.25], HEADBED, HEADBED, 40, -0.03));
  };
  wake(1);
  shot(E("and", 1), "home", 6, mv([BED[0] - 0.5, 2.9, BED[2] + 0.9], [BED[0] - 0.45, 2.8, BED[2] + 0.7], [BED[0], 0.85, BED[2] - 0.3], [BED[0], 0.85, BED[2] - 0.3], 44, 0.02, true));
  shot(E("a", 1), "home", 8, mv([-1.6, 1.4, 0.6], [-1.7, 1.45, 0.4], [-2.4, 1.5, -1.4], [-2.4, 1.6, -1.4], 42, -0.02));
  shot(E("full", 1), "home", 12, mv([-2.4, 1.75, -0.45], [-2.4, 1.78, -0.55], [-2.4, 1.85, -1.4], [-2.4, 1.87, -1.4], 36, 0.02));
  shot(E("everyone"), "home", 6, mv([3.8, 2.0, 1.6], [3.7, 1.95, 1.3], [2.6, 1.2, -2.6], [2.6, 1.2, -2.6], 52, 0, true));
  shot(E("and", 2), "home", 10, mv([-2.25, 1.6, -0.5], [-2.3, 1.58, -0.75], [-2.4, 1.6, -1.4], [-2.4, 1.6, -1.4], 38, 0.02));
  // rule one: the toe, the coffee, Dad
  shot(E("rule", 1), "home", 6, mv([-1.25, 1.6, -0.2], [-1.3, 1.6, -0.35], [-2.6, 1.0, -2.6], [-2.6, 1.0, -2.6], 44, 0, true));
  shot(E("stub", 1), "home", 10, mv([-2.3, 0.45, -1.55], [-2.32, 0.43, -1.6], [-2.9, 0.2, -2.4], [-2.9, 0.2, -2.4], 40, 0.03));
  shot(E("minus"), "home", 10, mv([-2.1, 1.7, -1.1], [-2.13, 1.7, -1.2], [-2.7, 1.65, -2.4], [-2.7, 1.67, -2.4], 40, -0.03));
  shot(E("coffee"), "home", 8, mv([3.2, 1.55, 0.4], [3.18, 1.55, 0.3], [2.55, 1.4, -1.55], [2.55, 1.42, -1.55], 44, 0.02));
  shot(E("dad"), "home", 8, mv([1.75, 1.5, -0.5], [1.73, 1.5, -0.6], [1.5, 1.15, -2.5], [1.5, 1.2, -2.5], 42, -0.02));
  // rule two: the tired teacher
  shot(E("rule", 2), "school", 0, mvAt(CLASS, [2.7, 2.3, -3.1], [2.5, 2.2, -2.9], [0, 0.8, 0.4], [0, 0.8, 0.4], 46, 0, true));
  shot(E("teacher"), "school", 12, mvAt(CLASS, [0.1, 1.6, -1.6], [0.12, 1.6, -1.7], [0.35, 1.5, -3.3], [0.35, 1.52, -3.3], 44, -0.02));
  shot(E("on", 2), "school", 10, mvAt(CLASS, [0.25, 1.4, -0.95], [0.23, 1.38, -0.85], [0, 1.25, 0.5], [0, 1.26, 0.5], 40, 0.02));
  shot(E("today"), "school", 4, mvAt(CLASS, [-1.2, 1.9, -3.0], [-1.0, 1.9, -2.9], [0.2, 0.9, 0.6], [0.2, 0.9, 0.6], 50, 0.02, true));
  // rule three: fries for a friend
  shot(E("rule", 3), "school", 0, mvAt(CAFE, [2.4, 2.0, 3.6], [2.2, 1.9, 3.2], [0, 0.9, -0.6], [0, 0.9, -0.6], 46, 0, true));
  shot(E("friend"), "school", 10, mvAt(CAFE, [0.5, 1.35, 0.7], [0.48, 1.35, 0.6], [0.35, 1.3, -0.62], [0.35, 1.31, -0.62], 38, 0.02));
  shot(E("his"), "school", 14, mvAt(CAFE, [0.38, 1.85, 0.05], [0.37, 1.86, 0.0], [0.35, 1.84, -0.62], [0.35, 1.84, -0.62], 36, -0.02));
  shot(E("share"), "school", 8, mvAt(CAFE, [0.0, 1.3, 1.35], [0.0, 1.3, 1.25], [0, 1.0, -0.62], [0, 1.0, -0.62], 46, 0.02));
  shot(E("plus", 2), "school", 10, mvAt(CAFE, [0.6, 1.45, 0.75], [0.58, 1.47, 0.68], [0.35, 1.45, -0.62], [0.35, 1.48, -0.62], 38, -0.03));
  // the last rule: the crush, the golden bar
  shot(E("and", 3), "school", 0, mvAt(HALL, [-0.9, 1.7, 2.2], [-0.75, 1.65, 1.8], [1.2, 1.1, -3.5], [1.2, 1.1, -3.5], 46, 0, true));
  shot(E("your", 8), "school", 12, mvAt(HALL, [1.2, 1.55, -1.2], [1.18, 1.55, -1.3], [0.8, 1.45, -2.5], [0.8, 1.47, -2.5], 38, 0.02));
  shot(E("your", 10), "school", 14, mvAt(HALL, [1.75, 2.0, -1.1], [1.74, 2.02, -1.18], [1.6, 1.98, -2.0], [1.6, 2.0, -2.0], 38, -0.02));
  shot(E("gold"), "school", 8, mvAt(HALL, [1.45, 1.85, -0.4], [1.47, 1.86, -0.5], [1.6, 1.75, -2.0], [1.6, 1.77, -2.0], 42, 0.02));
  // next Monday: wake up, full health, the toe again
  wake(2);
  shot(E("full", 2), "home", 10, mv([-1.4, 1.6, -0.9], [-1.5, 1.6, -1.0], [-2.3, 1.4, -2.4], [-2.3, 1.42, -2.4], 40, 0.02));
  shot(E("then"), "home", 10, mv([-2.3, 0.45, -1.55], [-2.32, 0.43, -1.6], [-2.85, 0.2, -2.4], [-2.85, 0.2, -2.4], 40, -0.03));
  shot(E("again"), "home", 10, mv([-2.1, 1.7, -1.1], [-2.13, 1.7, -1.2], [-2.7, 1.65, -2.4], [-2.7, 1.67, -2.4], 40, 0.03));
};
let built = false;
const ensure = () => { if (!built) { built = true; build(); S.sort((a, b) => a.a - b.a); } };
export const shotIdx = (f: number) => { ensure(); let i = 0; while (i + 1 < S.length && f >= S[i + 1].a) i++; return i; };
const shotEnd = (i: number) => (i + 1 < S.length ? S[i + 1].a : TOTAL);
export const camAt = (i: number, f: number): Cam => {
  ensure();
  const s = S[i], b = shotEnd(i), u = clamp01((f - s.a) / Math.max(1, b - s.a)), c = s.cam(u, f);
  const k = 0.0025 * Math.max(0, f - s.a);
  return { ...c, pos: lerp3(c.pos, c.look, Math.min(0.12, k * 0.3)) };
};
export const dofAt = (f: number) => { ensure(); return { cInf: S[shotIdx(f)].cInf }; };

// ---------------- painted walls / windows ----------------
const wallpaper = () => ctex("wallpaper", 512, 512, (g, r) => {
  g.fillStyle = "#e8dcc4"; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = "rgba(200,170,130,0.35)"; g.fillRect(x, 0, 22, 512); }
  for (let i = 0; i < 200; i++) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(r() * 512, r() * 512, 6, 2); }
});
const skyWin = (night = false) => ctex(night ? "skyWindowN" : "skyWindow", 256, 320, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 320);
  gr.addColorStop(0, night ? "#1a1a4a" : "#8cbcea"); gr.addColorStop(1, night ? "#3a3a6a" : "#dcecf8");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 320);
  if (night) { g.fillStyle = "#f4f0d0"; g.beginPath(); g.arc(80, 80, 22, 0, 7); g.fill(); g.fillStyle = "#ffffff"; for (const [x, y] of [[170, 60], [200, 120], [60, 170], [190, 200]]) g.fillRect(x, y, 4, 4); }
  else { g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(80, 90, 50, 20, 0, 0, 7); g.ellipse(120, 80, 40, 24, 0, 0, 7); g.fill(); }
  g.fillStyle = night ? "#22301e" : "#6a9a4a"; g.fillRect(0, 260, 256, 60);
  g.fillStyle = "#f2ead8"; g.fillRect(0, 0, 256, 14); g.fillRect(0, 306, 256, 14); g.fillRect(0, 0, 14, 320); g.fillRect(242, 0, 14, 320); g.fillRect(121, 0, 14, 320); g.fillRect(0, 153, 256, 14);
});
const pictureTex = () => ctex("homePicture", 256, 200, (g) => {
  g.fillStyle = "#c8a868"; g.fillRect(0, 0, 256, 200); g.fillStyle = "#9cc8f0"; g.fillRect(14, 14, 228, 172);
  g.fillStyle = "#6aa84a"; g.beginPath(); g.moveTo(14, 186); g.lineTo(90, 90); g.lineTo(150, 150); g.lineTo(190, 110); g.lineTo(242, 186); g.fill();
  g.fillStyle = "#f4d26a"; g.beginPath(); g.arc(196, 52, 18, 0, 7); g.fill();
});
const lockerTex = () => ctex("lockers", 512, 512, (g) => {
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
const schoolWall = () => ctex("schoolWall", 512, 512, (g, r) => {
  g.fillStyle = "#efe6cf"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#cdb98a"; g.fillRect(0, 420, 512, 92);
  for (let i = 0; i < 80; i++) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(r() * 512, r() * 420, 8, 2); }
});
const schoolFloor = () => ctex("schoolFloor", 512, 512, (g) => {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? "#e6e2d8" : "#c8c2b4"; g.fillRect(x * 64, y * 64, 64, 64); }
});
const hallWindow = () => ctex("schoolWindow", 512, 400, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, "#9cc8f0"); gr.addColorStop(1, "#e4f0fa"); g.fillStyle = gr; g.fillRect(0, 0, 512, 400);
  g.fillStyle = "#6aa84a"; g.fillRect(0, 300, 512, 100);
  g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(140, 90, 70, 26, 0, 0, 7); g.ellipse(200, 80, 50, 30, 0, 0, 7); g.fill();
  g.fillStyle = "#e8e6e0"; for (const x of [0, 168, 336, 496]) g.fillRect(x, 0, 16, 400); g.fillRect(0, 0, 512, 14); g.fillRect(0, 386, 512, 14); g.fillRect(0, 196, 512, 12);
});
const wallClockTex = () => ctex("classClock", 256, 256, (g) => {
  const c = 128; g.fillStyle = "#f8f6f0"; g.strokeStyle = "#241726"; g.lineWidth = 14; g.beginPath(); g.arc(c, c, 116, 0, 7); g.fill(); g.stroke();
  g.lineCap = "round"; for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; g.lineWidth = 6; g.beginPath(); g.moveTo(c + 88 * Math.sin(a), c - 88 * Math.cos(a)); g.lineTo(c + 102 * Math.sin(a), c - 102 * Math.cos(a)); g.stroke(); }
  g.lineWidth = 10; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 50 * Math.sin(5.24), c - 50 * Math.cos(5.24)); g.stroke();
  g.lineWidth = 7; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 80 * Math.sin(1.57), c - 80 * Math.cos(1.57)); g.stroke();
});


const cafeWall = () => ctex("cafeWall", 512, 512, (g, r) => {
  g.fillStyle = "#f2e2b8"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#e8a05a"; g.fillRect(0, 400, 512, 112); g.fillStyle = "#c8804a"; g.fillRect(0, 396, 512, 8);
  for (let i = 0; i < 80; i++) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(r() * 512, r() * 400, 8, 2); }
});
const menuTex = () => ctex("cafeMenu", 512, 300, (g) => {
  g.fillStyle = "#2a3a5a"; g.fillRect(0, 0, 512, 300); g.strokeStyle = "#f4c430"; g.lineWidth = 12; g.strokeRect(6, 6, 500, 288);
  g.fillStyle = "#f4c430"; g.font = `800 56px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.fillText("LUNCH", 256, 76);
  g.fillStyle = "#ffffff"; g.font = `600 34px "DejaVu Sans", sans-serif`; ["Pizza  $2", "Fries  $1", "Salad  $2"].forEach((s, k) => g.fillText(s, 256, 140 + k * 50));
});

// ---------------- the world ----------------
export class HealthWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#efe4d4", 60, 600);
  private clouds: THREE.Mesh[] = [];
  private sunCache = new Map<number, THREE.Vector3>();
  private quilt = P.quilt(-0.18, 1.0);
  private clock = P.alarmClock();
  private mug = H.mug("#f27a2a");
  private dadMug = H.mug();
  private fries = H.fries();
  private bars: H.HealthBar[] = [];
  private pops = new Map<string, H.Pop>();
  private winDay!: THREE.Mesh;

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
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cm[i % 4], color: new THREE.Color(1.05, 1.05, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.layers.set(NOINK); this.clouds.push(m); R.add(m);
    }
    this.buildHome(R); this.buildCafe(R); this.buildClass(R); this.buildHall(R);
    for (const m of [this.mug, this.dadMug, this.fries]) { m.visible = false; R.add(m); }
  }

  private place(b: Batch, g: THREE.Object3D, p: V3, ry = 0) { g.position.set(...p); g.rotation.y = ry; g.updateMatrixWorld(true); b.addObject(g, new THREE.Matrix4()); }

  private buildHome(R: THREE.Object3D) {
    const b = new Batch(), wall = lam("swWallpaper", () => ({ map: rep(wallpaper(), 3, 1) }));
    b.add(boxGeo(V(-6.2, -0.2, -4.2), V(6.2, 0, 4.4)), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })));
    b.add(boxGeo(V(-6.2, 0, -4.12), V(6.2, 3.0, -4.0)), wall);
    b.add(boxGeo(V(-6.4, 3.0, -4.2), V(6.4, 3.12, 4.4), 0, true), lam("ceilM", () => ({ color: "#f4f1ea" })));
    b.add(boxGeo(V(-6.2, 0, 4.2), V(6.2, 3.0, 4.32)), wall);
    b.add(boxGeo(V(-6.4, 0, -4.2), V(-6.2, 3.0, 4.4)), wall);
    b.add(boxGeo(V(6.2, 0, -4.2), V(6.4, 3.0, 4.4)), wall);
    for (const [x, y, z, ry, w, h] of [[-5.0, 1.6, -3.99, 0, 1.1, 1.4], [6.19, 1.6, 1.0, -Math.PI / 2, 1.1, 1.4], [1.0, 1.6, -3.99, 0, 1.1, 1.3]] as number[][]) {
      const day = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) }));
      day.position.set(x, y, z); day.rotation.y = ry; R.add(day); this.winDay = day;
    }
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), lam("homePicM", () => ({ map: pictureTex() })));
    pic.position.set(2.5, 1.75, 4.13); pic.rotation.y = Math.PI; R.add(pic);
    const dw = P.doorWall(8.6, 3.0, wall); dw.position.set(-1, 0, 0.1); dw.rotation.y = Math.PI / 2; dw.updateMatrixWorld(true); b.addObject(dw, new THREE.Matrix4());
    this.place(b, P.bed(), BED);
    this.place(b, P.nightstand(), STAND);
    this.place(b, P.kitchen(), [3.5, 0, -3.7]);
    this.place(b, P.sofa(), SOFA, Math.PI);
    const t = P.tv(); this.place(b, t.g, TV); t.scr.color.setScalar(0.12);
    this.place(b, P.coffeeTable(), CTABLE);
    b.add(boxGeo(V(1.2, 0.0, 1.0), V(3.8, 0.012, 3.0)), lam("fuRug", () => ({ color: "#5a8fc2" })));
    // kitchen table with Dad's chair, three empty mugs already in front of him
    this.place(b, H.table(), KTABLE);
    this.place(b, H.chair(), [DAD_SEAT[0], 0, DAD_SEAT[2] + 0.02]);
    this.place(b, H.chair(), [KTABLE[0] + 0.85, 0, KTABLE[2]], -Math.PI / 2);
    for (const [dx, dz, c] of [[-0.42, 0.05, "#e86a5a"], [-0.3, 0.2, "#5a8fc2"], [0.36, 0.12, "#f4c430"]] as [number, number, string][]) this.place(b, H.mug(c), [KTABLE[0] + dx, 0.76, KTABLE[2] + dz], 0.6);
    b.build(R);
    t.s.position.add(V(...TV)); R.add(t.s);
    this.clock.position.set(-4.62, 0.55, -3.66); this.clock.rotation.y = 0.5; R.add(this.clock);
    this.quilt.position.set(BED[0], 0, BED[2]); R.add(this.quilt);
  }

  private buildCafe(R: THREE.Object3D) {
    const b = new Batch(), o = CAFE, wall = lam("cafeWallM", () => ({ map: rep(cafeWall(), 4, 1) }));
    b.add(boxGeo(V(o[0] - 7, -0.2, -6), V(o[0] + 7, 0, 6)), lam("schoolFloorM2", () => ({ map: rep(schoolFloor(), 4, 4) })));
    b.add(boxGeo(V(o[0] - 7, 0, -6.12), V(o[0] + 7, 3.4, -6)), wall);
    b.add(boxGeo(V(o[0] - 7, 0, 6), V(o[0] + 7, 3.4, 6.12)), wall);
    b.add(boxGeo(V(o[0] - 7.12, 0, -6), V(o[0] - 7, 3.4, 6)), wall);
    b.add(boxGeo(V(o[0] + 7, 0, -6), V(o[0] + 7.12, 3.4, 6)), wall);
    b.add(boxGeo(V(o[0] - 7, 3.4, -6), V(o[0] + 7, 3.55, 6), 0, true), lam("ceilM", () => ({ color: "#f4f1ea" })));
    for (const [x, z] of [[0, 0], [0, -3.2], [-3.4, 0], [-3.4, -3.2], [3.4, 0], [3.4, -3.2], [0, 3.0], [-3.4, 3.0]] as [number, number][]) this.place(b, H.cafeTable(), add3(o, [x, 0, z]));
    this.place(b, H.counter(), add3(o, [2.8, 0, -5.4]));
    for (const [dx, dz, c] of [[-0.35, -0.2, "#e86a5a"], [0.35, -0.2, "#5a8fc2"], [-3.6, -0.2, "#f4c430"], [3.2, -3.4, "#6cb848"], [-0.6, -3.0, "#e86a5a"]] as [number, number, string][]) this.place(b, H.tray(c), add3(o, [dx, 0.74, dz]));
    b.build(R);
    for (const x of [-4.5, 0, 4.5]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.4), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) })); w.position.set(o[0] + x, 1.9, 5.99); w.rotation.y = Math.PI; R.add(w); }
    const menu = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.82), lam("cafeMenuM", () => ({ map: menuTex() }))); menu.position.set(o[0] + 2.8, 2.3, -5.93); R.add(menu);
    for (let z = -4.5; z < 6; z += 3) for (const x of [-3.4, 0, 3.4]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.75, 1.6) })); l.position.set(o[0] + x, 3.38, z); R.add(l); }
  }

  private buildClass(R: THREE.Object3D) {
    const b = new Batch(), o = CLASS, wall = lam("hClassWall", () => ({ map: rep(schoolWall(), 3, 1) }));
    b.add(boxGeo(V(o[0] - 4.2, -0.2, -4.2), V(o[0] + 4.2, 0, 4.2)), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })));
    b.add(boxGeo(V(o[0] - 4.2, 0, -4.12), V(o[0] + 4.2, 3.2, -4.0)), wall);
    b.add(boxGeo(V(o[0] - 4.2, 0, 4.0), V(o[0] + 4.2, 3.2, 4.12)), wall);
    b.add(boxGeo(V(o[0] - 4.32, 0, -4.2), V(o[0] - 4.2, 3.2, 4.2)), wall);
    b.add(boxGeo(V(o[0] + 4.2, 0, -4.2), V(o[0] + 4.32, 3.2, 4.2)), wall);
    b.add(boxGeo(V(o[0] - 4.2, 3.2, -4.2), V(o[0] + 4.2, 3.35, 4.2), 0, true), lam("ceilM", () => ({ color: "#f4f1ea" })));
    for (const z of [-2.2, 0.4, 3.0]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.5), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) })); w.position.set(o[0] - 4.19, 1.7, z); w.rotation.y = Math.PI / 2; R.add(w); }
    this.place(b, H.blackboard(), add3(o, [0, 0, -3.97]));
    this.place(b, P.teacherDesk(), add3(o, [-1.9, 0, -2.7]));
    DESKS.forEach((d) => this.place(b, P.deskChair(), d));
    b.build(R);
    const clk = new THREE.Mesh(new THREE.CircleGeometry(0.22, 32), lam("classClockM", () => ({ map: wallClockTex() })));
    clk.position.set(o[0] + 2.4, 2.55, -3.99); R.add(clk);
    for (let z = -3; z < 4; z += 2.4) for (const x of [-1.6, 1.6]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.75, 1.6) })); l.position.set(o[0] + x, 3.18, z); R.add(l); }
  }

  private buildHall(R: THREE.Object3D) {
    const b = new Batch(), o = HALL, HW = 2.6, H = 3.2, Z0 = -30, Z1 = 6;
    const X = (x: number) => o[0] + x;
    b.add(boxGeo(V(X(-HW), -0.2, Z0), V(X(HW), 0, Z1)), lam("schoolFloorM", () => ({ map: rep(schoolFloor(), 3, 22) })));
    b.add(boxGeo(V(X(-HW), H, Z0), V(X(HW), H + 0.2, Z1), 0, true), lam("ceilM", () => ({ color: "#f4f1ea" })));
    const wall = lam("schoolWallM", () => ({ map: rep(schoolWall(), 6, 1) }));
    for (const s of [-1, 1]) b.add(boxGeo(V(X(s < 0 ? -HW - 0.2 : HW), 0, Z0), V(X(s < 0 ? -HW : HW + 0.2), H, Z1)), wall);
    b.add(boxGeo(V(X(-HW), 0, Z0 - 0.2), V(X(HW), H, Z0)), wall);
    b.add(boxGeo(V(X(-HW), 0, Z1), V(X(HW), H, Z1 + 0.2)), wall);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.2), new THREE.MeshBasicMaterial({ map: hallWindow(), color: new THREE.Color(1.15, 1.15, 1.15) }));
    win.position.set(X(0), 1.7, Z0 + 0.02); R.add(win);
    const lockM = lam("lockerM", () => ({ map: lockerTex() })), lockTop = lam("lockerTop", () => ({ color: "#2e4a7a" }));
    for (const s of [-1, 1]) for (let z = Z1 - 1.0; z > Z0 + 1; z -= 1.6) {
      if (s < 0 && z < -8 && z > -11) continue;
      const x0 = s < 0 ? X(-HW) : X(HW - 0.42), x1 = s < 0 ? X(-HW + 0.42) : X(HW);
      b.add(boxGeo(V(x0, 0.1, z - 1.6), V(x1, 1.95, z)), lockM);
      b.add(boxGeo(V(x0, 1.95, z - 1.6), V(x1, 2.0, z)), lockTop);
    }
    b.add(boxGeo(V(X(-HW), 0, -10.5), V(X(-HW + 0.05), 2.2, -9.5)), lam("classDoor", () => ({ color: "#a8724a" })));
    b.add(boxGeo(V(X(-HW + 0.05), 1.3, -10.25), V(X(-HW + 0.07), 1.9, -9.75)), lam("doorGlass", () => ({ color: "#bcd8ec" })));
    for (let z = Z1 - 2; z > Z0; z -= 3.2) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.75, 1.6) })); l.position.set(X(0), H - 0.02, z); R.add(l); }
    b.build(R);
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
    const i = shotIdx(f), s = S[i], t = f / FPS, { L, K } = PRESETS[s.look];
    const c = camAt(i, f), pos = V(...c.pos), look = V(...c.look);
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = THREE.MathUtils.clamp(pos.distanceTo(look) * 0.1, 0.02, 0.3); cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const sunDir = this.shotSun(i), dist = pos.distanceTo(look);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 6, 8, 50);
    this.sun.position.copy(look).addScaledVector(sunDir, 220); this.sun.target.position.copy(look);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.sun.castShadow = false;
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
    const far = 120;
    this.fog.near = far * 0.1; this.fog.far = far;
    scene.fog = this.fog; scene.background = null;
    this.clouds.forEach((m, k) => {
      const a = (k / 12) * Math.PI * 2 + 0.3, d = 560 + (k % 3) * 70, w = 140 + (k % 4) * 34;
      m.visible = false;
      m.position.set(cam.position.x + Math.cos(a) * d, 60 + (k % 4) * 34, cam.position.z + Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
    });
    const where = whereAt(t);
    this.quilt.visible = where === "bed" || where === "bed2";
    void this.winDay;

    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const k = (f + seed * 37) % 64; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
    let ai = 0, fi = 0;
    const used: Actor[] = [], fused: Fx[] = [];
    const ground = (p: V3, w = 0.55) => {
      const ef = this.fx(fi++);
      ef.r = this.pool.req("blob|contact|#4a4470", 128, 128, 1, (pp) => fxContact(pp, "#4a4470")); ef.use(false);
      ef.mesh.visible = true; ef.mesh.position.set(p[0], p[1] + 0.02, p[2]); ef.mesh.rotation.set(-Math.PI / 2, 0, 0); ef.mesh.scale.set(w, w * 0.7, 1);
      fused.push(ef);
    };
    const person = (key: string, p: V3, o: Outfit, fo: FrontOpts, seed: number, opt: { lie?: boolean; sit?: boolean } = {}) => {
      const w = V(...p), d = cam.position.distanceTo(w);
      if (d > 80) return null;
      const [cw, ch, k] = d < 3.2 ? [1800, 3000, 3.0] : d < 7 ? [1080, 1800, 1.8] : d < 18 ? [480, 800, 0.8] : [240, 400, 0.4];
      const f2: FrontOpts = { ...fo, light: L2D, seed };
      if (f2.blink === undefined) f2.blink = lid(seed);
      const a = this.actor(ai++);
      a.r = this.pool.req(`${key}|${JSON.stringify(o)}|F|${JSON.stringify(f2, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, k, (pen) => bodyFront(pen, o, f2));
      a.mesh.visible = true; a.mesh.position.copy(w); a.mesh.castShadow = false; a.mesh.scale.set(1, 1, 1);
      const yaw = Math.atan2(cam.position.x - w.x, cam.position.z - w.z);
      if (opt.lie) a.mesh.rotation.set(-Math.PI / 2, 0, 0);
      else a.mesh.rotation.set(0, yaw, 0);
      used.push(a);
      if (!opt.lie && !opt.sit) ground(p);
      return yaw;
    };
    const h = heroAt(t);
    const people: { p: V3; o: Outfit; hp: number; sit?: boolean; lie?: boolean; gold?: boolean }[] = [];
    const hold = (obj: THREE.Object3D, p: V3, o: Outfit, sit: boolean | undefined, yaw: number | null | undefined, lift = 0) => {
      if (yaw === null || yaw === undefined) return;
      const n = V(Math.sin(yaw), 0, Math.cos(yaw));
      obj.visible = true; obj.position.copy(V(...p)).add(V(0, handY(o, sit) - 0.04 + lift, 0)).addScaledVector(n, OUT); obj.rotation.set(0, yaw, 0);
    };
    this.mug.visible = false; this.dadMug.visible = false; this.fries.visible = false;
    const hy = person("hero", h.p, HERO, h.fo, 4, { lie: h.lie, sit: h.sit });
    if (h.held === "mug") hold(this.mug, h.p, HERO, false, hy);
    if (h.held === "fries") hold(this.fries, h.p, HERO, true, hy);
    const gold = where === "hall" && t >= T("turns") - 0.1;
    if (!(where === "bed2" && t < T("eyes", 2) - 0.15)) people.push({ p: h.p, o: HERO, hp: heroHP(t), sit: h.sit, lie: h.lie, gold });
    if (where === "kitchen" || where === "byBed" || where === "stub") {
      const sipping = t >= T("drinks") - 0.1;
      const dy = person("dad", DAD_SEAT, DAD, { mode: "sit", expr: t >= T("four") + 0.2 ? "laugh" : sipping ? "grin" : "dazed", prop: "hold2", holdDx: MUG_DX }, 22, { sit: true });
      hold(this.dadMug, DAD_SEAT, DAD, true, dy, sipping ? 0.06 * Math.max(0, Math.sin((t - T("drinks")) * 6)) : 0);
      person("mom", STOVE_MOM, MOM, { mode: "stand", expr: "smile", look: -0.4 }, 21);
      people.push({ p: DAD_SEAT, o: DAD, hp: dadHP(t), sit: true }, { p: STOVE_MOM, o: MOM, hp: 81 });
    }
    if (where === "class") {
      const quiet = t >= T("today") - 0.1;
      DESKS.forEach((d, k) => {
        if (k === HERO_DESK) return;
        const o = STUDENTS[k % STUDENTS.length], p: V3 = [d[0], P.SEAT, d[2] + 0.5];
        person("pupil" + k, p, o, { mode: "sit", expr: quiet ? (k % 2 ? "nervous" : "neutral") : k % 3 ? "neutral" : "smile", look: 0 }, 10 + k, { sit: true });
        people.push({ p, o, hp: [74, 91, 66, 83, 0, 58, 95, 70, 88][k], sit: true });
      });
      person("teacher", TEACHER, TEACH, { mode: "stand", expr: "neutral", blink: 0.6, tilt: 4 }, 30);
      people.push({ p: TEACHER, o: TEACH, hp: 12 });
    }
    if (where === "cafe") {
      const fine = t >= T("fine") - 0.4 && t < T("his");
      person("friend", CAFE_FRIEND, FRIEND, { mode: "sit", expr: t >= T("plus", 2) ? "laugh" : fine ? "smile" : "dazed", look: -0.4 }, 31, { sit: true });
      people.push({ p: CAFE_FRIEND, o: FRIEND, hp: friendHP(t), sit: true });
      if (t >= T("plus", 2) - 0.1) { this.fries.visible = true; this.fries.position.set(CAFE_FRIEND[0], 0.74, CAFE_FRIEND[2] + 0.42); this.fries.rotation.set(0, 0, 0); }
      for (const [k, x, z] of [[0, -3.7, -0.62], [1, -3.0, -0.62], [2, 3.1, -3.82], [3, 3.8, -3.82], [5, -0.3, -2.58]] as [number, number, number][]) {
        const p = add3(CAFE, [x, P.SEAT, z]), o = STUDENTS[k];
        person("eat" + k, p, o, { mode: "sit", expr: k % 2 ? "smile" : "laugh", facing: k % 2 ? 1 : -1, look: k % 2 ? 0.7 : -0.7 }, 50 + k, { sit: true });
        people.push({ p, o, hp: [77, 64, 90, 52, 0, 85][k], sit: true });
      }
    }
    if (where === "hall") {
      const laugh = t >= T("laughs") - 0.1;
      person("crush", CRUSH, GIRL, { mode: "stand", expr: laugh ? "laugh" : "smile", facing: 1, look: 0.5 }, 33);
      people.push({ p: CRUSH, o: GIRL, hp: 92 });
      for (const [k, x, z] of [[0, -1.9, -11], [3, -1.2, -11.6], [5, 1.9, -15]] as [number, number, number][]) {
        const p = add3(HALL, [x, 0, z]), o = STUDENTS[k];
        person("hall" + k, p, o, { mode: "stand", expr: "smile", facing: k === 5 ? 0 : k ? -1 : 1 }, 40 + k);
        people.push({ p, o, hp: [70, 0, 0, 84, 0, 61][k] });
      }
    }
    // ---- health bars: appear at "there it is", float above every head, face the lens ----
    const showBars = t >= T("there") - 0.1;
    let bi = 0;
    for (const q of showBars ? people : []) {
      const top = q.lie ? null : q.p[1] + headTop(q.o, q.sit) + 0.17;
      const pos = q.lie ? V(q.p[0], q.p[1] + 0.55, q.p[2] - 1.55) : V(q.p[0], top!, q.p[2]);
      if (cam.position.distanceTo(pos) > 14) continue;
      while (this.bars.length <= bi) { const nb = new H.HealthBar(); this.bars.push(nb); this.root.add(nb.root); }
      const bar = this.bars[bi++], grow = clamp01((t - T("there") + 0.1) / 0.3);
      bar.draw(q.hp, q.gold); bar.root.visible = true; bar.root.position.copy(pos); bar.root.quaternion.copy(cam.quaternion);
      bar.root.scale.setScalar(glide(grow) * (q.gold ? 1 + 0.04 * Math.sin(t * 8) : 1));
    }
    for (let k = bi; k < this.bars.length; k++) this.bars[k].root.visible = false;
    // ---- floating numbers ----
    const popAt = (key: string, text: string, at: number, base: THREE.Vector3, life = 2.0) => {
      let pp = this.pops.get(key);
      if (!pp) { pp = new H.Pop(text); this.pops.set(key, pp); this.root.add(pp.root); }
      const k = (t - at) / life;
      pp.root.visible = k >= 0 && k < 1;
      if (!pp.root.visible) return;
      // project the spot beside the head onto the screen, keep it inside the safe area, float it 1.2 m from the lens
      pp.set(k);
      const side = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
      const ndc = base.clone().addScaledVector(side, 0.26).add(V(0, -0.2, 0)).project(cam);
      if (ndc.z > 1 || base.distanceTo(cam.position) > 30) { pp.root.visible = false; return; }
      const x = THREE.MathUtils.clamp(ndc.x, -0.5, 0.5), y = THREE.MathUtils.clamp(ndc.y, -0.15, 0.55) + 0.12 * glide(Math.min(1, k * 2));
      const dir = V(x, y, 0.5).unproject(cam).sub(cam.position).normalize();
      pp.root.position.copy(cam.position).addScaledVector(dir, 1.2); pp.root.quaternion.copy(cam.quaternion);
      pp.root.scale.setScalar(0.5 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) / Math.tan(THREE.MathUtils.degToRad(20)));
    };
    const over = (p: V3, o: Outfit, sit = false) => V(p[0], p[1] + headTop(o, sit) + 0.17, p[2]);
    const hp0 = heroAt(T("toe", 1) + 0.2).p, hp1 = heroAt(T("toe", 2) + 0.2).p;
    popAt("toe1", "-5", T("toe", 1) + 0.05, over(hp0, HERO), 2.4);
    popAt("toe2", "-5", T("toe", 2) + 0.05, over(hp1, HERO), 3.0);
    popAt("coffee", "+10", T("plus", 1) - 0.05, over(HERO_KITCHEN, HERO));
    [T("drinks") + 0.05, T("drinks") + 0.4, T("four") + 0.15, T("four") + 0.55].forEach((a, k) => popAt("dad" + k, "+10", a, over(DAD_SEAT, DAD, true).add(V(0, 0.06 * k, 0)), k === 3 ? 1.6 : 0.42));
    popAt("fries", "+40", T("plus", 2) - 0.05, over(CAFE_FRIEND, FRIEND, true));
    const near = (p: V3) => Math.abs(p[0] - cam.position.x) < 500;
    void near;
    for (let k = ai; k < this.actors.length; k++) this.actors[k].mesh.visible = false;
    for (let k = fi; k < this.fxs.length; k++) this.fxs[k].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return look;
  }
}
