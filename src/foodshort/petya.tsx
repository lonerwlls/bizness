// Петя — герой шортсов про еду (с части 2). Обычный парень: короткая стрижка, тёмно-серая толстовка с капюшоном,
// синие джинсы, серые кроссовки. Рисуется в стиле самих сцен: плоские цвета, тонкий тёмный контур, одна сторона в тени,
// нормальные пропорции (голова ≈ 1/7 роста). (x, y) — точка на полу между ступнями, s — масштаб. Рост при s=1 ≈ 600.
import React from "react";
import { ik, P } from "../brand/corridor/rig";

export type PExpr = { eyes?: "open" | "wide" | "closed" | "squint"; brows?: number; mouth?: "flat" | "o" | "tight" | "open" | "smile"; look?: P; blink?: number };
export type PPose = {
  footL: P; footR: P; hip: P; handL: P; handR: P;
  turn?: number;   // -1…1: куда смотрит (лицо и тело поворачиваются)
  tilt?: number;   // наклон головы, градусы
  lean?: number;   // наклон корпуса, градусы
  dir?: number;    // при ходьбе ±1 (дальняя нога/рука темнее)
  knee?: "front" | "up" | "back"; // куда сгибаются колени (стоит / сидит / на коленях)
  expr?: PExpr;
  light?: number;  // -1…1: с какой стороны свет (другая сторона в тени)
  hood?: boolean;  // капюшон на голове
};

