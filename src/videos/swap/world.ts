// "What if you swapped bodies every day": a home interior (bedroom, doorway, kitchen, bathroom mirror that is a real
// "portal" with the reflection behind the glass), a lab with the rubber-hand experiment, and a street with the
// hero's yard and dog. The hero is always our hero (orange jacket, yellow pack, beanie) in a different body.
// Every cut follows the narration (voice.ts); props are our own 3D models (props.ts).
import * as THREE from "three";
import { Batch, V, lam, boxGeo, prop, house } from "../bridge/build";
import { rep, ctex, rng, cloudHD, stoneHD, planksHD, grassHD, cobbleHD } from "../bridge/paint";
import { Pen, bodyFront, Outfit, Expr, FrontOpts, INK, fxContact, fxPuff, fxStars } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { makeKit } from "../bridge/kitgen";
import { Dog3D } from "./dog3d";
import * as P from "./props";
import { VOICE } from "./voice";

export const FPS = 30;
export type V3 = [number, number, number];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
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
export const TOTAL = Math.ceil((VOICE.dur + 1.2) * FPS);
const T = (w: string, n = 1) => wt(w, n) - 0.07;

// ---------------- light ----------------
type Look = "home" | "day" | "lab";
const PR = (l: Partial<LightPreset>, k: Partial<WorldLook>) => ({ L: { ...LIGHTS.day, ...l }, K: { ...LOOK.day, ...k } });
const PRESETS: Record<Look, { L: LightPreset; K: WorldLook }> = {
  home: PR({ lit: [1.55, 1.42, 1.25], shade: [0.36, 0.34, 0.42], lift: [0.07, 0.07, 0.11], fog: "#efe4d4", charTint: [1.0, 0.96, 0.92] }, {}),
  day: PR({}, {}),
  lab: PR({ lit: [1.45, 1.48, 1.52], shade: [0.36, 0.38, 0.46], lift: [0.07, 0.08, 0.12], fog: "#dfe6ee", charTint: [0.97, 0.98, 1.0] }, {}),
};
const SUN_OF: Record<Look, [number, number]> = { home: [60, 50], day: [70, 42], lab: [50, 60] };

// ---------------- layout ----------------
const BED: V3 = [-3.5, 0, -2.88];                 // bed centre; headboard toward -z
const DOOR_X = -1;                                 // partition wall with the doorway at z = 0
const TABLE: V3 = [2.0, 0, -1.5];
const SINK: V3 = [4.5, 0, -3.95];                  // mirror glass: x 4.19..4.81, y 1.21..1.89, wall plane z = -4
const MIRROR_Z = -4.0;
const HOOK: V3 = [DOOR_X + 0.07, 1.7, -1.0];
const LAB: V3 = [3000, 0, 0];
const YARD: V3 = [-3000, 0, 0];
const at = (o: V3, p: V3): V3 => [o[0] + p[0], o[1] + p[1], o[2] + p[2]];
const KENNEL = at(YARD, [-8.0, 0, -2]), DOG = at(YARD, [-6.6, 0, -1.6]);
const GATE = at(YARD, [-4.3, 0, -1.9]);
const FRIEND = at(YARD, [-4.2, 0, -22]);

