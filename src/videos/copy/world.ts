// "What if you met your exact copy": the hero's home (kitchen with the cereal, the table, the stairs with socks),
// a school gym and a classroom for detention. The copy is the same card as the hero (same outfit, same head); props
// are our own 3D models (props.ts). Every cut follows the narration (voice.ts).
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
import * as H from "../health/props";
import * as C from "./props";
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
const KTABLE: V3 = [1.5, 0, -1.9];                  // kitchen table (top 0.76); chairs behind it (toward -z) face +z
const SEAT_A: V3 = [1.05, P.SEAT, -2.62];            // the copy's chair (the hero sits here in the last scenes too)
const SEAT_B: V3 = [1.95, P.SEAT, -2.62];
const STOVE_MOM: V3 = [3.65, 0, -3.0];
const DOOR_IN = (k: number): V3 => [lerp(3.4, 1.9, k), 0, lerp(1.2, -1.25, k)];   // walking in from the living room
const DOOR_IN2 = (k: number): V3 => [lerp(3.9, 2.35, k), 0, lerp(1.4, -1.0, k)];
const SOFA: V3 = [-2.5, 0, 3.3];
const TV: V3 = [-2.5, 0, 0.55];
const STAIRS: V3 = [5.55, 0, 0.9];                  // bottom step front edge; rises toward +z (x 5.05 .. 6.05)
const MOM_STAIRS: V3 = [4.1, 0, 0.35];
const POINT_A: V3 = [3.75, 0, -0.75], POINT_B: V3 = [4.45, 0, -0.75];
const CLASS: V3 = [3000, 0, 0];
const GYM: V3 = [-3000, 0, 0];
const DESKS: V3[] = [];
for (const z of [-1.4, 0, 1.4]) for (const x of [-1.6, 0, 1.6]) DESKS.push(add3(CLASS, [x, 0, z]));
const TEACHER: V3 = add3(CLASS, [-1.6, 0, -2.95]);

// ---------------- cast ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const MOM: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#e86a5a" };
const TEACH: Outfit = { jacket: "#5d7a3a", pants: "#3a3e4a", boots: INK, hat: "hair", hair: "#b0b0b8", skin: HEAD, moustache: "#9a9aa2", buttons: "#d8d8dc" };
const RIVAL: Outfit = { jacket: "#d84a3a", pants: "#3b3f52", boots: INK, hat: "cap", cap: "#3f6fb5", skin: HEAD, build: "tall" };
const HH = 2 * 118 * 0.94;
const handY = (o: Outfit, sit = false) => { const B = o.build === "stout" ? [1.15, 1.32] : o.build === "tall" ? [1.25, 1.85] : [1.1, 1.4]; return ((sit ? 0.2 : B[1]) + B[0] - HOLD_DY) * HH * SU; };
const headTop = (o: Outfit, sit = false) => { const B = o.build === "stout" ? [1.15, 1.32] : [1.1, 1.4]; return ((sit ? 0.2 : B[1]) + B[0] + 1.0) * HH * SU + (o.hat === "beanie" ? 0.07 : 0.02); };
const OUT = 0.03;
/** the slice is 22 cm long; its ends sit in the two reaching hands */
const REACH = (Math.abs(1.95 - 1.05) / 2 - 0.11) / SU;

