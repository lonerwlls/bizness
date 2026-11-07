// "What if your dreams were memories": one story in steps. A dream of a red door, a flowerpot and a key; the same
// door on the way to school; the key under the pot; a dusty hallway and a staircase; a dream of three numbers; the
// chest in the attic, its lock, Grandpa's photo, a map; and tonight's dream, an island. Wide and medium shots that show
// what happens (no subtitles, no cards). Props are our own 3D models (props.ts); cuts follow the narration (voice.ts).
import * as THREE from "three";
import { Batch, V, lam, boxGeo, prop, house } from "../bridge/build";
import { rep, ctex, planksHD, cloudHD, rng, stoneHD, grassHD, cobbleHD } from "../bridge/paint";
import { bodyFront, Outfit, Expr, FrontOpts, fxContact, HOLD_DY } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx, SU } from "../bridge/cast";
import { makeKit } from "../bridge/kitgen";
import * as P from "../future/props";
import * as C from "../copy/props";
import * as D from "../doors/props";
import * as R2 from "./props";
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
type Look = "night" | "dream" | "day" | "house" | "attic";
const OUTDOOR: Look[] = ["day", "dream"];
const PR = (l: Partial<LightPreset>, k: Partial<WorldLook>) => ({ L: { ...LIGHTS.day, ...l }, K: { ...LOOK.day, ...k } });
const PRESETS: Record<Look, { L: LightPreset; K: WorldLook }> = {
  night: PR({ lit: [0.95, 0.9, 1.05], shade: [0.2, 0.2, 0.34], lift: [0.04, 0.04, 0.1], fog: "#2a2a48", charTint: [0.9, 0.88, 1.0], sunCol: "#ffd8a0", sunI: 1.4, hemiI: 0.3 }, {}),
  dream: PR({ lit: [0.95, 1.0, 1.35], shade: [0.3, 0.28, 0.5], lift: [0.1, 0.08, 0.2], fog: "#7a78b8", charTint: [0.9, 0.92, 1.1], sunCol: "#c8c8ff", sunI: 1.6 },
    { sky: { c: ["#8a88c8", "#6e6cb0", "#56549a", "#403e84", "#2c2a68"], e: [0, 4, 10, 20, 45] } }),
  day: PR({}, {}),
  house: PR({ lit: [1.3, 1.18, 1.0], shade: [0.3, 0.28, 0.34], lift: [0.06, 0.05, 0.07], fog: "#c8b898", charTint: [0.98, 0.94, 0.88] }, {}),
  attic: PR({ lit: [1.5, 1.3, 1.05], shade: [0.32, 0.27, 0.3], lift: [0.07, 0.05, 0.06], fog: "#d8c0a0", charTint: [1.02, 0.95, 0.88] }, {}),
};
const SUN_OF: Record<Look, [number, number]> = { night: [100, 25], dream: [60, 40], day: [70, 45], house: [50, 40], attic: [40, 35] };
const FOG: Record<Look, [number, number]> = { night: [20, 120], dream: [3, 34], day: [60, 600], house: [20, 120], attic: [20, 120] };