// ---------------- the hero's bodies (always his jacket, pack and, at the end, his beanie) ----------------
const HEAD = "#f8f6f0";
const BASE: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const TALL: Outfit = { ...BASE, build: "tall" };
const SHORT: Outfit = { ...BASE, build: "kid" };
const STOUT: Outfit = { ...BASE, build: "stout", moustache: "#5a3a20" };
const OLD: Outfit = { ...BASE, moustache: "#d8d8dc" };
/** faces in the mirror (no hat: he has forgotten it) */
const FACES: Outfit[] = [
  { ...BASE, build: "tall", hat: "hair", hair: "#3a2418" }, { ...BASE, hat: "hair", hair: "#d8a040" }, { ...BASE, build: "stout", hat: "hair", hair: "#b0b0b8", moustache: "#9a9aa2" },
  { ...BASE, hat: "hair", hair: "#7a3a1a" }, { ...BASE, build: "kid", hat: "hair", hair: "#22180f" }, { ...BASE, hat: "tophat" },
];
const MORPH = [SHORT, STOUT, OLD, TALL];
const FRIEND_O: Outfit = { jacket: "#3fa08a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#6a3a1a", skin: HEAD, dress: "#2f7a8a" };
const SCI: Outfit = { jacket: "#f4f1ea", pants: "#5a6a8a", boots: INK, hat: "hair", hair: "#b0b0b8", skin: HEAD, buttons: "#c8c2b4" };
const SUBJ: Outfit = { jacket: "#7b5ac9", pants: "#2e3a5a", boots: INK, hat: "hair", hair: "#3a2418", skin: HEAD };

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; look: Look; cInf: number; cam: (u: number, f: number) => Cam };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
const mvAt = (o: V3, p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => mv(at(o, p0), at(o, p1), at(o, l0), at(o, l1), fov, roll, ease);
const S: ShotDef[] = [];
export const SHOTS = S;
const shot = (a: number, look: Look, cInf: number, cam: (u: number, f: number) => Cam) => S.push({ a, look, cInf, cam });
const BEDTOP: V3 = [BED[0], 0.55, BED[2]];
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  // seven a.m.: the alarm, the bed, the feet
  shot(0, "home", 12, mv([-4.25, 0.78, -3.15], [-4.27, 0.78, -3.2], [-4.5, 0.64, -3.6], [-4.5, 0.64, -3.6], 32, 0.02));
  shot(E("you", 1), "home", 0, mv([BED[0] + 0.15, 3.6, BED[2] + 0.9], [BED[0] + 0.12, 3.3, BED[2] + 0.75], BEDTOP, BEDTOP, 50, 0));
  shot(E("feet"), "home", 10, mv([BED[0] + 0.7, 1.75, BED[2] + 2.5], [BED[0] + 0.65, 1.7, BED[2] + 2.4], [BED[0], 0.57, BED[2] + 1.15], [BED[0], 0.57, BED[2] + 1.15], 40, -0.03));
  shot(E("yesterday"), "home", 0, mv([BED[0] + 0.15, 3.6, BED[2] + 0.9], [BED[0] + 0.12, 3.4, BED[2] + 0.8], BEDTOP, BEDTOP, 50, 0.03));
  // every morning a new body
  shot(E("every"), "home", 8, mv([BED[0] + 2.2, 1.4, BED[2] + 4.2], [BED[0] + 2.0, 1.4, BED[2] + 3.8], [BED[0] + 0.9, 1.1, BED[2] + 1.5], [BED[0] + 0.9, 1.15, BED[2] + 1.5], 42));
  shot(E("and", 2), "home", 0, mv([1.5, 2.6, 3.4], [1.2, 2.4, 3.0], [-2.6, 1.0, -1.4], [-2.6, 1.0, -1.4], 46, 0, true));
  // rule one
  shot(E("rule", 1), "home", 8, mv([-1.6, 1.3, 1.8], [-1.8, 1.3, 1.6], [-2.8, 1.2, -0.6], [-2.8, 1.2, -0.6], 44, 0.04));
  shot(E("in", 2), "lab", 0, mvAt(LAB, [1.8, 1.7, 3.0], [1.5, 1.6, 2.6], [0, 1.0, 0], [0, 1.0, 0], 44, 0, true));
  shot(E("rubber"), "lab", 12, mvAt(LAB, [-0.1, 1.3, 0.55], [-0.12, 1.28, 0.5], [-0.15, 0.92, 0.05], [-0.15, 0.92, 0.05], 36, 0.02));
  shot(E("eleven"), "lab", 12, mvAt(LAB, [1.0, 1.55, 2.3], [0.95, 1.55, 2.2], [0.5, 1.4, 0.8], [0.5, 1.42, 0.8], 36, -0.03));
  shot(E("whole"), "home", 6, mv([1.8, 1.3, 0.3], [1.6, 1.3, 0.25], [-1.6, 1.3, 0], [-1.6, 1.3, 0], 46));
  shot(E("walk"), "home", 9, mv([0.6, 1.6, 0.6], [0.5, 1.6, 0.55], [-1.2, 1.7, 0], [-1.2, 1.7, 0], 44, 0.03));
  shot(E("twice"), "home", 9, mv([0.4, 1.9, -1.0], [0.35, 1.9, -0.95], [-1.2, 1.8, 0], [-1.2, 1.8, 0], 42, -0.05));
  // rule two: breakfast
  shot(E("rule", 2), "home", 6, mv([2.6, 1.6, 1.4], [2.4, 1.6, 1.2], [TABLE[0], 1.0, -1.9], [TABLE[0], 1.0, -1.9], 44, 0.02));
  shot(E("about", 2), "home", 13, mv([2.25, 1.15, -0.95], [2.22, 1.12, -1.0], [TABLE[0], 0.8, -1.55], [TABLE[0], 0.8, -1.55], 34, 0.03));
  shot(E("today"), "home", 12, mv([2.2, 1.55, -0.4], [2.15, 1.55, -0.5], [TABLE[0], 1.45, -2.15], [TABLE[0], 1.45, -2.15], 36, -0.02));
  shot(E("broccoli"), "home", 13, mv([1.7, 1.5, -0.6], [1.75, 1.5, -0.7], [TABLE[0], 1.35, -2.15], [TABLE[0], 1.38, -2.15], 34, 0.04));
  // rule three: the dog
  shot(E("rule", 3), "day", 0, mv(at(YARD, [-2.0, 1.7, 3.5]), at(YARD, [-2.4, 1.6, 2.8]), at(YARD, [-6.0, 0.8, -2.0]), at(YARD, [-6.0, 0.8, -2.0]), 44, 0, true));
  shot(E("dogs"), "day", 12, mv(at(YARD, [-5.6, 0.7, -0.4]), at(YARD, [-5.7, 0.68, -0.5]), at(YARD, [-6.2, 0.55, -1.6]), at(YARD, [-6.2, 0.55, -1.6]), 36, 0.03));
  shot(E("we"), "day", 12, mv(at(YARD, [-3.0, 1.5, 0.3]), at(YARD, [-3.1, 1.5, 0.15]), at(YARD, [-4.3, 1.4, -1.9]), at(YARD, [-4.3, 1.42, -1.9]), 36, -0.02));
  shot(E("to", 4), "day", 6, mv(at(YARD, [-5.4, 1.6, 2.7]), at(YARD, [-5.45, 1.6, 2.5]), at(YARD, [-5.4, 0.9, -1.8]), at(YARD, [-5.4, 0.9, -1.8]), 50, 0.04));
  // the last rule: the mirror
  shot(E("and", 3), "home", 0, mv([6.0, 1.6, -0.9], [5.8, 1.6, -1.1], [4.4, 1.4, -3.2], [4.4, 1.45, -3.2], 44, 0.02, true));
  shot(E("nobody"), "home", 8, mv([2.9, 1.6, -1.0], [3.0, 1.6, -1.15], [4.3, 1.35, -3.0], [4.3, 1.38, -3.0], 44, -0.03));
  shot(E("after"), "home", 10, mv([4.5, 1.55, -2.9], [4.5, 1.55, -2.95], [4.5, 1.55, MIRROR_Z], [4.5, 1.55, MIRROR_Z], 54));
  shot(E("face"), "home", 12, mv([5.3, 1.5, -1.6], [5.25, 1.5, -1.7], [4.5, 1.5, -2.5], [4.5, 1.52, -2.5], 36, -0.03));
  shot(E("so", 2), "home", 13, mv([0.05, 1.7, -0.6], [0.0, 1.68, -0.68], [HOOK[0], 1.6, HOOK[2]], [HOOK[0], 1.6, HOOK[2]], 34, 0.02));
  shot(E("your", 5), "home", 12, mv([5.2, 1.5, -1.5], [5.15, 1.5, -1.6], [4.5, 1.55, -2.5], [4.5, 1.57, -2.5], 36, 0.02));
  // the best friend
  shot(E("then"), "day", 6, mv(at(YARD, [-1.2, 1.4, -16.5]), at(YARD, [-1.4, 1.4, -17.3]), at(YARD, [-4.2, 1.0, -20.5]), at(YARD, [-4.2, 1.0, -20.8]), 44, 0, true));
  shot(E("smiles"), "day", 12, mv(at(YARD, [-3.4, 1.55, -19.6]), at(YARD, [-3.45, 1.55, -19.7]), at(FRIEND, [0, 1.45, 0]), at(FRIEND, [0, 1.47, 0]), 36, 0.03));
  shot(E("morning", 2), "day", 9, mv(at(YARD, [-1.6, 1.4, -20.2]), at(YARD, [-1.7, 1.4, -20.4]), at(YARD, [-4.2, 1.1, -21.2]), at(YARD, [-4.2, 1.12, -21.2]), 42, -0.02));
  // seven a.m., again
  shot(E("seven", 2), "home", 0, mv([BED[0] + 0.15, 3.6, BED[2] + 0.9], [BED[0] + 0.12, 3.25, BED[2] + 0.75], BEDTOP, BEDTOP, 50, -0.02));
  shot(E("feet", 2), "home", 10, mv([BED[0] - 0.7, 1.75, BED[2] + 2.5], [BED[0] - 0.65, 1.7, BED[2] + 2.4], [BED[0], 0.57, BED[2] + 1.15], [BED[0], 0.57, BED[2] + 1.15], 40, 0.03));
  shot(E("and", 5), "home", 10, mv([BED[0] + 0.05, 1.9, BED[2] - 0.05], [BED[0] + 0.04, 1.75, BED[2] - 0.2], [BED[0], 0.57, BED[2] - 0.62], [BED[0], 0.57, BED[2] - 0.62], 40, 0.02, true));
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
type HeroPose = { p: V3; o: Outfit; fo: FrontOpts; lie?: boolean; stars?: number; puff?: number };
function heroAt(t: number): HeroPose | null {
  const stand = (p: V3, o: Outfit, expr: Expr, extra: Partial<FrontOpts> = {}): HeroPose => ({ p, o, fo: { mode: "stand", expr, ...extra } });
  if (t < T("every")) {
    const short = t >= T("yesterday") - 0.05;
    const o = short ? SHORT : TALL, len = short ? 1.38 : 2.07;
    const crown = BED[2] - 0.85;
    return { p: [BED[0], 0.575, crown + len], o, fo: { mode: "stand", expr: short ? "relief" : t < T("you", 1) + 0.3 ? "dazed" : "nervous", blink: t < T("you", 1) ? 1 : undefined }, lie: true };
  }
  if (t < T("rule", 1)) {
    if (t < T("and", 2)) { // a new body every morning: a quick flicker of bodies, landing on today's
      const k = Math.min(MORPH.length - 1, Math.floor((t - T("every")) / 0.55));
      return { ...stand([BED[0] + 0.9, 0, BED[2] + 1.5], MORPH[k], k === MORPH.length - 1 ? "shock" : "dazed"), puff: (t - T("every")) % 0.55 };
    }
    return stand([-2.6, 0, -1.4], TALL, "nervous", { look: 0.4 });
  }
  if (t < T("in", 2)) { const w = Math.sin(t * 5); return { ...stand([-2.8, 0, -0.6], TALL, "nervous", { tilt: 6 * w }), fo: { mode: "stroll", phase: t * 0.9, expr: "nervous", tilt: 6 * w } }; }
  if (t < T("whole")) return null; // the lab
  if (t < T("rule", 2)) {
    // walks to the doorway, bonks the lintel (head behind the wall above 2 m), steps back, tries again
    const b1 = T("walk") + 0.5, b2 = T("twice") - 0.05;
    let x: number;
    if (t < b1) x = lerp(-3.6, -1.16, clamp01((t - T("whole")) / (b1 - T("whole"))));
    else if (t < b2) x = lerp(-1.16, -1.5, clamp01((t - b1) / 0.25)) + lerp(0, 0.34, clamp01((t - b1 - 0.4) / (b2 - b1 - 0.4)));
    else x = lerp(-1.16, -1.5, clamp01((t - b2) / 0.25));
    const hit = (t >= b1 && t < b1 + 0.8) || t >= b2;
    return { p: [x, 0, 0], o: TALL, fo: hit ? { mode: "stand", expr: "dazed", tilt: -6 } : { mode: "stroll", phase: t * 1.0, expr: "grin" }, stars: hit ? (t - (t >= b2 ? b2 : b1)) : undefined };
  }
  if (t < T("rule", 3)) {
    let expr: Expr = "smile";
    if (t >= T("today")) expr = "nervous";
    if (t >= T("broccoli")) expr = "pained";
    return stand([TABLE[0], 0, -2.15], STOUT, expr);
  }
  if (t < T("and", 3)) {
    let expr: Expr = "grin";
    if (t >= T("barks")) expr = "shock";
    if (t >= T("to", 4)) expr = "pained";
    return stand(GATE, OLD, expr, { wave: t < T("barks") ? 0.6 : undefined });
  }
  if (t < T("then")) {
    const withHat = t >= T("hat") - 0.05;
    const o = withHat ? TALL : { ...TALL, hat: "hair", hair: "#3a2418" };
    return stand([4.5, 0, -2.5], o, withHat ? "smile" : t >= T("face") ? "nervous" : "neutral", { look: withHat ? 0 : -0.3 });
  }
  if (t < T("seven", 2)) {
    const greet = t >= T("morning", 2);
    const z = greet ? -20.9 : -16.5 - (t - T("then")) * 1.2;
    return { p: at(YARD, [-4.1, 0, Math.max(-20.9, z)]), o: SHORT, fo: z > -20.9 && !greet ? { mode: "stroll", phase: t * 1.1, expr: "smile" } : { mode: "stand", expr: "grin", facing: -1 } };
  }
  return { p: [BED[0], 0.575, BED[2] - 0.85 + 2.07], o: TALL, fo: { mode: "stand", expr: t >= T("mind") - 0.4 ? "grin" : "smile" }, lie: true };
}
/** the face in the mirror: his own, until it starts to slip through other faces */
const mirrorFace = (t: number, own: Outfit): Outfit => {
  if (t < T("after") || t >= T("hat") - 0.05) return own;
  return FACES[Math.floor((t - T("after")) / 0.4) % FACES.length];
};

// ---------------- painted walls / windows ----------------
const wallpaper = () => ctex("wallpaper", 512, 512, (g, r) => {
  g.fillStyle = "#e8dcc4"; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = "rgba(200,170,130,0.35)"; g.fillRect(x, 0, 22, 512); }
  for (let i = 0; i < 200; i++) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(r() * 512, r() * 512, 6, 2); }
});
const tiles = () => ctex("bathTiles", 512, 512, (g) => {
  g.fillStyle = "#dfeaf0"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#a8b8c4"; g.lineWidth = 4; for (let k = 0; k <= 512; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 512); g.moveTo(0, k); g.lineTo(512, k); g.stroke(); }
});
const skyWin = () => ctex("skyWindow", 256, 320, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 320); gr.addColorStop(0, "#8cbcea"); gr.addColorStop(1, "#dcecf8");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 320);
  g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(80, 90, 50, 20, 0, 0, 7); g.ellipse(120, 80, 40, 24, 0, 0, 7); g.fill();
  g.fillStyle = "#6a9a4a"; g.fillRect(0, 260, 256, 60);
  g.fillStyle = "#f2ead8"; g.fillRect(0, 0, 256, 14); g.fillRect(0, 306, 256, 14); g.fillRect(0, 0, 14, 320); g.fillRect(242, 0, 14, 320); g.fillRect(121, 0, 14, 320); g.fillRect(0, 153, 256, 14);
});
const labWall = () => ctex("labWall", 512, 512, (g) => { g.fillStyle = "#e6ecf0"; g.fillRect(0, 0, 512, 512); g.fillStyle = "#cfd8e0"; g.fillRect(0, 380, 512, 132); });

