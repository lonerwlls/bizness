// "What if every door led to another universe": small rooms of the hero's house and school, each with one door (or a
// fridge) that opens onto another place built right behind its wall: a beach, a snowy mountain, a gym, a desert, a
// library, an empty school on Saturday, a pizza party and Mom's kitchen. Outdoor places see a free-standing door frame
// (the room behind it is hidden while the camera is outside). Props are our own 3D models (props.ts); every cut
// follows the narration (voice.ts).
import * as THREE from "three";
import { Batch, V, lam, boxGeo, prop } from "../bridge/build";
import { rep, ctex, planksHD, cloudHD, rng } from "../bridge/paint";
import { bodyFront, Outfit, Expr, FrontOpts, INK, fxContact, HOLD_DY } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx, SU } from "../bridge/cast";
import { makeKit } from "../bridge/kitgen";
import * as P from "../future/props";
import * as H from "../health/props";
import * as C from "../copy/props";
import * as D from "./props";
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
const ramp = (t: number, a: number, d: number) => glide((t - a) / d);

// ---------------- light ----------------
type Look = "home" | "beach" | "snow" | "desert" | "school" | "party";
const OUTDOOR: Look[] = ["beach", "snow", "desert"];
const PR = (l: Partial<LightPreset>, k: Partial<WorldLook>) => ({ L: { ...LIGHTS.day, ...l }, K: { ...LOOK.day, ...k } });
const PRESETS: Record<Look, { L: LightPreset; K: WorldLook }> = {
  home: PR({ lit: [1.55, 1.42, 1.25], shade: [0.36, 0.34, 0.42], lift: [0.07, 0.07, 0.11], fog: "#efe4d4", charTint: [1.0, 0.96, 0.92] }, {}),
  beach: PR({ lit: [1.62, 1.52, 1.32], fog: "#cfe4f2" }, {}),
  snow: PR({ lit: [1.45, 1.5, 1.62], shade: [0.38, 0.42, 0.56], lift: [0.07, 0.08, 0.13], fog: "#dfe8f4", charTint: [0.96, 0.98, 1.04] }, {}),
  desert: PR({ lit: [1.68, 1.46, 1.16], shade: [0.42, 0.33, 0.3], lift: [0.08, 0.06, 0.06], fog: "#f2dcb4", charTint: [1.04, 0.97, 0.9] }, {}),
  school: PR({ lit: [1.5, 1.44, 1.32], shade: [0.42, 0.42, 0.5], lift: [0.08, 0.08, 0.11], fog: "#e8e6e0", charTint: [1.0, 0.98, 0.95], hemiI: 0.6 }, {}),
  party: PR({ lit: [1.55, 1.32, 1.5], shade: [0.38, 0.3, 0.48], lift: [0.08, 0.05, 0.12], fog: "#d8c8e8", charTint: [1.02, 0.94, 1.02] }, {}),
};
const SUN_OF: Record<Look, [number, number]> = { home: [60, 50], beach: [70, 45], snow: [65, 38], desert: [80, 60], school: [55, 55], party: [50, 60] };

// ---------------- layout: five small rooms, each with its portal on the wall z = 0 (destinations at z > 0) ----------------
const BED: V3 = [0, 0, 0], HALLW: V3 = [3000, 0, 0], KITCH: V3 = [6000, 0, 0], ENTRY: V3 = [9000, 0, 0], SCHOOL: V3 = [12000, 0, 0];
const BED_DOOR = 0.8, JAN_DOOR = -1.2, EXIT_DOOR = 1.2;
const W = (o: V3, x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];

