// "Letters from next year": a snowy town on New Year's morning, mailboxes, a clock tower at the end of the street,
// and the room inside the tower (a separate set 3 km away). Every prop is our own 3D model (props.ts) lit and
// outlined like the town; hand-held paper sits between the cards' hands ("hold2" pose). Cuts follow the narration.
import * as THREE from "three";
import { Batch, V, lam, boxGeo, prop, quad, tri } from "../bridge/build";
import { rep, ctex, rng, cloudHD, facadeHD, stoneHD, beamHD } from "../bridge/paint";
import { Pen, bodyFront, Outfit, Expr, FrontOpts, INK, fxContact, HOLD_DY } from "../bridge/toon";
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
type Look = "dawn" | "day" | "night" | "lamp";
const PR = (base: "day" | "golden", l: Partial<LightPreset>, k: Partial<WorldLook>) => ({ L: { ...LIGHTS[base], ...l }, K: { ...LOOK[base], ...k } });
const PRESETS: Record<Look, { L: LightPreset; K: WorldLook }> = {
  dawn: PR("day", { lit: [1.6, 1.38, 1.26], shade: [0.34, 0.36, 0.5], lift: [0.06, 0.07, 0.13], fog: "#e9d6dc", sunCol: "#ffe0c8", charTint: [1.0, 0.95, 0.93] },
    { sky: { c: ["#f6d2c4", "#ecc6cc", "#c9c4e2", "#9fb8e6", "#7aa2dc"], e: [0, 4, 10, 20, 40] }, sat: 1.0 }),
  day: PR("day", { fog: "#d8e4f2" }, { sky: { c: ["#dce8f6", "#bcd2ee", "#8cb4e6", "#6a9edc", "#4f88d0"], e: [0, 4, 10, 20, 40] } }),
  night: PR("day", { lit: [0.62, 0.72, 1.0], shade: [0.14, 0.17, 0.3], lift: [0.03, 0.04, 0.1], fog: "#27345e", sunCol: "#c8d6ff", sunI: 2.0, charTint: [0.72, 0.78, 0.98], hemiI: 0.35 },
    { sky: { c: ["#3a4a7a", "#2c3a6a", "#202c58", "#18224a", "#10183a"], e: [0, 4, 10, 20, 40] }, sat: 0.95 }),
  lamp: PR("day", { lit: [1.55, 1.2, 0.82], shade: [0.2, 0.17, 0.2], lift: [0.05, 0.04, 0.06], fog: "#2a2028", sunCol: "#ffd9a0", charTint: [1.0, 0.88, 0.72], hemiI: 0.35 },
    { sky: { c: ["#2a2028", "#2a2028", "#2a2028", "#2a2028", "#2a2028"], e: [0, 4, 10, 20, 40] }, sat: 1.0 }),
};
const SUN_OF: Record<Look, [number, number]> = { dawn: [55, 16], day: [70, 40], night: [60, 35], lamp: [40, 35] };

// ---------------- layout (street along z, tower at its end) ----------------
const FENCE = 3.6, FRONT = 9;                  // fence line and house fronts (|x|)
const TOWER: V3 = [0, 0, -66];
const ROOM: V3 = [3000, 0, 0];                 // inside the tower
const LEO_HOME: V3 = [-4.6, 0, -2.2];
const RED_CAR: V3 = [1.7, 0, -15.5];
const SPOTS: { p: V3; o: number; lines: string[]; key: string }[] = [
  { p: [2.5, 0, -10.8], o: 3, key: "car", lines: ["Jan 1st,", "!Don't buy the red car."] },
  { p: [-2.5, 0, -20.8], o: 0, key: "anna", lines: ["Jan 1st,", "!Say yes to Anna."] },
  { p: [2.5, 0, -30.8], o: 1, key: "umb", lines: ["Jan 1st,", "!Take an umbrella on the 4th of May."] },
  { p: [-2.5, 0, -10.8], o: 4, key: "cat", lines: ["Jan 1st,", "Keep the cat inside on Tuesdays."] },
  { p: [2.5, 0, -20.8], o: 5, key: "oven", lines: ["Jan 1st,", "Check the oven before you leave."] },
  { p: [-2.5, 0, -30.8], o: 6, key: "dance", lines: ["Jan 1st,", "Go to the dance in June."] },
];
const ANNA: V3 = [-1.5, 0, -21.5];
const DESK: V3 = [ROOM[0], 0, -1.9];