// ---------------- the story by time ----------------
type Where = "kitchen" | "table" | "pizza" | "stairs" | "gym" | "homework" | "detention" | "kitchen2";
const whereAt = (t: number): Where => {
  if (t < T("rule", 1)) return "kitchen";
  if (t < T("rule", 2)) return "table";
  if (t < T("rule", 3)) return "pizza";
  if (t < T("and", 3)) return "stairs";
  if (t < T("homework")) return "gym";
  if (t < T("detention")) return "homework";
  if (t < T("next")) return "detention";
  return "kitchen2";
};
type Pose = { key: string; p: V3; fo: FrontOpts; sit?: boolean; held?: "bowl" | "ball" | "phones"; show?: boolean; pointAt?: string };
/** everybody on screen at time t: the hero ("you"), the copy, the third one, Mom, the rival, the teacher */
function castAt(t: number): Pose[] {
  const w = whereAt(t), out: Pose[] = [];
  const walk = (key: string, path: (k: number) => V3, t0: number, dur: number, expr: Expr): Pose => {
    const k = clamp01((t - t0) / dur);
    return { key, p: path(k), fo: k < 1 ? { mode: "stroll", phase: t * 1.1, expr } : { mode: "stand", expr } };
  };
  if (w === "kitchen") {
    const looked = t >= T("looks") - 0.1;
    const you = walk("you", DOOR_IN, T("you", 1) - 0.2, 1.6, "smile");
    if (t >= T("it", 1) - 0.1) you.fo = { mode: "stand", expr: "shock" };
    if (t >= T("and", 2)) you.fo = { mode: "stand", expr: "grin" };
    out.push(you);
    out.push({ key: "copy", p: SEAT_A, fo: { mode: "sit", expr: looked ? (t >= T("same", 1) ? (t >= T("and", 2) ? "grin" : "shock") : "neutral") : "smile_closed", prop: "hold2", holdDx: 36, look: looked ? 0 : 0 }, sit: true, held: "bowl" });
    out.push({ key: "mom", p: STOVE_MOM, fo: { mode: "stand", expr: "smile", facing: 1, look: 0.6 } });
    return out;
  }
  if (w === "table") {
    const thinking = t >= T("number") - 0.2;
    out.push({ key: "you", p: SEAT_B, fo: { mode: "sit", expr: t >= T("it", 3) ? "shock" : thinking ? "smile" : "neutral", look: -0.4 }, sit: true });
    out.push({ key: "copy", p: SEAT_A, fo: { mode: "sit", expr: t >= T("says", 1) ? "grin" : "smile", look: 0.4 }, sit: true });
    return out;
  }
  if (w === "pizza") {
    const grab = t >= T("grab") - 0.15, yell = t >= T("mine") - 0.1 && t < T("at", 1);
    const expr: Expr = yell ? "yell" : t >= T("at", 1) ? "stern" : grab ? "stern" : "grin";
    // both grab the slice: each hand holds one end of it, just above the table
    out.push({ key: "you", p: SEAT_B, fo: { mode: "sit", expr, look: -0.5, ...(grab ? { reach: REACH } : {}) }, sit: true, pointAt: grab ? "copy" : undefined });
    out.push({ key: "copy", p: SEAT_A, fo: { mode: "sit", expr, look: 0.5, ...(grab ? { reach: REACH } : {}) }, sit: true, pointAt: grab ? "you" : undefined });
    return out;
  }
  if (w === "stairs") {
    const pointA = t >= T("point") - 0.15, pointB = t >= T("points") - 0.15, taken = t >= T("takes") - 0.1;
    const exprY: Expr = taken ? "pained" : pointA ? "stern" : "nervous";
    out.push({ key: "you", p: POINT_A, fo: { mode: "stand", expr: exprY }, pointAt: pointA && !taken ? "copy" : undefined });
    out.push({ key: "copy", p: POINT_B, fo: { mode: "stand", expr: pointB ? (taken ? "pained" : "stern") : "nervous" }, pointAt: pointB && !taken ? "you" : undefined });
    out.push({ key: "mom", p: MOM_STAIRS, fo: { mode: "stand", expr: taken ? "smile" : "stern", ...(taken ? { prop: "hold2" as const, holdDx: 40 } : {}) }, held: taken ? "phones" : undefined });
    return out;
  }
  if (w === "gym") {
    const two = t >= T("two", 2) - 0.1;
    out.push({ key: "you", p: add3(GYM, [-0.55, 0, 0.2]), fo: { mode: "stand", expr: "grin", prop: "hold2", holdDx: 52 }, held: "ball" });
    out.push({ key: "copy", p: add3(GYM, [0.65, 0, -0.1]), fo: { mode: "stand", expr: two ? "laugh" : "grin", wave: 1 } });
    out.push({ key: "rival", p: add3(GYM, [0.05, 0, -1.0]), fo: { mode: "stand", expr: two ? "shock" : "stern", look: two ? 0.5 : -0.4 } });
    return out;
  }
  if (w === "homework") {
    out.push({ key: "you", p: SEAT_B, fo: { mode: "sit", expr: "grin", look: -0.3 }, sit: true });
    out.push({ key: "copy", p: SEAT_A, fo: { mode: "sit", expr: "grin", look: 0.3 }, sit: true });
    return out;
  }
  if (w === "detention") {
    out.push({ key: "you", p: [DESKS[4][0], P.SEAT, DESKS[4][2] + 0.5], fo: { mode: "sit", expr: t >= T("also") ? "pained" : "nervous", look: -0.4 }, sit: true });
    out.push({ key: "copy", p: [DESKS[3][0], P.SEAT, DESKS[3][2] + 0.5], fo: { mode: "sit", expr: t >= T("also") ? "pained" : "nervous", look: 0.4 }, sit: true });
    out.push({ key: "teacher", p: TEACHER, fo: { mode: "stand", expr: "stern" } });
    return out;
  }
  // next Saturday: the two of you walk in; a third one is eating your cereal
  const up = t >= T("look", 1) - 0.1;
  const a = walk("you", DOOR_IN, T("you", 14) - 0.2, 1.6, "smile"), b = walk("copy", DOOR_IN2, T("you", 14) - 0.1, 1.6, "smile");
  if (up) { a.fo = { mode: "stand", expr: "shock", look: -0.5 }; b.fo = { mode: "stand", expr: "shock", look: -0.6 }; }
  if (t >= T("three", 2)) { a.fo = { mode: "stand", expr: "dazed" }; b.fo = { mode: "stand", expr: "dazed" }; }
  out.push(a, b);
  out.push({ key: "third", p: SEAT_A, fo: { mode: "sit", expr: up ? (t >= T("three", 2) ? "grin" : "neutral") : "smile_closed", prop: "hold2", holdDx: 36 }, sit: true, held: "bowl" });
  out.push({ key: "mom", p: STOVE_MOM, fo: { mode: "stand", expr: t >= T("three", 2) ? "shock" : "smile", facing: t >= T("three", 2) ? 0 : 1, look: 0.6 } });
  return out;
}
const OUTFIT: Record<string, Outfit> = { you: HERO, copy: HERO, third: HERO, mom: MOM, rival: RIVAL, teacher: TEACH };
const posOf = (t: number, key: string) => castAt(t).find((c) => c.key === key)!.p;

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
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  const walkIn = (a: number) => shot(a, "home", 4, mv([0.6, 1.8, 3.6], [0.65, 1.75, 3.3], [1.6, 1.0, -1.6], [1.6, 1.0, -1.6], 50, 0, true));
  // Saturday morning: somebody is eating your cereal
  walkIn(0);
  shot(E("somebody", 1), "home", 10, mv([1.2, 1.25, -1.25], [1.18, 1.23, -1.32], [1.05, 1.05, -2.62], [1.05, 1.05, -2.62], 40, 0.02));
  shot(E("looks"), "home", 10, mv([1.25, 1.3, -1.0], [1.23, 1.3, -1.1], [1.05, 1.15, -2.62], [1.05, 1.16, -2.62], 38, -0.02));
  shot(E("it", 1), "home", 10, mv([1.75, 1.6, -0.15], [1.77, 1.6, -0.25], [1.9, 1.5, -1.25], [1.9, 1.52, -1.25], 38, 0.03));
  shot(E("same", 1), "home", 12, mv([1.15, 1.05, -1.75], [1.13, 1.05, -1.8], [1.05, 0.9, -2.62], [1.05, 0.92, -2.62], 36, 0.02));
  shot(E("same", 2), "home", 12, mv([1.15, 1.6, -1.8], [1.13, 1.6, -1.85], [1.05, 1.5, -2.62], [1.05, 1.52, -2.62], 36, -0.02));
  shot(E("same", 3), "home", 6, mv([1.0, 1.5, 1.0], [1.03, 1.5, 0.9], [1.55, 1.15, -1.9], [1.55, 1.15, -1.9], 46, 0.02));
  shot(E("and", 2), "home", 8, mv([1.05, 1.48, 0.8], [1.15, 1.45, 0.4], [1.55, 1.2, -1.9], [1.55, 1.2, -1.9], 46, 0, true));
  // rule one: the number
  shot(E("rule", 1), "home", 6, mv([1.5, 1.45, 0.2], [1.5, 1.4, 0.0], [1.5, 0.95, -2.62], [1.5, 0.95, -2.62], 44, 0, true));
  shot(E("you", 5), "home", 10, mv([2.1, 1.3, -1.25], [2.08, 1.3, -1.3], [1.95, 1.3, -2.62], [1.95, 1.32, -2.62], 40, 0.02));
  shot(E("he", 3), "home", 10, mv([0.9, 1.3, -1.25], [0.92, 1.3, -1.3], [1.05, 1.3, -2.62], [1.05, 1.32, -2.62], 40, -0.02));
  shot(E("it", 3), "home", 8, mv([1.5, 1.35, -0.35], [1.5, 1.35, -0.45], [1.5, 1.2, -2.62], [1.5, 1.2, -2.62], 46, 0.02));
  // rule two: the last slice
  shot(E("rule", 2), "home", 6, mv([2.3, 1.7, 0.0], [2.2, 1.65, -0.2], [1.5, 0.85, -2.3], [1.5, 0.85, -2.3], 44, 0, true));
  shot(E("one", 2), "home", 14, mv([1.75, 1.35, -1.15], [1.73, 1.32, -1.2], [1.5, 0.8, -1.8], [1.5, 0.8, -1.8], 38, 0.02));
  shot(E("grab"), "home", 8, mv([1.5, 1.2, -0.85], [1.5, 1.2, -0.95], [1.5, 1.0, -2.5], [1.5, 1.0, -2.5], 44, -0.02));
  shot(E("you", 8), "home", 10, mv([1.5, 1.3, -0.55], [1.5, 1.3, -0.63], [1.5, 1.15, -2.62], [1.5, 1.16, -2.62], 46, 0.03));
  shot(E("at", 1), "home", 6, mv([2.4, 1.5, -0.3], [2.35, 1.5, -0.4], [1.5, 1.05, -2.5], [1.5, 1.05, -2.5], 44, -0.02));
  // rule three: socks on the stairs
  shot(E("rule", 3), "home", 4, mv([3.3, 1.75, -2.9], [3.4, 1.7, -2.7], [5.0, 1.2, 1.2], [5.0, 1.2, 1.2], 50, 0, true));
  shot(E("mom", 1), "home", 10, mv([4.15, 1.5, -0.6], [4.17, 1.5, -0.65], [4.1, 1.4, 0.35], [4.1, 1.42, 0.35], 46, 0.02));
  shot(E("socks"), "home", 12, mv([5.75, 1.0, 0.1], [5.73, 0.98, 0.05], [5.55, 0.45, 1.3], [5.55, 0.45, 1.3], 40, -0.02));
  shot(E("you", 10), "home", 6, mv([4.1, 1.45, -3.0], [4.1, 1.45, -2.85], [4.1, 1.2, -0.75], [4.1, 1.2, -0.75], 44, 0.02));
  shot(E("he", 5), "home", 8, mv([4.6, 1.5, -2.4], [4.58, 1.5, -2.3], [4.2, 1.25, -0.75], [4.2, 1.25, -0.75], 42, -0.02));
  shot(E("mom", 2), "home", 6, mv([4.1, 1.5, -2.9], [4.1, 1.5, -2.75], [4.1, 1.1, 0.35], [4.1, 1.1, 0.35], 46, 0.02));
  // the last rule: unstoppable
  shot(E("and", 3), "school", 0, mvAt(GYM, [2.0, 2.2, 4.6], [1.8, 2.1, 4.1], [-0.2, 1.2, -1.0], [-0.2, 1.2, -1.0], 46, 0, true));
  shot(E("basketball"), "school", 6, mvAt(GYM, [0.6, 1.4, 2.8], [0.5, 1.4, 2.6], [0, 1.2, -0.4], [0, 1.25, -0.4], 46, 0.02));
  shot(E("two", 2), "school", 8, mvAt(GYM, [-1.3, 1.2, 2.0], [-1.2, 1.25, 1.85], [0.3, 1.5, -0.6], [0.3, 1.55, -0.6], 44, -0.03));
  shot(E("homework"), "home", 8, mv([1.5, 1.6, -0.2], [1.5, 1.55, -0.35], [1.5, 1.0, -2.4], [1.5, 1.0, -2.4], 50, 0.02));
  shot(E("half", 1), "home", 12, mv([1.5, 1.55, -0.75], [1.5, 1.53, -0.82], [1.5, 0.85, -2.2], [1.5, 0.85, -2.2], 52, -0.02));
  shot(E("detention"), "school", 4, mvAt(CLASS, [-0.8, 2.0, -3.5], [-0.8, 1.95, -3.2], [-0.8, 0.9, 0.6], [-0.8, 0.9, 0.6], 58, 0, true));
  shot(E("also"), "school", 10, mvAt(CLASS, [-1.45, 1.45, -0.7], [-1.47, 1.45, -0.6], [-1.6, 1.2, 0.5], [-1.6, 1.21, 0.5], 40, 0.02));
  // next Saturday: three of you
  walkIn(E("next"));
  shot(E("somebody", 2), "home", 10, mv([1.2, 1.25, -1.25], [1.18, 1.23, -1.32], [1.05, 1.05, -2.62], [1.05, 1.05, -2.62], 40, -0.02));
  shot(E("you", 15), "home", 8, mv([2.25, 1.55, 0.6], [2.24, 1.55, 0.5], [2.15, 1.45, -1.1], [2.15, 1.47, -1.1], 46, 0.02));
  shot(E("there"), "home", 4, mv([0.6, 1.8, 3.6], [0.7, 1.75, 3.2], [1.6, 1.0, -1.6], [1.6, 1.0, -1.6], 50, 0, true));
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
const schoolWall = () => ctex("schoolWall", 512, 512, (g, r) => {
  g.fillStyle = "#efe6cf"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#cdb98a"; g.fillRect(0, 420, 512, 92);
  for (let i = 0; i < 80; i++) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(r() * 512, r() * 420, 8, 2); }
});
const wallClockTex = () => ctex("classClock", 256, 256, (g) => {
  const c = 128; g.fillStyle = "#f8f6f0"; g.strokeStyle = "#241726"; g.lineWidth = 14; g.beginPath(); g.arc(c, c, 116, 0, 7); g.fill(); g.stroke();
  g.lineCap = "round"; for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; g.lineWidth = 6; g.beginPath(); g.moveTo(c + 88 * Math.sin(a), c - 88 * Math.cos(a)); g.lineTo(c + 102 * Math.sin(a), c - 102 * Math.cos(a)); g.stroke(); }
  g.lineWidth = 10; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 50 * Math.sin(5.24), c - 50 * Math.cos(5.24)); g.stroke();
  g.lineWidth = 7; g.beginPath(); g.moveTo(c, c); g.lineTo(c + 80 * Math.sin(1.57), c - 80 * Math.cos(1.57)); g.stroke();
});