// ---------------- cast ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const MOM: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#e86a5a" };
const LIBR: Outfit = { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#b0b0b8", skin: HEAD, dress: "#5a6a8a", buttons: "#d8d8dc" };
const STUDENTS: Outfit[] = [
  { jacket: "#3f9a5a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#3a2418", skin: HEAD },
  { jacket: "#c25a7a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#d8a040", skin: HEAD, dress: "#d9a441" },
  { jacket: "#7b5ac9", pants: "#2e3a5a", boots: INK, hat: "cap", cap: "#e2453c", skin: HEAD },
  { jacket: "#2f8a9a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#5a8fc2" },
  { jacket: "#d84a3a", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#22180f", skin: HEAD },
  { jacket: "#f0b030", pants: "#3b5b9a", boots: "#f4f1ea", hat: "hair", hair: "#7a3a1a", skin: HEAD },
  { jacket: "#3f6fb5", pants: "#2e3a5a", boots: INK, hat: "hair", hair: "#b07a3a", skin: HEAD, dress: "#3f6fb5" },
];
const HH = 2 * 118 * 0.94;
const handY = (o: Outfit) => { const B = o.build === "stout" ? [1.15, 1.32] : [1.1, 1.4]; return (B[1] + B[0] - HOLD_DY) * HH * SU; };
const headTop = (o: Outfit) => { const B = o.build === "stout" ? [1.15, 1.32] : [1.1, 1.4]; return (B[1] + B[0] + 1.0) * HH * SU; };
const OUT = 0.03;

// ---------------- the story by time ----------------
type Where = "bed" | "hall" | "kitch" | "entry" | "school" | "bed2";
const whereAt = (t: number): Where => {
  if (t < T("rule", 1)) return "bed";
  if (t < T("the", 2)) return "hall";
  if (t < T("rule", 2)) return "kitch";
  if (t < T("rule", 3)) return "entry";
  if (t < T("monday", 2)) return "school";
  return "bed2";
};
/** how open each portal is */
const bedDoor = (t: number) => (t < T("rule", 1) ? ramp(t, T("door", 1) - 0.1, 0.45) : ramp(t, T("door", 10) - 0.1, 0.45));
const hallDoor = (t: number) => ramp(t, T("the", 1) + 0.2, 0.5);
const fridgeOpen = (t: number) => ramp(t, T("fridge") + 0.05, 0.6);
const entryDoor = (t: number) => {
  const o1 = ramp(t, T("first") + 0.05, 0.45), c1 = ramp(t, T("second") - 0.35, 0.3), o2 = ramp(t, T("second") + 0.05, 0.45), c2 = ramp(t, T("third") - 0.4, 0.3), o3 = ramp(t, T("third") + 0.05, 0.45);
  return t < T("second") - 0.35 ? o1 : t < T("second") + 0.05 ? 1 - c1 : t < T("third") - 0.4 ? o2 : t < T("third") + 0.05 ? 1 - c2 : o3;
};
const janDoor = (t: number) => (t < T("you", 5) - 0.35 ? ramp(t, T("janitor") - 0.1, 0.5) : 1 - ramp(t, T("you", 5) - 0.35, 0.35));
const exitDoor = (t: number) => ramp(t, T("your", 3) + 0.05, 0.55);
type EntryDest = "desert" | "library" | "saturday";
const entryDest = (t: number): EntryDest => (t < T("second") - 0.05 ? "desert" : t < T("third") - 0.1 ? "library" : "saturday");
const schoolDest = (t: number) => (t < T("and", 3) ? "pizza" : "homek");

type HeroPose = { p: V3; fo: FrontOpts; held?: "sunscreen" };
const walk = (t: number, a: number, b: number, p0: V3, p1: V3) => lerp3(p0, p1, clamp01((t - a) / (b - a)));
const walking = (t: number, a: number, b: number) => t > a && t < b;
function heroAt(t: number): HeroPose {
  const w = whereAt(t);
  const stand = (p: V3, expr: Expr, extra: Partial<FrontOpts> = {}): HeroPose => ({ p, fo: { mode: "stand", expr, ...extra } });
  const go = (p: V3, expr: Expr, moving: boolean, extra: Partial<FrontOpts> = {}): HeroPose => ({ p, fo: moving ? { mode: "stroll", phase: t * 1.1, expr, ...extra } : { mode: "stand", expr, ...extra } });
  if (w === "bed" || w === "bed2") {
    const ring = w === "bed2";
    const a0 = ring ? T("you", 6) - 0.05 : T("you", 1) - 0.1, a1 = a0 + 0.85;
    const b0 = ring ? T("and", 4) : T("door", 1) + 0.35, b1 = b0 + 1.35;
    const S0 = W(BED, -0.2, 0, -2.0), S1 = W(BED, 1.35, 0, -0.7), S2 = W(BED, BED_DOOR, 0, -0.45), S3 = W(BED, BED_DOOR, 0, 2.0);
    let p: V3, mv = false;
    if (t < a1) { p = walk(t, a0, a1, S0, S1); mv = walking(t, a0, a1); }
    else if (t < b0) p = S1;
    else if (t < b0 + 0.3) { p = walk(t, b0, b0 + 0.3, S1, S2); mv = true; }
    else { p = walk(t, b0 + 0.3, b1, S2, S3); mv = walking(t, b0 + 0.3, b1); }
    let expr: Expr = ring ? "grin" : t < a0 ? "dazed" : "smile";
    if (!ring) {
      if (t >= T("door", 1) + 0.1) expr = "shock";
      if (t >= T("waves") - 0.1) expr = "grin";
      if (t >= T("seagulls") - 0.1 && t < T("every", 1)) expr = "shock";
      if (t >= T("every", 1)) expr = "laugh";
      if (t >= T("and", 2)) expr = "grin";
    } else if (t >= T("again") - 0.1) expr = "laugh";
    if (t >= T("this") - 0.1) expr = "grin";
    return { ...go(p, expr, mv, ring ? { prop: "hold2", holdDx: 30 } : {}), held: ring ? "sunscreen" : undefined };
  }
  if (w === "hall") {
    const p = walk(t, T("rule", 1) - 0.1, T("rule", 1) + 1.9, W(HALLW, 0.55, 0, -2.8), W(HALLW, 0.55, 0, -0.75));
    let expr: Expr = "smile";
    if (t >= T("a", 3) - 0.1) expr = "shock";
    if (t >= T("mountain") - 0.1) expr = "pained";
    const shiver = t >= T("mountain") - 0.1 ? 3 * Math.sin(t * 40) : 0;
    return go(p, expr, walking(t, T("rule", 1) - 0.1, T("rule", 1) + 1.9), { tilt: shiver, look: t < T("a", 3) ? -0.3 : 0 });
  }
  if (w === "kitch") return stand(W(KITCH, 0.85, 0, -1.0), t >= T("somehow") - 0.1 ? "shock" : "smile", { look: -0.5 });
  if (w === "entry") {
    let expr: Expr = "grin";
    if (t >= T("desert") - 0.1) expr = "pained";
    if (t >= T("second") - 0.1) expr = "neutral";
    if (t >= T("library") + 0.2) expr = "nervous";
    if (t >= T("third") - 0.1) expr = "grin";
    if (t >= T("on", 1) - 0.05) expr = "dazed";
    const lib = t >= T("library") - 0.25 && t < T("third") - 0.4;
    return stand(lib ? W(ENTRY, 0.08, 0, -0.55) : W(ENTRY, 0.55, 0, -0.8), expr, { look: lib ? 0 : -0.4 });
  }
  // school: walk to the janitor's closet, then to the exit door, then through it into Mom's kitchen
  const J = W(SCHOOL, 0.05, 0, -0.75), X = W(SCHOOL, 2.15, 0, -0.75), X1 = W(SCHOOL, EXIT_DOOR, 0, -0.4), X2 = W(SCHOOL, 1.35, 0, 2.2);
  const w0 = T("rule", 3) - 0.1, w1 = w0 + 2.6, e0 = T("and", 3), e1 = e0 + 1.8, i0 = T("mom") - 0.5, i1 = T("pancakes") - 0.1;
  let expr: Expr = "smile";
  if (t >= T("leads", 2) - 0.1) expr = "shock";
  if (t >= T("pizza") - 0.1) expr = "laugh";
  if (t >= T("you", 5) - 0.1) expr = "whistle";
  if (t >= T("and", 3)) expr = "smile";
  if (t >= T("mom") - 0.1) expr = "grin";
  if (t < e0) return go(walk(t, w0, w1, W(SCHOOL, 0.0, 0, -6.5), J), expr, walking(t, w0, w1), { look: t >= T("you", 5) - 0.1 ? 0.7 : 0 });
  if (t < i0) return go(walk(t, e0, e1, J, X), expr, walking(t, e0, e1));
  if (t < i0 + 0.3) return go(walk(t, i0, i0 + 0.3, X, X1), expr, true);
  return go(walk(t, i0 + 0.3, i1, X1, X2), expr, walking(t, i0 + 0.3, i1));
}

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; look: Look; cInf: number; cam: (u: number, f: number) => Cam };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
const mvAt = (o: V3, p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => mv(add3(o, p0), add3(o, p1), add3(o, l0), add3(o, l1), fov, roll, ease);
const follow = (off: V3, lookOff: V3, fov: number, roll = 0) => (_u: number, f: number): Cam => {
  const p = heroAt(f / FPS).p;
  return { pos: add3(p, off), look: add3(p, lookOff), fov, roll };
};
const fixedOn = (o: V3, pos: V3, lookOff: V3, fov: number, roll = 0) => (_u: number, f: number): Cam => ({ pos: add3(o, pos), look: add3(heroAt(f / FPS).p, lookOff), fov, roll });
const S: ShotDef[] = [];
export const SHOTS = S;
const shot = (a: number, look: Look, cInf: number, cam: (u: number, f: number) => Cam) => S.push({ a, look, cInf, cam });
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  const bedroom = (a: number, b: number, c: number, d: number, ring: boolean) => {
    shot(a, "home", 6, mvAt(BED, [-1.9, 1.75, -0.25], [-1.85, 1.73, -0.35], [-0.4, 1.05, -2.2], [-0.35, 1.05, -2.2], 50, 0.02));
    shot(b, "home", 6, mvAt(BED, [-0.9, 1.6, -3.6], [-0.8, 1.6, -3.4], [1.0, 1.1, 0], [1.0, 1.1, 0], 46, -0.02));
    shot(c, "beach", 4, follow([0.0, 1.55, -1.7], [0, 1.0, 6], 48));
    shot(d, "beach", 6, mvAt(BED, [4.4, 1.9, 6.0], [4.2, 1.85, 5.7], [0.8, 1.0, 0.8], [0.8, 1.0, 0.8], 44, 0, true));
    void ring;
  };
  // Monday morning: the bedroom door opens onto a beach
  bedroom(0, E("you", 1), E("and", 1), E("every", 1), false);
  shot(E("sand"), "beach", 12, mvAt(BED, [1.15, 0.42, 3.1], [1.12, 0.4, 3.0], [0.8, 0.15, 2.0], [0.8, 0.15, 2.0], 40, 0.03));
  shot(E("waves"), "beach", 2, mvAt(BED, [0.0, 1.7, 0.6], [0.05, 1.65, 0.9], [1.6, 0.8, 14], [1.6, 0.8, 14], 46, 0.02));
  shot(E("seagulls"), "beach", 6, mvAt(BED, [1.3, 0.8, 3.8], [1.28, 0.85, 3.75], [0.7, 3.4, 1.2], [0.7, 3.5, 1.2], 52, -0.03));
  shot(E("and", 2), "beach", 10, mvAt(BED, [2.2, 1.6, 2.9], [2.15, 1.6, 2.8], [0.8, 1.5, 2.0], [0.8, 1.52, 2.0], 38, 0.02));
  // rule one: the bathroom door, the fridge
  shot(E("rule", 1), "home", 6, mvAt(HALLW, [0.3, 1.75, -4.8], [0.3, 1.72, -4.65], [0.3, 1.1, 0], [0.3, 1.1, 0], 48, 0.02));
  shot(E("you", 4), "home", 10, mvAt(HALLW, [1.6, 1.5, -1.9], [1.58, 1.5, -1.95], [0.4, 1.25, -0.4], [0.4, 1.27, -0.4], 40, -0.02));
  shot(E("the", 1), "home", 8, mvAt(HALLW, [-0.9, 1.45, -2.3], [-0.88, 1.45, -2.25], [0.05, 1.1, 0], [0.05, 1.12, 0], 42, 0.02));
  shot(E("a", 3), "snow", 4, mvAt(HALLW, [-0.2, 1.35, -1.9], [-0.15, 1.3, -1.4], [0.2, 2.6, 20], [0.2, 2.8, 20], 48, 0, true));
  shot(E("mountain"), "home", 10, mvAt(HALLW, [-0.4, 1.5, -1.9], [-0.38, 1.5, -1.85], [0.55, 1.45, -0.75], [0.55, 1.47, -0.75], 38, -0.02));
  shot(E("the", 2), "home", 6, mvAt(KITCH, [1.8, 1.7, -3.4], [1.7, 1.7, -3.3], [0.2, 1.0, -0.5], [0.2, 1.0, -0.5], 46, 0.02));
  shot(E("somehow"), "home", 4, mvAt(KITCH, [0.95, 1.45, -2.3], [0.85, 1.4, -2.0], [-0.1, 1.0, 0.8], [-0.1, 1.0, 0.8], 46, 0, true));
  shot(E("gym"), "home", 10, mvAt(KITCH, [1.9, 1.5, -1.4], [1.88, 1.5, -1.42], [0.85, 1.4, -1.0], [0.85, 1.42, -1.0], 38, 0.03));
  // rule two: the front door, three times
  shot(E("rule", 2), "home", 6, mvAt(ENTRY, [-1.2, 1.7, -3.6], [-1.1, 1.7, -3.3], [0.3, 1.0, 0], [0.3, 1.0, 0], 46, 0.02));
  shot(E("getting"), "home", 10, mvAt(ENTRY, [1.2, 1.55, -1.9], [1.18, 1.55, -1.95], [0.55, 1.45, -0.8], [0.55, 1.47, -0.8], 38, -0.02));
  const through = (a: number, look: Look) => shot(a, look, 4, mvAt(ENTRY, [-0.25, 1.65, -2.6], [-0.22, 1.65, -2.3], [0.1, 1.4, 15], [0.1, 1.4, 15], 46, 0.01, true));
  through(E("first"), "desert");
  shot(E("desert"), "home", 10, mvAt(ENTRY, [1.25, 1.5, -1.9], [1.23, 1.5, -1.95], [0.55, 1.45, -0.8], [0.55, 1.47, -0.8], 38, 0.03));
  through(E("second"), "home");
  shot(E("library"), "home", 8, mvAt(ENTRY, [0.6, 1.6, 6.0], [0.55, 1.6, 5.8], [-0.1, 1.2, 0], [-0.1, 1.2, 0], 46, 0.02));
  through(E("third"), "school");
  shot(E("on", 1), "school", 10, mvAt(ENTRY, [0.0, 1.6, -2.4], [0.0, 1.62, -2.3], [0.0, 2.2, 5.0], [0.0, 2.2, 5.0], 46, -0.02));
  shot(E("saturday") + 12, "home", 10, mvAt(ENTRY, [1.25, 1.5, -1.9], [1.23, 1.5, -1.95], [0.55, 1.45, -0.8], [0.55, 1.47, -0.8], 38, -0.03));
  // rule three: the janitor's closet
  shot(E("rule", 3), "school", 6, mvAt(SCHOOL, [0.9, 1.8, -8.6], [0.8, 1.8, -8.2], [-0.6, 1.1, 0], [-0.6, 1.1, 0], 46, 0.02));
  shot(E("some", 1), "school", 8, fixedOn(SCHOOL, [0.9, 1.55, -0.6], [0, 1.4, 0], 42, 0.02));
  shot(E("the", 3), "school", 8, mvAt(SCHOOL, [0.1, 1.5, -2.0], [0.08, 1.5, -1.95], [JAN_DOOR, 1.35, 0], [JAN_DOOR, 1.37, 0], 42, -0.02));
  shot(E("leads", 2), "party", 4, mvAt(SCHOOL, [-0.4, 1.6, -2.6], [-0.45, 1.6, -2.3], [-1.4, 1.3, 6], [-1.4, 1.3, 6], 46, 0, true));
  shot(E("pizza"), "party", 8, mvAt(SCHOOL, [0.3, 1.5, 1.9], [0.2, 1.5, 2.0], [-1.6, 1.15, 5.0], [-1.6, 1.15, 5.0], 44, 0.03));
  shot(E("you", 5), "school", 10, mvAt(SCHOOL, [0.6, 1.55, -2.0], [0.58, 1.55, -2.02], [-0.3, 1.45, -0.75], [-0.3, 1.47, -0.75], 38, -0.02));
  // the last rule: the exit door leads home
  shot(E("and", 3), "school", 6, mvAt(SCHOOL, [-1.8, 1.7, -5.5], [-1.6, 1.7, -5.2], [1.2, 1.2, 0], [1.2, 1.2, 0], 46, 0.02));
  shot(E("one", 2), "school", 10, mvAt(SCHOOL, [0.4, 1.6, -2.2], [0.42, 1.6, -2.15], [EXIT_DOOR, 1.85, 0], [EXIT_DOOR, 1.87, 0], 42, 0.02));
  shot(E("your", 3), "home", 4, mvAt(SCHOOL, [0.6, 1.6, -2.8], [0.65, 1.6, -2.5], [1.2, 1.3, 6], [1.2, 1.3, 6], 46, 0, true));
  shot(E("mom"), "home", 10, mvAt(SCHOOL, [2.0, 1.55, 2.6], [2.05, 1.55, 2.65], [3.4, 1.4, 4.5], [3.4, 1.42, 4.5], 40, 0.02));
  shot(E("pancakes"), "home", 8, mvAt(SCHOOL, [3.1, 1.5, 1.4], [3.05, 1.5, 1.45], [1.6, 1.0, 2.9], [1.6, 1.02, 2.9], 44, -0.02));
  // next Monday: the same door, the same beach, sunscreen this time
  bedroom(E("monday", 2), E("you", 6), E("and", 4), E("again"), true);
  shot(E("this"), "beach", 10, mvAt(BED, [2.0, 1.55, 2.8], [1.95, 1.55, 2.75], [0.8, 1.45, 2.0], [0.8, 1.47, 2.0], 38, 0.02));
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

// ---------------- painted walls ----------------
const wallpaper = () => ctex("wallpaper", 512, 512, (g, r) => {
  g.fillStyle = "#e8dcc4"; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = "rgba(200,170,130,0.35)"; g.fillRect(x, 0, 22, 512); }
  for (let i = 0; i < 200; i++) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(r() * 512, r() * 512, 6, 2); }
});
const kidWall = () => ctex("kidWall", 512, 512, (g, r) => {
  g.fillStyle = "#cfe0f0"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) { g.fillStyle = "rgba(255,255,255,0.5)"; const x = r() * 512, y = r() * 512; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
});
const skyWin = () => ctex("skyWindow", 256, 320, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 320); gr.addColorStop(0, "#8cbcea"); gr.addColorStop(1, "#dcecf8");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 320);
  g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(80, 90, 50, 20, 0, 0, 7); g.ellipse(120, 80, 40, 24, 0, 0, 7); g.fill();
  g.fillStyle = "#6a9a4a"; g.fillRect(0, 260, 256, 60);
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
const schoolFloor = () => ctex("schoolFloor", 512, 512, (g) => {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? "#e6e2d8" : "#c8c2b4"; g.fillRect(x * 64, y * 64, 64, 64); }
});
const partyWall = () => ctex("partyWall", 512, 512, (g, r) => {
  g.fillStyle = "#6a4aa8"; g.fillRect(0, 0, 512, 512);
  const cols = ["#f4c430", "#e86a9a", "#5ae0c8", "#ffffff", "#f27a2a"];
  for (let i = 0; i < 160; i++) { g.fillStyle = cols[i % 5]; g.save(); g.translate(r() * 512, r() * 512); g.rotate(r() * 3); g.fillRect(-6, -3, 12, 6); g.restore(); }
});
const carpet = () => ctex("libCarpet", 512, 512, (g, r) => {
  g.fillStyle = "#8a3a3a"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(240,200,120,0.4)"; g.lineWidth = 6; for (let k = 32; k < 512; k += 64) { g.strokeRect(k - 24, k - 24, 512 - 2 * (k - 24), 512 - 2 * (k - 24)); }
  for (let i = 0; i < 800; i++) { g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(r() * 512, r() * 512, 3, 3); }
});