// ---------------- layout ----------------
const BR: V3 = [6000, 0, 0];        // bedroom
const ST: V3 = [-3000, 0, 0];       // the street with the red door (the house hallway is inside it)
const AT: V3 = [3000, 0, 0];        // the attic
const IS: V3 = [9000, 0, 0];        // the dream island
const W = (o: V3, x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
const BED: V3 = W(BR, -1.3, 0, -2.6);
const SLEEP: V3 = [BED[0], 0.575, BED[2] - 0.7 + 1.78];
const NIGHT_STAND: V3 = W(BR, -2.15, 0, -3.6);
const BY_STAND: V3 = W(BR, -2.1, 0, -2.95);
const STEP_Y = 0.16, POT: V3 = W(ST, 0.6, STEP_Y, 0.6), DOOR_SPOT: V3 = W(ST, 0.62, STEP_Y, 0.42);
const STAIR: V3 = W(ST, 1.8, 0, -1.6);     // bottom of the staircase; it climbs toward -z
const CHEST: V3 = W(AT, 0, 0, -2.5), AT_SPOT: V3 = W(AT, 0.62, 0, -1.9);

// ---------------- cast ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const NOPACK: Outfit = { ...HERO, pack: undefined };
const PASSER: Outfit = { jacket: "#3f9a5a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#3a2418", skin: HEAD };
const HH = 2 * 118 * 0.94;
const handY = (o: Outfit) => { const B = o.build === "stout" ? [1.15, 1.32] : [1.1, 1.4]; return (B[1] + B[0] - HOLD_DY) * HH * SU; };
const OUT = 0.03;

// ---------------- the story by time ----------------
type Where = "bed" | "dream1" | "street" | "hall" | "bed2" | "dream2" | "bed3" | "attic" | "bed4" | "dream3";
const whereAt = (t: number): Where => {
  if (t < T("dream", 1)) return "bed";
  if (t < T("then")) return "dream1";
  if (t < T("inside", 1)) return "street";
  if (t < T("rule", 2)) return "hall";
  if (t < T("three")) return "bed2";
  if (t < T("you", 8)) return "dream2";
  if (t < T("rule", 3)) return "bed3";
  if (t < T("every", 4)) return "attic";
  if (t < T("tonight")) return "bed4";
  return "dream3";
};
type Held = "pot" | "key" | "pen" | "photo" | "map";
type HeroPose = { p: V3; o: Outfit; fo: FrontOpts; lie?: boolean; held?: Held; dx?: number };
const walk = (t: number, a: number, b: number, p0: V3, p1: V3) => lerp3(p0, p1, clamp01((t - a) / (b - a)));
const moving = (t: number, a: number, b: number) => t > a && t < b;
const stairY = (z: number) => { const k = Math.floor((STAIR[2] - z) / 0.27); return k < 0 ? 0.05 : 0.19 * Math.min(10, k + 1); };
function heroAt(t: number): HeroPose | null {
  const w = whereAt(t);
  const pose = (p: V3, expr: Expr, mv: boolean, extra: Partial<FrontOpts> = {}, o = HERO, held?: Held, dx?: number): HeroPose =>
    ({ p, o, fo: mv ? { mode: "stroll", phase: t * 1.1, expr, ...extra } : { mode: "stand", expr, ...extra, ...(held ? { prop: "hold2" as const, holdDx: dx } : {}) }, held, dx });
  if (w === "bed" || w === "bed2" && t >= T("that") - 0.1 || w === "bed4") return { p: SLEEP, o: NOPACK, fo: { mode: "stand", expr: "smile_closed", blink: 1, look: -0.4 }, lie: true };
  if (w === "dream1" || w === "dream2" || w === "dream3") return null;
  if (w === "bed2") return pose(BY_STAND, "smile", false, { look: -0.5 }, NOPACK, "pen", 14);
  if (w === "bed3") return pose(BY_STAND, t >= T("sticky") ? "grin" : "nervous", false, { look: -0.5 }, NOPACK, "pen", 14);
  if (w === "street") {
    // walks along the sidewalk, stops at the red door, lifts the pot, finds the key, goes up to the door
    const a0 = T("then") - 0.1, a1 = T("you", 2) - 0.1, b0 = T("you", 3) - 0.9, b1 = T("you", 3) - 0.05, c0 = T("and", 1) + 0.3, c1 = c0 + 1.6;
    const S0 = W(ST, -6, 0.0, 2.6), S1 = W(ST, 0.4, 0.0, 2.6), S2 = W(ST, 0.95, 0.0, 1.25);
    let p: V3, mv = false;
    if (t < a1) { p = walk(t, a0, a1, S0, S1); mv = moving(t, a0, a1); }
    else if (t < b0) p = S1;
    else if (t < c0) { p = walk(t, b0, b1, S1, S2); mv = moving(t, b0, b1); }
    else { p = walk(t, c0, c1, S2, DOOR_SPOT); mv = moving(t, c0, c1); }
    let expr: Expr = "smile";
    if (t >= T("you", 2)) expr = "shock";
    if (t >= T("you", 3)) expr = "nervous";
    if (t >= T("the", 4)) expr = "shock";
    if (t >= T("your", 2)) expr = "grin";
    const pot = t >= T("you", 3) + 0.1 && t < T("the", 4) + 0.9, key = t >= T("the", 4) + 0.9;
    return pose(p, expr, mv, { look: t >= T("you", 2) && t < T("you", 3) ? -0.5 : 0 }, HERO, mv ? undefined : pot ? "pot" : key ? "key" : undefined, pot ? 80 : 14);
  }
  if (w === "hall") {
    const i0 = T("inside", 1) + 0.1, i1 = i0 + 1.6, s0 = T("but") + 0.1, s1 = T("rule", 2) - 0.2;
    if (t < i0) return pose(DOOR_SPOT, "nervous", false, {}, HERO, "key", 14);
    if (t < s0) { const p = t < i0 + 0.4 ? walk(t, i0, i0 + 0.4, DOOR_SPOT, W(ST, 0, 0.05, 0.1)) : walk(t, i0 + 0.4, i1, W(ST, 0, 0.05, 0.1), W(ST, 0.4, 0.05, -1.6)); return pose(p, t >= T("you", 5) ? "smile" : "shock", moving(t, i0, i1), { look: t >= T("you", 5) ? 0.5 : 0 }); }
    const z = lerp(STAIR[2] + 0.3, STAIR[2] - 2.6, clamp01((t - s0) / (s1 - s0)));
    const x = t < s0 + 0.3 ? lerp(0.4, STAIR[0], clamp01((t - s0) / 0.3)) : STAIR[0];
    return pose([x, stairY(z), z], "grin", true);
  }
  // the attic: walk to the chest, open it, the photo, the map
  const a0 = T("rule", 3) - 0.1, a1 = a0 + 2.0;
  let expr: Expr = "nervous";
  if (t >= T("click") - 0.05) expr = "shock";
  if (t >= T("a", 8)) expr = "smile";
  if (t >= T("on", 3)) expr = "shock";
  if (t >= T("under")) expr = "grin";
  if (t < a1) return pose(walk(t, a0, a1, W(AT, 0.4, 0, 0.6), AT_SPOT), "nervous", moving(t, a0, a1));
  const held: Held | undefined = t >= T("inside", 2) && t < T("map") - 0.1 ? "photo" : t >= T("map") - 0.1 ? "map" : undefined;
  return pose(AT_SPOT, expr, false, {}, HERO, held, held === "map" ? 72 : 26);
}
/** the three dials */
const digits = (t: number) => {
  const seq = (a: number, b: number, c: number) => (t >= c ? "724" : t >= b ? "720" : t >= a ? "700" : "000");
  return t < T("rule", 3) ? seq(T("seven", 1), T("two", 2), T("four", 1)) : seq(T("seven", 2), T("two", 3), T("four", 2));
};
const lidOpen = (t: number) => (t < T("rule", 3) ? 0 : ramp(t, T("click") + 0.25, 0.7));
const doorOpen = (t: number) => ramp(t, T("opens") - 0.05, 0.6);

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; look: Look; cInf: number; cam: (u: number, f: number) => Cam };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
const mvAt = (o: V3, p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => mv(add3(o, p0), add3(o, p1), add3(o, l0), add3(o, l1), fov, roll, ease);
const heldAt = (t: number) => { const h = heroAt(t); return h ? add3(h.p, [0, handY(h.o), OUT]) : ([0, 0, 0] as V3); };
/** close on whatever the hero holds; the camera hangs in front of it (+z side) */
const onHeld = (dist: number, dy = 0.03, dx = 0.02) => (u: number, f: number): Cam => { const c = heldAt(f / FPS); return { pos: [c[0] + dx, c[1] + dy, c[2] + dist - 0.03 * u], look: c, fov: 36, roll: 0 }; };
const S: ShotDef[] = [];
export const SHOTS = S;
const shot = (a: number, look: Look, cInf: number, cam: (u: number, f: number) => Cam) => S.push({ a, look, cInf, cam });
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  const sleeping = (a: number) => shot(a, "night", 6, mvAt(BR, [0.5, 2.3, -1.3], [0.35, 2.2, -1.5], [-1.3, 0.6, -3.1], [-1.3, 0.6, -3.1], 50, 0, true));
  // every night, the same dream
  sleeping(0);
  shot(E("dream", 1), "dream", 4, mvAt(ST, [0, 1.7, 10], [0, 1.6, 6.5], [0, 1.6, 0], [0, 1.5, 0], 46, 0, true));
  shot(E("a", 1), "dream", 8, mvAt(ST, [0.35, 1.35, 3.2], [0.3, 1.3, 2.7], [0, 1.15, 0], [0, 1.15, 0], 44, 0.02));
  shot(E("a", 2), "dream", 10, mvAt(ST, [1.25, 0.85, 2.1], [1.2, 0.8, 1.95], [0.6, 0.35, 0.6], [0.6, 0.35, 0.6], 40, -0.02));
  shot(E("a", 3), "dream", 12, mvAt(ST, [0.95, 0.42, 1.45], [0.9, 0.38, 1.35], [0.66, 0.18, 0.66], [0.66, 0.18, 0.66], 38, 0.02));
  // one morning, on the way to school
  shot(E("then"), "day", 2, mvAt(ST, [-8.5, 2.1, 9.0], [-6.5, 2.0, 8.5], [-3.5, 1.0, 2.0], [-0.5, 1.0, 1.5], 46));
  shot(E("you", 2), "day", 6, mvAt(ST, [2.4, 1.55, 5.6], [2.3, 1.55, 5.4], [0.3, 1.2, 2.4], [0.3, 1.2, 2.4], 44, 0.02));
  shot(E("the", 2), "day", 6, mvAt(ST, [-0.6, 1.65, 5.8], [-0.5, 1.6, 5.2], [0.1, 1.5, 0], [0.1, 1.5, 0], 46, 0, true));
  shot(E("you", 3), "day", 6, mvAt(ST, [2.5, 1.35, 3.4], [2.4, 1.33, 3.25], [0.8, 0.8, 0.9], [0.8, 0.8, 0.9], 44, -0.02));
  shot(E("the", 4), "day", 12, mvAt(ST, [0.8, 0.62, 1.25], [0.78, 0.58, 1.18], [0.6, 0.17, 0.6], [0.6, 0.17, 0.6], 38, 0.02));
  shot(E("your", 2), "day", 6, mvAt(ST, [2.2, 1.5, 3.9], [2.15, 1.5, 3.8], [0.9, 1.1, 1.2], [0.9, 1.12, 1.2], 44, 0.02));
  shot(E("they"), "day", 2, mvAt(ST, [-5.0, 2.8, 11], [-4.4, 2.6, 10], [0, 2.0, 0], [0, 2.0, 0], 46, 0, true));
  shot(E("and", 1), "day", 4, mvAt(ST, [0, 1.6, 7.5], [0, 1.6, 5.5], [0, 1.3, 0], [0, 1.3, 0], 46, 0, true));
  // rule one: the key opens the red door
  shot(E("rule", 1), "day", 6, mvAt(ST, [2.0, 1.55, 2.6], [1.95, 1.55, 2.5], [0.4, 1.2, 0.3], [0.4, 1.22, 0.3], 44, 0.02));
  shot(E("the", 5), "day", 10, mvAt(ST, [-1.6, 1.5, 2.6], [-1.5, 1.48, 2.45], [0.3, 1.1, 0], [0.3, 1.1, 0], 46, -0.02));
  shot(E("inside", 1), "house", 4, mvAt(ST, [-1.8, 1.7, -5.5], [-1.7, 1.65, -5.2], [0, 1.1, 0], [0, 1.1, 0], 48, 0, true));
  shot(E("a", 4), "house", 6, mvAt(ST, [-2.6, 1.8, -5.6], [-2.5, 1.78, -5.4], [1.4, 1.0, -2.0], [1.4, 1.05, -2.0], 48, 0.02));
  shot(E("you", 5), "house", 6, mvAt(ST, [-1.0, 1.55, -4.2], [-0.95, 1.55, -4.1], [0.3, 1.1, -1.6], [0.3, 1.12, -1.6], 44, -0.02));
  shot(E("but"), "house", 4, mvAt(ST, [-1.9, 2.1, -3.2], [-1.9, 2.3, -3.4], [1.8, 1.4, -2.8], [1.8, 1.9, -3.6], 48, 0, true));
  // rule two: that night, three numbers
  shot(E("rule", 2), "night", 6, mvAt(BR, [-0.3, 1.6, -0.6], [-0.35, 1.6, -0.75], [-2.0, 1.0, -3.2], [-2.0, 1.0, -3.2], 46, 0.02));
  sleeping(E("that"));
  shot(E("three"), "dream", 12, mvAt(AT, [0.12, 0.55, -1.55], [0.1, 0.5, -1.7], [0, 0.33, -2.24], [0, 0.33, -2.24], 36, 0.02));
  shot(E("you", 8), "night", 6, mvAt(BR, [-0.7, 1.55, -1.3], [-0.75, 1.55, -1.4], [-2.1, 1.0, -3.1], [-2.1, 1.0, -3.1], 46, -0.02));
  shot(E("sticky"), "night", 12, mvAt(BR, [-1.85, 0.95, -3.2], [-1.88, 0.9, -3.28], [-2.02, 0.56, -3.5], [-2.02, 0.56, -3.5], 38, 0.02));
  // rule three: the chest, the photo
  shot(E("rule", 3), "attic", 4, mvAt(AT, [-1.0, 1.9, 0.8], [-0.9, 1.85, 0.6], [0.3, 0.6, -2.5], [0.3, 0.6, -2.5], 50, 0, true));
  shot(E("in", 1), "attic", 8, mvAt(AT, [-1.0, 1.2, -1.1], [-0.95, 1.15, -1.2], [0, 0.4, -2.4], [0, 0.4, -2.4], 42, 0.02));
  shot(E("seven", 2), "attic", 12, mvAt(AT, [0.12, 0.55, -1.55], [0.1, 0.52, -1.65], [0, 0.33, -2.24], [0, 0.33, -2.24], 36, -0.02));
  shot(E("click"), "attic", 6, mvAt(AT, [-0.9, 1.5, 0.3], [-0.85, 1.48, 0.15], [0.3, 0.7, -2.2], [0.3, 0.7, -2.2], 48, 0.02));
  shot(E("inside", 2), "attic", 6, mvAt(AT, [1.7, 1.5, -0.4], [1.65, 1.5, -0.5], [0.6, 1.1, -1.9], [0.6, 1.12, -1.9], 44, -0.02));
  shot(E("a", 8), "attic", 14, onHeld(0.32));
  shot(E("on", 3), "attic", 14, onHeld(0.3, 0.02, -0.02));
  shot(E("and", 3), "attic", 4, mvAt(AT, [-1.6, 1.7, 0.2], [-1.4, 1.65, 0.0], [0.6, 1.0, -1.9], [0.6, 1.0, -1.9], 48, 0, true));
  shot(E("under"), "attic", 10, mvAt(AT, [0.15, 1.25, -1.65], [0.12, 1.2, -1.75], [0, 0.4, -2.5], [0, 0.4, -2.5], 40, 0.02));
  shot(E("map"), "attic", 6, mvAt(AT, [1.6, 1.45, -0.6], [1.55, 1.45, -0.7], [0.6, 1.1, -1.9], [0.6, 1.12, -1.9], 44, 0.02));
  // every night, the same dream: now it's an island
  sleeping(E("every", 4));
  shot(E("tonight"), "dream", 2, mvAt(IS, [-6, 3.2, 26], [-4, 2.6, 18], [0, 1.2, 0], [0, 1.4, 0], 46, 0, true));
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
const kidWall = () => ctex("kidWall", 512, 512, (g, r) => {
  g.fillStyle = "#cfe0f0"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) { g.fillStyle = "rgba(255,255,255,0.5)"; const x = r() * 512, y = r() * 512; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
});
const nightWin = () => ctex("nightWindow", 256, 320, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 320); gr.addColorStop(0, "#14143a"); gr.addColorStop(1, "#2a2a5a"); g.fillStyle = gr; g.fillRect(0, 0, 256, 320);
  g.fillStyle = "#f4f0d0"; g.beginPath(); g.arc(80, 80, 22, 0, 7); g.fill(); g.fillStyle = "#ffffff"; for (const [x, y] of [[170, 60], [200, 120], [60, 170], [190, 200], [120, 40]]) g.fillRect(x, y, 4, 4);
  g.fillStyle = "#1a2418"; g.fillRect(0, 260, 256, 60);
  g.fillStyle = "#c8c0b0"; g.fillRect(0, 0, 256, 14); g.fillRect(0, 306, 256, 14); g.fillRect(0, 0, 14, 320); g.fillRect(242, 0, 14, 320); g.fillRect(121, 0, 14, 320); g.fillRect(0, 153, 256, 14);
});
const atticWood = () => ctex("atticBoards", 512, 512, (g, r) => {
  for (let x = 0; x < 512; x += 32) { g.fillStyle = (x / 32) % 2 ? "#8a6440" : "#7a5634"; g.fillRect(x, 0, 32, 512); g.fillStyle = "rgba(40,20,10,0.4)"; g.fillRect(x, 0, 3, 512); }
  for (let i = 0; i < 300; i++) { g.fillStyle = "rgba(40,20,10,0.15)"; g.fillRect(r() * 512, r() * 512, 2, 20); }
});

