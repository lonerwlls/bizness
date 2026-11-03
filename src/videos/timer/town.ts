// "What if everyone could see a timer of their life": one three.js seaside street (houses, bakery, bank, post box,
// beach + sea), flat cartoon cast as lit cards, glowing countdown cards over every head. Every cut and reaction is
// keyed to a word of the narration (voice.ts), so a new voice take re-times the whole film by itself.
import * as THREE from "three";
import { Batch, V, lam, boxGeo, house, prop } from "../bridge/build";
import { rep, ctex, cobbleHD, stoneHD, grassHD, cloudHD } from "../bridge/paint";
import { Pen, bodyFront, bodySide, Outfit, Expr, FrontOpts, SideOpts, INK, fxBurst, fxContact, fxPuff } from "../bridge/toon";
import { LIGHTS, LOOK } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { makeKit } from "../bridge/kitgen";
import { VOICE } from "./voice";

export const FPS = 30;
export type V3 = [number, number, number];
type Light = "day" | "golden";
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- narration timing ----------------
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9-]/g, "");
/** start time (s) of the n-th occurrence of a word in the narration */
export const wt = (w: string, n = 1) => {
  let k = 0;
  for (const x of VOICE.words) if (norm(x.w) === norm(w) && ++k === n) return x.t;
  throw new Error(`word not found: ${w} #${n}`);
};
/** cut / reaction frame: 2 frames before the word */
export const wf = (w: string, n = 1) => Math.max(0, Math.round(wt(w, n) * FPS) - 2);
export const TOTAL = Math.ceil((VOICE.dur + 1.0) * FPS);

// ---------------- layout (metres; street along z, beach at +z) ----------------
export const WALK = 0.15;                 // sidewalk top
const SIDE_IN = 4, SIDE_OUT = 7.2;        // sidewalk |x| range
const BEACH_Z = 44;                       // sand starts here
const SEA_Z = 78;                         // water starts here
const COUCH: V3 = [-5.7, WALK, 2.2];      // hero's sofa in front of his door, faces +x
const SEAT = 0.42;
const DOOR: V3 = [-5.6, WALK, 0];
const BAKER: V3 = [5.75, WALK, -12];
const MAIL0: V3 = [5.3, WALK, -3.6];
const POSTBOX: V3 = [6.25, WALK, -2.6];
const BANKER: V3 = [-5.3, WALK, -25.4];
const DATER: V3 = [5.4, WALK, -21];
const PAIR_A: V3 = [-1.6, 0, -17.5], PAIR_B: V3 = [-0.2, 0, -18.1];
const STARE_A: V3 = [-2.4, 0, -7.6], STARE_B: V3 = [-1.0, 0, -8.2];
const BEACH_MAIL: V3 = [1.2, 0.02, 57];
const BEACH_HERO: V3 = [-0.4, 0.02, 56.6];
const RUN_SPEED = 7;

