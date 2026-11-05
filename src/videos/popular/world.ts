// "What if you became the most popular kid overnight": one school hallway (lockers, classroom doors, a fire
// extinguisher, windows at the end), our hero and a crowd of students as flat cards; the phone, the napkins and the
// extinguisher are our own 3D props. Every cut follows the narration (voice.ts).
import * as THREE from "three";
import { Batch, V, lam, boxGeo } from "../bridge/build";
import { rep, ctex, rng } from "../bridge/paint";
import { bodyFront, Outfit, Expr, FrontOpts, INK, fxContact, HOLD_DY } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx, SU } from "../bridge/cast";
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
export const TOTAL = Math.ceil((VOICE.dur + 1.3) * FPS);
const T = (w: string, n = 1) => wt(w, n) - 0.07;

// ---------------- light: bright school morning ----------------
const SCHOOL: { L: LightPreset; K: WorldLook } = { L: { ...LIGHTS.day, lit: [1.5, 1.44, 1.32], shade: [0.42, 0.42, 0.5], lift: [0.08, 0.08, 0.11], fog: "#e8e6e0", charTint: [1.0, 0.98, 0.95], hemiI: 0.6 }, K: { ...LOOK.day } };

// ---------------- layout: the hallway runs along z, the entrance at +z, windows at -z ----------------
const HW = 2.6, H = 3.2, Z0 = -30, Z1 = 8;
const EXT: V3 = [-HW + 0.05, 1.05, -4.0];          // fire extinguisher on the left wall
const HERO_IN = (t: number): V3 => [0.2, 0, lerp(5.5, -1.0, clamp01(t))];