// ---------------- cast ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const POSTMAN: Outfit = { jacket: "#3f6fb5", pants: "#2e3a5a", boots: INK, hat: "cap", cap: "#2e4a8a", skin: HEAD, belt: "#7a4a2a" };
const FOLK: Outfit[] = [
  { jacket: "#3f9a5a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#3a2418", skin: HEAD },
  { jacket: "#c25a7a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#d8a040", skin: HEAD, dress: "#d9a441" },
  { jacket: "#7b5ac9", pants: "#2e3a5a", boots: INK, hat: "cap", cap: "#e2453c", skin: HEAD },
  { jacket: "#d84a3a", pants: "#3b3f52", boots: INK, hat: "tophat", skin: HEAD, moustache: "#4a3020", build: "stout" },
  { jacket: "#2f8a9a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#5a8fc2" },
  { jacket: "#5d7a3a", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#b0b0b8", skin: HEAD, build: "stout" },
  { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#22180f", skin: HEAD },
];
const ANNA_O: Outfit = { jacket: "#e85a8a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#7a3a1a", skin: HEAD, dress: "#7b5ac9" };
/** height of the "hold2" hands above the soles, metres */
const handY = (o: Outfit) => {
  const B = { adult: [118, 1.1, 1.4], stout: [118, 1.15, 1.32], kid: [112, 0.85, 1.0] }[o.build ?? "adult"];
  const HH = 2 * B[0] * 0.94, torsoBot = 975 - B[2] * HH, chin = torsoBot - B[1] * HH;
  return (975 - (chin + HOLD_DY * HH)) * SU;
};

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; look: Look; cInf: number; cam: (u: number, f: number) => Cam };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
const at = (o: V3, p: V3): V3 => [o[0] + p[0], o[1] + p[1], o[2] + p[2]];
const mvR = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => mv(at(ROOM, p0), at(ROOM, p1), at(ROOM, l0), at(ROOM, l1), fov, roll, ease);
/** a camera in front of someone at p, looking at their hands (a held page) or face */
const front = (p: V3, dist: number, dy: number, side: number, fov: number, ly = dy, roll = 0) => mv([p[0] + side, dy, p[2] + dist], [p[0] + side * 0.9, dy, p[2] + dist * 0.92], [p[0], ly, p[2]], [p[0], ly, p[2]], fov, roll);
const S: ShotDef[] = [];
export const SHOTS = S;
const shot = (a: number, look: Look, cInf: number, cam: (u: number, f: number) => Cam) => S.push({ a, look, cInf, cam });
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  const sp = (k: string) => SPOTS.find((s) => s.key === k)!.p;
  // New Year's morning
  shot(0, "dawn", 0, mv([6, 16, 14], [4, 11, 6], [0, 1, -30], [0, 2, -36], 44, 0, true));
  shot(E("everyone"), "dawn", 0, mv([1.2, 1.7, -4], [1.0, 1.75, -6], [-4, 1.2, -16], [-4, 1.2, -17], 42, 0.02));
  shot(E("letter", 1), "dawn", 12, front(sp("cat"), 1.75, 1.3, 0.5, 34, 1.2));
  shot(E("written"), "dawn", 12, front(sp("oven"), 1.7, 1.3, -0.4, 34, 1.2, -0.03));
  // three letters
  shot(E("don"), "dawn", 11, mv([-0.8, 1.6, -6.2], [-0.6, 1.6, -6.6], [1.9, 1.1, -12.6], [1.9, 1.15, -12.6], 46, 0.02));
  shot(E("car"), "dawn", 12, front(sp("car"), 1.7, 1.3, -0.35, 34, 1.2, 0.03));
  shot(E("say"), "dawn", 10, mv([0.4, 1.5, -17.8], [0.2, 1.5, -18.2], [-2.0, 1.2, -21.2], [-2.0, 1.25, -21.2], 40, -0.03));
  shot(E("anna"), "dawn", 12, front(sp("anna"), 1.7, 1.3, 0.4, 34, 1.2));
  shot(E("take"), "dawn", 12, front(sp("umb"), 1.7, 1.3, -0.4, 34, 1.2, 0.03));
  shot(E("fourth"), "dawn", 10, mv([0.3, 1.5, -28.0], [0.4, 1.5, -28.4], [2.5, 1.3, -30.8], [2.5, 1.35, -30.8], 40, -0.02));
  // nobody has had a bad year
  shot(E("nobody", 1), "day", 0, mv([0, 2.2, 4], [0, 2.6, 0], [0, 1.2, -30], [0, 1.4, -30], 42, 0, true));
  shot(E("and", 1), "day", 0, mv([14, 18, -6], [12, 20, -10], [0, 4, -40], [0, 6, -50], 44, 0.02, true));
  shot(E("hundred"), "day", 0, mv([4, 1.5, -40], [3, 2.0, -44], [0, 14, -66], [0, 16, -66], 46, 0, true));
  // Leo notices
  shot(E("but"), "day", 11, mv([-1.4, 1.5, 2.6], [-1.6, 1.5, 2.3], [LEO_HOME[0], 1.4, LEO_HOME[2]], [LEO_HOME[0], 1.42, LEO_HOME[2]], 38, 0.03));
  shot(E("weird"), "day", 13, mv([-3.0, 1.5, 0.9], [-3.1, 1.5, 0.7], [LEO_HOME[0], 1.48, LEO_HOME[2]], [LEO_HOME[0], 1.48, LEO_HOME[2]], 32, -0.03));
  shot(E("postman", 1), "day", 6, (u, f) => { const q = postAt(f / FPS); return { pos: [q[0] + 3.2, 1.2, q[2] + 2.6], look: [q[0], 0.9, q[2]], fov: 42, roll: 0 }; });
  shot(E("footprints"), "day", 9, (u, f) => { const q = postAt(f / FPS); return { pos: [q[0] + 1.3, 0.95, q[2] - 2.8], look: [q[0], 0.6, q[2] + 0.2], fov: 46, roll: 0.02 }; });
  // the same loopy L
  shot(E("every", 2), "day", 13, front(sp("cat"), 0.75, 1.0, 0.15, 34, 0.98));
  shot(E("who"), "day", 13, front(sp("dance"), 0.75, 1.0, -0.15, 34, 0.98, 0.02));
  shot(E("loopy", 1), "day", 14, mv([sp("oven")[0] + 0.07, 0.86, sp("oven")[2] + 0.45], [sp("oven")[0] + 0.07, 0.86, sp("oven")[2] + 0.4], [sp("oven")[0] + 0.05, 0.83, sp("oven")[2]], [sp("oven")[0] + 0.05, 0.83, sp("oven")[2]], 30));
  // Leo's blank page
  shot(E("this", 2), "day", 10, mv([-0.4, 1.45, 2.4], [-0.6, 1.45, 2.0], [-2.9, 1.1, -1.1], [-2.9, 1.12, -1.1], 40, 0.02));
  shot(E("tears"), "day", 12, front(LEO_AT_BOX, 1.0, 1.1, 0.3, 32, 0.98));
  shot(E("page", 1), "day", 12, front(LEO_AT_BOX, 0.85, 1.05, -0.2, 32, 0.98, 0.02));
  shot(E("blank"), "day", 13, front(LEO_AT_BOX, 1.6, 1.5, 0.5, 32, 1.4));
  shot(E("no", 2), "day", 12, front(LEO_AT_BOX, 0.8, 1.02, 0.25, 32, 0.98, -0.03));
  shot(E("not"), "day", 12, front(LEO_AT_BOX, 1.9, 1.45, -0.6, 34, 1.3, 0.03));
  // that night: the trail to the tower
  shot(E("so"), "night", 6, (u, f) => { const h = leoAt(f / FPS).p; return { pos: [h[0] + 1.4, 1.5, h[2] - 4.0], look: [h[0], 1.1, h[2]], fov: 42, roll: 0 }; });
  shot(E("trail"), "night", 0, mv([-0.6, 1.3, -35.2], [-0.6, 1.35, -36.4], [0, 3, -66], [0, 3.5, -66], 42, 0, true)); // Leo just behind the lens: the trail ahead is untouched
  shot(E("up"), "night", 0, mv([2.0, 1.6, -42], [1.6, 2.0, -45], [0, 12, -66], [0, 13, -66], 50, 0.02, true));
  // inside the tower
  shot(E("inside"), "lamp", 0, mvR([2.8, 2.0, 3.0], [2.4, 1.9, 2.4], [-0.6, 1.0, -1.8], [-0.6, 1.0, -1.9], 46, 0, true));
  shot(E("desk"), "lamp", 8, mvR([1.2, 1.3, 0.6], [1.0, 1.3, 0.4], [0, 0.85, -1.9], [0, 0.85, -1.9], 42, 0.02));
  shot(E("lamp"), "lamp", 12, mvR([-0.1, 1.05, -1.0], [-0.15, 1.05, -1.1], [-0.42, 1.0, -2.05], [-0.42, 1.0, -2.05], 38, -0.02));
  shot(E("pen"), "lamp", 13, mvR([0.62, 0.95, -1.35], [0.6, 0.94, -1.42], [0.42, 0.77, -1.68], [0.42, 0.77, -1.68], 36, 0.02));
  shot(E("thousand"), "lamp", 0, mvR([1.4, 1.5, 2.2], [1.1, 1.55, 1.8], [-3.9, 1.6, -0.5], [-3.9, 1.7, -0.6], 46, 0, true));
  shot(E("note"), "lamp", 12, mvR([0.05, 1.12, -1.25], [0.0, 1.1, -1.32], [-0.05, 0.77, -1.75], [-0.05, 0.77, -1.75], 36, 0.02));
  shot(E("handwriting"), "lamp", 14, mvR([0.0, 1.0, -1.5], [0.0, 0.98, -1.55], [0.02, 0.77, -1.82], [0.02, 0.77, -1.82], 34, -0.02));
  shot(E("your"), "lamp", 12, mvR([0.15, 1.3, 1.3], [0.1, 1.3, 1.15], [0.35, 1.15, -0.8], [0.35, 1.17, -0.8], 44, 0.02));
  shot(E("umbrella", 2), "lamp", 6, mvR([2.2, 1.4, 1.4], [2.6, 1.6, 2.0], [0.5, 1.0, -1.3], [0.4, 1.0, -1.3], 46, 0, true));
};
const LEO_AT_BOX: V3 = [-2.45, 0, -0.75]; // on the lane, beside his mailbox
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
export const lookAt = (f: number): Look => { ensure(); return S[shotIdx(f)].look; };

