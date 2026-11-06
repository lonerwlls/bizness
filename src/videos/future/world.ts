// "What if your phone predicted your future": the hero's home (bedroom with the phone on the nightstand, kitchen with
// Mom at the stove, living room with the sofa and TV), a suburban street with a piece of gum, a classroom with a pop
// quiz and a school hallway. The phone is our 3D model with a live lock screen (props.ts). Every cut follows the
// narration (voice.ts).
import * as THREE from "three";
import { Batch, V, lam, boxGeo, prop, house } from "../bridge/build";
import { rep, ctex, rng, cloudHD, stoneHD, planksHD, grassHD, cobbleHD } from "../bridge/paint";
import { bodyFront, Outfit, Expr, FrontOpts, INK, fxContact, HOLD_DY } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx, SU } from "../bridge/cast";
import { makeKit } from "../bridge/kitgen";
import * as P from "./props";
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
export const TOTAL = Math.ceil((VOICE.dur + 1.3) * FPS);
const T = (w: string, n = 1) => wt(w, n) - 0.07;

// ---------------- light ----------------
type Look = "home" | "night" | "day" | "school";
const PR = (l: Partial<LightPreset>, k: Partial<WorldLook>) => ({ L: { ...LIGHTS.day, ...l }, K: { ...LOOK.day, ...k } });
const PRESETS: Record<Look, { L: LightPreset; K: WorldLook }> = {
  home: PR({ lit: [1.55, 1.42, 1.25], shade: [0.36, 0.34, 0.42], lift: [0.07, 0.07, 0.11], fog: "#efe4d4", charTint: [1.0, 0.96, 0.92] }, {}),
  night: PR({ lit: [0.95, 0.98, 1.25], shade: [0.22, 0.22, 0.36], lift: [0.05, 0.05, 0.1], fog: "#2c2a48", charTint: [0.84, 0.88, 1.06] }, {}),
  day: PR({}, {}),
  school: PR({ lit: [1.5, 1.44, 1.32], shade: [0.42, 0.42, 0.5], lift: [0.08, 0.08, 0.11], fog: "#e8e6e0", charTint: [1.0, 0.98, 0.95], hemiI: 0.6 }, {}),
};
const SUN_OF: Record<Look, [number, number]> = { home: [60, 50], night: [40, 60], day: [70, 42], school: [55, 55] };

// ---------------- layout ----------------
const BED: V3 = [-3.5, 0, -2.88];                  // bed centre; headboard toward -z
const STAND: V3 = [-4.5, 0, -3.6];                 // nightstand, top at 0.55
const PHONE_REST: V3 = [-4.3, 0.556, -3.5];        // the phone lying face up on it
const BY_BED: V3 = [-2.4, 0, -1.4];
const STOVE_MOM: V3 = [3.65, 0, -3.0];
const HERO_KITCHEN: V3 = [2.3, 0, -2.0];
const SOFA: V3 = [2.5, 0, 3.3];                     // faces -z, toward the TV
const SEATS: V3[] = [[1.84, P.SEAT, 3.22], [2.5, P.SEAT, 3.22], [3.16, P.SEAT, 3.22]];
const TV: V3 = [2.5, 0, 0.55];
const CTABLE: V3 = [2.5, 0, 2.2];
const BIKE: V3 = [4.15, 0, 1.15];
const STREET: V3 = [-3000, 0, 0];
const CLASS: V3 = [3000, 0, 0];
const HALL: V3 = [6000, 0, 0];
const SIDE = 0.1;                                    // sidewalk top
const GUM: V3 = [STREET[0] - 3.4, SIDE, -11.6];
const DESKS: V3[] = [];                              // desk centres (pupils sit at z + 0.5)
for (const z of [-1.4, 0, 1.4]) for (const x of [-1.6, 0, 1.6]) DESKS.push(add3(CLASS, [x, 0, z]));
const HERO_DESK = 4;                                 // middle row, middle column
const TEACHER: V3 = add3(CLASS, [0.35, 0, -3.3]);
const HALL_HERO: V3 = add3(HALL, [1.7, 0, -2.0]);
const GIRL_STOP: V3 = add3(HALL, [0.85, 0, -3.0]);

// ---------------- cast ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const MOM: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#e86a5a" };
const DAD: Outfit = { jacket: "#3f6fb5", pants: "#3a3e4a", boots: INK, hat: "hair", hair: "#3a2418", skin: HEAD, moustache: "#3a2418", build: "stout" };
const TEACH: Outfit = { jacket: "#5d7a3a", pants: "#3a3e4a", boots: INK, hat: "hair", hair: "#b0b0b8", skin: HEAD, moustache: "#9a9aa2", buttons: "#d8d8dc" };
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
/** height of the "hold2" hands above the card's base point (standing: the sole; sitting: the seat) */
const handY = (o: Outfit, sit = false) => {
  const B = o.build === "stout" ? [1.15, 1.32] : [1.1, 1.4];
  return ((sit ? 0.2 : B[1]) + B[0] - HOLD_DY) * HH * SU;
};