// ---------------- the cast ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const MAILMAN: Outfit = { jacket: "#3f6fb5", pants: "#2e3a5a", boots: INK, hat: "cap", cap: "#2e4a8a", skin: HEAD, belt: "#c8a24a" };
const BAKERO: Outfit = { jacket: "#f4f1ea", pants: "#5a6a8a", boots: INK, hat: "chef", skin: HEAD, buttons: "#c8c2b4", build: "stout" };
const FOLK: Outfit[] = [
  { jacket: "#3f9a5a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#3a2418", skin: HEAD },
  { jacket: "#c25a7a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#d8a040", skin: HEAD, dress: "#d9a441" },
  { jacket: "#7b5ac9", pants: "#2e3a5a", boots: INK, hat: "cap", cap: "#e2453c", skin: HEAD },
  { jacket: "#2f8a9a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#5a8fc2" },
  { jacket: "#d84a3a", pants: "#3b3f52", boots: INK, hat: "tophat", skin: HEAD, moustache: "#4a3020", build: "stout" },
  { jacket: "#f0b030", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#3f8a4a", skin: HEAD, build: "kid" },
  { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#22180f", skin: HEAD },
  { jacket: "#5d7a3a", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#b0b0b8", skin: HEAD, build: "stout" },
];
const DATERO: Outfit = { jacket: "#e85a8a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#7a3a1a", skin: HEAD, dress: "#7b5ac9" };
const BANKCUST: Outfit = { jacket: "#8f97a8", pants: "#3b3f52", boots: INK, hat: "tophat", skin: HEAD };
/** passers-by: position, outfit, timer, what they do */
type Folk = { p: V3; o: Outfit; timer: string; days: number; up?: boolean; expr: Expr; facing?: -1 | 0 | 1 };
const CROWD: Folk[] = [
  { p: [-1.5, 0, -4.5], o: FOLK[0], timer: "71Y 02M 14D", days: 26000, up: true, expr: "grin" },
  { p: [2.2, 0, -9.5], o: FOLK[1], timer: "33Y 05M 01D", days: 12000, up: true, expr: "nervous" },
  { p: [0.6, 0, -13.5], o: FOLK[2], timer: "08Y 11M 20D", days: 3200, expr: "shock" },
  { p: [-2.8, 0, -12.2], o: FOLK[4], timer: "02Y 06M 03D", days: 900, up: true, expr: "pained" },
  { p: [5.6, WALK, -7.4], o: FOLK[5], timer: "84Y 00M 12D", days: 30000, expr: "laugh" },
  { p: [-5.4, WALK, -15.5], o: FOLK[7], timer: "11Y 09M 05D", days: 4300, up: true, expr: "stern" },
  { p: [3.0, 0, -28], o: FOLK[6], timer: "46Y 01M 22D", days: 16800, expr: "neutral" },
  { p: [-2.5, 0, -33], o: FOLK[3], timer: "19Y 04M 09D", days: 7000, expr: "smile" },
];

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; light: Light; cInf: number; cam: (u: number, f: number) => Cam };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
const hp = (t: number) => heroAt(t).p; // hero position at time t
const S: ShotDef[] = [];
const shot = (a: number, light: Light, cInf: number, cam: (u: number, f: number) => Cam) => S.push({ a, light, cInf, cam });
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  // hook: the whole street wears timers
  shot(0, "day", 0, mv([2.5, 13, 12], [1.5, 8.5, 5], [0, 1.0, -12], [-0.5, 1.4, -12], 44, 0.0, true));
  shot(E("timer"), "day", 13, mv([-0.9, 2.2, -1.9], [-1.1, 2.15, -2.4], [-1.5, 2.1, -4.5], [-1.5, 2.1, -4.5], 36));
  shot(E("floating"), "day", 0, mv([1.2, 0.35, -9.2], [1.0, 0.4, -9.6], [2.2, 2.3, -9.5], [2.2, 2.4, -9.5], 50, -0.07));
  // one morning: our guy at his door
  shot(E("one"), "day", 0, mv([1.5, 1.3, 6.5], [0.5, 1.5, 5.2], [-5.6, 1.3, 0.2], [-5.6, 1.4, 0.2], 40, 0.0, true));
  shot(E("appears"), "day", 12, mv([-3.4, 1.65, 0.6], [-3.7, 1.7, 0.5], [-5.6, 1.75, 0], [-5.6, 1.85, 0], 36, 0.04));
  shot(E("our"), "day", 0, mv([-4.3, 0.55, 1.6], [-4.4, 0.6, 1.3], [-5.6, 1.95, 0], [-5.6, 2.0, 0], 54, -0.06));
  shot(E("fifty-two"), "day", 13, mv([-3.0, 2.38, 0.2], [-3.2, 2.4, 0.15], [-5.6, 2.3, 0], [-5.6, 2.3, 0], 40));
  shot(E("three"), "day", 10, mv([-2.1, 1.5, -1.4], [-2.3, 1.52, -1.3], [-5.6, 1.62, 0], [-5.6, 1.64, 0], 44, 0.03));
  shot(E("not"), "day", 12, mv([-3.1, 1.75, -1.2], [-3.3, 1.77, -1.1], [-5.6, 1.85, 0], [-5.6, 1.87, 0], 38, -0.04));
  shot(E("smiles"), "day", 13, mv([-4.2, 1.6, 0.7], [-4.4, 1.6, 0.6], [-5.6, 1.6, 0], [-5.6, 1.6, 0], 32, 0.05));
  // he steps outside: the street stares at each other's heads
  shot(E("steps"), "day", 6, (u, f) => { const h = hp(f / FPS); return { pos: [h[0] + 3.0, 1.45, h[2] - 4.2], look: [h[0], 1.2, h[2]], fov: 38, roll: 0 }; });
  shot(E("and", wIndex("and", "whole")), "day", 0, mv([7, 9, 2], [5, 8.4, -1], [-0.5, 0.8, -12], [-0.5, 0.9, -13], 44, 0.04, true));
  shot(E("staring"), "day", 11, mv([0.45, 1.9, -2.8], [0.3, 1.9, -3.2], [-1.7, 1.7, -7.9], [-1.7, 1.75, -7.9], 40, -0.03));
  // baker
  shot(E("the", 2), "day", 0, mv([1.2, 1.6, -6.5], [1.5, 1.7, -7.5], [6, 1.9, -12.5], [6, 1.9, -12.3], 42, 0.0));
  shot(E("keeps"), "day", 12, mv([3.6, 1.45, -10.6], [3.8, 1.5, -10.9], [5.75, 1.55, -12], [5.75, 1.6, -12], 36, 0.05));
  // mailman
  shot(E("the", 3), "day", 12, mv([3.2, 1.6, -1.6], [3.4, 1.62, -2.0], [5.3, 1.55, -3.6], [5.3, 1.6, -3.6], 38, -0.04));
  shot(E("nine", 2), "day", 13, mv([3.0, 2.25, -2.6], [3.15, 2.26, -2.75], [5.3, 2.15, -3.6], [5.3, 2.15, -3.6], 40));
  shot(E("drops"), "day", 10, mv([3.7, 0.75, -1.4], [3.8, 0.7, -1.7], [5.2, 0.95, -3.5], [5.2, 0.95, -3.5], 50, 0.06));
  shot(E("runs"), "day", 6, (u, f) => { const m = mailAt(f / FPS).p; return { pos: [-3.2, 1.3, m[2] + 1.0], look: [m[0], 1.0, m[2]], fov: 42, roll: 0 }; });
  shot(E("beach"), "day", 0, mv([6, 3.2, 44], [4.5, 2.6, 47], [0.8, 1.2, 58], [1.0, 1.2, 58], 44, -0.03, true));
  // lunch: "how long?"
  shot(E("by"), "day", 0, mv([2.6, 1.6, -13.4], [2.2, 1.6, -14.2], [-0.9, 1.4, -17.8], [-0.9, 1.45, -17.8], 40, 0.0, true));
  shot(E("how", 1), "day", 12, mv([0.4, 1.55, -15.9], [0.2, 1.56, -16.2], [-1.6, 1.55, -17.5], [-1.6, 1.58, -17.5], 34, 0.04));
  shot(E("they"), "day", 11, mv([1.8, 1.7, -15.6], [1.6, 1.72, -15.8], [-0.6, 1.8, -18.0], [-0.6, 1.85, -18.0], 42, -0.05));
  // banks, dating apps
  shot(E("banks"), "day", 0, mv([2.6, 0.6, -21.5], [2.4, 0.75, -22.4], [-7.5, 4.2, -27], [-7.5, 4.4, -27], 50, 0.05, true));
  shot(E("loans"), "day", 11, mv([-2.4, 1.6, -23.6], [-2.6, 1.6, -23.9], [-5.6, 1.6, -26.0], [-5.6, 1.65, -26.0], 40, -0.03));
  shot(E("dating"), "day", 11, mv([2.4, 1.6, -18.9], [2.6, 1.62, -19.2], [5.6, 1.5, -20.8], [5.6, 1.52, -20.8], 42, 0.04));
  shot(E("sort"), "day", 13, mv([4.45, 1.55, -19.0], [4.55, 1.55, -19.12], [5.83, 1.5, -20.39], [5.83, 1.5, -20.39], 38));
  // our guy on the couch: he waits
  shot(E("and", wIndex("and", "guy")), "day", 0, mv([0.5, 2.2, 7.5], [-0.5, 2.0, 6.5], [-5.6, 1.0, 1.8], [-5.6, 1.0, 1.9], 40, 0.0, true));
  shot(E("fifty-two", 2), "day", 12, mv([-3.4, 1.55, 3.0], [-3.6, 1.56, 2.9], [-5.7, 1.4, 2.2], [-5.7, 1.42, 2.2], 36, 0.03));
  shot(E("waits"), "day", 0, mv([-2.6, 0.5, 1.0], [-2.8, 0.55, 1.15], [-5.7, 1.3, 2.2], [-5.7, 1.35, 2.2], 44, -0.05));
  shot(E("tomorrow"), "day", 11, mv([-3.8, 2.6, 4.0], [-4.0, 2.55, 3.8], [-5.7, 1.6, 2.2], [-5.7, 1.6, 2.2], 38, 0.04));
  shot(E("next", 1), "day", 0, mv([1.0, 1.4, 2.6], [0.6, 1.45, 2.5], [-5.7, 1.3, 2.2], [-5.7, 1.3, 2.2], 30, 0.0));
  shot(E("next", 2), "day", 12, mv([-3.2, 1.45, 1.2], [-3.4, 1.47, 1.35], [-5.7, 1.8, 2.2], [-5.7, 1.8, 2.2], 40, -0.04));
  // one night: the maths
  shot(E("then"), "golden", 0, mv([1.6, 1.8, 6.4], [0.8, 1.7, 5.6], [-5.6, 1.3, 1.6], [-5.6, 1.35, 1.7], 42, 0.0, true));
  shot(E("math"), "golden", 13, mv([-3.0, 2.5, 2.4], [-3.15, 2.5, 2.38], [-5.7, 2.35, 2.2], [-5.7, 2.35, 2.2], 42));
  shot(E("asleep"), "golden", 12, mv([-3.5, 1.5, 2.9], [-3.65, 1.5, 2.8], [-5.7, 1.4, 2.2], [-5.7, 1.4, 2.2], 36, 0.04));
  shot(E("years", wIndex("years", "more")), "golden", 13, mv([-3.5, 1.45, 3.0], [-3.6, 1.45, 2.95], [-5.7, 1.3, 2.2], [-5.7, 1.32, 2.2], 40, -0.03));
  shot(E("phone"), "golden", 13, mv([-3.0, 2.5, 2.0], [-3.1, 2.5, 2.0], [-5.7, 2.35, 2.2], [-5.7, 2.35, 2.2], 42, 0.02));
  shot(E("that", 1), "golden", 13, mv([-2.9, 2.45, 2.6], [-3.05, 2.46, 2.55], [-5.7, 2.35, 2.2], [-5.7, 2.35, 2.2], 40, -0.03));
  shot(E("maybe"), "golden", 14, mv([-2.8, 2.42, 2.3], [-3.5, 2.4, 2.25], [-5.7, 2.35, 2.2], [-5.7, 2.35, 2.2], 38, 0.04, true));
  shot(E("so", 2), "golden", 10, mv([-2.6, 1.0, 3.9], [-2.8, 1.05, 3.7], [-5.1, 1.35, 2.1], [-5.1, 1.45, 2.1], 46, 0.05));
  shot(E("off"), "golden", 6, (u, f) => { const h = hp(f / FPS); return { pos: [h[0] + 3.2, 1.3, h[2] + 5.0], look: [h[0], 1.25, h[2]], fov: 40, roll: 0.02 }; });
  // the thing: everyone has one
  shot(E("here"), "golden", 0, mv([4, 3, 22], [3, 15, 30], [-1, 1.6, 6], [-1, 1.0, -8], 46, 0.0, true));
  shot(E("you", 2), "golden", 0, mv([4.5, 1.9, -1.0], [3.8, 2.0, -2.2], [-0.5, 1.9, -9.5], [-0.5, 2.0, -10], 42, -0.03, true));
  shot(E("you", 3), "golden", 8, mv([0.2, 1.6, -2.0], [0.0, 1.62, -2.6], [-1.5, 1.8, -4.5], [-1.5, 1.85, -4.5], 38, 0.03));
  // callback: hero and the mailman at the beach
  shot(E("subscribe"), "golden", 0, mv([-0.5, 1.4, 50.5], [-0.3, 1.45, 51.6], [0.3, 1.3, 57], [0.3, 1.32, 57], 40, 0.0));
  shot(E("go"), "golden", 9, mv([-1.6, 1.45, 53.6], [-1.5, 1.47, 54.0], [-0.2, 1.4, 56.6], [-0.2, 1.42, 56.6], 34, -0.04));
  shot(E("keep"), "golden", 0, mv([2.6, 1.6, 50.5], [2.2, 2.6, 49.5], [0.4, 1.3, 57], [0.4, 1.5, 58], 42, 0.03, true));
};
/** which occurrence of `w` comes right before the word `next` */
function wIndex(w: string, next: string) {
  const W = VOICE.words;
  let k = 0;
  for (let i = 0; i < W.length - 1; i++) {
    if (norm(W[i].w) === norm(w)) { k++; if (norm(W[i + 1].w) === norm(next) || (i + 2 < W.length && norm(W[i + 2].w) === norm(next))) return k; }
  }
  return 1;
}
export const SHOTS = S;
let built = false;
const ensure = () => { if (!built) { built = true; build(); S.sort((a, b) => a.a - b.a); } };
export const shotIdx = (f: number) => {
  ensure();
  let i = 0;
  while (i + 1 < S.length && f >= S[i + 1].a) i++;
  return i;
};
const shotEnd = (i: number) => (i + 1 < S.length ? S[i + 1].a : TOTAL);
/** impact flip-kicks (7 f) */
const KICKS = () => [wf("appears"), wf("drops") + 6, wf("twenty"), wf("off")];
const kick = (f: number) => {
  for (const k of KICKS()) { const d = f - k; if (d >= 0 && d < 7) return (d % 2 ? -1 : 1) * 0.05 * (1 - d / 7); }
  return 0;
};
export const camAt = (i: number, f: number): Cam => {
  ensure();
  const s = S[i], b = shotEnd(i), u = clamp01((f - s.a) / Math.max(1, b - s.a));
  const c = s.cam(u, f);
  const k = 0.0025 * Math.max(0, f - s.a); // creeping push-in on every hold
  return { ...c, pos: lerp3(c.pos, c.look, Math.min(0.2, k * 0.35)), roll: c.roll + kick(f) };
};
export const lightAt = (f: number): Light => { ensure(); return S[shotIdx(f)].light; };
export const dofAt = (f: number) => { ensure(); return { cInf: S[shotIdx(f)].cInf }; };
/** white flash frames after the timer pops */
export const flashAt = (f: number) => { const d = f - wf("appears") - 2; return d >= 0 && d < 6 ? 0.35 * (1 - d / 6) : 0; };

// ---------------- story state ----------------
type Pose = { p: V3; side?: { dir: V3; so: SideOpts }; fo: FrontOpts; sit?: boolean; show: boolean };
/** hero: door (morning) -> walks the street -> couch -> math -> gets up and strides off -> beach */
export function heroAt(t: number): Pose {
  const T = (w: string, n = 1) => wt(w, n) - 0.07;
  if (t < T("steps")) {
    let expr: Expr = "neutral", headTilt = 0, look = 0, wave: number | undefined;
    if (t < T("appears")) expr = "dazed";
    else if (t < T("our")) expr = "shock";
    else if (t < T("not")) { expr = "nervous"; headTilt = -6; look = 0.6; }
    else if (t < T("smiles")) expr = "relief";
    else { expr = "grin"; wave = 0.3 + 0.2 * Math.sin(t * 6); }
    return { p: DOOR, fo: { mode: "stand", expr, headTilt, look, wave }, show: t >= T("one") - 0.1 };
  }
  if (t < T("and", wIndex("and", "guy"))) {
    const d = Math.min(t - T("steps"), 5.5) * 1.1;
    return { p: [-5.4, WALK, -0.6 - d], fo: { mode: "stroll", phase: t * 1.0, expr: "grin", look: 0.4 }, show: true };
  }
  if (t < T("so", 2)) {
    let expr: Expr = "smile_closed", pr: FrontOpts["prop"] = null, blink: number | undefined;
    if (t >= T("tomorrow")) expr = "whistle";
    if (t >= T("next", 2)) expr = "dazed";
    if (t >= T("then")) { expr = "neutral"; pr = "phone"; }
    if (t >= T("math")) expr = "nervous";
    if (t >= T("a", wIndex("a", "third")) + 0.9 && t < T("years", wIndex("years", "more"))) { expr = "relief"; blink = 1; pr = null; }
    if (t >= T("years", wIndex("years", "more"))) { expr = "dazed"; pr = "phone"; }
    if (t >= T("that", 1)) { expr = "nervous"; pr = null; }
    if (t >= T("twenty")) expr = "shock";
    return { p: [COUCH[0], COUCH[1] + SEAT, COUCH[2]], fo: { mode: "sit", expr, prop: pr, blink }, sit: true, show: true };
  }
  if (t < T("off")) return { p: [COUCH[0] + 0.85, WALK, COUCH[2] - 0.2], fo: { mode: "stand", expr: "stern", tilt: -3 }, show: true };
  if (t < T("subscribe")) {
    const d = (t - T("off")) * 1.35;
    const z = COUCH[2] - 0.2 + d; // in front of the sofa (clear of its arm at x -5.1) until past it, then onto the sidewalk middle
    return { p: [lerp(COUCH[0] + 0.85, -5.6, smooth((z - (COUCH[2] + 1.6)) / 1.8)), WALK, z], fo: { mode: "stroll", phase: t * 1.1, expr: "grin" }, show: t < T("here") + 0.1 || t > T("you", 2) };
  }
  return { p: BEACH_HERO, fo: { mode: "stand", expr: t > T("go") ? "laugh" : "grin", wave: 0.6 + 0.4 * Math.sin(t * 7) }, show: true };
}
/** mailman: post box -> drops his bag -> sprints to the beach -> happy on the sand */
function mailAt(t: number): Pose {
  const T = (w: string, n = 1) => wt(w, n) - 0.07;
  if (t < T("runs")) {
    let expr: Expr = "neutral";
    if (t >= T("nine", 2)) expr = "shock";
    if (t >= T("drops")) expr = "relief_open";
    return { p: MAIL0, fo: { mode: "stand", expr, look: t >= T("drops") ? -0.5 : 0 }, show: true };
  }
  if (t < T("beach")) {
    const z = MAIL0[2] + (t - T("runs")) * RUN_SPEED;
    return { p: [lerp(MAIL0[0], 0.8, clamp01((t - T("runs")) * 3)), 0, z], side: { dir: [0, 0, 1], so: { mode: "march", phase: t * 2.4, expr: "laugh", stride: 1.6 } }, fo: {}, show: true };
  }
  return { p: BEACH_MAIL, fo: { mode: "stand", expr: "laugh", wave: 0.5 + 0.5 * Math.sin(t * 8), lift: 30 }, show: true };
}

// ---------------- painted props ----------------
const signTex = (key: string, text: string, bg: string, fg: string, w = 1024, h = 256, font = 150) => ctex(key, w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#241726"; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${font}px "DejaVu Sans", Arial, sans-serif`;
  const lines = text.split("\n");
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * font * 1.05));
});
const unlit = (key: string, map: THREE.Texture) => {
  const m = new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide });
  m.name = key;
  return m;
};
const stripeTex = (key: string, a: string, b: string, n = 8) => ctex(key, 512, 256, (g) => {
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect((i * 512) / n, 0, 512 / n + 1, 256); }
});
const seaTex = () => ctex("seaTimer", 1024, 1024, (g, r) => {
  g.fillStyle = "#2a9fd0"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) {
    const x = r() * 1024, y = r() * 1024, w = 20 + r() * 60;
    g.strokeStyle = r() < 0.7 ? "rgba(255,255,255,0.55)" : "rgba(10,60,120,0.35)"; g.lineWidth = 4 + r() * 4; g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 8, x + w, y); g.stroke();
  }
});
const sandTex = () => ctex("sandTimer", 1024, 1024, (g, r) => {
  g.fillStyle = "#ecd39a"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? "rgba(190,150,90,0.25)" : "rgba(255,245,215,0.35)"; g.fillRect(r() * 1024, r() * 1024, 3 + r() * 5, 2 + r() * 3); }
});
const discTex = () => ctex("sunDiscT", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 56, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

// ---------------- 2D effect drawings ----------------
const R = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};
const MONO = `"DejaVu Sans Mono", "Liberation Mono", monospace`;
/** the countdown plate: big Y/M/D line + ticking h:m:s; bar = 0 none / 1 sleep third / 2 + phone / 3 52 crossed / 4 ~20Y */
const drawTimer = (txt: string, hms: string, col: string, bar = 0) => (p: Pen) => {
  const g = p.g;
  g.fillStyle = "#1b1830"; R(g, 10, 10, 620, 240, 46); g.fill();
  g.lineWidth = 14; g.strokeStyle = "#241726"; g.stroke();
  g.lineWidth = 5; g.strokeStyle = col; R(g, 26, 26, 588, 208, 34); g.stroke();
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col;
  if (bar >= 3) {
    g.font = `900 112px ${MONO}`;
    if (bar === 3) {
      g.fillText("52Y", 320, 112);
      g.strokeStyle = "#ff4a3a"; g.lineWidth = 16; g.lineCap = "round";
      g.beginPath(); g.moveTo(190, 150); g.lineTo(450, 70); g.stroke();
    } else g.fillText("~20Y", 320, 112);
    g.font = `700 40px ${MONO}`; g.fillText(hms, 320, 200);
    return;
  }
  g.font = `900 72px ${MONO}`; g.fillText(txt, 320, bar ? 82 : 100);
  if (!bar) { g.font = `700 46px ${MONO}`; g.globalAlpha = 0.85; g.fillText(hms, 320, 182); g.globalAlpha = 1; return; }
  // life bar: sleep (a third), phone (a quarter), the rest
  const x0 = 50, x1 = 590, y0 = 140, h = 72, w = x1 - x0;
  g.fillStyle = "#2c2a44"; R(g, x0, y0, w, h, 14); g.fill();
  g.fillStyle = col; R(g, x0, y0, w, h, 14); g.fill();
  g.fillStyle = "#3b4fa8"; g.fillRect(x0, y0, w / 3, h);
  g.fillStyle = "#e8eefc"; g.font = `900 46px ${MONO}`; g.fillText("Zzz", x0 + w / 6, y0 + h / 2 + 2);
  if (bar >= 2) {
    g.fillStyle = "#6a6a7a"; g.fillRect(x0 + w / 3, y0, w * 0.27, h);
    const cx = x0 + w / 3 + w * 0.135;
    g.fillStyle = "#e8eefc"; R(g, cx - 16, y0 + 12, 32, 48, 7); g.fill(); g.fillStyle = "#6a6a7a"; g.fillRect(cx - 10, y0 + 19, 20, 32);
  }
  g.lineWidth = 6; g.strokeStyle = "#241726"; R(g, x0, y0, w, h, 14); g.stroke();
};
/** dating app screen, rows sorted by the timer once k > 0.5 */
const drawApp = (k: number) => (p: Pen) => {
  const g = p.g;
  g.fillStyle = "#242536"; R(g, 10, 10, 400, 700, 54); g.fill(); g.lineWidth = 12; g.strokeStyle = "#241726"; g.stroke();
  g.fillStyle = "#fff7f2"; R(g, 32, 60, 356, 620, 26); g.fill();
  g.fillStyle = "#e85a8a"; g.font = `900 46px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("♥ MATCH", 210, 112);
  const rows = [["#3f9a5a", "64 YRS", true], ["#7b5ac9", "51 YRS", true], ["#f0b030", "38 YRS", true], ["#d84a3a", "3 DAYS", false]] as const;
  const order = k > 0.5 ? [0, 1, 2, 3] : [3, 1, 0, 2];
  order.forEach((ri, slot) => {
    const [c, label, ok] = rows[ri], y = 170 + slot * 122;
    g.fillStyle = slot % 2 ? "#fbe9ef" : "#ffffff"; g.fillRect(40, y, 340, 112);
    g.fillStyle = "#f8f6f0"; g.beginPath(); g.arc(98, y + 56, 38, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = "#241726"; g.stroke();
    g.fillStyle = c; g.beginPath(); g.arc(98, y + 108, 40, Math.PI, 0); g.fill();
    g.fillStyle = "#241726"; g.beginPath(); g.arc(86, y + 52, 4, 0, 7); g.arc(110, y + 52, 4, 0, 7); g.fill();
    g.fillStyle = ok ? "#1f2a44" : "#c8323a"; g.font = `900 40px ${MONO}`; g.textAlign = "left"; g.fillText(label, 150, y + 50);
    g.font = `900 44px "DejaVu Sans", sans-serif`; g.fillText(ok ? "♥" : "✕", 330, y + 52);
  });
};
const drawBag = (p: Pen) => {
  p.ell(150, 150, 110, 80, "#8a5a34", 10);
  p.poly([[60, 110], [240, 110], [230, 150], [70, 150]], "#6e4526", 8);
  p.ell(150, 132, 16, 16, "#e8c45a", 6);
};
const drawLetter = (rot: number) => (p: Pen) => {
  p.rot = [rot, 100, 70];
  p.poly([[20, 20], [180, 20], [180, 120], [20, 120]], "#ffffff", 8);
  p.stroke([[20, 20], [100, 80], [180, 20]], 6);
  p.rot = null;
};
const drawCal = (txt: string) => (p: Pen) => {
  const g = p.g;
  p.poly([[20, 40], [280, 40], [280, 330], [20, 330]], "#ffffff", 10);
  p.poly([[20, 40], [280, 40], [280, 110], [20, 110]], "#e2453c", 10);
  g.fillStyle = "#241726"; g.font = `900 150px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 150, 225);
};
const drawZ = (p: Pen) => {
  const g = p.g;
  g.fillStyle = "#e8eefc"; g.strokeStyle = "#241726"; g.lineWidth = 10; g.textAlign = "center"; g.textBaseline = "middle";
  for (const [x, y, s] of [[60, 220, 70], [140, 140, 95], [230, 60, 120]] as const) { g.font = `900 ${s}px "DejaVu Sans", sans-serif`; g.strokeText("Z", x, y); g.fillText("Z", x, y); }
};
const drawBubble = (txt: string) => (p: Pen) => {
  p.ell(150, 120, 120, 90, "#ffffff", 10);
  p.poly([[110, 190], [150, 200], [90, 260]], "#ffffff", 0);
  p.stroke([[112, 196], [90, 258], [150, 204]], 10);
  const g = p.g; g.fillStyle = "#241726"; g.font = `900 120px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 150, 124);
};

// ---------------- the world ----------------
const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, "0");
/** live countdown from a number of days (ticks every second of film time) */
const fromDays = (days: number, t: number) => {
  const total = days * 86400 - t * 1, d = Math.floor(total / 86400), r = total - d * 86400;
  return { hms: `${pad2(r / 3600)}:${pad2((r % 3600) / 60)}:${pad2(r % 60)}` };
};
const COL_OK = "#7ff0ff", COL_LOW = "#ffb04a", COL_RED = "#ff5a4a";

export class TownWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private glows: THREE.Mesh[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#bccbec", 60, 700);
  private clouds: THREE.Mesh[] = [];
  private cloudMats: Record<Light, THREE.Texture[]>;
  private sunDisc: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private winMat: THREE.MeshLambertMaterial;

  constructor() {
    const Rt = this.root;
    // ---- sky ----
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
    Rt.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6, 4.6, 3.0), fog: false, depthWrite: false }));
    this.sunDisc.layers.set(NOINK); this.sunDisc.visible = false; Rt.add(this.sunDisc);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    Rt.add(this.hemi, this.sun, this.sun.target);
    this.cloudMats = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.3, d = 560 + (i % 3) * 70;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMats.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 140 + (i % 4) * 34;
      m.position.set(Math.cos(a) * d, 60 + (i % 4) * 34, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK); this.clouds.push(m); Rt.add(m);
    }
    const kit = makeKit();
    const b = new Batch();
    // ---- ground: grass, road, sidewalks, beach, sea ----
    b.add(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2).translate(0, -0.02, -330), lam("grassT", () => ({ map: rep(grassHD(), 160, 160) })));
    b.add(new THREE.PlaneGeometry(8, 140).rotateX(-Math.PI / 2).translate(0, 0, -30), lam("roadT", () => ({ map: rep(cobbleHD(), 2, 35) })));
    for (const s of [-1, 1]) {
      const g = boxGeo(V(s < 0 ? -SIDE_OUT : SIDE_IN, -0.1, -100), V(s < 0 ? -SIDE_IN : SIDE_OUT, WALK, 40), 2);
      b.add(g, lam("walkT", () => ({ map: stoneHD("walkHD", ["#e6dccb", "#ddd2bf", "#ece3d4", "#d6cab6"], "#b0a390") })));
      b.add(boxGeo(V(s < 0 ? -SIDE_IN - 0.18 : SIDE_IN, -0.1, -100), V(s < 0 ? -SIDE_IN : SIDE_IN + 0.18, WALK + 0.02, 40)), lam("kerb", () => ({ color: "#bdb4a6" })));
    }
    // promenade + beach
    b.add(boxGeo(V(-60, -0.1, 40), V(60, WALK, BEACH_Z)), lam("walkT", () => ({})));
    for (const s of [-1, 1]) b.add(boxGeo(V(s < 0 ? -60 : 2.2, WALK, BEACH_Z - 0.5), V(s < 0 ? -2.2 : 60, WALK + 0.6, BEACH_Z)), lam("wallW", () => ({ color: "#f2ead8" })));
    b.add(new THREE.PlaneGeometry(400, SEA_Z - BEACH_Z + 6).rotateX(-Math.PI / 2).translate(0, 0.0, (BEACH_Z + SEA_Z) / 2 + 3), lam("sandT", () => ({ map: rep(sandTex(), 40, 4) })));
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(2400, 1200).rotateX(-Math.PI / 2).translate(0, -0.05, SEA_Z + 600), lam("seaT", () => ({ map: rep(seaTex(), 80, 40) })));
    sea.receiveShadow = true; Rt.add(sea);
    // foam line
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(400, 1.4).rotateX(-Math.PI / 2).translate(0, 0.03, SEA_Z + 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 1.15, 1.15) }));
    foam.layers.set(NOINK); Rt.add(foam);
    // umbrellas, deck chairs, lifeguard hut
    const pole = lam("poleW", () => ({ color: "#f4f1ea" }));
    [[-6, 60, "#e2453c"], [5.5, 63, "#3f6fb5"], [-14, 66, "#f4c430"], [13, 58, "#3f9a5a"], [-3, 70, "#e85a8a"]].forEach(([x, z, c], i) => {
      b.add(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8).translate(x as number, 1.2, z as number), pole);
      b.add(new THREE.ConeGeometry(1.5, 0.6, 12, 1, true).translate(x as number, 2.5, z as number), lam("umb" + i, () => ({ map: stripeTex("umbT" + c, c as string, "#fbf6ea", 12), side: THREE.DoubleSide })));
      b.add(boxGeo(V((x as number) + 0.6, 0.0, (z as number) + 0.6), V((x as number) + 1.3, 0.35, (z as number) + 2.2)), lam("chair" + i, () => ({ map: stripeTex("chT" + c, c as string, "#ffffff", 6) })));
    });
    b.add(boxGeo(V(18, 0, 64), V(21, 3.8, 67)), lam("hutW", () => ({ color: "#e84a3a" })));
    b.add(boxGeo(V(17.6, 3.8, 63.6), V(21.4, 4.2, 67.4)), lam("hutR", () => ({ color: "#f4f1ea" })));
    // ---- houses both sides ----
    const lots: [number, number, number, number][] = []; // [side, zCenter, w, h]
    for (const s of [-1, 1]) {
      let z = 36;
      let k = s < 0 ? 0 : 3;
      while (z > -100) {
        const w = [7, 9, 8][k % 3], h = [7, 8.4, 9.8, 7][k % 4];
        lots.push([s, z - w / 2, w, h]);
        z -= w + 0.4; k++;
      }
    }
    for (const [s, zc, w, h] of lots) {
      if (s < 0 && Math.abs(zc - DOOR[2]) < 6) continue;          // hero's house is placed by hand
      if (s < 0 && zc < -20 && zc > -33) continue;                  // bank
      if (s > 0 && Math.abs(zc - BAKER[2]) < 6) continue;           // bakery
      house(b, s * (SIDE_OUT + 4), zc, s < 0 ? Math.PI / 2 : -Math.PI / 2, w, 8, h, Math.abs(Math.round(zc * 7)) % 8, 0);
    }
    house(b, -(SIDE_OUT + 4), 0, Math.PI / 2, 9, 8, 7, 1, 0);                    // hero's cream house
    house(b, SIDE_OUT + 4, BAKER[2], -Math.PI / 2, 9, 8, 8.4, 2, 0);             // bakery
    // bakery awning + sign
    b.add(new THREE.PlaneGeometry(1, 1).scale(7.0, 2.0, 1).rotateY(-Math.PI / 2).rotateZ(-0.55).translate(SIDE_OUT - 0.55, 3.25, BAKER[2]), lam("awn", () => ({ map: stripeTex("awnT", "#e2453c", "#fbf6ea", 10), side: THREE.DoubleSide })));
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.1).rotateY(-Math.PI / 2).translate(SIDE_OUT - 0.02, 4.6, BAKER[2]), unlit("bakery", signTex("bakerySign", "BAKERY", "#fff3d8", "#c8503a")));
    Rt.add(sg);
    // bank: stone block, columns, pediment, BANK sign, loan board
    const bz = -26.5, bx0 = -(SIDE_OUT + 8.5), bx1 = -(SIDE_OUT + 0.3);
    const bankStone = lam("bankStone", () => ({ map: stoneHD("bankHD", ["#efe7d6", "#e6dcc8", "#f3ecde", "#e0d5c0"], "#b8aa94") }));
    b.add(boxGeo(V(bx0, 0, bz - 6), V(bx1 - 1.6, 9.5, bz + 6), 3), bankStone);
    b.add(boxGeo(V(bx1 - 1.9, 0, bz - 6.2), V(bx1 + 0.2, 0.6, bz + 6.2)), lam("bankStep", () => ({ color: "#d9d0bd" })));
    for (const zc of [-4.5, -1.6, 1.6, 4.5]) b.add(new THREE.CylinderGeometry(0.42, 0.48, 7.2, 16).translate(bx1 - 0.6, 0.6 + 3.6, bz + zc), lam("col", () => ({ color: "#f6f1e6" })));
    b.add(boxGeo(V(bx1 - 1.9, 7.8, bz - 6.2), V(bx1 + 0.2, 8.6, bz + 6.2)), lam("col", () => ({})));
    b.add(boxGeo(V(bx1 - 1.9, 8.6, bz - 4.2), V(bx1 + 0.1, 9.6, bz + 4.2)), lam("col", () => ({})));
    b.add(boxGeo(V(bx1 - 1.7, 0.6, bz - 1.0), V(bx1 - 1.55, 3.4, bz + 1.0)), lam("bankDoor", () => ({ color: "#5a3a26" })));
    const bs = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.2).rotateY(Math.PI / 2).translate(bx1 + 0.25, 7.2, bz), unlit("bankS", signTex("bankSign", "BANK", "#1f3a5a", "#f4d27a")));
    Rt.add(bs);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.3).rotateY(Math.PI / 2).translate(-SIDE_IN - 1.0, WALK + 1.35, bz + 2.6), unlit("loanS", signTex("loanSign", "LOANS\nONLY FOR\n30+ YEARS", "#fffaf0", "#1f3a5a", 512, 448, 92)));
    Rt.add(board);
    b.add(boxGeo(V(-SIDE_IN - 1.06, WALK, bz + 2.0), V(-SIDE_IN - 0.98, WALK + 0.75, bz + 3.2)), lam("easel", () => ({ color: "#5a3a26" })));
    // hero's sofa (seat top WALK + SEAT), facing the street (+x)
    const [cx, , cz] = COUCH, sofa = lam("sofa", () => ({ color: "#3fa08a" })), sofaD = lam("sofaD", () => ({ color: "#2f7d6c" }));
    b.add(boxGeo(V(cx - 0.45, WALK, cz - 1.1), V(cx + 0.45, WALK + SEAT, cz + 1.1)), sofa);
    b.add(boxGeo(V(cx - 0.6, WALK, cz - 1.1), V(cx - 0.35, WALK + 1.05, cz + 1.1)), sofaD);
    for (const s of [-1, 1]) b.add(boxGeo(V(cx - 0.6, WALK, cz + s * 1.1 - 0.12), V(cx + 0.5, WALK + 0.7, cz + s * 1.1 + 0.12)), sofaD);
    // post box
    b.add(new THREE.CylinderGeometry(0.3, 0.3, 1.25, 18).translate(POSTBOX[0], WALK + 0.62, POSTBOX[2]), lam("postR", () => ({ color: "#d8352a" })));
    b.add(new THREE.SphereGeometry(0.3, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2).translate(POSTBOX[0], WALK + 1.25, POSTBOX[2]), lam("postR", () => ({})));
    // lanterns, benches, trees, flowers
    for (let z = 30; z > -95; z -= 11) for (const s of [-1, 1]) {
      const lx = s * (SIDE_IN + 0.5), lz = z + (s > 0 ? 4 : 0);
      if ([COUCH, DOOR, BAKER, MAIL0, BANKER, DATER, ...CROWD.map((c) => c.p), [-5.4, 0, -3.5] as V3].some((q) => Math.hypot(q[0] - lx, q[2] - lz) < 3.5)) continue;
      prop(b, kit, "lantern", lx, WALK, lz, 3.6);
    }
    for (const [x, z] of [[6.4, 6], [-6.6, -9], [6.5, -30], [-6.5, 14], [6.5, 20], [-6.6, -40]]) prop(b, kit, "tree_oak", x, WALK, z, 5.2);
    for (const [x, z] of [[6.6, -16.5], [-6.6, 8]]) prop(b, kit, "stall-bench", x, WALK, z, 0.9, x > 0 ? -Math.PI / 2 : Math.PI / 2);
    prop(b, kit, "stall-red", 5.9, WALK, -15.6, 2.4, -Math.PI / 2);
    for (let i = 0; i < 26; i++) {
      const s = i % 2 ? 1 : -1, z = 34 - i * 4.6;
      prop(b, kit, ["flower_redA", "flower_yellowA", "flower_purpleA"][i % 3], s * (SIDE_OUT - 0.3), WALK, z, 0.5);
    }
    for (let i = 0; i < 40; i++) { const s = i % 2 ? 1 : -1; prop(b, kit, i % 3 ? "tree_default" : "tree_cone", s * (24 + (i * 7) % 18), 0, 30 - i * 5, 8 + (i % 4)); }
    // hills behind the town
    const hillM = lam("hillT", () => ({ map: rep(grassHD(), 30, 30) }));
    for (const [x, z, r, h] of [[-120, -160, 90, 40], [80, -220, 120, 55], [-40, -260, 100, 46], [160, -90, 70, 30], [-170, -40, 80, 34]]) {
      const hill = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2); hill.scale(r, h, r * 0.7);
      b.add(hill, hillM, new THREE.Matrix4().makeTranslation(x, 0, z));
    }
    b.build(Rt);
    // warm windows that glow at night (a separate overlay on the hero's house)
    this.winMat = new THREE.MeshLambertMaterial({ color: "#ffd890", emissive: "#ffb050", emissiveIntensity: 0 });
    for (const zc of [-2.6, 2.6]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3).rotateY(Math.PI / 2).translate(-SIDE_OUT - 0.25, 4.6, zc), this.winMat);
      Rt.add(w);
    }
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  private glow(i: number) {
    while (this.glows.length <= i) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: new THREE.Color(1.7, 1.7, 1.7), side: THREE.DoubleSide }));
      m.layers.set(NOINK); m.renderOrder = 3; this.root.add(m); this.glows.push(m);
    }
    return this.glows[i];
  }
  private shotSun(i: number) {
    let v = this.sunCache.get(i);
    if (v) return v;
    const s = SHOTS[i], L = LIGHTS[s.light], b = shotEnd(i);
    let fx = 0, fz = 0;
    for (let f = s.a; f < b; f += 3) { const c = camAt(i, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(s.light === "golden" ? 38 : L.az), el = THREE.MathUtils.degToRad(s.light === "golden" ? 11 : L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(i, v);
    return v;
  }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const i = shotIdx(f), s = SHOTS[i], t = f / FPS, light = s.light, L = LIGHTS[light], K = LOOK[light];
    const T = (w: string, n = 1) => wt(w, n) - 0.07;
    const c = camAt(i, f), pos = V(...c.pos), look = V(...c.look);
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    // ---- light rig ----
    const sunDir = this.shotSun(i), dist = pos.distanceTo(look);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 9, 14, 45);
    this.sun.position.copy(look).addScaledVector(sunDir, 220); this.sun.target.position.copy(look);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, k) => untone(h, su["c" + k].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = light === "golden" ? 60 : 70; this.fog.far = light === "golden" ? 520 : 700;
    scene.fog = this.fog; scene.background = null;
    this.clouds.forEach((m, k) => { (m.material as THREE.MeshBasicMaterial).map = this.cloudMats[light][k % 4]; m.lookAt(cam.position.x, m.position.y, cam.position.z); });
    this.sunDisc.visible = light === "golden";
    if (this.sunDisc.visible) { this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900); this.sunDisc.scale.setScalar(40); }
    this.winMat.emissiveIntensity = light === "golden" ? 1.4 : 0;

    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const k = (f + seed * 37) % 64; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
    let ai = 0, fi = 0, gi = 0;
    const used: Actor[] = [], fused: Fx[] = [];
    const addFx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, at: THREE.Vector3, w: number, h: number, soft = false) => {
      const ef = this.fx(fi++);
      ef.r = this.pool.req(key, cw, ch, 1, draw); ef.use(soft);
      ef.mesh.visible = true; ef.mesh.position.copy(at); ef.mesh.quaternion.copy(cam.quaternion); ef.mesh.scale.set(w, h, 1);
      fused.push(ef);
      return ef;
    };
    const ground = (p: V3, w = 0.55) => {
      const ef = addFx("blob|contact|#3a3460", 128, 128, (pp) => fxContact(pp, "#3a3460"), V(p[0], p[1] + 0.02, p[2]), w, w * 0.7);
      ef.mesh.rotation.set(-Math.PI / 2, 0, 0);
    };
    const timer = (head: THREE.Vector3, txt: string, days: number, col: string, alpha = 1, bar = 0, sz = 1) => {
      if (alpha <= 0.01) return;
      const { hms } = fromDays(days, t);
      const g = this.glow(gi++), r = this.pool.req(`timer|${txt}|${hms}|${col}|${bar}`, 640, 260, 1, drawTimer(txt, hms, col, bar));
      (g as unknown as { _r: typeof r })._r = r;
      g.visible = true; g.position.copy(head); g.quaternion.copy(cam.quaternion); g.scale.set(0.92 * sz, 0.374 * sz, 1);
      (g.material as THREE.MeshBasicMaterial).opacity = alpha;
    };
    const fadeAll = 1 - smooth((t - T("see", 2)) / 0.6); // "you just can't see it": every timer fades away
    const shown = t < T("subscribe") ? fadeAll : 0;
    const pop = (t0: number) => smooth((t - t0) / 0.25);
    const person = (key: string, p: V3, o: Outfit, fo: FrontOpts, seed: number, side?: { dir: V3; so: SideOpts }) => {
      const w = V(...p), d = cam.position.distanceTo(w);
      if (d > 140) return;
      const [cw, ch, k] = d < 3.2 ? [1800, 3000, 3.0] : d < 7 ? [1080, 1800, 1.8] : d < 18 ? [480, 800, 0.8] : [240, 400, 0.4];
      const a = this.actor(ai++);
      let mirror = false;
      if (side) {
        const so: SideOpts = { ...side.so, light: L2D, seed };
        mirror = side.dir[0] * right.x + side.dir[2] * right.z < 0;
        a.r = this.pool.req(`${key}|S|${JSON.stringify(so, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, k, (pen) => bodySide(pen, o, so));
      } else {
        const f2: FrontOpts = { ...fo, light: L2D, seed };
        if (f2.blink === undefined) f2.blink = lid(seed);
        a.r = this.pool.req(`${key}|F|${JSON.stringify(f2, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, k, (pen) => bodyFront(pen, o, f2));
      }
      a.mesh.visible = true; a.mesh.position.copy(w);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - w.x, cam.position.z - w.z), 0);
      a.mesh.scale.set(mirror ? -1 : 1, 1, 1); a.mesh.castShadow = light === "golden";
      used.push(a);
    };
    // hero
    const h = heroAt(t);
    if (h.show) {
      person("hero", h.p, HERO, h.fo, 4);
      if (!h.sit) ground(h.p);
      if (t >= T("appears")) {
        let txt = "52Y 03M 09D", days = 52 * 365 + 99, bar = 0, col = COL_OK;
        if (t >= T("tomorrow")) { txt = "52Y 03M 08D"; days -= 1; }
        if (t >= T("next", 1)) { txt = "52Y 02M 08D"; days -= 30; }
        if (t >= T("next", 2)) { txt = "51Y 02M 08D"; days -= 365; }
        if (t >= T("math")) bar = 1;
        if (t >= T("phone")) bar = 2;
        if (t >= T("that", 1)) { bar = 3; col = COL_LOW; }
        if (t >= T("twenty")) bar = 4;
        if (t >= T("so", 2)) { bar = 4; col = COL_OK; }
        const top = h.sit ? 1.75 : 2.15, sz = bar && bar < 3 ? 1.12 : 1;
        timer(V(h.p[0], h.p[1] + top + (sz - 1) * 0.2, h.p[2]), txt, days, col, pop(T("appears")) * shown, bar, sz);
      }
      if (t >= T("appears") && t < T("appears") + 0.5) {
        const k = Math.round(((t - T("appears")) / 0.5) * 8) / 8;
        addFx(`burst|${k}`, 500, 500, (p) => fxBurst(p, k, "#bff6ff"), V(h.p[0], h.p[1] + 2.15, h.p[2]), 1.6, 1.6);
      }
      // zzz while asleep, falling calendar pages while he waits
      if (h.fo.blink === 1) {
        const k = (t * 1.5) % 1;
        addFx("zzz", 300, 300, drawZ, V(h.p[0] + 0.1, h.p[1] + 1.25 + 0.2 * k, h.p[2] - 0.35), 0.6, 0.6);
      }
      const pages: [string, string][] = [["tomorrow", "1"], ["next", "30"]];
      for (const [w, txt] of pages) {
        const n = w === "next" ? 1 : 1, t0 = T(w, n), k = (t - t0) / 1.1;
        if (k > 0 && k < 1) addFx(`cal|${txt}`, 300, 360, drawCal(txt), V(h.p[0] + 0.4, h.p[1] + 0.8 + 0.4 * k, h.p[2] - 0.8 - 1.2 * k), 0.5, 0.6);
      }
      {
        const t0 = T("next", 2), k = (t - t0) / 1.1;
        if (k > 0 && k < 1) addFx("cal|365", 300, 360, drawCal("365"), V(h.p[0] + 0.4, h.p[1] + 0.8 + 0.4 * k, h.p[2] - 0.8 - 1.2 * k), 0.5, 0.6);
      }
      if (t >= T("off") && t < T("off") + 0.35) {
        const k = Math.round(((t - T("off")) / 0.35) * 6) / 6;
        addFx(`puff|${k}`, 300, 300, (p) => fxPuff(p, k), V(COUCH[0] + 0.3, WALK + 0.35, COUCH[2]), 1.4, 1.4, true);
      }
    }
    // mailman
    const m = mailAt(t);
    person("mail", m.p, MAILMAN, m.fo, 6, m.side);
    ground(m.p);
    timer(V(m.p[0], m.p[1] + 2.0, m.p[2]), "00Y 00M 09D", 9, COL_RED, pop(T("what") + 0.3) * shown);
    if (t < T("drops")) addFx("bag", 300, 300, drawBag, V(m.p[0] - 0.22, m.p[1] + 0.72, m.p[2] + 0.38), 0.5, 0.5);
    else {
      const k = clamp01((t - T("drops")) / 0.25);
      addFx("bag", 300, 300, drawBag, V(MAIL0[0] - 0.22, MAIL0[1] + lerp(0.72, 0.24, k * k), MAIL0[2] + 0.38), 0.5, 0.5);
      for (let j = 0; j < 4; j++) {
        const kk = clamp01((t - T("drops") - 0.2) / 0.7), a = j * 1.7;
        if (kk > 0 && kk < 1) addFx(`letter|${j}`, 200, 140, drawLetter(a + kk * 3), V(MAIL0[0] - 0.22 + Math.cos(a) * 0.6 * kk, MAIL0[1] + 0.2 + 0.3 * Math.sin(kk * Math.PI), MAIL0[2] + Math.sin(a) * 0.6 * kk), 0.28, 0.2);
      }
      if (t >= T("drops") + 0.2) ground([MAIL0[0] - 0.22, MAIL0[1], MAIL0[2] + 0.38], 0.45);
    }
    // baker
    person("baker", BAKER, BAKERO, { mode: "stand", expr: "smile", prop: "loaf", tilt: 3 * Math.sin(t * 5), headTilt: 0 }, 2);
    ground(BAKER);
    timer(V(BAKER[0], BAKER[1] + 2.35, BAKER[2]), "40Y 01M 17D", 14650, COL_OK, pop(T("what") + 0.35) * shown);
    // crowd
    CROWD.forEach((c, k) => {
      const fo: FrontOpts = { mode: "stand", expr: c.expr, headTilt: c.up ? -7 : 0, look: c.up ? 0.5 : 0, facing: c.facing };
      person("folk" + k, c.p, c.o, fo, 10 + k);
      ground(c.p);
      const top = c.o.build === "kid" ? 1.65 : c.o.hat === "tophat" ? 2.35 : 2.05;
      timer(V(c.p[0], c.p[1] + top, c.p[2]), c.timer, c.days, c.days < 1000 ? COL_RED : c.days < 5000 ? COL_LOW : COL_OK, pop(T("what") + 0.15 + k * 0.05) * shown);
    });
    // the two who stare at each other's heads
    const st = t >= T("staring");
    person("stA", STARE_A, FOLK[6], { mode: "stand", expr: st ? "shock" : "neutral", facing: 1, look: 1, headTilt: st ? -5 : 0 }, 21);
    person("stB", STARE_B, FOLK[3], { mode: "stand", expr: st ? "nervous" : "neutral", facing: -1, look: -1, headTilt: st ? -5 : 0 }, 22);
    ground(STARE_A); ground(STARE_B);
    timer(V(STARE_A[0], 2.05, STARE_A[2]), "27Y 08M 30D", 10100, COL_OK, shown);
    timer(V(STARE_B[0], 2.05, STARE_B[2]), "03Y 02M 11D", 1170, COL_LOW, shown);
    // lunch pair: "how long?"
    const ask = t >= T("they");
    person("pA", PAIR_A, FOLK[0], { mode: "stand", expr: ask ? "nervous" : "grin", facing: 1, wave: !ask ? 0.3 : undefined }, 31);
    person("pB", PAIR_B, FOLK[1], { mode: "stand", expr: ask ? "stern" : "smile", facing: -1, wave: ask ? 1 : undefined, look: ask ? -0.6 : 0 }, 32);
    ground(PAIR_A); ground(PAIR_B);
    timer(V(PAIR_A[0], 2.05, PAIR_A[2]), "06Y 00M 02D", 2190, COL_LOW, shown);
    timer(V(PAIR_B[0], 2.05, PAIR_B[2]), "58Y 07M 19D", 21400, COL_OK, shown);
    if (ask && t < T("banks")) addFx("bubble|?", 300, 280, drawBubble("?"), V(PAIR_B[0] + 0.15, 2.55, PAIR_B[2]), 0.55, 0.5);
    // bank customer (turned away)
    const sad = t >= T("timer", 2);
    person("bank", BANKER, BANKCUST, { mode: "stand", expr: sad ? "pained" : "nervous", headTilt: sad ? 6 : 0, facing: -1 }, 41);
    ground(BANKER);
    timer(V(BANKER[0], BANKER[1] + 2.35, BANKER[2]), "02Y 01M 04D", 765, COL_LOW, shown);
    // dating app user + her phone
    person("date", DATER, DATERO, { mode: "stand", expr: t >= T("sort") ? "grin" : "smile", prop: "phone", facing: -1 }, 51);
    ground(DATER);
    timer(V(DATER[0], DATER[1] + 2.05, DATER[2]), "61Y 10M 03D", 22600, COL_OK, shown);
    if (t >= T("dating") - 0.1 && t < T("and", wIndex("and", "guy")) - 0.1) {
      const k = clamp01((t - T("sort")) / 0.5);
      addFx(`app|${k > 0.5 ? 1 : 0}`, 420, 720, drawApp(k), V(DATER[0] + 0.43, DATER[1] + 1.35, DATER[2] + 0.61), 0.58, 0.99);
    }

    for (let k = ai; k < this.actors.length; k++) this.actors[k].mesh.visible = false;
    for (let k = fi; k < this.fxs.length; k++) this.fxs[k].mesh.visible = false;
    for (let k = gi; k < this.glows.length; k++) this.glows[k].visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    for (let k = 0; k < gi; k++) {
      const g = this.glows[k], r = (g as unknown as { _r: { tex?: THREE.Texture } })._r;
      const mt = g.material as THREE.MeshBasicMaterial;
      if (r.tex && mt.map !== r.tex) { mt.map = r.tex; mt.needsUpdate = true; }
    }
    // focus point for the lens: the look point
    return look;
  }
}