// ---------------- the story by time ----------------
/** the postman walks up the street (and leaves no prints) */
function postAt(t: number): V3 { return [-1.6, 0, -34 + t * 1.05]; } // on fresh snow left of the trodden lane, clear of the red car and the readers
type Held = null | { kind: "page" | "env" | "envOpen" | "blank" | "blankBack" | "note"; key?: string };
function leoAt(t: number): { p: V3; fo: FrontOpts; held: Held; room: boolean; walking: boolean } {
  if (t < T("this", 2)) {
    let expr: Expr = "neutral", look = 0;
    if (t >= T("but")) { expr = "stern"; look = 0.5; }
    if (t >= T("weird")) expr = "nervous";
    return { p: LEO_HOME, fo: { mode: "stand", expr, look }, held: null, room: false, walking: false };
  }
  if (t < T("so")) {
    let held: Held = { kind: "env" }, expr: Expr = "grin";
    if (t >= T("tears")) held = { kind: "envOpen" };
    if (t >= T("page", 1)) { held = { kind: "blank" }; expr = "nervous"; }
    if (t >= T("blank")) expr = "shock";
    if (t >= T("no", 2)) { held = { kind: "blankBack" }; expr = "pained"; }
    if (t >= T("not")) { held = { kind: "blank" }; expr = "stern"; }
    return { p: LEO_AT_BOX, fo: { mode: "stand", expr, prop: "hold2" }, held, room: false, walking: false };
  }
  if (t < T("inside")) {
    if (t < T("up")) { const z = -30 - (t - T("so")) * 1.3; return { p: [-0.6, 0, z], fo: { mode: "stroll", phase: t * 1.1, expr: "stern" }, held: null, room: false, walking: true }; }
    return { p: [0.8, 0, -60.5], fo: { mode: "stand", expr: "nervous", headTilt: -6, look: 0.3 }, held: null, room: false, walking: false };
  }
  let expr: Expr = "shock";
  if (t >= T("desk")) expr = "nervous";
  if (t >= T("note")) expr = "stern";
  if (t >= T("your")) return { p: at(ROOM, [0.35, 0, -0.8]), fo: { mode: "stand", expr: t >= T("umbrella", 2) ? "grin" : "shock", prop: "hold2" }, held: { kind: "note" }, room: true, walking: false };
  return { p: at(ROOM, [1.0, 0, 0.4]), fo: { mode: "stand", expr, look: -0.5 }, held: null, room: true, walking: false };
}