const INK = "#0b0f22";
export const BOY = { hair: "#8a6440", hairSh: "#5e4228", top: "#3e5a48", topSh: "#2c4234", pants: "#3a3a46", pantsSh: "#2a2a34", shoe: "#4a3a30" };
export const PETYA = {
  skin: "#e3b496", skinSh: "#b98670", hair: "#3b2a20", hairSh: "#271b14",
  top: "#434a5a", topSh: "#30364a", pants: "#2d3c5c", pantsSh: "#212c46", shoe: "#5a5f6a", sole: "#d8d8d4", string: "#cfd2d8",
};
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const rot = (p: P, deg: number): P => { const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const lerpP = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** конечность с толщиной от w0 к w1 (плоский контур) */
const Limb: React.FC<{ a: P; m: P; b: P; w0: number; w1: number; c: string }> = ({ a, m, b, w0, w1, c }) => {
  const seg = (p: P, q: P, wa: number, wb: number) => {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    return `M ${p[0] + nx * wa / 2} ${p[1] + ny * wa / 2} L ${q[0] + nx * wb / 2} ${q[1] + ny * wb / 2} L ${q[0] - nx * wb / 2} ${q[1] - ny * wb / 2} L ${p[0] - nx * wa / 2} ${p[1] - ny * wa / 2} Z`;
  };
  const wm = (w0 + w1) / 2;
  return <g fill={c} stroke={INK} strokeWidth={3} strokeLinejoin="round">
    <path d={seg(a, m, w0, wm)} /><path d={seg(m, b, wm, w1)} />
    <circle cx={m[0]} cy={m[1]} r={wm / 2} stroke="none" />
  </g>;
};

export type PLook = Partial<typeof PETYA>;
/** look — другие цвета (так из рига Пети делаются другие люди, например мальчик) */
export const Petya: React.FC<{ x: number; y: number; s: number; pose: PPose; flip?: boolean; look?: PLook }> = ({ x, y, s, pose, flip, look }) => {
  const C = look ? { ...PETYA, ...look } : PETYA;
  const lean = pose.lean ?? 0, turn = pose.turn ?? 0, dir = pose.dir ?? 0, light = pose.light ?? 1;
  const kneePref: P = pose.knee === "up" ? [0.4, -1] : pose.knee === "back" ? [1, 0.3] : dir ? [dir, -0.15] : [0.1, -1];
  const hip = pose.hip;
  const hipL = add(hip, rot([-22, 0], lean)), hipR = add(hip, rot([22, 0], lean));
  const legL = ik(hipL, pose.footL, 142, 136, pose.knee ? [kneePref[0] * (pose.knee === "up" ? 1 : 1), kneePref[1]] : dir ? kneePref : [-0.2, -1]);
  const legR = ik(hipR, pose.footR, 142, 136, pose.knee ? kneePref : dir ? kneePref : [0.2, -1]);
  const sw = 54 * (1 - 0.25 * Math.abs(turn)); // полуширина плеч (в повороте уже)
  const shL = add(hip, rot([-sw, -190], lean)), shR = add(hip, rot([sw, -190], lean));
  const armL = ik(shL, pose.handL, 108, 100, [-0.35, 0.4]), armR = ik(shR, pose.handR, 108, 100, [0.35, 0.4]);
  const neck = add(hip, rot([turn * 6, -204], lean));
  const head = add(neck, rot([turn * 4, -52], lean + (pose.tilt ?? 0) * 0.3));
  const e = pose.expr ?? {};
  const farL = dir > 0 || (!dir && turn > 0.4), farR = dir < 0 || (!dir && turn < -0.4);

  const shoe = (f: P, far: boolean, side: number) => {
    const d = dir || side * 0.3 + turn * 0.5;
    return <g>
      <path d={`M ${f[0] - 24 + d * 6} ${f[1] - 4} Q ${f[0] - 26 + d * 6} ${f[1] - 24} ${f[0] - 4 + d * 8} ${f[1] - 26} L ${f[0] + 10 + d * 14} ${f[1] - 20} Q ${f[0] + 30 + d * 18} ${f[1] - 14} ${f[0] + 30 + d * 16} ${f[1] - 4} Z`} fill={far ? "#474b55" : C.shoe} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d={`M ${f[0] - 26 + d * 6} ${f[1] - 4} L ${f[0] + 32 + d * 16} ${f[1] - 4} L ${f[0] + 30 + d * 16} ${f[1] + 2} L ${f[0] - 25 + d * 6} ${f[1] + 2} Z`} fill={C.sole} stroke={INK} strokeWidth={2.5} />
    </g>;
  };
  const leg = (hp: P, L: { mid: P; end: P }, far: boolean, side: number, k: string) =>
    <g key={k}><Limb a={hp} m={L.mid} b={add(L.end, [0, -10])} w0={46} w1={30} c={far ? C.pantsSh : C.pants} />{shoe(L.end, far, side)}</g>;
  const hand = (p: P, far: boolean) => <ellipse cx={p[0]} cy={p[1]} rx={13} ry={15} fill={far ? C.skinSh : C.skin} stroke={INK} strokeWidth={3} />;
  const arm = (sh: P, A: { mid: P; end: P }, far: boolean, k: string) =>
    <g key={k}><Limb a={sh} m={A.mid} b={A.end} w0={32} w1={24} c={far ? C.topSh : C.top} /><circle cx={sh[0]} cy={sh[1] + 6} r={16} fill={far ? C.topSh : C.top} />
      <path d={`M ${A.end[0]} ${A.end[1]}`} />{hand(A.end, far)}</g>;

  // корпус-толстовка
  const bL = add(hip, rot([-48, 18], lean)), bR = add(hip, rot([48, 18], lean));
  const torso = `M ${shL[0] - 14} ${shL[1] + 16} Q ${shL[0] - 10} ${shL[1] - 4} ${shL[0] + 10} ${shL[1] - 6} Q ${(shL[0] + shR[0]) / 2} ${shL[1] - 12} ${shR[0] - 10} ${shR[1] - 6} Q ${shR[0] + 10} ${shR[1] - 4} ${shR[0] + 14} ${shR[1] + 16} L ${bR[0] + 4} ${bR[1]} Q ${(bL[0] + bR[0]) / 2} ${bR[1] + 8} ${bL[0] - 4} ${bL[1]} Z`;
  const shadeSide = light >= 0 ? -1 : 1; // тень на стороне, противоположной свету
  const sh0 = shadeSide < 0 ? shL : shR, b0 = shadeSide < 0 ? bL : bR;
  const torsoShade = `M ${sh0[0] - shadeSide * 6} ${sh0[1] + 6} L ${sh0[0] - shadeSide * 30} ${sh0[1] + 10} L ${b0[0] - shadeSide * 26} ${b0[1] - 4} L ${b0[0]} ${b0[1]} Z`;

  const fx = turn * 22; // смещение черт лица при повороте
  const blink = e.blink ?? 0;
  const eyeY = -4, eyeSp = 15 * (1 - 0.3 * Math.abs(turn));
  const eye = (k: number) => {
    const ex = fx + k * eyeSp, lk = e.look ?? [turn, 0];
    if (e.eyes === "closed" || blink > 0.5) return <path key={k} d={`M ${ex - 6} ${eyeY} Q ${ex} ${eyeY + 3} ${ex + 6} ${eyeY}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    if (e.eyes === "wide") return <g key={k}><ellipse cx={ex} cy={eyeY} rx={7} ry={8} fill="#f2efe8" stroke={INK} strokeWidth={2.5} /><circle cx={ex + lk[0] * 2.5} cy={eyeY + lk[1] * 2.5} r={3.4} fill={INK} /></g>;
    const ry = e.eyes === "squint" ? 2.2 : 4.6;
    return <ellipse key={k} cx={ex + lk[0] * 1.8} cy={eyeY + lk[1] * 1.8} rx={3.6} ry={ry} fill={INK} />;
  };
  const browY = eyeY - 13 - (e.brows ?? 0) * 4;
  const mouth = (() => {
    const mx = fx * 1.05, my = 30;
    switch (e.mouth ?? "flat") {
      case "o": return <ellipse cx={mx} cy={my} rx={5} ry={6.5} fill="#5a2a24" stroke={INK} strokeWidth={2.5} />;
      case "open": return <path d={`M ${mx - 9} ${my - 2} Q ${mx} ${my + 12} ${mx + 9} ${my - 2} Z`} fill="#5a2a24" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />;
      case "tight": return <path d={`M ${mx - 8} ${my + 1} Q ${mx} ${my - 2} ${mx + 8} ${my + 1}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
      case "smile": return <path d={`M ${mx - 8} ${my - 1} Q ${mx} ${my + 5} ${mx + 8} ${my - 1}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
      default: return <path d={`M ${mx - 7} ${my} L ${mx + 7} ${my}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />;
    }
  })();

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={(legL.end[0] + legR.end[0]) / 2} cy={2} rx={70} ry={10} fill="rgba(0,0,0,0.35)" />
      {farL ? arm(shL, armL, true, "aL") : null}{farR ? arm(shR, armR, true, "aR") : null}
      {farR ? [leg(hipR, legR, true, 1, "lR"), leg(hipL, legL, false, -1, "lL")] : [leg(hipL, legL, farL, -1, "lL"), leg(hipR, legR, false, 1, "lR")]}
      {/* капюшон за шеей */}
      {!pose.hood ? <path d={`M ${neck[0] - 40} ${neck[1] + 22} Q ${neck[0]} ${neck[1] - 6} ${neck[0] + 40} ${neck[1] + 22} Q ${neck[0]} ${neck[1] + 40} ${neck[0] - 40} ${neck[1] + 22} Z`} fill={C.topSh} stroke={INK} strokeWidth={3} /> : null}
      <path d={torso} fill={C.top} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d={torsoShade} fill={C.topSh} opacity={0.85} />
      {/* карман-кенгуру, молния, шнурки */}
      <path d={`M ${hip[0] - 34 + turn * 10} ${hip[1] - 70} L ${hip[0] + 34 + turn * 10} ${hip[1] - 70} L ${hip[0] + 42 + turn * 10} ${hip[1] - 6} L ${hip[0] - 42 + turn * 10} ${hip[1] - 6} Z`} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.55} />
      <path d={`M ${neck[0] + turn * 8} ${neck[1] + 14} L ${hip[0] + turn * 10} ${hip[1] + 18}`} stroke={INK} strokeWidth={2.5} opacity={0.5} />
      {[-1, 1].map((k) => <path key={k} d={`M ${neck[0] + k * 9 + turn * 8} ${neck[1] + 16} l ${k * 2} 34`} stroke={C.string} strokeWidth={3} strokeLinecap="round" />)}
      <rect x={hip[0] - 46} y={hip[1] + 4} width={92} height={16} rx={6} fill={C.topSh} stroke={INK} strokeWidth={2.5} transform={`rotate(${lean} ${hip[0]} ${hip[1]})`} />
      {/* шея и голова */}
      <path d={`M ${neck[0] - 11} ${neck[1] + 14} L ${neck[0] - 9} ${neck[1] - 16} L ${neck[0] + 9} ${neck[1] - 16} L ${neck[0] + 11} ${neck[1] + 14} Z`} fill={C.skinSh} stroke={INK} strokeWidth={3} />
      <g transform={`translate(${head[0]} ${head[1]}) rotate(${pose.tilt ?? 0})`}>
        {/* ухо на дальней стороне при повороте */}
        <ellipse cx={-turn * 34 + (turn >= 0 ? -1 : 1) * 4} cy={2} rx={7} ry={11} fill={C.skinSh} stroke={INK} strokeWidth={3} opacity={Math.abs(turn) > 0.15 ? 1 : 0} />
        {Math.abs(turn) <= 0.15 ? [-1, 1].map((k) => <ellipse key={k} cx={k * 33} cy={2} rx={6} ry={10} fill={C.skinSh} stroke={INK} strokeWidth={3} />) : null}
        <path d="M -31 -24 Q -33 -52 0 -54 Q 33 -52 31 -24 L 32 10 Q 30 40 0 46 Q -30 40 -32 10 Z" fill={C.skin} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M ${shadeSide * 31} -24 L ${shadeSide * 32} 10 Q ${shadeSide * 30} 40 ${shadeSide * 6} 46 Q ${shadeSide * 22} 20 ${shadeSide * 20} -20 Z`} fill={C.skinSh} opacity={0.55} />
        {/* короткая стрижка с чёлкой */}
        {pose.hood
          ? <path d="M -44 30 Q -50 -64 0 -68 Q 50 -64 44 30 L 36 30 Q 38 -40 0 -44 Q -38 -40 -36 30 Z" fill={C.topSh} stroke={INK} strokeWidth={3} />
          : <path d={`M -33 -10 Q -36 -60 0 -62 Q 36 -60 33 -10 Q 30 -30 ${14 + turn * 10} -36 Q ${4 + turn * 10} -28 ${-8 + turn * 10} -34 Q -24 -30 -33 -10 Z`} fill={C.hair} stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
        {[-1, 1].map((k) => <path key={"b" + k} d={`M ${fx + k * eyeSp - 7} ${browY + (k * (e.brows ?? 0) < 0 ? 1 : 0)} L ${fx + k * eyeSp + 7} ${browY - (e.brows ?? 0) * k * 1.5}`} stroke={C.hairSh} strokeWidth={3.5} strokeLinecap="round" />)}
        {[-1, 1].map(eye)}
        <path d={`M ${fx * 1.15 + 1} 4 L ${fx * 1.15 + 4 + turn * 3} 16 L ${fx * 1.15 - 2} 17`} stroke={C.skinSh} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {mouth}
      </g>
      {!farL ? arm(shL, armL, false, "aL") : null}{!farR ? arm(shR, armR, false, "aR") : null}
    </g>
  );
};

// ---------- готовые позы ----------
const breathe = (f: number) => Math.sin(f / 18) * 1.5;
export const blinkP = (f: number, seed = 0) => { const k = (f + seed * 37) % 96; return k < 4 ? 1 : 0; };
export const pStand = (f: number, o: Partial<PPose> = {}): PPose => ({
  footL: [-24, 0], footR: [24, 0], hip: [0, -272 + breathe(f)], handL: [-58, -262], handR: [58, -262], ...o,
  expr: { blink: blinkP(f), ...o.expr },
});
/** шаг: dist — пройденный путь, dir ±1 */
export const pWalk = (f: number, dist: number, dir: number, o: Partial<PPose> = {}): PPose => {
  const L = 230, S = L * 0.55, p = dist / L;
  const foot = (off: number): P => {
    const u = (((p + off) % 1) + 1) % 1;
    if (u < 0.6) return [dir * (S / 2 - (u / 0.6) * S), 0];
    const w = (u - 0.6) / 0.4, e = w * w * (3 - 2 * w);
    return [dir * (-S / 2 + e * S), -Math.sin(Math.PI * w) * 34];
  };
  const sw = Math.sin(2 * Math.PI * p), bob = 6 * (1 - Math.cos(4 * Math.PI * p)) / 2;
  return {
    footL: foot(0), footR: foot(0.5), hip: [0, -268 - bob], dir, lean: dir * 3, turn: dir * 0.9,
    handL: [-40 - dir * sw * 46, -262 - Math.abs(sw) * 10], handR: [40 + dir * sw * 46, -262 - Math.abs(sw) * 10], ...o,
    expr: { blink: blinkP(f, 2), ...o.expr },
  };
};
/** сидит на полу, спиной к стене/двери, колени вверх */
export const pSitFloor = (f: number, o: Partial<PPose> = {}): PPose => ({
  footL: [170, 0], footR: [205, 0], hip: [-30, -34 + breathe(f) * 0.6], knee: "up", handL: [80, -170], handR: [120, -176], lean: -6, ...o,
  expr: { blink: blinkP(f, 3), ...o.expr },
});
/** присел на корточки (что-то делает на полу), лицом вправо */
export const pSquat = (f: number, o: Partial<PPose> = {}): PPose => ({
  footL: [-20, 0], footR: [30, 0], hip: [-40, -120 + breathe(f) * 0.6], knee: "up", lean: 24, handL: [110, -40], handR: [150, -46], turn: 0.75, ...o,
  expr: { blink: blinkP(f, 4), ...o.expr },
});
export { lerpP };