// ---------------- the world ----------------
export class SwapWorld {
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
  private quiltTall = P.quilt(-0.45, 1.0);
  private quiltShort = P.quilt(-0.45, 1.0);
  private clock = P.alarmClock();
  private brush = P.brush();

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
    this.buildHome(R); this.buildLab(R); this.buildYard(R);
    this.dog.root.position.set(...DOG); R.add(this.dog.root);
  }

  private place(b: Batch, g: THREE.Object3D, p: V3, ry = 0) { g.position.set(...p); g.rotation.y = ry; g.updateMatrixWorld(true); b.addObject(g, new THREE.Matrix4()); }

  private buildHome(R: THREE.Object3D) {
    const b = new Batch();
    const wall = lam("swWallpaper", () => ({ map: rep(wallpaper(), 3, 1) })), tile = lam("swTiles", () => ({ map: rep(tiles(), 2, 2) }));
    b.add(boxGeo(V(-6.2, -0.2, -4.2), V(6.2, 0, 4.2)), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })));
    // back wall with a hole for the mirror glass (x 4.19..4.81, y 1.21..1.89)
    const W = (x0: number, y0: number, x1: number, y1: number, m: THREE.Material) => b.add(boxGeo(V(x0, y0, MIRROR_Z - 0.12), V(x1, y1, MIRROR_Z)), m);
    W(-6.2, 0, 3.0, 3.0, wall); W(3.0, 0, 6.2, 1.21, tile); W(3.0, 1.89, 6.2, 3.0, tile); W(3.0, 1.21, 4.19, 1.89, tile); W(4.81, 1.21, 6.2, 1.89, tile);
    b.add(boxGeo(V(-6.4, 0, -4.2), V(-6.2, 3.0, 4.2)), wall);
    b.add(boxGeo(V(6.2, 0, -4.2), V(6.4, 3.0, 4.2)), wall);
    // bedroom window (painted sky behind panes)
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), new THREE.MeshBasicMaterial({ map: skyWin(), color: new THREE.Color(1.15, 1.15, 1.15) }));
    win.position.set(-5.0, 1.6, MIRROR_Z + 0.01); R.add(win);
    // the reflection box behind the mirror: the same tiles, a mirrored room the reflected card stands in
    b.add(boxGeo(V(3.6, 0, MIRROR_Z - 2.6), V(5.4, 3.0, MIRROR_Z - 2.5)), tile);
    b.add(boxGeo(V(3.5, 0, MIRROR_Z - 2.6), V(3.6, 3.0, MIRROR_Z - 0.12)), tile);
    b.add(boxGeo(V(5.4, 0, MIRROR_Z - 2.6), V(5.5, 3.0, MIRROR_Z - 0.12)), tile);
    b.add(boxGeo(V(3.5, -0.2, MIRROR_Z - 2.6), V(5.5, 0, MIRROR_Z - 0.12)), lam("swFloor", () => ({ map: rep(planksHD(), 3, 2) })));
    // partition with the doorway, furniture
    const dw = P.doorWall(8.4, 3.0, wall); dw.position.set(DOOR_X, 0, 0); dw.rotation.y = Math.PI / 2; dw.updateMatrixWorld(true); b.addObject(dw, new THREE.Matrix4());
    this.place(b, P.bed(), BED);
    this.place(b, P.nightstand(), [-4.5, 0, -3.6]);
    this.place(b, P.table(), TABLE);
    this.place(b, P.broccoliPlate(), [TABLE[0], 0.76, -1.55]);
    this.place(b, P.sinkMirror(), SINK);
    this.place(b, P.beanieOnHook(), HOOK, Math.PI / 2);
    b.build(R);
    this.clock.position.set(-4.5, 0.55, -3.6); R.add(this.clock);
    for (const q of [this.quiltTall, this.quiltShort]) { q.position.set(BED[0], 0, BED[2]); q.visible = false; R.add(q); }
  }

  private buildLab(R: THREE.Object3D) {
    const b = new Batch(), o = LAB, w = lam("swLabWall", () => ({ map: labWall() }));
    b.add(boxGeo(V(o[0] - 6, -0.2, -6), V(o[0] + 6, 0, 6)), lam("swLabFloor", () => ({ color: "#c8ccd4" })));
    b.add(boxGeo(V(o[0] - 6, 0, -3.2), V(o[0] + 6, 3.2, -3.0)), w);
    b.add(boxGeo(V(o[0] - 6.2, 0, -3.2), V(o[0] - 6, 3.2, 6)), w);
    this.place(b, P.labBench(), o);
    this.place(b, P.rubberHand(), at(o, [-0.15, 0.905, 0.05]));
    for (let k = 0; k < 3; k++) b.add(boxGeo(V(o[0] - 2.4 + k * 0.7, 0, -2.9), V(o[0] - 1.9 + k * 0.7, 1.9, -2.5)), lam("swCabinet", () => ({ color: "#9aa8b8" })));
    b.build(R);
    R.add(this.brush);
  }

  private buildYard(R: THREE.Object3D) {
    const b = new Batch(), o = YARD, kit = makeKit(), r = rng(3);
    b.add(new THREE.PlaneGeometry(800, 800).rotateX(-Math.PI / 2).translate(o[0], -0.02, -100), lam("grassT", () => ({ map: rep(grassHD(), 160, 160) })));
    b.add(new THREE.PlaneGeometry(6, 140).rotateX(-Math.PI / 2).translate(o[0], 0.0, -40), lam("roadT", () => ({ map: rep(cobbleHD(), 2, 40) })));
    for (const s of [-1, 1]) b.add(boxGeo(V(o[0] + (s < 0 ? -5 : 3), -0.1, -110), V(o[0] + (s < 0 ? -3 : 5), 0.1, 30), 2), lam("walkT", () => ({ map: stoneHD("walkHD", ["#e6dccb", "#ddd2bf", "#ece3d4", "#d6cab6"], "#b0a390") })));
    for (const s of [-1, 1]) for (let k = 0; k < 8; k++) {
      const zc = 14 - k * 11;
      house(b, o[0] + s * 14, zc, s < 0 ? Math.PI / 2 : -Math.PI / 2, 9, 8, [7, 8.4, 7.6][k % 3], (k * 2 + (s > 0 ? 1 : 0)) % 8, 0);
      for (let i = 0; i < 10; i++) { const z = zc - 4.5 + i * 1.0; if (Math.abs(z - (zc + 0.1)) < 0.6) continue; b.add(boxGeo(V(o[0] + s * 5.3 - 0.04, 0, z - 0.06), V(o[0] + s * 5.3 + 0.04, 0.9, z + 0.06)), lam("fenceW", () => ({ color: "#f2ead8" }))); }
      b.add(boxGeo(V(o[0] + s * 5.3 - 0.03, 0.5, zc - 4.5), V(o[0] + s * 5.3 + 0.03, 0.6, zc + 4.5)), lam("fenceW", () => ({ color: "#f2ead8" })));
      prop(b, kit, "tree_oak", o[0] + s * 8.5, 0, zc - 3.5, 5 + (k % 2));
    }
    for (let z = 20; z > -100; z -= 12) for (const s of [-1, 1]) prop(b, kit, "lantern", o[0] + s * 3.3, 0.1, z + (s > 0 ? 6 : 0), 3.4);
    this.place(b, P.kennel(), KENNEL, Math.PI / 2);
    for (let i = 0; i < 30; i++) prop(b, kit, i % 3 ? "tree_default" : "tree_cone", o[0] + (i % 2 ? 1 : -1) * (24 + r() * 20), 0, 20 - i * 5, 8 + (i % 4));
    b.build(R);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  private dog = new Dog3D();
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
    cam.fov = c.fov; cam.near = THREE.MathUtils.clamp(pos.distanceTo(look) * 0.1, 0.05, 0.3); cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const sunDir = this.shotSun(i), dist = pos.distanceTo(look);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
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
    // alarm rings until he opens his eyes (and again at the end)
    const ring = t < T("you", 1) || (t >= T("seven", 2) && t < T("your", 7) - 0.2);
    this.clock.rotation.set(0, 0.5, ring ? 0.08 * Math.sin(t * 70) : 0);
    this.clock.position.y = 0.55 + (ring ? 0.006 * Math.abs(Math.sin(t * 70)) : 0);

    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const k = (f + seed * 37) % 64; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
    let ai = 0, fi = 0;
    const used: Actor[] = [], fused: Fx[] = [];
    const addFx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, atp: THREE.Vector3, w: number, h: number, soft = false, op = 1) => {
      const ef = this.fx(fi++);
      ef.r = this.pool.req(key, cw, ch, 1, draw); ef.use(soft); ef.soft.opacity = op;
      ef.mesh.visible = true; ef.mesh.position.copy(atp); ef.mesh.quaternion.copy(cam.quaternion); ef.mesh.scale.set(w, h, 1);
      fused.push(ef); return ef;
    };
    const ground = (p: V3, w = 0.55) => {
      const ef = addFx("blob|contact|#4a4470", 128, 128, (pp) => fxContact(pp, "#4a4470"), V(p[0], p[1] + 0.02, p[2]), w, w * 0.7);
      ef.mesh.rotation.set(-Math.PI / 2, 0, 0);
    };
    const person = (key: string, p: V3, o: Outfit, fo: FrontOpts, seed: number, opt: { lie?: boolean; mirror?: boolean } = {}) => {
      const w = V(...p), d = cam.position.distanceTo(w);
      if (d > 120) return;
      const [cw, ch, k] = d < 3.2 ? [1800, 3000, 3.0] : d < 7 ? [1080, 1800, 1.8] : d < 18 ? [480, 800, 0.8] : [240, 400, 0.4];
      const f2: FrontOpts = { ...fo, light: L2D, seed };
      if (f2.blink === undefined) f2.blink = lid(seed);
      const a = this.actor(ai++);
      a.r = this.pool.req(`${key}|${JSON.stringify(o)}|F|${JSON.stringify(f2, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, k, (pen) => bodyFront(pen, o, f2));
      a.mesh.visible = true; a.mesh.position.copy(w); a.mesh.castShadow = false;
      if (opt.lie) { a.mesh.rotation.set(-Math.PI / 2, 0, 0); a.mesh.scale.set(1, 1, 1); }
      else { a.mesh.rotation.set(0, Math.atan2(cam.position.x - w.x, cam.position.z - w.z), 0); a.mesh.scale.set(opt.mirror ? -1 : 1, 1, 1); }
      used.push(a);
      if (!opt.lie) ground(p);
    };
    const h = heroAt(t);
    this.quiltTall.visible = false; this.quiltShort.visible = false;
    if (h) {
      person("hero", h.p, h.o, h.fo, 4, { lie: h.lie });
      if (h.lie) (h.o.build === "kid" ? this.quiltShort : this.quiltTall).visible = true;
      if (h.stars !== undefined) { const k = Math.round((h.stars * 1.5) % 1 * 12) / 12; addFx(`stars|${k}`, 420, 210, (pp) => fxStars(pp, k), V(h.p[0], 2.1, h.p[2]), 0.7, 0.35); }
      if (h.puff !== undefined && h.puff < 0.3) { const k = Math.round((h.puff / 0.3) * 6) / 6; addFx(`puff|${k}`, 300, 300, (pp) => fxPuff(pp, k), V(h.p[0], 1.0, h.p[2] + 0.1), 1.8, 1.8, true); }
      // the reflection: mirror-symmetric behind the glass
      if (Math.abs(h.p[0] - 4.5) < 0.01 && h.p[2] > -3.5 && h.p[2] < -2.0 && h.p[1] < 0.1) person("mirror", [h.p[0], 0, 2 * MIRROR_Z - h.p[2]], mirrorFace(t, h.o), { ...h.fo, look: -(h.fo.look ?? 0) }, 4, { mirror: true });
    }
    // lab: the subject and the scientist with the brush
    if (Math.abs(cam.position.x - LAB[0]) < 500) {
      const felt = t >= T("eleven") - 0.1;
      person("subj", at(LAB, [0.5, 0, 0.75]), SUBJ, { mode: "stand", expr: felt ? "shock" : "neutral", look: -0.6 }, 20);
      person("sci", at(LAB, [-0.35, 0, -0.75]), SCI, { mode: "stand", expr: "smile", prop: "hold2" }, 21);
      const st = Math.sin(t * 5);
      this.brush.position.set(LAB[0] - 0.15 + 0.05 * st, 0.98, 0.05); this.brush.rotation.set(0, 0, 0.35 + 0.1 * st); this.brush.visible = true;
    } else this.brush.visible = false;
    // the yard: the dog (from rule three), then the best friend on the sidewalk
    this.dog.root.visible = false;
    if (Math.abs(cam.position.x - YARD[0]) < 500) {
      if (t < T("and", 3)) {
        // the dog trots up to the fence, sniffs, then barks at the stranger
        const bark = t >= T("barks"), sniff = t >= T("dogs") - 0.1 && t < T("we");
        const x = DOG[0] - 1.2 + Math.min(1.2, (t - T("rule", 3)) * 0.8);
        this.dog.root.visible = true; this.dog.root.position.set(x, 0, DOG[2]);
        this.dog.update(t, x < DOG[0] - 0.01 ? 1 : 0, bark && !sniff, sniff);
        ground([x + 0.02, 0, DOG[2]], 1.0);
        if (bark && !sniff && Math.floor(t * 5) % 2 === 0) addFx("bark", 300, 300, (pp) => { for (const a of [-0.5, 0, 0.5]) pp.stroke([[150 + 60 * Math.cos(a), 150 + 60 * Math.sin(a)], [150 + 130 * Math.cos(a), 150 + 130 * Math.sin(a)]], 14); }, V(x + 0.75, 0.85, DOG[2]), 0.45, 0.45);
      }
      if (t >= T("then") - 0.2) person("friend", FRIEND, FRIEND_O, { mode: "stand", expr: t >= T("smiles") ? "grin" : "neutral", facing: 1, wave: t >= T("morning", 2) ? 0.5 + 0.5 * Math.sin(t * 8) : undefined }, 30);
    }
    for (let k = ai; k < this.actors.length; k++) this.actors[k].mesh.visible = false;
    for (let k = fi; k < this.fxs.length; k++) this.fxs[k].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return look;
  }
}