// ---------------- the world ----------------
export class CopyWorld {
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
  private bowl = C.cereal();
  private ball = C.ball();
  private slice = C.slice();
  private pizza = C.pizzaBox();
  private notes = [C.notebook(), C.notebook()];
  private phones = [new P.Phone(), new P.Phone()];
  private think = C.bubble("think", "7");
  private say = C.bubble("say", "7!");

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
    this.buildHome(R); this.buildGym(R); this.buildClass(R);
    for (const m of [this.bowl, this.ball, this.slice, this.pizza, ...this.notes, this.think, this.say]) { m.visible = false; R.add(m); }
    for (const ph of this.phones) { ph.show({ key: "off" }); ph.root.visible = false; R.add(ph.root); }
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
    for (const [x, y, z, ry, w, h] of [[1.0, 1.6, -3.99, 0, 1.1, 1.3], [-1.6, 1.6, -3.99, 0, 1.1, 1.3]] as number[][]) {
      const day = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) }));
      day.position.set(x, y, z); day.rotation.y = ry; R.add(day);
    }
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), lam("homePicM", () => ({ map: pictureTex() })));
    pic.position.set(SOFA[0], 1.75, 4.13); pic.rotation.y = Math.PI; R.add(pic);
    this.place(b, P.kitchen(), [3.5, 0, -3.7]);
    this.place(b, P.sofa(), SOFA, Math.PI);
    const t = P.tv(); this.place(b, t.g, TV); t.scr.color.setScalar(0.12);
    b.add(boxGeo(V(-3.8, 0.0, 1.0), V(-1.2, 0.012, 3.0)), lam("fuRug", () => ({ color: "#5a8fc2" })));
    this.place(b, H.table(), KTABLE);
    this.place(b, H.chair(), [SEAT_A[0], 0, SEAT_A[2] + 0.02]);
    this.place(b, H.chair(), [SEAT_B[0], 0, SEAT_B[2] + 0.02]);
    this.place(b, H.mug("#f4c430"), [KTABLE[0] + 0.45, 0.76, KTABLE[2] + 0.2], 0.6);
    // the stairs along the right wall, socks on the lower steps
    this.place(b, C.stairs(10), STAIRS);
    this.place(b, C.sock("#e86a5a"), [STAIRS[0] - 0.15, 0.22, STAIRS[2] + 0.12], 0.4);
    this.place(b, C.sock("#e86a5a"), [STAIRS[0] + 0.2, 0.41, STAIRS[2] + 0.4], -0.7);
    this.place(b, C.sock("#5a8fc2"), [STAIRS[0] - 0.05, 0.6, STAIRS[2] + 0.66], 1.2);
    b.build(R);
    t.s.position.add(V(...TV)); R.add(t.s);
  }

  private buildGym(R: THREE.Object3D) {
    const b = new Batch(), o = GYM, wall = lam("cGymWall", () => ({ map: rep(schoolWall(), 5, 1) }));
    b.add(boxGeo(V(o[0] - 9, -0.2, -9), V(o[0] + 9, 0, 9)), lam("cGymFloor", () => ({ color: "#d8a864" })));
    this.place(b, C.court(), o);
    b.add(boxGeo(V(o[0] - 9, 0, -8.12), V(o[0] + 9, 6, -8)), wall);
    b.add(boxGeo(V(o[0] - 9, 0, 8), V(o[0] + 9, 6, 8.12)), wall);
    b.add(boxGeo(V(o[0] - 9.12, 0, -8), V(o[0] - 9, 6, 8)), wall);
    b.add(boxGeo(V(o[0] + 9, 0, -8), V(o[0] + 9.12, 6, 8)), wall);
    b.add(boxGeo(V(o[0] - 9, 6, -8), V(o[0] + 9, 6.2, 8), 0, true), lam("ceilM", () => ({ color: "#f4f1ea" })));
    this.place(b, C.hoop(), add3(o, [0, 0, -7.3]), Math.PI);
    this.place(b, C.bleachers(10), add3(o, [0, 0, 6.0]), Math.PI);
    b.build(R);
    for (const x of [-6, -2, 2, 6]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) })); w.position.set(o[0] + x, 4.5, -7.99); R.add(w); }
    for (let z = -6; z < 8; z += 4) for (const x of [-4, 0, 4]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.75, 1.6) })); l.position.set(o[0] + x, 6.0, z); R.add(l); }
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
    this.place(b, C.blackboard(), add3(o, [0, 0, -3.97]));
    this.place(b, P.teacherDesk(), add3(o, [-1.9, 0, -2.7]));
    DESKS.forEach((d) => this.place(b, P.deskChair(), d));
    b.build(R);
    const clk = new THREE.Mesh(new THREE.CircleGeometry(0.22, 32), lam("classClockM", () => ({ map: wallClockTex() })));
    clk.position.set(o[0] + 2.4, 2.55, -3.99); R.add(clk);
    for (let z = -3; z < 4; z += 2.4) for (const x of [-1.6, 1.6]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.75, 1.6) })); l.position.set(o[0] + x, 3.18, z); R.add(l); }
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
    const cast = castAt(t), yaws = new Map<string, number>();
    const camRight = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    for (const c of cast) if (c.pointAt) {
      // point toward the target as it appears on screen (cards face the lens), and look that way too
      const tg = cast.find((x) => x.key === c.pointAt)!, d = V(...tg.p).sub(V(...c.p)).dot(camRight) >= 0 ? 1 : -1;
      c.fo = { ...c.fo, point: d, look: 0.6 * d };
    }
    for (const c of cast) {
      const k = Object.keys(OUTFIT).indexOf(c.key);
      const y = person(c.key, c.p, OUTFIT[c.key], c.fo, [4, 4, 4, 21, 35, 30][k] + (c.key === "copy" ? 0 : c.key === "third" ? 0 : 0), { sit: c.sit });
      if (y !== null && y !== undefined) yaws.set(c.key, y);
    }
    const holdAt = (c: Pose, lift = 0) => {
      const y = yaws.get(c.key) ?? 0, n = V(Math.sin(y), 0, Math.cos(y));
      return { pos: V(...c.p).add(V(0, handY(OUTFIT[c.key], c.sit) + lift, 0)).addScaledVector(n, OUT), yaw: y };
    };
    for (const m of [this.bowl, this.ball, this.slice, this.pizza, ...this.notes, this.think, this.say]) m.visible = false;
    for (const ph of this.phones) ph.root.visible = false;
    for (const c of cast) {
      if (c.held === "bowl") { const h = holdAt(c, -0.05); this.bowl.visible = true; this.bowl.position.copy(h.pos); this.bowl.rotation.set(0, h.yaw, 0); }
      if (c.held === "ball") { const h = holdAt(c, 0.02); this.ball.visible = true; this.ball.position.copy(h.pos).addScaledVector(V(Math.sin(h.yaw), 0, Math.cos(h.yaw)), 0.1); this.ball.rotation.set(0, t, 0); }
      if (c.held === "phones") {
        const h = holdAt(c), right = V(Math.cos(h.yaw), 0, -Math.sin(h.yaw));
        this.phones.forEach((ph, k) => { ph.root.visible = true; ph.root.position.copy(h.pos).addScaledVector(right, (k ? 1 : -1) * 0.075); ph.root.rotation.set(-0.2, h.yaw, 0, "YXZ"); });
      }
    }
    if (where === "pizza") {
      this.pizza.visible = true; this.pizza.position.set(KTABLE[0], 0.76, KTABLE[2] + 0.12); this.pizza.rotation.set(0, 0, 0);
      const grab = t >= T("grab") - 0.15;
      this.slice.visible = true;
      if (!grab) { this.slice.position.set(KTABLE[0] + 0.02, 0.775, KTABLE[2] + 0.1); this.slice.rotation.set(0, 0.3, 0); }
      else {
        // held between the two hands (hand height of a seated "hold2"), a little toward the lens like any held prop
        const y = yaws.get("you") ?? 0, n = V(Math.sin(y), 0, Math.cos(y));
        this.slice.position.set((SEAT_A[0] + SEAT_B[0]) / 2, P.SEAT + handY(HERO, true) - 0.01, SEAT_A[2]).addScaledVector(n, OUT);
        this.slice.rotation.set(0, 0, 0);
      }
    }
    if (where === "homework") this.notes.forEach((nb, k) => { nb.visible = true; nb.position.set((k ? SEAT_B : SEAT_A)[0], 0.76, KTABLE[2] - 0.15); nb.rotation.set(0, k ? -0.1 : 0.12, 0); });
    if (where === "table") {
      // comic bubbles beside the heads, kept inside the frame, 1.2 m from the lens
      const label = (m: THREE.Mesh, p: V3, dx: number) => {
        const ndc = V(p[0], p[1] + headTop(HERO, true) + 0.15, p[2]).project(cam);
        const top = V(p[0], p[1] + headTop(HERO, true) + 0.05, p[2]).project(cam).y;
        const x = THREE.MathUtils.clamp(ndc.x + dx, -0.55, 0.55), y = THREE.MathUtils.clamp(Math.max(ndc.y, top + 0.2), -0.2, 0.78);
        const dir = V(x, y, 0.5).unproject(cam).sub(cam.position).normalize();
        m.visible = true; m.position.copy(cam.position).addScaledVector(dir, 1.2); m.quaternion.copy(cam.quaternion);
        m.scale.setScalar(0.9 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) / Math.tan(THREE.MathUtils.degToRad(20)));
      };
      const sb = V(SEAT_B[0], 0, 0).sub(V(SEAT_A[0], 0, 0)).dot(V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0)) >= 0 ? 1 : -1;
      if (t >= T("number") - 0.1) label(this.think, SEAT_B, 0.12 * sb);
      if (t >= T("says", 1) + 0.05) label(this.say, SEAT_A, -0.12 * sb);
    }
    void posOf;
    for (let k = ai; k < this.actors.length; k++) this.actors[k].mesh.visible = false;
    for (let k = fi; k < this.fxs.length; k++) this.fxs[k].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return look;
  }
}