// ---------------- the story by time ----------------
type Where = "bed" | "byBed" | "street" | "sofa" | "party" | "class" | "hall" | "kitchen";
const whereAt = (t: number): Where => {
  if (t < T("your", 3)) return "bed";
  if (t < T("rule", 1)) return "byBed";
  if (t < T("rule", 2)) return "street";
  if (t < T("your", 5)) return "sofa";
  if (t < T("rule", 3)) return "party";
  if (t < T("and", 2)) return "class";
  if (t < T("next")) return "hall";
  if (t < T("mom", 2)) return "bed";
  return "kitchen";
};
/** the hero on the street: walks toward the camera reading, side-steps left onto the gum, stops */
const streetHero = (t: number): { p: V3; walking: boolean } => {
  const t0 = T("rule", 1), ts = T("step", 2);
  if (t < ts) return { p: [STREET[0] - 3.9, SIDE, -16 + 1.0 * (t - t0)], walking: true };
  const zs = -16 + 1.0 * (ts - t0), k = glide((t - ts) / 0.45);
  return { p: [lerp(STREET[0] - 3.9, GUM[0], k), SIDE, lerp(zs, GUM[2], k)], walking: k < 1 };
};
const girlAt = (t: number): { p: V3; walking: boolean } => {
  const a = T("rule", 4), b = T("hi", 2) - 0.25, k = clamp01((t - a) / (b - a));
  return { p: [GIRL_STOP[0], 0, lerp(HALL[2] - 12.5, GIRL_STOP[2], k)], walking: k < 1 };
};
type HeroPose = { p: V3; fo: FrontOpts; lie?: boolean; sit?: boolean; phone?: boolean };
function heroAt(t: number): HeroPose {
  const w = whereAt(t);
  const stand = (p: V3, expr: Expr, extra: Partial<FrontOpts> = {}, phone = false): HeroPose => ({ p, fo: { mode: "stand", expr, ...extra, prop: phone ? "hold2" : extra.prop }, phone });
  if (w === "bed") {
    const ring = t >= T("next") - 0.1;
    let expr: Expr = "smile_closed", blink: number | undefined = 1;
    if (!ring) { if (t >= T("alarm", 1) - 0.1) { expr = "neutral"; blink = undefined; } if (t >= T("in", 1)) expr = "nervous"; }
    else if (t >= T("your", 7) - 0.1) { expr = "grin"; blink = undefined; }
    return { p: [BED[0], 0.575, BED[2] - 0.7 + 1.78], fo: { mode: "stand", expr, blink, look: -0.6 }, lie: true };
  }
  if (w === "byBed") return stand(BY_BED, t >= T("and", 1) ? "grin" : "shock", {}, true);
  if (w === "street") {
    const s = streetHero(t);
    let expr: Expr = "smile";
    if (t >= T("don") - 0.1) expr = "neutral";
    if (t >= T("you", 2)) expr = "smile";
    if (t >= T("gum")) expr = "shock";
    if (t >= T("on", 1)) expr = "pained";
    return { p: s.p, fo: s.walking ? { mode: "stroll", phase: t * 1.1, expr, prop: "hold2" } : { mode: "stand", expr, prop: "hold2", look: t >= T("on", 1) ? 0 : undefined }, phone: true };
  }
  if (w === "sofa") {
    const expr: Expr = t >= T("did") + 0.1 ? "stern" : t >= T("the", 2) ? "neutral" : "grin";
    return { p: SEATS[1], fo: { mode: "sit", expr, prop: "hold2" }, sit: true, phone: true };
  }
  if (w === "party") {
    if (t < T("you", 3)) return stand([2.5, 0, 1.45], t >= T("it", 5) ? "neutral" : "smile", {}, true);
    return stand([2.5, 0, 1.45], "shock");
  }
  if (w === "class") {
    const d = DESKS[HERO_DESK];
    if (t < T("you", 5)) return { p: [d[0], P.SEAT, d[2] + 0.5], fo: { mode: "sit", expr: t >= T("question") ? "grin" : "smile" }, sit: true, phone: t >= T("pop") - 0.3 };
    return stand([d[0], 0, d[2] + 0.92], "grin", { wave: 1 });
  }
  if (w === "hall") {
    let expr: Expr = "smile";
    if (t >= T("she")) expr = "nervous";
    if (t >= T("hi", 2) + 0.2) expr = "relief_open";
    return stand(HALL_HERO, expr, { look: t >= T("three", 2) ? -0.5 : 0 }, t < T("hi", 2) + 0.2);
  }
  // kitchen, the next morning
  let expr: Expr = "smile";
  if (t >= T("so", 2)) expr = "grin";
  if (t >= T("yell") - 0.05) expr = "yell";
  return stand(HERO_KITCHEN, expr, { facing: 1, look: 0.6 });
}
/** what the phone says */
const screenAt = (t: number): P.Screen => {
  const w = whereAt(t);
  const countdown = (a: number, b: number) => String(Math.max(0, 10 - Math.floor(((t - a) / (b - a)) * 10)));
  const breakfast = "In 10 seconds, Mom yells: BREAKFAST!";
  if (w === "bed") {
    const ring = t >= T("next") - 0.1;
    const lit = ring ? t >= T("next") + 0.15 : t >= T("buzzes", 1) - 0.1;
    if (!lit) return { key: "off" };
    const a = ring ? T("in", 3) : T("in", 1), b = ring ? T("breakfast", 3) : T("breakfast", 2);
    return { key: "m", time: "6:59", msg: breakfast, big: t < a ? "10" : countdown(a, b) };
  }
  if (w === "byBed") return { key: "m", time: "7:00", msg: breakfast, check: true };
  if (w === "street") return t < T("don") - 0.3 ? { key: "t", time: "8:05" } : { key: "m", time: "8:05", msg: "Don't step left.", check: t >= T("gum") };
  if (w === "sofa") return t < T("the", 2) - 0.3 ? { key: "t", time: "21:30" } : { key: "m", time: "21:30", msg: "The dog did it." };
  if (w === "party") return t < T("it", 5) - 0.3 ? { key: "t", time: "16:00" } : { key: "m", time: "16:00", msg: "It's a bike." };
  if (w === "class") return { key: "m", time: "10:15", msg: "Pop quiz! Question 4: answer B" };
  if (w === "hall") {
    if (t < T("one", 2) - 0.2) return { key: "t", time: "12:30" };
    if (t < T("she") - 0.1) return { key: "m", time: "12:30", msg: "1 new message" };
    const big = t >= T("hi", 2) ? undefined : t >= T("one", 3) ? "1" : t >= T("two", 2) ? "2" : t >= T("three", 2) ? "3" : undefined;
    return { key: "m", time: "12:30", msg: "She's going to say hi in...", big, check: t >= T("hi", 2) };
  }
  return { key: "off" };
};

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; look: Look; cInf: number; cam: (u: number, f: number) => Cam; pov?: boolean };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
const mvAt = (o: V3, p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => mv(add3(o, p0), add3(o, p1), add3(o, l0), add3(o, l1), fov, roll, ease);
/** close on the phone in the hero's hands: the camera hangs in front of it (dx sideways) and follows */
const onPhone = (dist: number, dx = 0.03, roll = 0, dir = 1) => (u: number, f: number): Cam => {
  const h = heroAt(f / FPS), y = h.p[1] + handY(HERO, h.sit);
  const c: V3 = [h.p[0], y, h.p[2] + 0.07 * dir];
  return { pos: [c[0] + dx, y + 0.07 - 0.01 * u, c[2] + dir * (dist - 0.02 * u)], look: c, fov: 34, roll };
};
/** follow the hero: camera offset from his position, looking at a point offset from it */
const follow = (off: V3, lookOff: V3, fov: number, roll = 0) => (_u: number, f: number): Cam => {
  const p = heroAt(f / FPS).p;
  return { pos: add3(p, off), look: add3(p, lookOff), fov, roll };
};
const S: ShotDef[] = [];
export const SHOTS = S;
const shot = (a: number, look: Look, cInf: number, cam: (u: number, f: number) => Cam, pov = false) => S.push({ a, look, cInf, cam, pov });
const HEADBED: V3 = [BED[0], 0.6, BED[2] - 0.45];
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  const morning = (n: 1 | 2) => {
    const r = n === 2;
    shot(r ? E("seven", 2) : 0, "home", 12, mv([-4.0, 0.86, -2.95], [-4.03, 0.85, -3.0], [-4.45, 0.64, -3.58], [-4.45, 0.64, -3.58], 34, 0.02));
    shot(E("your", r ? 7 : 1), "home", 12, mv([PHONE_REST[0] + 0.02, 0.95, PHONE_REST[2] + 0.12], [PHONE_REST[0] + 0.02, 0.9, PHONE_REST[2] + 0.1], PHONE_REST, PHONE_REST, 34, 0.03));
    shot(E("alarm", n), "home", 10, mv([BED[0] + 0.35, 1.7, BED[2] + 0.35], [BED[0] + 0.32, 1.6, BED[2] + 0.3], HEADBED, HEADBED, 40, -0.03));
    shot(E("in", r ? 3 : 1), "home", 14, mv([PHONE_REST[0], 0.84, PHONE_REST[2] + 0.06], [PHONE_REST[0], 0.8, PHONE_REST[2] + 0.05], PHONE_REST, PHONE_REST, 30, 0));
  };
  // seven a.m.: the alarm clock, the phone lights up, eyes open, the countdown
  morning(1);
  shot(E("mom", 1), "home", 8, mv([BED[0] - 0.3, 2.6, BED[2] + 0.3], [BED[0] - 0.28, 2.45, BED[2] + 0.25], [BED[0], 0.6, BED[2] - 0.35], [BED[0], 0.6, BED[2] - 0.35], 42, 0.02, true));
  // Mom in the kitchen: "Breakfast!"
  shot(E("ten", 2), "home", 6, mv([1.9, 1.5, -0.4], [2.1, 1.5, -0.6], [3.65, 1.2, -3.0], [3.65, 1.2, -3.0], 42, 0, true));
  shot(E("breakfast", 2), "home", 12, mv([3.4, 1.55, -1.6], [3.43, 1.55, -1.7], [3.65, 1.45, -3.0], [3.65, 1.47, -3.0], 36, 0.03));
  // it came true: shock, the phone, the promise
  shot(E("your", 3), "home", 8, mv([-1.5, 1.5, 0.4], [-1.65, 1.5, 0.2], [-2.4, 1.2, -1.4], [-2.4, 1.2, -1.4], 40, -0.02));
  shot(E("predicted"), "home", 14, onPhone(0.3));
  shot(E("and", 1), "home", 10, mv([-2.25, 1.6, -0.5], [-2.3, 1.58, -0.75], [-2.4, 1.5, -1.4], [-2.4, 1.5, -1.4], 36, 0.02));
  // rule one: the street, the gum
  shot(E("rule", 1), "day", 0, mvAt(STREET, [-2.9, 1.7, -7.5], [-3.0, 1.65, -8.0], [-3.9, 1.0, -15], [-3.9, 1.0, -14.5], 44, 0, true));
  shot(E("never"), "day", 8, follow([0.5, 1.5, 2.2], [0, 1.3, 0], 40, 0.02));
  shot(E("don"), "day", 14, onPhone(0.3, -0.03));
  shot(E("you", 2), "day", 8, mvAt(STREET, [-2.6, 1.3, -8.6], [-2.65, 1.3, -8.75], [-3.6, 0.8, -11.8], [-3.6, 0.8, -11.8], 44, -0.02));
  shot(E("gum"), "day", 14, mv([GUM[0] + 0.2, 0.45, GUM[2] + 0.62], [GUM[0] + 0.19, 0.43, GUM[2] + 0.58], [GUM[0] + 0.1, 0.16, GUM[2]], [GUM[0] + 0.1, 0.16, GUM[2]], 36, 0.03));
  shot(E("on", 1), "day", 8, mv([GUM[0] - 0.4, 1.3, GUM[2] + 3.1], [GUM[0] - 0.38, 1.28, GUM[2] + 2.95], [GUM[0], 0.85, GUM[2]], [GUM[0], 0.85, GUM[2]], 40, -0.03));
  // rule two: movie night, the birthday
  shot(E("rule", 2), "night", 6, mv([5.3, 1.6, 0.6], [5.1, 1.6, 0.8], [2.4, 0.9, 2.9], [2.4, 0.9, 2.9], 44, 0, true));
  shot(E("spoils"), "night", 10, mv([2.75, 1.25, 1.4], [2.73, 1.25, 1.48], [2.5, 0.95, 3.22], [2.5, 0.96, 3.22], 40, 0.03));
  shot(E("movie"), "night", 10, mv([2.4, 1.2, 2.1], [2.42, 1.18, 1.95], [2.5, 1.0, TV[2]], [2.5, 1.0, TV[2]], 40, -0.02));
  shot(E("the", 2), "night", 14, onPhone(0.28, 0.03, 0, -1));
  shot(E("did") + 8, "night", 6, mv([2.5, 1.3, 1.15], [2.5, 1.3, 1.25], [2.5, 0.95, 3.22], [2.5, 0.96, 3.22], 44, 0.02));
  shot(E("your", 5), "home", 4, mv([0.5, 1.7, 3.7], [0.7, 1.65, 3.5], [2.7, 0.9, 1.4], [2.7, 0.9, 1.4], 46, 0, true));
  shot(E("it", 5), "home", 14, onPhone(0.3, -0.03));
  shot(E("you", 3), "home", 6, mv([2.1, 1.35, 3.6], [2.15, 1.35, 3.45], [3.0, 0.8, 1.3], [3.0, 0.8, 1.3], 46, -0.02));
  shot(E("surprised"), "home", 12, mv([2.6, 1.55, 2.35], [2.58, 1.55, 2.25], [2.5, 1.5, 1.45], [2.5, 1.52, 1.45], 36, 0.03));
  // rule three: the pop quiz
  shot(E("rule", 3), "school", 0, mvAt(CLASS, [2.7, 2.3, -3.1], [2.5, 2.2, -2.9], [0, 0.8, 0.6], [0, 0.8, 0.6], 46, 0, true));
  shot(E("makes"), "school", 10, mvAt(CLASS, [0.25, 1.35, -0.95], [0.23, 1.33, -0.85], [0, 1.1, 0.5], [0, 1.11, 0.5], 40, 0.02));
  shot(E("pop"), "school", 6, mvAt(CLASS, [-0.15, 2.1, -0.3], [-0.17, 2.08, -0.5], [-0.25, 1.4, -3.9], [-0.25, 1.4, -3.9], 62, -0.02));
  shot(E("question"), "school", 14, onPhone(0.28, 0.03, 0, -1));
  shot(E("you", 5), "school", 6, mvAt(CLASS, [0.9, 1.5, -1.7], [0.85, 1.5, -1.6], [0, 1.4, 0.9], [0, 1.4, 0.9], 42, 0.02));
  shot(E("before", 2), "school", 12, mvAt(CLASS, [-0.05, 1.6, -2.2], [0.0, 1.6, -2.3], [0.35, 1.5, -3.3], [0.35, 1.52, -3.3], 38, -0.03));
  shot(E("the", 4), "school", 6, mv(add3(CLASS, [0, 1.45, 0.9]), add3(CLASS, [0, 1.45, 0.9]), add3(CLASS, [-1.6, 1.15, -0.9]), add3(CLASS, [1.6, 1.15, -0.9]), 50, 0.02, true), true);
  // the last rule: the hallway, the countdown, "hi"
  shot(E("and", 2), "school", 0, mvAt(HALL, [-0.9, 1.7, 2.0], [-0.75, 1.65, 1.6], [1.6, 1.1, -4], [1.6, 1.1, -4], 46, 0, true));
  shot(E("knows"), "school", 10, mvAt(HALL, [1.25, 1.55, -0.95], [1.28, 1.55, -1.05], [1.7, 1.45, -2.0], [1.7, 1.47, -2.0], 38, 0.02));
  shot(E("one", 2), "school", 14, onPhone(0.3));
  shot(E("three", 2), "school", 4, mvAt(HALL, [1.7, 1.5, -1.7], [1.68, 1.5, -1.8], [0.85, 1.2, -8], [0.85, 1.2, -7], 40, -0.02), true);
  shot(E("two", 2), "school", 14, onPhone(0.27, -0.03));
  shot(E("one", 3), "school", 8, mvAt(HALL, [1.55, 1.5, -1.3], [1.52, 1.5, -1.35], [0.9, 1.3, -3.3], [0.9, 1.3, -3.2], 40, 0.02));
  shot(E("hi", 2), "school", 12, mvAt(HALL, [1.5, 1.5, -1.6], [1.48, 1.5, -1.65], [0.85, 1.4, -3.0], [0.85, 1.42, -3.0], 36, -0.02), true);
  shot(E("hi", 2) + 22, "school", 12, mvAt(HALL, [1.35, 1.52, -1.15], [1.37, 1.52, -1.22], [1.7, 1.45, -2.0], [1.7, 1.47, -2.0], 36, 0.03));
  // next morning: the same opening, then you yell it first
  shot(E("next"), "home", 12, mv([PHONE_REST[0] + 0.02, 0.95, PHONE_REST[2] + 0.12], [PHONE_REST[0] + 0.02, 0.9, PHONE_REST[2] + 0.1], PHONE_REST, PHONE_REST, 34, -0.03));
  morning(2);
  shot(E("mom", 2), "home", 4, mv([0.9, 1.5, 0.5], [1.05, 1.5, 0.3], [3.0, 1.1, -2.6], [3.0, 1.1, -2.6], 44, 0, true));
  shot(E("so", 2), "home", 12, mv([2.05, 1.55, -1.05], [2.08, 1.55, -1.12], [2.3, 1.45, -2.0], [2.3, 1.47, -2.0], 36, 0.02));
  shot(E("you", 7), "home", 6, mv([1.3, 1.5, -0.2], [1.25, 1.5, -0.1], [3.0, 1.2, -2.6], [3.0, 1.2, -2.6], 42, -0.02));
  shot(E("first") + 10, "home", 12, mv([3.4, 1.55, -1.6], [3.42, 1.55, -1.67], [3.65, 1.45, -3.0], [3.65, 1.47, -3.0], 36, 0.04));
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

// ---------------- the world ----------------
export class FutureWorld {
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
  private phone = new P.Phone();
  private bike = P.bike();
  private cake = P.cake();
  private gum = P.gum();
  private tvScr!: THREE.MeshBasicMaterial;
  private winDay!: THREE.Mesh; private winNight!: THREE.Mesh;

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
    this.buildHome(R); this.buildStreet(R); this.buildClass(R); this.buildHall(R);
    R.add(this.phone.root);
  }

  private place(b: Batch, g: THREE.Object3D, p: V3, ry = 0) { g.position.set(...p); g.rotation.y = ry; g.updateMatrixWorld(true); b.addObject(g, new THREE.Matrix4()); }

  private buildHome(R: THREE.Object3D) {
    const b = new Batch(), wall = lam("swWallpaper", () => ({ map: rep(wallpaper(), 3, 1) }));
    b.add(boxGeo(V(-6.2, -0.2, -4.2), V(6.2, 0, 4.4)), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })));
    b.add(boxGeo(V(-6.2, 0, -4.12), V(6.2, 3.0, -4.0)), wall);
    b.add(boxGeo(V(-6.2, 0, 4.2), V(6.2, 3.0, 4.32)), wall);
    b.add(boxGeo(V(-6.4, 0, -4.2), V(-6.2, 3.0, 4.4)), wall);
    b.add(boxGeo(V(6.2, 0, -4.2), V(6.4, 3.0, 4.4)), wall);
    for (const [x, y, z, ry, w, h] of [[-5.0, 1.6, -3.99, 0, 1.1, 1.4], [6.19, 1.6, 1.0, -Math.PI / 2, 1.1, 1.4]] as number[][]) {
      const day = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) }));
      day.position.set(x, y, z); day.rotation.y = ry; R.add(day);
      if (x > 0) {
        const night = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: skyWin(true) }));
        night.position.set(x - 0.005, y, z); night.rotation.y = ry; R.add(night);
        this.winDay = day; this.winNight = night;
      }
    }
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), lam("homePicM", () => ({ map: pictureTex() })));
    pic.position.set(2.5, 1.75, 4.13); pic.rotation.y = Math.PI; R.add(pic);
    const dw = P.doorWall(8.6, 3.0, wall); dw.position.set(-1, 0, 0.1); dw.rotation.y = Math.PI / 2; dw.updateMatrixWorld(true); b.addObject(dw, new THREE.Matrix4());
    this.place(b, P.bed(), BED);
    this.place(b, P.nightstand(), STAND);
    this.place(b, P.kitchen(), [3.5, 0, -3.7]);
    this.place(b, P.sofa(), SOFA, Math.PI);
    const t = P.tv(); this.tvScr = t.scr; this.place(b, t.g, TV);
    this.place(b, P.coffeeTable(), CTABLE);
    // a rug and a floor lamp for the living room
    b.add(boxGeo(V(1.2, 0.0, 1.0), V(3.8, 0.012, 3.0)), lam("fuRug", () => ({ color: "#5a8fc2" })));
    b.build(R);
    t.s.position.add(V(...TV)); R.add(t.s);
    this.clock.position.set(-4.62, 0.55, -3.66); this.clock.rotation.y = 0.5; R.add(this.clock);
    this.quilt.position.set(BED[0], 0, BED[2]); R.add(this.quilt);
    this.cake.position.set(CTABLE[0], 0.445, CTABLE[2]); R.add(this.cake);
    this.bike.position.set(...BIKE); this.bike.rotation.y = 0.35; R.add(this.bike);
  }

  private buildStreet(R: THREE.Object3D) {
    const b = new Batch(), o = STREET, kit = makeKit(), r = rng(3);
    b.add(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2).translate(o[0], -0.02, -100), lam("grassT", () => ({ map: rep(grassHD(), 160, 160) })));
    b.add(new THREE.PlaneGeometry(6, 140).rotateX(-Math.PI / 2).translate(o[0], 0.0, -40), lam("roadT", () => ({ map: rep(cobbleHD(), 2, 40) })));
    for (const s of [-1, 1]) b.add(boxGeo(V(o[0] + (s < 0 ? -5 : 3), -0.1, -110), V(o[0] + (s < 0 ? -3 : 5), SIDE, 30), 2), lam("walkT", () => ({ map: stoneHD("walkHD", ["#e6dccb", "#ddd2bf", "#ece3d4", "#d6cab6"], "#b0a390") })));
    for (const s of [-1, 1]) for (let k = 0; k < 8; k++) {
      const zc = 14 - k * 11;
      house(b, o[0] + s * 14, zc, s < 0 ? Math.PI / 2 : -Math.PI / 2, 9, 8, [7, 8.4, 7.6][k % 3], (k * 2 + (s > 0 ? 1 : 0)) % 8, 0);
      for (let i = 0; i < 10; i++) { const z = zc - 4.5 + i * 1.0; if (Math.abs(z - (zc + 0.1)) < 0.6) continue; b.add(boxGeo(V(o[0] + s * 5.3 - 0.04, 0, z - 0.06), V(o[0] + s * 5.3 + 0.04, 0.9, z + 0.06)), lam("fenceW", () => ({ color: "#f2ead8" }))); }
      b.add(boxGeo(V(o[0] + s * 5.3 - 0.03, 0.5, zc - 4.5), V(o[0] + s * 5.3 + 0.03, 0.6, zc + 4.5)), lam("fenceW", () => ({ color: "#f2ead8" })));
      prop(b, kit, "tree_oak", o[0] + s * 8.5, 0, zc - 3.5, 5 + (k % 2));
    }
    // lanterns on the road side of the sidewalks, never on the hero's line (x = -3.9 .. -3.4)
    for (let z = 20; z > -100; z -= 12) for (const s of [-1, 1]) prop(b, kit, "lantern", o[0] + s * 3.15, SIDE, z + (s > 0 ? 6 : 0) - 2, 3.4);
    for (let i = 0; i < 30; i++) prop(b, kit, i % 3 ? "tree_default" : "tree_cone", o[0] + (i % 2 ? 1 : -1) * (24 + r() * 20), 0, 20 - i * 5, 8 + (i % 4));
    b.build(R);
    this.gum.position.set(GUM[0], GUM[1] + 0.006, GUM[2]); this.gum.getObjectByName("strand")!.visible = false; R.add(this.gum);
  }

  private buildClass(R: THREE.Object3D) {
    const b = new Batch(), o = CLASS, wall = lam("fuClassWall", () => ({ map: rep(schoolWall(), 3, 1) }));
    b.add(boxGeo(V(o[0] - 4.2, -0.2, -4.2), V(o[0] + 4.2, 0, 4.2)), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })));
    b.add(boxGeo(V(o[0] - 4.2, 0, -4.12), V(o[0] + 4.2, 3.2, -4.0)), wall);
    b.add(boxGeo(V(o[0] - 4.2, 0, 4.0), V(o[0] + 4.2, 3.2, 4.12)), wall);
    b.add(boxGeo(V(o[0] - 4.32, 0, -4.2), V(o[0] - 4.2, 3.2, 4.2)), wall);
    b.add(boxGeo(V(o[0] + 4.2, 0, -4.2), V(o[0] + 4.32, 3.2, 4.2)), wall);
    b.add(boxGeo(V(o[0] - 4.2, 3.2, -4.2), V(o[0] + 4.2, 3.35, 4.2)), lam("ceilM", () => ({ color: "#f4f1ea" })));
    for (const z of [-2.2, 0.4, 3.0]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.5), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) })); w.position.set(o[0] - 4.19, 1.7, z); w.rotation.y = Math.PI / 2; R.add(w); }
    this.place(b, P.blackboard(), add3(o, [0, 0, -3.97]));
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
    b.add(boxGeo(V(X(-HW), H, Z0), V(X(HW), H + 0.2, Z1)), lam("ceilM", () => ({ color: "#f4f1ea" })));
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
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = s.look === "night" ? L.hemiI * 0.6 : L.hemiI;
    this.sun.color.set(s.look === "night" ? "#b8c8ff" : L.sunCol); this.sun.intensity = s.look === "night" ? L.sunI * 0.5 : L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 6, 8, 50);
    this.sun.position.copy(look).addScaledVector(sunDir, 220); this.sun.target.position.copy(look);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.sun.castShadow = s.look === "day";
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
    const far = s.look === "day" ? 600 : 120;
    this.fog.near = far * 0.1; this.fog.far = far;
    scene.fog = this.fog; scene.background = null;
    this.clouds.forEach((m, k) => {
      const a = (k / 12) * Math.PI * 2 + 0.3, d = 560 + (k % 3) * 70, w = 140 + (k % 4) * 34;
      m.visible = s.look === "day";
      m.position.set(cam.position.x + Math.cos(a) * d, 60 + (k % 4) * 34, cam.position.z + Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
    });
    const where = whereAt(t);
    // home dressing: night window + TV on for movie night, the cake and (after the reveal) the bike for the birthday
    const night = where === "sofa";
    this.winDay.visible = !night; this.winNight.visible = night;
    this.tvScr.color.setScalar(night ? 1.5 + 0.08 * Math.sin(t * 7) : 0.12);
    this.cake.visible = where === "party";
    this.bike.visible = where === "party" && t >= T("you", 3) - 0.1;
    // the alarm clock rings with the phone in the morning
    const ring = where === "bed" && ((t >= T("buzzes", 1) - 0.1 && t < T("in", 1)) || (t >= T("buzzes", 2) - 0.1 && t < T("in", 3)));
    this.clock.rotation.set(0, 0.5, ring ? 0.05 * Math.sin(t * 24) : 0);
    this.quilt.visible = where === "bed";

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
    // the phone: face up on the nightstand in bed, else in the hero's hands
    const h = heroAt(t);
    this.phone.show(screenAt(t));
    this.phone.root.visible = false;
    const buzz = where === "bed" && ((t >= T("buzzes", 1) - 0.1 && t < T("alarm", 1)) || (t >= T("buzzes", 2) - 0.1 && t < T("alarm", 2)));
    if (where === "bed") {
      this.phone.root.visible = true; this.phone.root.position.set(...PHONE_REST);
      this.phone.root.rotation.set(-Math.PI / 2, 0, 0); this.phone.root.rotateOnWorldAxis(V(0, 1, 0), 0.3 + (buzz ? 0.04 * Math.sin(t * 60) : 0));
    }
    if (!s.pov) {
      const yaw = person("hero", h.p, HERO, h.fo, 4, { lie: h.lie, sit: h.sit });
      if (where === "street" && yaw !== null && yaw !== undefined && t >= T("step", 2) + 0.4) {
        // stuck under his left sneaker (screen right): the card's right axis is (cos yaw, 0, -sin yaw)
        this.gum.position.set(h.p[0] + 0.1 * Math.cos(yaw), GUM[1] + 0.006, h.p[2] - 0.1 * Math.sin(yaw));
      } else this.gum.position.set(GUM[0], GUM[1] + 0.006, GUM[2]);
      if (h.phone && yaw !== null && yaw !== undefined) {
        const n = V(Math.sin(yaw), 0, Math.cos(yaw));
        this.phone.root.visible = true;
        this.phone.root.position.copy(V(...h.p)).add(V(0, handY(HERO, h.sit), 0)).addScaledVector(n, 0.07);
        this.phone.root.rotation.set(-0.2, yaw, 0, "YXZ");
      }
    }
    if (where === "bed" || where === "byBed" || where === "kitchen") {
      const yelling = where === "bed" && t >= T("breakfast", 2) - 0.15 && t < T("your", 3);
      const startled = where === "kitchen" && t >= T("yell") + 0.15;
      person("mom", STOVE_MOM, MOM, { mode: "stand", expr: yelling ? "yell" : startled ? "shock" : "smile", facing: startled ? -1 : 0, look: startled ? -0.6 : 0 }, 21);
    }
    if (where === "sofa") {
      const late = t >= T("did") + 0.1;
      person("dad", SEATS[0], DAD, { mode: "sit", expr: late ? "smile" : "neutral", look: 0 }, 22, { sit: true });
      person("mom", SEATS[2], MOM, { mode: "sit", expr: late ? "smile" : "neutral", look: 0 }, 21, { sit: true });
    }
    if (where === "party") {
      const rev = t >= T("you", 3);
      person("mom", [1.5, 0, 1.75], MOM, { mode: "stand", expr: "grin", wave: rev ? 0.5 + 0.5 * Math.sin(t * 7) : undefined }, 21);
      person("dad", rev ? [3.55, 0, 1.35] : [3.5, 0, 1.75], DAD, { mode: "stand", expr: rev ? "laugh" : "grin" }, 22);
    }
    if (where === "class") {
      const stare = t >= T("the", 4) - 0.1, turned = t >= T("you", 5) + 0.4;
      DESKS.forEach((d, k) => {
        if (k === HERO_DESK) return;
        const o = STUDENTS[k % STUDENTS.length];
        person("pupil" + k, [d[0], P.SEAT, d[2] + 0.5], o, { mode: "sit", expr: stare ? "shock" : turned ? "neutral" : k % 3 ? "neutral" : "smile", look: stare ? 0 : turned ? (d[0] < CLASS[0] ? 0.6 : -0.6) : 0 }, 10 + k, { sit: true });
      });
      person("teacher", TEACHER, TEACH, { mode: "stand", expr: t >= T("before", 2) + 0.2 ? "shock" : "smile", look: t >= T("before", 2) ? -0.5 : 0, facing: t < T("before", 2) ? 1 : 0 }, 30);
    }
    if (where === "hall") {
      const g = girlAt(t), hi = t >= T("hi", 2) - 0.1;
      person("girl", g.p, GIRL, g.walking ? { mode: "stroll", phase: t * 1.1, expr: "smile" } : { mode: "stand", expr: hi ? "grin" : "smile", wave: hi ? 0.5 + 0.5 * Math.sin(t * 8) : undefined }, 33);
      person("pair1", add3(HALL, [-1.9, 0, -11]), STUDENTS[0], { mode: "stand", expr: "laugh", facing: 1, look: 0.8 }, 40);
      person("pair2", add3(HALL, [-1.2, 0, -11.6]), STUDENTS[3], { mode: "stand", expr: "smile", facing: -1, look: -0.8 }, 41);
      person("loner", add3(HALL, [1.9, 0, -15]), STUDENTS[5], { mode: "stand", expr: "neutral" }, 42);
    }
    for (let k = ai; k < this.actors.length; k++) this.actors[k].mesh.visible = false;
    for (let k = fi; k < this.fxs.length; k++) this.fxs[k].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return look;
  }
}