// ---------------- building pieces ----------------
/** a lit window at night: warm panes behind a dark frame and cross */
const winTex = () => ctex("litWindow", 128, 160, (g) => {
  g.fillStyle = "#3a2a24"; g.fillRect(0, 0, 128, 160);
  const gr = g.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, "#ffe6a8"); gr.addColorStop(1, "#ffb84a");
  g.fillStyle = gr; g.fillRect(12, 12, 104, 136);
  g.fillStyle = "#3a2a24"; g.fillRect(58, 12, 12, 136); g.fillRect(12, 72, 104, 10);
});
const WIN_M = () => new THREE.MeshBasicMaterial({ map: winTex(), color: new THREE.Color(1.25, 1.1, 1.0) });
const STY = [
  { wall: "#d8b07a", shutter: "#2f6a43" }, { wall: "#c97a5a", shutter: "#2f5f6a" }, { wall: "#e2d2b0", shutter: "#3f6fb5" },
  { wall: "#b8c8d8", shutter: "#8c3b4a" }, { wall: "#d89a7a", shutter: "#2f6a43" }, { wall: "#e8dcc0", shutter: "#5a3b2a" },
];
/** gabled house with snow on the roof: front (local +z) w wide, d deep, walls h high */
const snowHouse = (b: Batch, x: number, z: number, yaw: number, w: number, d: number, h: number, si: number, lit: THREE.Group) => {
  const st = STY[si % STY.length], m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z);
  const front = lam(`lf${si}_${w}_${h}`, () => ({ map: facadeHD(`lf${si}_${w}_${h}`, w, h, { ...st, door: true }) }));
  const side = lam(`ls${si}_${h}`, () => ({ map: facadeHD(`ls${si}_${h}`, d, h, st) }));
  const gable = lam("gable" + st.wall, () => ({ color: st.wall }));
  const hw = w / 2, hd = d / 2, rh = d * 0.45, o = 0.45;
  b.add(quad(V(-hw, 0, hd), V(hw, 0, hd), V(hw, h, hd), V(-hw, h, hd)), front, m);
  b.add(quad(V(hw, 0, -hd), V(-hw, 0, -hd), V(-hw, h, -hd), V(hw, h, -hd)), side, m);
  b.add(quad(V(-hw, 0, -hd), V(-hw, 0, hd), V(-hw, h, hd), V(-hw, h, -hd)), side, m);
  b.add(quad(V(hw, 0, hd), V(hw, 0, -hd), V(hw, h, -hd), V(hw, h, hd)), side, m);
  b.add(tri(V(-hw, h, -hd), V(-hw, h, hd), V(-hw, h + rh, 0)), gable, m);
  b.add(tri(V(hw, h, hd), V(hw, h, -hd), V(hw, h + rh, 0)), gable, m);
  const roof = lam("roofSnowM", () => ({ map: P.roofSnowTex(), side: THREE.DoubleSide }));
  b.add(quad(V(-hw - o, h - 0.3, hd + o), V(hw + o, h - 0.3, hd + o), V(hw + o, h + rh + 0.05, 0), V(-hw - o, h + rh + 0.05, 0), 2, 1), roof, m);
  b.add(quad(V(hw + o, h - 0.3, -hd - o), V(-hw - o, h - 0.3, -hd - o), V(-hw - o, h + rh + 0.05, 0), V(hw + o, h + rh + 0.05, 0), 2, 1), roof, m);
  // roof edge (thick snow lip) and chimney with a snow cap
  b.add(boxGeo(V(-hw - o, h - 0.42, hd + o - 0.05), V(hw + o, h - 0.25, hd + o + 0.08)), lam("snowLip", () => ({ color: "#f6f8fc" })), m);
  const cx = hw * 0.4;
  b.add(boxGeo(V(cx - 0.4, h + rh * 0.4, -hd * 0.3 - 0.4), V(cx + 0.4, h + rh + 1.0, -hd * 0.3 + 0.4)), lam("chimBrick", () => ({ color: "#a8584a" })), m);
  b.add(boxGeo(V(cx - 0.48, h + rh + 1.0, -hd * 0.3 - 0.48), V(cx + 0.48, h + rh + 1.2, -hd * 0.3 + 0.48)), lam("snowLip", () => ({ color: "#f6f8fc" })), m);
  // warm windows for the night (on the front, 8 cm off the wall): glow only in night shots
  const nWin = Math.max(1, Math.floor(w / 2.2)), floors = Math.max(1, Math.floor(h / 2.8));
  for (let fl = 0; fl < floors; fl++) for (let i = 0; i < nWin; i++) {
    if (fl === 0 && i === Math.floor(nWin / 2)) continue;
    const px = -hw + ((i + 0.5) / nWin) * w, py = fl * 2.8 + 0.9 + 0.62;
    const g = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), WIN_M());
    g.applyMatrix4(new THREE.Matrix4().makeTranslation(px, py, hd + 0.08).premultiply(m)); g.layers.set(NOINK); lit.add(g);
  }
};