// ---------------- the world ----------------
export class DreamsWorld {
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
  private door = D.door("#c8302a");
  private pot = R2.flowerpot();
  private key = R2.key();
  private chest = R2.chest();
  private photo = R2.photo({ ...HERO, pack: undefined });
  private map = R2.map();
  private mapIn = R2.map();
  private sticky = R2.sticky();
  private pen = R2.pen();
  private seaTex!: THREE.Texture;

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
    this.buildBedroom(R); this.buildStreet(R); this.buildAttic(R); this.buildIsland(R);
    for (const m of [this.pot, this.key, this.photo, this.map, this.mapIn, this.sticky, this.pen]) R.add(m);
  }

  private place(b: Batch, g: THREE.Object3D, p: V3, ry = 0) { g.position.set(...p); g.rotation.y = ry; g.updateMatrixWorld(true); b.addObject(g, new THREE.Matrix4()); }

  private buildBedroom(R: THREE.Object3D) {
    const o = BR, b = new Batch(), wall = lam("kidWallM", () => ({ map: rep(kidWall(), 2, 1) }));
    const X = (x: number) => o[0] + x;
    b.add(boxGeo(V(X(-2.62), -0.2, -4.12), V(X(2.62), 0.008, 0.12)), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })));
    b.add(boxGeo(V(X(-2.62), 2.8, -4.12), V(X(2.62), 2.92, 0.12), 0, true), lam("ceilM", () => ({ color: "#f4f1ea" })));
    b.add(boxGeo(V(X(-2.62), 0, -4.12), V(X(-2.5), 2.8, 0.12)), wall); b.add(boxGeo(V(X(2.5), 0, -4.12), V(X(2.62), 2.8, 0.12)), wall);
    b.add(boxGeo(V(X(-2.5), 0, -4.12), V(X(2.5), 2.8, -4.0)), wall); b.add(boxGeo(V(X(-2.5), 0, 0), V(X(2.5), 2.8, 0.12)), wall);
    this.place(b, P.bed(), BED);
    this.place(b, P.nightstand(), NIGHT_STAND);
    this.place(b, R2.bedLamp(), W(BR, -2.3, 0.55, -3.7));
    b.add(boxGeo(V(X(-0.4), 0.008, -3.2), V(X(1.4), 0.02, -1.6)), lam("dRugB", () => ({ color: "#f4c430" })));
    this.place(b, C.notebook(), W(BR, 1.6, 0.0, -3.6), 0.3);
    b.build(R);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), new THREE.MeshBasicMaterial({ map: nightWin() })); win.position.set(X(0.6), 1.6, -3.99); R.add(win);
    this.quilt.position.set(...BED); R.add(this.quilt);
  }

  private buildStreet(R: THREE.Object3D) {
    const o = ST, b = new Batch(), kit = makeKit(), r = rng(5);
    b.add(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2).translate(o[0], -0.01, -80), lam("grassT", () => ({ map: rep(grassHD(), 160, 160) })));
    b.add(new THREE.PlaneGeometry(140, 6).rotateX(-Math.PI / 2).translate(o[0], 0.0, 6.0), lam("roadT", () => ({ map: rep(cobbleHD(), 40, 2) })));
    b.add(boxGeo(V(o[0] - 70, -0.1, 1.8), V(o[0] + 70, 0.005, 3.0), 2), lam("walkT", () => ({ map: stoneHD("walkHD", ["#e6dccb", "#ddd2bf", "#ece3d4", "#d6cab6"], "#b0a390") })));
    b.add(boxGeo(V(o[0] - 0.6, -0.1, 0.9), V(o[0] + 0.6, 0.004, 1.8)), lam("walkT", () => ({ map: stoneHD("walkHD", ["#e6dccb", "#ddd2bf", "#ece3d4", "#d6cab6"], "#b0a390") })));
    this.place(b, R2.oldHouse(), o);
    for (const [x, si] of [[-11, 1], [11, 2], [-22, 3], [22, 4], [-33, 5], [33, 6]]) house(b, o[0] + x, -4, 0, 8, 7, [7, 8.4, 7.6][si % 3], si, 0);
    for (const x of [-8, 8, -16, 16, -27, 27]) prop(b, kit, "tree_oak", o[0] + x, 0, 0.5, 5 + (Math.abs(x) % 2));
    for (let x = -40; x <= 40; x += 10) prop(b, kit, "lantern", o[0] + x + 5, 0, 3.3, 3.4);
    for (let i = 0; i < 16; i++) prop(b, kit, i % 3 ? "tree_default" : "tree_cone", o[0] + (r() - 0.5) * 90, 0, 20 + r() * 20, 8 + (i % 4));
    // the hallway inside: a staircase and furniture under dust sheets
    this.place(b, C.stairs(10), STAIR, Math.PI);
    this.place(b, R2.sheeted(), W(ST, -2.2, 0.05, -3.5), 0.3);
    this.place(b, R2.sheeted(), W(ST, -1.2, 0.05, -5.6), -0.2);
    this.place(b, R2.cardboard(), W(ST, -2.6, 0.05, -1.4), 0.4);
    this.place(b, R2.cardboard(0.5, 0.35, 0.4), W(ST, -2.5, 0.05 + 0.45, -1.35), -0.1);
    b.build(R);
    this.door.g.position.set(o[0], 0, o[2]); R.add(this.door.g);
    this.place(new Batch(), this.pot, POT); // positioned per frame
  }

  private buildAttic(R: THREE.Object3D) {
    const o = AT, b = new Batch(), wood = lam("atticWoodM", () => ({ map: rep(atticWood(), 2, 2) }));
    const X = (x: number) => o[0] + x;
    b.add(boxGeo(V(X(-3.6), -0.2, -5.2), V(X(3.6), 0.008, 1.2)), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })));
    // sloped roof planes from the eaves (y 0.6 at x = +-3.5) to the ridge (y 3.2 at x = 0)
    const sl = Math.hypot(3.5, 2.6), ang = Math.atan2(2.6, 3.5);
    for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(sl + 0.2, 0.08, 6.6), wood); m.position.set(X(s * 1.75), 1.9, -2.0); m.rotation.z = -s * ang; m.updateMatrixWorld(true); b.addObject(m, new THREE.Matrix4()); }
    for (const s of [-1, 1]) b.add(boxGeo(V(X(s < 0 ? -3.6 : 3.3), 0, -5.2), V(X(s < 0 ? -3.3 : 3.6), 0.65, 1.2)), wood);
    const gable = new THREE.Shape(); gable.moveTo(-3.6, 0); gable.lineTo(3.6, 0); gable.lineTo(3.6, 0.6); gable.lineTo(0, 3.25); gable.lineTo(-3.6, 0.6); gable.closePath();
    for (const z of [-5.2, 1.1]) { const ge = new THREE.ExtrudeGeometry(gable, { depth: 0.1, bevelEnabled: false }); const m = new THREE.Mesh(ge, wood); m.position.set(X(0), 0, z); m.updateMatrixWorld(true); b.addObject(m, new THREE.Matrix4()); }
    for (const x of [-1.6, 1.6]) b.add(boxGeo(V(X(x - 0.07), 0, -3.4), V(X(x + 0.07), x < 0 ? 1.9 : 1.9, -3.26)), lam("swWoodD", () => ({ color: "#6e4a30" })));
    this.place(b, R2.cardboard(), W(AT, -2.2, 0, -3.8), 0.3);
    this.place(b, R2.cardboard(0.5, 0.4, 0.4), W(AT, -2.1, 0.45, -3.8), -0.2);
    this.place(b, R2.cardboard(0.7, 0.5, 0.5), W(AT, 2.3, 0, -4.1), 0.1);
    this.place(b, R2.sheeted(), W(AT, -2.3, 0, -1.2), 0.5);
    this.place(b, R2.sheeted(), W(AT, 2.4, 0, -1.6), -0.4);
    b.build(R);
    const rw = R2.roundWindow(); rw.position.set(X(0), 1.9, -5.08); R.add(rw);
    this.chest.g.position.set(...CHEST); R.add(this.chest.g);
    this.mapIn.position.set(CHEST[0] + 0.02, 0.212, CHEST[2] + 0.02); this.mapIn.rotation.set(-Math.PI / 2, 0, 0.2);
  }

  private buildIsland(R: THREE.Object3D) {
    const o = IS, b = new Batch();
    const seaM = lam("dSea", () => ({ map: rep(D.seaTex(), 40, 40) })); this.seaTex = (seaM as THREE.MeshLambertMaterial).map!;
    b.add(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2).translate(o[0], 0, 0), seaM);
    const isl = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14), lam("dSand", () => ({ map: rep(D.sandTex(), 8, 8) }))); isl.scale.set(9, 1.6, 6); isl.position.set(o[0], -0.6, 0); isl.updateMatrixWorld(true); b.addObject(isl, new THREE.Matrix4());
    const grassy = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), lam("dIsleGrass", () => ({ color: "#5aa84a" }))); grassy.scale.set(5, 1.5, 3.4); grassy.position.set(o[0] - 0.5, -0.25, -0.5); grassy.updateMatrixWorld(true); b.addObject(grassy, new THREE.Matrix4());
    for (const [x, z, l, s] of [[-2.0, 0.5, 0.25, 1], [1.5, -1.2, -0.3, 2], [3.2, 1.0, 0.2, 3], [-4.0, -1.5, -0.2, 4]] as number[][]) this.place(b, D.palm(l, s), W(IS, x, 0.85, z), s);
    this.place(b, D.rock(0.8), W(IS, 5.5, 0.1, 2.5), 1); this.place(b, D.rock(0.6), W(IS, -6.2, 0.1, 2.0), 2);
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
    this.fog.near = FOG[s.look][0]; this.fog.far = FOG[s.look][1];
    this.seaTex.offset.set((t * 0.01) % 1, (t * 0.03) % 1);
    this.quilt.visible = true;
    this.door.set(where === "dream1" ? 0 : doorOpen(t));
    this.chest.setDigits(digits(t), t >= T("click") - 0.05 && where === "attic");
    this.chest.open(lidOpen(t));
    this.mapIn.visible = lidOpen(t) > 0.5 && t < T("map") - 0.1;
    this.sticky.visible = t >= T("sticky") - 0.3; this.sticky.position.set(-2.02 + BR[0], 0.551, -3.5); this.sticky.rotation.set(0, 0.25, 0);
    // the flowerpot sits on the step; in the dream the key peeks out from under it
    this.pot.position.set(...POT); this.pot.rotation.set(0, 0, 0);
    this.key.visible = where === "dream1" || where === "street";
    this.key.position.set(POT[0] + (where === "dream1" ? 0.12 : 0), STEP_Y + 0.001, POT[2] + (where === "dream1" ? 0.1 : 0)); this.key.rotation.set(0, where === "dream1" ? 0.6 : 0.2, 0);

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
    const holdIn = (obj: THREE.Object3D, p: V3, o: Outfit, yaw: number | null | undefined, lift = 0) => {
      if (yaw === null || yaw === undefined) return;
      const n = V(Math.sin(yaw), 0, Math.cos(yaw));
      obj.visible = true; obj.position.copy(V(...p)).add(V(0, handY(o) + lift, 0)).addScaledVector(n, OUT); obj.rotation.set(0, yaw, 0);
    };
    this.photo.visible = false; this.map.visible = false; this.pen.visible = false;
    if (h) {
      const yaw = person("hero", h.p, h.o, h.fo, 4, { lie: h.lie });
      if (h.held === "pot") holdIn(this.pot, h.p, h.o, yaw, -0.22);
      if (h.held === "key") { holdIn(this.key, h.p, h.o, yaw, -0.01); this.key.rotation.set(Math.PI / 2, yaw ?? 0, 0, "YXZ"); }
      if (h.held === "pen") { holdIn(this.pen, h.p, h.o, yaw, 0); }
      if (h.held === "photo") { holdIn(this.photo, h.p, h.o, yaw, 0.03); this.photo.rotation.set(-0.15, (yaw ?? 0) + Math.PI * ramp(t, T("on", 3) + 0.1, 0.45), 0, "YXZ"); }
      if (h.held === "map") { holdIn(this.map, h.p, h.o, yaw, 0.04); this.map.rotation.set(-0.15, yaw ?? 0, 0, "YXZ"); }
      if (h.held === "key" && where === "street") this.key.visible = true;
    }
    if (where === "street" && t < T("you", 3)) person("passer", walk(t, T("then"), T("you", 3), W(ST, 7, 0, 2.3), W(ST, 2.5, 0, 2.3)), PASSER, { mode: "stroll", phase: t * 1.1 + 0.3, expr: "smile" }, 12);
    for (let k = ai; k < this.actors.length; k++) this.actors[k].mesh.visible = false;
    for (let k = fi; k < this.fxs.length; k++) this.fxs[k].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return look;
  }
}