// ---------------- the world ----------------
export class DoorsWorld {
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
  private rooms: Record<string, THREE.Group> = {};
  private dests: Record<string, THREE.Group> = {};
  private doors: Record<string, { g: THREE.Group; set: (k: number) => void }> = {};
  private fridge = D.fridge();
  private gulls = [new D.Gull(), new D.Gull(), new D.Gull()];
  private flakes = D.flakes(320);
  private seaTex!: THREE.Texture;
  private foam!: THREE.Mesh;
  private ball = C.ball();
  private disco = D.discoBall();
  private pan = D.pan();
  private flip = D.pancake();
  private screen = D.sunscreen();
  private hats = ["#f4c430", "#e86a9a", "#5ae0c8", "#f27a2a", "#3f6fb5"].map((c) => D.partyHat(c));

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
    const kit = makeKit();
    this.buildBedroom(R, kit); this.buildHall(R, kit); this.buildKitchen(R); this.buildEntry(R, kit); this.buildSchool(R);
    for (const m of [this.ball, this.disco, this.pan, this.flip, this.screen, ...this.hats, this.flakes]) { m.visible = false; R.add(m); }
    for (const g of this.gulls) R.add(g.root);
  }

  private place(b: Batch, g: THREE.Object3D, p: V3, ry = 0) { g.position.set(...p); g.rotation.y = ry; g.updateMatrixWorld(true); b.addObject(g, new THREE.Matrix4()); }
  /** a closed room x0..x1, z0..0 (front wall z -0.12..0 with holes), or a destination room 0..z1 with its near wall at
   *  z 0..0.12. Holes: { x, w, y0, y1 } in local x. */
  private room(b: Batch, o: V3, x0: number, x1: number, zA: number, zB: number, h: number, wall: THREE.Material, floor: THREE.Material, holes: { x: number; w: number; y0: number; y1: number }[], dest = false) {
    const X = (x: number) => o[0] + x, Z = (z: number) => o[2] + z;
    b.add(boxGeo(V(X(x0 - 0.12), -0.2, Z(zA - 0.12)), V(X(x1 + 0.12), 0.008, Z(zB + 0.12))), floor);
    b.add(boxGeo(V(X(x0 - 0.12), h, Z(zA - 0.12)), V(X(x1 + 0.12), h + 0.12, Z(zB + 0.12)), 0, true), lam("ceilM", () => ({ color: "#f4f1ea" })));
    b.add(boxGeo(V(X(x0 - 0.12), 0, Z(zA - 0.12)), V(X(x0), h, Z(zB + 0.12))), wall);
    b.add(boxGeo(V(X(x1), 0, Z(zA - 0.12)), V(X(x1 + 0.12), h, Z(zB + 0.12))), wall);
    // the far wall and the portal wall
    const farZ = dest ? zB : zA, nearA = dest ? 0 : -0.12, nearB = dest ? 0.12 : 0;
    b.add(boxGeo(V(X(x0), 0, Z(dest ? farZ : farZ - 0.12)), V(X(x1), h, Z(dest ? farZ + 0.12 : farZ))), wall);
    let cur = x0;
    for (const hl of [...holes].sort((a, c) => a.x - c.x)) {
      const a = hl.x - hl.w / 2, c = hl.x + hl.w / 2;
      if (a > cur) b.add(boxGeo(V(X(cur), 0, Z(nearA)), V(X(a), h, Z(nearB))), wall);
      b.add(boxGeo(V(X(a), hl.y1, Z(nearA)), V(X(c), h, Z(nearB))), wall);
      if (hl.y0 > 0.01) b.add(boxGeo(V(X(a), 0, Z(nearA)), V(X(c), hl.y0, Z(nearB))), wall);
      cur = c;
    }
    if (cur < x1) b.add(boxGeo(V(X(cur), 0, Z(nearA)), V(X(x1), h, Z(nearB))), wall);
  }
  private win(R: THREE.Object3D, p: V3, ry: number, w = 1.1, h = 1.3) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) }));
    m.position.set(...p); m.rotation.y = ry; R.add(m);
  }
  private lights(R: THREE.Object3D, o: V3, xs: number[], zs: number[], y: number, k = 1.8, col?: string[]) {
    let i = 0;
    for (const x of xs) for (const z of zs) {
      const c = col ? new THREE.Color(col[i++ % col.length]).multiplyScalar(k) : new THREE.Color(k, k * 0.97, k * 0.89);
      const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: c })); l.position.set(o[0] + x, y - 0.02, o[2] + z); R.add(l);
    }
  }
  private group(R: THREE.Object3D, key: string, kind: "rooms" | "dests") { const g = new THREE.Group(); R.add(g); this[kind][key] = g; return g; }
  private portal(R: THREE.Object3D, key: string, o: V3, x: number, col: string, opts: { window?: boolean; sign?: THREE.Texture } = {}) {
    const d = D.door(col, opts); d.g.position.set(o[0] + x, 0, o[2]); R.add(d.g); this.doors[key] = d;
  }

  private buildBedroom(R: THREE.Object3D, kit: ReturnType<typeof makeKit>) {
    const o = BED, g = this.group(R, "bed", "rooms"), b = new Batch();
    this.room(b, o, -2.5, 2.5, -4, 0, 2.8, lam("kidWallM", () => ({ map: rep(kidWall(), 2, 1) })), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })), [{ x: BED_DOOR, w: D.DOOR_W, y0: 0, y1: D.DOOR_H }]);
    this.place(b, P.bed(), W(o, -1.3, 0, -2.6));
    this.place(b, P.nightstand(), W(o, -2.15, 0, -3.6));
    this.place(b, P.quilt(-0.3, 1.0), W(o, -1.3, 0, -2.6));
    b.add(boxGeo(V(o[0] - 0.4, 0.008, o[2] - 3.2), V(o[0] + 1.4, 0.02, o[2] - 1.6)), lam("dRugB", () => ({ color: "#f4c430" })));
    b.build(g);
    this.win(g, W(o, 0.6, 1.6, -3.99), 0);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), lam("homePicM", () => ({ map: pictureTex() }))); pic.position.set(o[0] - 2.49, 1.7, o[2] - 2.6); pic.rotation.y = Math.PI / 2; g.add(pic);
    this.portal(R, "bed", o, BED_DOOR, "#f2ead8");
    // the beach behind the door
    const d = this.group(R, "beach", "dests"), bb = new Batch();
    bb.add(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2).translate(o[0], 0, o[2] + 60), lam("dSand", () => ({ map: rep(D.sandTex(), 120, 120) })));
    const seaM = lam("dSea", () => ({ map: rep(D.seaTex(), 40, 40) })); this.seaTex = (seaM as THREE.MeshLambertMaterial).map!;
    bb.add(new THREE.PlaneGeometry(800, 300).rotateX(-Math.PI / 2).translate(o[0], 0.03, o[2] + 9.6 + 150), seaM);
    bb.add(new THREE.PlaneGeometry(800, 1.4).rotateX(-Math.PI / 2).translate(o[0], 0.012, o[2] + 9.0), lam("dWetSand", () => ({ color: "#d8b880" })));
    for (const [x, z, l, s] of [[-4.2, 4.0, -0.25, 1], [5.8, 3.2, 0.3, 2], [-7.5, 8.0, 0.2, 3], [9.0, 7.5, -0.2, 4], [-12, 5, 0.25, 5], [14, 4, -0.3, 6]] as number[][]) this.place(bb, D.palm(l, s), W(o, x, 0, z), s);
    this.place(bb, D.umbrella(), W(o, -3.0, 0, 5.4));
    this.place(bb, D.lounger(), W(o, -3.4, 0, 5.6), 0.4);
    this.place(bb, D.lounger(), W(o, -2.3, 0, 5.5), -0.2);
    for (let k = 0; k < 4; k++) prop(bb, kit, "tree_default", o[0] + (k % 2 ? 1 : -1) * (22 + k * 6), 0, o[2] - 10 - k * 6, 7);
    bb.build(d);
    this.foam = new THREE.Mesh(new THREE.PlaneGeometry(800, 0.35), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.25, 1.25, 1.25), polygonOffset: true, polygonOffsetFactor: -2 }));
    this.foam.rotation.x = -Math.PI / 2; this.foam.position.set(o[0], 0.045, o[2] + 9.6); d.add(this.foam);
  }

  private buildHall(R: THREE.Object3D, kit: ReturnType<typeof makeKit>) {
    const o = HALLW, g = this.group(R, "hall", "rooms"), b = new Batch();
    this.room(b, o, -2, 2, -5, 0, 2.8, lam("swWallpaper", () => ({ map: rep(wallpaper(), 3, 1) })), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })), [{ x: 0, w: D.DOOR_W, y0: 0, y1: D.DOOR_H }]);
    this.place(b, D.console_(), W(o, -1.75, 0, -2.6), Math.PI / 2);
    b.add(boxGeo(V(o[0] - 0.5, 0.008, o[2] - 4.6), V(o[0] + 0.5, 0.02, o[2] - 0.4)), lam("dRunner", () => ({ color: "#3f6fb5" })));
    b.build(g);
    for (const z of [-1.6, -3.6]) { const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.55), lam("homePicM", () => ({ map: pictureTex() }))); pic.position.set(o[0] + 1.99, 1.7, o[2] + z); pic.rotation.y = -Math.PI / 2; g.add(pic); }
    this.portal(R, "hall", o, 0, "#f4f1ea");
    // a snowy mountain
    const d = this.group(R, "snow", "dests"), bb = new Batch(), r = rng(7);
    bb.add(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2).translate(o[0], 0, o[2] + 80), lam("dSnow", () => ({ map: rep(D.snowTex(), 100, 100) })));
    for (const [x, z, h, rr] of [[-4, 55, 40, 24], [20, 95, 55, 32], [-40, 110, 48, 30], [45, 70, 30, 22], [8, 140, 70, 45]] as number[][]) this.place(bb, D.peak(h, rr), W(o, x, 0, z), r() * 3);
    for (let k = 0; k < 40; k++) { const x = (r() - 0.5) * 50, z = 4 + r() * 40; if (Math.abs(x) < 2.5 && z < 12) continue; this.place(bb, D.pine(2.5 + r() * 2.5), W(o, x, 0, z), r() * 3); }
    for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), lam("dSnowMound", () => ({ color: "#f2f6fb" }))); m.scale.set(4 + r() * 4, 1 + r(), 3 + r() * 3); m.position.set(o[0] + (r() - 0.5) * 30, -0.4, o[2] + 8 + r() * 25); m.updateMatrixWorld(true); bb.addObject(m, new THREE.Matrix4()); }
    bb.build(d);
    void kit;
  }

  private buildKitchen(R: THREE.Object3D) {
    const o = KITCH, g = this.group(R, "kitch", "rooms"), b = new Batch();
    this.room(b, o, -2.5, 2.5, -4, 0, 2.8, lam("swWallpaper", () => ({ map: rep(wallpaper(), 3, 1) })), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })), [{ x: 0, w: 0.58, y0: 0.2, y1: 1.64 }]);
    this.place(b, P.kitchen(), W(o, -2.2, 0, -2.0), Math.PI / 2);
    this.place(b, H.table(), W(o, 1.4, 0, -2.7));
    this.place(b, H.chair(), W(o, 1.4, 0, -3.4));
    b.build(g);
    this.win(g, W(o, 1.2, 1.6, -3.99), 0);
    this.fridge.g.position.set(o[0], 0, o[2]); R.add(this.fridge.g);
    // a gym behind the fridge
    const d = this.group(R, "gym", "dests"), bb = new Batch(), wall = lam("cGymWall", () => ({ map: rep(schoolWall(), 5, 1) }));
    bb.add(boxGeo(V(o[0] - 8, -0.2, o[2] + 0.13), V(o[0] + 8, 0, o[2] + 18)), lam("cGymFloor", () => ({ color: "#d8a864" })));
    this.place(bb, C.court(), W(o, 0, 0, 9));
    bb.add(boxGeo(V(o[0] - 8.12, 0, o[2] + 0.13), V(o[0] - 8, 6, o[2] + 18)), wall);
    bb.add(boxGeo(V(o[0] + 8, 0, o[2] + 0.13), V(o[0] + 8.12, 6, o[2] + 18)), wall);
    bb.add(boxGeo(V(o[0] - 8, 0, o[2] + 18), V(o[0] + 8, 6, o[2] + 18.12)), wall);
    bb.add(boxGeo(V(o[0] - 8, 6, o[2] + 0.13), V(o[0] + 8, 6.2, o[2] + 18), 0, true), lam("ceilM", () => ({ color: "#f4f1ea" })));
    this.place(bb, C.hoop(), W(o, 0, 0, 17.4));
    this.place(bb, C.bleachers(10), W(o, 7.0, 0, 9), Math.PI / 2);
    bb.build(d);
    for (const x of [-4, 0, 4]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) })); w.position.set(o[0] + x, 4.5, o[2] + 17.99); w.rotation.y = Math.PI; d.add(w); }
    this.lights(d, o, [-4, 0, 4], [4, 9, 14], 6.0);
  }

  private buildEntry(R: THREE.Object3D, kit: ReturnType<typeof makeKit>) {
    const o = ENTRY, g = this.group(R, "entry", "rooms"), b = new Batch();
    this.room(b, o, -2, 2, -4, 0, 2.8, lam("swWallpaper", () => ({ map: rep(wallpaper(), 3, 1) })), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })), [{ x: 0, w: D.DOOR_W, y0: 0, y1: D.DOOR_H }]);
    this.place(b, D.coatRack(), W(o, -1.5, 0, -0.6));
    this.place(b, D.shoes(), W(o, -1.2, 0, -1.6), 0.3);
    this.place(b, D.mat(), W(o, 0, 0.008, -0.45));
    this.place(b, D.console_(), W(o, 1.0, 0, -3.75));
    b.build(g);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), lam("homePicM", () => ({ map: pictureTex() }))); pic.position.set(o[0] + 1.0, 1.75, o[2] - 3.99); g.add(pic);
    this.portal(R, "entry", o, 0, "#3f8a5a", { window: true });
    // 1) a desert
    { const d = this.group(R, "desert", "dests"), bb = new Batch(), r = rng(11);
      bb.add(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2).translate(o[0], 0, o[2] + 80), lam("dDune", () => ({ map: rep(D.duneTex(), 90, 90) })));
      for (let k = 0; k < 10; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10), lam("dDuneM", () => ({ color: "#e8b468" }))); m.scale.set(8 + r() * 10, 2 + r() * 2.5, 6 + r() * 6); m.position.set(o[0] + (r() - 0.5) * 80, -0.6, o[2] + 18 + r() * 50); m.updateMatrixWorld(true); bb.addObject(m, new THREE.Matrix4()); }
      for (const [x, z, h] of [[-3.2, 6, 2.4], [3.6, 9, 3.0], [-7, 14, 2.6], [9, 18, 3.4], [1.5, 22, 2.8]] as number[][]) this.place(bb, D.cactus(h), W(o, x, 0, z), r() * 3);
      for (const [x, z, w, h, dd] of [[-30, 120, 30, 18, 20], [25, 140, 40, 24, 22], [70, 110, 26, 14, 18]] as number[][]) this.place(bb, D.mesa(w, h, dd), W(o, x, 0, z));
      for (let k = 0; k < 8; k++) this.place(bb, D.rock(0.3 + r() * 0.5), W(o, (r() - 0.5) * 20, 0, 4 + r() * 16), r() * 3);
      bb.build(d); }
    // 2) a library
    { const d = this.group(R, "library", "dests"), bb = new Batch();
      this.room(bb, o, -6, 6, 0, 12, 4, lam("dLibWall", () => ({ color: "#d8c8a8" })), lam("dCarpet", () => ({ map: rep(carpet(), 3, 3) })), [{ x: 0, w: D.DOOR_W, y0: 0, y1: D.DOOR_H }], true);
      for (const z of [2.5, 5.5, 8.5]) for (const s of [-1, 1]) this.place(bb, D.bookshelf(), W(o, s * 5.75, 0, z), -s * Math.PI / 2);
      for (const x of [-3, 3]) this.place(bb, D.bookshelf(), W(o, x, 0, 11.75), Math.PI);
      for (const x of [-2.5, 2.5]) this.place(bb, D.readingTable(), W(o, x, 0, 6.5));
      bb.add(boxGeo(V(o[0] - 1.6, 0, o[2] + 0.9), V(o[0] - 0.6, 0.8, o[2] + 1.4)), lam("dDesk", () => ({ color: "#7a4a2a" })));
      bb.build(d);
      this.lights(d, o, [-3, 3], [3, 7, 10.5], 4.0); }
    // 3) the school, on a Saturday
    { const d = this.group(R, "saturday", "dests"), bb = new Batch();
      this.room(bb, o, -2.6, 2.6, 0, 26, 3.2, lam("schoolWallM", () => ({ map: rep(schoolWall(), 6, 1) })), lam("schoolFloorM", () => ({ map: rep(schoolFloor(), 3, 18) })), [{ x: 0, w: D.DOOR_W, y0: 0, y1: D.DOOR_H }], true);
      const lockM = lam("lockerM", () => ({ map: D.lockerTex() })), lockTop = lam("lockerTop", () => ({ color: "#2e4a7a" }));
      for (const s of [-1, 1]) for (let z = 1.2; z < 25; z += 1.6) { const x0 = s < 0 ? -2.6 : 2.18, x1 = s < 0 ? -2.18 : 2.6; bb.add(boxGeo(V(o[0] + x0, 0.1, o[2] + z), V(o[0] + x1, 1.95, o[2] + z + 1.6)), lockM); bb.add(boxGeo(V(o[0] + x0, 1.95, o[2] + z), V(o[0] + x1, 2.0, o[2] + z + 1.6)), lockTop); }
      const bn = D.banner("sat", "CLOSED: SATURDAY", 2.8); this.place(bb, bn, W(o, 0, 2.35, 5.0), Math.PI);
      bb.build(d);
      const w = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.0), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) })); w.position.set(o[0], 1.6, o[2] + 25.99); w.rotation.y = Math.PI; d.add(w);
      this.lights(d, o, [0], [3, 7, 11, 15, 19, 23], 3.2, 0.75); }
    void kit;
  }

  private buildSchool(R: THREE.Object3D) {
    const o = SCHOOL, g = this.group(R, "school", "rooms"), b = new Batch();
    this.room(b, o, -2.6, 2.6, -9, 0, 3.2, lam("schoolWallM", () => ({ map: rep(schoolWall(), 6, 1) })), lam("schoolFloorM", () => ({ map: rep(schoolFloor(), 3, 6) })), [{ x: JAN_DOOR, w: D.DOOR_W, y0: 0, y1: D.DOOR_H }, { x: EXIT_DOOR, w: D.DOOR_W, y0: 0, y1: D.DOOR_H }]);
    const lockM = lam("lockerM", () => ({ map: D.lockerTex() })), lockTop = lam("lockerTop", () => ({ color: "#2e4a7a" }));
    for (const s of [-1, 1]) for (let z = -8.6; z < -1.5; z += 1.6) { const x0 = s < 0 ? -2.6 : 2.18, x1 = s < 0 ? -2.18 : 2.6; b.add(boxGeo(V(o[0] + x0, 0.1, o[2] + z), V(o[0] + x1, 1.95, o[2] + z + 1.6)), lockM); b.add(boxGeo(V(o[0] + x0, 1.95, o[2] + z), V(o[0] + x1, 2.0, o[2] + z + 1.6)), lockTop); }
    b.build(g);
    this.lights(g, o, [0], [-7.5, -4.5, -1.5], 3.2);
    const exitSign = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.06), [0, 1, 2, 3, 4, 5].map((k) => k === 5 ? new THREE.MeshBasicMaterial({ map: D.signTex("exit", "EXIT", "#2a9a4a"), color: new THREE.Color(1.4, 1.4, 1.4) }) : new THREE.MeshBasicMaterial({ color: "#2a9a4a" })));
    exitSign.position.set(o[0] + EXIT_DOOR, 2.35, o[2] - 0.16); exitSign.rotation.y = Math.PI; g.add(exitSign);
    this.portal(R, "jan", o, JAN_DOOR, "#8a8f98", { sign: D.signTex("jan", "JANITOR", "#2a2c36") });
    this.portal(R, "exit", o, EXIT_DOOR, "#3f8a5a", { window: true });
    // a pizza party behind the janitor's closet
    { const d = this.group(R, "pizza", "dests"), bb = new Batch();
      this.room(bb, o, -5.2, 1.0, 0, 8, 3.2, lam("partyWallM", () => ({ map: rep(partyWall(), 3, 1) })), lam("schoolFloorM", () => ({ map: rep(schoolFloor(), 3, 3) })), [{ x: JAN_DOOR, w: D.DOOR_W, y0: 0, y1: D.DOOR_H }], true);
      this.place(bb, H.table(), W(o, -1.4, 0, 4.6));
      for (const [dx, dz] of [[-0.3, -0.05], [0.3, 0.1]]) this.place(bb, C.pizzaBox(), W(o, -1.4 + dx, 0.76, 4.6 + dz));
      for (const [dx, dz, a] of [[-0.35, 0.0, 0.3], [0.32, 0.12, 2.0], [0.0, -0.25, 4.0]]) this.place(bb, C.slice(), W(o, -1.4 + dx, 0.775, 4.6 + dz), a);
      const cols = ["#e8402e", "#f4c430", "#3f8ab5", "#5ae0c8", "#e86a9a", "#7b5ac9"];
      for (let k = 0; k < 14; k++) this.place(bb, D.balloon(cols[k % 6], 2.2 + (k % 3) * 0.25), W(o, -5.0 + (k % 7) * 0.95, 0, k < 7 ? 7.6 : 0.6 + (k % 2) * 0.2));
      this.place(bb, D.banner("party", "PIZZA PARTY!", 3.0), W(o, -2.1, 2.5, 7.85), Math.PI);
      bb.build(d);
      this.lights(d, o, [-3.6, -1.0], [2.5, 5.5], 3.2, 1.6, ["#ff7ab0", "#7ae0ff", "#ffe07a", "#b07aff"]);
      this.disco.position.set(o[0] - 1.4, 2.6, o[2] + 4.6); }
    // Mom's kitchen behind the exit door
    { const d = this.group(R, "homek", "dests"), bb = new Batch();
      this.room(bb, o, -0.6, 6, 0, 6, 2.8, lam("swWallpaper", () => ({ map: rep(wallpaper(), 3, 1) })), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })), [{ x: EXIT_DOOR, w: D.DOOR_W, y0: 0, y1: D.DOOR_H }], true);
      this.place(bb, P.kitchen(), W(o, 3.4, 0, 5.6), Math.PI);
      this.place(bb, H.table(), W(o, 1.9, 0, 3.2));
      this.place(bb, D.pancakeStack(), W(o, 1.75, 0.76, 3.1));
      this.place(bb, H.mug("#f4c430"), W(o, 2.2, 0.76, 3.3), 0.6);
      this.place(bb, H.chair(), W(o, 1.9, 0, 3.95), Math.PI);
      bb.build(d);
      this.win(d, W(o, 5.99, 1.6, 2.5), -Math.PI / 2); }
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
    this.sun.castShadow = OUTDOOR.includes(s.look);
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
    const far = OUTDOOR.includes(s.look) ? 600 : 120;
    this.fog.near = far * 0.1; this.fog.far = far;
    scene.fog = this.fog; scene.background = null;
    this.clouds.forEach((m, k) => {
      const a = (k / 12) * Math.PI * 2 + 0.3, d = 560 + (k % 3) * 70, w = 140 + (k % 4) * 34;
      m.visible = OUTDOOR.includes(s.look);
      m.position.set(cam.position.x + Math.cos(a) * d, 60 + (k % 4) * 34, cam.position.z + Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
    });
    const where = whereAt(t);
    const lx = (o: V3) => Math.abs(cam.position.x - o[0]) < 500;
    // which destination is behind each portal, and which rooms are hidden (camera out in an open-air place)
    const outside = (o: V3) => lx(o) && cam.position.z - o[2] > 0.02;
    this.rooms.bed.visible = !outside(BED);
    this.dests.desert.visible = entryDest(t) === "desert"; this.dests.library.visible = entryDest(t) === "library"; this.dests.saturday.visible = entryDest(t) === "saturday";
    this.dests.pizza.visible = schoolDest(t) === "pizza"; this.dests.homek.visible = schoolDest(t) === "homek";
    this.doors.bed.set(bedDoor(t)); this.doors.hall.set(hallDoor(t)); this.fridge.set(fridgeOpen(t)); this.doors.entry.set(entryDoor(t));
    this.doors.jan.set(janDoor(t)); this.doors.exit.set(exitDoor(t));
    // beach life: waves, foam, gulls
    this.seaTex.offset.set((t * 0.01) % 1, (t * 0.03) % 1);
    this.foam.position.z = BED[2] + 9.6 + 0.35 * Math.sin(t * 1.3);
    this.gulls.forEach((gl, k) => {
      const a = t * 0.45 + k * 2.1, R = 2.0 + 0.6 * k;
      gl.root.position.set(BED[0] + 1.0 + R * Math.cos(a), 3.6 + 0.4 * k + 0.15 * Math.sin(t * 2 + k), BED[2] + 3.0 + R * Math.sin(a));
      gl.root.rotation.set(0, -a - Math.PI / 2, 0.25); gl.flap(t + k);
    });
    // snow drifting in through the bathroom door
    this.flakes.visible = lx(HALLW) && hallDoor(t) > 0.05;
    if (this.flakes.visible) {
      const m4 = new THREE.Matrix4(), fr = (i: number, s: number) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
      for (let i = 0; i < 320; i++) {
        const inside = i < 70, x = inside ? (fr(i, 1) - 0.5) * 0.9 : (fr(i, 1) - 0.5) * 14, z = inside ? -fr(i, 2) * 1.2 * hallDoor(t) : fr(i, 2) * 14;
        const y = 2.6 - ((t * (0.5 + 0.3 * fr(i, 3)) + fr(i, 4) * 2.6) % 2.6) + (inside ? 0 : 0.6 * fr(i, 5) * 3);
        m4.makeTranslation(HALLW[0] + x + 0.2 * Math.sin(t + i), y, HALLW[2] + z); this.flakes.setMatrixAt(i, m4);
      }
      this.flakes.instanceMatrix.needsUpdate = true;
    }
    // the gym: a ball bouncing between two players
    this.ball.visible = lx(KITCH);
    this.ball.position.set(KITCH[0] + 0.3, 0.12 + 0.9 * Math.abs(Math.sin(t * 3.2)), KITCH[2] + 8.5);
    this.disco.visible = lx(SCHOOL) && this.dests.pizza.visible; this.disco.rotation.y = t * 1.5;

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
    const hy = person("hero", h.p, HERO, h.fo, 4);
    const holdIn = (obj: THREE.Object3D, p: V3, o: Outfit, yaw: number | null | undefined, lift = 0) => {
      if (yaw === null || yaw === undefined) return;
      const n = V(Math.sin(yaw), 0, Math.cos(yaw));
      obj.visible = true; obj.position.copy(V(...p)).add(V(0, handY(o) - 0.05 + lift, 0)).addScaledVector(n, OUT); obj.rotation.set(0, yaw, 0);
    };
    this.screen.visible = false; this.pan.visible = false; this.flip.visible = false; for (const ht of this.hats) ht.visible = false;
    if (h.held === "sunscreen") holdIn(this.screen, h.p, HERO, hy, -0.04);
    // the gym players
    if (lx(KITCH)) {
      person("g1", W(KITCH, -0.6, 0, 9.0), STUDENTS[0], { mode: "stand", expr: "grin", wave: 0.5 + 0.5 * Math.sin(t * 6) }, 10);
      person("g2", W(KITCH, 1.3, 0, 10.0), STUDENTS[4], { mode: "stand", expr: "laugh" }, 14);
    }
    if (lx(ENTRY) && entryDest(t) === "library") {
      person("libr", W(ENTRY, -0.7, 0, 1.9), LIBR, { mode: "stand", expr: t >= T("library") + 0.2 ? "stern" : "neutral", look: -0.4 }, 31);
      person("reader1", W(ENTRY, -2.5, 0, 5.7), STUDENTS[3], { mode: "stand", expr: "neutral", look: 0.3 }, 32);
      person("reader2", W(ENTRY, 2.8, 0, 7.4), STUDENTS[6], { mode: "stand", expr: "smile", look: -0.3 }, 33);
    }
    if (lx(SCHOOL)) {
      if (where === "school" && t < T("and", 3)) {
        person("c1", W(SCHOOL, -1.9, 0, -4.2), STUDENTS[1], { mode: "stand", expr: "laugh", facing: 1, look: 0.7 }, 21);
        person("c2", W(SCHOOL, -1.2, 0, -4.7), STUDENTS[2], { mode: "stand", expr: "smile", facing: -1, look: -0.7 }, 22);
        person("c3", W(SCHOOL, 1.95, 0, -6.2), STUDENTS[5], { mode: "stand", expr: "neutral" }, 23);
      }
      if (schoolDest(t) === "pizza") {
        const party: [number, number, number][] = [[-2.7, 4.2, 0], [-0.1, 4.3, 1], [-2.3, 5.9, 2], [-0.6, 6.0, 3], [-1.4, 6.6, 4]];
        party.forEach(([x, z, k]) => {
          const p = W(SCHOOL, x, 0, z), o = STUDENTS[k], y = person("party" + k, p, o, { mode: "stand", expr: k % 2 ? "laugh" : "grin", wave: 0.5 + 0.5 * Math.sin(t * (7 + k) + k) }, 40 + k);
          if (y !== null && y !== undefined) { const ht = this.hats[k]; ht.visible = true; ht.position.set(p[0], headTop(o) - 0.06, p[2]).addScaledVector(V(Math.sin(y), 0, Math.cos(y)), -0.02); }
        });
      }
      if (schoolDest(t) === "homek") {
        const mp = W(SCHOOL, 3.4, 0, 4.55), my = person("mom", mp, MOM, { mode: "stand", expr: t >= T("pancakes") + 0.3 ? "grin" : "smile", prop: "hold2", holdDx: 40 }, 21);
        holdIn(this.pan, mp, MOM, my, -0.02);
        if (this.pan.visible) { const k = (t * 1.1) % 1; this.flip.visible = true; this.flip.position.copy(this.pan.position).add(V(0, 0.04 + 0.45 * Math.sin(Math.PI * k), 0)); this.flip.rotation.set(Math.PI * 2 * k, my ?? 0, 0, "YXZ"); }
      }
    }
    for (let k = ai; k < this.actors.length; k++) this.actors[k].mesh.visible = false;
    for (let k = fi; k < this.fxs.length; k++) this.fxs[k].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return look;
  }
}