// ---------------- the world ----------------
export class LettersWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#e9d6dc", 60, 600);
  private clouds: THREE.Mesh[] = [];
  private sunCache = new Map<number, THREE.Vector3>();
  private litWins = new THREE.Group();
  private held = new Map<string, THREE.Object3D>();
  private bag = P.satchel();
  private note!: THREE.Object3D;
  private prints: THREE.Mesh[] = [];

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
    this.buildTown(R);
    this.buildRoom(R);
    R.add(this.litWins);
    // hand-held paper, one object each, placed per frame
    const add = (k: string, o: THREE.Object3D) => { o.visible = false; this.held.set(k, o); R.add(o); };
    for (const s of SPOTS) add("page_" + s.key, P.page(s.key, s.lines));
    add("env", P.envelope("leo", "Leo"));
    add("envOpen", P.envelope("leoOpen", "Leo", true, P.page("blankIn", [], { sign: false, blank: true })));
    add("blank", P.page("blank", [], { sign: false, blank: true }));
    add("note", P.page("note", ["!Your turn, Leo.", "Don't forget the umbrella."]));
    this.bag.visible = true; R.add(this.bag);
    // Leo's own footprints: from his door to the mailbox (morning) and along the night trail
    const fm = new THREE.MeshLambertMaterial({ map: P.footTex(), transparent: true, alphaTest: 0.15, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    for (let k = 0; k < 120; k++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.28).rotateX(-Math.PI / 2), fm);
      m.visible = false; m.receiveShadow = true; this.prints.push(m); R.add(m);
    }
  }

  private buildTown(R: THREE.Object3D) {
    const kit = makeKit(), b = new Batch(), r = rng(4);
    // snow everywhere, a trodden lane down the middle
    b.add(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2).translate(0, -0.02, -100), lam("snowG", () => ({ map: rep(P.snowTex(), 90, 90) })));
    b.add(new THREE.PlaneGeometry(2.4, 100).rotateX(-Math.PI / 2).translate(0, 0.03, -30), lam("snowPath", () => ({ map: rep(P.pathTex(), 1, 10), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })));
    // houses both sides with picket fences and mailboxes
    for (const s of [-1, 1]) for (let k = 0; k < 6; k++) {
      const zc = 8 - k * 10, h = [6.4, 7.2, 8.0][k % 3], si = (k * 2 + (s > 0 ? 1 : 0)) % 6;
      snowHouse(b, s * (FRONT + 4), zc, s < 0 ? Math.PI / 2 : -Math.PI / 2, 8, 8, h, si, this.litWins);
      // fence along the street with a gate gap
      for (let i = 0; i < 9; i++) {
        const z = zc - 4.2 + i * 1.05;
        if (Math.abs(z - (zc + 1.4)) < 0.7) continue;
        b.add(boxGeo(V(s * FENCE - 0.04, 0, z - 0.06), V(s * FENCE + 0.04, 0.95, z + 0.06)), lam("fenceW", () => ({ color: "#f2ead8" })));
      }
      b.add(boxGeo(V(s * FENCE - 0.03, 0.55, zc - 4.2), V(s * FENCE + 0.03, 0.65, zc + 4.2)), lam("fenceW", () => ({ color: "#f2ead8" })));
      b.add(boxGeo(V(s * FENCE - 0.05, 0.95, zc - 4.2), V(s * FENCE + 0.05, 1.03, zc + 4.2)), lam("snowLip", () => ({ color: "#f6f8fc" })));
      // mailbox by the gate, on the street side, door toward the street
      const mb = P.mailbox(true);
      mb.position.set(s * (FENCE - 0.35), 0, zc + 0.6); mb.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2; mb.updateMatrixWorld(true);
      b.addObject(mb, new THREE.Matrix4());
      // a fir tree in the yard
      prop(b, kit, "tree_cone", s * (FENCE + 2.8), 0, zc - 3, 4.5 + (k % 2));
    }
    // red car parked in the lane
    const car = P.redCar(); car.position.set(...RED_CAR); car.updateMatrixWorld(true); b.addObject(car, new THREE.Matrix4());
    // lamp posts down the lane
    for (let z = 6; z > -60; z -= 10) for (const s of [-1, 1]) prop(b, kit, "lantern", s * 2.9, 0, z + (s > 0 ? 5 : 0), 3.4);
    // town square + the clock tower
    const [tx, , tz] = TOWER, tw = 3;
    const stone = lam("towerStone", () => ({ map: stoneHD("towerHD2", ["#d6c6a8", "#ccbc9e", "#e0d0b2", "#c4b496"], "#9a8a70") }));
    b.add(boxGeo(V(tx - tw, 0, tz - tw), V(tx + tw, 21, tz + tw), 3), stone);
    b.add(boxGeo(V(tx - tw - 0.35, 20.6, tz - tw - 0.35), V(tx + tw + 0.35, 21.3, tz + tw + 0.35)), lam("snowLip", () => ({ color: "#f6f8fc" })));
    b.add(new THREE.ConeGeometry(4.6, 7, 4, 1).rotateY(Math.PI / 4).translate(tx, 24.8, tz), lam("roofSnowM", () => ({ map: P.roofSnowTex(), side: THREE.DoubleSide })));
    b.add(new THREE.PlaneGeometry(4.0, 4.0).translate(tx, 16.5, tz + tw + 0.06), lam("clockFace", () => ({ map: P.clockTex("tower", 11, 55) })));
    b.add(boxGeo(V(tx - 0.9, 0, tz + tw), V(tx + 0.9, 3.0, tz + tw + 0.12)), lam("towerDoor", () => ({ color: "#5a3a24" })));
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6).translate(tx, 9, tz + tw + 0.08), WIN_M());
    win.layers.set(NOINK); this.litWins.add(win);
    for (let i = 0; i < 40; i++) prop(b, kit, i % 3 ? "tree_cone" : "tree_default", (i % 2 ? 1 : -1) * (24 + (i * 7) % 30), 0, 10 - i * 4, 7 + (i % 4));
    for (let i = 0; i < 14; i++) prop(b, kit, "tree_cone", (r() - 0.5) * 60, 0, -80 - r() * 30, 8 + r() * 5);
    b.build(R);
  }

  private buildRoom(R: THREE.Object3D) {
    const b = new Batch(), o = ROOM;
    const B = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, m: THREE.Material) => b.add(boxGeo(V(o[0] + x0, y0, z0), V(o[0] + x1, y1, z1)), m);
    B(-4.2, -0.2, -4.2, 4.2, 0, 4.2, lam("floorPlanks", () => ({ map: rep(P.planksHD(), 2, 2) })));
    const wall = lam("roomStone", () => ({ map: rep(stoneHD("roomHD", ["#b8a888", "#ae9e80", "#c2b292", "#a69678"], "#7f725f"), 2, 1) }));
    B(-4.2, 0, -4.4, 4.2, 5, -4.2, wall); B(-4.4, 0, -4.4, -4.2, 5, 4.2, wall); B(4.2, 0, -4.4, 4.4, 5, 4.2, wall);
    B(-4.4, 4.8, -4.4, 4.4, 5.0, 4.4, lam("roomBeam", () => ({ map: beamHD() })));
    // the back of the clock face, seen from inside (a round window, moonlight behind it)
    b.add(new THREE.CircleGeometry(1.3, 40).translate(o[0] + 1.8, 3.2, -4.12), lam("clockBack", () => ({ map: P.clockTex("inside", 12, 5), side: THREE.DoubleSide })));
    // desk, chair, lamp, pen, ink pot; the umbrella leaning against the desk; the envelope wall on the left
    const place = (g: THREE.Object3D, p: V3, ry = 0) => { g.position.set(o[0] + p[0], p[1], p[2]); g.rotation.y = ry; g.updateMatrixWorld(true); b.addObject(g, new THREE.Matrix4()); };
    place(P.desk(), [0, 0, DESK[2]]);
    place(P.chair(), [0, 0, DESK[2] - 0.75], 0);
    place(P.inkPot(), [0.38, 0.76, DESK[2] - 0.12]);
    place(P.pen(), [0.42, 0.76, DESK[2] + 0.22], 0.35);
    const u = P.umbrella(); u.rotation.z = -0.12; place(u, [0.86, 0, DESK[2] + 0.2]);
    const ph = new THREE.Group(); P.pigeonholes(6.0, 3.3, ph); ph.position.set(o[0] - 3.84, 0.3, 3.0); ph.rotation.y = Math.PI / 2; ph.updateMatrixWorld(true); b.addObject(ph, new THREE.Matrix4());
    const ph2 = new THREE.Group(); P.pigeonholes(3.0, 3.3, ph2); ph2.position.set(o[0] - 3.84, 0.3, -3.84); ph2.updateMatrixWorld(true); b.addObject(ph2, new THREE.Matrix4());
    // the lamp keeps its glowing bulb (a basic material): add it as its own object
    const lamp = P.deskLamp(); lamp.position.set(o[0] - 0.42, 0.76, DESK[2] - 0.15); lamp.rotation.y = 0.4;
    lamp.traverse((m) => { const mm = m as THREE.Mesh; if (mm.isMesh) { mm.castShadow = true; mm.receiveShadow = true; } });
    R.add(lamp);
    // the note lying on the desk
    this.note = P.page("noteDesk", ["!Your turn, Leo.", "Don't forget the umbrella."]);
    this.note.position.set(o[0] - 0.05, 0.763, DESK[2] + 0.12); this.note.rotation.set(-Math.PI / 2, 0, 0.12);
    R.add(this.note);
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
    this.sun.castShadow = s.look !== "lamp";
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
    const far = s.look === "lamp" ? 60 : s.look === "night" ? 320 : 600;
    this.fog.near = far * 0.1; this.fog.far = far;
    scene.fog = this.fog; scene.background = null;
    this.clouds.forEach((m, k) => {
      const a = (k / 12) * Math.PI * 2 + 0.3, d = 560 + (k % 3) * 70, w = 140 + (k % 4) * 34;
      m.visible = s.look === "day" || s.look === "dawn";
      m.position.set(cam.position.x + Math.cos(a) * d, 60 + (k % 4) * 34, cam.position.z + Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
    });
    this.litWins.visible = s.look === "night";

    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const k = (f + seed * 37) % 64; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
    let ai = 0, fi = 0;
    const used: Actor[] = [], fused: Fx[] = [];
    for (const o of this.held.values()) o.visible = false;
    const addFx = (key: string, cw: number, ch: number, draw: (p: Pen) => void, atp: THREE.Vector3, w: number, h: number, soft = false, op = 1) => {
      const ef = this.fx(fi++);
      ef.r = this.pool.req(key, cw, ch, 1, draw); ef.use(soft); ef.soft.opacity = op;
      ef.mesh.visible = true; ef.mesh.position.copy(atp); ef.mesh.quaternion.copy(cam.quaternion); ef.mesh.scale.set(w, h, 1);
      fused.push(ef); return ef;
    };
    const ground = (p: V3, w = 0.55) => {
      const ef = addFx("blob|contact|#5a6488", 128, 128, (pp) => fxContact(pp, "#5a6488"), V(p[0], p[1] + 0.035, p[2]), w, w * 0.7);
      ef.mesh.rotation.set(-Math.PI / 2, 0, 0);
    };
    /** a person card; held = the 3D object to put between the hands */
    const person = (key: string, p: V3, o: Outfit, fo: FrontOpts, seed: number, held?: THREE.Object3D | null, flip = false) => {
      const w = V(...p), d = cam.position.distanceTo(w);
      if (d > 120) return;
      const [cw, ch, k] = d < 3.2 ? [1800, 3000, 3.0] : d < 7 ? [1080, 1800, 1.8] : d < 18 ? [480, 800, 0.8] : [240, 400, 0.4];
      const f2: FrontOpts = { ...fo, light: L2D, seed };
      if (f2.blink === undefined) f2.blink = lid(seed);
      const a = this.actor(ai++);
      a.r = this.pool.req(`${key}|F|${JSON.stringify(f2, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, k, (pen) => bodyFront(pen, o, f2));
      const yaw = Math.atan2(cam.position.x - w.x, cam.position.z - w.z);
      a.mesh.visible = true; a.mesh.position.copy(w); a.mesh.rotation.set(0, yaw, 0); a.mesh.scale.set(1, 1, 1); a.mesh.castShadow = false;
      used.push(a); ground(p);
      if (held) {
        const n = V(Math.sin(yaw), 0, Math.cos(yaw));
        held.visible = true;
        held.position.copy(w).add(V(0, handY(o), 0)).addScaledVector(n, 0.07);
        held.rotation.set(-0.22, yaw + (flip ? Math.PI : 0), 0, "YXZ");
      }
    };
    const leo = leoAt(t);
    const H = (k?: string) => (k ? this.held.get(k)! : null);
    const leoHeld = leo.held ? H(leo.held.kind === "blankBack" ? "blank" : leo.held.kind) : null;
    person("leo", leo.p, HERO, leo.fo, 4, leoHeld, leo.held?.kind === "blankBack");
    this.note.visible = !(leo.held && leo.held.kind === "note");
    if (!leo.room && s.look !== "night") {
      // townsfolk reading their letters by the mailboxes (from "everyone" on)
      const reading = t >= T("everyone") - 0.2;
      SPOTS.forEach((sp, k) => {
        const happy: Expr = k % 2 ? "grin" : "smile";
        person("f" + k, sp.p, FOLK[sp.o], { mode: "stand", expr: reading ? happy : "neutral", prop: reading ? "hold2" : undefined }, 10 + k, reading ? H("page_" + sp.key) : null);
      });
      person("anna", ANNA, ANNA_O, { mode: "stand", expr: t >= T("anna") ? "grin" : "smile", facing: 1, look: 0.6 }, 30);
      // the postman and his satchel at the hip
      const q = postAt(t);
      {
        person("post", q, POSTMAN, { mode: "stroll", phase: t * 1.0, expr: "smile" }, 6);
        const yaw = Math.atan2(cam.position.x - q[0], cam.position.z - q[2]), n = V(Math.sin(yaw), 0, Math.cos(yaw)), rr = V(Math.cos(yaw), 0, -Math.sin(yaw));
        this.bag.visible = true; this.bag.position.set(q[0], 0.72, q[2]).addScaledVector(rr, 0.1).addScaledVector(n, 0.12); // worn on the hip, over the strap this.bag.rotation.set(0, yaw, 0);
      }
    } else this.bag.visible = false;
    // Leo's footprints (the postman never leaves any)
    let pi = 0;
    const printAt = (x: number, z: number, yaw: number) => { if (pi >= this.prints.length) return; const m = this.prints[pi++]; m.visible = true; m.position.set(x, 0.045, z); m.rotation.set(0, yaw, 0); };
    if (!leo.room && s.look !== "night") {
      // morning: door (gate) to mailbox and back
      for (let k = 0; k < 12; k++) { const u = k / 11; printAt(lerp(-FENCE - 1.0, LEO_AT_BOX[0], u), lerp(-0.6, LEO_AT_BOX[2], u) + (k % 2 ? 0.12 : -0.12), -Math.PI / 2); }
    }
    if (s.look === "night" && leo.walking) {
      const z0 = -30, z1 = leo.p[2];
      for (let z = z0; z > z1 + 0.4; z -= 0.42) { const k = Math.round((z0 - z) / 0.42); printAt(-0.6 + (k % 2 ? 0.13 : -0.13), z, Math.PI); }
    }
    if (s.look === "night" && !leo.walking) for (let z = -30; z > -60; z -= 0.42) { const k = Math.round((-30 - z) / 0.42); printAt(lerp(-0.6, 0.8, (-30 - z) / 30) + (k % 2 ? 0.13 : -0.13), z, Math.PI); }
    for (let k = pi; k < this.prints.length; k++) this.prints[k].visible = false;
    // falling snow (dawn and night), soft flakes near the lens
    if (s.look === "night" || s.look === "dawn") {
      const fw = V(0, 0, 0); cam.getWorldDirection(fw);
      for (let k = 0; k < 50; k++) {
        const rr = rng(k * 13 + 1)(), r2 = rng(k * 7 + 3)(), fall = ((t * 0.35 + rr) % 1);
        const q = pos.clone().addScaledVector(fw, 2 + (k % 10) * 1.4).addScaledVector(right, (r2 - 0.5) * 5).add(V(0, 2.2 - fall * 4.4, 0));
        addFx("flake", 64, 64, (pp) => { const g = pp.g, gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }, q, 0.06, 0.06, true, 0.85);
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