// ---------------- cast ----------------
const HEAD = "#f8f6f0";
const HERO: Outfit = { jacket: "#f27a2a", pants: "#262838", boots: "#ffffff", hat: "beanie", cap: "#2c3552", pack: "#f4c430", skin: HEAD, limb: "#262838" };
const CROOKED: Outfit = { ...HERO, hatTilt: 14 };
const STUDENTS: Outfit[] = [
  { jacket: "#3f9a5a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#3a2418", skin: HEAD },
  { jacket: "#c25a7a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#d8a040", skin: HEAD, dress: "#d9a441" },
  { jacket: "#7b5ac9", pants: "#2e3a5a", boots: INK, hat: "cap", cap: "#e2453c", skin: HEAD },
  { jacket: "#2f8a9a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a", skin: HEAD, dress: "#5a8fc2" },
  { jacket: "#d84a3a", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#22180f", skin: HEAD },
  { jacket: "#f0b030", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#3f8a4a", skin: HEAD },
  { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#7a3a1a", skin: HEAD, dress: "#e85a8a" },
  { jacket: "#5d7a3a", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#b07a3a", skin: HEAD },
  { jacket: "#3f6fb5", pants: "#2e3a5a", boots: INK, hat: "hair", hair: "#3a2418", skin: HEAD, dress: "#3f6fb5" },
  { jacket: "#e8e4dc", pants: "#5a6a8a", boots: INK, hat: "cap", cap: "#2e4a8a", skin: HEAD },
];
const FRIEND: Outfit = { jacket: "#3fa08a", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#6a3a1a", skin: HEAD };
const PRINCIPAL: Outfit = { jacket: "#5a6070", pants: "#3a3e4a", boots: INK, hat: "beanie", cap: "#2c3552", skin: HEAD, moustache: "#8a8a92", build: "stout", buttons: "#d8d8dc", hatTilt: 14 };
/** students along the lockers: position, partner direction (who they chat with before they notice you) */
const CROWD: { p: V3; o: number; side: -1 | 1 }[] = [
  { p: [-1.85, 0, -2.2], o: 0, side: 1 }, { p: [-1.1, 0, -2.8], o: 1, side: -1 },
  { p: [1.85, 0, -3.4], o: 2, side: -1 }, { p: [1.1, 0, -4.0], o: 3, side: 1 },
  { p: [-1.85, 0, -6.4], o: 4, side: 1 }, { p: [-1.0, 0, -7.0], o: 5, side: -1 },
  { p: [1.85, 0, -7.8], o: 6, side: -1 }, { p: [0.9, 0, -8.6], o: 7, side: 1 },
  { p: [-1.6, 0, -10.6], o: 8, side: 1 }, { p: [1.6, 0, -11.4], o: 9, side: -1 },
  { p: [-0.4, 0, -12.6], o: 0, side: 1 }, { p: [0.6, 0, -13.4], o: 2, side: -1 },
];
const FRIEND_AT: V3 = [-0.55, 0, -6.0], HERO_BY_FRIEND: V3 = [0.45, 0, -6.2];
const PRINCIPAL_AT: V3 = [0.1, 0, -9.4];

// ---------------- 3D props (our style) ----------------
const add = (g: THREE.Group, geo: THREE.BufferGeometry, m: THREE.Material, p: [number, number, number], r: [number, number, number] = [0, 0, 0]) => {
  const x = new THREE.Mesh(geo, m); x.position.set(...p); x.rotation.set(...r); x.castShadow = true; x.receiveShadow = true; g.add(x); return x;
};
/** red fire extinguisher in a wall bracket with a FIRE sign above, facing +x */
const extinguisher = () => {
  const g = new THREE.Group(), red = lam("extRed", () => ({ color: "#d8302a" })), black = lam("extBlack", () => ({ color: "#26262c" })), steel = lam("extSteel", () => ({ color: "#b8bcc6" }));
  add(g, new THREE.CylinderGeometry(0.09, 0.09, 0.5, 18), red, [0.12, 0, 0]);
  add(g, new THREE.SphereGeometry(0.09, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), red, [0.12, 0.25, 0]);
  add(g, new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10), black, [0.12, 0.33, 0]);
  add(g, new THREE.BoxGeometry(0.12, 0.025, 0.03), black, [0.15, 0.37, 0]);
  add(g, new THREE.CylinderGeometry(0.012, 0.012, 0.32, 8), black, [0.215, 0.18, 0], [0, 0, 0.35]);
  add(g, new THREE.BoxGeometry(0.08, 0.06, 0.04), lam("extLabel", () => ({ color: "#f4f1ea" })), [0.205, 0.0, 0]);
  add(g, new THREE.BoxGeometry(0.02, 0.06, 0.2), steel, [0.01, 0.05, 0]);
  add(g, new THREE.BoxGeometry(0.02, 0.3, 0.42), lam("extSign", () => ({ map: ctex("fireSign", 256, 180, (c) => { c.fillStyle = "#d8302a"; c.fillRect(0, 0, 256, 180); c.fillStyle = "#ffffff"; c.font = `900 70px "DejaVu Sans", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("FIRE", 128, 70); c.font = `700 30px "DejaVu Sans", sans-serif`; c.fillText("EXTINGUISHER", 128, 135); }) })), [0.01, 0.65, 0]);
  return g;
};
/** smartphone, centred, screen toward +z; the screen is a live canvas */
const phoneScreen = document.createElement("canvas"); phoneScreen.width = 360; phoneScreen.height = 720;
const phoneTex = new THREE.CanvasTexture(phoneScreen); phoneTex.colorSpace = THREE.SRGBColorSpace;
let phoneN = -1;
const drawPhone = (n: number) => {
  if (n === phoneN) return; phoneN = n;
  const g = phoneScreen.getContext("2d")!;
  g.fillStyle = "#14161e"; g.fillRect(0, 0, 360, 720);
  g.fillStyle = "#ffffff"; g.font = `700 26px "DejaVu Sans", sans-serif`; g.textAlign = "left"; g.fillText("8:42", 24, 44);
  const items = [["#e8456a", "mia.k liked your photo"], ["#3f9a5a", "Jake: party saturday??"], ["#7b5ac9", "zoe_xo started following you"], ["#e8456a", "312 people liked your post"], ["#f0b030", "You're invited: Team Captain"], ["#3f6fb5", "Max: sit with us at lunch"]];
  items.forEach(([c, s], k) => {
    const y = 80 + k * 98;
    g.fillStyle = "#262a36"; g.beginPath(); g.roundRect(14, y, 332, 86, 18); g.fill();
    g.fillStyle = c; g.beginPath(); g.arc(56, y + 43, 24, 0, 7); g.fill();
    g.fillStyle = "#ffffff"; g.font = `700 21px "DejaVu Sans", sans-serif`;
    const words = s.split(" "); let line = "", yy = y + 36;
    for (const w of words) { if (g.measureText(line + w).width > 240) { g.fillText(line, 92, yy); yy += 26; line = ""; } line += w + " "; }
    g.fillText(line, 92, yy);
  });
  g.fillStyle = "#e8302a"; g.beginPath(); g.arc(300, 660, 44, 0, 7); g.fill();
  g.fillStyle = "#ffffff"; g.font = `900 34px "DejaVu Sans", sans-serif`; g.textAlign = "center"; g.fillText(String(n), 300, 672);
  phoneTex.needsUpdate = true;
};
const phone = () => {
  const g = new THREE.Group();
  add(g, new THREE.BoxGeometry(0.075, 0.155, 0.009), lam("phoneBody", () => ({ color: "#2a2c36" })), [0, 0, 0]);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.142), new THREE.MeshBasicMaterial({ map: phoneTex, color: new THREE.Color(1.15, 1.15, 1.15) }));
  s.position.z = 0.0048; g.add(s);
  return g;
};
/** a paper napkin with a scribbled autograph, held up, facing +z */
const napkin = () => {
  const g = new THREE.Group();
  add(g, new THREE.BoxGeometry(0.2, 0.2, 0.002), lam("napkinM", () => ({ map: ctex("napkinSig", 256, 256, (c) => {
    c.fillStyle = "#fbfaf4"; c.fillRect(0, 0, 256, 256);
    c.strokeStyle = "rgba(200,200,190,0.6)"; c.lineWidth = 3; c.strokeRect(14, 14, 228, 228);
    c.strokeStyle = "#2a3a8a"; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); c.moveTo(40, 160);
    c.bezierCurveTo(70, 60, 100, 200, 120, 120); c.bezierCurveTo(140, 60, 160, 190, 190, 110); c.bezierCurveTo(205, 80, 215, 150, 228, 130); c.stroke();
    c.beginPath(); c.moveTo(50, 190); c.lineTo(210, 185); c.stroke();
  }) })), [0, 0, 0]);
  return g;
};

// ---------------- shots ----------------
type Cam = { pos: V3; look: V3; fov: number; roll: number };
type ShotDef = { a: number; cInf: number; cam: (u: number, f: number) => Cam };
const mv = (p0: V3, p1: V3, l0: V3, l1: V3, fov: number, roll = 0, ease = false) => (u: number): Cam => {
  const k = ease ? glide(u) : u;
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k), fov, roll };
};
const S: ShotDef[] = [];
export const SHOTS = S;
const shot = (a: number, cInf: number, cam: (u: number, f: number) => Cam) => S.push({ a, cInf, cam });
const build = () => {
  const E = (w: string, n = 1) => wf(w, n);
  const opening = (n: number) => {
    // he walks in: front view down the hallway, the crowd turns, close on him
    shot(E("monday", n), 0, mv([0.3, 1.5, -6.5], [0.3, 1.5, -5.5], [0.2, 1.3, 4], [0.2, 1.3, 3], 42, 0, true));
    shot(E("whole", n === 1 ? 1 : 3), 0, mv([1.2, 2.5, 3.5], [1.0, 2.4, 3.0], [0, 1.2, -9], [0, 1.2, -9], 46, 0.02, true));
    shot(E("turns", n), 10, mv([1.9, 1.5, -6.2], [1.85, 1.5, -6.4], [-1.4, 1.45, -6.6], [-1.4, 1.45, -6.6], 40, -0.03));
  };
  opening(1);
  shot(E("for"), 12, mv([0.4, 1.55, -3.4], [0.35, 1.55, -3.6], [0.2, 1.5, -1.0], [0.2, 1.5, -1.0], 36, 0.03));
  shot(E("yesterday"), 0, mv([0.3, 1.5, -6.5], [0.3, 1.5, -6.0], [0.2, 1.3, 4], [0.2, 1.3, 3.5], 42));
  shot(E("overnight"), 0, mv([2.2, 2.7, -12], [1.8, 2.5, -10], [-0.2, 1.0, 0], [-0.2, 1.0, 0], 44, 0, true));
  shot(E("and", 2), 10, mv([0.0, 1.5, -4.8], [0.0, 1.5, -4.5], [0.2, 1.45, -1.0], [0.2, 1.47, -1.0], 36, 0.02));
  // rule one: everyone waves, so do you, and at the extinguisher
  shot(E("rule", 1), 0, mv([0.4, 1.7, 2.6], [0.4, 1.7, 2.0], [0, 1.3, -10], [0, 1.3, -10], 44, 0, true));
  shot(E("every", 1), 6, mv([-1.4, 1.6, 0.6], [-1.3, 1.6, 0.2], [0.8, 1.3, -8], [0.8, 1.3, -8], 42, 0.03));
  shot(E("you", 6), 10, mv([0.6, 1.5, -3.4], [0.55, 1.5, -3.6], [0.2, 1.45, -1.0], [0.2, 1.47, -1.0], 36, -0.02));
  shot(E("and", 3), 10, mv([0.4, 1.45, -3.0], [0.35, 1.45, -3.1], [-2.0, 1.25, -4.1], [-2.0, 1.25, -4.1], 44, 0.03));
  shot(E("extinguisher", 1), 13, mv([-1.0, 1.3, -3.2], [-1.05, 1.3, -3.3], [EXT[0], 1.15, EXT[2]], [EXT[0], 1.15, EXT[2]], 34, -0.02));
  // rule two: the phone
  shot(E("rule", 2), 8, mv([1.6, 1.4, -0.6], [1.5, 1.4, -0.8], [0.6, 1.2, -3.2], [0.6, 1.25, -3.2], 40, 0.02));
  shot(E("hearts"), 14, mv([0.62, 1.2, -2.75], [0.62, 1.2, -2.8], [0.6, 1.0, -3.15], [0.6, 1.0, -3.15], 36));
  shot(E("four", 1), 13, mv([0.75, 1.15, -2.8], [0.72, 1.12, -2.85], [0.6, 0.98, -3.15], [0.6, 0.98, -3.15], 32, 0.03));
  shot(E("your", 3), 12, mv([1.3, 1.5, -1.9], [1.25, 1.5, -2.0], [0.6, 1.4, -3.2], [0.6, 1.42, -3.2], 36, -0.03));
  // rule three: the crooked hat
  shot(E("rule", 3), 8, mv([-0.8, 1.6, -1.4], [-0.85, 1.6, -1.6], [0.6, 1.6, -3.2], [0.6, 1.62, -3.2], 38, 0.02));
  shot(E("crooked"), 13, mv([0.35, 1.7, -1.3], [0.37, 1.7, -1.4], [0.6, 1.6, -3.2], [0.6, 1.62, -3.2], 36, -0.04));
  shot(E("wednesday"), 0, mv([0.3, 2.2, 3.0], [0.3, 2.1, 2.2], [0, 1.4, -12], [0, 1.4, -12], 44, 0, true));
  shot(E("even"), 12, mv([0.9, 1.55, -6.6], [0.85, 1.55, -6.9], [PRINCIPAL_AT[0], 1.5, PRINCIPAL_AT[2]], [PRINCIPAL_AT[0], 1.52, PRINCIPAL_AT[2]], 36, 0.03));
  // the last rule: the best friend signs napkins
  shot(E("and", 4), 6, mv([1.4, 1.7, -2.6], [1.2, 1.7, -3.0], [0, 1.3, -6.1], [0, 1.3, -6.1], 44, 0, true));
  shot(E("best"), 11, mv([0.5, 1.5, -3.8], [0.45, 1.5, -4.0], [0, 1.4, -6.1], [0, 1.42, -6.1], 38, -0.02));
  shot(E("famous"), 10, mv([-1.6, 1.5, -4.0], [-1.7, 1.5, -4.2], [-0.2, 1.3, -6.3], [-0.2, 1.33, -6.3], 40, 0.03));
  shot(E("signs"), 13, mv([-0.45, 1.35, -4.5], [-0.47, 1.33, -4.6], [FRIEND_AT[0], 1.15, FRIEND_AT[2]], [FRIEND_AT[0], 1.15, FRIEND_AT[2]], 38, -0.02));
  // next Monday
  opening(2);
  shot(E("and", 6), 10, mv([0.4, 1.45, -3.0], [0.35, 1.45, -3.1], [-2.0, 1.25, -4.1], [-2.0, 1.25, -4.1], 44, 0.03));
  shot(E("extinguisher", 2), 12, mv([-0.3, 1.4, -2.5], [-0.35, 1.4, -2.6], [-2.0, 1.2, -4.1], [-2.0, 1.22, -4.1], 44, -0.02));
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

// ---------------- story state ----------------
type Phase = "walk1" | "yesterday" | "known" | "phone" | "hat" | "wednesday" | "friend" | "walk2";
const phaseAt = (t: number): Phase => {
  if (t < T("yesterday")) return "walk1";
  if (t < T("overnight")) return "yesterday";
  if (t < T("rule", 2)) return "known";
  if (t < T("rule", 3)) return "phone";
  if (t < T("wednesday")) return "hat";
  if (t < T("and", 4)) return "wednesday";
  if (t < T("next", 2)) return "friend";
  return "walk2";
};
type Held = null | "phone" | "napkin";
function heroAt(t: number): { p: V3; o: Outfit; fo: FrontOpts; held: Held } {
  const ph = phaseAt(t);
  if (ph === "walk1" || ph === "yesterday" || ph === "walk2") {
    const t0 = ph === "walk1" ? 0 : ph === "yesterday" ? T("yesterday") : T("next", 2);
    const k = (t - t0 - 0.3) / 2.6, walking = k < 1;
    const waveExt = ph === "walk2" && t >= T("still") - 0.1;
    const p: V3 = waveExt ? [-1.5, 0, -4.1] : HERO_IN(k);
    let expr: Expr = ph === "yesterday" ? "neutral" : walking ? "smile" : "grin";
    if (ph === "walk1" && t >= T("turns") && t < T("for")) expr = "shock";
    return { p, o: ph === "walk2" ? CROOKED : HERO, fo: walking && !waveExt ? { mode: "stroll", phase: t * 1.1, expr } : { mode: "stand", expr: waveExt ? "grin" : expr, wave: waveExt || (ph === "walk2" && t >= T("whole", 3)) ? 0.5 + 0.5 * Math.sin(t * 8) : undefined, facing: waveExt ? -1 : 0 }, held: null };
  }
  if (ph === "known") {
    if (t < T("you", 6)) return { p: HERO_IN(1), o: HERO, fo: { mode: "stand", expr: "grin" }, held: null };
    if (t < T("and", 3)) return { p: HERO_IN(1), o: HERO, fo: { mode: "stand", expr: "laugh", wave: 0.5 + 0.5 * Math.sin(t * 9) }, held: null };
    return { p: [-1.5, 0, -4.1], o: HERO, fo: { mode: "stand", expr: "grin", wave: 0.5 + 0.5 * Math.sin(t * 9), facing: -1, look: -0.6 }, held: null };
  }
  if (ph === "phone") {
    const expr: Expr = t >= T("your", 3) ? "dazed" : t >= T("four", 1) ? "shock" : "grin";
    return { p: [0.6, 0, -3.2], o: HERO, fo: { mode: "stand", expr, prop: "hold2" }, held: "phone" };
  }
  if (ph === "hat") return { p: [0.6, 0, -3.2], o: CROOKED, fo: { mode: "stand", expr: "smile", look: 0.3 }, held: null };
  if (ph === "wednesday") return { p: [0.3, 0, -1.6], o: CROOKED, fo: { mode: "stand", expr: t >= T("even") ? "shock" : "grin" }, held: null };
  return { p: HERO_BY_FRIEND, o: CROOKED, fo: { mode: "stand", expr: t >= T("famous") ? "laugh" : "grin", facing: -1, look: -0.5 }, held: null };
}
/** how phone notifications climb */
const phoneCount = (t: number) => Math.min(400, Math.max(12, Math.round(12 + (t - T("rule", 2)) * 70)));

// ---------------- painted walls ----------------
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
const wallTex = () => ctex("schoolWall", 512, 512, (g, r) => {
  g.fillStyle = "#efe6cf"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#cdb98a"; g.fillRect(0, 420, 512, 92);
  for (let i = 0; i < 80; i++) { g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(r() * 512, r() * 420, 8, 2); }
});
const floorTex = () => ctex("schoolFloor", 512, 512, (g) => {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? "#e6e2d8" : "#c8c2b4"; g.fillRect(x * 64, y * 64, 64, 64); }
});
const boardTex = () => ctex("corkBoard", 512, 320, (g, r) => {
  g.fillStyle = "#c89a5a"; g.fillRect(0, 0, 512, 320);
  for (let i = 0; i < 400; i++) { g.fillStyle = "rgba(120,80,30,0.2)"; g.fillRect(r() * 512, r() * 320, 3, 3); }
  const cols = ["#f4f1ea", "#f4d26a", "#8ac6e8", "#f2a0b8", "#a8d890"];
  for (let i = 0; i < 7; i++) { const x = 20 + (i % 4) * 122 + r() * 10, y = 20 + Math.floor(i / 4) * 150 + r() * 10; g.fillStyle = cols[i % 5]; g.fillRect(x, y, 100, 120); g.fillStyle = "#d8302a"; g.beginPath(); g.arc(x + 50, y + 8, 6, 0, 7); g.fill(); g.fillStyle = "rgba(40,40,60,0.5)"; for (let k = 0; k < 5; k++) g.fillRect(x + 12, y + 30 + k * 16, 70 - k * 6, 5); }
  g.strokeStyle = "#7a5a34"; g.lineWidth = 16; g.strokeRect(0, 0, 512, 320);
});
const windowTex = () => ctex("schoolWindow", 512, 400, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, "#9cc8f0"); gr.addColorStop(1, "#e4f0fa"); g.fillStyle = gr; g.fillRect(0, 0, 512, 400);
  g.fillStyle = "#6aa84a"; g.fillRect(0, 300, 512, 100);
  g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(140, 90, 70, 26, 0, 0, 7); g.ellipse(200, 80, 50, 30, 0, 0, 7); g.fill();
  g.fillStyle = "#e8e6e0"; for (const x of [0, 168, 336, 496]) g.fillRect(x, 0, 16, 400); g.fillRect(0, 0, 512, 14); g.fillRect(0, 386, 512, 14); g.fillRect(0, 196, 512, 12);
});

// ---------------- the world ----------------
export class PopularWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#fff8ec", "#b8a890", 1.1);
  private sun = new THREE.DirectionalLight("#fff6e8", 2.6);
  private skyMat = new THREE.MeshBasicMaterial({ color: "#e8e6e0" });
  private fog = new THREE.Fog("#e8e6e0", 30, 120);
  private phone = phone();
  private napkins = [napkin(), napkin(), napkin()];

  constructor() {
    const R = this.root, b = new Batch();
    R.add(this.hemi, this.sun, this.sun.target); this.sun.castShadow = false;
    const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 16, 8), this.skyMat); (sky.material as THREE.MeshBasicMaterial).side = THREE.BackSide; sky.layers.set(NOINK); R.add(sky);
    b.add(boxGeo(V(-HW, -0.2, Z0), V(HW, 0, Z1)), lam("schoolFloorM", () => ({ map: rep(floorTex(), 3, 22) })));
    b.add(boxGeo(V(-HW, H, Z0), V(HW, H + 0.2, Z1)), lam("ceilM", () => ({ color: "#f4f1ea" })));
    const wall = lam("schoolWallM", () => ({ map: rep(wallTex(), 6, 1) }));
    for (const s of [-1, 1]) b.add(boxGeo(V(s < 0 ? -HW - 0.2 : HW, 0, Z0), V(s < 0 ? -HW : HW + 0.2, H, Z1)), wall);
    b.add(boxGeo(V(-HW, 0, Z0 - 0.2), V(HW, H, Z0)), wall);
    // windows at the far end, glass doors at the entrance
    const win = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.2), new THREE.MeshBasicMaterial({ map: windowTex(), color: new THREE.Color(1.15, 1.15, 1.15) }));
    win.position.set(0, 1.7, Z0 + 0.02); R.add(win);
    b.add(boxGeo(V(-HW, 0, Z1), V(HW, H, Z1 + 0.2)), wall);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: windowTex(), color: new THREE.Color(1.1, 1.1, 1.1) }));
    door.position.set(0, 1.2, Z1 - 0.02); door.rotation.y = Math.PI; R.add(door);
    b.add(boxGeo(V(-1.25, 0, Z1 - 0.06), V(-1.2, 2.45, Z1)), lam("doorFrame", () => ({ color: "#6a7080" }))); b.add(boxGeo(V(1.2, 0, Z1 - 0.06), V(1.25, 2.45, Z1)), lam("doorFrame", () => ({ color: "#6a7080" })));
    b.add(boxGeo(V(-0.02, 0, Z1 - 0.06), V(0.02, 2.4, Z1)), lam("doorFrame", () => ({ color: "#6a7080" }))); b.add(boxGeo(V(-1.25, 2.4, Z1 - 0.06), V(1.25, 2.48, Z1)), lam("doorFrame", () => ({ color: "#6a7080" })));
    // lockers along both walls (gaps: the extinguisher, classroom doors, a cork board)
    const lockM = lam("lockerM", () => ({ map: lockerTex() })), lockTop = lam("lockerTop", () => ({ color: "#2e4a7a" }));
    const gaps: Record<string, [number, number][]> = { "-1": [[-4.8, -3.2], [-9.4, -8.0], [-19.4, -18.0]], "1": [[-13.4, -12.0], [-23.4, -22.0], [-6.2, -4.6]] };
    for (const s of [-1, 1]) {
      for (let z = Z1 - 1.5; z > Z0 + 1; z -= 1.6) {
        if (gaps[String(s)].some(([a, c]) => z - 1.6 < c && z > a)) continue;
        const x0 = s < 0 ? -HW : HW - 0.42, x1 = s < 0 ? -HW + 0.42 : HW;
        b.add(boxGeo(V(x0, 0.1, z - 1.6), V(x1, 1.95, z)), lockM);
        b.add(boxGeo(V(x0, 1.95, z - 1.6), V(x1, 2.0, z)), lockTop);
      }
      // classroom doors and a cork board in the gaps
      for (const [a, c] of gaps[String(s)]) {
        const zc = (a + c) / 2, xw = s * (HW - 0.01);
        if (s > 0 && zc > -7) { const bd = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), lam("corkM", () => ({ map: boardTex() }))); bd.position.set(xw - 0.01, 1.5, zc); bd.rotation.y = -Math.PI / 2; R.add(bd); continue; }
        if (s < 0 && zc > -5) continue; // the extinguisher sits here
        b.add(boxGeo(V(s < 0 ? -HW : HW - 0.05, 0, zc - 0.5), V(s < 0 ? -HW + 0.05 : HW, 2.2, zc + 0.5)), lam("classDoor", () => ({ color: "#a8724a" })));
        b.add(boxGeo(V(s < 0 ? -HW + 0.05 : HW - 0.07, 1.3, zc - 0.25), V(s < 0 ? -HW + 0.07 : HW - 0.05, 1.9, zc + 0.25)), lam("doorGlass", () => ({ color: "#bcd8ec" })));
      }
    }
    // ceiling light panels (glowing)
    for (let z = Z1 - 2; z > Z0; z -= 3.2) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.75, 1.6) })); l.position.set(0, H - 0.02, z); R.add(l); }
    b.build(R);
    const ext = extinguisher(); ext.position.set(...EXT); R.add(ext);
    R.add(this.phone); this.phone.visible = false;
    for (const n of this.napkins) { n.visible = false; R.add(n); }
    void rng;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const i = shotIdx(f), t = f / FPS, { L, K } = SCHOOL;
    const c = camAt(i, f), pos = V(...c.pos), look = V(...c.look);
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = THREE.MathUtils.clamp(pos.distanceTo(look) * 0.1, 0.05, 0.3); cam.far = 600; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const fwd = V(0, 0, 0); cam.getWorldDirection(fwd);
    const sunDir = V(-fwd.x * 0.5 + 0.3, 0.8, -fwd.z * 0.5).normalize();
    this.hemi.intensity = L.hemiI; this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    this.sun.position.copy(look).addScaledVector(sunDir, 50); this.sun.target.position.copy(look);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    untone(L.fog, this.fog.color); scene.fog = this.fog; scene.background = null;
    drawPhone(phaseAt(t) === "phone" ? phoneCount(t) : 12);

    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const L2D = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const lid = (seed: number) => { const q = (f + seed * 37) % 64; return q < 4 ? [0.5, 1, 1, 0.5][q] : 0; };
    let ai = 0, fi = 0;
    const used: Actor[] = [], fused: Fx[] = [];
    const ground = (p: V3, w = 0.55) => {
      const ef = this.fx(fi++);
      ef.r = this.pool.req("blob|contact|#6a6478", 128, 128, 1, (pp) => fxContact(pp, "#6a6478")); ef.use(false);
      ef.mesh.visible = true; ef.mesh.position.set(p[0], p[1] + 0.02, p[2]); ef.mesh.rotation.set(-Math.PI / 2, 0, 0); ef.mesh.scale.set(w, w * 0.7, 1);
      fused.push(ef);
    };
    const handY = (o: Outfit) => { const B = o.build === "stout" ? [1.15, 1.32] : [1.1, 1.4], HH = 2 * 118 * 0.94; const chin = 975 - B[1] * HH - B[0] * HH; return (975 - (chin + HOLD_DY * HH)) * SU; };
    const person = (key: string, p: V3, o: Outfit, fo: FrontOpts, seed: number, held?: THREE.Object3D | null) => {
      const w = V(...p), d = cam.position.distanceTo(w);
      if (d > 60) return;
      const [cw, ch, kk] = d < 3.2 ? [1800, 3000, 3.0] : d < 7 ? [1080, 1800, 1.8] : d < 18 ? [480, 800, 0.8] : [240, 400, 0.4];
      const f2: FrontOpts = { ...fo, light: L2D, seed };
      if (f2.blink === undefined) f2.blink = lid(seed);
      const a = this.actor(ai++);
      a.r = this.pool.req(`${key}|${JSON.stringify(o)}|${JSON.stringify(f2, (_k, v) => (typeof v === "number" ? Math.round(v * 60) / 60 : v))}`, cw, ch, kk, (pen) => bodyFront(pen, o, f2));
      const yaw = Math.atan2(cam.position.x - w.x, cam.position.z - w.z);
      a.mesh.visible = true; a.mesh.position.copy(w); a.mesh.rotation.set(0, yaw, 0); a.mesh.scale.set(1, 1, 1); a.mesh.castShadow = false;
      used.push(a); ground(p);
      if (held) {
        const n = V(Math.sin(yaw), 0, Math.cos(yaw));
        held.visible = true; held.position.copy(w).add(V(0, handY(o), 0)).addScaledVector(n, 0.07); held.rotation.set(-0.25, yaw, 0, "YXZ");
      }
    };
    this.phone.visible = false; for (const n of this.napkins) n.visible = false;
    const h = heroAt(t), ph = phaseAt(t);
    person("hero", h.p, h.o, h.fo, 4, h.held === "phone" ? this.phone : null);
    // the crowd: chatting in pairs, then all eyes on you; waving; crooked hats on Wednesday; gathered round the friend
    const noticed = (ph === "walk1" && t >= T("turns") - 0.15) || ph === "known" || ph === "phone" || ph === "hat" || ph === "wednesday" || (ph === "walk2" && t >= T("turns", 2) - 0.15) || ph === "friend";
    const hatDay = ph === "wednesday" || ph === "friend" || ph === "walk2";
    CROWD.forEach((cr, k) => {
      let o: Outfit = STUDENTS[cr.o];
      if (hatDay) o = { ...o, hat: "beanie", cap: "#2c3552", hatTilt: 14 };
      let p = cr.p, fo: FrontOpts;
      if (ph === "friend" && k < 6) p = [FRIEND_AT[0] + [-0.9, 0.0, 0.9, -0.5, 0.5, 1.3][k], 0, FRIEND_AT[2] - 1.3 - (k % 3) * 0.5];
      if (!noticed) fo = { mode: "stand", expr: k % 3 ? "smile" : "laugh", facing: cr.side, look: cr.side * 0.8 };
      else {
        const waving = ph === "known" || ph === "walk2" || ph === "friend";
        fo = { mode: "stand", expr: ph === "walk1" || (ph === "walk2" && t < T("whole", 3) + 0.4) ? (k % 2 ? "shock" : "grin") : k % 2 ? "laugh" : "grin", wave: waving ? 0.5 + 0.5 * Math.sin(t * (8 + k) + k) : undefined };
      }
      if (ph === "phone" || ph === "hat") { if (Math.abs(p[2] + 3.2) < 1.5 && Math.abs(p[0] - 0.6) < 1.2) return; }
      if (Math.hypot(cam.position.x - p[0], cam.position.z - p[2]) < 1.4) return; // nobody right in front of the lens
      person("s" + k, p, o, fo, 10 + k);
    });
    if (ph === "wednesday") person("principal", PRINCIPAL_AT, PRINCIPAL, { mode: "stand", expr: t >= T("even") ? "smile" : "stern", look: 0.3 }, 40);
    if (ph === "friend") {
      person("friend", FRIEND_AT, { ...FRIEND, hat: "beanie", cap: "#2c3552", hatTilt: 14 }, { mode: "stand", expr: t >= T("famous") ? "laugh" : "grin", prop: t >= T("signs") - 0.3 ? "hold2" : undefined, wave: t < T("signs") - 0.3 ? 0.5 + 0.5 * Math.sin(t * 6) : undefined }, 30, t >= T("signs") - 0.3 ? this.napkins[0] : null);
    }
    for (let q = ai; q < this.actors.length; q++) this.actors[q].mesh.visible = false;
    for (let q = fi; q < this.fxs.length; q++) this.fxs[q].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const ef of fused) ef.bind();
    return look;
  }
}
