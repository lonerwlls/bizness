// Общие вещи сериала «What if the world's food supply collapsed?»: персонажи, позы, камера, перспектива, HUD.
import React from "react";
import { Easing, interpolate } from "remotion";
import { Expr, HERO, Look, OL, P, Pose, walk } from "../brand/corridor/rig";

export const W = 1920, H = 1080, FPS = 30;
export const ease = Easing.inOut(Easing.cubic);
export const ip = (f: number, a: number[], b: number[], e = ease) => interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const trackP = (f: number, keys: [number, P][]): P => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (f < keys[i][0]) {
    const [f0, a] = keys[i - 1], [f1, b] = keys[i], t = ease((f - f0) / (f1 - f0));
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  }
  return keys[keys.length - 1][1];
};
export const track = (f: number, keys: [number, number][]) => trackP(f, keys.map(([k, v]) => [k, [v, 0]] as [number, P]))[0];
export const talk = (f: number, seed = 0) => Math.max(0, Math.sin(f * 0.95 + seed) * 0.55 + Math.sin(f * 2.2 + seed * 3) * 0.45);
export const blinkAt = (f: number, seed: number) => { const per = 70 + seed * 13, k = (f + seed * 31) % per; return k < 4 ? [0.6, 1, 1, 0.6][k] : 0; };
export const poly = (pts: P[]) => pts.map((p) => p.join(",")).join(" ");

// ---------- люди ----------
export { HERO, OL };
export const PEOPLE: Record<string, Look> = {
  barista: { kind: "person", skin: "#efc27a", skinDark: "#c99a50", top: "#5b7a5a", topDark: "#45603f", pants: "#3a2e26", shoe: "#2a1e16", hair: "#3a2216", hairStyle: "bun", apron: "#c8a070" },
  woman: { kind: "person", skin: "#f3cf96", skinDark: "#cfa565", top: "#b8564a", topDark: "#8e3e34", pants: "#4a3a32", shoe: "#3a2a1e", hair: "#6a3a22", hairStyle: "long" },
  man: { kind: "person", skin: "#e6b26a", skinDark: "#bf8a40", top: "#4f6f8f", topDark: "#3a5470", pants: "#3a3a40", shoe: "#2a2a30", hair: "#2a1a10", hairStyle: "short" },
  oldman: { kind: "person", skin: "#efbd52", skinDark: "#c9952e", top: "#8a6a4a", topDark: "#6a4e34", pants: "#4f4436", shoe: "#3a2a1e", hair: "#d8d2c4", hairStyle: "short" },
  worker: { kind: "person", skin: "#e8b064", skinDark: "#c08840", top: "#e0a030", topDark: "#b47a1a", pants: "#3e4a5a", shoe: "#2a2a30", hairStyle: "cap", cap: "#3a6a9a" },
  sailor: { kind: "person", skin: "#eec08a", skinDark: "#c89a5a", top: "#2f4a6a", topDark: "#22364e", pants: "#2a2a30", shoe: "#1e1e24", hairStyle: "cap", cap: "#c84a3a" },
  operator: { kind: "person", skin: "#f0c690", skinDark: "#c89a60", top: "#5a5a6a", topDark: "#44444f", pants: "#2e2e36", shoe: "#1e1e24", hair: "#1e1410", hairStyle: "short" },
  girl: { kind: "person", skin: "#f6d6a4", skinDark: "#d4ac70", top: "#7a5aa0", topDark: "#5c4280", pants: "#3a3a48", shoe: "#2a2a30", hair: "#2a1a10", hairStyle: "bun" },
};

type StandOpts = { handL?: P; handR?: P; turn?: number; tilt?: number; nod?: number; lean?: number; expr?: Expr; seed?: number; hipY?: number; feet?: number };
/** стоит: дыхание, моргание */
export const stand = (f: number, o: StandOpts = {}): Pose => {
  const sd = o.seed ?? 0, fw = o.feet ?? 26;
  const expr: Expr = { mouth: "smile", eyes: "dot", ...o.expr };
  if (expr.blink === undefined && expr.eyes !== "happy") expr.blink = blinkAt(f, sd + 1);
  return {
    footL: [-fw, 0], footR: [fw, 0], hip: [0, (o.hipY ?? -228) + Math.sin((f + sd * 9) / 17) * 1.6],
    handL: o.handL ?? [-60, -172 + Math.sin((f + sd * 5) / 19) * 3], handR: o.handR ?? [60, -172 + Math.sin((f + sd * 7) / 21) * 3],
    turn: o.turn ?? 0, tilt: o.tilt ?? 0, nod: o.nod ?? 0, lean: o.lean ?? 0, expr,
  };
};
/** идёт: dist — путь в локальных единицах, dir ±1; hands: что держит (иначе машет руками) */
export const walking = (f: number, dist: number, dir: number, o: StandOpts & { carry?: boolean } = {}): Pose => {
  const w = walk(dist, dir), sw = w.swing;
  const expr: Expr = { mouth: "smile", eyes: "dot", ...o.expr };
  if (expr.blink === undefined) expr.blink = blinkAt(f, (o.seed ?? 0) + 2);
  return {
    footL: w.footL, footR: w.footR, hip: w.hip, dir, lean: dir * 4,
    handL: o.handL ?? [-50 - dir * sw * 46, -184 - Math.abs(sw) * 14], handR: o.handR ?? [50 + dir * sw * 46, -184 - Math.abs(sw) * 14],
    turn: o.turn ?? dir * 0.8, tilt: o.tilt ?? 0, nod: o.nod ?? 0, expr,
  };
};
/** сидит за столом (ноги скрыты столом) */
export const sitting = (f: number, o: StandOpts = {}): Pose => ({ ...stand(f, o), hip: [0, -150 + Math.sin(f / 17) * 1.5], footL: [-40, 0], footR: [40, 0] });

// ---------- камера и перспектива ----------
export type Cam = { s: number; cx: number; cy: number };
export const CamG: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <g transform={`translate(${W / 2} ${H / 2}) scale(${cam.s}) translate(${-cam.cx} ${-cam.cy})`}>{children}</g>
);
export const persp = (vp: P, foc: number, camH: number) => (X: number, Y: number, Z: number): P => [vp[0] + (X * foc) / Z, vp[1] + ((camH - Y) * foc) / Z];
/** размытие фона для крупных планов */
export const Blur: React.FC<{ r: number; children: React.ReactNode; id: string }> = ({ r, children, id }) => (
  r <= 0.05 ? <g>{children}</g> : <g><defs><filter id={id} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={r} /></filter></defs><g filter={`url(#${id})`}>{children}</g></g>
);

// ---------- счётчик времени ----------
export const Clock: React.FC<{ label: string; time?: string; o?: number }> = ({ label, o = 1 }) => (
  <g transform="translate(56 50)" opacity={o}>
    <rect width={200} height={78} rx={14} fill="rgba(40,24,12,0.72)" stroke="#e8c88a" strokeWidth={3} />
    <text x={100} y={52} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={36} fill="#f6e6c4" letterSpacing={3}>{label}</text>
  </g>
);
export const Vignette: React.FC = () => (
  <g><defs><radialGradient id="vigF" cx="50%" cy="50%" r="75%"><stop offset="60%" stopColor="rgba(60,30,10,0)" /><stop offset="100%" stopColor="rgba(50,25,8,0.5)" /></radialGradient></defs><rect width={W} height={H} fill="url(#vigF)" /></g>
);
